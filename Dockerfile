FROM node:18
WORKDIR /app
COPY *.json ./
COPY *.js ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt update
RUN apt install -y chromium
RUN npm ci
