FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Terima nilai dari docker-compose build args
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
# Jadikan ENV agar Next.js bisa membacanya saat `npm run build`
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
