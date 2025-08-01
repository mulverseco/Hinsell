FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt


COPY . .


EXPOSE 8000


CMD ["sh", "-c", "\
    echo 'Running migrations...' && \
    python manage.py makemigrations && \
    python manage.py migrate && \
    echo 'Collecting static files...' && \
    python manage.py collectstatic --noinput && \
    echo 'Creating superuser...' && \
    python manage.py shell -c \"from apps.authentication.models import User; User.objects.filter(email='admin@hinsell.com').exists() or User.objects.create_superuser(email='admin@hinsell.com', password='admin')\" && \
    echo 'Starting uvicorn...' && \
    uvicorn core.asgi:application --host 0.0.0.0 --port 8000"]
