import yaml
import re
from typing import Optional, Dict, Any

def parse_action(text: str) -> Optional[Dict[str, Any]]:
    match = re.search(r"```yaml\n(.*?)\n```", text, re.DOTALL)
    if match:
        yaml_content = match.group(1)
        try:
            return yaml.safe_load(yaml_content)
        except Exception:
            return None
    return None
