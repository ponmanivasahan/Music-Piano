const BackingPlayer = (() => {
    const ctx = AudioEngine.getCtx();
    const bg = ctx.createGain();
    bg.gain.value = 0.5;

    // Route backing mix through a compressor to reduce clipping peaks.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 8;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.18;
    bg.connect(comp);
    comp.connect(AudioEngine.getMaster());

    function dKick(L,R,sr,t,amp=0.92){
        const s=Math.floor(t*sr)
        const n=Math.floor(0.5*sr)
        for(let i=0;i<n && s+i<L.length;i++){
            const x=i/sr;
            const f0=180,f1=40,k=10;
            const phase=2*Math.PI*(f0/k*(1-Math.exp(-x*k)) + f1 *x);
            const env=Math.exp(-x*9)*amp;
            const v=env*Math.sin(phase);
            L[s+i]+=v;
            R[s+i]+=v;
        }
    }

    function dSnare(L,R,sr,t,amp=0.65){
        const s=Math.floor(t*sr); 
        const n=Math.floor(0.2*sr);
        for (let i=0;i<n && s+i<L.length;i++){
            const x=i/sr;
            const env=Math.exp(-x*22)*amp;
            const noise=(Math.random()*2-1);
            const tone=Math.sin(2 * Math.PI * 200 * x) * 0.4;
            const v=env*(noise* 0.6 +tone);
            L[s + i]+=v*0.95;
            R[s + i]+=v*1.05;
        }
    }

    function dClap(L, R, sr, t, amp = 0.55) {
        [0, 0.008, 0.016].forEach(offset => {
            const s = Math.floor((t + offset) * sr), n = Math.floor(0.04 * sr);
            for (let i = 0; i < n && s + i < L.length; i++) {
                const x = i / sr;
                const env = Math.exp(-x * 35) * amp;
                const v = env * (Math.random() * 2 - 1);
                L[s + i] += v * 0.9;
                R[s + i] += v * 1.1;
            }
        });
    }

    function dHatC(L, R, sr, t, amp = 0.28) {
        const s = Math.floor(t * sr), n = Math.floor(0.04 * sr);
        for (let i = 0; i < n && s + i < L.length; i++) {
            const x = i / sr, env = Math.exp(-x * 80) * amp;
            const v = env * (Math.sin(2 * Math.PI * 8000 * x) * 0.3 + Math.sin(2 * Math.PI * 11000 * x) * 0.3 + (Math.random() * 2 - 1) * 0.4);
            L[s + i] += v;
            R[s + i] += v;
        }
    }

    function dBass(L, R, sr, t, freq, dur, amp = 0.58, pan = 0.5) {
        const s = Math.floor(t * sr), n = Math.min(Math.floor(dur * sr), L.length - s);
        if (n <= 0) return;
        const harms = [[1, 0.5], [2, -0.25], [3, 0.17], [4, -0.12], [5, 0.10], [6, -0.08], [7, 0.07]];
        for (let i = 0; i < n; i++) {
            const x = i / sr;
            const atk = 0.008, rel = Math.min(0.12, dur * 0.2);
            let env = x < atk ? x / atk : x > dur - rel ? Math.max(0, (dur - x) / rel) : 1;
            const filt = Math.min(1, x / 0.05) * Math.exp(-x * 0.8) + 0.15;
            let sig = 0;
            harms.forEach(([h, w]) => sig += w * filt * Math.sin(2 * Math.PI * freq * h * x));
            const v = sig * env * amp;
            L[s + i] += v * (1 - pan * 0.4);
            R[s + i] += v * (1 - (1 - pan) * 0.4);
        }
    }

    function softClip(L, R) {
        for (let i = 0; i < L.length; i++) {
            L[i] = Math.tanh(L[i] * 1.4) / 1.4;
            R[i] = Math.tanh(R[i] * 1.4) / 1.4;
        }
    }

    function mkBuf(fn, loopSecs) {
        const sr = ctx.sampleRate, len = Math.ceil(loopSecs * sr);
        const buf = ctx.createBuffer(2, len, sr);
        const L = buf.getChannelData(0), R = buf.getChannelData(1);
        fn(L, R, sr, loopSecs);
        softClip(L, R);
        return buf;
    }

     const bd=(bpm)=>60/bpm;

     function buildLofi(L, R, sr, loop) {
        const b = bd(84);
        const bar = 4 * b;
        for (let bar_i = 0; bar_i < 4; bar_i++) {
            const o = bar_i * bar;
            dKick(L, R, sr, o);
            dKick(L, R, sr, o + 2.75 * b, 0.75);
            dSnare(L, R, sr, o + 1 * b);
            dSnare(L, R, sr, o + 3 * b);
            [0, 0.48, 1, 1.52, 2, 2.48, 3, 3.52].forEach(beat => {
                dHatC(L, R, sr, o + beat * b, beat % 1 === 0 ? 0.28 : 0.18);
            });
        }

        const bassNotes = [
            [65.41, 0, 1.8], [65.41, 1.9, 0.4], [77.78, 2.3, 0.4], [82.41, 2.8, 1.1],
            [87.31, 4, 1.8], [87.31, 5.9, 0.4], [98, 6.3, 0.4], [103.83, 6.8, 1.1],
            [116.54, 8, 1.8], [116.54, 9.9, 0.4], [130.81, 10.3, 0.4], [87.31, 10.8, 1.1],
            [77.78, 12, 1.8], [77.78, 13.9, 0.4], [82.41, 14.3, 0.4], [65.41, 14.8, 1.1],
        ];
        bassNotes.forEach(([f, t, d]) => dBass(L, R, sr, t * b, f, d * b, 0.56, 0.45));
    }

    function buildHouse(L, R, sr, loop) {
        const b = bd(122);
        const bar = 4 * b;
        for (let bar_i = 0; bar_i < 4; bar_i++) {
            const o = bar_i * bar;
            [0, 1, 2, 3].forEach(beat => dKick(L, R, sr, o + beat * b, 0.88));
            dClap(L, R, sr, o + 1 * b);
            dClap(L, R, sr, o + 3 * b);
            for (let s = 0; s < 16; s++) dHatC(L, R, sr, o + s * b / 4, s % 2 === 0 ? 0.28 : 0.18);
        }
        const bassNotes = [
            [87.31, 0, 0.22], [87.31, 0.5, 0.18], [87.31, 1, 0.22], [87.31, 1.5, 0.18],
            [87.31, 2, 0.22], [87.31, 2.5, 0.18], [103.83, 3, 0.22], [98, 3.5, 0.45],
            [65.41, 4, 0.22], [65.41, 4.5, 0.18], [65.41, 5, 0.22], [65.41, 5.5, 0.18],
            [65.41, 6, 0.22], [65.41, 6.5, 0.18], [77.78, 7, 0.22], [73.42, 7.5, 0.45],
            [103.83, 8, 0.22], [103.83, 8.5, 0.18], [103.83, 9, 0.22], [103.83, 9.5, 0.18],
            [103.83, 10, 0.22], [103.83, 10.5, 0.18], [116.54, 11, 0.22], [110, 11.5, 0.45],
            [77.78, 12, 0.22], [77.78, 12.5, 0.18], [77.78, 13, 0.22], [77.78, 13.5, 0.18],
            [77.78, 14, 0.22], [77.78, 14.5, 0.18], [87.31, 15, 0.22], [82.41, 15.5, 0.45],
        ];
        bassNotes.forEach(([f, t, d]) => dBass(L, R, sr, t * b, f, d * b, 0.65, 0.52));
    }

    function buildFunk(L, R, sr, loop) {
        const b = bd(96);
        const bar = 4 * b;
        for (let bar_i = 0; bar_i < 4; bar_i++) {
            const o = bar_i * bar;
            dKick(L, R, sr, o);
            dKick(L, R, sr, o + 0.75 * b, 0.7);
            dKick(L, R, sr, o + 2 * b, 0.85);
            dKick(L, R, sr, o + 2.75 * b, 0.6);
            dSnare(L, R, sr, o + 1 * b, 0.7);
            dSnare(L, R, sr, o + 3 * b, 0.7);
            [0.5, 1.5, 2.5, 3.5].forEach(beat => dSnare(L, R, sr, o + beat * b, 0.2));
            for (let s = 0; s < 16; s++) dHatC(L, R, sr, o + s * b / 4, s % 4 === 0 ? 0.3 : s % 2 === 0 ? 0.22 : 0.15);
        }

        const bassNotes = [
            [82.41, 0, 0.55], [82.41, 0.75, 0.4], [110, 1.5, 0.35], [65.41, 2, 0.55],
            [82.41, 2.75, 0.4], [65.41, 3, 0.4], [73.42, 3.5, 0.45],
            [82.41, 4, 0.55], [110, 4.75, 0.4], [98, 5.5, 0.35], [65.41, 6, 0.55],
            [82.41, 6.75, 0.4], [77.78, 7, 0.4], [65.41, 7.5, 0.45],
            [82.41, 8, 0.55], [82.41, 8.75, 0.4], [110, 9.5, 0.35], [65.41, 10, 0.55],
            [82.41, 10.75, 0.4], [65.41, 11, 0.4], [73.42, 11.5, 0.45],
            [82.41, 12, 0.55], [110, 12.75, 0.4], [98, 13.5, 0.35], [65.41, 14, 0.55],
            [82.41, 14.75, 0.4], [77.78, 15, 0.4], [65.41, 15.5, 0.45],
        ];
        bassNotes.forEach(([f, t, d]) => dBass(L, R, sr, t * b, f, d * b, 0.58, 0.5));
    }

    function buildAmbient(L, R, sr, loop) {
        const b = bd(75);
        const chords = [
            [[65.41, 130.81, 196, 261.63, 329.63], 0, 7.8, 0.08],
            [[55, 110, 164.81, 220, 261.63], 8, 7.8, 0.08],
            [[43.65, 87.31, 130.81, 174.61, 220], 16, 7.8, 0.08],
            [[49, 98, 147, 196, 246.94], 24, 7.8, 0.08],
            [[65.41, 130.81, 196, 261.63, 329.63], 32, 7.8, 0.08],
            [[55, 110, 164.81, 220, 261.63], 40, 7.8, 0.08],
            [[43.65, 87.31, 130.81, 174.61, 220], 48, 7.8, 0.08],
            [[49, 98, 147, 196, 246.94], 56, 7.8, 0.08],
        ];
        chords.forEach(([freqs, startB, durB, amp]) => {
            freqs.forEach((freq, i) => {
                const t = startB * b, d = durB * b;
                const s = Math.floor(t * ctx.sampleRate), n = Math.min(Math.floor(d * ctx.sampleRate), L.length - s);
                if (n <= 0) return;
                const pan = 0.35 + i * 0.07;
                const harms = [[1, 0.45], [3, 0.15], [5, 0.09], [7, 0.06]];
                for (let j = 0; j < n; j++) {
                    const x = j / ctx.sampleRate;
                    const atk = Math.min(0.4, d * 0.08), rel = Math.min(1.2, d * 0.18);
                    let env = x < atk ? x / atk : x > d - rel ? Math.max(0, (d - x) / rel) : 1;
                    env *= env;
                    const filt = 0.4 + 0.6 * Math.sin(2 * Math.PI * 0.2 * x);
                    let sig = 0;
                    harms.forEach(([h, w]) => sig += w * filt * Math.sin(2 * Math.PI * freq * h * x));
                    const v = sig * env * amp;
                    L[s + j] += v * (1 - pan * 0.35);
                    R[s + j] += v * (1 - (1 - pan) * 0.35);
                }
            });
        });
    }

    const TRACKS = {
        lofi: { name: 'Lo-Fi Beats', loop: 4 * 4 * bd(84), build: buildLofi },
        house: { name: 'House Groove', loop: 4 * 4 * bd(122), build: buildHouse },
        funk: { name: 'Funk Groove', loop: 4 * 4 * bd(96), build: buildFunk },
        ambient: { name: 'Ambient Synth', loop: 8 * 8 * bd(75), build: buildAmbient },
    };

    const cache = {};
    let src = null, curBuf = null, startAt = 0, pauseAt = 0, playing = false, progIv = 0, activeId = null;
    const $ = id => document.getElementById(id);
    const PI = $('backPlayIcon'), PB = $('backPlayBtn'), NM = $('backName'), FI = $('backFill'), TM = $('backTime');
    const fmtT = s => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

    $('backVol').addEventListener('input', e => { bg.gain.setTargetAtTime(+e.target.value / 100, ctx.currentTime, 0.02); e.target.style.setProperty('--pct', e.target.value + '%'); });

    function genBuf(id) {
        if (cache[id]) return Promise.resolve(cache[id]);
        return new Promise(res => setTimeout(() => {
            const tk = TRACKS[id];
            const buf = mkBuf((L, R, sr, loop) => tk.build(L, R, sr, loop), tk.loop);
            cache[id] = buf;
            res(buf);
        }, 0));
    }
    function stopCurrent(){
        if(src){
            try{
                src.stop();
            }
            catch(_){ } src= null;
        }
        clearInterval(progIv);
        playing=false;
        if(PI){
            PI.innerHTML = '<polygon points="3,2 12,7 3,12" fill="currentColor"/>';
        }
    }

    function startSource(buf){
        AudioEngine.resume();
        const s=ctx.createBufferSource();
        s.buffer=buf;
        s.loop=true;
        s.connect(bg);
        s.start(0, pauseAt%(buf.duration || 1));
        startAt=ctx.currentTime-pauseAt%(buf.duration || 1);
        src=s;
        curBuf=buf;
        playing=true;
        if(PI){
            PI.innerHTML = '<rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor"/><rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor"/>';
        }
        clearInterval(progIv);
        progIv=setInterval(()=>{
            if(!playing || !curBuf) return;
            const el=(ctx.currentTime-startAt) % curBuf.duration;
            FI.style.width=(el/curBuf.duration*100)+'%';
            if(TM) TM.textContent=fmtT(el);
        },100);
    }

    $('tracksRow').addEventListener('click', async e => {
        const pill = e.target.closest('[data-track]');
        if (!pill) return;
        const id = pill.dataset.track;
        if (activeId === id && playing) {
            pauseAt = (ctx.currentTime - startAt) % (curBuf ? curBuf.duration : 1);
            stopCurrent();
            return;
        }
        stopCurrent();
        pauseAt = 0;
        document.querySelectorAll('.track-pill').forEach(p => p.classList.remove('active', 'loading'));
        pill.classList.add('active', 'loading');
        NM.textContent = 'Generating "' + TRACKS[id].name + '"…';
        PB.disabled = true;
        activeId = id;
        const buf = await genBuf(id);
        pill.classList.remove('loading');
        curBuf = buf;
        NM.textContent = TRACKS[id].name + ' - playing';
        PB.disabled = false;
        startSource(buf);
    });

    PB.addEventListener('click', () => {
        if (playing) {
            pauseAt = (ctx.currentTime - startAt) % (curBuf ? curBuf.duration : 1);
            stopCurrent();
        } else if (curBuf) startSource(curBuf);
    });

    document.getElementById('audioUpload').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        stopCurrent();
        pauseAt = 0;
        document.querySelectorAll('.track-pill').forEach(p => p.classList.remove('active'));
        activeId = null;
        NM.textContent = 'Loading ' + file.name + '…';
        PB.disabled = true;
        try {
            const ab = await file.arrayBuffer();
            const dec = await ctx.decodeAudioData(ab);
            curBuf = dec;
            NM.textContent = file.name;
            PB.disabled = false;
            startSource(dec);
        } catch {
            NM.textContent = 'Could not decode this file.';
        }
        e.target.value = '';
    });
    return { stop: stopCurrent };
})();