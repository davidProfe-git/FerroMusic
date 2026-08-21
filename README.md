<<<<<<< HEAD
# FERRO-PLAYER

Interfaz web de reproductor musical inspirada en el diseño entregado: estética oscura, vidrio, cian, ferrofluido y panel de control.

## Tecnologías
- HTML5
- CSS3
- JavaScript vanilla
- Web Audio/HTMLAudio para reproducción local
- Canvas 2D para el visualizador reactivo

## Ejecutar
No necesita Node ni instalación de dependencias.

1. Extrae la carpeta.
2. Abre `index.html` en Chrome, Edge o Firefox.
3. En **Library > Add Music**, selecciona archivos de audio locales.
4. Usa el reproductor inferior y los controles de Fluid Settings.

## Nota
La aplicación funciona completamente en el navegador. Los archivos musicales seleccionados no se suben a un servidor.
=======
# FERRO — Music Experience

Primera versión del concepto FERRO, basada en la especificación original:

- estética negro/gris carbón + neón fosforescente;
- criatura ferromagnética de partículas;
- onboarding con nombre;
- dashboard con Inicio, Mi música, Favoritos, Historial y Playlists;
- selección de archivos locales MP3/WAV/OGG/M4A/FLAC;
- reproductor persistente;
- progreso, volumen, shuffle y repeat;
- estados visuales IDLE/CURIOUS/LISTENING/PLAYING/EXCITED/SLEEPING;
- preparación para Web Audio API, proveedores web autorizados y cuentas.

## Ejecutar

Requiere Node.js 20+.

```bash
npm install
npm run dev
```

Después abre la dirección que muestre Vite.

## Fases siguientes

La base está organizada para continuar con:

1. reacción de partículas al espectro de audio;
2. persistencia completa con IndexedDB;
3. playlists locales;
4. capa de proveedores web autorizados;
5. autenticación y sincronización.
>>>>>>> Boris
