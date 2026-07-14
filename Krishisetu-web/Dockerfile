
FROM node:20-bookworm-slim


WORKDIR /app

COPY package*.json ./


RUN npm ci --omit=dev && \
    npm cache clean --force

COPY . .

USER node


RUN npm install

COPY . .


EXPOSE 5000

CMD ["npm","start"]
