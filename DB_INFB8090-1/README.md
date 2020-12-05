# DB_INFB8090-1

La presente librería crea y pobla una base de datos **PostgreSQL** con países y sus respectivos indicadores económicos.

## Requerimientos

| Nombre     | Versión            | Comentarios                                                                                               |
| ---------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| PostgreSQL | >11.x              |                                                                                                           |
| Node.js    | >11 y <=14 (ideal) | Una versión mayor a la 14 es soportada, pero la base de datos no se creará/eliminará de manera automática |

## Instalación

1. Clonar el proyecto y ejecutar:

    ```bash
    npm install
    ```

## Uso

Para compilar:

```bash
npm run build
```

Para ejecutar lint:

```bash
npm run lint
```

Para iniciar en modo desarrollo:

```bash
npm run serve
```

## ENV File

| Variable     | Descripción                                                  |
| ------------ | ------------------------------------------------------------ |
| DEBUG        | Modo debug, algunos logs no serán enviados entre otros comportamientos |
| LOGS_LEVEL   | Nivel de los logs a ser mostrados, se utiliza de referencia los niveles establecidos por la librería [winston](https://github.com/winstonjs/winston#Logging%20Levels) para node |
| NODE_ENV     | Tipo de *environment*                                        |
| PG_HOST      | Dirección en la cual se encuentra la base de datos           |
| PG_PORT      | Puerto en el cual se encuentra la base datos                 |
| PG_DATABASE  | Nombre de la base de datos a ser utilizada                   |
| PG_USER      | Usuario de la base datos                                     |
| PG_PASSWORD  | Contraseña de la base datos                                  |
