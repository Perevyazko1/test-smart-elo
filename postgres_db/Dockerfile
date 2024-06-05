FROM postgres:15.7-alpine

# Изменяем права доступа и владельца
RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql/data && \
    chmod 0700 /var/lib/postgresql/data

EXPOSE 5432

USER postgres

CMD ["postgres"]