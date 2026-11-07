// A bounded URL status checker. Run with Go 1.22+; no external network needed.
package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

// #region result
type Result struct {
	URL    string
	Status int
	Err    error
}

// #endregion result

// #region check
func check(ctx context.Context, client *http.Client, url string) Result {
	ctx, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
	defer cancel()
	r := Result{URL: url}
	req, err := http.NewRequestWithContext(ctx, http.MethodHead, url, nil)
	if err != nil {
		r.Err = err
		return r
	}
	resp, err := client.Do(req)
	if err != nil {
		r.Err = err
		return r
	}
	defer resp.Body.Close()
	r.Status = resp.StatusCode
	if resp.StatusCode >= 400 {
		r.Err = fmt.Errorf("HTTP status %d", resp.StatusCode)
	}
	return r
}

// #endregion check

// Run returns completion-order results. URL failures are data; cancellation is
// a batch error and may leave partial results. It joins all goroutines it starts.
func Run(ctx context.Context, client *http.Client, urls []string, workers int) ([]Result, error) {
	if workers < 1 {
		return nil, fmt.Errorf("workers must be positive")
	}
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	// #region channels
	jobs := make(chan string)
	results := make(chan Result)
	var wg sync.WaitGroup
	// #endregion channels

	// #region workers
	wg.Add(workers)
	for i := 0; i < workers; i++ {
		go func() {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case url, ok := <-jobs:
					if !ok {
						return
					}
					r := check(ctx, client, url)
					select {
					case results <- r:
					case <-ctx.Done():
						return
					}
				}
			}
		}()
	}
	// #endregion workers

	// #region producer
	producerDone := make(chan struct{})
	go func() {
		defer close(producerDone)
		defer close(jobs)
		for _, url := range urls {
			select {
			case jobs <- url:
			case <-ctx.Done():
				return
			}
		}
	}()
	// #endregion producer

	// #region collector
	go func() {
		wg.Wait()
		<-producerDone
		close(results)
	}()
	var collected []Result // Only this goroutine owns the slice.
	for r := range results {
		collected = append(collected, r)
	}
	return collected, ctx.Err()
	// #endregion collector
}

// legacyDemo preserves the original no-arguments, local-only executable.
func legacyDemo() {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/broken":
			w.WriteHeader(http.StatusServiceUnavailable)
		case "/slow":
			select {
			case <-time.After(time.Second):
				w.WriteHeader(http.StatusOK)
			case <-r.Context().Done():
				return
			}
		default:
			w.WriteHeader(http.StatusOK)
		}
	}))
	defer server.Close()
	urls := []string{server.URL + "/ok", server.URL + "/broken", server.URL + "/slow"}
	// #region parent
	// OS signals govern this CLI; the HTTP handler uses r.Context().
	parent, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	// #endregion parent
	// #region caller
	ctx, cancel := context.WithTimeout(parent, 2*time.Second)
	defer cancel()
	results, err := Run(ctx, server.Client(), urls, 2)
	for _, r := range results {
		fmt.Printf("%s status=%d err=%v\n", r.URL, r.Status, r.Err)
	}
	if err != nil {
		fmt.Printf("batch stopped: %v\n", err)
	}
	// #endregion caller
}
