import datetime
import logging
from typing import List, Optional
import httpx
from fastapi import HTTPException, status
from backend.config import settings

logger = logging.getLogger(__name__)

class ExternalService:
    # Class-level simple in-memory cache for API results
    _cache_data: Optional[List[dict]] = None
    _cache_time: Optional[datetime.datetime] = None
    CACHE_EXPIRY_SECONDS: int = 60  # Cache for 1 minute to avoid rate limits

    @classmethod
    def _is_cache_valid(cls) -> bool:
        if cls._cache_data is None or cls._cache_time is None:
            return False
        age = (datetime.datetime.now() - cls._cache_time).total_seconds()
        return age < cls.CACHE_EXPIRY_SECONDS

    async def fetch_external_users(self) -> List[dict]:
        # Check cache first
        if self._is_cache_valid():
            logger.info("Returning cached external users")
            return self._cache_data

        logger.info(f"Fetching external users from {settings.EXTERNAL_API_URL}")
        
        # Configure timeout: 2 seconds connect, 3 seconds read/write (5.0 total)
        timeout = httpx.Timeout(settings.EXTERNAL_API_TIMEOUT, connect=2.0)
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.get(settings.EXTERNAL_API_URL)
                
                # Check for HTTP status errors (e.g. 404, 500)
                response.raise_for_status()
                
                # Parse JSON
                data = response.json()
                
                # Process and structure response (only take necessary details)
                processed_users = []
                for user in data:
                    processed_users.append({
                        "id": user.get("id"),
                        "name": user.get("name"),
                        "email": user.get("email"),
                        "username": user.get("username"),
                        "city": user.get("address", {}).get("city", "N/A"),
                        "company": user.get("company", {}).get("name", "N/A"),
                        "website": user.get("website", "N/A")
                    })
                
                # Update Cache
                ExternalService._cache_data = processed_users
                ExternalService._cache_time = datetime.datetime.now()
                
                return processed_users

            except httpx.TimeoutException as e:
                logger.error(f"Timeout connecting to external API: {e}")
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="Connection to the external user partner timed out. Please try again later."
                )
            except httpx.HTTPStatusError as e:
                logger.error(f"External API returned status {e.response.status_code}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Partner API responded with an error (HTTP {e.response.status_code})."
                )
            except httpx.RequestError as e:
                logger.error(f"Network error when calling external API: {e}")
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Failed to connect to the external user partner service. Network is unreachable."
                )
            except Exception as e:
                logger.error(f"Unexpected error fetching external users: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="An unexpected error occurred while communicating with the partner service."
                )
