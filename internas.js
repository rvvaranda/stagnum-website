const navButton=document.querySelector('.menu-button');const nav=document.querySelector('.nav');if(navButton){navButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');navButton.setAttribute('aria-expanded',String(open))});}
const obs=window.IntersectionObserver&&!matchMedia('(prefers-reduced-motion: reduce)').matches?new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}})},{threshold:.09}):null;document.querySelectorAll('.reveal').forEach(e=>obs?obs.observe(e):e.classList.add('visible'));
const items=[...document.querySelectorAll('.item[data-status]')];const tabs=[...document.querySelectorAll('.tab[data-filter]')];const search=document.querySelector('#obra-search');const empty=document.querySelector('.empty');let filter='finalizada';function update(){const term=(search?.value||'').toLocaleLowerCase('pt-BR').trim();let visible=0;for(const item of items){const show=(filter==='todas'||item.dataset.status===filter)&&item.textContent.toLocaleLowerCase('pt-BR').includes(term);if(show){item.removeAttribute('data-hidden');visible++}else item.setAttribute('data-hidden','')}if(empty)empty.classList.toggle('show',visible===0)}for(const tab of tabs){tab.addEventListener('click',()=>{filter=tab.dataset.filter;tabs.forEach(t=>t.setAttribute('aria-pressed',String(t===tab)));update()})}search?.addEventListener('input',update);if(items.length)update();

// Dots de navegação em cada projeto com mais de uma fotografia.
document.querySelectorAll('.photo-project').forEach(project=>{
  const media=project.querySelector('.photo-project-media');
  const photos=[...media?.querySelectorAll('img')||[]];
  if(!media||photos.length<2)return;
  const dots=document.createElement('div');
  dots.className='photo-dots';
  dots.setAttribute('role','group');
  dots.setAttribute('aria-label',`Fotos de ${project.querySelector('h3')?.textContent||'obra'}`);
  const buttons=photos.map((photo,i)=>{
    const button=document.createElement('button');
    button.type='button';button.className='photo-dot';
    button.setAttribute('aria-label',`Ver foto ${i+1} de ${photos.length}`);
    button.addEventListener('click',()=>media.scrollTo({left:media.clientWidth*i,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
    dots.append(button);return button;
  });
  function updateDots(){const index=Math.max(0,Math.min(photos.length-1,Math.round(media.scrollLeft/media.clientWidth)));buttons.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-current',i===index?'true':'false')})}
  media.addEventListener('scroll',updateDots,{passive:true});
  window.addEventListener('resize',updateDots,{passive:true});
  project.querySelector('.photo-project-info')?.before(dots);
  updateDots();
});
