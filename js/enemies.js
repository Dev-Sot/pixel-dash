// ---------- enemigos: patrulla simple, muere si se le salta encima ----------
// Sprite: Opossum del pack SunnyLand (ansimuz, CC0). 6 frames de 36x28, camina.
window.PD = window.PD || {};

(function(){
  const FW = 36, FH = 28, FRAMES = 6;
  const PIVOT_X = 16, FEET_Y = 27;
  const DRAW_H = 20, SPEED = 0.6;
  const FACES_RIGHT_BY_DEFAULT = true;

  function createEnemies(levelDef){
    return (levelDef.enemies || []).map(e => ({
      x: e.x, y: e.y, w: 12, h: 12,
      minX: e.minX, maxX: e.maxX,
      dir: 1, animTime: Math.random() * 10, alive: true
    }));
  }

  function update(enemies, level, dtFrames, particles){
    for(const e of enemies){
      if(!e.alive) continue;
      e.x += e.dir * SPEED * dtFrames;
      if(e.x <= e.minX){ e.x = e.minX; e.dir = 1; }
      else if(e.x + e.w >= e.maxX){ e.x = e.maxX - e.w; e.dir = -1; }
      e.animTime += dtFrames;
    }
  }

  // El enemigo no es solido (no participa de la colision contra el piso), asi
  // que al caer el jugador atraviesa su altura y termina "parado junto a el"
  // en vez de aterrizar encima. Por eso el stomp se detecta con la posicion
  // del frame anterior: si los pies venian por ENCIMA de la cabeza del
  // enemigo y ahora se solapan, fue un aterrizaje: se cuenta como stomp
  // aunque la fisica del piso ya haya "asentado" al jugador mas abajo.
  function checkPlayerCollision(player, prevBottom, enemies, particles){
    const stomped = [];
    let hit = false;
    for(const e of enemies){
      if(!e.alive) continue;
      const overlapX = player.x < e.x + e.w && player.x + player.w > e.x;
      const overlapY = player.y < e.y + e.h && player.y + player.h > e.y;
      if(!overlapX || !overlapY) continue;
      if(prevBottom <= e.y + 4){
        e.alive = false;
        stomped.push(e);
        player.y = e.y - player.h; // reubicar arriba del enemigo, no atravesado
        for(let i = 0; i < 8; i++){
          particles.push({
            x: e.x + e.w/2, y: e.y + e.h/2,
            vx: (Math.random()-0.5)*3, vy: -Math.random()*2.5,
            life: 16 + Math.random()*10, color: '#8a8aa3', size: 1 + Math.random()*2
          });
        }
      } else if(!player.rolling){
        hit = true;
      }
    }
    return { stomped, hit };
  }

  function draw(ctx, enemies, camX){
    const img = PD.assets.get('enemyOpossum');
    const ready = img && PD.assets.ready('enemyOpossum');
    for(const e of enemies){
      if(!e.alive) continue;
      const x = e.x - camX;
      if(x < -40 || x > PD.VIEW_W + 40) continue;
      const cx = e.x + e.w/2 - camX, feetY = e.y + e.h;
      const frameIndex = Math.floor(e.animTime * 0.3) % FRAMES;
      if(!ready){
        ctx.fillStyle = '#7a5c8a';
        ctx.fillRect(x, e.y, e.w, e.h);
        continue;
      }
      const scale = DRAW_H / FH, drawW = FW * scale, drawH = FH * scale;
      const flip = (e.dir < 0) === FACES_RIGHT_BY_DEFAULT;
      ctx.save();
      ctx.translate(cx, feetY);
      if(flip) ctx.scale(-1, 1);
      ctx.drawImage(img, frameIndex*FW, 0, FW, FH, -PIVOT_X*scale, -FEET_Y*scale, drawW, drawH);
      ctx.restore();
    }
  }

  window.PD.enemies = { createEnemies, update, checkPlayerCollision, draw };
})();
