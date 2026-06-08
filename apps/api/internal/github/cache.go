package github

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache struct {
	rdb *redis.Client
	ttl time.Duration
}

func NewCache() *Cache {
	url := os.Getenv("REDIS_URL")
	if url == "" {
		url = "redis://localhost:6379"
	}
	opt, err := redis.ParseURL(url)
	if err != nil {
		// Fallback tanpa cache
		return &Cache{rdb: nil, ttl: 5 * time.Minute}
	}
	return &Cache{
		rdb: redis.NewClient(opt),
		ttl: 5 * time.Minute,
	}
}

func (c *Cache) Get(ctx context.Context, key string, dest interface{}) bool {
	if c.rdb == nil {
		return false
	}
	val, err := c.rdb.Get(ctx, "gh:"+key).Result()
	if err != nil {
		return false
	}
	if err := json.Unmarshal([]byte(val), dest); err != nil {
		return false
	}
	return true
}

func (c *Cache) Set(ctx context.Context, key string, val interface{}) {
	if c.rdb == nil {
		return
	}
	data, err := json.Marshal(val)
	if err != nil {
		return
	}
	c.rdb.Set(ctx, "gh:"+key, data, c.ttl)
}