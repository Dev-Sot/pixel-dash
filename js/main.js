// ---------- bootstrap + loop ----------
window.PD = window.PD || {};

(function(){
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  PD.VIEW_W = 336; PD.VIEW_H = 176; // 21 x 11 tiles de 16px
  canvas.width = PD.VIEW_W; canvas.height = PD.VIEW_H;
  ctx.imageSmoothingEnabled = false;

  PD.scenes.init();

  let last = 0;
  function loop(ts){
    if(!last) last = ts;
    let dtFrames = (ts - last) / (1000 / 60);
    dtFrames = Math.max(0, Math.min(3, dtFrames));
    last = ts;

    PD.scenes.update(dtFrames);
    PD.scenes.draw(ctx);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
