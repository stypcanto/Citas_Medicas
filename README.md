# 🗓️ Sistema de Citas Médicas

Este proyecto es una aplicación web construida con **React**, **Vite** y **Tailwind CSS**, empaquetada con **Docker** y servida en producción usando **NGINX**.

## 🚀 Tecnologías Utilizadas

- [React 19](https://react.dev/)
- [Vite 7](https://vitejs.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PostCSS + Autoprefixer](https://github.com/postcss/postcss)

---

## 📁 Estructura del Proyecto

```bash
mi-proyecto-citas/
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── Dockerfile
├── docker-compose.yml
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── vite.config.js
└── README.md

```


---

## ⚙️ Instalación en Desarrollo

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd mi-proyecto-citas

```bash 
npm install
```

2. Ejecuta el servidor de desarrollo:

```bash 
npm run dev

```

Accede a la aplicación en http://localhost:5173

## 🎨 Configuración de Tailwind CSS

Se creó la configuración ejecutando:

```bash
npx tailwindcss init -p
````

📄 tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

```

🧾 src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

```

## 🐳 Docker y Producción

### 🛠 Dockerfile

Se configuró para construir la aplicación con `vite build` y servirla usando **NGINX**:

# Etapa 1: Build con Node
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Etapa 2: Servir con NGINX
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80


```

### 🧩 docker-compose.yml

services:
  react-app:
    build: .
    ports:
      - "5173:80"
    container_name: citas_react_app


```

### ▶️ Ejecutar en Producción

1. Para construir y levantar el contenedor:

```bash
docker-compose up --build
```

2. Para detener y eliminar los contenedores:

```bash
docker compose down
```

Una vez iniciado, abre tu navegador en:

http://localhost:5173
