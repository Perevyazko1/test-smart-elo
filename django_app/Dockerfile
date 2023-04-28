FROM python:3.11

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY req.txt .

RUN pip install --upgrade pip
RUN pip install --trusted-host pypi.python.org -r req.txt

COPY . /app

EXPOSE 8000
