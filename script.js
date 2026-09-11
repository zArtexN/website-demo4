const nav=document.getElementById('nav');
const menu=document.querySelector('.menu');
const links=document.querySelector('.navlinks');
const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>30);
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.14});
document.querySelectorAll('.section,.proof-strip,.booking,footer').forEach(el=>{el.classList.add('reveal');io.observe(el)});
