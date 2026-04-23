const Recorder=(()=>{
    const dot=document.getElementById('recDot');
    const stateEl=document.getElementById('recState');
    const clockEl=document.getElementById('recClock');
    const badge=document.getElementById('noteBadge');
    const btnRec=document.getElementById('btnRec');
    const btnPlay=document.getElementById('btnPlayLive');
    const btnSave=document.getElementById('btnSave');
    const pbStrip=document.getElementById('pbStrip');
    const pbFill=document.getElementById('pbFill');
    const pbClock=document.getElementById('pbClock');
    const reel=document.getElementById('recReel')
    let recording=false;
    let snapNotes=[];
    let recStartTs=0;
    let tickIv=0;
    let playTOs=[],pbIv=0, livePlaying=false;

    function fmt(ms){
        const s=Math.floor(ms/1000);
        return `${Math.floor(s/60)} : ${String(s%60).padStart(2,'0')}`
    }

    function setBadge(n){
        badge.textContent=n+(n===1 ? 'note' : 'notes');
        badge.textContent=n>0 ? (n + 'note' + (n===1 ? '':'s')) : '';
    }
    function setLbl(btn,text){
        const lbl=btn.querySelector('.act-lbl');
        if(lbl){
            lbl.textContent=text;
        }
        else{
            btn.childNodes[btn.childNodes.length-1].textContent=text;
        }
    }
    btnRec.addEventListener('click',()=>{
        if(!recording){
            stopPlayback();
            piano.startRec();
            recStartTs=performance.now();
            recording=true;
            dot.className='rec-led recording';
            reel.classList.add('spinning');
            stateEl.textContent='Recording';
            setLbl(btnRec,'Stop');
            btnRec.classList.add('on');
            btnPlay.disabled=true;
            btnSave.disabled=true;
            badge.textContent='';
            tickIv=setInterval(()=>{
                const n=piano.getLive();
                clockEl.textContent=fmt(performance.now()-recStartTs);
                setBadge(n.length);
            },300)
        }
        else{
           recording=false;
           clearInterval(tickIv);
           snapNotes=piano.stopRec();
           dot.className=snapNotes.length ? 'rec-led done' : 'rec-led';
           document.getElementById('recReel').classList.remove('spinning');
           stateEl.textContent=snapNotes.length ? 'Recorded':'Ready';
           setLbl(btnRec,'Record');
           btnRec.classList.remove('on');
           btnPlay.disabled=!snapNotes.length;
           btnSave.disabled=!snapNotes.length;
           if(!snapNotes.length){
            clockEl.textContent='0:00';
            badge.textContent='';
           } 
           setBadge(snapNotes.length);
        }
    })

    function stopPlayback(){
        livePlaying=false;
        playTOs.forEach(clearTimeout);
        playTOs=[];
        clearInterval(pbIv);
        pbStrip.classList.remove('on');
        setLbl(btnPlay,'Play');
        btnRec.disabled=false;
        btnSave.disabled=!snapNotes.length;
    }

    btnPlay.addEventListener('click',()=>{
        if(livePlaying){
            stopPlayback();
            return;
        }
        if(!snapNotes.length)return;
        livePlaying=true;
        setLbl(btnPlay,'Stop');
        btnRec.disabled=true;
        btnSave.disabled=true;
        pbStrip.classList.add('on');
        pbFill.style.width='0%';
        const dur=snapNotes[snapNotes.length-1].t+500;
        const s0=performance.now();
        pbIv=setInterval(()=>{
            pbFill.style.width=Math.min(100,((performance.now()-s0)/dur)*100)+'%';
            pbClock.textContent=fmt(performance.now()-s0);
        },80);
        snapNotes.forEach(({key,note,freq,t})=>{
            playTOs.push(setTimeout(()=>{
                const el=(note && piano.noteMap[note]) || (key && piano.keyMap[key]);
                if(el){
                    el.classList.add('active');
                    setTimeout(()=>el.classList.remove('active'),170);
                }
                const f= freq || (el ? parseFloat(el.dataset.freq):0);
                const id=(note || key || 'pb') + '_pb_' +t;
                if(f) AudioEngine.play(f,id);
            },t));
        })
        playTOs.push(setTimeout(stopPlayback, dur+120));
    });
    function getSnap(){
        return snapNotes;
    }
    function clearSnap(){
        snapNotes=[];
        dot.className='rec-led';
        stateEl.textContent='Ready';
        clockEl.textContent='0:00';
        badge.textContent='';
        btnPlay.disabled=true;
        btnSave.disabled=true;
    }
    return {getSnap,clearSnap}
})();
