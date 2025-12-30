# ========================= apps/wallet/utils.py =========================
def normalize_phone_as_wallet_address(phone: str) -> str:
    """
    Même logique que ton accounts/serializers.py (_normalize_phone)
    - digits only
    - retire préfixe 257 si présent
    """
    if not phone:
        return ""
    cleaned = str(phone).strip()
    digits = "".join(ch for ch in cleaned if ch.isdigit())
    if digits.startswith("257") and len(digits) >= 11:
        digits = digits[3:]
    return digits
