<<<<<<< HEAD
FROM node:20-bookworm-slim
=======
FROM node:20
>>>>>>> b134b09 (Resolve merge conflicts)

WORKDIR /app

COPY package*.json ./

<<<<<<< HEAD
RUN npm ci --omit=dev && \
    npm cache clean --force

COPY . .

USER node

=======
RUN npm install

COPY . .

>>>>>>> b134b09 (Resolve merge conflicts)
EXPOSE 5000

CMD ["npm","start"]
