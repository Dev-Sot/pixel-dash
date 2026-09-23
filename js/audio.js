// ---------- audio (sintetizado por defecto; se puede reemplazar por archivos reales) ----------
window.PD = window.PD || {};

(function(){
  let actx = null, muted = false, musicTimer = null;
  let musicFile = null;
  const sfxFiles = {
    jump: 'assets/audio/sfx/jump.wav',
    coin: 'assets/audio/sfx/coin.wav',
    hit: 'assets/audio/sfx/hit.wav'
  };

  function ensureAudio(){
    if(!actx){
      try{ actx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ actx = null; }
    }
    if(actx && actx.state === 'suspended') actx.resume();
  }

  function beep(freq, dur, type, vol, glide){
    if(muted || !actx) return;
    const t0 = actx.currentTime;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if(glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(actx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function playFileSfx(key){
    const src = sfxFiles[key];
    if(!src || muted) return false;
    try{
      const a = new Audio(src); a.volume = 0.5;
      const p = a.play();
      if(p && p.catch) p.catch(() => {});
      return true;
    }catch(e){ return false; }
  }

  function sfxJump(){ if(!playFileSfx('jump')) beep(420, 0.14, 'square', 0.14, 760); }
  function sfxCoin(){ if(!playFileSfx('coin')){ beep(880, 0.08, 'square', 0.12, 1320); setTimeout(()=>beep(1320,0.08,'square',0.1), 60); } }
  function sfxHit(){ if(!playFileSfx('hit')) beep(160, 0.35, 'sawtooth', 0.18, 40); }
  function sfxJingleGood(){ beep(523,0.1,'square',0.12,660); setTimeout(()=>beep(659,0.1,'square',0.12),100); setTimeout(()=>beep(880,0.18,'square',0.12),200); }
  function sfxJingleBad(){ beep(200,0.2,'sawtooth',0.15,80); }

  let musicEl = null;
  function startMusic(){
    if(muted) return;
    stopMusic();
    if(musicFile){
      try{
        musicEl = new Audio(musicFile);
        musicEl.loop = true; musicEl.volume = 0.35;
        const p = musicEl.play();
        if(p && p.catch) p.catch(() => {}); // evita rechazo no manejado si se pausa antes de arrancar
        return;
      }catch(e){ musicEl = null; }
    }
    ensureAudio();
    if(!actx) return;
    const notes = [220,220,262,220,196,220,262,294];
    let i = 0;
    musicTimer = setInterval(() => {
      if(muted) return;
      const t0 = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[i % notes.length], t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.05, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
      osc.connect(gain).connect(actx.destination);
      osc.start(t0); osc.stop(t0 + 0.3);
      i++;
    }, 260);
  }
  function stopMusic(){
    if(musicTimer){ clearInterval(musicTimer); musicTimer = null; }
    if(musicEl){ musicEl.pause(); musicEl = null; }
  }
  function pauseMusic(){ if(musicEl) musicEl.pause(); if(musicTimer){ clearInterval(musicTimer); musicTimer = null; } }
  function resumeMusic(){ if(!muted) startMusic(); }

  window.PD.audio = {
    ensureAudio, sfxJump, sfxCoin, sfxHit, sfxJingleGood, sfxJingleBad,
    startMusic, stopMusic, pauseMusic, resumeMusic,
    setTrack(src){ musicFile = src || null; },
    isMuted(){ return muted; },
    setMuted(v){ muted = v; if(muted) stopMusic(); }
  };
})();
