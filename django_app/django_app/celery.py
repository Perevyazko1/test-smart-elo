import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_app.settings')

REDIS_HOST = os.environ.get('REDIS_HOST', 'elo_redis')

app = Celery('django_app', broker=f'redis://{REDIS_HOST}:6379/0')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()
