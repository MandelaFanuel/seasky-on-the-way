# ========================= apps/accounts/middleware.py =========================
"""
Middleware pour le logging des requêtes.
"""

import logging
import time

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    """
    Middleware pour logger toutes les requêtes HTTP.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Temps de début
        start_time = time.time()
        
        # Log de la requête entrante
        logger.info(
            f"Requête: {request.method} {request.path} "
            f"IP: {self.get_client_ip(request)} "
            f"User-Agent: {request.META.get('HTTP_USER_AGENT', '')}"
        )
        
        # Traiter la requête
        response = self.get_response(request)
        
        # Calcul du temps de réponse
        duration = time.time() - start_time
        
        # Log de la réponse
        logger.info(
            f"Réponse: {request.method} {request.path} "
            f"Status: {response.status_code} "
            f"Durée: {duration:.3f}s"
        )
        
        return response
    
    def get_client_ip(self, request):
        """Extrait l'adresse IP du client."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip