# MultiShop — AI Driven E-Commerce

Plataforma de e-commerce desarrollada como Proyecto Integrador M5 en SoyHenry. Permite a clientes navegar y comprar productos, y a administradores gestionar el catálogo y las órdenes. Construida con React 18 + TypeScript + Firebase + AWS + Vercel.

**URL de producción:** https://proyecto-m5-santiago-artal.vercel.app

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Enrutamiento | React Router v7 |
| Estado global | Context API + useReducer |
| Auth y DB | Firebase Authentication + Firestore |
| Almacenamiento | AWS S3 (presigned URLs) |
| Emails | AWS SES |
| Backend serverless | Vercel Serverless Functions |
| Testing | Vitest + React Testing Library |
| Deploy | Vercel + GitHub CI/CD |

---

## Roles de usuario

- **Customer:** Navega el catálogo, agrega productos al carrito, realiza checkout, ve historial de órdenes.
- **Admin:** Todo lo anterior más CRUD de productos, upload de imágenes a S3, gestión de órdenes y cambio de estado.

El rol se asigna en Firestore al registrarse (`role: 'customer'`). Para promover un usuario a admin, cambiar manualmente el campo `role` en la colección `users` en Firebase Console.

---

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables (Navbar, ProtectedRoute, etc.)
├── config/           # Configuración de Firebase
├── constants/        # Categorías de productos
├── context/          # AuthContext, CartContext, ThemeContext, ToastContext
├── hooks/            # useAuth, useCart, useTheme, useToast, useDebounce
├── pages/
│   ├── admin/        # Dashboard (CRUD productos), AdminOrders
│   ├── auth/         # Login / Registro
│   └── customer/     # Home (catálogo), Checkout, Orders
├── services/         # Firebase, S3, SES, órdenes, productos
├── types/            # Interfaces TypeScript
api/
├── presigned-url.js  # Serverless: genera presigned URL para upload a S3
├── get-image-url.js  # Serverless: genera presigned URL para lectura de S3
└── send-email.js     # Serverless: envía email vía AWS SES
tests/
├── cartReducer.test.ts          # Tests del reducer del carrito
├── useCart.test.ts              # Tests del hook useCart
├── useAuth.test.ts              # Tests del hook useAuth
└── checkout.integration.test.tsx # Test de integración: flujo carrito → checkout
```

---

## Configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/artalcarriaga-arch/ProyectoM5_SantiagoArtal.git
cd ProyectoM5_SantiagoArtal
npm install
```

### 2. Crear archivo `.env`

Copiar `.env.example` y completar con los valores reales:

```bash
cp .env.example .env
```

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# AWS S3 - solo para Vercel Functions, no llegan al frontend
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=

# AWS SES - solo para Vercel Functions
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=
AWS_SES_VERIFIED_EMAIL=
```

### 3. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar **Authentication** → Email/password y Google
3. Crear base de datos **Firestore** en modo producción
4. Publicar las reglas de seguridad:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 4. Configurar AWS S3

1. Crear bucket en S3 (ej: `multishop-fotos`)
2. En **Permissions → CORS**, agregar:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["https://tu-dominio.vercel.app"],
    "ExposeHeaders": []
  }
]
```

3. En **Permissions → Block public access**: mantener bloqueado (las imágenes se sirven con presigned URLs)
4. Crear usuario IAM con permisos `s3:PutObject` y `s3:GetObject` sobre el bucket
5. Guardar Access Key ID y Secret Access Key

### 5. Configurar AWS SES

1. Ir a **Amazon SES** en la consola de AWS
2. En **Verified identities**, verificar el email de origen
3. Si estás en sandbox, solo puedes enviar a emails verificados
4. Para producción, solicitar salida del sandbox en **Account dashboard → Request production access**

### 6. Correr en desarrollo

```bash
npm run dev
```

> Las funciones serverless (`/api/*`) solo funcionan en Vercel. En desarrollo local, las funcionalidades de S3 y SES no están disponibles.

---

## Flujo de presigned URLs (AWS S3)

Las credenciales de AWS nunca llegan al navegador. El flujo es:

```
Frontend                    Vercel Function              AWS S3
   |                              |                         |
   |-- POST /api/presigned-url -->|                         |
   |   { fileName, contentType } |                         |
   |                              |-- Genera presigned URL->|
   |                              |<- uploadUrl + fileKey --|
   |<-- { uploadUrl, fileKey } ---|                         |
   |                              |                         |
   |-- PUT {uploadUrl} (archivo) ----------------------->  |
   |                              |                         |
   |-- POST /api/get-image-url -->|                         |
   |   { fileKey }               |                         |
   |                              |-- Genera presigned URL->|
   |<-- { imageUrl (7 días) } ----|                         |
```

1. El frontend pide una presigned URL a la Vercel Function
2. La Vercel Function genera la URL usando las credenciales AWS del servidor
3. El frontend sube el archivo **directamente a S3** usando esa URL temporal
4. Para mostrar la imagen, se genera una nueva presigned URL de lectura (válida 7 días)

---

## Deploy en Vercel

1. Conectar el repositorio de GitHub en [vercel.com](https://vercel.com)
2. Framework preset: **Vite**
3. Agregar todas las variables de entorno en **Settings → Environment Variables**
4. Las variables `VITE_*` son accesibles desde el frontend
5. Las variables `AWS_*` solo están disponibles en las Serverless Functions

---

## Seguridad

- Las credenciales de AWS están únicamente en las Vercel Serverless Functions
- Las credenciales de Firebase en el frontend usan variables `VITE_*` (son públicas por diseño de Firebase, la seguridad real está en las reglas de Firestore)
- Las reglas de Firestore validan roles del lado del servidor
- `.env` está en `.gitignore` — nunca se sube al repositorio

### Reglas de Firestore

| Colección | Lectura | Escritura |
|---|---|---|
| `users` | Propio usuario o admin | Propio usuario (crear) o admin |
| `products` | Pública | Solo admin |
| `orders` | Dueño de la orden o admin | Customer crea la suya; admin actualiza |

---

## Testing

```bash
# Correr todos los tests
npm run test

# Una sola vez (sin watch)
npx vitest run
```

Los tests cubren:
- **cartReducer**: cada acción (ADD, REMOVE, UPDATE, CLEAR)
- **useCart**: hook completo con CartProvider
- **useAuth**: inicialización, funciones expuestas, error fuera de provider
- **Integración**: flujo completo carrito → checkout (agregar, actualizar, limpiar)

Firebase y AWS están mockeados — los tests no hacen llamadas reales a servicios externos.

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run test     # Tests en modo watch
npx vitest run   # Tests una sola vez
firebase deploy --only firestore:rules  # Publicar reglas de Firestore
```