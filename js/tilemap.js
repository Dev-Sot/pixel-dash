// ---------- tilemap: colision, camara y dibujo de nivel ----------
// Los tiles se dibujan con rectangulos de color (placeholder) hasta que se integre
// el tileset real (SunnyLand). Cuando ese PNG este disponible en assets/sprites/tiles/,
// drawTile() es el unico lugar a tocar para dibujar recortes del spritesheet en vez de color.
window.PD = window.PD || {};

(function(){
  const THEMES = {
    day:   { skyTop:'#5ee1ff', skyBot:'#bdf3ff', hill:'#2f9e5a', hill2:'#256f42', ground:'#6b4a2f', groundTop:'#3f7d3b' },
    dusk:  { skyTop:'#ff9e5e', skyBot:'#3a2b55', hill:'#7a4a6b', hill2:'#4a2e4d', ground:'#4a3326', groundTop:'#5c3a55' },
    night: { skyTop:'#0d0d2b', skyBot:'#1c1c44', hill:'#232349', hill2:'#161630', ground:'#33263a', groundTop:'#2a2050' }
  };

  function isSolidAt(level, tx, ty){
    if(tx < 0 || tx >= level.width) return true;  // paredes invisibles en los bordes
    if(ty < 0) return false;
    if(ty >= level.rows) return false; // por debajo del nivel = caida (no pared)
    return !!level.solids[ty][tx];
  }
  function isHazardAt(level, tx, ty){
    if(ty < 0 || ty >= level.rows || tx < 0 || tx >= level.width) return false;
    return !!level.hazards[ty][tx];
  }

  // resuelve un rectangulo movil contra la grilla solida, un eje a la vez
  function moveAndCollide(level, rect, dx, dy){
    const ts = level.tileSize;
    let hitX = false, hitY = false, hazard = false;

    rect.x += dx;
    if(dx !== 0){
      const y0 = Math.floor(rect.y / ts), y1 = Math.floor((rect.y + rect.h - 1) / ts);
      const txEdge = dx > 0 ? Math.floor((rect.x + rect.w - 1) / ts) : Math.floor(rect.x / ts);
      for(let ty = y0; ty <= y1; ty++){
        if(isSolidAt(level, txEdge, ty)){
          rect.x = dx > 0 ? txEdge * ts - rect.w : (txEdge + 1) * ts;
          hitX = true;
          if(isHazardAt(level, txEdge, ty)) hazard = true;
          break;
        }
      }
    }
    rect.y += dy;
    if(dy !== 0){
      const x0 = Math.floor(rect.x / ts), x1 = Math.floor((rect.x + rect.w - 1) / ts);
      const tyEdge = dy > 0 ? Math.floor((rect.y + rect.h - 1) / ts) : Math.floor(rect.y / ts);
      for(let tx = x0; tx <= x1; tx++){
        if(isSolidAt(level, tx, tyEdge)){
          rect.y = dy > 0 ? tyEdge * ts - rect.h : (tyEdge + 1) * ts;
          hitY = true;
          if(isHazardAt(level, tx, tyEdge)) hazard = true;
          break;
        }
      }
    }
    return { hitX, hitY, hazard };
  }

  function cameraX(level, playerX, viewW){
    return Math.max(0, Math.min(level.widthPx - viewW, playerX - viewW / 2));
  }

  function drawBackground(ctx, level, viewW, viewH, camX){
    const theme = THEMES[level.theme] || THEMES.day;
    const g = ctx.createLinearGradient(0, 0, 0, viewH);
    g.addColorStop(0, theme.skyTop);
    g.addColorStop(1, theme.skyBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);

    // dos capas de colinas en parallax (placeholder de fondo)
    ctx.fillStyle = theme.hill2;
    drawHillLayer(ctx, viewW, viewH, camX * 0.25, 46, 26);
    ctx.fillStyle = theme.hill;
    drawHillLayer(ctx, viewW, viewH, camX * 0.5, 30, 18);
  }
  function drawHillLayer(ctx, viewW, viewH, offset, baseY, amp){
    const span = 90;
    ctx.beginPath();
    ctx.moveTo(-20, viewH);
    for(let x = -20; x <= viewW + 20; x += span){
      const wx = x + offset;
      const h = baseY + Math.abs(Math.sin(wx * 0.01)) * amp;
      ctx.lineTo(x, viewH - h);
    }
    ctx.lineTo(viewW + 20, viewH);
    ctx.closePath();
    ctx.fill();
  }

  function drawTile(ctx, ch, px, py, ts, theme){
    if(ch === '#'){
      ctx.fillStyle = theme.ground;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = theme.groundTop;
      ctx.fillRect(px, py, ts, 3);
    } else if(ch === '^'){
      ctx.fillStyle = theme.ground;
      ctx.fillRect(px, py, ts, ts);
      ctx.fillStyle = '#ff5e5e';
      ctx.beginPath();
      ctx.moveTo(px, py + ts * 0.6);
      ctx.lineTo(px + ts/2, py - 2);
      ctx.lineTo(px + ts, py + ts * 0.6);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawLevel(ctx, levelDef, level, camX, viewW, viewH){
    const theme = THEMES[level.theme] || THEMES.day;
    const ts = level.tileSize;
    const x0 = Math.floor(camX / ts), x1 = Math.ceil((camX + viewW) / ts);
    for(let ty = 0; ty < level.rows; ty++){
      for(let tx = Math.max(0,x0); tx <= Math.min(level.width - 1, x1); tx++){
        const ch = levelDef.grid[ty][tx];
        if(ch === '#' || ch === '^') drawTile(ctx, ch, tx*ts - camX, ty*ts, ts, theme);
      }
    }
    // monedas
    for(const c of level.coins){
      if(c.taken) continue;
      const x = c.x - camX;
      if(x < -10 || x > viewW + 10) continue;
      ctx.fillStyle = '#ffd35e';
      ctx.beginPath(); ctx.arc(x, c.y, c.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath(); ctx.arc(x - 1, c.y - 1, c.r*0.4, 0, Math.PI*2); ctx.fill();
    }
    // meta
    if(level.goal){
      const gx = level.goal.x - camX;
      ctx.fillStyle = '#8a8aa3';
      ctx.fillRect(gx + level.goal.w/2 - 1, level.goal.y - 26, 2, 26 + level.goal.h);
      ctx.fillStyle = '#5ee1ff';
      ctx.beginPath();
      ctx.moveTo(gx + level.goal.w/2 + 1, level.goal.y - 26);
      ctx.lineTo(gx + level.goal.w/2 + 15, level.goal.y - 20);
      ctx.lineTo(gx + level.goal.w/2 + 1, level.goal.y - 14);
      ctx.closePath(); ctx.fill();
    }
  }

  window.PD.tilemap = { isSolidAt, isHazardAt, moveAndCollide, cameraX, drawBackground, drawLevel, THEMES };
})();
