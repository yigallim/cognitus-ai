import asyncio
from sdk.container.container import Container
from sdk.env.base_python_env import BasePythonEnv

async def main():
    print("hi")

    container = Container(user_id="123")

    conversation_id = "456"
    python_env: BasePythonEnv = await container.get_python_env(conversation_id)

    code = "print('Hi')"
    result = await python_env.execute_cell(code)
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
