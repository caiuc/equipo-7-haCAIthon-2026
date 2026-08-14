FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=development

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --include=optional

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
