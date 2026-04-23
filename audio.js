const AudioEngine=(()=>{
    const ctx=new (window.AudioContext || window.webkitAudioContext)();
    const masterGain=ctx.createGain();
    masterGain.gain.value=0.8;
    masterGain.connect(ctx.destination);

    const convolver=ctx.createConvolver();
    (()=>{
        const len=ctx.sampleRate*1.6;
        const buf=ctx.createBuffer(2,len,ctx.sampleRate);

        for(let c=0;c<2;c++){
            const d=buf.getChannelData(c);
            for(let i=0;i<len;i++){
                d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);
            }
        }
        convolver.buffer=buf;
    })();

    const reverbGain=ctx.createGain();
    reverbGain.gain.value=0.12;
    convolver.connect(reverbGain);
    reverbGain.connect(masterGain);

    const eq=ctx.createBiquadFilter();
    eq.type='highshelf';
    eq.frequency.value=3500;
    eq.gain.value=-2;
    eq.connect(masterGain);
    const active={};
    function resume(){
        if(ctx.state==='suspended')ctx.resume();
    }
    function setVolume(v){
        masterGain.gain.setTargetAtTime(v,ctx.currentTime,0.01);
    }

    function play(freq,id){
        resume();
        if(active[id]){
            try{
                active[id].osc.stop();
            }
            catch(_){} delete active[id];
        }

        const osc=ctx.createOscillator();
        const gain=ctx.createGain();
        osc.type='triangle';
        osc.frequency.value=freq;
        gain.gain.setValueAtTime(0,ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.72,ctx.currentTime+0.008);
        gain.gain.setTargetAtTime(0.3,ctx.currentTime+0.02,0.12);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+2.8);
        osc.connect(gain);
        gain.connect(eq);
        gain.connect(convolver);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime+3.0);

        active[id]={osc,gain};
    }

    function stop(id){
        const node=active[id];
        if(!node) return;
        node.gain.gain.cancelScheduledValues(ctx.currentTime);
        node.gain.gain.setTargetAtTime(0,ctx.currentTime,0.08);
        try{
            node.osc.stop(ctx.currentTime+0.22)
        }
        catch(_){}
        delete active[key];
    }

    function getCtx(){return ctx}
    function getMaster(){ return masterGain;}
    return {play,stop,setVolume,resume,getCtx,getMaster};

})();