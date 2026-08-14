FROM node:20-alpine

WORKDIR /app

# Copy everything, including local node_modules
COPY . .

# Generate Prisma client and build Next.js
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy || true && npm run start"]