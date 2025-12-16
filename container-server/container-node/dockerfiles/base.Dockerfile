FROM python:3.12.12-slim-bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        psmisc \
    && rm -rf /var/lib/apt/lists/*
