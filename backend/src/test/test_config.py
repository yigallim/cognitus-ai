from cognitus_ai.config import config

print(f"LLM: {config.llm}")
print(f"Redis: {config.redis}")
print(f"Mongo: {config.mongo}")
print(f"CORS Origin: {config.cors_origin}")
print(f"Auth: {config.auth}")