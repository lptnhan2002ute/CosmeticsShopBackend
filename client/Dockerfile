
FROM node:14-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN  npm install --production
COPY . .
RUN npm run build

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]