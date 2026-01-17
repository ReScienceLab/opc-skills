#!/usr/bin/env python3
"""
ProductHunt API credential management.
Reads from environment: PRODUCTHUNT_ACCESS_TOKEN
"""
import os


def get_access_token() -> str | None:
    """Get ProductHunt access token"""
    return os.environ.get("PRODUCTHUNT_ACCESS_TOKEN")


def has_token() -> bool:
    """Check if access token is available"""
    return get_access_token() is not None
