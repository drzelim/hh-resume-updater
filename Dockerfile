FROM node:20
WORKDIR /app
COPY *.json ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt update
RUN apt install -y chromium
RUN npm ci
