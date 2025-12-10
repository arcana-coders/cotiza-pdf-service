# Configuración de Render para PDF Service

## Configuración Requerida en Render

### Build & Deploy

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### Variables de Entorno

Agrega estas variables en Render Dashboard → Environment:

- `NODE_ENV` = `production`
- `PDF_SERVICE_TOKEN` = `de288940-1f5d-431f-8213-62148d98acf4` (o tu token personalizado)
- `PUPPETEER_SKIP_DOWNLOAD` = `false` (para asegurar que descargue Chrome)

### Health Check

**Health Check Path:** `/health`

Esto permite a Render verificar que el servicio está funcionando correctamente.

## Troubleshooting

### Error: "Timed Out" durante deploy

**Causa:** Puppeteer está descargando Chrome por primera vez, lo cual puede tardar varios minutos.

**Solución:**
- Asegúrate de que el Build Command incluya `npm run build`
- Espera pacientemente el primer deploy (puede tardar 5-10 minutos)
- Los deploys subsecuentes serán más rápidos gracias al cache

### Error: "Logo not found"

**Causa:** Falta la carpeta `public/` con el logo.

**Solución:** La carpeta `public/logo.png` debe existir en el repo.

### Servicio se duerme después de 15 minutos

**Solución:** Configurar un keep-alive con cron-job.org haciendo ping a `/health` cada 14 minutos.

## Estructura de Archivos Necesaria

```
pdf-service/
├── src/
│   ├── index.ts
│   ├── pdf/
│   │   └── generator.ts
│   ├── shared/
│   │   ├── schemas.ts
│   │   └── types.ts
│   └── templates/
│       └── quotation.hbs
├── public/
│   └── logo.png          ← ¡REQUERIDO!
├── .puppeteerrc.cjs      ← Optimiza instalación de Chrome
├── package.json
└── tsconfig.json
```
