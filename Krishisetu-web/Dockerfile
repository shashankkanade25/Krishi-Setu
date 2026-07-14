FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && \
    npm cache clean --force

COPY . .

EXPOSE 5000

CMD ["npm","start"]
