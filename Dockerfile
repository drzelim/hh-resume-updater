FROM node:18
WORKDIR /app
COPY *.json ./
COPY *.js ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt update
RUN apt install -y chromium
# RUN apt-get install -y xvfb
# RUN export DISPLAY=:0
# RUN /usr/bin/Xvfb :0 -screen 0 1024x768x24 &
RUN npm i
