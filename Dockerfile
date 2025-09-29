
# Etapa 1: Compilar Angular
FROM node:20 AS build

WORKDIR /app

# Copiar package.json y package-lock.json primero (mejora caché)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . .

# Compilar Angular en modo producción
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Eliminar default.conf de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración de Nginx para Angular
COPY default.conf /etc/nginx/conf.d/default.conf


# Copiar los archivos compilados de Angular
COPY --from=build /app/dist/Acuaponic-Front /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
