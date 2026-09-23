// ---------- input: teclado + botones tactiles ----------
window.PD = window.PD || {};

(function(){
  const keys = { left: false, right: false, jumpHeld: false };
  let jumpPressed = false; // flanco de subida, se consume en update()
  let rollPressed = false;
  let pausePressed = false;

  window.addEventListener('keydown', (e) => {
    if(['ArrowLeft','KeyA'].includes(e.code)) keys.left = true;
    if(['ArrowRight','KeyD'].includes(e.code)) keys.right = true;
    if(['Space','ArrowUp','KeyW'].includes(e.code)){
      e.preventDefault();
      if(!keys.jumpHeld) jumpPressed = true;
      keys.jumpHeld = true;
    }
    if(['ShiftLeft','ShiftRight','KeyX'].includes(e.code)){ e.preventDefault(); rollPressed = true; }
    if(e.code === 'Escape' || e.code === 'KeyP') pausePressed = true;
  });
  window.addEventListener('keyup', (e) => {
    if(['ArrowLeft','KeyA'].includes(e.code)) keys.left = false;
    if(['ArrowRight','KeyD'].includes(e.code)) keys.right = false;
    if(['Space','ArrowUp','KeyW'].includes(e.code)) keys.jumpHeld = false;
  });

  function bindHold(el, onDown, onUp){
    if(!el) return;
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); onDown(); });
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onUp);
    el.addEventListener('pointercancel', onUp);
  }
  function bindTap(el, onTap){
    if(!el) return;
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); onTap(); });
  }

  window.PD.input = {
    init(){
      bindHold(document.getElementById('leftBtn'), () => keys.left = true, () => keys.left = false);
      bindHold(document.getElementById('rightBtn'), () => keys.right = true, () => keys.right = false);
      bindHold(document.getElementById('jumpBtn'),
        () => { if(!keys.jumpHeld) jumpPressed = true; keys.jumpHeld = true; },
        () => keys.jumpHeld = false);
      bindTap(document.getElementById('rollBtn'), () => rollPressed = true);
    },
    get left(){ return keys.left; },
    get right(){ return keys.right; },
    get jumpHeld(){ return keys.jumpHeld; },
    consumeJumpPressed(){ if(jumpPressed){ jumpPressed = false; return true; } return false; },
    consumeRollPressed(){ if(rollPressed){ rollPressed = false; return true; } return false; },
    consumePausePressed(){ if(pausePressed){ pausePressed = false; return true; } return false; },
    forceJump(){ jumpPressed = true; }
  };
})();
