# Procesador de Facturas - Cliente Web

Este proyecto es una interfaz web moderna para subir facturas (PDF o Imágenes) y enviarlas automáticamente al webhook de procesamiento.

## Configuración

1.  Asegúrate de estar en el directorio `web-app`:
    ```bash
    cd web-app
    ```

2.  Instala las dependencias (si no se instalaron automáticamente):
    ```bash
    npm install
    ```

## Ejecución

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Funcionalidades

-   **Subida de Archivos**: Arrastra y suelta o selecciona archivos PDF/Imagen.
-   **Envío Automático**: Los archivos se envían al webhook configurado (`https://coy-personal-n8n.l2p5bx.easypanel.host/webhook/procesador-facturas`).
-   **Interfaz Moderna**: Diseño oscuro, limpio y responsivo.

## Despliegue a Producción (Netlify)

Para subir esta aplicación a internet y que cualquiera pueda usarla, la mejor opción es usar **Netlify** o **Vercel** conectados a un repositorio de **GitHub**.

Sigue estos pasos detallados:

### Paso 1: Preparar el Código (Ya realizado)
El proyecto ya tiene un repositorio Git inicializado localmente. Solo necesitamos guardar los cambios.

### Paso 2: Crear un Repositorio en GitHub
1.  Ve a [GitHub.com](https://github.com) e inicia sesión (crea una cuenta si no tienes).
2.  Haz clic en el botón **"New"** (Nuevo) o ve a [github.com/new](https://github.com/new).
3.  Ponle un nombre al repositorio, por ejemplo: `automatizador-facturas-web`.
4.  Déjalo en **Public** (Público) o **Private** (Privado) según prefieras.
5.  **NO** marques ninguna casilla de "Initialize this repository with..." (ni README, ni .gitignore).
6.  Haz clic en **"Create repository"**.

### Paso 3: Subir el Código a GitHub
Copia la URL de tu nuevo repositorio (será algo como `https://github.com/TU_USUARIO/automatizador-facturas-web.git`).

Abre una terminal en la carpeta `web-app` y ejecuta estos comandos (reemplaza la URL por la tuya):

```bash
# Agrega todos los archivos al control de versiones
git add .

# Guarda los cambios con un mensaje
git commit -m "Primera versión lista para producción"

# Renombra la rama principal a 'main'
git branch -M main

# Conecta tu carpeta local con el repositorio de GitHub (¡CAMBIA LA URL!)
git remote add origin https://github.com/TU_USUARIO/automatizador-facturas-web.git

# Sube los archivos
git push -u origin main
```

### Paso 4: Conectar con Netlify
1.  Ve a [Netlify.com](https://www.netlify.com) e inicia sesión.
2.  Haz clic en **"Add new site"** > **"Import an existing project"**.
3.  Selecciona **"GitHub"**.
4.  Busca y selecciona el repositorio que acabas de crear (`automatizador-facturas-web`).
5.  En la configuración de despliegue ("Build settings"):
    *   **Build command**: `npm run build` (debería estar automático)
    *   **Publish directory**: `.next` (o déjalo como lo detecte Netlify, usualmente `.next` para Next.js)
6.  Haz clic en **"Deploy site"**.

¡Listo! Netlify te dará una URL (ej. `https://tu-sitio.netlify.app`) donde tu aplicación estará funcionando.

