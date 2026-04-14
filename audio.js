const AudioEngine=(()=>{
    const ctx=new (window.AudioContext || window.webkitAudioContext)();
    const masterGain=ctx.createGain();
    masterGain.gain.value=0.8;
    masterGain.connect(ctx.destination);

    const convolver=ctx.createConvolver();
    (()=>{
        const len=ctx.sampleRate*1.4;
        const buf=ctx.createBuffer(2,len,ctx.sampleRate);

        for(let c=0;c<2;c++){
            const d=buf.getChannelData(c);
            for(let i=0;i<len;i++){
                d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.8);
            }
        }
        convolver.buffer=buf;
    })();

    const reverbGain=ctx.createGain();
    reverbGain.gain.value=0.13;
    convolver.connect(reverbGain);
    reverbGain.connect(masterGain);

    const active={};
    function resume(){
        if(ctx.state==='suspended')ctx.resume();
    }
    function setVolume(v){
        masterGain.gain.setTargetAtTime(v,ctx.currentTime,0.01);
    }

    function play(freq,key){
        resume();
        if(active[key]){
            try{
                active[key].osc.stop();
            }
            catch(_){} delete active[key];
        }

        const osc=ctx.createOscillator();
        const gain=ctx.createGain();
        osc.type='triangle';
        osc.frequency.value=freq;
        gain.gain.setValueAtTime(0,ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.75,ctx.currentTime+0.007);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+2.4);
        osc.connect(gain);
        gain.connect(masterGain);
        gain.connect(convolver);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime+2.6);

        active[key]={osc,gain};
    }

    function stop(key){
        const node=active[key];
        if(!node) return;
        node.gain.gain.cancelScheduledValues(ctx.currentTime);
        node.gain.gain.setTargetAtTime(0,ctx.currentTime,0.09);
        try{
            node.osc.stop(ctx.currentTime+0.25)
        }
        catch(_){}
        delete active[key];
    }
    return {play,stop,setVolume};

})();