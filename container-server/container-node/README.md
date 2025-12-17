docker build -f dockerfiles/base.Dockerfile -t container-node-base:latest .
docker build -f dockerfiles/app.Dockerfile -t container-node-app .

uv run fastapi dev src/container_node/main.py --port 8888
uv run fastapi dev /app/container-node/src/container_node/main.py --port 8888
