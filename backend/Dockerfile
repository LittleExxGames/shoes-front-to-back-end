# syntax=docker/dockerfile:1

FROM node:18-alpine3.19
# WORKDIR /app
COPY . .
RUN npm install --only=production
CMD ["npm", "run", "start"]
EXPOSE 3001