#!/usr/bin/env python
"""
Script de test pour vérifier l'utilisateur dans la base de données
"""
import os
import django
import sys

# Ajouter le chemin du projet
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# CORRECTION: Utiliser le bon module de settings
# 'seasky.settings' au lieu de 'seasky.settings.local'
os.environ['DJANGO_SETTINGS_MODULE'] = 'seasky.settings'

django.setup()

from apps.accounts.models import CustomUser
from django.contrib.auth import authenticate

def check_user(username="fanuel045", password="414141"):
    print("=" * 60)
    print("VÉRIFICATION DE L'UTILISATEUR DANS LA BASE DE DONNÉES")
    print("=" * 60)
    
    try:
        # Vérifier la connexion DB d'abord
        from django.db import connection
        connection.ensure_connection()
        print("✓ Connexion à la base de données OK")
        
        # Compter les utilisateurs
        count = CustomUser.objects.count()
        print(f"✓ Nombre total d'utilisateurs: {count}")
        
        # Chercher l'utilisateur
        user = CustomUser.objects.filter(username=username).first()
        
        if user:
            print(f"\n✓ Utilisateur '{username}' trouvé:")
            print(f"  ID: {user.id}")
            print(f"  Email: {user.email or 'Non défini'}")
            print(f"  Phone: {user.phone or 'Non défini'}")
            print(f"  Is active: {user.is_active}")
            print(f"  Is staff: {user.is_staff}")
            print(f"  Is superuser: {user.is_superuser}")
            print(f"  Account type: {user.account_type}")
            
            # Tester l'authentification
            print(f"\n🔐 Test d'authentification:")
            
            # Méthode 1: Vérifier le mot de passe directement
            if user.check_password(password):
                print(f"  ✓ Mot de passe CORRECT (check_password)")
            else:
                print(f"  ✗ Mot de passe INCORRECT (check_password)")
                
            # Méthode 2: Authentification Django
            auth_user = authenticate(username=username, password=password)
            if auth_user:
                print(f"  ✓ Authentification Django RÉUSSIE")
            else:
                print(f"  ✗ Authentification Django ÉCHOUÉE")
                
            # Afficher le hash pour debug
            print(f"  Hash password: {user.password[:30]}...")
            
        else:
            print(f"\n✗ Utilisateur '{username}' NON TROUVÉ")
            
        # Lister les premiers utilisateurs
        print(f"\n📋 Liste des {min(10, count)} premiers utilisateurs:")
        users = CustomUser.objects.all().order_by('id')[:10]
        for u in users:
            status = "✓" if u.is_active else "✗"
            print(f"  {u.id:3} {status} {u.username:20} {u.email or 'N/A':30}")
            
    except Exception as e:
        print(f"\n✗ Erreur: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_user()