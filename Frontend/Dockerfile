# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app

# Catch the argument from docker-compose
ARG VITE_API_URL

# Set it as an environment variable for the build process
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build


# Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
