# MultiShop — AI Driven E-Commerce

**Proyecto Integrador M5 — Especialización Frontend — SoyHenry**

MultiShop es una plataforma de e-commerce SPA desarrollada para **Patagonix Tech**, una software factory que necesitaba una solución escalable para un cliente del sector retail. La aplicación permite a clientes navegar y comprar productos en línea, y a administradores gestionar el catálogo y las órdenes desde un panel protegido.

**URL de producción:** https://proyecto-m5-santiago-artal.vercel.app

---

## Contexto del cliente

El cliente del sector retail solicitó una plataforma que:
- Soporte dos tipos de usuarios con experiencias diferenciadas (customer / admin)
- Use servicios administrados (BaaS) para reducir costos de infraestructura
- Sea escalable, mantenible y con seguridad en el manejo de credenciales
- Tenga deploy continuo desde el repositorio

---

## Tech Stack

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | SPA moderna con tipado estricto y build rápido |
| Estilos | Tailwind CSS | Utilidades mobile-first, soporte nativo para dark mode |
| Enrutamiento | React Router v7 | Rutas anidadas y protección por rol |
| Estado global | Context API + useReducer | Estado predecible sin dependencias externas |
| Auth y DB | Firebase Authentication + Firestore | BaaS con autenticación lista y base de datos en tiempo real |
| Almacenamiento | AWS S3 + presigned URLs | Upload seguro sin exponer credenciales en el frontend |
| Emails | AWS SES | Notificaciones transaccionales de órdenes |
| Backend serverless | Vercel Serverless Functions | Lógica de backend sin servidor, credenciales AWS seguras |
| Testing | Vitest + React Testing Library | Tests unitarios e integración con mocks de Firebase/AWS |
| Deploy | Vercel + GitHub CI/CD | Deploy automático en cada push a main |

---

## Decisiones arquitectónicas

### Por qué Context API + useReducer (y no Zustand o Redux)

El carrito de compras tiene múltiples acciones relacionadas: agregar, eliminar, actualizar cantidad y limpiar. Con `useState` simple, esas acciones se dispersan en distintos handlers y el estado se vuelve difícil de seguir. `useReducer` centraliza todas las transiciones de estado en una función pura: dado el mismo estado y la misma acción, siempre devuelve el mismo resultado. Esa pureza hace que el reducer sea trivialmente testeable y que el flujo de datos sea predecible.

Se usaron contextos separados por responsabilidad:
- `AuthContext` — sesión del usuario y rol
- `CartContext` — estado del carrito con reducer
- `ThemeContext` — preferencia de tema (dark/light)
- `ToastContext` — notificaciones efímeras

Mezclar autenticación y carrito en un mismo contexto hubiera generado re-renders innecesarios y dificultado los tests.

### Por qué AWS S3 con presigned URLs (y no Firebase Storage)

Las credenciales de AWS nunca deben llegar al navegador. El flujo con presigned URLs resuelve esto de forma elegante: el frontend no tiene acceso a las claves, solo recibe una URL temporal con permisos acotados para una operación específica.

Ver diagrama completo en la sección [Flujo de upload a S3](#flujo-de-upload-a-s3-con-presigned-urls).

### Estructura de carpetas

La estructura sigue una organización por capas técnicas, donde cada carpeta tiene una responsabilidad única y el propósito del proyecto (e-commerce) es legible desde la estructura:

```
src/
├── components/       # Navbar, ProtectedRoute, LoadingScreen, ToastContainer
├── config/           # Inicialización de Firebase
├── constants/        # Categorías de productos
├── context/          # AuthContext, CartContext, ThemeContext, ToastContext
├── hooks/            # useAuth, useCart, useTheme, useToast, useDebounce
├── pages/
│   ├── admin/        # Dashboard (CRUD productos + S3), AdminOrders
│   ├── auth/         # Login y registro
│   └── customer/     # Home (catálogo), Checkout, Orders
├── services/         # Comunicación con Firebase, S3, SES, Firestore
├── types/            # Interfaces TypeScript del dominio
api/
├── presigned-url.js  # Serverless: genera presigned URL de upload a S3
├── get-image-url.js  # Serverless: genera presigned URL de lectura de S3
└── send-email.js     # Serverless: envía emails vía AWS SES
tests/
├── cartReducer.test.ts
├── useCart.test.ts
├── useAuth.test.ts
└── checkout.integration.test.tsx
```

---

## Instalación y configuración

### 1. Clonar e instalar

```bash
git clone https://github.com/artalcarriaga-arch/ProyectoM5_SantiagoArtal.git
cd ProyectoM5_SantiagoArtal
npm install
```

### 2. Variables de entorno

Copiar `.env.example` y completar con los valores reales:

```bash
cp .env.example .env
```

```env
# Firebase (prefijo VITE_ requerido para ser accesibles desde el frontend)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# AWS S3 — solo disponibles en Vercel Functions, nunca llegan al frontend
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=

# AWS SES — solo disponibles en Vercel Functions
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=
AWS_SES_VERIFIED_EMAIL=
```

### 3. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. **Authentication** → Habilitar Email/password y Google
3. Crear base de datos **Firestore** en modo producción
4. Copiar las credenciales del proyecto al `.env`
5. Publicar las reglas de seguridad:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Para crear el primer usuario admin, registrarse normalmente y luego cambiar el campo `role` de `customer` a `admin` en la colección `users` de Firebase Console.

### 4. Configurar AWS S3

1. Crear un bucket en S3 (ejemplo: `multishop-fotos`)
2. En **Permissions → CORS**, configurar:

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

3. Mantener **Block public access** activado — las imágenes se sirven con presigned URLs, no de forma pública
4. Crear usuario IAM con política que permita `s3:PutObject` y `s3:GetObject` sobre el bucket
5. Guardar el Access Key ID y Secret Access Key en las variables de entorno de Vercel

### 5. Configurar AWS SES

1. Ir a **Amazon SES** en la consola de AWS (región us-east-1)
2. En **Verified identities** → verificar el email de origen
3. Si la cuenta está en sandbox, solo se puede enviar a emails verificados
4. Para enviar a cualquier email → **Account dashboard → Request production access**

### 6. Correr localmente

```bash
npm run dev
```

> Las Vercel Functions (`/api/*`) solo están disponibles en producción. En desarrollo local, S3 y SES no funcionan.

---

## Flujo de upload a S3 con presigned URLs

El principio fundamental: **las credenciales de AWS nunca llegan al navegador**.

```
Frontend                    Vercel Function              AWS S3
   |                              |                         |
   |-- POST /api/presigned-url -->|                         |
   |   { fileName, contentType } |                         |
   |                              |-- Genera URL firmada -->|
   |                              |<-- uploadUrl + fileKey--|
   |<--- { uploadUrl, fileKey } --|                         |
   |                              |                         |
   |-- PUT uploadUrl (archivo) -------------------------->  |
   |                              |                         |
   |-- POST /api/get-image-url -->|                         |
   |   { fileKey }               |                         |
   |                              |-- Genera URL de lectura>|
   |<--- { imageUrl (7 días) } ---|                         |
```

**¿Por qué este flujo es más seguro que las alternativas?**

- Si el frontend llamara a S3 directamente, necesitaría las claves de AWS expuestas en el bundle de JavaScript — cualquier usuario podría extraerlas.
- Si el servidor subiera la imagen por el cliente, el archivo viajaría dos veces (frontend → servidor → S3) con mayor latencia y costo.
- Con presigned URLs, el servidor solo firma la operación. El archivo viaja directamente del navegador a S3. Las claves nunca salen del servidor.

---

## Seguridad

- Las credenciales de AWS están **únicamente** en las Vercel Serverless Functions
- Las credenciales de Firebase usan variables `VITE_*` — son públicas por diseño de Firebase; la seguridad real está en las reglas de Firestore del lado del servidor
- `.env` está en `.gitignore` y nunca se sube al repositorio
- Las reglas de Firestore validan roles en el servidor, no solo en el frontend

### Reglas de Firestore

| Colección | Lectura | Escritura |
|---|---|---|
| `users` | Propio usuario o admin | Propio usuario al crear; admin puede actualizar |
| `products` | Pública (catálogo) | Solo admin |
| `orders` | Dueño de la orden o admin | Customer crea con su propio `userId`; admin actualiza estado |

---

## Testing

```bash
# Tests en modo watch
npm run test

# Una sola vez
npx vitest run
```

Los tests cubren:

| Archivo | Qué testea |
|---|---|
| `cartReducer.test.ts` | Cada acción del reducer: ADD, REMOVE, UPDATE_QUANTITY, CLEAR |
| `useCart.test.ts` | Hook useCart con CartProvider: agregar, remover, actualizar, limpiar |
| `useAuth.test.ts` | Hook useAuth: inicialización, funciones expuestas, error fuera de provider |
| `checkout.integration.test.tsx` | Flujo completo: múltiples productos, actualizar cantidades, limpiar carrito |

Firebase y AWS están **mockeados** — los tests no hacen llamadas reales a servicios externos y son deterministas.

---

## Deploy en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Framework preset: **Vite**
3. Agregar todas las variables de entorno en **Settings → Environment Variables**
   - Variables `VITE_*`: disponibles en el frontend
   - Variables `AWS_*`: solo disponibles en Serverless Functions
4. Cada push a `main` genera un deploy automático

---

## Scripts

```bash
npm run dev      # Servidor de desarrollo (puerto 5173)
npm run build    # Build de producción con TypeScript strict
npm run test     # Tests en modo watch
npx vitest run   # Tests una sola vez
firebase deploy --only firestore:rules  # Publicar reglas de seguridad
```

---

## Bitácora de uso de IA

Durante el desarrollo se usó IA (GitHub Copilot / Claude) como herramienta activa para planificar, validar decisiones, hacer code reviews, generar tests y resolver problemas. A continuación se documentan los momentos clave.

| # | Momento | Prompt / Pregunta | Aprendizaje / Decisión resultante |
|---|---|---|---|
| 1 | **Planificación arquitectónica** | _"Tengo que construir un e-commerce con dos roles de usuario, Firebase y AWS S3. ¿Cómo organizo los contextos para evitar que se mezclen responsabilidades? ¿Un contexto o varios?"_ | La IA explicó que mezclar autenticación y carrito en un contexto genera re-renders innecesarios y dificulta los tests. Decidí usar **4 contextos separados** (Auth, Cart, Theme, Toast), cada uno con una responsabilidad única. |
| 2 | **Validación de decisión técnica: presigned URLs** | _"¿Por qué debería usar presigned URLs para subir imágenes a S3 en vez de subirlas directamente desde el frontend con las credenciales de AWS?"_ | La IA explicó el riesgo de exponer credenciales en el bundle de JavaScript y describió el flujo completo: frontend pide URL al servidor → servidor firma con sus credenciales → frontend sube directo a S3. Esto me permitió entender el patrón antes de implementarlo y justificarlo técnicamente. |
| 3 | **Code review: seguridad en reglas de Firestore** | _"Revisá estas reglas de Firestore. ¿Hay algún caso donde un usuario podría leer órdenes de otro usuario o modificar su propio rol?"_ | La IA identificó que sin reglas del lado del servidor, la validación de roles en el frontend se puede saltear manipulando el estado del navegador. Agregué reglas que verifican `request.auth.uid == resource.data.userId` para órdenes y restringen la escritura de productos a admins verificados en Firestore. |
| 4 | **Generación de casos de test** | _"¿Qué casos edge debería testear en el cartReducer además del flujo feliz? Tengo add, remove, update y clear."_ | La IA sugirió casos que no había considerado: agregar el mismo producto dos veces (debe incrementar cantidad, no duplicar), actualizar cantidad a 0 (debe eliminar el producto), y limpiar un carrito que ya está vacío. Estos casos se agregaron al test suite y uno de ellos reveló un bug en el cálculo del total que fue corregido. |
| 5 | **Resolución de problema: Google OAuth en Vercel** | _"Google OAuth funciona en localhost pero en Vercel me da error 404 NOT_FOUND al hacer el redirect. ¿Qué puede estar pasando?"_ | La IA identificó que el problema era que el dominio de Vercel no estaba en la lista de dominios autorizados de Firebase Authentication, y que la URL de redirección OAuth no estaba configurada en Google Cloud Console. Me guió paso a paso para agregar `proyecto-m5-santiago-artal.vercel.app` en Firebase y las URIs de redirección correctas en Google Cloud. |
| 6 | **Resolución de problema: imágenes S3 expiran** | _"Las imágenes que subo a S3 se ven correctamente por 15 minutos y luego dan 403 Forbidden. ¿Cómo soluciono esto sin hacer el bucket público?"_ | La IA explicó que el problema era que la presigned URL de upload (15 min) se estaba guardando como URL de visualización. La solución correcta es generar una **segunda presigned URL para GET** con expiración de 7 días al momento de cargar los productos, regenerándola en cada carga. Esto mantiene la seguridad del bucket privado y cumple con el requisito de presigned URLs de la consigna. |