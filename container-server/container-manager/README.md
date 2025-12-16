uv run fastapi dev src/container-manager/main.py --port 8080
netstat -ano | findstr :8080
taskkill /PID pid /F
