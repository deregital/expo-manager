# Expo Manager

## Descripción

Este es un dashboard en donde se van a poder visualizar los datos de los usuarios que se encuentran en la base de datos de la aplicación Expo Manager.

## Instalación

Para poder instalar el proyecto se debe de clonar el repositorio y correr el siguiente comando:

```bash
npm install
```

Para generar los tipos de la base de datos (esto se tendrá que hacer cada vez que se crea una rama):

```bash
npx prisma db push
npx prisma generate
```

Para correr el proyecto:

```bash
npm run dev
```
