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
