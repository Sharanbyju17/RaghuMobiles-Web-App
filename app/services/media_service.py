import boto3
import uuid
import mimetypes
from botocore.config import Config
from app.core.config import settings
from fastapi import UploadFile

class MediaService:
    def __init__(self):
        # Initialize boto3 client for Cloudflare R2
        self.s3_client = boto3.client(
            service_name="s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto"
        )
        self.bucket_name = settings.R2_BUCKET_NAME

    async def upload_file(self, file: UploadFile) -> str:
        # Generate a unique filename
        ext = mimetypes.guess_extension(file.content_type) or ""
        # Sometimes mimetypes returns None or unexpected, handle edge cases
        if not ext and file.filename:
            parts = file.filename.split(".")
            if len(parts) > 1:
                ext = f".{parts[-1]}"
                
        unique_name = f"{uuid.uuid4().hex}{ext}"
        
        # Upload file directly to R2
        self.s3_client.upload_fileobj(
            file.file,
            self.bucket_name,
            unique_name,
            ExtraArgs={
                "ContentType": file.content_type or "application/octet-stream"
            }
        )
        
        # Return a backend URL that will proxy/redirect to the presigned S3 URL
        # We use a relative path logic or standard localhost for dev
        return f"http://localhost:8000/api/v1/inventory/media/{unique_name}"
        
    def get_presigned_url(self, filename: str, expires_in: int = 3600) -> str:
        url = self.s3_client.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': self.bucket_name,
                'Key': filename
            },
            ExpiresIn=expires_in
        )
        return url

media_service = MediaService()
