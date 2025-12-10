# Cotiza PDF Service

Microservicio Node.js para generar PDFs de cotizaciones usando Puppeteer. Este servicio se despliega en Render.com y es consumido por la aplicación principal en Vercel.

## 🏗️ Arquitectura

```
┌─────────────────┐
│   cotiza-web    │  (Vercel - Next.js)
│   /api/         │
│   generate-pdf  │
└────────┬────────┘
         │ POST + Token
         ▼
┌─────────────────┐
│  pdf-service    │  (Render.com - Node.js + Express)
│  + Puppeteer    │
│  + Chrome       │
└─────────────────┘
         │
         ▼
     PDF Binary
```

## 📦 Stack Tecnológico

- **Node.js 22** - Runtime
- **TypeScript** - Lenguaje
- **Express 5** - Framework web
- **Puppeteer 24** - Generación de PDFs con Chrome
- **Handlebars** - Template engine
- **Zod** - Validación de datos

## 🚀 Deploy en Render.com

### 1. Crear Servicio en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta el repo: `arcana-coders/cotiza-pdf-service`
4. Configuración:
   - **Name:** `cotiza-pdf-service`
   - **Region:** Oregon (US West) o el más cercano
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### 2. Variables de Entorno

Agrega estas variables en Render → Environment:

```bash
NODE_ENV=production
PDF_SERVICE_TOKEN=<genera-un-token-seguro>
PUPPETEER_CACHE_DIR=/opt/render/project/puppeteer
```

**Importante:**
- NO agregues `PUPPETEER_SKIP_DOWNLOAD` (o configúrala como `false`)
- El token debe ser el mismo que uses en `PDF_SERVICE_TOKEN` en Vercel

### 3. Health Check (Opcional pero Recomendado)

- **Health Check Path:** `/health`
- **Health Check Interval:** 60 segundos

### 4. Primer Deploy

- El primer deploy tardará **5-10 minutos** (Puppeteer descarga Chrome ~150MB)
- Los deploys subsecuentes serán más rápidos gracias al cache
- Verifica en logs que veas: `PDF Service running on port 10000`

## 🔄 Keep-Alive (Evitar que se Duerma el Servicio)

Render Free tier hiberna servicios después de 15 minutos de inactividad. Para mantenerlo activo:

### Opción 1: Cron-Job.org (Recomendado - Gratis)

1. Ve a [cron-job.org](https://cron-job.org)
2. Click en **"Create cronjob"**
3. Configuración:
   - **Title:** `Render Keep-Alive - PDF Service`
   - **URL:** `https://cotiza-pdf-service.onrender.com/health`
   - **Schedule:** Every 14 minutes (`*/14 * * * *`)
   - **Request method:** GET
   - **Timeout:** 30 segundos
4. Click en **"Create cronjob"**

### Opción 2: UptimeRobot (Con cuenta)

1. Crea cuenta en [uptimerobot.com](https://uptimerobot.com)
2. Add New Monitor:
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://cotiza-pdf-service.onrender.com/health`
   - **Monitoring Interval:** 5 minutes

## 📡 API

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "pdf-service"
}
```

### `POST /generate-pdf`

Genera un PDF a partir de datos de cotización.

**Headers:**
```
Content-Type: application/json
X-PDF-SERVICE-TOKEN: <tu-token>
```

**Body:**
```json
{
  "quotationData": {
    "cliente": "Empresa ABC",
    "fecha": "2024-12-10",
    "folio": "COT-001",
    "secciones": [
      {
        "titulo": "Desarrollo",
        "items": [
          {
            "clave": "DEV-001",
            "descripcion": "Desarrollo web",
            "cantidad": 10,
            "precioUnitario": 500
          }
        ]
      }
    ],
    "notas": ["60% anticipo, 40% contra entrega"]
  }
}
```

**Response:**
- **Success (200):** PDF binary con headers:
  ```
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="COT-001_Empresa_ABC.pdf"
  ```
- **Error (400):** Datos inválidos
- **Error (401):** Token inválido
- **Error (500):** Error interno al generar PDF

## 🛠️ Desarrollo Local

### Requisitos

- Node.js 18+
- Chrome instalado (Puppeteer lo usa)

### Setup

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Desarrollo con hot-reload
npm run dev

# Producción
npm start
```

### Variables de Entorno Locales

Crea `.env` (no commitear):

```bash
PORT=3001
NODE_ENV=development
PDF_SERVICE_TOKEN=test-token-local
```

### Probar Localmente

```bash
# Health check
curl http://localhost:3001/health

# Generar PDF
curl -X POST http://localhost:3001/generate-pdf \
  -H "Content-Type: application/json" \
  -H "X-PDF-SERVICE-TOKEN: test-token-local" \
  -d '{"quotationData": {...}}' \
  --output test.pdf
```

## 📁 Estructura del Proyecto

```
pdf-service/
├── src/
│   ├── index.ts              # Entrypoint - Express server
│   ├── pdf/
│   │   └── generator.ts      # Lógica de generación de PDF
│   ├── shared/
│   │   ├── schemas.ts        # Validación con Zod
│   │   └── types.ts          # Tipos TypeScript
│   └── templates/
│       └── quotation.hbs     # Template HTML del PDF
├── public/
│   └── logo.png              # Logo embebido en el PDF
├── .puppeteerrc.cjs          # Configuración de Puppeteer
├── tsconfig.json             # Configuración de TypeScript
├── package.json              # Dependencias y scripts
├── RENDER_CONFIG.md          # Guía de configuración de Render
└── README.md                 # Este archivo
```

## 🐛 Troubleshooting

### Error: "Could not find Chrome"

**Causa:** Puppeteer no descargó Chrome durante `npm install`.

**Solución:**
1. Verifica que NO tengas `PUPPETEER_SKIP_DOWNLOAD=true` en variables de entorno
2. El script `postinstall` en `package.json` debería ejecutarse automáticamente
3. Verifica en logs de Render que veas: `> pdf-service@1.0.0 postinstall`

### Error: "Timed Out" durante deploy

**Causa:** Puppeteer está descargando Chrome por primera vez.

**Solución:**
- Espera pacientemente 5-10 minutos
- Los siguientes deploys serán más rápidos

### Servicio se duerme / Error 504

**Causa:** Render hiberna servicios inactivos en plan Free.

**Solución:**
- Configura keep-alive con cron-job.org (ver sección arriba)
- Verifica que el cron job esté funcionando correctamente

### Error: "Unauthorized"

**Causa:** El token no coincide o falta el header.

**Solución:**
- Verifica que `PDF_SERVICE_TOKEN` sea igual en Render y Vercel
- Asegúrate de enviar header `X-PDF-SERVICE-TOKEN` en las requests

## 📊 Costos

**100% GRATIS** usando:
- ✅ Render Free Tier: 750 horas/mes (suficiente para 24/7 con keep-alive)
- ✅ Cron-Job.org: Gratis, sin límites
- ✅ 100GB bandwidth/mes en Render (más que suficiente)

Un PDF pesa ~500KB, así que en 100GB caben **~200,000 PDFs/mes**.

## 📝 Licencia

ISC
