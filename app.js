const tracks=[
 {title:'Magnetic Pulse',artist:'Flux Master',duration:252},
 {title:'Iron Resonance',artist:'Synth Lord',duration:231},
 {title:'Viscous Bass',artist:'Deep Freq',duration:204},
 {title:'Polarity Shift',artist:'Neo Wave',duration:278},
 {title:'Kinetic Sand',artist:'Ambient X',duration:241}
];
const audio=document.getElementById('audio');
let current=0, playing=false, raf=null, objectUrls=[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toastEl=$('#toast');
function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastEl.t);toastEl.t=setTimeout(()=>toastEl.classList.remove('show'),2200)}
function fmt(sec){if(!isFinite(sec))return'0:00';sec=Math.max(0,Math.floor(sec));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`}
function renderTracks(){
 $('#trackList').innerHTML=tracks.map((t,i)=>`<button class="track-row" data-index="${i}"><span class="rank">0${i+1}</span><span class="track-main"><strong>${t.title}</strong><span>${t.artist}</span></span><span class="play-track">▶</span></button>`).join('');
 $$('.track-row').forEach(b=>b.onclick=()=>loadTrack(+b.dataset.index,true));
 $('#chartTable').innerHTML='<div class="chart-head"><span>#</span><span>TRACK</span><span>ARTIST</span><span>PLAYS</span></div>'+tracks.map((t,i)=>`<div class="chart-line"><b>0${i+1}</b><strong>${t.title}</strong><span>${t.artist}</span><span>${(12-i*2)+'.'+(i+3)}K</span></div>`).join('');
}
function loadTrack(i,auto=false){current=(i+tracks.length)%tracks.length;const t=tracks[current];$('#nowTitle').textContent=t.title;$('#nowArtist').textContent=t.artist;$('#duration').textContent=fmt(audio.duration||t.duration);$('#currentTime').textContent='0:00';$('#progress').value=0;if(auto&&audio.src)play();toast(`Cargando: ${t.title}`);}
function play(){if(!audio.src){toast('Añade un archivo de audio desde Library para reproducirlo.');return}audio.play().then(()=>{playing=true;$('#playBtn').textContent='❚❚';startVisual()}).catch(()=>toast('No se pudo reproducir el audio.'))}
function pause(){audio.pause();playing=false;$('#playBtn').textContent='▶';stopVisual()}
function togglePlay(){playing?pause():play()}
function startVisual(){if(raf)return;const loop=()=>{drawVisualizer();raf=requestAnimationFrame(loop)};loop()}
function stopVisual(){if(raf){cancelAnimationFrame(raf);raf=null}drawVisualizer()}
const canvas=$('#visualizer'),ctx=canvas.getContext('2d');
function drawVisualizer(){const w=canvas.width,h=canvas.height,cx=w/2,cy=h/2;ctx.clearRect(0,0,w,h);const sens=+$('#sensSlider').value/100,mag=+$('#magSlider').value/100,visc=+$('#viscSlider').value/100;const t=performance.now()/900;for(let ring=0;ring<5;ring++){ctx.beginPath();for(let a=0;a<Math.PI*2;a+=.035){const wave=Math.sin(a*(5+ring*2)+t*(3+sens*8))*18*mag;const r=150+ring*30+wave+(playing?Math.sin(a*13+t*12)*12*sens:Math.sin(a*4+t)*4);const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ring===0&&a===0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.closePath();ctx.strokeStyle=`rgba(0,224,255,${.13+ring*.035})`;ctx.lineWidth=2+visc*2;ctx.shadowBlur=12;ctx.shadowColor='#00dff7';ctx.stroke()}ctx.shadowBlur=0}
function bindSlider(id,label){const el=$(id),out=$(label);el.oninput=()=>{out.textContent=el.value+'%';drawVisualizer()}}
bindSlider('#magSlider','#magValue');bindSlider('#sensSlider','#sensValue');bindSlider('#viscSlider','#viscValue');
$('#playBtn').onclick=togglePlay;$('#prevBtn').onclick=()=>loadTrack(current-1,true);$('#nextBtn').onclick=()=>loadTrack(current+1,true);$('#shuffleBtn').onclick=()=>loadTrack(Math.floor(Math.random()*tracks.length),true);$('#repeatBtn').onclick=()=>{audio.loop=!audio.loop;toast(audio.loop?'Repeat activado':'Repeat desactivado')};$('#favoriteBtn').onclick=e=>{e.currentTarget.textContent=e.currentTarget.textContent==='♡'?'♥':'♡';toast('Favoritos actualizado')};
$('#volume').oninput=e=>audio.volume=e.target.value/100;audio.volume=.8;
audio.addEventListener('loadedmetadata',()=>$('#duration').textContent=fmt(audio.duration));audio.addEventListener('timeupdate',()=>{if(audio.duration){$('#progress').value=audio.currentTime/audio.duration*100;$('#currentTime').textContent=fmt(audio.currentTime)}});audio.addEventListener('ended',()=>{if(!audio.loop)loadTrack(current+1,true)});
$('#progress').oninput=e=>{if(audio.duration)audio.currentTime=audio.duration*(e.target.value/100)};
$('#fileInput').onchange=e=>{[...e.target.files].forEach(file=>{const url=URL.createObjectURL(file);objectUrls.push(url);const item={title:file.name.replace(/\.[^.]+$/,''),artist:'Local file',duration:0,url};tracks.push(item);const card=document.createElement('button');card.className='library-card';card.innerHTML=`<div class="album-art"></div><strong>${item.title}</strong><span>LOCAL FILE · ${(file.size/1048576).toFixed(1)} MB</span>`;card.onclick=()=>{current=tracks.indexOf(item);audio.src=url;loadTrack(current);play()};$('#libraryGrid').appendChild(card)});renderTracks();toast(`${e.target.files.length} archivo(s) añadido(s)`)}
function showView(view){$$('.view').forEach(v=>v.classList.add('hidden'));$('.dashboard-grid').classList.toggle('hidden',view!=='home');if(view!=='home')$('#'+view+'View').classList.remove('hidden');$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));$('#sidebar').classList.remove('open')}
$$('[data-view]').forEach(el=>el.onclick=()=>showView(el.dataset.view));
$('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');$('#searchInput').oninput=e=>{const q=e.target.value.toLowerCase();$$('.track-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'flex':'none')};
$('#notifyBtn').onclick=()=>toast('No tienes notificaciones nuevas.');$('#proBtn').onclick=()=>toast('PRO: módulo preparado para conectar pagos.');$('#supportBtn').onclick=()=>toast('Soporte: abre un ticket desde tu panel.');$('#logoutBtn').onclick=()=>toast('Sesión cerrada de forma simulada.');$('#editProfile').onclick=()=>toast('Editor de perfil listo para integrar.');$('#micBtn').onclick=()=>toast('Micrófono: permiso pendiente.');$('#queueBtn').onclick=()=>showView('library');
$$('.cover').forEach(c=>c.onclick=()=>{const name=c.dataset.track;const i=tracks.findIndex(t=>t.title===name);if(i>=0)loadTrack(i,true)});
$$('.toggle').forEach(t=>t.onclick=()=>{t.classList.toggle('on');toast(`${t.previousElementSibling.textContent}: ${t.classList.contains('on')?'ON':'OFF'}`)});
renderTracks();drawVisualizer();loadTrack(0);
window.addEventListener('beforeunload',()=>objectUrls.forEach(URL.revokeObjectURL));
