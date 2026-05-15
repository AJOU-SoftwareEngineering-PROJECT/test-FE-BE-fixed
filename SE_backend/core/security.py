from fastapi import Depends


def get_current_user() -> int:
    """Return the current authenticated user's ID.

    This is currently a placeholder returning a fixed user id.
    Replace this with actual authentication logic, for example JWT token
    extraction via an OAuth2 dependency.
    """
    return 1
