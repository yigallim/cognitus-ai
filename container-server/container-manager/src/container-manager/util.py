import logging
import sys
from datetime import datetime
from uvicorn.logging import DefaultFormatter

class MicrosecondUvicornFormatter(DefaultFormatter):
    def formatTime(self, record, datefmt=None):
        return datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S.%f")

console_handler = logging.StreamHandler(sys.stdout)
fmt = "%(levelprefix)s [%(asctime)s] %(message)s"
console_handler.setFormatter(MicrosecondUvicornFormatter(fmt=fmt, use_colors=True))

loggers_to_patch = ["uvicorn.error", "uvicorn.access"]

for name in loggers_to_patch:
    l = logging.getLogger(name)
    if l.handlers:
        for handler in l.handlers[:]:
            l.removeHandler(handler)

    l.addHandler(console_handler)
    l.propagate = False

logger = logging.getLogger("uvicorn.error")
