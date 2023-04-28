# EQ PRODUCTION
 
# Проект электронной очереди

## Список ПО для разработки:
1. Python 3.11
2. Node.js
3. Docker

## Список ПО для запуска проекта:
1. Docker

## Полезные команды
Запуск docker-compose dev файла:

`docker compose -f docker-compose-dev.yml up --build -d`

Создание виртуального окружения: 

`python -m venv venv`

Активация виртуального окружения (из папки с venv):

`venv/scripts/activate`

Бекап зависимостей:

`pip freeze > req.txt` 

Установка зависимостей из файла:

`pip install -r req.txt .`

Поднять проект в docker:

`docker-compose up --build -d`

Удалить папку из GIT

`git rm -r --cached django-app/app/users/migrations`

## Обновление на сервере
1. Открываешь PowerShell -> Заходим в папку с проектом -> Вводим команду:

`git pull`

2. Проверяем установленные переменные среды
3. Останавливаем контейнер:

`docker compose down`

4. Запускаем сборку контейнеров:

`docker compose up --build -d`

## Запуск периодических задач:
1. Предварительно:
`pip install gevent`

2. В отдельном терминале:
`celery -A django_app worker -l info -P gevent`

3. Еще в отдельном терминале:
`celery -A django_app beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler`