# test/test_python_notebook.py
import asyncio
from container_node.code_interpreter.python_notebook import PythonNotebook

async def main():
    nb = PythonNotebook(work_directory="./")

    print("=== Test 1: Simple execution ===")
    res = await nb.execute("1 + 1")
    print(res)

    print("\n=== Test 2: Stateful variable ===")
    await nb.execute("x = 10")
    res = await nb.execute("x * 2")
    print(res)

    print("\n=== Test 3: Overwrite cell ===")
    res = await nb.execute("x = 100", cell_index=1)
    res = await nb.execute("x")
    print(res)

    print("\n=== Test 4: Error handling ===")
    res = await nb.execute("1 / 0")
    print(res)

    print("\n=== Test 5: Reset kernel ===")
    await nb.execute("y = 999")
    res = await nb.execute("y", reset=True)
    print(res)

if __name__ == "__main__":
    asyncio.run(main())
