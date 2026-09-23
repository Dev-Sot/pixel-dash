// ---------- tilemap: colision, camara y dibujo de nivel ----------
// Arte real: "SunnyLand" de ansimuz (CC0). Si assets/sprites/tiles/tileset.png no
// carga (por ejemplo si se abre el juego antes de copiar los packs), se cae a
// rectangulos de color con THEMES como respaldo.
window.PD = window.PD || {};

(function(){
  const THEMES = {
    day:   { tint: null,                  ground:'#6b4a2f', groundTop:'#3f7d3b',
             tileTop:{sx:16,sy:16}, tileFill:{sx:16,sy:48} },
    dusk:  { tint: 'rgba(90,40,70,.35)',  ground:'#4a3326', groundTop:'#5c3a55',
             tileTop:{sx:16,sy:16}, tileFill:{sx:16,sy:48} },
    night: { tint: 'rgba(8,8,28,.55)',    ground:'#2a2436', groundTop:'#332c46',
             tileTop:{sx:288,sy:256}, tileFill:{sx:304,sy:256} } // piedra oscura de ruinas
  };

  const PROPS = {
    palm:  { key:'propPalm',  nw:79,  nh:176, drawH:70 },
    tree:  { key:'propTree',  nw:119, nh:111, drawH:50 },
    bush:  { key:'propBush',  nw:46,  nh:28,  drawH:16 },
    rock:  { key:'propRock',  nw:28,  nh:15,  drawH:14 },
    torch: { key:'propTorch', nw:16,  nh:16,  drawH:18 },
    house: { key:'propHouse', nw:87,  nh:108, drawH:60 }
  };
  const GEM_FW = 15, GEM_FH = 13, GEM_FRAMES = 5;

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
  // (los pinchos NO son solidos: se detectan aparte con overlapsHazard, asi
  // la rodada puede atravesarlos de verdad en vez de chocar como con una pared)
  function moveAndCollide(level, rect, dx, dy){
    const ts = level.tileSize;
    let hitX = false, hitY = false;

    rect.x += dx;
    if(dx !== 0){
      const y0 = Math.floor(rect.y / ts), y1 = Math.floor((rect.y + rect.h - 1) / ts);
      const txEdge = dx > 0 ? Math.floor((rect.x + rect.w - 1) / ts) : Math.floor(rect.x / ts);
      for(let ty = y0; ty <= y1; ty++){
        if(isSolidAt(level, txEdge, ty)){
          rect.x = dx > 0 ? txEdge * ts - rect.w : (txEdge + 1) * ts;
          hitX = true;
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
          break;
        }
      }
    }
    return { hitX, hitY };
  }

  function overlapsHazard(level, rect){
    const ts = level.tileSize;
    const x0 = Math.floor(rect.x / ts), x1 = Math.floor((rect.x + rect.w - 1) / ts);
    const y0 = Math.floor(rect.y / ts), y1 = Math.floor((rect.y + rect.h - 1) / ts);
    for(let ty = y0; ty <= y1; ty++)
      for(let tx = x0; tx <= x1; tx++)
        if(isHazardAt(level, tx, ty)) return true;
    return false;
  }

  function cameraX(level, playerX, viewW){
    return Math.max(0, Math.min(level.widthPx - viewW, playerX - viewW / 2));
  }

  function drawBackground(ctx, level, viewW, viewH, camX){
    const theme = THEMES[level.theme] || THEMES.day;
    const bg = PD.assets.get('bgBack');
    if(bg && PD.assets.ready('bgBack')){
      const scale = viewH / bg.height;
      const tileW = bg.width * scale;
      let startX = -((camX * 0.3) % tileW);
      if(startX > 0) startX -= tileW;
      for(let x = startX; x < viewW; x += tileW){
        ctx.drawImage(bg, 0, 0, bg.width, bg.height, x, 0, tileW, viewH);
      }
    } else {
      ctx.fillStyle = '#5ee1ff';
      ctx.fillRect(0, 0, viewW, viewH);
    }
    if(theme.tint){
      ctx.fillStyle = theme.tint;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  function drawProps(ctx, level, camX, viewW){
    if(!level.props) return;
    for(const p of level.props){
      const x = p.x - camX;
      if(x < -100 || x > viewW + 100) continue;
      const def = PROPS[p.type];
      if(!def) continue;
      const img = PD.assets.get(def.key);
      const drawH = def.drawH, drawW = def.nw / def.nh * drawH;
      if(img && PD.assets.ready(def.key)){
        ctx.drawImage(img, 0, 0, def.nw, def.nh, x - drawW/2, p.y - drawH, drawW, drawH);
      }
    }
  }

  function drawTile(ctx, ch, px, py, ts, theme, isTop){
    const tileset = PD.assets.get('tileset');
    const tilesetReady = tileset && PD.assets.ready('tileset');
    if(ch === '#'){
      const src = isTop ? theme.tileTop : theme.tileFill;
      if(tilesetReady) ctx.drawImage(tileset, src.sx, src.sy, 16, 16, px, py, ts, ts);
      else { ctx.fillStyle = theme.ground; ctx.fillRect(px, py, ts, ts); ctx.fillStyle = theme.groundTop; ctx.fillRect(px, py, ts, 3); }
    } else if(ch === '^'){
      if(tilesetReady) ctx.drawImage(tileset, theme.tileFill.sx, theme.tileFill.sy, 16, 16, px, py, ts, ts);
      else { ctx.fillStyle = theme.ground; ctx.fillRect(px, py, ts, ts); }
      const spikes = PD.assets.get('propSpikes');
      if(spikes && PD.assets.ready('propSpikes')){
        ctx.drawImage(spikes, 0, 0, 15, 10, px, py - 4, ts, ts * 10/15);
      } else {
        ctx.fillStyle = '#ff5e5e';
        ctx.beginPath();
        ctx.moveTo(px, py + ts * 0.6);
        ctx.lineTo(px + ts/2, py - 2);
        ctx.lineTo(px + ts, py + ts * 0.6);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  function drawLevel(ctx, levelDef, level, camX, viewW, viewH){
    const theme = THEMES[level.theme] || THEMES.day;
    const ts = level.tileSize;

    drawProps(ctx, level, camX, viewW);

    const x0 = Math.floor(camX / ts), x1 = Math.ceil((camX + viewW) / ts);
    for(let ty = 0; ty < level.rows; ty++){
      for(let tx = Math.max(0,x0); tx <= Math.min(level.width - 1, x1); tx++){
        const ch = levelDef.grid[ty][tx];
        if(ch === '#' || ch === '^'){
          const isTop = ty === 0 || levelDef.grid[ty-1][tx] === '.';
          drawTile(ctx, ch, tx*ts - camX, ty*ts, ts, theme, isTop);
        }
      }
    }

    // monedas
    const gem = PD.assets.get('itemGem'), gemReady = gem && PD.assets.ready('itemGem');
    const gemFrame = Math.floor(Date.now() / 120) % GEM_FRAMES;
    for(const c of level.coins){
      if(c.taken) continue;
      const x = c.x - camX;
      if(x < -10 || x > viewW + 10) continue;
      if(gemReady){
        ctx.drawImage(gem, gemFrame*GEM_FW, 0, GEM_FW, GEM_FH, x - GEM_FW/2, c.y - GEM_FH/2, GEM_FW, GEM_FH);
      } else {
        ctx.fillStyle = '#ffd35e';
        ctx.beginPath(); ctx.arc(x, c.y, c.r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff3c4';
        ctx.beginPath(); ctx.arc(x - 1, c.y - 1, c.r*0.4, 0, Math.PI*2); ctx.fill();
      }
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

  window.PD.tilemap = { isSolidAt, isHazardAt, moveAndCollide, overlapsHazard, cameraX, drawBackground, drawLevel, THEMES };
})();
