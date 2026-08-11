import boto3
import logging
from botocore.exceptions import ClientError
from app.config.settings import settings
import uuid

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

    def upload_image(self, image_data: bytes, filename: str) -> str:
        """Uploads image to public S3 bucket and returns public URL."""
        try:
            key = f"originals/{uuid.uuid4()}_{filename}"
            self.s3_client.put_object(
                Bucket=settings.S3_BUCKET_IMAGES,
                Key=key,
                Body=image_data,
                ContentType='image/jpeg',
                ACL='public-read'
            )
            url = f"https://{settings.S3_BUCKET_IMAGES}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
            return url
        except ClientError as e:
            logger.error(f"S3 Upload failed: {e}")
            raise e

    def upload_bbox_json(self, bbox_data: list, scan_id: str) -> str:
        """Uploads bbox JSON to a separate S3 bucket."""
        import json
        try:
            key = f"bboxes/{scan_id}_bbox.json"
            self.s3_client.put_object(
                Bucket=settings.S3_BUCKET_BBOX,
                Key=key,
                Body=json.dumps(bbox_data),
                ContentType='application/json'
            )
            url = f"https://{settings.S3_BUCKET_BBOX}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
            return url
        except ClientError as e:
            logger.error(f"S3 BBOX Upload failed: {e}")
            raise e

s3_service = S3Service()
