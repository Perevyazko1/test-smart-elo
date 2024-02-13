import os

from django.conf import settings

from core.models import Fabric, ProductPicture


def init_data():
    """Функция для активации скриптов через вызов url /init"""
    print('ИНИЦИАЛИЗАЦИЯ ФУНКЦИИ')
    thumbnails_dir = os.path.join(settings.MEDIA_ROOT, 'images/products/thumbnails/')
    print(thumbnails_dir)
    thumbnails_files = set(os.listdir(thumbnails_dir))
    print(thumbnails_files)

    # Получаем список имен файлов из объектов модели
    used_filenames = set()
    for model in [Fabric, ProductPicture]:
        for obj in model.objects.all():
            if obj.thumbnail:
                used_filenames.add(os.path.basename(obj.thumbnail.name))

    # Определяем файлы, которые не используются и можно удалить
    unused_files = thumbnails_files - used_filenames

    for filename in unused_files:
        file_path = os.path.join(thumbnails_dir, filename)
        os.remove(file_path)
        print(f"Deleted unused thumbnail: {filename}")
