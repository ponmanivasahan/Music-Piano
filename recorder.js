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
    let recording=false;
    let snapNotes=[];
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
    btnRec.addEventListener('click',()=>{
        if(!recording){
            stopPlayback();
            piano.startRec();
            recording=true;
            dot.className='rec-led recording';
            document.getElementById('recReel').classList.add('spinning');
            stateEl.textContent='Recording';
            btnRec.textContent='Stop';
            btnRec.classList.add('on');
            btnPlay.disabled=true;
            btnSave.disabled=true;
            badge.textContent='';
            tickIv=setInterval(()=>{
                const n=piano.getLive();
                clockEl.textContent=fmt(performance.now()-(n._start || performance.now()));
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
           btnRec.textContent='Record';
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
        btnPlay.textContent='Play';
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
        btnPlay.textContent='Stop';
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
        snapNotes.forEach(({key,t})=>{
            playTOs.push(setTimeout(()=>{
                const el=document.querySelector(`[data-key="${key}"]`);
                if(el){
                    el.classList.add('active');
                    setTimeout(()=>el.classList.remove('active'),170);
                }
                const freq=el ? parseFloat(el.dataset.freq):0;
                if(freq) AudioEngine.play(freq,key+'_pb_'+t);
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
