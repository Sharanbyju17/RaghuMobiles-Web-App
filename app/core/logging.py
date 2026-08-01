import logging
import json
import sys
from datetime import datetime, timezone
from typing import Any, Dict

class JSONFormatter(logging.Formatter):
    """
    Formatter that outputs JSON strings for structured logging.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_record: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        if hasattr(record, "extra_data"):
            log_record["extra_data"] = record.extra_data

        return json.dumps(log_record)

def setup_logging():
    """
    Configure the root logger and uvicorn loggers to use the JSONFormatter.
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Remove existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    
    # Also configure uvicorn
    for _logger_name in ["uvicorn", "uvicorn.error", "uvicorn.access"]:
        _logger = logging.getLogger(_logger_name)
        _logger.handlers.clear()
        _logger.addHandler(handler)
        _logger.propagate = False

# Create a default logger for the app
logger = logging.getLogger("recell_api")
