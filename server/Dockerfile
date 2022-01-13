FROM node:14.14-alpine

#PM2 will be used as PID 1 process
RUN npm install pm2 -g

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium \
    && npm install puppeteer@1.10.0

WORKDIR /app
COPY . .
RUN npm i --production
CMD ["pm2-runtime", "pm2.config.js"]