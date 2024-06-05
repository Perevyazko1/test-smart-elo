#!/bin/bash
chmod 0700 /var/lib/postgresql/data
exec "$@"