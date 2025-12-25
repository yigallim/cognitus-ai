import sys
import time
from typing import Optional

import httpx


def test_get_root(base_url: str = "http://localhost:9090/", timeout: float = 5.0) -> int:
	print(f"Connecting to {base_url} ...")
	start = time.time()
	try:
		with httpx.Client(timeout=timeout) as client:
			resp = client.get(base_url)
			elapsed = time.time() - start
			print(f"Status: {resp.status_code}")
			print(f"Elapsed: {elapsed:.3f}s")
			# Print up to 1000 chars to avoid flooding output
			text = resp.text
			preview = text if len(text) <= 1000 else text[:1000] + "... [truncated]"
			print("Body:\n" + preview)
			return 0
	except httpx.HTTPStatusError as e:
		elapsed = time.time() - start
		print(f"Upstream returned error status: {e.response.status_code}")
		print(f"Elapsed: {elapsed:.3f}s")
		print(f"Body: {e.response.text}")
		return 2
	except httpx.RequestError as e:
		elapsed = time.time() - start
		print(f"Request failed: {e}")
		print(f"Elapsed: {elapsed:.3f}s")
		print("Hint: Ensure the agent server is running on port 9090.")
		return 3


if __name__ == "__main__":
	# Optional override via CLI: python test_connect.py http://localhost:9090/
	url: Optional[str] = sys.argv[1] if len(sys.argv) > 1 else None
	rc = test_get_root(url or "http://localhost:9090/chat/")
	sys.exit(rc)

