#!/bin/bash
cd /home/ubuntu/proj/backend/hospitality-guardian-backend 
git pull origin main
npm install
pm2 restart hospitality-guardian-backend
