package telemetry

import (
	"context"
	"errors"
	"log/slog"
	"os"

	"github.com/lmittmann/tint"
	slogmulti "github.com/samber/slog-multi"
	"go.opentelemetry.io/contrib/bridges/otelslog"
	hostMetrics "go.opentelemetry.io/contrib/instrumentation/host"
	runtimeMetrics "go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

func SetupOtel(ctx context.Context) (shutdown func(context.Context) error, err error) {
	var shutdownFuncs []func(context.Context) error

	shutdown = func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	res, err := resource.New(
		ctx,
		resource.WithHost(),
		resource.WithAttributes(
			semconv.ServiceNameKey.String("user-service"),
		),
	)
	if err != nil {
		return shutdown, err
	}

	tracerProvider, err := newTraceProvider(ctx, res)
	if err != nil {
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)
	otel.SetTracerProvider(tracerProvider)

	meterProvider, err := newMeterProvider(ctx, res)
	if err != nil {
		return shutdown, err
	}
	shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
	otel.SetMeterProvider(meterProvider)

	loggerProvider, err := newLoggerProvider(ctx, res)
	if err != nil {
		return shutdown, err
	}
	global.SetLoggerProvider(loggerProvider)
	shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)

	return shutdown, nil
}

func newTraceProvider(ctx context.Context, res *resource.Resource) (*trace.TracerProvider, error) {
	traceExporter, err := otlptracehttp.New(ctx)
	if err != nil {
		return nil, err
	}

	traceProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter),
		trace.WithResource(res),
	)
	return traceProvider, nil
}

func newMeterProvider(ctx context.Context, res *resource.Resource) (*metric.MeterProvider, error) {
	metricExporter, err := otlpmetrichttp.New(ctx)
	if err != nil {
		return nil, err
	}

	reader := metric.NewPeriodicReader(metricExporter, metric.WithProducer(runtimeMetrics.NewProducer()))
	meterProvider := metric.NewMeterProvider(metric.WithReader(reader), metric.WithResource(res))

	if err = runtimeMetrics.Start(runtimeMetrics.WithMeterProvider(meterProvider)); err != nil {
		return nil, err
	}

	if err = hostMetrics.Start(hostMetrics.WithMeterProvider(meterProvider)); err != nil {
		return nil, err
	}

	return meterProvider, nil
}

func newLoggerProvider(ctx context.Context, res *resource.Resource) (*log.LoggerProvider, error) {
	exporter, err := otlploghttp.New(ctx)
	if err != nil {
		return nil, err
	}

	p := log.NewBatchProcessor(exporter)
	provider := log.NewLoggerProvider(
		log.WithProcessor(p),
		log.WithResource(res),
	)
	return provider, nil
}

func NewLogger() *slog.Logger {
	otelHandler := otelslog.NewHandler("user-service")
	consoleHandler := tint.NewHandler(os.Stdout, &tint.Options{
		TimeFormat: "[15:04:05]",
	})

	handler := slogmulti.Fanout(consoleHandler, otelHandler)
	return slog.New(handler)
}
