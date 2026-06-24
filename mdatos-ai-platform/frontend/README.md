# MDatos-Bioinformatica Web

Frontend del portal MDatos-Bioinformatica construido con **React + Vite**.

## Stack

- React 18
- Vite 5
- CSS custom (sin framework UI)
- Deploy automático a GitHub Pages por GitHub Actions
- Deploy opcional en Vercel

## Estructura

- `src/App.jsx`: contenido principal del portal.
- `src/main.jsx`: bootstrap de React.
- `src/styles.css`: estilos globales/responsivos.
- `public/`: assets estáticos (`favicon.svg`, `robots.txt`, `sitemap.xml`).
- `.github/workflows/deploy-pages.yml`: build + publish de `dist/` a Pages.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`

## Build de producción

```bash
npm run build
npm run preview
```

## Publicación en GitHub Pages

1. En el repo, ve a **Settings > Pages**.
2. En **Source**, selecciona **GitHub Actions**.
3. Haz push a `main`.
4. El workflow compila (`npm ci`, `npm run build`) y publica `dist/`.

URL esperada:

- `https://osram90.github.io/Bioinformatic-MDatos/`

## Publicación en Vercel

1. Importa el repo en Vercel.
2. Framework detectado: **Vite**.
3. Deploy.

## Configuración importante

- `vite.config.js` usa `base: '/Bioinformatic-MDatos/'` para que GitHub Pages cargue assets correctamente.
- El formulario de contacto usa placeholder Formspree y debes reemplazar `your-form-id` en `src/App.jsx`.
