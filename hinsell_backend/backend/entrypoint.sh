#!/bin/bash

docker exec pharsy_backend python manage.py Initial_data \
        --company-name='Mulverse' \
        --branch-name='Mulverse - Main Branch' \
        --accounts-csv='apps/core_apps/services/management/commands/accounts.csv' \
        --items-csv='apps/core_apps/services/management/commands/items.csv' \
        --reports-csv='apps/core_apps/services/management/commands/reports.csv' \
        --batch-size=5000 \
        --skip-errors
