package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// The HTTP demo accepts only these exact local fixture URLs; never arbitrary URLs.
var allowedTargets = map[string]bool{
	"http://127.0.0.1:9099/ok":     true,
	"http://127.0.0.1:9099/broken": true,
	"http://127.0.0.1:9099/slow":   true,
}

type CheckRequest struct {
	URLs []string `json:"urls"`
}

type CheckResult struct {
	URL    string `json:"url"`
	Status int    `json:"status"`
	Error  string `json:"error"`
}

type CheckResponse struct {
	Results    []CheckResult `json:"results"`
	BatchError string        `json:"batch_error"`
}

// Sequential keeps exactly the same per-URL policy as Run, before concurrency.
func Sequential(ctx context.Context, client *http.Client, urls []string, _ int) ([]Result, error) {
	var results []Result
	for _, url := range urls {
		if err := ctx.Err(); err != nil {
			return results, err
		}
		results = append(results, check(ctx, client, url))
	}
	return results, ctx.Err()
}

func checksHandler(sequential bool) http.HandlerFunc {
	// Reuse the client and forbid redirects outside the exact fixture allowlist.
	client := &http.Client{CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
		return http.ErrUseLastResponse
	}}
	run := Run
	if sequential {
		run = Sequential
	}
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 65536)
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		var input CheckRequest
		if err := decoder.Decode(&input); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		if err := decoder.Decode(new(any)); err != io.EOF {
			http.Error(w, "expected one JSON object", http.StatusBadRequest)
			return
		}
		if input.URLs == nil || len(input.URLs) > 1000 {
			http.Error(w, "urls must be an array of at most 1000 targets", http.StatusBadRequest)
			return
		}
		for _, url := range input.URLs {
			if !allowedTargets[url] {
				http.Error(w, "target not allowlisted", http.StatusBadRequest)
				return
			}
		}
		// The inbound request owns the work; its disconnect cancels the whole pool.
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		results, err := run(ctx, client, input.URLs, 2)
		output := CheckResponse{Results: make([]CheckResult, 0, len(results))}
		for _, result := range results {
			item := CheckResult{URL: result.URL, Status: result.Status}
			if result.Err != nil {
				item.Error = result.Err.Error()
			}
			output.Results = append(output.Results, item)
		}
		status := http.StatusOK
		if err != nil {
			output.BatchError = err.Error()
			status = http.StatusGatewayTimeout
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_ = json.NewEncoder(w).Encode(output)
	}
}

func main() {
	serve := flag.Bool("serve", false, "serve POST /checks on loopback :18081")
	sequential := flag.Bool("sequential", false, "use the sequential HTTP implementation")
	flag.Parse()
	if !*serve {
		legacyDemo()
		return
	}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /checks", checksHandler(*sequential))
	server := &http.Server{Addr: "127.0.0.1:18081", Handler: mux, ReadHeaderTimeout: 2 * time.Second}
	fmt.Printf("Go POST /checks on %s (sequential=%v)\n", server.Addr, *sequential)
	log.Fatal(server.ListenAndServe())
}
