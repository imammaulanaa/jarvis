package github

import (
	"context"
	"time"
)

func retryWithBackoff[T any](
	ctx context.Context,
	fn func() (T, error),
) (T, error) {
	var zero T
	var lastErr error

	delays := []time.Duration{
		1 * time.Second,
		2 * time.Second,
		4 * time.Second,
	}

	for attempt := 0; attempt <= len(delays); attempt++ {
		result, err := fn()
		if err == nil {
			return result, nil
		}
		lastErr = err

		if attempt == len(delays) {
			break
		}

		select {
		case <-ctx.Done():
			return zero, ctx.Err()
		case <-time.After(delays[attempt]):
		}
	}

	return zero, lastErr
}