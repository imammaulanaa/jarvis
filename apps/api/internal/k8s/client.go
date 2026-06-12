package k8s

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type Client struct {
	cs      *kubernetes.Clientset
	context string
}

type ClusterInfo struct {
	Connected bool   `json:"connected"`
	Context   string `json:"context"`
	Version   string `json:"version,omitempty"`
	Error     string `json:"error,omitempty"`
}

// New — load kubeconfig (try in-cluster dulu, lalu fallback ke kubeconfig file)
func New() (*Client, error) {
	// 1. Try in-cluster config (production)
	cfg, err := rest.InClusterConfig()
	if err == nil {
		cs, err := kubernetes.NewForConfig(cfg)
		if err != nil {
			return nil, fmt.Errorf("create in-cluster client: %w", err)
		}
		return &Client{cs: cs, context: "in-cluster"}, nil
	}

	// 2. Fallback to kubeconfig file (development)
	kubeconfig := os.Getenv("KUBECONFIG")
	if kubeconfig == "" {
		home, _ := os.UserHomeDir()
		kubeconfig = filepath.Join(home, ".kube", "config")
	}

	if _, err := os.Stat(kubeconfig); os.IsNotExist(err) {
		return nil, fmt.Errorf("kubeconfig not found at %s", kubeconfig)
	}

	cfg, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		return nil, fmt.Errorf("load kubeconfig: %w", err)
	}

	// Set timeout supaya tidak hang kalau cluster unreachable
	cfg.Timeout = 10 * time.Second

	cs, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return nil, fmt.Errorf("create client: %w", err)
	}

	// Ambil current context untuk display
	loadingRules := clientcmd.NewDefaultClientConfigLoadingRules()
	loadingRules.ExplicitPath = kubeconfig
	clientConfig := clientcmd.NewNonInteractiveDeferredLoadingClientConfig(
		loadingRules, &clientcmd.ConfigOverrides{},
	)
	raw, _ := clientConfig.RawConfig()

	return &Client{cs: cs, context: raw.CurrentContext}, nil
}

// Clientset — expose underlying kubernetes clientset
func (c *Client) Clientset() *kubernetes.Clientset {
	return c.cs
}

// Health — cek apakah bisa connect ke cluster
func (c *Client) Health(ctx context.Context) ClusterInfo {
	info := ClusterInfo{Context: c.context}

	if c.cs == nil {
		info.Error = "client not initialized"
		return info
	}

	version, err := c.cs.Discovery().ServerVersion()
	if err != nil {
		info.Error = err.Error()
		return info
	}

	info.Connected = true
	info.Version   = version.GitVersion
	return info
}