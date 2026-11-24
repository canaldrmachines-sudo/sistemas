const MODULES = [
  {id:'m1', n:1, title:'Bem-vindo', sub:'Quem somos, nosso grupo e nossa cultura', ready:true, chapters:[
    {t:'Boas-vindas ao Grupo DR Machines', f:'m1/c1'},
    {t:'Quem somos', f:'m1/c2'},
    {t:'Nosso grupo, nossa força', f:'m1/c3'},
    {t:'Como trabalhamos juntos', f:'m1/c4'},
    {t:'Não somos equipes concorrentes', f:'m1/c5'},
    {t:'Nossa cultura: cinco pilares', f:'m1/c6'},
  ]},
  {id:'m2', n:2, title:'Comportamento e postura', sub:'Postura profissional, uniforme e segurança', ready:true, chapters:[
    {t:'Postura profissional', f:'m2/c1'},
    {t:'Uniforme e vestimenta', f:'m2/c2'},
    {t:'Segurança no trabalho', f:'m2/c3'},
  ]},
  {id:'m3', n:3, title:'Jornada e registro de ponto', sub:'Registro de ponto, intervalos, ajustes e banco de horas', ready:true, chapters:[
    {t:'Por que registramos o ponto', f:'m3/c1'},
    {t:'Equipamentos para registro de ponto', f:'m3/c2'},
    {t:'Equipe administrativa', f:'m3/c3'},
    {t:'Equipe técnica externa', f:'m3/c4'},
    {t:'Exemplos práticos para os técnicos', f:'m3/c5'},
    {t:'Intervalo de almoço', f:'m3/c6'},
    {t:'Pausa do café da manhã', f:'m3/c7'},
    {t:'Ajustes de ponto, faltas e atrasos', f:'m3/c8'},
    {t:'Faltas, DSR e banco de horas', f:'m3/c9'},
  ]},
  {id:'m4', n:4, title:'Rotinas operacionais', sub:'Atendimento técnico, Auvo, despesas e abastecimento', ready:true, chapters:[
    {t:'Atendimento técnico profissional', f:'m4/c1'},
    {t:'Sistema Auvo', f:'m4/c2'},
    {t:'Despesas corporativas', f:'m4/c3'},
    {t:'Abastecimento de veículos', f:'m4/c4'},
  ]},
  {id:'m5', n:5, title:'Direitos, benefícios e políticas', sub:'Férias, Day Off, desenvolvimento e Gympass', ready:true, chapters:[
    {t:'Política de férias', f:'m5/c1'},
    {t:'Benefício Day Off', f:'m5/c2'},
    {t:'Desenvolvimento profissional', f:'m5/c3'},
    {t:'Saúde e bem-estar: Gympass', f:'m5/c4'},
  ]},
  {id:'m6', n:6, title:'Integração e compromisso', sub:'Situações do dia a dia, compromissos e mensagem final', ready:true, chapters:[
    {t:'Situações do dia a dia', f:'m6/c1'},
    {t:'Respostas', f:'m6/c2'},
    {t:'O que esperamos de você', f:'m6/c3'},
    {t:'Nosso compromisso com você', f:'m6/c4'},
    {t:'Mensagem final e próximos passos', f:'m6/c5'},
  ]},
];
const DUR = {"m1/c1": 64.7, "m1/c2": 82.5, "m1/c3": 90.9, "m1/c4": 76.2, "m1/c5": 62.2, "m1/c6": 79.1, "m2/c1": 60.9, "m2/c2": 61.0, "m2/c3": 110.6, "m3/c1": 76.7, "m3/c2": 93.3, "m3/c3": 89.3, "m3/c4": 90.4, "m3/c5": 71.2, "m3/c6": 118.1, "m3/c7": 61.3, "m3/c8": 83.4, "m3/c9": 178.7, "m4/c1": 93.4, "m4/c2": 99.4, "m4/c3": 87.3, "m4/c4": 37.4, "m5/c1": 134.2, "m5/c2": 69.1, "m5/c3": 57.6, "m5/c4": 100.8, "m6/c1": 69.3, "m6/c2": 95.2, "m6/c3": 73.8, "m6/c4": 84.8, "m6/c5": 137.3};
const VTT = window.VTT || {};
const $ = s => document.querySelector(s);
const vid = $('#vid');
let state = {};            // {m1:{c:[...], done:false, doneAt:null}}
let cur = {m:0, c:0};
let isAdmin = false, uid = null, db = null, user = null, canWrite = true;
let ccOn = false, blobs = {}, loadingKey = null;

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),2600)}
function ms(m){return state[m.id] || (state[m.id]={c:m.chapters.map(()=>false),done:false})}
function fmt(s){s=Math.round(s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}

// ---------- persistência ----------
function loadLocal(){try{const v=JSON.parse(localStorage.getItem('drm-integracao')||'{}');if(v&&typeof v==='object')state=v}catch(e){}}
function saveLocal(){try{localStorage.setItem('drm-integracao',JSON.stringify(state))}catch(e){}}
let saving=Promise.resolve();
function save(){
  saveLocal();
  if(!db||!uid||!canWrite) return;
  const body={progress:state, updatedAt:new Date().toISOString()};
  saving=saving.then(()=>db.doc('progresso/'+uid).set(body)).catch(e=>{
    if(e&&e.code==='invalid_argument'){canWrite=false}
  });
}

// ---------- regras de liberação ----------
function moduleUnlocked(i){
  const m=MODULES[i]; if(!m.ready) return false; if(isAdmin||i===0) return true;
  return ms(MODULES[i-1]).done;
}
function chapterUnlocked(i,j){
  if(!moduleUnlocked(i)) return false; if(isAdmin||j===0) return true;
  return ms(MODULES[i]).c[j-1];
}

// ---------- interface ----------
function renderMods(){
  const box=$('#mods'); box.innerHTML='';
  MODULES.forEach((m,i)=>{
    const st=ms(m), un=moduleUnlocked(i), nd=st.c.filter(Boolean).length;
    const d=document.createElement('div');
    d.className='mod'+(i===cur.m?' open cur':'')+(st.done?' done':'');
    const h=document.createElement('button'); h.className='modhead'; h.disabled=!un;
    h.innerHTML=`<div class="num">${st.done?'✓':String(m.n).padStart(2,'0')}</div><div><div class="t"></div><div class="s"></div></div>`+
      (m.ready? (un?'':'<span class="lock">🔒 Bloqueado</span>') : '<span class="lock">Em breve</span>');
    h.querySelector('.t').textContent='Módulo '+m.n+' • '+m.title;
    h.querySelector('.s').textContent=m.ready? (nd+' de '+m.chapters.length+' partes assistidas') : m.sub;
    h.onclick=()=>{ if(un){cur={m:i,c:firstOpen(i)}; select(true)} };
    d.appendChild(h);
    if(m.ready){
      const ul=document.createElement('ul'); ul.className='chs'; ul.hidden=(i!==cur.m);
      m.chapters.forEach((c,j)=>{
        const li=document.createElement('li'); const b=document.createElement('button');
        b.className='ch'+(st.c[j]?' ok':'')+(i===cur.m&&j===cur.c?' active':'');
        b.disabled=!chapterUnlocked(i,j);
        b.innerHTML=`<span class="dot">${st.c[j]?'<svg width="10" height="10" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#0f0f11" stroke-width="4" stroke-linecap="round"/></svg>':''}</span><span class="tt"></span><span class="d"></span>`;
        b.querySelector('.tt').textContent=(j+1)+'. '+c.t;
        b.querySelector('.d').textContent=b.disabled?'🔒':(DUR[c.f]?fmt(DUR[c.f]):'');
        b.onclick=()=>{cur={m:i,c:j}; select(true)};
        li.appendChild(b); ul.appendChild(li);
      });
      d.appendChild(ul);
    }
    box.appendChild(d);
  });
  const n=document.createElement('p'); n.className='note';
  n.textContent='As partes são liberadas em sequência: ao terminar uma, a próxima é desbloqueada. Seu progresso fica salvo neste navegador.';
  box.appendChild(n);
  const done=MODULES.filter(m=>ms(m).done).length;
  $('#ovbar').style.width=(done/MODULES.length*100)+'%';
  $('#ovtxt').textContent=done+' de '+MODULES.length+' módulos concluídos';
}
function firstOpen(i){const st=ms(MODULES[i]);const k=st.c.findIndex(x=>!x);return k<0?0:k}

function updateNow(){
  const m=MODULES[cur.m], c=m.chapters[cur.c];
  $('#nowk').textContent='Módulo '+m.n+' • '+m.title; $('#nowt').textContent=c.t;
  $('#nowm').textContent='Parte '+(cur.c+1)+' de '+m.chapters.length+(DUR[c.f]?' • '+fmt(DUR[c.f]):'');
  $('#prev').disabled=cur.c===0;
  $('#next').disabled=cur.c>=m.chapters.length-1 || !chapterUnlocked(cur.m,cur.c+1);
  $('#doneb').hidden=!ms(m).done;
  $('#doneh').textContent='Módulo '+m.n+' concluído';
  const nx=MODULES[cur.m+1];
  $('#donep').textContent='Juntos, construímos o futuro do Grupo DR Machines. '+(nx&&nx.ready?'O Módulo '+nx.n+' • '+nx.title+' já está liberado na lista ao lado.':'O próximo módulo será liberado aqui assim que estiver disponível.');
}

// ---------- vídeo ----------
async function select(autoplay){
  renderMods(); updateNow();
  const m=MODULES[cur.m], c=m.chapters[cur.c], key=c.f;
  $('#ov').hidden=true; vid.pause();
  loadingKey=key; $('#ld').hidden=false; $('#ldp').textContent='Carregando vídeo…';
  let vtt=null; if(VTT[key]){ vtt=blobs[key+'.vtt']||(blobs[key+'.vtt']=URL.createObjectURL(new Blob([VTT[key]],{type:'text/vtt'}))); }
  vid.innerHTML=''; vid.preload='auto'; vid.src=key+'.mp4';
  if(vtt){ const tr=document.createElement('track'); tr.kind='subtitles'; tr.label='Português'; tr.srclang='pt-BR'; tr.src=vtt; vid.appendChild(tr);
    tr.addEventListener('load',()=>applyCC()); setTimeout(applyCC,50); }
  vid.load();
  const pronto=()=>{ if(loadingKey===key) $('#ld').hidden=true; };
  vid.addEventListener('loadedmetadata',pronto,{once:true});
  vid.addEventListener('playing',pronto,{once:true});
  setTimeout(pronto,6000);
  vid.addEventListener('error',()=>{ if(loadingKey!==key) return; $('#ld').hidden=true; showOverlay('Tentar novamente','Não foi possível carregar o vídeo','Verifique a conexão e tente de novo.'); },{once:true});
  if(autoplay){ vid.play().catch(()=>{ if(loadingKey===key){ $('#ld').hidden=true; showOverlay('▶ Continuar', c.t, 'Toque para assistir.'); } }); }
}
function showOverlay(btn,t,p){ $('#ovb').textContent=btn; $('#ovt').textContent=t; $('#ovp').textContent=p; $('#ovk').textContent='Módulo '+MODULES[cur.m].n+' • '+MODULES[cur.m].title; $('#ov').hidden=false; }
function applyCC(){ for(const t of vid.textTracks) t.mode=ccOn?'showing':'hidden'; }
$('#cc').onclick=()=>{ccOn=!ccOn; $('#cc').textContent='Legendas: '+(ccOn?'ligadas':'desligadas'); $('#cc').setAttribute('aria-pressed',ccOn); applyCC()};
$('#ovb').onclick=()=>select(true);
$('#prev').onclick=()=>{ if(cur.c>0){cur.c--; select(true)} };
$('#next').onclick=()=>{ if(chapterUnlocked(cur.m,cur.c+1)){cur.c++; select(true)} };

function markWatched(){
  const m=MODULES[cur.m], st=ms(m);
  if(st.c[cur.c]) return;
  st.c[cur.c]=true;
  if(st.c.every(Boolean)&&!st.done){ st.done=true; st.doneAt=new Date().toISOString(); toast('Módulo '+m.n+' concluído!'); window.dispatchEvent(new CustomEvent('modulo-concluido',{detail:m})) }
  save(); renderMods(); updateNow();
}
vid.addEventListener('timeupdate',()=>{ if(vid.duration && vid.currentTime>=vid.duration*0.97) markWatched(); });
vid.addEventListener('ended',()=>{
  markWatched();
  const m=MODULES[cur.m];
  if(cur.c<m.chapters.length-1){ cur.c++; select(true); }
  else{
    const nx=MODULES[cur.m+1];
    if(nx&&nx.ready&&moduleUnlocked(cur.m+1)){ showOverlay('▶ Ir para o Módulo '+nx.n,'Módulo '+m.n+' concluído','Próximo: Módulo '+nx.n+' • '+nx.title+'.'); $('#ovb').onclick=()=>{ $('#ovb').onclick=()=>select(true); cur={m:cur.m+1,c:firstOpen(cur.m+1)}; select(true) }; }
    else showOverlay('↺ Assistir de novo','Módulo '+m.n+' concluído','Juntos, construímos o futuro do Grupo DR Machines.');
  }
});

// ---------- início ----------
loadLocal();
cur={m:0,c:firstOpen(0)};
renderMods(); updateNow();
