FROM postgres:14

# Копируем скрипт для исправления прав
COPY fix-permissions.sh /usr/local/bin/fix-permissions.sh

# Даем скрипту права на выполнение
RUN chmod +x /usr/local/bin/fix-permissions.sh

# Переходим на пользователя postgres
USER postgres

# Используем наш скрипт как entrypoint
ENTRYPOINT ["/usr/local/bin/fix-permissions.sh"]

# Запускаем PostgreSQL
CMD ["postgres"]