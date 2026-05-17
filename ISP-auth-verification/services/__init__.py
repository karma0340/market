"""Services package — ISP auth API clients."""

from .jio_api import JioAuthAPI, jio_client
from .airtel_api import AirtelAuthAPI, airtel_client
from .number_validator_api import NumberValidatorAPI, number_validator_client
from .vi_api import VIAuthAPI, vi_client

__all__ = [
    "JioAuthAPI",
    "jio_client",
    "AirtelAuthAPI",
    "airtel_client",
    "NumberValidatorAPI",
    "number_validator_client",
    "VIAuthAPI",
    "vi_client",
]
