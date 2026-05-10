# ERP Superior Web Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --omit=dev && npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
