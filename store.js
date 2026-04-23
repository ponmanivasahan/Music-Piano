const Store=(()=>{
    const LS='melodify_v2';
    const list=document.getElementById('recsList');
    const clrBtn=document.getElementById('clearAllBtn');
    const btnSave=document.getElementById('btnSave');

    function load(){
        try{
            return JSON.parse(localStorage.getItem(LS) || '[]')
        }
        catch{
            return[];
        }
    }
    function persist(r){
        localStorage.setItem(LS,JSON.stringify(r));
    }
    function fmt(ms){
        const s=Math.floor(ms/1000);
        return `${Math.floor(s/60)} : ${String(s%60).padStart(2,'0')}`
    }

    btnSave.addEventListener('click',()=>{
        const notes=Recorder.getSnap();
        if(!notes.length) return;
        const recs=load();
        const dur=notes[notes.length-1].t+200;
        const d=new Date();
        recs.push({
            id:Date.now()+'',name:'Recording '+ (recs.length+1),notes,
            dur:fmt(dur),
            count:notes.length,
            date:d.toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})
        })
        persist(recs);
        Recorder.clearSnap();
        render();
    })

    let curId=null;
    let savedTOs=[];
    function stopSaved(){
        savedTOs.forEach(clearTimeout);
        savedTOs=[];
        if(curId){
            const el=list.querySelector(`[data-id="${curId}"]`);
            if(el){
                el.classList.remove('playing');
                const pb=el.querySelector('.ri-play');
                if(pb){
                    pb.innerHTML='<svg viewBox="0 0 14 14" fill="currentColor"><polygon points="3,2 12,7 3,12"/></svg>';
                    pb.classList.remove('stop'); 
                }
            }
        }
        curId=null;
    }

        function playSaved(id){
            if(curId===id){
                stopSaved();
                return;
            }
            stopSaved();
            const rec=load().find(r=> r.id===id);
            if(!rec || !rec.notes.length)return;
            curId=id;
            const el=list.querySelector(`[data-id="${id}"]`);
            if(el){
                el.classList.add('playing');
                const pb=el.querySelector('.ri-play');
                if(pb){
                    pb.innerHTML='<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="10" y2="10"/><line x1="10" y1="4" x2="4" y2="10"/></svg>';
                    pb.classList.add('stop');
                }
            }
            const dur=rec.notes[rec.notes.length-1].t+500;
            rec.notes.forEach(({key,t,note,freq})=>{
                savedTOs.push(setTimeout(()=>{
                const keyEl=(note && piano.noteMap && piano.noteMap[note]) || (key  && piano.keyMap  && piano.keyMap[key]);                    if(keyEl){
                        keyEl.classList.add('active');
                        setTimeout(()=> 
                            keyEl.classList.remove('active'), 165);
                    }
                    const f= freq || (keyEl ? parseFloat(keyEl.dataset.freq) :0);
                    if(f){
                        AudioEngine.play(f,key+'_sv_'+t);
                    }
                },t));
            });
            savedTOs.push(setTimeout(stopSaved,dur+120));
        }
        function deleteSaved(id){
            if(curId===id){
                stopSaved();
            }
            persist(load().filter(r=>r.id!==id));
            render();
        }

        clrBtn.addEventListener('click',()=>{
            stopSaved();
            persist([]);
            render();
        })

        function render(){
            const recs=load();
            list.innerHTML='';
            clrBtn.style.display=recs.length ? '':'none';
            if(!recs.length){
                list.innerHTML=`<div class="empty">
                  <div class="empty-icon">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="5.5" />
                  <path d="M6 6.5l2 1.5-2 1.5"/></svg>
                  </div>
                  <p>No recordings saved yet</p>
                  <span>Hit Record &rarr; Save</span>
                </div>`;
                return;
            }
            recs.forEach((r,i)=>{
                const d=document.createElement('div');
                d.className='rec-item';
                d.dataset.id=r.id;
                d.innerHTML=`<div class="rec-num">${String(i+1).padStart(2,'0')}</div>
                <div class="rec-info">
                   <div class="rec-name">${r.name}</div>
                   <div class="rec-meta">${r.count} notes &middot; ${r.dur} &middot; ${r.date}</div>
                </div>
               <div class="rec-btns">
                <button class="ri-btn ri-play" title="Play" data-id="${r.id}">
                   <svg viewBox="0 0 14 14" fill="currentColor"><polygon points="3,2 12,7 3,12" /></svg>
                </button>

                <button class="ri-btn ri-del" title="Delete" data-id="${r.id}">
                 <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                 <path d="M2 4h10M5 4V2h4v2M5.5 7v4M8.5 7v4M3 4l.7 8h6.6L11 4"/>
                 </svg>
                </button>
               </div>
                `;
                d.querySelector('.ri-play').addEventListener('click',()=>playSaved(r.id));
                d.querySelector('.ri-del').addEventListener('click',()=>deleteSaved(r.id));
                list.appendChild(d);
            })
        }
      render();
})();