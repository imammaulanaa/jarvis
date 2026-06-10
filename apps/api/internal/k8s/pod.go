package k8s

import (
	"context"
	"fmt"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
)

type PodInfo struct {
	Name              string `json:"name"`
	Namespace         string `json:"namespace"`
	Phase             string `json:"phase"`
	ReadyContainers   int    `json:"ready_containers"`
	TotalContainers   int    `json:"total_containers"`
	RestartCount      int32  `json:"restart_count"`
	Node              string `json:"node"`
	PodIP             string `json:"pod_ip"`
	HostIP            string `json:"host_ip"`
	StartedAt         string `json:"started_at,omitempty"`
	Age               string `json:"age"`
	Image             string `json:"image"`
	Healthy           bool   `json:"healthy"`
	Reason            string `json:"reason,omitempty"`
}

func formatAge(t time.Time) string {
	d := time.Since(t)
	if d < time.Minute   { return fmt.Sprintf("%ds", int(d.Seconds())) }
	if d < time.Hour     { return fmt.Sprintf("%dm", int(d.Minutes())) }
	if d < 24*time.Hour  { return fmt.Sprintf("%dh", int(d.Hours())) }
	return fmt.Sprintf("%dd", int(d.Hours()/24))
}

func (c *Client) ListPodsForDeployment(ctx context.Context, namespace, deployment string) ([]PodInfo, error) {
	if c.cs == nil {
		return nil, fmt.Errorf("k8s client not initialized")
	}

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

	out := make([]PodInfo, 0, len(pods.Items))
	for _, p := range pods.Items {
		info := PodInfo{
			Name:            p.Name,
			Namespace:       p.Namespace,
			Phase:           string(p.Status.Phase),
			Node:            p.Spec.NodeName,
			PodIP:           p.Status.PodIP,
			HostIP:          p.Status.HostIP,
			TotalContainers: len(p.Spec.Containers),
		}

		if len(p.Spec.Containers) > 0 {
			info.Image = p.Spec.Containers[0].Image
		}

		for _, cs := range p.Status.ContainerStatuses {
			if cs.Ready {
				info.ReadyContainers++
			}
			info.RestartCount += cs.RestartCount

			if cs.State.Waiting != nil && info.Reason == "" {
				info.Reason = cs.State.Waiting.Reason
			}
		}

		info.Healthy = p.Status.Phase == corev1.PodRunning &&
			info.ReadyContainers == info.TotalContainers

		if p.Status.StartTime != nil {
			info.StartedAt = p.Status.StartTime.Format("2006-01-02T15:04:05Z")
			info.Age = formatAge(p.Status.StartTime.Time)
		}

		out = append(out, info)
	}

	return out, nil
}