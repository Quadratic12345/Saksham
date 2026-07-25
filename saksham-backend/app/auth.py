import jwt
from fastapi import Header, HTTPException, status
from jwt import PyJWKClient

from app.config import get_settings

_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(get_settings().clerk_jwks_url)
    return _jwks_client


def get_current_user_id(authorization: str = Header(...)) -> str:
    """
    Verifies the Clerk session token sent by the frontend and returns the
    signed-in user's id (the JWT's `sub` claim).

    The frontend must send this on every request to a protected route:

        const token = await getToken();  // from Clerk's useAuth()
        fetch('/api/documents', {
          headers: { Authorization: `Bearer ${token}` },
        });
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=get_settings().clerk_issuer,
            options={"verify_aud": False},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid session token: {exc}",
        ) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim.",
        )

    return user_id
