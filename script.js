const nav=document.getElementById('nav');
const menu=document.querySelector('.menu');
const mobileNav=document.getElementById('mobile-nav');
const video=document.getElementById('heroVideo');
const hero=document.querySelector('.hero-scroll');
const progress=document.getElementById('progressBar');
const captionIndex=document.getElementById('captionIndex');
const heroCaption=document.getElementById('heroCaption');
const captions=['Özenli bakım.','Temiz ve titiz.','Detay odaklı.','Size özel.','Suray dokunuşu.'];
let targetTime=0, displayedTime=0, seeking=false, seekQueued=false, lastCaption=-1;
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40),{passive:true});
menu.addEventListener('click',()=>{const open=mobileNav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileNav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
video.addEventListener('loadedmetadata',()=>{video.currentTime=0;});
video.addEventListener('canplay',()=>video.classList.add('ready'),{once:true});
video.addEventListener('error',()=>video.classList.remove('ready'));
function updateTarget(){
 const r=hero.getBoundingClientRect();
 const max=Math.max(1,hero.offsetHeight-innerHeight);
 const p=Math.min(1,Math.max(0,-r.top/max));
 if(video.duration) targetTime=Math.min(video.duration-.03,Math.max(0,p*video.duration));
 progress.style.width=(p*100)+'%';
 const idx=Math.min(captions.length-1,Math.floor(p*captions.length));
 if(idx!==lastCaption){lastCaption=idx;captionIndex.textContent=String(idx+1).padStart(2,'0');heroCaption.textContent=captions[idx];}
}
function queueSeek(){
 if(seeking||!video.duration)return;
 seeking=true;seekQueued=false;
 const delta=targetTime-displayedTime;
 if(Math.abs(delta)<.025){displayedTime=targetTime;video.currentTime=displayedTime;seeking=false;return;}
 displayedTime += delta*.22;
 try{video.currentTime=displayedTime}catch(e){}
 seeking=false;
}
function raf(){updateTarget();queueSeek();requestAnimationFrame(raf)}
requestAnimationFrame(raf);
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.section,.proof,.booking,footer').forEach(el=>{el.classList.add('reveal');io.observe(el)});
