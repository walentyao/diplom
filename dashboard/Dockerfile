FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

# Копируем собранные статические файлы в директорию Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Копируем конфигурацию Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]