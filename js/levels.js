// ---------- level data ----------
// Grid legend: '.' aire  '#' suelo/plataforma solida  '^' pincho (letal)
// 'o' moneda  'F' meta  'P' punto de partida del jugador
window.PD = window.PD || {};

(function(){
  const ROWS = 11; // alto fijo del nivel en tiles (11*16 = 176px de buffer interno)

  function newGrid(width){
    const g = [];
    for(let y=0;y<ROWS;y++) g.push(new Array(width).fill('.'));
    return g;
  }
  function floorRange(g, x1, x2){
    for(let x=x1; x<=x2; x++){ g[ROWS-2][x] = '#'; g[ROWS-1][x] = '#'; }
  }
  function platform(g, x1, x2, y){
    for(let x=x1; x<=x2; x++) g[y][x] = '#';
  }
  function coinsRow(g, x1, x2, y){
    for(let x=x1; x<=x2; x++) g[y][x] = 'o';
  }
  function put(g, x, y, ch){ g[y][x] = ch; }

  // ---------- nivel 1: Bosque de entrada ----------
  function buildLevel1(){
    const W = 50;
    const g = newGrid(W);
    floorRange(g, 0, 14);
    put(g, 1, ROWS-3, 'P');
    coinsRow(g, 5, 7, 6);
    put(g, 10, ROWS-3, '^');
    // hueco 1
    floorRange(g, 17, 30);
    platform(g, 20, 22, 6);
    coinsRow(g, 20, 22, 5);
    // hueco 2
    floorRange(g, 33, 49);
    platform(g, 40, 41, 7);
    platform(g, 43, 44, 6);
    coinsRow(g, 43, 44, 5);
    put(g, 47, ROWS-3, 'F');
    const groundY = (ROWS-2) * 16;
    return {
      name: 'Nivel 1 - Bosque de entrada', tileSize: 16, rows: ROWS, width: W, grid: g, theme: 'day',
      music: 'assets/audio/music/level1-day.ogg',
      props: [
        { type:'palm', x: 4*16, y: groundY }, { type:'bush', x: 8*16, y: groundY },
        { type:'tree', x: 24*16, y: groundY }, { type:'rock', x: 36*16, y: groundY },
        { type:'palm', x: 45*16, y: groundY }, { type:'bush', x: 12*16, y: groundY }
      ]
    };
  }

  // ---------- nivel 2: Colinas rotas ----------
  function buildLevel2(){
    const W = 64;
    const g = newGrid(W);
    floorRange(g, 0, 10);
    put(g, 1, ROWS-3, 'P');
    coinsRow(g, 3, 5, 6);
    put(g, 8, ROWS-3, '^');
    // hueco (3 de ancho)
    floorRange(g, 14, 20);
    platform(g, 16, 17, 6);
    coinsRow(g, 16, 17, 5);
    // hueco (3 de ancho)
    floorRange(g, 24, 34);
    put(g, 27, ROWS-3, '^');
    put(g, 30, ROWS-3, '^');
    platform(g, 32, 33, 5);
    coinsRow(g, 32, 33, 4);
    // hueco (2 de ancho)
    floorRange(g, 37, 50);
    platform(g, 40, 41, 7);
    platform(g, 43, 44, 5);
    coinsRow(g, 43, 44, 4);
    platform(g, 47, 48, 7);
    // hueco (3 de ancho)
    floorRange(g, 54, 63);
    coinsRow(g, 56, 58, 6);
    put(g, 61, ROWS-3, 'F');
    const groundY = (ROWS-2) * 16;
    return {
      name: 'Nivel 2 - Colinas rotas', tileSize: 16, rows: ROWS, width: W, grid: g, theme: 'dusk',
      music: 'assets/audio/music/level2-dusk.ogg',
      props: [
        { type:'tree', x: 3*16, y: groundY }, { type:'rock', x: 8*16, y: groundY },
        { type:'bush', x: 17*16, y: groundY }, { type:'palm', x: 28*16, y: groundY },
        { type:'rock', x: 40*16, y: groundY }, { type:'tree', x: 47*16, y: groundY },
        { type:'bush', x: 57*16, y: groundY }
      ]
    };
  }

  // ---------- nivel 3: Torre final ----------
  function buildLevel3(){
    const W = 78;
    const g = newGrid(W);
    floorRange(g, 0, 9);
    put(g, 1, ROWS-3, 'P');
    put(g, 6, ROWS-3, '^');
    // hueco
    floorRange(g, 13, 18);
    platform(g, 14, 15, 6);
    coinsRow(g, 14, 15, 5);
    // hueco
    floorRange(g, 22, 26);
    put(g, 24, ROWS-3, '^');
    // hueco
    platform(g, 30, 31, 8);
    platform(g, 34, 35, 6);
    coinsRow(g, 34, 35, 5);
    platform(g, 38, 39, 8);
    // hueco
    floorRange(g, 43, 50);
    put(g, 45, ROWS-3, '^');
    put(g, 48, ROWS-3, '^');
    coinsRow(g, 46, 47, 6);
    // hueco
    platform(g, 54, 55, 8);
    platform(g, 58, 59, 6);
    platform(g, 62, 63, 4);
    coinsRow(g, 62, 63, 3);
    platform(g, 66, 67, 6);
    // hueco final
    floorRange(g, 71, 77);
    coinsRow(g, 72, 75, 6);
    put(g, 75, ROWS-3, 'F');
    const groundY = (ROWS-2) * 16;
    return {
      name: 'Nivel 3 - Torre final', tileSize: 16, rows: ROWS, width: W, grid: g, theme: 'night',
      music: 'assets/audio/music/level3-night.ogg',
      props: [
        { type:'rock', x: 3*16, y: groundY }, { type:'tree', x: 8*16, y: groundY },
        { type:'bush', x: 15*16, y: groundY }, { type:'rock', x: 24*16, y: groundY },
        { type:'palm', x: 46*16, y: groundY }, { type:'tree', x: 74*16, y: groundY }
      ]
    };
  }

  window.PD.LEVELS = [buildLevel1(), buildLevel2(), buildLevel3()];

  // convierte la grilla de un nivel en estructuras listas para jugar
  window.PD.parseLevel = function(levelDef){
    const { grid, tileSize, width, rows } = levelDef;
    const solids = [];
    const hazards = [];
    const coins = [];
    let goal = null, playerStart = { x: 1 * tileSize, y: (rows - 3) * tileSize };

    for(let y = 0; y < rows; y++){
      solids.push(new Array(width).fill(false));
      hazards.push(new Array(width).fill(false));
      for(let x = 0; x < width; x++){
        const ch = grid[y][x];
        if(ch === '#') solids[y][x] = true;
        else if(ch === '^'){ solids[y][x] = true; hazards[y][x] = true; }
        else if(ch === 'o') coins.push({ x: x * tileSize + tileSize/2, y: y * tileSize + tileSize/2, r: 4, taken: false });
        else if(ch === 'F') goal = { x: x * tileSize, y: y * tileSize, w: tileSize, h: tileSize };
        else if(ch === 'P') playerStart = { x: x * tileSize, y: y * tileSize };
      }
    }
    return {
      name: levelDef.name, tileSize, rows, width,
      widthPx: width * tileSize, heightPx: rows * tileSize,
      solids, hazards, coins, goal, playerStart, theme: levelDef.theme,
      music: levelDef.music, props: levelDef.props
    };
  };
})();
