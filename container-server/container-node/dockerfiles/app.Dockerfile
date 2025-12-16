FROM container-node-base:latest

ENV UV_NO_DEV=1

COPY --from=ghcr.io/astral-sh/uv:0.9.17 /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./

COPY src ./src

RUN uv sync --locked --no-dev

EXPOSE 31942

CMD ["uv", "run", "uvicorn", "src.container-node.main:app", "--host", "0.0.0.0", "--port", "31942"]
