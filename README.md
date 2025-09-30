# EQ PRODUCTION
 
# Проект электронной очереди

## Список ПО для разработки:
1. Python 3.12
2. Node.js
3. Docker

## Список ПО для запуска проекта:
1. Docker

## Полезные команды
Запуск docker-compose dev файла:

```bash

docker compose -f docker-compose-dev.yml up --build -d
```

Препрод версия:
```bash

docker-compose -f docker-compose-preprod.yml up -d --build
```

Миграции на проде
```bash

docker exec -it elo_server python3 manage.py migrate
```

#### REDIS Очистка
```bash 
  redis-cli
  FLUSHALL 
```

#### run command
```bash 
  docker exec -it server 
```

#### example command
```bash 
docker exec -it server python3 manage.py makemigrations
docker exec -it server python3 manage.py migrate
```

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

## Выпуск обновления
1. Делаем новый билд проекта
`npm run build`

2. В ручную добавляем в GIT новые файлы после билда

3. Пушим обновленный проект на GIT 

4. На сервере через терминал заходим в папку с проектом и обновляем версию:
`git pull`

5. Запускаем пересборку контейнеров:
`docker compose up --build -d`

## Восстановление БД

Выбираем файл образа
Ставим clean before restore и ставим все галочки в Do not save