FROM container-node-base:latest

ENV UV_NO_DEV=1

COPY --from=ghcr.io/astral-sh/uv:0.9.17 /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./

COPY src ./src

RUN uv sync --locked --no-dev

RUN addgroup --system cognitusgrp \
 && adduser --system --ingroup cognitusgrp cognitus

RUN chown -R root:root /app \
 && chmod -R 550 /app

EXPOSE 31942

USER appuser

CMD ["uv", "run", "uvicorn", "src.container_node.main:app", "--host", "0.0.0.0", "--port", "31942"]
