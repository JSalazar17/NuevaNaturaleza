# Etapa de construcción
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build -- --project Acuaponic-Front --configuration production  

# Etapa de servidor Nginx
FROM nginx:alpine

# Copiamos el archivo de configuración personalizado
COPY default.conf /etc/nginx/conf.d/default.conf

# Copiamos el build correcto de Angular (AJUSTA SI ES NECESARIO)
COPY --from=build /app/dist/Acuaponic-Front/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
