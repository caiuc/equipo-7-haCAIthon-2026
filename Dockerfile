FROM node:20-alpine

WORKDIR /app

# Install app dependencies (including dev deps for prisma/migrations)
COPY package.json package-lock.json* ./
RUN npm install

# Copy project files
COPY . .

# Generate Prisma client and build the Next.js app
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy || true && npm run start"]
