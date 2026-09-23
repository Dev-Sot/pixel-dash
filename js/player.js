// ---------- jugador: fisica, estado y animacion (Hero Knight de Sven Thole) ----------
window.PD = window.PD || {};

(function(){
  const FW = 100, FH = 55; // las 5 tiras comparten el mismo lienzo por frame
  const IDLE = { key: 'heroIdle', count: 8 };
  const RUN = { key: 'heroRun', count: 10 };
  const JUMP = { key: 'heroJump', count: 3 };
  const FALL = { key: 'heroFall', count: 4 };
  const ROLL = { key: 'heroRoll', count: 9 };

  // el personaje no esta centrado en su lienzo de 100x55 (deja espacio a la
  // derecha para el barrido de espada): ancla real medida en los sprites.
  const PIVOT_X = 38.7, FEET_Y = 52;

  const GRAVITY = 0.45, JUMP_V = -9.0, MOVE_SPEED = 2.0, MAX_FALL = 7.5, DRAW_H = 32;
  const COYOTE_FRAMES = 6, JUMP_BUFFER_FRAMES = 8;
  const ROLL_SPEED = 4.0, ROLL_FRAMES = 22, ROLL_COOLDOWN_FRAMES = 16;
  const FACES_RIGHT_BY_DEFAULT = true;

  function createPlayer(x, y){
    return {
      x, y, w: 10, h: 16, vx: 0, vy: 0,
      onGround: false, facing: 1, animTime: 0, dead: false, wasOnGround: false,
      coyoteTimer: 0, jumpBufferTimer: 0,
      rolling: false, rollTimer: 0, rollCooldown: 0, rollDir: 1
    };
  }

  function update(player, level, dtFrames, input, particles){
    if(player.dead) return { justLanded: false, hazard: false, fellOff: false, reachedGoal: false, coinsGot: [] };

    // "onGround" parpadea false un frame de cada tanto por como cae la
    // gravedad contra el piso exacto (inofensivo para el salto porque usa
    // coyote time, pero la rodada chequeaba onGround directo y podia
    // "tragarse" el input en silencio). Se actualiza coyoteTimer primero y
    // se usa "recien en el piso" para las dos acciones.
    player.coyoteTimer = player.onGround ? COYOTE_FRAMES : Math.max(0, player.coyoteTimer - dtFrames);
    const recentlyGrounded = player.onGround || player.coyoteTimer > 0;

    player.rollCooldown = Math.max(0, player.rollCooldown - dtFrames);
    if(input.consumeRollPressed() && recentlyGrounded && !player.rolling && player.rollCooldown <= 0){
      player.rolling = true;
      player.rollTimer = ROLL_FRAMES;
      player.rollDir = player.facing;
      player.rollCooldown = ROLL_FRAMES + ROLL_COOLDOWN_FRAMES;
      PD.audio.sfxRoll();
      spawnDust(particles, player.x + player.w/2, player.y + player.h, 5);
    }

    let moveX = 0;
    if(player.rolling){
      moveX = player.rollDir;
      player.rollTimer -= dtFrames;
      if(player.rollTimer <= 0) player.rolling = false;
    } else {
      if(input.left){ moveX -= 1; player.facing = -1; }
      if(input.right){ moveX += 1; player.facing = 1; }
    }
    player.vx = player.rolling ? moveX * ROLL_SPEED : moveX * MOVE_SPEED;

    if(input.consumeJumpPressed()) player.jumpBufferTimer = JUMP_BUFFER_FRAMES;
    else player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - dtFrames);

    if(!player.rolling && player.jumpBufferTimer > 0 && player.coyoteTimer > 0){
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

    const hazard = PD.tilemap.overlapsHazard(level, player) && !player.rolling; // la rodada esquiva los pinchos
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
    let sheet, frameIndex;

    if(player.rolling){
      sheet = ROLL;
      frameIndex = Math.min(sheet.count - 1, Math.floor((1 - player.rollTimer / ROLL_FRAMES) * sheet.count));
    } else if(!player.onGround){
      sheet = player.vy < 0 ? JUMP : FALL;
      frameIndex = Math.floor(player.animTime * 0.2) % sheet.count;
    } else if(moving){
      sheet = RUN;
      frameIndex = Math.floor(player.animTime * 0.4) % sheet.count;
    } else {
      sheet = IDLE;
      frameIndex = Math.floor(player.animTime * 0.15) % sheet.count;
    }

    const img = assets.get(sheet.key);
    if(!img || !assets.ready(sheet.key)){
      ctx.fillStyle = '#5ee1ff';
      ctx.fillRect(cx - player.w/2, feetY - player.h, player.w, player.h);
      return;
    }

    const sx = frameIndex * FW, sy = 0;
    const scale = DRAW_H / FH, drawW = FW * scale, drawH = FH * scale;
    const flip = (player.facing < 0) === FACES_RIGHT_BY_DEFAULT;

    ctx.save();
    ctx.translate(cx, feetY);
    if(flip) ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, FW, FH, -PIVOT_X * scale, -FEET_Y * scale, drawW, drawH);
    ctx.restore();
  }

  window.PD.player = { createPlayer, update, draw, spawnDust };
})();
