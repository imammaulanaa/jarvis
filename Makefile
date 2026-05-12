.PHONY: dev dev-web dev-api build test

dev:
	@make -j2 dev-web dev-api

dev-web:
	cd apps/web && npm run dev

dev-api:
	cd apps/api && go run cmd/server/main.go

build-api:
	cd apps/api && go build -o bin/api cmd/server/main.go

test-api:
	cd apps/api && go test ./...

test-web:
	cd apps/web && npm test
