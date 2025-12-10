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

**IMPORTANTE:** Si tienes una variable `PUPPETEER_SKIP_DOWNLOAD`, elimínala o configúrala como `false`.

### Health Check

**Health Check Path:** `/health`

Esto permite a Render verificar que el servicio está funcionando correctamente.

## Keep-Alive Configuration

El plan Free de Render hiberna servicios después de 15 minutos de inactividad. Para mantenerlo activo:

### Configurar Cron Job (Gratis)

**Opción 1: cron-job.org (Sin registro)**

1. Ve a https://cron-job.org
2. Click en "Create cronjob"
3. Configuración:
   - **Title:** `Render Keep-Alive - PDF Service`
   - **URL:** `https://cotiza-pdf-service.onrender.com/health`
   - **Schedule:** Every 14 minutes
   - **Request method:** GET
   - **Timeout:** 30 segundos
4. Click "Create cronjob"

**Opción 2: UptimeRobot (Con cuenta)**

1. Crea cuenta en https://uptimerobot.com
2. Add New Monitor:
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://cotiza-pdf-service.onrender.com/health`
   - **Monitoring Interval:** 5 minutes

### Verificar que Funciona

- Ve a Render logs y verifica requests cada 14 minutos a `/health`
- El servicio responderá instantáneamente (sin 50+ segundos de espera)

## Troubleshooting

### Error: "Could not find Chrome"

**Causa:** Puppeteer no descargó Chrome durante `npm install`.

**Solución:**
- Verifica que NO tengas `PUPPETEER_SKIP_DOWNLOAD=true` en variables de entorno
- Asegúrate de que `PUPPETEER_CACHE_DIR=/opt/render/project/puppeteer` esté configurado
- El script `postinstall` en package.json descarga Chrome automáticamente

### Error: "Timed Out" durante deploy

**Causa:** Puppeteer está descargando Chrome por primera vez (~150MB).

**Solución:**
- Espera pacientemente 5-10 minutos
- Verifica en logs que veas: `> pdf-service@1.0.0 postinstall`
- Los deploys subsecuentes serán más rápidos gracias al cache

### Error: "Unauthorized"

**Causa:** El token no coincide entre Render y Vercel.

**Solución:**
- Verifica que `PDF_SERVICE_TOKEN` sea IGUAL en Render y Vercel
- El header debe ser `X-PDF-SERVICE-TOKEN` (case-sensitive)

### Servicio se duerme / Error 504

**Causa:** Render hiberna servicios inactivos después de 15 minutos.

**Solución:**
- Configura keep-alive con cron-job.org (ver sección arriba)
- Verifica que el cron job esté activo y funcionando

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
