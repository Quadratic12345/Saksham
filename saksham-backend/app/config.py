from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    All configuration comes from environment variables / .env.
    See .env.example for what each of these needs to be set to.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Anthropic (used to generate answers from retrieved chunks) ---
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"

    # --- Clerk (used to verify the frontend's session token) ---
    # Find this in the Clerk dashboard: Configure > API Keys > "Frontend API URL".
    # It looks like https://your-app-name.clerk.accounts.dev
    clerk_issuer: str

    # --- CORS ---
    # Comma-separated list of allowed origins, e.g. the Vite dev server.
    cors_origins: str = "http://localhost:5173"

    # --- Storage ---
    # e.g. postgresql://postgres:postgres@localhost:5432/saksham
    database_url: str

    @property
    def clerk_jwks_url(self) -> str:
        return f"{self.clerk_issuer.rstrip('/')}/.well-known/jwks.json"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
