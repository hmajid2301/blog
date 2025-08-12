package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/IBM/sarama"
	"go.opentelemetry.io/contrib/instrumentation/github.com/IBM/sarama/otelsarama"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"

	"github.com/hmajid2301/user-service/internal/config"
)

type KafkaClient struct {
	producer sarama.SyncProducer
	consumer sarama.Consumer
	config   *config.Config
	tracer   trace.Tracer
}

type UserEvent struct {
	ID        int64     `json:"id"`
	Action    string    `json:"action"`
	UserID    int64     `json:"user_id"`
	Data      string    `json:"data"`
	Timestamp time.Time `json:"timestamp"`
}

func NewKafkaClient(cfg *config.Config) (*KafkaClient, error) {
	// Kafka configuration
	kafkaConfig := sarama.NewConfig()
	kafkaConfig.Producer.Return.Successes = true
	kafkaConfig.Producer.Return.Errors = true
	kafkaConfig.Consumer.Return.Errors = true
	kafkaConfig.Version = sarama.V2_8_0_0

	// Add OpenTelemetry instrumentation
	kafkaConfig = otelsarama.WrapConfig(kafkaConfig)

	// Create producer
	producer, err := sarama.NewSyncProducer(cfg.Kafka.Brokers, kafkaConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kafka producer: %w", err)
	}

	// Wrap producer with OpenTelemetry
	producer = otelsarama.WrapSyncProducer(kafkaConfig, producer)

	// Create consumer
	consumer, err := sarama.NewConsumer(cfg.Kafka.Brokers, kafkaConfig)
	if err != nil {
		producer.Close()
		return nil, fmt.Errorf("failed to create Kafka consumer: %w", err)
	}

	// Wrap consumer with OpenTelemetry
	consumer = otelsarama.WrapConsumer(kafkaConfig, consumer)

	return &KafkaClient{
		producer: producer,
		consumer: consumer,
		config:   cfg,
		tracer:   otel.Tracer("kafka-client"),
	}, nil
}

func (k *KafkaClient) ProduceUserEvent(ctx context.Context, event UserEvent) error {
	ctx, span := k.tracer.Start(ctx, "kafka.produce",
		trace.WithAttributes(
			attribute.String("kafka.topic", k.config.Kafka.Topic),
			attribute.String("kafka.operation", "produce"),
			attribute.String("event.action", event.Action),
			attribute.Int64("event.user_id", event.UserID),
		),
	)
	defer span.End()

	// Set timestamp if not provided
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Marshal event to JSON
	eventData, err := json.Marshal(event)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to marshal event")
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	// Create Kafka message
	message := &sarama.ProducerMessage{
		Topic: k.config.Kafka.Topic,
		Key:   sarama.StringEncoder(fmt.Sprintf("user-%d", event.UserID)),
		Value: sarama.ByteEncoder(eventData),
		Headers: []sarama.RecordHeader{
			{
				Key:   []byte("event-type"),
				Value: []byte(event.Action),
			},
			{
				Key:   []byte("user-id"),
				Value: []byte(fmt.Sprintf("%d", event.UserID)),
			},
		},
	}

	// Produce message
	partition, offset, err := k.producer.SendMessage(message)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to produce message")
		slog.ErrorContext(ctx, "Failed to produce Kafka message",
			slog.String("topic", k.config.Kafka.Topic),
			slog.String("action", event.Action),
			slog.Int64("user_id", event.UserID),
			slog.String("error", err.Error()),
		)
		return fmt.Errorf("failed to produce message: %w", err)
	}

	span.SetAttributes(
		attribute.Int32("kafka.partition", partition),
		attribute.Int64("kafka.offset", offset),
		attribute.Int("kafka.message_size", len(eventData)),
	)

	slog.InfoContext(ctx, "Kafka message produced successfully",
		slog.String("topic", k.config.Kafka.Topic),
		slog.String("action", event.Action),
		slog.Int64("user_id", event.UserID),
		slog.Int32("partition", partition),
		slog.Int64("offset", offset),
	)

	return nil
}

func (k *KafkaClient) ConsumeUserEvents(ctx context.Context, handler func(context.Context, UserEvent) error) error {
	ctx, span := k.tracer.Start(ctx, "kafka.consume",
		trace.WithAttributes(
			attribute.String("kafka.topic", k.config.Kafka.Topic),
			attribute.String("kafka.operation", "consume"),
		),
	)
	defer span.End()

	// Get all partitions for the topic
	partitions, err := k.consumer.Partitions(k.config.Kafka.Topic)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to get partitions")
		return fmt.Errorf("failed to get partitions: %w", err)
	}

	span.SetAttributes(attribute.Int("kafka.partitions_count", len(partitions)))

	// Start consuming from all partitions
	for _, partition := range partitions {
		go func(partition int32) {
			partitionConsumer, err := k.consumer.ConsumePartition(k.config.Kafka.Topic, partition, sarama.OffsetNewest)
			if err != nil {
				slog.ErrorContext(ctx, "Failed to start partition consumer",
					slog.Int32("partition", partition),
					slog.String("error", err.Error()),
				)
				return
			}
			defer partitionConsumer.Close()

			slog.InfoContext(ctx, "Started consuming from partition",
				slog.String("topic", k.config.Kafka.Topic),
				slog.Int32("partition", partition),
			)

			for {
				select {
				case message := <-partitionConsumer.Messages():
					if message == nil {
						continue
					}

					// Create span for message processing
					msgCtx, msgSpan := k.tracer.Start(ctx, "kafka.message.process",
						trace.WithAttributes(
							attribute.String("kafka.topic", message.Topic),
							attribute.Int32("kafka.partition", message.Partition),
							attribute.Int64("kafka.offset", message.Offset),
							attribute.String("kafka.key", string(message.Key)),
						),
					)

					// Parse the event
					var event UserEvent
					if err := json.Unmarshal(message.Value, &event); err != nil {
						msgSpan.RecordError(err)
						msgSpan.SetStatus(codes.Error, "failed to unmarshal event")
						slog.ErrorContext(msgCtx, "Failed to unmarshal Kafka message",
							slog.String("error", err.Error()),
							slog.String("message", string(message.Value)),
						)
						msgSpan.End()
						continue
					}

					msgSpan.SetAttributes(
						attribute.String("event.action", event.Action),
						attribute.Int64("event.user_id", event.UserID),
					)

					// Process the event
					if err := handler(msgCtx, event); err != nil {
						msgSpan.RecordError(err)
						msgSpan.SetStatus(codes.Error, "handler failed")
						slog.ErrorContext(msgCtx, "Event handler failed",
							slog.String("action", event.Action),
							slog.Int64("user_id", event.UserID),
							slog.String("error", err.Error()),
						)
					} else {
						slog.InfoContext(msgCtx, "Event processed successfully",
							slog.String("action", event.Action),
							slog.Int64("user_id", event.UserID),
							slog.Int32("partition", message.Partition),
							slog.Int64("offset", message.Offset),
						)
					}

					msgSpan.End()

				case err := <-partitionConsumer.Errors():
					if err != nil {
						slog.ErrorContext(ctx, "Kafka consumer error",
							slog.String("topic", err.Topic),
							slog.Int32("partition", err.Partition),
							slog.String("error", err.Error()),
						)
					}

				case <-ctx.Done():
					slog.InfoContext(ctx, "Stopping partition consumer",
						slog.Int32("partition", partition),
					)
					return
				}
			}
		}(partition)
	}

	// Wait for context cancellation
	<-ctx.Done()
	return ctx.Err()
}

func (k *KafkaClient) Close() error {
	var errs []error

	if err := k.producer.Close(); err != nil {
		errs = append(errs, fmt.Errorf("failed to close producer: %w", err))
	}

	if err := k.consumer.Close(); err != nil {
		errs = append(errs, fmt.Errorf("failed to close consumer: %w", err))
	}

	if len(errs) > 0 {
		return fmt.Errorf("errors closing Kafka client: %v", errs)
	}

	return nil
}

// Helper methods for common user events
func (k *KafkaClient) ProduceUserCreated(ctx context.Context, userID int64, userData string) error {
	event := UserEvent{
		Action: "user.created",
		UserID: userID,
		Data:   userData,
	}
	return k.ProduceUserEvent(ctx, event)
}

func (k *KafkaClient) ProduceUserUpdated(ctx context.Context, userID int64, userData string) error {
	event := UserEvent{
		Action: "user.updated",
		UserID: userID,
		Data:   userData,
	}
	return k.ProduceUserEvent(ctx, event)
}

func (k *KafkaClient) ProduceUserDeleted(ctx context.Context, userID int64) error {
	event := UserEvent{
		Action: "user.deleted",
		UserID: userID,
		Data:   "",
	}
	return k.ProduceUserEvent(ctx, event)
}
