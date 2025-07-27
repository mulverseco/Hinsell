from django.apps import AppConfig


class MedicalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.medical'

    def ready(self):
        import apps.medical.signals