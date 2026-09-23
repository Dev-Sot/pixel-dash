// ---------- asset loading (images/audio, sin fetch -> funciona con file://) ----------
window.PD = window.PD || {};

(function(){
  const images = {};
  let pending = 0, loaded = 0, onDoneCb = null;

  function loadImage(key, src){
    pending++;
    const img = new Image();
    img.onload = () => { loaded++; checkDone(); };
    img.onerror = () => { loaded++; images[key] = null; checkDone(); }; // opcional -> no rompe el juego
    img.src = src;
    images[key] = img;
  }
  function checkDone(){
    if(loaded >= pending && onDoneCb){ const cb = onDoneCb; onDoneCb = null; cb(); }
  }

  // Manifest de sprites del jugador (ya incluidos). Tiles/fondos reales de SunnyLand
  // se agregan aca cuando esten disponibles: loadImage('tiles', 'assets/sprites/tiles/tileset.png')
  loadImage('playerIdle', 'assets/sprites/player/idle.png');
  loadImage('playerWalk', 'assets/sprites/player/walk.png');

  window.PD.assets = {
    get(key){ return images[key] || null; },
    ready(key){ const img = images[key]; return !!img && img.complete && img.naturalWidth > 0; },
    onReady(cb){ if(loaded >= pending) cb(); else onDoneCb = cb; }
  };
})();
