import asyncio
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

async def with_retry(func: Callable, retries: int = 2, backoff: int = 2, *args, **kwargs) -> Any:
    for attempt in range(retries):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            if attempt == retries - 1:
                raise e
            logger.warning(f"Retry attempt {attempt + 1} failed: {e}")
            await asyncio.sleep(backoff ** attempt)
