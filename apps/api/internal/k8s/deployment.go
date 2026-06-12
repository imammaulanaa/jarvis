package k8s

import (
	"context"
	"fmt"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type DeploymentInfo struct {
	Name              string            `json:"name"`
	Namespace         string            `json:"namespace"`
	ReadyReplicas     int32             `json:"ready_replicas"`
	DesiredReplicas   int32             `json:"desired_replicas"`
	UpdatedReplicas   int32             `json:"updated_replicas"`
	AvailableReplicas int32             `json:"available_replicas"`
	Image             string            `json:"image"`
	Strategy          string            `json:"strategy"`
	Conditions        []ConditionInfo   `json:"conditions"`
	Labels            map[string]string `json:"labels,omitempty"`
	CreatedAt         string            `json:"created_at"`
	Healthy           bool              `json:"healthy"`
}

type ConditionInfo struct {
	Type    string `json:"type"`
	Status  string `json:"status"`
	Reason  string `json:"reason,omitempty"`
	Message string `json:"message,omitempty"`
}

type NamespaceOverview struct {
	Namespace   string           `json:"namespace"`
	Deployments []DeploymentInfo `json:"deployments"`
}

func (c *Client) GetDeployment(ctx context.Context, namespace, name string) (*DeploymentInfo, error) {
	if c.cs == nil {
		return nil, fmt.Errorf("k8s client not initialized")
	}

	dep, err := c.cs.AppsV1().Deployments(namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("get deployment %s/%s: %w", namespace, name, err)
	}

	info := &DeploymentInfo{
		Name:              dep.Name,
		Namespace:         dep.Namespace,
		ReadyReplicas:     dep.Status.ReadyReplicas,
		DesiredReplicas:   *dep.Spec.Replicas,
		UpdatedReplicas:   dep.Status.UpdatedReplicas,
		AvailableReplicas: dep.Status.AvailableReplicas,
		Strategy:          string(dep.Spec.Strategy.Type),
		Labels:            dep.Labels,
		CreatedAt:         dep.CreationTimestamp.Format("2006-01-02T15:04:05Z"),
	}

	if len(dep.Spec.Template.Spec.Containers) > 0 {
		info.Image = dep.Spec.Template.Spec.Containers[0].Image
	}

	for _, cond := range dep.Status.Conditions {
		info.Conditions = append(info.Conditions, ConditionInfo{
			Type:    string(cond.Type),
			Status:  string(cond.Status),
			Reason:  cond.Reason,
			Message: cond.Message,
		})
	}

	info.Healthy = info.ReadyReplicas == info.DesiredReplicas &&
		info.AvailableReplicas == info.DesiredReplicas &&
		info.DesiredReplicas > 0

	return info, nil
}

func (c *Client) ListDeployments(ctx context.Context, namespace string) ([]DeploymentInfo, error) {
	if c.cs == nil {
		return nil, fmt.Errorf("k8s client not initialized")
	}

	deps, err := c.cs.AppsV1().Deployments(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("list deployments in %s: %w", namespace, err)
	}

	out := make([]DeploymentInfo, 0, len(deps.Items))
	for _, dep := range deps.Items {
		info := DeploymentInfo{
			Name:            dep.Name,
			Namespace:       dep.Namespace,
			ReadyReplicas:   dep.Status.ReadyReplicas,
			DesiredReplicas: *dep.Spec.Replicas,
		}
		if len(dep.Spec.Template.Spec.Containers) > 0 {
			info.Image = dep.Spec.Template.Spec.Containers[0].Image
		}
		info.Healthy = info.ReadyReplicas == info.DesiredReplicas && info.DesiredReplicas > 0
		out = append(out, info)
	}
	return out, nil
}

func (c *Client) ClusterOverview(ctx context.Context) ([]NamespaceOverview, error) {
	if c.cs == nil {
		return nil, fmt.Errorf("k8s client not initialized")
	}

	skipNS := map[string]bool{
		"kube-system":     true,
		"kube-public":     true,
		"kube-node-lease": true,
	}

	nsList, err := c.cs.CoreV1().Namespaces().List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("list namespaces: %w", err)
	}

	out := make([]NamespaceOverview, 0)
	for _, ns := range nsList.Items {
		if skipNS[ns.Name] {
			continue
		}

		deps, err := c.ListDeployments(ctx, ns.Name)
		if err != nil {
			continue // skip namespace yang error
		}
		if len(deps) == 0 {
			continue // skip namespace kosong
		}

		out = append(out, NamespaceOverview{
			Namespace:   ns.Name,
			Deployments: deps,
		})
	}

	return out, nil
}

