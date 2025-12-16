docker build -f dockerfiles/base.Dockerfile -t container-node-base:latest .
docker build -f dockerfiles/app.Dockerfile -t container-node-app .
