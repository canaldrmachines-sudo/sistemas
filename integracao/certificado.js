/* Certificado de conclusão do Programa + registro na planilha (Google Forms) — Programa de Integração DR Machines */
(function () {
  const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLScKRndblI6rjvYGXxfWSAKxZYGn0qkY677Tpv0p6Cxwn1Z16g/formResponse';
  const F = { nome: 'entry.185177776', modulo: 'entry.819511712', data: 'entry.773746041' };
  const KEY = 'drm-certificados';
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  function load() { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function dataExtenso(d) { return d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear(); }
  function nomeModulo(m) { return 'Módulo ' + m.n + ' — ' + m.title; }

  // ---------- estilos ----------
  const css = document.createElement('style');
  css.textContent = `
  .cx-back{position:fixed;inset:0;background:rgba(8,8,10,.82);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;overflow:auto}
  .cx-back[hidden]{display:none}
  .cx-box{background:#1d1f22;border:1px solid #33373d;border-radius:18px;max-width:460px;width:100%;padding:28px;text-align:center}
  .cx-box h3{font-family:Montserrat,sans-serif;font-size:22px;margin:10px 0 6px}
  .cx-box p{color:#a8adb4;margin:0 0 18px;font-size:14px;line-height:1.5}
  .cx-box input{width:100%;padding:13px 16px;border-radius:12px;border:1px solid #33373d;background:#121315;color:#f3f3f3;font:inherit;font-size:16px;margin-bottom:14px}
  .cx-box input:focus{outline:2px solid #f7914d;border-color:transparent}
  .cx-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .cx-err{color:#f7914d;font-size:13px;min-height:18px;margin:-6px 0 8px}
  .cx-cert-wrap{max-width:1000px;width:100%}
  .cx-tools{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}
  .cert{aspect-ratio:297/210;width:100%;background:#fff;color:#1b1c1e;border-radius:6px;overflow:hidden;position:relative;font-family:Inter,system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.5);container-type:inline-size}
  .cert .band{background:#17181b;height:19%;display:flex;align-items:center;justify-content:space-between;padding:0 6%}
  .cert .band img{height:64%}
  .cert .band span{color:#f7914d;font-weight:600;letter-spacing:.28em;font-size:1.25cqw;text-transform:uppercase}
  .cert .line{height:1.1%;background:linear-gradient(90deg,#de6822,#f7914d)}
  .cert .body{padding:4.5% 8% 0;text-align:center}
  .cert .k{font-family:Montserrat,sans-serif;font-weight:800;letter-spacing:.32em;color:#de6822;font-size:1.7cqw}
  .cert .t{font-family:Montserrat,sans-serif;font-weight:800;font-size:4.4cqw;margin:1.4% 0 3%;color:#17181b}
  .cert .c{font-size:1.75cqw;color:#55595f;margin:0}
  .cert .nome{font-family:Montserrat,sans-serif;font-weight:800;font-size:4.2cqw;color:#17181b;margin:1.6% 0 1.2%;line-height:1.15}
  .cert .sub{width:30%;height:.35cqw;background:#f7914d;margin:0 auto 2.6%}
  .cert .txt{font-size:1.6cqw;line-height:1.6;color:#3a3d42;max-width:84%;margin:0 auto}
  .cert .txt b{color:#17181b}
  .cert .foot{position:absolute;left:8%;right:8%;bottom:7%;display:flex;justify-content:space-between;align-items:flex-end;font-size:1.25cqw;color:#7a7e84}
  .cert .foot .sig{text-align:center;min-width:32%}
  .cert .foot .sig div{border-top:1px solid #9a9ea4;padding-top:.7cqw;color:#3a3d42;font-weight:600}
  .cert .corner{position:absolute;right:-7%;bottom:-16%;width:34%;aspect-ratio:1;border-radius:50%;border:.35cqw solid rgba(247,145,77,.35)}
  .cert .corner2{position:absolute;right:-3%;bottom:-11%;width:24%;aspect-ratio:1;border-radius:50%;border:.2cqw solid rgba(23,24,27,.12)}
  .cx-cert-btn{margin-top:12px}
  @media print{
    @page{size:A4 landscape;margin:0}
    html,body{margin:0;padding:0;background:#fff}
    body>*:not(#cxroot){display:none!important}
    #cx-nome,.cx-tools{display:none!important}
    #cx-cert{position:static;display:block;padding:0;background:none;overflow:visible}
    .cx-cert-wrap{max-width:none}
    #cx-print .cert{width:297mm;height:209mm;aspect-ratio:auto;border-radius:0;box-shadow:none;page-break-after:avoid;break-after:avoid}
    .cert,.cert *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  }`;
  document.head.appendChild(css);

  // ---------- telas ----------
  const logo = (document.querySelector('header img') || {}).src || '';
  const wrap = document.createElement('div'); wrap.id = 'cxroot';
  wrap.innerHTML = `
  <div class="cx-back" id="cx-nome" hidden role="dialog" aria-modal="true" aria-labelledby="cx-h">
    <form class="cx-box" id="cx-form">
      <div class="kick" id="cx-k">Módulo concluído</div>
      <h3 id="cx-h">Parabéns!</h3>
      <p id="cx-p">Digite seu nome completo.</p>
      <input id="cx-in" type="text" autocomplete="name" maxlength="80" placeholder="Nome completo">
      <div class="cx-err" id="cx-err"></div>
      <div class="cx-row"><button class="big" type="submit">Registrar conclusão</button></div>
    </form>
  </div>
  <div class="cx-back" id="cx-cert" hidden role="dialog" aria-modal="true">
    <div class="cx-cert-wrap">
      <div id="cx-print"></div>
      <div class="cx-tools">
        <button class="big" type="button" id="cx-pdf">Salvar em PDF / imprimir</button>
        <button class="ghost" type="button" id="cx-close">Fechar</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(wrap);
  const $ = s => document.querySelector(s);
  let atual = null;

  function certHTML(nome, m, data) {
    const d = new Date(data);
    const box = document.createElement('div'); box.className = 'cert';
    box.innerHTML = `<div class="band"><img alt="DR Machines"><span>Programa de Integração</span></div><div class="line"></div>
      <div class="body"><div class="k">CERTIFICADO</div><div class="t">de Conclusão</div>
      <p class="c">Certificamos que</p><div class="nome"></div><div class="sub"></div>
      <p class="txt"></p></div>
      <div class="foot"><div>Grupo DR Machines<br>Pessoas conectadas. Empresas integradas. Um só propósito.</div>
      <div class="sig"><div>Grupo DR Machines</div>Programa de Integração</div></div>
      <div class="corner"></div><div class="corner2"></div>`;
    box.querySelector('img').src = logo;
    box.querySelector('.nome').textContent = nome;
    const t = box.querySelector('.txt');
    t.append('concluiu o ');
    const b = document.createElement('b'); b.textContent = 'Programa de Integração do Grupo DR Machines'; t.append(b);
    t.append(', em ' + dataExtenso(d) + ', composto pelos módulos: ' + MODULES.map(x => x.title).join(', ') + '.');
    return box;
  }

  function tudoConcluido() { return MODULES.every(x => ms(x).done); }

  function mostrarCert() {
    const st = load();
    if (!st.nome || !st.final) return;
    const p = $('#cx-print'); p.innerHTML = ''; p.appendChild(certHTML(st.nome, null, st.final));
    $('#cx-cert').hidden = false;
    document.title = 'Certificado — Programa de Integração — ' + st.nome;
  }

  function pedirNome(m) {
    atual = m;
    $('#cx-k').textContent = nomeModulo(m) + ' concluído';
    $('#cx-h').textContent = 'Parabéns!';
    $('#cx-p').textContent = 'Digite seu nome completo para registrar sua conclusão. Ao final de todos os módulos, ele aparecerá no seu certificado.';
    $('#cx-in').value = load().nome || '';
    $('#cx-err').textContent = '';
    $('#cx-nome').hidden = false;
    setTimeout(() => $('#cx-in').focus(), 50);
  }

  function enviar(nome, rotulo, d) {
    const body = new URLSearchParams();
    body.append(F.nome, nome);
    body.append(F.modulo, rotulo);
    body.append(F.data + '_year', d.getFullYear());
    body.append(F.data + '_month', d.getMonth() + 1);
    body.append(F.data + '_day', d.getDate());
    return fetch(FORM, { method: 'POST', mode: 'no-cors', body }).catch(() => {});
  }

  // registra a conclusão de um módulo (uma vez por módulo) e, se for o último, o programa completo
  function registrar(m) {
    const st = load(); const d = new Date();
    st.mods = st.mods || {};
    if (!st.mods[m.id]) { st.mods[m.id] = d.toISOString(); enviar(st.nome, nomeModulo(m), d); }
    if (tudoConcluido() && !st.final) {
      st.final = d.toISOString(); save(st);
      enviar(st.nome, 'PROGRAMA COMPLETO — certificado emitido', d);
      setTimeout(mostrarCert, 400);
    } else save(st);
    if (typeof updateNow === 'function') updateNow();
  }

  $('#cx-form').addEventListener('submit', e => {
    e.preventDefault();
    const nome = $('#cx-in').value.replace(/\s+/g, ' ').trim();
    if (nome.split(' ').length < 2 || nome.length < 5) { $('#cx-err').textContent = 'Digite nome e sobrenome.'; return; }
    const st = load(); st.nome = nome; save(st);
    $('#cx-nome').hidden = true;
    registrar(atual);
  });
  $('#cx-close').onclick = () => { $('#cx-cert').hidden = true; document.title = 'Programa de Integração — Grupo DR Machines'; };
  $('#cx-pdf').onclick = () => window.print();
  window.addEventListener('afterprint', () => { document.title = 'Programa de Integração — Grupo DR Machines'; });

  // ao concluir um módulo: pede o nome só na primeira vez; depois registra direto
  window.addEventListener('modulo-concluido', e => {
    const m = e.detail;
    setTimeout(() => { if (load().nome) registrar(m); else pedirNome(m); }, 600);
  });

  // botão "Ver certificado" na faixa de módulo concluído (só depois do programa completo)
  const banner = $('#doneb');
  if (banner) {
    const btn = document.createElement('button');
    btn.className = 'big cx-cert-btn'; btn.type = 'button'; btn.textContent = 'Ver meu certificado do Programa';
    btn.onclick = () => mostrarCert();
    banner.style.flexWrap = 'wrap'; banner.appendChild(btn);
    const sync = () => { btn.hidden = !load().final; };
    sync(); setInterval(sync, 1500);
  }
})();
