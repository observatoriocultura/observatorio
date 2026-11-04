# observatorio

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Deploy automatico en GitHub Pages

Cada `git push origin main` ejecuta el workflow `.github/workflows/deploy-pages.yml`, compila el proyecto y publica la carpeta `dist` en GitHub Pages.

Para activarlo una sola vez en GitHub:

1. Ve a `Settings > Pages` del repositorio.
2. En `Build and deployment > Source`, selecciona `GitHub Actions`.
3. En `Settings > Secrets and variables > Actions`, crea estas variables del repositorio:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_RECAPTCHA_SITE_KEY`

Despues de guardar los cambios, ejecuta:

```sh
git add .github/workflows/deploy-pages.yml README.md
git commit -m "ci: deploy automatically to GitHub Pages"
git push origin main
```

El sitio quedara disponible en `https://observatoriocultura.github.io/observatorio/` cuando termine la ejecucion del workflow.

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Dominios de correo permitidos en autenticación

La lista se edita en `supabase/config/registration-policy.json`, en `allowedEmailDomains`.
Escribe dominios completos sin `@`, por ejemplo `gmail.com`. La comparación es exacta:
autorizar `scrd.gov.co` no autoriza sus subdominios ni dominios con un sufijo adicional.

`src/lib/authEmailPolicy.js` comparte esta configuración entre los formularios de registro,
ingreso con contraseña, Magic Link, recuperación de contraseña e invitación administrativa.
En producción, los cambios del JSON requieren compilar y publicar de nuevo la aplicación.

Esta validación del navegador no restringe las llamadas directas a Supabase. Para completar
la restricción de registro se debe configurar el hook **Before User Created** en Supabase Auth
y sincronizar su lista de dominios con este JSON al desplegar. El hook aún no está configurado
por estos cambios. Para restringir también cuentas existentes y cambios de correo se necesitan
controles de servidor adicionales; el hook solo controla la creación de usuarios.

Referencia: https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook

Pruebas de la política de correo:

```sh
node --test tests/auth-email-policy.test.js
```
