const Disco=(()=>{
    const canvas=document.getElementById('disco-canvas');
     if (!canvas) {
        console.error('Canvas element with id "disco-canvas" not found');
        return {
            toggle: () => false,
            isOn: () => false
        };
    }
    const gl = canvas.getContext('2d');
    const COLS=[
    '#FF1744','#FF6D00','#FFD600','#00E676',
    '#00B0FF','#D500F9','#FF4081','#76FF03',
    '#18FFFF','#FF9100','#E040FB','#F50057'
    ];
    let on=false, raf=0,t=0;
    const blobs=Array.from({length:8},(_,i)=>({
        x:Math.random(),
        y:Math.random(),
        vx:(Math.random()-0.5)*0.0035,
        vy:(Math.random()-0.5)*0.0035,
        r:0.20+Math.random()*0.22,
        ci:i%COLS.length
    }));

    function resize(){
        canvas.width=innerWidth;
        canvas.height=innerHeight;
    }
    resize();
    window.addEventListener('resize',resize);

    function getBackgroundColor(){
        const isDark=document.documentElement.dataset.theme==='dark';
        return isDark ? '#0D0C0B' : '#FFFFFF';
    }
    function frame(){
        const W=canvas.width, H=canvas.height;
        gl.clearRect(0,0,W,H);

        gl.fillStyle=getBackgroundColor();
        gl.fillRect(0,0,W,H);

        blobs.forEach(b=>{
            b.x+=b.vx;
            b.y+=b.vy;
            if(b.x<0 || b.x>1)b.vx*=-1;
            if(b.y<0 || b.y>1)b.vy*=-1;
            const gx=b.x*W,gy=b.y*H,gr=b.r*Math.min(W,H);
            const g=gl.createRadialGradient(gx,gy,0,gx,gy,gr);
            g.addColorStop(0, COLS[b.ci]+ 'EE');
            g.addColorStop(0.45, COLS[b.ci]+ '88');
            g.addColorStop(1,'transparent');
            gl.fillStyle=g;
            gl.beginPath();
            gl.ellipse(gx,gy,gr,gr*0.68,t*0.3+b.ci*0.4,0,Math.PI*2);
            gl.fill();
        })

        t+=0.02;
        if(Math.sin(t*9)>0.84){
            const flashColor=document.documentElement.dataset.theme==='dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)';
            gl.fillStyle=flashColor;
            gl.fillRect(0,0,W,H);
        }
            if(Math.random()> 0.97)blobs[Math.floor(Math.random() * blobs.length)].ci = Math.floor(Math.random()*COLS.length);
             raf=requestAnimationFrame(frame); 
    }
        function toggle(){
            on=!on;
              if(on){
                canvas.classList.add('on');
                frame();
              }
              else{
                canvas.classList.remove('on');
                cancelAnimationFrame(raf);
                gl.clearRect(0,0,canvas.width,canvas.height);
              }
              return on;
        }
        return{toggle};
})();