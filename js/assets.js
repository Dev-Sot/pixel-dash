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

  // personaje jugable (Hero Knight - Sven Thole)
  loadImage('heroIdle', 'assets/sprites/hero/idle.png');
  loadImage('heroRun', 'assets/sprites/hero/run.png');
  loadImage('heroJump', 'assets/sprites/hero/jump.png');
  loadImage('heroFall', 'assets/sprites/hero/fall.png');
  loadImage('heroRoll', 'assets/sprites/hero/roll.png');

  // entorno (SunnyLand - ansimuz, CC0)
  loadImage('tileset', 'assets/sprites/tiles/tileset.png');
  loadImage('bgBack', 'assets/backgrounds/back.png');
  loadImage('itemGem', 'assets/sprites/items/gem.png');
  loadImage('propSpikes', 'assets/sprites/props/spikes.png');
  loadImage('propPalm', 'assets/sprites/props/palm.png');
  loadImage('propTree', 'assets/sprites/props/tree.png');
  loadImage('propBush', 'assets/sprites/props/bush.png');
  loadImage('propRock', 'assets/sprites/props/rock.png');

  window.PD.assets = {
    get(key){ return images[key] || null; },
    ready(key){ const img = images[key]; return !!img && img.complete && img.naturalWidth > 0; },
    onReady(cb){ if(loaded >= pending) cb(); else onDoneCb = cb; }
  };
})();
