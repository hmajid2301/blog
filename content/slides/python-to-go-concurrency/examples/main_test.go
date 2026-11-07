package main

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"
)

// Removing the worker limit must fail the peak-concurrency assertion.
func TestRunBoundedAndCollectsEveryResult(t *testing.T) {
	var active, peak atomic.Int32
	entered := make(chan struct{}, 8)
	release := make(chan struct{})
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		n := active.Add(1)
		defer active.Add(-1)
		for old := peak.Load(); n > old; old = peak.Load() {
			if peak.CompareAndSwap(old, n) {
				break
			}
		}
		entered <- struct{}{}
		select {
		case <-release:
		case <-r.Context().Done():
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()
	urls := []string{server.URL, server.URL, server.URL, server.URL, server.URL, server.URL}
	done := make(chan []Result, 1)
	go func() {
		results, err := Run(context.Background(), server.Client(), urls, 2)
		if err != nil {
			t.Error(err)
		}
		done <- results
	}()
	// Force two requests to overlap rather than relying on scheduler timing.
	for i := 0; i < 2; i++ {
		select {
		case <-entered:
		case <-time.After(2 * time.Second):
			close(release)
			t.Fatal("workers did not start")
		}
	}
	close(release)
	select {
	case results := <-done:
		if len(results) != 6 {
			t.Fatalf("got %d results, want 6", len(results))
		}
		for _, result := range results {
			if result.Status != 204 || result.Err != nil {
				t.Errorf("unexpected result: %+v", result)
			}
		}
	case <-time.After(2 * time.Second):
		t.Fatal("pool did not finish")
	}
	if got := peak.Load(); got != 2 {
		t.Fatalf("peak = %d, want 2", got)
	}
}

// Dropping per-URL errors, or failing the entire batch on HTTP 503, must fail.
func TestRunKeepsPerURLErrors(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/bad" {
			w.WriteHeader(503)
			return
		}
		w.WriteHeader(200)
	}))
	defer server.Close()
	results, err := Run(context.Background(), server.Client(), []string{server.URL, server.URL + "/bad", "://bad"}, 2)
	if err != nil {
		t.Fatal(err)
	}
	if len(results) != 3 {
		t.Fatalf("got %d results, want 3", len(results))
	}
	var successes, failures int
	for _, r := range results {
		if r.Err == nil {
			successes++
		} else {
			failures++
		}
	}
	if successes != 1 || failures != 2 {
		t.Fatalf("successes=%d failures=%d", successes, failures)
	}
}

// Losing context propagation must fail: the HTTP request must actually stop.
func TestRunCancellationJoinsWorkers(t *testing.T) {
	started := make(chan struct{})
	stopped := make(chan struct{})
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		close(started)
		<-r.Context().Done()
		close(stopped)
	}))
	defer server.Close()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	done := make(chan error, 1)
	go func() { _, err := Run(ctx, server.Client(), []string{server.URL}, 1); done <- err }()
	select {
	case <-started:
	case <-time.After(2 * time.Second):
		t.Fatal("request never started")
	}
	cancel()
	select {
	case err := <-done:
		if !errors.Is(err, context.Canceled) {
			t.Fatalf("got %v, want cancellation", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("pool did not stop")
	}
	select {
	case <-stopped:
	case <-time.After(2 * time.Second):
		t.Fatal("HTTP request leaked")
	}
}

func TestRunDeadline(t *testing.T) {
	ctx, cancel := context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
	defer cancel()
	_, err := Run(ctx, http.DefaultClient, []string{"http://127.0.0.1"}, 1)
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("got %v, want deadline exceeded", err)
	}
}

func TestRunEmptyAndInvalidWorkerCount(t *testing.T) {
	results, err := Run(context.Background(), http.DefaultClient, nil, 2)
	if len(results) != 0 || err != nil {
		t.Fatalf("empty batch: %v %v", results, err)
	}
	for _, workers := range []int{0, -1} {
		if _, err := Run(context.Background(), http.DefaultClient, nil, workers); err == nil {
			t.Errorf("workers=%d: expected validation error", workers)
		}
	}
}

func TestCheckRequestTimeout(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		<-r.Context().Done()
	}))
	defer server.Close()
	result := check(context.Background(), server.Client(), server.URL)
	if !errors.Is(result.Err, context.DeadlineExceeded) {
		t.Fatalf("got %v, want request timeout", result.Err)
	}
}
