# Speedy-Go Web (Next.js)

Plataforma Web para el servicio de Delivery **Speedy-Go**, migrada de la aplicación móvil a una interfaz web moderna, responsiva y optimizada para escritorio y dispositivos móviles.

---

## 🚀 Tecnologías Principales
*   **Framework**: Next.js 15+ (App Router)
*   **Base de datos / Autenticación**: Firebase (Firestore & Auth)
*   **Estado Global**: Zustand (Persist para carrito y direcciones)
*   **Mapas**: Leaflet / React-Leaflet (Local Marker Icons)
*   **Estilos**: CSS Modules (Vanilla CSS con CSS Grid)
*   **Iconos**: Lucide React

---

## 🛠️ Requisitos e Instalación

1. **Clonar el repositorio** y entrar en la carpeta del proyecto web:
   ```bash
   cd Speedy-Go-Web
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   *El proyecto se abrirá en [http://localhost:3000](http://localhost:3000)*

---

## 📂 Estructura del Proyecto

```text
src/
├── app/                        # 🌐 Rutas y Páginas (Next.js App Router)
│   ├── page.tsx               # Página de Inicio (Restaurantes, Categorías)
│   ├── global.css              # Estilos globales de la aplicación
│   ├── addresses/              # 📌 Gestión de Direcciones (Mapa + GPS)
│   ├── cart/                   # 🛒 Carrito de Compras & Resumen de pedido
│   ├── tracking/               # 📍 Tracking de Pedidos en tiempo real (Split Panel)
│   ├── favorites/              # ❤️ Restaurantes Favoritos guardados
│   ├── login/ / register/      # 🔐 Autenticación de Usuarios (Firebase)
│   ├── edit-profile/           # 👤 Edición de Datos del Perfil
│   ├── restaurant/[id]/         # 🍕 Detalle de Restaurante y Menú de Platos
│   ├── product/[id]/           # 🍔 Detalle de un Producto (con extras)
│   ├── search/                 # 🔍 Barra de búsqueda de comida/locales
│   └── orders/                 # 📜 Historial de pedidos del usuario
|
├── components/                 # 🧱 Componentes Reutilizables
│   ├── Navbar.tsx             # Barra superior con badges de carrito/pedidos
│   ├── MapPicker.tsx          # Wrapper principal del mapa interactivo
│   ├── MapInner.tsx           # Componente dinámico (no-SSR) de Leaflet
│   ├── Toast.tsx              # Sistema de notificaciones personalizado (ToastProvider)
│   └── ClientProviders.tsx    # Proveedores de contexto para el cliente (Zustand, Auth)
|
├── lib/                        # ⚙️ Lógica de Negocio y Conexiones
│   ├── firebase.ts            # Inicialización de Firebase (Auth, Firestore)
│   └── services/               # Clases de servicio para Firestore
│       ├── userService.ts     # CRUD de usuarios, direcciones y favoritos
│       ├── restaurantService.ts # Consultas de locales y platos
│       └── orderService.ts     # Gestión y suscripción a pedidos
|
└── store/                       # 🧠 Gestión de Estado (Zustand)
    ├── cartStore.ts            # Persistencia de items del carrito
    └── addressStore.ts         # Estado de la dirección de entrega activa
```

---

## ✨ Características Destacadas

### 🗺️ Geolocalización Robusta (3-Tier Fallback)
El sistema de ubicación en `/addresses` intenta detectar tu posición usando:
1. **GPS del navegador** (alta precisión).
2. **Redes Wi-Fi** (baja precisión).
3. **Módulo de IP Geocoder** (`ipapi.co`) como último recurso, asegurando que siempre funcione aunque el usuario bloquee los permisos del navegador.

### 🍱 Interfaz de Usuario Premium
*   **Diseño No-Scroll**: Todos los formularios (Auth, Direcciones, Perfil) usan CSS Grid columnas dobles en escritorio para encajar perfectamente en el viewport.
*   **Floating Cart**: Barra inferior dinámica para móviles que muestra total y acceso rápido.
*   **Notificaciones de Navbar**: Badges animados en tiempo real sobre los iconos de Carrito y Pedidos.
*   **Custom Toasts**: Reemplaza los `alert()` nativos por globos de notificación elegantes de Éxito, Error, Info y Alerta.

---

## 🚢 Despliegue (Build)
Para compilar a producción:
```bash
npm run build
npm start
```
*Listo para desplegarse en **Vercel** o servidores Node.js compatibles.*
