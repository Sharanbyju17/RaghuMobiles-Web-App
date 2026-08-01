from typing import Any, Dict, Optional
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.core.logging import logger

class AppException(Exception):
    """
    Base exception for the application.
    """
    def __init__(self, status_code: int, message: str, details: Optional[Dict[str, Any]] = None):
        self.status_code = status_code
        self.message = message
        self.details = details

class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=404, message=message, details=details)

class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request", details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=400, message=message, details=details)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized", details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=401, message=message, details=details)

class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden", details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=403, message=message, details=details)

class ConflictException(AppException):
    def __init__(self, message: str = "Conflict", details: Optional[Dict[str, Any]] = None):
        super().__init__(status_code=409, message=message, details=details)

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        logger.warning(f"AppException: {exc.message}", extra={"extra_data": exc.details})
        content = {"message": exc.message}
        if exc.details:
            content["details"] = exc.details
        return JSONResponse(
            status_code=exc.status_code,
            content=content,
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled Exception", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"message": "An internal server error occurred."},
        )
