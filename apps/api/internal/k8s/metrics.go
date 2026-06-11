package k8s

import (
	"context"
	"fmt"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	metricsclient "k8s.io/metrics/pkg/client/clientset/versioned"

	"os"
	"path/filepath"
)

type PodMetrics struct {
	Name        string `json:"name"`
	CPUMilli    int64  `json:"cpu_milli"`     // milliCPU (1000m = 1 core)
	MemoryBytes int64  `json:"memory_bytes"`
	CPUDisplay  string `json:"cpu_display"`    // "15m"
	MemDisplay  string `json:"mem_display"`    // "32Mi"
}

// metricsClientset — buat metrics client dengan config yang sama dengan Client utama
func newMetricsClientset() (*metricsclient.Clientset, error) {
	// In-cluster dulu
	cfg, err := rest.InClusterConfig()
	if err != nil {
		kubeconfig := os.Getenv("KUBECONFIG")
		if kubeconfig == "" {
			home, _ := os.UserHomeDir()
			kubeconfig = filepath.Join(home, ".kube", "config")
		}
		cfg, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return nil, fmt.Errorf("load kubeconfig for metrics: %w", err)
		}
	}
	return metricsclient.NewForConfig(cfg)
}

func formatMemory(bytes int64) string {
	mi := bytes / (1024 * 1024)
	if mi >= 1024 {
		return fmt.Sprintf("%.1fGi", float64(mi)/1024)
	}
	return fmt.Sprintf("%dMi", mi)
}

// GetPodMetricsForDeployment — CPU + memory per pod milik deployment
func (c *Client) GetPodMetricsForDeployment(
	ctx context.Context, namespace, deployment string,
) (map[string]PodMetrics, error) {
	if c.cs == nil {
		return nil, fmt.Errorf("k8s client not initialized")
	}

	// Ambil selector deployment
	dep, err := c.cs.AppsV1().Deployments(namespace).Get(ctx, deployment, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("get deployment: %w", err)
	}
	selector := labels.SelectorFromSet(dep.Spec.Selector.MatchLabels).String()

	// Metrics client
	mc, err := newMetricsClientset()
	if err != nil {
		return nil, fmt.Errorf("metrics client: %w", err)
	}

	podMetricsList, err := mc.MetricsV1beta1().
		PodMetricses(namespace).
		List(ctx, metav1.ListOptions{LabelSelector: selector})
	if err != nil {
		return nil, fmt.Errorf("list pod metrics (metrics-server installed?): %w", err)
	}

	out := make(map[string]PodMetrics, len(podMetricsList.Items))
	for _, pm := range podMetricsList.Items {
		var cpuMilli, memBytes int64
		for _, container := range pm.Containers {
			cpuMilli += container.Usage.Cpu().MilliValue()
			memBytes += container.Usage.Memory().Value()
		}
		out[pm.Name] = PodMetrics{
			Name:        pm.Name,
			CPUMilli:    cpuMilli,
			MemoryBytes: memBytes,
			CPUDisplay:  fmt.Sprintf("%dm", cpuMilli),
			MemDisplay:  formatMemory(memBytes),
		}
	}
	return out, nil
}