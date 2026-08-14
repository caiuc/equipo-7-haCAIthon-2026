FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "dev"]