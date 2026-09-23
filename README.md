# 🏃 Pixel Dash

Plataformero por niveles en pixel art. Sin build ni dependencias: `<script>` clásicos
(sin ES modules ni `fetch`) para poder abrir `index.html` con doble clic y que
funcione igual, o servirlo con cualquier servidor estático.

3 niveles cortos, menú de inicio con selección de nivel, pausa, monedas, peligros,
meta, y una pantalla de créditos para los assets usados (ver [CREDITS.md](CREDITS.md)).

## Ejecutarlo localmente

```bash
npx serve .
# o
python3 -m http.server 8080
```

(También puedes abrir `index.html` directo con doble clic — no requiere servidor.)

## Estructura del código

```
index.html        shell: canvas, overlays de menú/pausa/créditos, HUD
css/style.css      estilos
js/
  assets.js        carga de imágenes (personaje, tiles, fondos)
  audio.js          música/SFX (sintetizado; usa archivos reales si están en assets/audio)
  input.js          teclado + botones táctiles
  levels.js         datos de los 3 niveles (grilla de tiles) + parseLevel()
  tilemap.js         colisión contra la grilla, cámara, dibujo del nivel
  player.js          física del jugador, animación (idle/walk/salto)
  scenes.js          máquina de estados: menú → nivel → pausa → victoria/derrota → créditos
  main.js             bootstrap + loop
assets/
  sprites/player/    idle.png, walk.png (pack de merakintsugi)
  sprites/tiles/, sprites/props/, backgrounds/, audio/   (para el arte real, ver abajo)
```

Los tiles y peligros hoy se dibujan como rectángulos de color (placeholder) — el
punto para reemplazarlos por el tileset real es `drawTile()` en `js/tilemap.js`.

## Subirlo a GitHub

```bash
git add .
git commit -m "mensaje"
git branch -M main
git remote add origin https://github.com/Dev-Sot/pixel-dash.git
git push -u origin main
```

## Desplegarlo en Vercel

**Opción A — Dashboard (más fácil):**
1. Entra a https://vercel.com → New Project.
2. Importa el repo `pixel-dash` desde GitHub (autoriza el acceso si te lo pide).
3. Framework Preset: déjalo en **Other** (es sitio estático, no necesita build).
4. Deploy. Listo, te da una URL tipo `pixel-dash.vercel.app`.

**Opción B — CLI:**
```bash
npm i -g vercel
vercel login
vercel        # deploy de prueba (preview)
vercel --prod # deploy a producción
```

Cada vez que hagas `git push` a `main`, Vercel vuelve a desplegar automáticamente.

## Editar el juego con Claude en VS Code

Ideas rápidas para pedirle mejoras a Claude:
- "Agrega un power-up de escudo que aguante un golpe"
- "Añade un enemigo que patrulle una plataforma"
- "Crea una pantalla de selección de personaje"
- "Agrega vibración (navigator.vibrate) al chocar en móvil"
