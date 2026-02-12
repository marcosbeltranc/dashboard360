FROM node:20-alpine

WORKDIR /app

# Copiamos explícitamente desde la raíz del contexto
COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]