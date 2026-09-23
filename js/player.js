// ---------- jugador: fisica, estado y animacion ----------
// El pack del personaje solo trae "idle" (10 frames de 46x55) y "walk" (grilla 2x6
// de 90x58, 12 frames). No hay salto: se sintetiza con squash/stretch + rotacion
// leve sobre el frame de idle, en vez de mezclar sprites de otro pack.
window.PD = window.PD || {};

(function(){
  const IDLE = { cols: 10, rows: 1, fw: 46, fh: 55, count: 10 };
  const WALK = { cols: 2, rows: 6, fw: 90, fh: 58, count: 12 };
  const GRAVITY = 0.52, JUMP_V = -8.4, MOVE_SPEED = 1.8, MAX_FALL = 7.5, DRAW_H = 26;
  const FACES_RIGHT_BY_DEFAULT = true;
  // "coyote time" (saltar poco despues de dejar el borde) + buffer de salto
  // (que un tap de salto un poco antes de aterrizar igual cuente) - sin esto
  // el salto se siente exigente/injusto, sobre todo combinado con movimiento.
  const COYOTE_FRAMES = 6, JUMP_BUFFER_FRAMES = 8;

  function createPlayer(x, y){
    return {
      x, y, w: 10, h: 14, vx: 0, vy: 0,
      onGround: false, facing: 1, animTime: 0, dead: false, wasOnGround: false,
      coyoteTimer: 0, jumpBufferTimer: 0
    };
  }

  function update(player, level, dtFrames, input, particles){
    if(player.dead) return { justLanded: false, hazard: false, fellOff: false, reachedGoal: false, coinsGot: [] };

    let moveX = 0;
    if(input.left){ moveX -= 1; player.facing = -1; }
    if(input.right){ moveX += 1; player.facing = 1; }
    player.vx = moveX * MOVE_SPEED;

    player.coyoteTimer = player.onGround ? COYOTE_FRAMES : Math.max(0, player.coyoteTimer - dtFrames);
    if(input.consumeJumpPressed()) player.jumpBufferTimer = JUMP_BUFFER_FRAMES;
    else player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dtFrames);

    if(player.jumpBufferTimer > 0 && player.coyoteTimer > 0){
      player.vy = JUMP_V;
      player.onGround = false;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      PD.audio.sfxJump();
      spawnDust(particles, player.x + player.w/2, player.y + player.h, 5);
    }

    player.vy = Math.min(MAX_FALL, player.vy + GRAVITY * dtFrames);
    player.wasOnGround = player.onGround;

    const res = PD.tilemap.moveAndCollide(level, player, player.vx * dtFrames, player.vy * dtFrames);
    if(res.hitY){
      if(player.vy > 0){ player.onGround = true; }
      player.vy = 0;
    } else {
      player.onGround = false;
    }
    if(res.hitX) player.vx = 0;

    const justLanded = player.onGround && !player.wasOnGround;
    if(justLanded) spawnDust(particles, player.x + player.w/2, player.y + player.h, 6);

    const hazard = res.hazard;
    const fellOff = player.y > level.heightPx + 40;

    let reachedGoal = false;
    if(level.goal){
      const g = level.goal;
      if(player.x < g.x + g.w && player.x + player.w > g.x &&
         player.y < g.y + g.h && player.y + player.h > g.y) reachedGoal = true;
    }

    const coinsGot = [];
    for(const c of level.coins){
      if(c.taken) continue;
      const dx = (player.x + player.w/2) - c.x, dy = (player.y + player.h/2) - c.y;
      if(Math.sqrt(dx*dx + dy*dy) < c.r + 8){
        c.taken = true; coinsGot.push(c);
        spawnDust(particles, c.x, c.y, 4, '#ffd35e');
      }
    }

    player.animTime += dtFrames;
    return { justLanded, hazard, fellOff, reachedGoal, coinsGot };
  }

  function spawnDust(particles, x, y, n, color){
    if(!particles) return;
    for(let i = 0; i < n; i++){
      particles.push({
        x, y, vx: (Math.random()-0.5)*2.2, vy: -Math.random()*1.6,
        life: 14 + Math.random()*10, color: color || '#cfd6ff', size: 1 + Math.random()*2
      });
    }
  }

  function draw(ctx, player, camX){
    const assets = PD.assets;
    const moving = Math.abs(player.vx) > 0.05;
    const cx = player.x + player.w/2 - camX, feetY = player.y + player.h;
    let key, sheet, frameIndex, tilt = 0, squashX = 1, squashY = 1;

    if(!player.onGround){
      key = 'playerIdle'; sheet = IDLE; frameIndex = 0;
      tilt = player.vy < 0 ? -0.12 * player.facing : 0.12 * player.facing;
      squashY = player.vy < 0 ? 1.12 : 0.92;
      squashX = player.vy < 0 ? 0.9 : 1.08;
    } else if(moving){
      key = 'playerWalk'; sheet = WALK;
      frameIndex = Math.floor(player.animTime * 0.35) % sheet.count;
    } else {
      key = 'playerIdle'; sheet = IDLE;
      frameIndex = Math.floor(player.animTime * 0.18) % sheet.count;
    }
    const img = assets.get(key);

    if(!img || !assets.ready(key)){
      // fallback: rectangulo simple si la imagen no cargo
      ctx.fillStyle = '#5ee1ff';
      ctx.fillRect(cx - player.w/2, feetY - player.h, player.w, player.h);
      return;
    }

    const col = frameIndex % sheet.cols, row = Math.floor(frameIndex / sheet.cols);
    const sx = col * sheet.fw, sy = row * sheet.fh;
    const drawH = DRAW_H * squashY, drawW = (sheet.fw / sheet.fh) * DRAW_H * squashX;
    const flip = (player.facing < 0) === FACES_RIGHT_BY_DEFAULT;

    ctx.save();
    ctx.translate(cx, feetY - drawH/2);
    ctx.rotate(tilt);
    if(flip) ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, sheet.fw, sheet.fh, -drawW/2, -drawH/2, drawW, drawH);
    ctx.restore();
  }

  window.PD.player = { createPlayer, update, draw, spawnDust };
})();
