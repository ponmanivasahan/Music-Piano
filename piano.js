const Piano=()=>{
  const keyEls=Array.from(document.querySelectorAll('.key'));
  const keyMap={};
  const heldKeys=new Set();
  let mouseDown=false;
  let labelsOn=true;

  keyEls.forEach(el=>keyMap[el.dataset.key]=el);

  function release(el){
    if(el) el.classList.remove('pressed');
  }

  function releaseAll(){
    keyEls.forEach(release);
  }

  function press(el){
    if(!el || el.classList.contains('pressed')) return;
    el.classList.add('pressed');
    const freq=parseFloat(el.dataset.freq);
    const key=el.dataset.key;
    AudioEngine.play(freq,key);
  }

  keyEls.forEach(el=>{
    el.addEventListener('mousedown',e=>{
      e.preventDefault();
      mouseDown=true;
      press(el);
    });
    el.addEventListener('mouseenter',()=>{
      if(mouseDown) press(el);
    });
    el.addEventListener('mouseleave',()=>release(el));
    el.addEventListener('mouseup',()=>{
      mouseDown=false;
      release(el);
    });
  });

  window.addEventListener('mouseup',()=>{
    mouseDown=false;
    releaseAll();
  });

  const wrap=document.getElementById('keysWrap');
  function onTouch(e){
    e.preventDefault();
    releaseAll();
    Array.from(e.touches).forEach(touch=>{
      const target=document.elementFromPoint(touch.clientX,touch.clientY);
      const keyEl=target && (target.classList.contains('key') ? target : target.parentElement?.classList.contains('key') ? target.parentElement : null);
      if(keyEl) press(keyEl);
    });
  }

  if(wrap){
    wrap.addEventListener('touchstart',onTouch,{passive:false});
    wrap.addEventListener('touchmove',onTouch,{passive:false});
    wrap.addEventListener('touchend',e=>{
      e.preventDefault();
      releaseAll();
    },{passive:false});
  }

  document.addEventListener('keydown',e=>{
    if(e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const k=e.key.toLowerCase();
    if(heldKeys.has(k)) return;
    const el=keyMap[k] || keyMap[e.key];
    if(el){
      heldKeys.add(k);
      press(el);
    }
  });

  document.addEventListener('keyup',e=>{
    const k=e.key.toLowerCase();
    heldKeys.delete(k);
    const el=keyMap[k] || keyMap[e.key];
    if(el) release(el);
  });

  function toggleLabels(){
    labelsOn=!labelsOn;
    keyEls.forEach(el=>el.classList.toggle('hide-labels',!labelsOn));
    return labelsOn;
  }

  return {toggleLabels,releaseAll};
};