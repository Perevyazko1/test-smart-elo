# SZMK Site Server

## About

### Stack
- fastAPI
- SQLAlchemy
- alembic
- pytest
- docker


## Commands
### BASE
#### venv
`python3 -m venv venv`  
#### install packages
`pip install -r requirements.txt`

### RUN
#### Server
`uvicorn app.main:app --reload`

#### Test
`pytest`

### Alembic
#### init
`alembic init -t async migrations`
#### new migration
`alembic -n devdb revision --autogenerate -m "initial"`
#### update
`alembic -n devdb upgrade head`
#### downgrade
`alembic -n devdb downgrade -1`
