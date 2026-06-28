FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY index.js ./
COPY src ./src

# Instalar wait-port globalmente
RUN npm install -g wait-port
RUN npm install -g nodemon

# Comando modificado para esperar a PostgreSQL
CMD ["sh", "-c", "wait-port postgres_db:5432 && npm run dev"]