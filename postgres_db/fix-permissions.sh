#!/bin/bash

# Изменение прав доступа
chmod 0700 /var/lib/postgresql/data

# Запуск PostgreSQL
exec "$@"