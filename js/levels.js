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

  // Los pinchos ('^') no son solidos: matan al tocarlos, pero rodar (Shift/X)
  // los atraviesa sin morir. Cada nivel ensena/usa eso a proposito.
  function spikeRow(g, x1, x2, y){ for(let x=x1; x<=x2; x++) g[y][x] = '^'; }

  // ---------- nivel 1: Bosque de entrada (dia, tutorial) ----------
  function buildLevel1(){
    const W = 56;
    const g = newGrid(W);
    floorRange(g, 0, 14);
    put(g, 1, ROWS-3, 'P');
    coinsRow(g, 5, 7, 6);
    put(g, 10, ROWS-3, '^'); // primer pincho: se salta o se rueda, cualquiera funciona
    // hueco 1 (2 de ancho) - salto basico
    floorRange(g, 17, 35);
    platform(g, 20, 22, 6);
    coinsRow(g, 20, 22, 5);
    // fila de 3 pinchos: mas facil rodar por debajo que saltarlos uno a uno
    spikeRow(g, 26, 28, ROWS-3);
    coinsRow(g, 26, 28, ROWS-6);
    // hueco 2 (2 de ancho)
    floorRange(g, 38, 55);
    platform(g, 41, 42, 7);
    platform(g, 44, 45, 6);
    coinsRow(g, 44, 45, 5);
    put(g, 53, ROWS-3, 'F');
    const groundY = (ROWS-2) * 16;
    return {
      name: 'Nivel 1 - Bosque de entrada', tileSize: 16, rows: ROWS, width: W, grid: g, theme: 'day',
      music: 'assets/audio/music/level1-day.ogg',
      chapter: 'Capítulo 1',
      story: [
        'Hace generaciones, tres faros de cristal mantenían dormida la Marea Oscura que rodea estas islas. Uno a uno, los faros se apagaron, y el mar empezó a tragarse la costa.',
        'La última guardiana entrenada en el uso de la espada de luz desembarca en el Bosque de Entrada con una sola misión: volver a encender los faros antes de que la marea alcance el corazón del archipiélago.',
        '(Cuentan que su creador, Dev-Sot, estaba profundamente dormido cuando terminó de programar todo esto. Con un poco de suerte, no se nota.)'
      ],
      props: [
        { type:'palm', x: 4*16, y: groundY }, { type:'bush', x: 8*16, y: groundY },
        { type:'tree', x: 24*16, y: groundY }, { type:'rock', x: 36*16, y: groundY },
        { type:'palm', x: 50*16, y: groundY }, { type:'bush', x: 12*16, y: groundY }
      ]
    };
  }

  // ---------- nivel 2: Colinas rotas (atardecer, la marea reclamo el camino) ----------
  function buildLevel2(){
    const W = 72;
    const g = newGrid(W);
    floorRange(g, 0, 14);
    put(g, 1, ROWS-3, 'P');
    coinsRow(g, 3, 5, 6);
    put(g, 8, ROWS-3, '^');
    // hueco (2 de ancho) - siempre con varios tiles de piso libre antes,
    // para aterrizar del salto anterior y decidir de nuevo con el pie en el suelo
    floorRange(g, 17, 32);
    platform(g, 20, 21, 6);
    coinsRow(g, 20, 21, 5);
    spikeRow(g, 26, 27, ROWS-3);
    // hueco (2 de ancho)
    floorRange(g, 35, 50);
    spikeRow(g, 42, 45, ROWS-3);
    platform(g, 39, 40, 7);
    coinsRow(g, 39, 40, 6);
    // hueco (2 de ancho)
    floorRange(g, 53, 71);
    put(g, 58, ROWS-3, '^');
    put(g, 62, ROWS-3, '^');
    coinsRow(g, 66, 68, 6);
    put(g, 69, ROWS-3, 'F');
    const groundY = (ROWS-2) * 16;
    return {
      name: 'Nivel 2 - Colinas rotas', tileSize: 16, rows: ROWS, width: W, grid: g, theme: 'dusk',
      music: 'assets/audio/music/level2-dusk.ogg',
      chapter: 'Capítulo 2',
      story: [
        'El primer faro vuelve a arder. Pero Colinas Rotas ya no es el camino seguro que era: la marea reclamó los puentes, y donde antes crecía musgo ahora crecen pinchos.',
        'Cada gema que recoge en el camino no es solo un tesoro: es una chispa de luz robada a la oscuridad, la energía que necesita el siguiente faro para volver a arder.'
      ],
      props: [
        { type:'tree', x: 3*16, y: groundY }, { type:'rock', x: 12*16, y: groundY },
        { type:'palm', x: 35*16, y: groundY }, { type:'rock', x: 48*16, y: groundY },
        { type:'tree', x: 57*16, y: groundY }, { type:'bush', x: 65*16, y: groundY }
      ]
    };
  }

  // ---------- nivel 3: Torre final (noche, escalada hasta el ultimo faro) ----------
  function buildLevel3(){
    const W = 90;
    const g = newGrid(W);
    floorRange(g, 0, 9);
    put(g, 1, ROWS-3, 'P');
    spikeRow(g, 5, 6, ROWS-3);
    // hueco (3, probado)
    floorRange(g, 13, 20);
    platform(g, 14, 15, 6);
    coinsRow(g, 14, 15, 5);
    // escalon unico (sin hueco) hacia una meseta elevada: el salto ahora
    // tiene mucho margen vertical, cualquier altura de un solo escalon se
    // cruza facil - lo dificil son los huecos, no la subida
    const PLATEAU = ROWS - 5;
    platform(g, 21, 33, PLATEAU);
    coinsRow(g, 24, 26, PLATEAU - 1);
    spikeRow(g, 29, 30, PLATEAU);
    // hueco normal (3, ya probado) dentro de la meseta
    platform(g, 37, 48, PLATEAU);
    coinsRow(g, 40, 42, PLATEAU - 1);
    spikeRow(g, 44, 46, PLATEAU);
    // bajada (escalon, sin hueco exigente) de vuelta al piso normal
    floorRange(g, 52, 64);
    spikeRow(g, 55, 58, ROWS-3);
    coinsRow(g, 55, 58, ROWS-6);
    // hueco final (3, ya probado) antes de la plataforma de la meta
    floorRange(g, 68, 89);
    spikeRow(g, 71, 73, ROWS-3);
    coinsRow(g, 71, 73, ROWS-6);
    put(g, 87, ROWS-3, 'F');
    const groundY = (ROWS-2) * 16;
    return {
      name: 'Nivel 3 - Torre final', tileSize: 16, rows: ROWS, width: W, grid: g, theme: 'night',
      music: 'assets/audio/music/level3-night.ogg',
      chapter: 'Capítulo 3',
      story: [
        'En la cima del último faro espera aquello que los apagó la primera vez. No un monstruo cualquiera: el guardián que los faros dejaron atrás, ahora tan hambriento de luz como la propia marea.',
        'Esta es la última subida.'
      ],
      props: [
        { type:'rock', x: 3*16, y: groundY }, { type:'tree', x: 9*16, y: groundY },
        { type:'rock', x: 43*16, y: groundY }, { type:'bush', x: 53*16, y: groundY },
        { type:'palm', x: 79*16, y: groundY }, { type:'tree', x: 88*16, y: groundY }
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
        else if(ch === '^') hazards[y][x] = true; // no es solido: se puede atravesar rodando
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
