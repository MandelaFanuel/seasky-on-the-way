# ========================= apps/qr/utils.py =========================
import secrets
import string
from datetime import datetime, timedelta
from django.utils import timezone


def generate_random_code(length=32):
    """
    Génère un code aléatoire sécurisé pour les tokens QR.
    
    Args:
        length (int): Longueur du code (par défaut 32)
    
    Returns:
        str: Code aléatoire sécurisé
    """
    # Utiliser secrets pour une génération sécurisée
    alphabet = string.ascii_letters + string.digits + '-_'
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_qr_token():
    """
    Génère un token QR unique et sécurisé.
    
    Returns:
        str: Token QR unique
    """
    # Format: QR_{timestamp}_{random_code}
    timestamp = int(timezone.now().timestamp())
    random_code = generate_random_code(16)
    return f"QR_{timestamp}_{random_code}"


def expiry(minutes=5):
    """
    Calcule la date d'expiration à partir de maintenant.
    
    Args:
        minutes (int): Nombre de minutes avant expiration (par défaut 5)
    
    Returns:
        datetime: Date d'expiration
    """
    return timezone.now() + timedelta(minutes=minutes)


def is_token_expired(expires_at):
    """
    Vérifie si un token est expiré.
    
    Args:
        expires_at (datetime): Date d'expiration du token
    
    Returns:
        bool: True si expiré, False sinon
    """
    return timezone.now() > expires_at


def calculate_token_ttl(expires_at):
    """
    Calcule le temps restant avant expiration en secondes.
    
    Args:
        expires_at (datetime): Date d'expiration
    
    Returns:
        int: Secondes restantes avant expiration
    """
    delta = expires_at - timezone.now()
    return max(0, int(delta.total_seconds()))


def validate_token_format(token_code):
    """
    Valide le format d'un token QR.
    
    Args:
        token_code (str): Code du token à valider
    
    Returns:
        tuple: (bool, str) - (valide, message d'erreur)
    """
    if not token_code:
        return False, "Le token ne peut pas être vide"
    
    if len(token_code) < 16:
        return False, "Le token est trop court"
    
    if len(token_code) > 100:
        return False, "Le token est trop long"
    
    # Vérifier les caractères autorisés
    allowed_chars = set(string.ascii_letters + string.digits + '_-')
    if not all(c in allowed_chars for c in token_code):
        return False, "Le token contient des caractères non autorisés"
    
    return True, "Format valide"


def create_token_for_subject(subject_type, subject_id, purpose="checkin", ttl_minutes=5):
    """
    Crée un dictionnaire de données pour un nouveau token QR.
    
    Args:
        subject_type (str): Type du sujet (driver, pdv, supplier)
        subject_id (int): ID du sujet
        purpose (str): Objectif du token
        ttl_minutes (int): Durée de vie en minutes
    
    Returns:
        dict: Données du token
    """
    return {
        'code': generate_qr_token(),
        'subject_type': subject_type,
        'subject_id': subject_id,
        'purpose': purpose,
        'expires_at': expiry(ttl_minutes),
        'one_time': True,
    }


def get_subject_info_from_token(token):
    """
    Récupère les informations du sujet associé à un token.
    
    Args:
        token (QRToken): Instance du token QR
    
    Returns:
        dict: Informations sur le sujet
    """
    try:
        if token.subject_type == 'driver':
            from apps.drivers.models import Driver
            driver = Driver.objects.get(id=token.subject_id)
            return {
                'type': 'driver',
                'id': driver.id,
                'name': driver.user.full_name,
                'username': driver.user.username,
                'transport_mode': driver.transport_mode,
                'qr_code': driver.user.qr_code,
            }
        
        elif token.subject_type == 'pdv':
            from apps.pdv.models import PointDeVente
            pdv = PointDeVente.objects.get(id=token.subject_id)
            return {
                'type': 'pdv',
                'id': pdv.id,
                'name': pdv.name,
                'address': pdv.address,
                'province': pdv.province,
                'commune': pdv.commune,
            }
        
        elif token.subject_type == 'supplier':
            from apps.suppliers.models import Supplier
            supplier = Supplier.objects.get(id=token.subject_id)
            return {
                'type': 'supplier',
                'id': supplier.id,
                'name': supplier.user.full_name,
                'type': supplier.type,
                'address': supplier.address,
            }
        
        else:
            return {
                'type': token.subject_type,
                'id': token.subject_id,
                'error': 'Type de sujet non reconnu'
            }
            
    except Exception as e:
        return {
            'type': token.subject_type,
            'id': token.subject_id,
            'error': str(e)
        }


def log_scan_activity(token, user, ip_address, user_agent):
    """
    Enregistre une activité de scan avec toutes les informations.
    
    Args:
        token (QRToken): Token scanné
        user (User): Utilisateur qui scanne
        ip_address (str): Adresse IP du scanner
        user_agent (str): User Agent du scanner
    
    Returns:
        dict: Informations du scan
    """
    return {
        'token_code': token.code,
        'token_id': token.id,
        'subject_type': token.subject_type,
        'subject_id': token.subject_id,
        'purpose': token.purpose,
        'scanned_by_id': user.id,
        'scanned_by_username': user.username,
        'scanned_at': timezone.now(),
        'ip_address': ip_address,
        'user_agent': user_agent,
        'token_expires_at': token.expires_at,
        'is_one_time': token.one_time,
        'was_used_before': bool(token.used_at),
    }