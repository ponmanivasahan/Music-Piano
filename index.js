const piano=Piano();

const volSlider=document.getElementById('volSlider');
const volVal=document.getElementById('volVal');
volSlider.addEventListener('input',e=>{
    const v=e.target.value/100;
    AudioEngine.setVolume(v);
    e.target.style.setProperty('--pct',e.target.value+'%');
    volVal.textContent=e.target.value;
})
volSlider.style.setProperty('--pct','80%');

const showKeysBtn=document.getElementById('showKeysBtn');
if(showKeysBtn){
    showKeysBtn.addEventListener('click',()=>{
        const enabled=piano.toggleLabels();
        showKeysBtn.classList.toggle('on',enabled);
        showKeysBtn.setAttribute('aria-checked',String(enabled));
    });
}

const discoBtn=document.getElementById('discoBtn');
if(discoBtn){
    discoBtn.addEventListener('click',()=>{
        const on=Disco.toggle();
        discoBtn.classList.remove('on');
        discoBtn.classList.toggle('disco-on',on);
        discoBtn.setAttribute('aria-checked',on ? 'true' :'false');
    });
}

const themeBtn=document.getElementById('themeBtn');
const html=document.documentElement;
(()=>{
    const saved=localStorage.getItem('melodify-theme') || 'light';
    html.dataset.theme=saved;
    if(saved==='dark'){
        themeBtn.classList.add('on');
        themeBtn.setAttribute('aria-checked','true');
    }
})();

if(themeBtn){
    themeBtn.addEventListener('click',()=>{
        const isDark=html.dataset.theme==='dark';
        html.dataset.theme=isDark ? 'light' :'dark';
        localStorage.setItem('melodify-theme',html.dataset.theme);
        themeBtn.classList.toggle('on',!isDark);
        themeBtn.setAttribute('aria-checked',String(!isDark));
        if(Disco.isOn && typeof Disco.refreshBackground==='function'){
            Disco.refreshBackground();
        }
        resizeKeys();
    })
}

const rotateTryBtn=document.getElementById('rotateTryBtn');
if(rotateTryBtn){
    rotateTryBtn.addEventListener('click',async()=>{
        try{
            await document.documentElement.requestFullscreen();
            if(screen.orientation &&  screen.orientation.lock==='function'){
                  await screen.orientation.lock('landscape')
            }
        }
        catch(e){}
    })
}

Promise.all([document.fonts.ready, new Promise(res=> setTimeout(res,2200))])
.then(()=>{
    const loader=document.getElementById('loader');
    if(loader){
        loader.classList.add('hidden')
    }
    setTimeout(()=>{
        resizeKeys();
        const c4=document.querySelector('[data-note="C4"]');
        const wrap=document.getElementById('keysWrap');
        if(c4 && wrap){
            wrap.scrollLeft=Math.max(0,c4.offsetLeft-wrap.offsetWidth/2+22);
        }
    },300);
})

const OCTAVE_DEFS=[
    {label:'C4 - B4', notePrefix:'4'},
    {label:'C5 - E5', notePrefix:'5'},
]

let curOct=0;
let octMode=false;

(()=>{
    const dotsEl=document.getElementById('octDots');
    if(!dotsEl) return;
    OCTAVE_DEFS.forEach((_,i)=>{
        const dot=document.createElement('div');
        dot.className='oct-dot' + (i === curOct ? ' active' : '');
        dot.title=OCTAVE_DEFS[i].label;
        dot.addEventListener('click',()=>jumpOct(i));
        dotsEl.appendChild(dot);
    })
})();

function jumpOct(idx) {
    curOct = Math.max(0, Math.min(OCTAVE_DEFS.length - 1, idx));
    updateOctNav();
    applyOctave();
}
 
function updateOctNav() {
    const lbl  = document.getElementById('octLabel');
    const prev = document.getElementById('octPrev');
    const next = document.getElementById('octNext');
 
    if (lbl) lbl.textContent = OCTAVE_DEFS[curOct].label;
    if (prev) prev.disabled   = (curOct === 0);
    if (next) next.disabled   = (curOct === OCTAVE_DEFS.length - 1);
 
    document.querySelectorAll('.oct-dot').forEach((d, i) =>
        d.classList.toggle('active', i === curOct));
}

function applyOctave(){
    if(!octMode) return;
    const prefix=OCTAVE_DEFS[curOct].notePrefix;
    document.querySelectorAll('#keysInner .key').forEach(el=>{
        const note=el.dataset.note || '';
        el.style.display=note.endsWith(prefix) ? '' : 'none';
    })
}

function showAllKeys() {
    document.querySelectorAll('#keysInner .key').forEach(el => {
        el.style.display = '';
    });
}

const octPrevBtn=document.getElementById('octPrev');
const octnextBtn=document.getElementById('octNext');
if (octPrevBtn) octPrevBtn.addEventListener('click', () => jumpOct(curOct - 1));
if (octnextBtn) octnextBtn.addEventListener('click', () => jumpOct(curOct + 1));

function resizeKeys() {
    const wrap = document.getElementById('keysWrap');
    const card = wrap && wrap.closest('.piano-card');
    if (!wrap || !card) return;

    const avail = card.clientWidth - 36 - 12;
    const gap   = avail < 360 ? 1 : 2;
    const allowOctMode = window.matchMedia('(max-width: 680px)').matches;
     const allWhite = Array.from(document.querySelectorAll('#keysInner .key.white'));
    const visWhite = octMode
        ? allWhite.filter(el => el.style.display !== 'none')
        : allWhite;
    const numWhite = visWhite.length || 12;
 
    let wkw = Math.floor((avail - (numWhite - 1) * gap) / numWhite);
 
    const MIN_KEY = 26;
 
    if (allowOctMode && !octMode && wkw < MIN_KEY) {
        octMode = true;
        applyOctave();
        const nav = document.getElementById('octNav');
        if (nav) nav.style.display = 'flex';
        updateOctNav();
 
        wkw = Math.floor((avail - 6 * gap) / 7);
        wkw = Math.max(MIN_KEY, wkw);
 
    } else if (octMode && (!allowOctMode || wkw >= MIN_KEY)) {
        octMode = false;
        showAllKeys();
        const nav = document.getElementById('octNav');
        if (nav) nav.style.display = 'none';
    }
 
    wkw = Math.min(52, wkw);

    const wkh    = Math.min(188, Math.round(wkw * 4.3));
    const bkw    = Math.round(wkw * 0.63);                  
    const bkh    = Math.round(wkh * 0.632);                
    const bkml   = -Math.round((bkw + gap) / 2);
    const bkmr   =  Math.round((gap - bkw) / 2);
    const kfont  = Math.max(6, Math.round(wkw * 0.18));
    const cdotBot = Math.max(14, Math.round(wkh * 0.14));
 
    const root = document.documentElement;
    root.style.setProperty('--wkw',wkw+'px');
    root.style.setProperty('--wkh',wkh+'px');
    root.style.setProperty('--bkw',bkw+'px');
    root.style.setProperty('--bkh',bkh+'px');
    root.style.setProperty('--bkml',bkml+'px');
    root.style.setProperty('--bkmr',bkmr+'px');
    root.style.setProperty('--kgap',gap+'px');
    root.style.setProperty('--kfont',kfont+'px');
    root.style.setProperty('--cdot-bot',cdotBot+'px');
    wrap.style.height = (wkh + 16) + 'px';
}
window.addEventListener('resize', resizeKeys);
window.addEventListener('orientationchange', () => setTimeout(resizeKeys, 180));