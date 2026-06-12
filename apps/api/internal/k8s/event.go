package k8s

import (
	"context"
	"fmt"
	"sort"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
)

type EventInfo struct {
	Type      string `json:"type"`       // Normal | Warning
	Reason    string `json:"reason"`     // Pulled, Killing, FailedScheduling, dll
	Message   string `json:"message"`
	Object    string `json:"object"`     // Pod/nginx-demo-xxx
	Count     int32  `json:"count"`
	FirstSeen string `json:"first_seen"`
	LastSeen  string `json:"last_seen"`
	Age       string `json:"age"`
}

// ListEventsForDeployment — events untuk deployment + pods miliknya
func (c *Client) ListEventsForDeployment(
	ctx context.Context, namespace, deployment string,
) ([]EventInfo, error) {
	if c.cs == nil {
		return nil, fmt.Errorf("k8s client not initialized")
	}

	// Ambil nama pods milik deployment (untuk filter event)
	dep, err := c.cs.AppsV1().Deployments(namespace).Get(ctx, deployment, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("get deployment: %w", err)
	}
	selector := labels.SelectorFromSet(dep.Spec.Selector.MatchLabels).String()

	pods, err := c.cs.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{
		LabelSelector: selector,
	})
	if err != nil {
		return nil, fmt.Errorf("list pods: %w", err)
	}

	// Set nama object yang relevan: deployment + replicasets + pods
	relevant := map[string]bool{
		deployment: true,
	}
	for _, p := range pods.Items {
		relevant[p.Name] = true
	}

	// List semua events di namespace
	events, err := c.cs.CoreV1().Events(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("list events: %w", err)
	}

	out := make([]EventInfo, 0)
	for _, e := range events.Items {
		name := e.InvolvedObject.Name

		// Match: nama persis, atau prefix deployment (cover replicaset nginx-demo-xxx)
		if !relevant[name] && !hasPrefix(name, deployment+"-") {
			continue
		}

		lastSeen := e.LastTimestamp.Time
		if lastSeen.IsZero() && e.Series != nil {
			lastSeen = e.Series.LastObservedTime.Time
		}
		if lastSeen.IsZero() {
			lastSeen = e.CreationTimestamp.Time
		}

		info := EventInfo{
			Type:    e.Type,
			Reason:  e.Reason,
			Message: e.Message,
			Object:  e.InvolvedObject.Kind + "/" + name,
			Count:   e.Count,
		}
		if !e.FirstTimestamp.Time.IsZero() {
			info.FirstSeen = e.FirstTimestamp.Format(time.RFC3339)
		}
		if !lastSeen.IsZero() {
			info.LastSeen = lastSeen.Format(time.RFC3339)
			info.Age = formatAge(lastSeen)
		}

		out = append(out, info)
	}

	// Sort terbaru dulu
	sort.Slice(out, func(i, j int) bool {
		return out[i].LastSeen > out[j].LastSeen
	})

	// Limit 30 event terakhir
	if len(out) > 30 {
		out = out[:30]
	}

	return out, nil
}

func hasPrefix(s, prefix string) bool {
	return len(s) >= len(prefix) && s[:len(prefix)] == prefix
}