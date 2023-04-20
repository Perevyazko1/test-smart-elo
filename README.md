# EQ PRODUCTION
 
# Проект электронной очереди

## Список ПО для разработки:
1. Python 3.11
2. Node.js
3. Docker

## Список ПО для запуска проекта:
1. Docker

## Полезные команды
Создание виртуального окружения: 

`python -m venv venv`

Активация виртуального окружения (из папки с venv):

`venv/scripts/activate`

Бекап зависимостей:

`pip freeze > req.txt` 

Установка зависимостей из файла:

`pip install -r req.txt .`

Поднять проект в docker:

`docker-compose up -d`

Удалить папку из GIT

`git rm -r --cached django-app/app/users/migrations`