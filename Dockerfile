
# Используем Node.js 18 на Alpine Linux (маленький образ)
FROM node:18-alpine

# Устанавливаем FFmpeg для монтажа видео
RUN apk add --no-cache ffmpeg

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем весь код
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]
                