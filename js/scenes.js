// ---------- maquina de estados: menu / playing / paused / levelComplete / gameOver / victory / credits ----------
window.PD = window.PD || {};

(function(){
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'pixelDashProgress';

  let state = 'menu';
  let levelIndex = 0;
  let levelDef = null, level = null, player = null, particles = [];
  let camX = 0, coinsThisLevel = 0, totalCoinsInLevel = 0;
  let progress = { unlocked: 0, bestCoins: [] };

  function loadProgress(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) progress = JSON.parse(raw);
    }catch(e){}
    if(!progress.bestCoins) progress.bestCoins = [];
  }
  function saveProgress(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }catch(e){}
  }

  function hideAllOverlays(){
    ['startOverlay','creditsOverlay','pauseOverlay','levelCompleteOverlay','gameOverOverlay','victoryOverlay']
      .forEach(id => $(id) && $(id).classList.add('hidden'));
  }
  function show(id){ hideAllOverlays(); const el = $(id); if(el) el.classList.remove('hidden'); }

  function goMenu(){
    state = 'menu';
    PD.audio.stopMusic();
    $('hud').classList.add('hidden');
    updateMenuLevelButtons();
    show('startOverlay');
  }

  function updateMenuLevelButtons(){
    const wrap = $('levelSelect');
    if(!wrap) return;
    wrap.innerHTML = '';
    PD.LEVELS.forEach((lv, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn small';
      btn.textContent = (i+1) + (i > progress.unlocked ? ' 🔒' : '');
      btn.disabled = i > progress.unlocked;
      btn.addEventListener('click', () => startLevel(i));
      wrap.appendChild(btn);
    });
  }

  function startLevel(index){
    levelIndex = index;
    levelDef = PD.LEVELS[index];
    level = PD.parseLevel(levelDef);
    player = PD.player.createPlayer(level.playerStart.x, level.playerStart.y);
    particles = [];
    camX = 0;
    coinsThisLevel = 0;
    totalCoinsInLevel = level.coins.length;
    state = 'playing';
    hideAllOverlays();
    $('hud').classList.remove('hidden');
    updateHud();
    PD.audio.ensureAudio();
    PD.audio.setTrack(level.music);
    PD.audio.startMusic();
  }

  function restartLevel(){ startLevel(levelIndex); }

  function updateHud(){
    $('levelLabel').textContent = levelDef.name;
    $('coinLabel').textContent = '✦ ' + coinsThisLevel + '/' + totalCoinsInLevel;
  }

  function pause(){
    if(state !== 'playing') return;
    state = 'paused';
    PD.audio.pauseMusic();
    show('pauseOverlay');
  }
  function resume(){
    if(state !== 'paused') return;
    state = 'playing';
    hideAllOverlays();
    $('hud').classList.remove('hidden');
    PD.audio.resumeMusic();
  }

  function onHazard(){
    state = 'gameOver';
    PD.audio.stopMusic();
    PD.audio.sfxHit();
    show('gameOverOverlay');
  }

  function onLevelComplete(){
    if(coinsThisLevel > (progress.bestCoins[levelIndex] || 0)) progress.bestCoins[levelIndex] = coinsThisLevel;
    if(progress.unlocked < levelIndex + 1) progress.unlocked = Math.min(levelIndex + 1, PD.LEVELS.length - 1);
    saveProgress();
    PD.audio.stopMusic();
    PD.audio.sfxJingleGood();
    if(levelIndex >= PD.LEVELS.length - 1){
      state = 'victory';
      show('victoryOverlay');
    } else {
      state = 'levelComplete';
      $('completeCoins').textContent = coinsThisLevel + '/' + totalCoinsInLevel;
      show('levelCompleteOverlay');
    }
  }

  function update(dtFrames){
    if(state !== 'playing') return;
    if(PD.input.consumePausePressed()){ pause(); return; }

    const result = PD.player.update(player, level, dtFrames, PD.input, particles);
    if(result.coinsGot.length){
      coinsThisLevel += result.coinsGot.length;
      PD.audio.sfxCoin();
      updateHud();
    }
    if(result.hazard || result.fellOff){ onHazard(); return; }
    if(result.reachedGoal){ onLevelComplete(); return; }

    camX = PD.tilemap.cameraX(level, player.x, PD.VIEW_W);

    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--; });
    particles = particles.filter(p => p.life > 0);
  }

  function draw(ctx){
    ctx.clearRect(0, 0, PD.VIEW_W, PD.VIEW_H);
    if(state !== 'playing' && state !== 'paused') return;
    PD.tilemap.drawBackground(ctx, level, PD.VIEW_W, PD.VIEW_H, camX);
    PD.tilemap.drawLevel(ctx, levelDef, level, camX, PD.VIEW_W, PD.VIEW_H);
    for(const p of particles){
      ctx.globalAlpha = Math.max(0, p.life / 20);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - camX), Math.round(p.y), p.size, p.size);
      ctx.globalAlpha = 1;
    }
    PD.player.draw(ctx, player, camX);
  }

  function bindButtons(){
    $('startBtn').addEventListener('click', () => startLevel(0));
    $('creditsBtn').addEventListener('click', () => show('creditsOverlay'));
    $('creditsBackBtn').addEventListener('click', () => goMenu());
    $('pauseBtn').addEventListener('click', () => pause());
    $('resumeBtn').addEventListener('click', () => resume());
    $('restartBtn').addEventListener('click', () => { hideAllOverlays(); $('hud').classList.remove('hidden'); restartLevel(); });
    $('menuFromPause').addEventListener('click', () => goMenu());
    $('nextLevelBtn').addEventListener('click', () => startLevel(levelIndex + 1));
    $('menuFromComplete').addEventListener('click', () => goMenu());
    $('retryBtn').addEventListener('click', () => restartLevel());
    $('menuFromOver').addEventListener('click', () => goMenu());
    $('menuFromVictory').addEventListener('click', () => goMenu());
    $('muteBtn').addEventListener('click', () => {
      const muted = !PD.audio.isMuted();
      PD.audio.setMuted(muted);
      $('muteBtn').textContent = muted ? '🔇' : '🔊';
      if(!muted && state === 'playing') PD.audio.startMusic();
    });
  }

  window.PD.scenes = {
    init(){ loadProgress(); bindButtons(); PD.input.init(); goMenu(); },
    update, draw,
    get state(){ return state; }
  };
})();
