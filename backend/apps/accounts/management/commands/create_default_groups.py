from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

class Command(BaseCommand):
    help = 'Crée les groupes par défaut et les permissions'

    def handle(self, *args, **options):
        groups_permissions = {
            'Administrateurs': ['add_user', 'change_user', 'delete_user', 'view_user'],
            'Fournisseurs': ['add_product', 'change_product', 'view_product'],
            'Livreurs': ['view_order', 'change_order_status'],
            'Commerçants': ['add_product', 'change_product', 'view_product', 'view_order'],
            'Clients': ['view_product', 'add_order'],
        }
        
        for group_name, perm_codenames in groups_permissions.items():
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Groupe créé: {group_name}'))
        
        self.stdout.write(self.style.SUCCESS('✅ Groupes par défaut configurés'))