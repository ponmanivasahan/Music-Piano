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
    })
}

const rotateTryBtn=document.getElementById('rotateTryBtn');
if(rotateTryBtn){
    rotateTryBtn.addEventListener('click',async()=>{
        try{
            await document.documentElement.requestFullscreen();
            if(screen.orientation &&  screen.orientation.lock){
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
        const c4=document.querySelector('[data-note="C4"]');
        const wrap=document.getElementById('keysWrap');
        if(c4 && wrap){
            wrap.scrollLeft=Math.max(0,c4.offsetLeft-wrap.offsetWidth/2+22);
        }
    },400);
})

// const pianoKeys=document.querySelectorAll(".piano-keys .key"),
// volumeSlider=document.querySelector(".volume-slider input"),
// keysCheckbox=document.querySelector(".keys-checkbox input");

// let allKeys=[],
// audio=new Audio(`music/a.wav`);
// const colors=["#ff006e","#8338ec","#3a86ff","#fb5607","#ffbe0b"];

// const playTune=(key)=>{
//     audio.src=`music/${key}.wav`;

//     audio.play();

//     const clickedKey=document.querySelector(`[data-key="${key}"]`);
//     const randomColor=colors[Math.floor(Math.random()*colors.length)];
//     clickedKey.style.background=randomColor
//     clickedKey.classList.add("active");

//     setTimeout(()=>{
//         clickedKey.classList.remove("active");
//     },150);
// }

// pianoKeys.forEach(key=>{
//     allKeys.push(key.dataset.key);

//     key.addEventListener("click",()=>playTune(key.dataset.key));
// });


// const handleVolume=(e)=>{
//     audio.volume=e.target.value;
// }

// const showHideKeys=()=>{
//     pianoKeys.forEach(key=>key.classList.toggle("hide"));
// }

// const pressedKey=(e)=>{
//     if(allKeys.includes(e.key))playTune(e.key);
// }
// document.body.style.background=`hsl(${Math.random()*360},80%,60%)`;
// setTimeout(()=>document.body.style.background="#e3f2fd",200);


// keysCheckbox.addEventListener("click",showHideKeys);
// volumeSlider.addEventListener("input",handleVolume);
// document.addEventListener("keydown",pressedKey);