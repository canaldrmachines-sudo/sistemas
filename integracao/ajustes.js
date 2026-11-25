// Ajusta o progresso salvo antes de novos módulos serem liberados (partes que ainda não existiam)
function ms(m){let s=state[m.id]; if(!s) s=state[m.id]={c:[],done:false}; while(s.c.length<m.chapters.length) s.c.push(false); if(s.c.length>m.chapters.length) s.c.length=m.chapters.length; return s}
MODULES.forEach(m=>{const s=ms(m); if(s.done&&!s.c.every(Boolean)) s.done=false;});
DUR['m3/c3']=86.1; DUR['m3/c6']=116.6;
cur={m:0,c:firstOpen(0)};
renderMods(); updateNow();
