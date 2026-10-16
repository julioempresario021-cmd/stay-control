(() => {
  'use strict';
  const H = window.Hotel;
  let KEY = keyForEdition(location.hash.slice(1));
  function validData(state) {return H.valid(state) && (KEY!=='staycontrol-casa-completa-v1' || !!state.config.monitoring);}
  let data = seedForEdition(location.hash.slice(1)), storageOK = true, hardwareOnline = false;
  let hardwareInfo = {}, hardwareQueue = Promise.resolve(), adminActivity = Date.now();
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (validData(saved)) data = saved; } catch { storageOK = false; }
  const hashEdition = location.hash.replace('#','');
  let edition = ['casa','casa-completa','quarto','completa'].includes(hashEdition) ? hashEdition : 'escolher';
  let role = edition !== 'completa' ? 'guest' : 'reception', page = 'rooms', filter = 'all', query = '', currentRoom = '101', guestTab = 'lights', bank = 'main', adminUnlocked = false, adminTab = 'buttons', adminRoom = '101';
  let housePage='monitoring', mobileAdminToken='', mobileStatus={devices:[],push:{ready:false},mail:{ready:false},contacts:{phone:'',email:''}}, mobilePairCode='';
  const app = document.getElementById('app'), modal = document.getElementById('modal');
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    broom: '<path d="m16 3-6 10m-3-1 7 4-3 6-9-5 5-5Zm-2 7 4-5"/>',
    room: '<path d="M5 21V3h14v18M2 21h20M14 12h1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
    light: '<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0l-1 2H9l-1-2Z"/>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12h-3Z"/><path d="M7.5 9h.01M9.5 6h.01M14 6h.01M17 9h.01"/>',
    tv: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m8 2 4 4 4-4M9 22h6"/>',
    snow: '<path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M3 10l4-1V5m10 14v-4l4-1M3 14l4 1v4M17 5v4l4 1"/>',
    music: '<path d="M9 18V5l12-2v13M9 8l12-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="18" cy="16" rx="3" ry="3"/>',
    bluetooth: '<path d="m7 7 10 10-5 4V3l5 4L7 17"/>',
    menu: '<path d="M5 3v6a3 3 0 0 0 6 0V3M8 3v19M20 22V3c-5 2-5 10 0 10"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    power: '<path d="M12 2v10M6 5a9 9 0 1 0 12 0"/>',
    minus: '<path d="M5 12h14"/>', plus: '<path d="M5 12h14M12 5v14"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    plug: '<path d="M8 3v5m8-5v5M5 8h14M7 8v5a5 5 0 0 0 10 0V8m-5 10v4"/>',
    alert: '<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3v.1"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
    shield: '<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/><path d="m8 12 3 3 5-6"/>',
    previous: '<path d="M5 4v16M19 4 7 12l12 8V4Z"/>',
    next: '<path d="M19 4v16M5 4l12 8-12 8V4Z"/>',
    play: '<path d="m8 4 12 8-12 8V4Z"/>',
    book: '<path d="M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v16"/>'
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const logoSrc = () => data.config.logoData || 'assets/staycontrol-logo.jpg';
  const wordmark = () => data.config.logoData ? `<img class="custom-logo compact" src="${esc(logoSrc())}" alt="Logo do hotel">` : `<span class="guest-brand"><b>STAY</b><em>CONTROL</em></span>`;
  const selected = () => data.rooms.find(r => r.id === currentRoom);
  const time = date => date ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(date)) : 'Sem alterações';
  const statusIcon = { free: 'check', occupied: 'room', cleaning: 'broom', waiting: 'clock' };
  function badge(r) { return `<span class="badge ${r.status}">${icon(statusIcon[r.status])}${H.states[r.status].label}</span>`; }
  function lamps(r, big = false) { const s = H.lamps(r.status); return `<div class="lamp-unit ${big ? 'big' : ''}" role="img" aria-label="${H.states[r.status].lamp}"><span class="lamp green ${s.green ? 'on' : ''} ${s.blinking ? 'blinking' : ''}"></span><span class="lamp red ${s.red ? 'on' : ''}"></span></div>`; }
  function toast(text) { const el = document.getElementById('toast'); el.textContent = text; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3600); }
  function hardwareCommand(id, action, payload) {
    if (!hardwareOnline || id !== '101') return;
    const room = data.rooms.find(r => r.id === id);
    if (!room) return;
    let command = '';
    if (action === 'alloff') command = 'ALL OFF';
    if (['checkin','checkout','clean','release'].includes(action)) command = 'STATUS ' + ({free:'FREE',occupied:'OCCUPIED',cleaning:'CLEANING',waiting:'WAITING'}[room.status]);
    if (action === 'relay') command = `RELAY ${Number(payload.index) + 1} ${room.relays[Number(payload.index)] ? 'ON' : 'OFF'}`;
    if (action === 'device' && payload.device === 'led') {
      const color = room.led.on ? room.led.color : '#000000';
      const rgb = [color.slice(1,3), color.slice(3,5), color.slice(5,7)].map(v => parseInt(v, 16));
      command = `RGB ${rgb[0]} ${rgb[1]} ${rgb[2]} ${room.led.on ? room.led.brightness : 0}`;
    }
    const commands = action === 'aux' && !room.auxiliary ? Array.from({length:8},(_,i)=>`RELAY ${i+9} OFF`) : command ? [command] : [];
    if (!commands.length) return;
    hardwareQueue = hardwareQueue.then(async () => {
      for (const command of commands) {
      const response = await fetch('./api/hardware', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({command}), signal:AbortSignal.timeout(6000) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw Error(result.error || 'Não foi possível confirmar o comando.');
      }
    }).catch(error => { hardwareInfo.error = error.message; toast('Falha no equipamento: ' + error.message); render(); });
  }
  async function pollHardware() {
    try {
      const response = await fetch('./api/hardware/status', {cache:'no-store'});
      hardwareInfo = response.ok ? await response.json() : {};
      const next = hardwareInfo.connected === true;
      if(next && edition==='casa-completa') {
        let updated=false;
        data.rooms.forEach((room,index)=>{const open=hardwareInfo.sensors?.[String(index+1)];if(typeof open==='boolean' && room.door!==open){data=H.change(data,room.id,'sensor',{open,source:'hardware'});updated=true;}});
        if(updated){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{storageOK=false;}render();}
      }
      if (next && edition!=='casa-completa' && typeof hardwareInfo.sensors?.['1'] === 'boolean') {
        const room = data.rooms.find(r => r.id === '101');
        if (room.door !== hardwareInfo.sensors['1']) {
          room.door = hardwareInfo.sensors['1'];
          try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { storageOK=false; }
          render();
        }
      }
      if (next && !hardwareOnline) fetch('./api/hardware', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command:'GET STATE'})}).catch(()=>{});
      if (next !== hardwareOnline) { hardwareOnline = next; if(next)currentRoom='101'; render(); }
    } catch { if (hardwareOnline) { hardwareOnline = false; render(); } }
  }
  function commit(id, action, payload, message) {
    try {
      // Reload before each write so open demo tabs do not overwrite a newer action.
      try { const latest = JSON.parse(localStorage.getItem(KEY)); if (validData(latest)) data = latest; } catch {}
      data = H.change(data, id, action, payload);
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { storageOK = false; }
      hardwareCommand(id, action, payload);
      render(); toast(message || 'Demonstração atualizada.'); return true;
    } catch (e) { toast(e.message); return false; }
  }
  function saveConfig(action, payload, message) {
    try {
      if (!adminUnlocked) throw Error('Entre como administrador para modificar o aplicativo.');
      try { const latest = JSON.parse(localStorage.getItem(KEY)); if (validData(latest)) data = latest; } catch {}
      data = H.configure(data, action, payload);
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { storageOK = false; }
      render(); toast(message || 'Configuração salva.'); return true;
    } catch (e) { toast(e.message); return false; }
  }
  function nav() { return `<aside class="sidebar"><a class="brand" href="#" data-action="home" aria-label="Marca do hotel · Central do hotel">${data.config.logoData?`<img class="custom-logo sidebar-logo" src="${esc(logoSrc())}" alt="Logo do hotel">`:`<span class="brand-mark">S</span><span class="brand-word"><b>STAY</b><em>CONTROL</em><small>CENTRAL DO HOTEL</small></span>`}</a><div class="sidebar-caption">ESPAÇO DE TRABALHO</div><nav aria-label="Navegação principal">${[['rooms','grid','Visão geral'],['history','clock','Atividades'],['project','book','O projeto']].map(([id,ic,label]) => `<button data-action="page" data-page="${id}" class="nav-item ${page===id?'active':''}">${icon(ic)}${label}${page===id?'<span class="nav-marker"></span>':''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="private-note">${icon('shield')}<span>Ambiente de apresentação<small>Quartos e dados fictícios</small></span></div><button class="demo-guide" data-action="guide">${icon('play')} Roteiro da demonstração ${icon('arrow')}</button><div class="creator"><span class="avatar">P</span><div>Seu projeto<small>Versão demonstrativa 01</small></div></div></div></aside>`; }
  function shell(content) {
    const date = new Intl.DateTimeFormat('pt-BR', {day:'numeric', month:'long'}).format(new Date());
    return `${nav()}<div class="workspace"><header class="topbar"><div class="breadcrumb">Central do hotel <span>/</span> <strong>${page==='rooms' ? ({reception:'Recepção',housekeeping:'Camareira',guest:'Quarto'}[role]) : page==='history'?'Atividades':'O projeto'}</strong></div><div class="topbar-right"><button class="switch-edition" data-action="choose-edition">${icon('grid')} Versões</button><span class="date">${date}</span><span class="demo-tag"><span></span>Demonstração</span></div></header><main><div class="role-bar"><span class="eyebrow">EXPERIMENTE AS QUATRO ÁREAS</span><div class="role-tabs" role="group" aria-label="Áreas da demonstração">${[['reception','monitor','Recepção'],['guest','room','Painel do quarto'],['admin','shield','Administrador'],['housekeeping','phone','Camareira']].map(([id,ic,label])=>`<button data-action="${id==='admin'?'admin':'role'}" ${id==='admin'?'':`data-role="${id}"`} class="${id==='admin'?'admin-role-tab':role===id?'selected':''}" ${id==='admin'?'aria-haspopup="dialog"':`aria-pressed="${role===id}"`}>${icon(ic)}${label}</button>`).join('')}</div></div>${content}<footer class="footer"><span><span class="tiny-dot"></span> Protótipo interativo · equipamentos simulados</span><span>${storageOK?'Alterações salvas somente neste navegador':'Armazenamento indisponível · alterações temporárias'}</span></footer></main><nav class="mobile-nav" aria-label="Navegação no celular"><button data-action="page" data-page="rooms">${icon("grid")}Quartos</button><button data-action="page" data-page="history">${icon("clock")}Atividades</button><button data-action="page" data-page="project">${icon("book")}O projeto</button></nav></div>`;
  }
  function isHome() { return ['casa','casa-completa'].includes(edition); }
  function keyForEdition(value) {return value==='casa-completa'?'staycontrol-casa-completa-v1':value==='casa'?'staycontrol-casa-v1':'estadia-hotel-demo-v1';}
  function seedForEdition(value) {return value==='casa-completa'?H.homeCompleteSeed():value==='casa'?H.homeSeed():H.seed();}
  function activateEdition(value) {
    edition = ['casa','casa-completa','quarto','completa'].includes(value) ? value : 'escolher';
    const nextKey = keyForEdition(edition);
    if(nextKey!==KEY){KEY=nextKey;data=seedForEdition(edition);try{const saved=JSON.parse(localStorage.getItem(KEY));if(validData(saved))data=saved;}catch{storageOK=false;}}
    housePage='monitoring';currentRoom='101';adminRoom='101';guestTab='lights';bank='main';adminTab='buttons';adminUnlocked=false;mobileAdminToken='';mobilePairCode='';
    role=edition==='completa'?'reception':'guest';page='rooms';closeDialog();render();
  }
  const roomLabel = room => isHome() ? room.type : room.id;
  function editionChooser() {
    return `<main class="edition-page"><section class="edition-intro"><img class="brand-logo-full" src="${esc(logoSrc())}" alt="Logo do sistema do hotel"><span class="eyebrow">AUTOMAÇÃO PARA CASAS E HOTÉIS</span><h1>Quatro versões.<br>Uma experiência melhor.</h1><p>Escolha a solução que deseja apresentar. Você pode alternar entre elas a qualquer momento.</p></section><div class="edition-groups"><section class="edition-group" aria-labelledby="house-editions"><h2 id="house-editions" class="edition-group-title">Casa <span>Escolha seu nível de controle residencial</span></h2><div class="edition-cards"><article class="edition-card home-edition"><span class="edition-number">01</span><span class="edition-icon">${icon('room')}</span><h3>Casa Essencial</h3><p>Controle os ambientes da residência em uma central touch com a identidade STAYCONTROL.</p><ul><li>${icon('light')}Luzes, tomadas e fita RGB</li><li>${icon('snow')}Climatização por ambiente</li><li>${icon('tv')}TV, som e Bluetooth com aceite</li><li>${icon('shield')}Configuração do administrador</li></ul><button class="button edition-button" data-action="edition" data-edition="casa">Abrir Casa Essencial ${icon('arrow')}</button></article><article class="edition-card home-edition"><span class="edition-number">02</span><span class="edition-icon">${icon('shield')}</span><h3>Casa Premium</h3><p>Automação residencial com sensores de portas e janelas, monitoramento e administração.</p><ul><li>${icon('light')}Controles por ambiente</li><li>${icon('room')}Até 8 entradas de sensores</li><li>${icon('bell')}Alertas e histórico de aberturas</li><li>${icon('shield')}Administrador com PIN</li></ul><button class="button edition-button" data-action="edition" data-edition="casa-completa">Abrir Casa Premium ${icon('arrow')}</button></article></div></section><section class="edition-group" aria-labelledby="hotel-editions"><h2 id="hotel-editions" class="edition-group-title">Hotel <span>Escolha como atender seus hóspedes</span></h2><div class="edition-cards"><article class="edition-card room-edition"><span class="edition-number">03</span><span class="edition-icon">${icon('room')}</span><h3>Hotel Essencial</h3><p>Uma central independente dentro do quarto, com tela touch para o hóspede controlar todos os equipamentos.</p><ul><li>${icon('light')}8 relés principais + 8 auxiliares</li><li>${icon('snow')}Ar-condicionado por infravermelho</li><li>${icon('tv')}TV e som</li><li>${icon('menu')}Cardápio digital</li></ul><button class="button edition-button" data-action="edition" data-edition="quarto">Abrir Hotel Essencial ${icon('arrow')}</button></article><article class="edition-card complete-edition"><span class="edition-number">04</span><span class="edition-icon">${icon('monitor')}</span><h3>Hotel Premium</h3><p>O sistema integrado para quarto, recepção e camareira, com estados, sinalização e histórico.</p><ul><li>${icon('grid')}Painel de todos os quartos</li><li>${icon('phone')}Aplicativo da camareira</li><li>${icon('room')}Sensor e sinalização da porta</li><li>${icon('clock')}Fluxo de ocupação e liberação</li></ul><button class="button edition-button" data-action="edition" data-edition="completa">Abrir Hotel Premium ${icon('arrow')}</button></article></div></section></div><footer class="edition-footer">STAYCONTROL · O controle na sua mão, conforto sem complicação</footer></main>`;
  }
  function houseCompleteShell() {
    return `<div class="room-only home-complete"><header class="room-only-top"><div class="room-only-brand">${wordmark()}<button class="admin-access" data-action="admin" aria-label="Acesso do administrador">${icon('shield')} Administrador</button><span>CASA PREMIUM</span></div><div class="room-only-actions"><span class="demo-tag">${hardwareOnline?'Controlador USB':'Demonstração'}</span><button class="switch-edition" data-action="choose-edition">${icon('grid')} Versões</button></div></header><main class="room-only-main"><nav class="house-navigation" aria-label="Áreas da casa">${[['controls','light','Equipamentos'],['monitoring','shield','Monitoramento'],['events','clock','Eventos']].map(([id,ic,label])=>`<button class="button ${housePage===id?'primary':'secondary'}" data-action="house-page" data-page="${id}" aria-pressed="${housePage===id}">${icon(ic)} ${label}</button>`).join('')}</nav>${housePage==='controls'?guest():housePage==='events'?houseEvents():houseMonitoring()}</main><footer class="room-only-footer">Monitoramento de contatos de portas e janelas · ${hardwareOnline?'8 entradas USB':'sensores simulados'} · alertas na tela</footer></div>`;
  }
  function houseMonitoring() {
    const enabled=data.rooms.filter(r=>r.security.enabled),opened=enabled.filter(r=>r.door),alerts=data.rooms.filter(r=>r.security.alarm),armed=data.config.monitoring.armed;
    return `<section class="monitor-hero ${alerts.length?'alarm':''}"><div><span class="eyebrow">MONITORAMENTO RESIDENCIAL</span><h1>${alerts.length?'Abertura detectada':armed?'Monitoramento ativado':'Acompanhe sua casa'}</h1><p>${armed?'Sensores habilitados geram avisos de abertura.':'Sensores mostram aberturas; ative o monitoramento para registrar alertas.'}</p></div><button class="button secondary" data-action="monitor-admin">${icon('shield')} Configurar monitoramento</button></section><div class="monitor-summary"><span><strong>${enabled.length}</strong> sensores habilitados</span><span><strong>${opened.length}</strong> abertos</span><span><strong>${alerts.length}</strong> alertas registrados</span><span>${icon('power')} ${armed?'Ativado':'Desativado'}</span></div>${alerts.length?`<p class="pending-note" role="alert">${icon('alert')} Verifique ${alerts.map(r=>esc(r.security.label)).join(', ')}. O administrador pode reconhecer o aviso após verificar a situação.</p>`:''}<div class="sensor-grid">${data.rooms.map((room,index)=>`<article class="sensor-card ${room.security.alarm?'alarm':room.door?'opened':''}"><div class="sensor-card-title">${icon('room')}<span>ENTRADA ${index+1}</span><span class="sensor-status ${room.door?'opened':''}">${room.security.enabled?(room.door?'Aberto':'Fechado'):'Desabilitado'}</span></div><h2>${esc(room.security.label)}</h2><p>${esc(room.type)}</p>${room.security.alarm?'<p class="sensor-alert">Alerta registrado</p>':''}<button class="button secondary" data-action="sensor-sim" data-room="${room.id}" ${hardwareOnline?'disabled':''}>${hardwareOnline?'Leitura do sensor USB':room.door?'Simular fechamento':'Simular abertura'}</button></article>`).join('')}</div><p class="small-note">${hardwareOnline?'Os sensores 1 a 8 do Arduino correspondem às entradas acima.':'Os botões simulam contatos de sensores para apresentação.'} Os avisos permanecem no histórico mesmo depois de fechar a porta. Histórico móvel disponível no aplicativo Minha Casa. Push depende de HTTPS e autorização do cliente; não há sirene.</p>`;
  }
  function houseEvents() {
    return `<section class="page-heading"><div><span class="eyebrow">HISTÓRICO RESIDENCIAL</span><h1>Eventos da casa</h1><p>Aberturas, alertas e comandos dos equipamentos.</p></div></section><section class="history-panel">${data.history.length?data.history.map(e=>`<article class="event"><span class="event-icon">${icon('clock')}</span><div><strong>${esc(data.rooms.find(r=>r.id===e.room)?.type || 'Casa')} · ${esc(e.text)}</strong><p>${esc(e.actor)}</p></div><time>${time(e.at)}</time></article>`).join(''):'<div class="empty-state">Nenhum evento ainda. Abra um sensor no painel de monitoramento para experimentar.</div>'}</section>`;
  }
  async function mobileApi(path,payload) {
    const response=await fetch('./api/mobile/'+path,{method:payload?'POST':'GET',headers:{'Content-Type':'application/json','Authorization':'Bearer '+mobileAdminToken},...(payload?{body:JSON.stringify(payload)}:{}),cache:'no-store',signal:AbortSignal.timeout(10000)});
    const result=await response.json();if(!response.ok)throw Error(result.error || 'Serviço móvel indisponível.');return result;
  }
  async function loadMobileStatus() {
    mobileStatus=await mobileApi('admin/status');
    if(mobileStatus.config.sensors.length!==8){await mobileApi('config',{armed:data.config.monitoring.armed,sensors:data.rooms.map(r=>({label:r.security.label,enabled:r.security.enabled}))});mobileStatus=await mobileApi('admin/status');}
    data.config.monitoring.armed=mobileStatus.config.armed;
    data.rooms.forEach((r,i)=>{r.security.label=mobileStatus.config.sensors[i].label;r.security.enabled=mobileStatus.config.sensors[i].enabled;});
    try{localStorage.setItem(KEY,JSON.stringify(data));}catch{storageOK=false;}
  }
  async function saveSecurity(action,payload,message) {
    try{if(!adminUnlocked)throw Error('Entre como administrador.');const next=H.configure(data,action,payload);await mobileApi('config',{armed:next.config.monitoring.armed,sensors:next.rooms.map(r=>({label:r.security.label,enabled:r.security.enabled}))});return saveConfig(action,payload,message);}catch(error){toast(error.message);return false;}
  }
  function mobileAdminPanel() {
    return `<section class="admin-section"><h3>Contatos para alertas</h3><p>Cadastre o telefone de referência e o e-mail que deve receber os alertas de abertura.</p><form id="mobile-contacts-form"><label class="admin-wide-field">Telefone do responsável, com DDD<input name="phone" type="tel" inputmode="tel" maxlength="30" autocomplete="tel" placeholder="(61) 99999-9999" value="${esc(mobileStatus.contacts?.phone||'')}"></label><label class="admin-wide-field">E-mail para receber alertas<input name="email" type="email" maxlength="254" autocomplete="email" placeholder="nome@exemplo.com" value="${esc(mobileStatus.contacts?.email||'')}"></label><button class="button primary full" type="submit">Salvar contatos</button></form><p>E-mail: ${mobileStatus.mail?.ready?'envio de alertas configurado':'cadastro salvo; falta configurar o serviço remetente de e-mail na Vercel'}.</p><p>O telefone recebe notificações pelo aplicativo vinculado abaixo; SMS não está habilitado.</p><h3>Aplicativo do cliente</h3><p>O cliente abre <strong>celular.html</strong> no endereço desta central. Para outro aparelho, use o IP da Raspberry Pi ou o endereço HTTPS da instalação.</p><label class="admin-wide-field">Nome do celular<input id="mobile-name" maxlength="60" value="Celular do cliente"></label><button class="button primary full" data-action="mobile-pair">Gerar código de vinculação</button>${mobilePairCode?`<label class="admin-wide-field">Código exclusivo do celular<input readonly value="${esc(mobilePairCode)}" aria-label="Código de vinculação do celular"></label><p>Copie este código no aplicativo do celular. Guarde-o como uma senha.</p>`:''}<button class="button secondary full" data-action="mobile-open">Abrir aplicativo Minha Casa</button><button class="button secondary full" data-action="mobile-test">Gerar notificação de teste</button><p>Notificações no celular: ${mobileStatus.push.ready?'serviço configurado':'aguardando configuração de HTTPS e Web Push'}.</p><h3>Celulares vinculados</h3>${mobileStatus.devices.map(d=>`<div class="mobile-device"><span>${esc(d.name)}<small>${d.push?'Notificações push autorizadas':'Somente histórico; autorize notificações no aplicativo'}</small></span><button class="button secondary" data-action="mobile-revoke" data-id="${esc(d.id)}">Revogar acesso</button></div>`).join('')||'<p>Nenhum celular vinculado.</p>'}</section>`;
  }
  function sensorAdmin() {
    const armed=data.config.monitoring.armed;
    return `<section class="admin-section"><h3>Sensores e monitoramento</h3><p>Feche os sensores habilitados antes de ativar. Os alertas são avisos locais na tela.</p><div class="monitor-admin-actions"><button class="button ${armed?'secondary':'primary'}" data-action="monitor-toggle">${armed?'Desativar':'Ativar'} monitoramento</button><button class="button secondary" data-action="monitor-ack">Reconhecer alertas</button></div>${data.rooms.map((room,index)=>`<form class="sensor-config" data-room="${room.id}"><h4>Entrada ${index+1}</h4><label>Ambiente<input name="environment" maxlength="32" value="${esc(room.type)}" required ${armed?'disabled':''}></label><label>Nome do sensor<input name="label" maxlength="50" value="${esc(room.security.label)}" required ${armed?'disabled':''}></label><label class="sensor-enabled"><input name="enabled" type="checkbox" ${room.security.enabled?'checked':''} ${armed?'disabled':''}> Habilitado no monitoramento</label><button class="button secondary" type="submit" ${armed?'disabled':''}>Salvar sensor</button></form>`).join('')}</section>`;
  }
  function roomOnlyShell() {
    return `<div class="room-only"><header class="room-only-top"><div class="room-only-brand">${wordmark()}<button class="admin-access" data-action="admin" aria-label="Acesso do administrador">${icon('shield')} Administrador</button><span>${isHome()?'VERSÃO CASA':'VERSÃO QUARTO'}</span></div><div class="room-only-actions"><span class="demo-tag"><span></span>Demonstração</span><button class="switch-edition" data-action="choose-edition">${icon('grid')} Escolher versão</button></div></header><main class="room-only-main">${guest()}</main><footer class="room-only-footer">${icon('info')} Equipamentos simulados · projeto preparado para Raspberry Pi 5 e tela touch de 7″</footer></div>`;
  }
  function overview() {
    const count = key => data.rooms.filter(r=>r.status===key).length;
    const rooms = data.rooms.filter(r=>(filter==='all'||r.status===filter)&&(r.id.includes(query)||r.type.toLowerCase().includes(query.toLowerCase())));
    return `<section class="page-heading"><div><div class="eyebrow">RECEPÇÃO</div><h1>Cada quarto, em sintonia.</h1><p>Acompanhe a ocupação e a preparação dos quartos em um só lugar.</p></div><button class="button secondary" data-action="guide">${icon('play')} Como apresentar</button></section><div class="overview-grid"><section class="welcome-card"><div><span class="welcome-kicker">TUDO PRONTO PARA RECEBER</span><h2>${count('free')} ${count('free')===1?'quarto livre':'quartos livres'}<span>para a próxima estadia.</span></h2><p>${count('cleaning')+count('waiting')} em preparação · ${count('occupied')} ocupados</p></div><div class="door-art" aria-hidden="true"><div class="door-frame"><div class="door-panel"><span>101</span><i></i></div></div><span class="art-lamp"></span></div></section><section class="status-summary" aria-label="Resumo dos quartos">${Object.entries(H.states).map(([key,s])=>`<button data-action="filter" data-filter="${key}" class="summary-item ${filter===key?'chosen':''}"><span class="summary-icon ${key}">${icon(statusIcon[key])}</span><span class="summary-label">${s.label}</span><strong>${count(key).toString().padStart(2,'0')}</strong></button>`).join('')}</section></div><section class="room-section"><div class="section-top"><h2>Mapa de quartos <span>${data.rooms.length}</span></h2><label class="search">${icon('search')}<input id="room-search" type="search" placeholder="Buscar quarto" aria-label="Buscar quarto" value="${esc(query)}"></label></div><div class="filter-row" role="group" aria-label="Filtrar quartos">${[['all','Todos'],...Object.entries(H.states).map(([k,s])=>[k,s.label])].map(([key,label])=>`<button class="filter ${filter===key?'active':''}" data-action="filter" data-filter="${key}" aria-pressed="${filter===key}">${label}</button>`).join('')}<span class="floor-label">1º andar</span></div><div class="room-grid">${rooms.map(roomCard).join('')||'<div class="empty-state">Nenhum quarto corresponde a esta busca.<button class="text-button" data-action="clear-filter">Limpar filtros</button></div>'}</div></section><div class="legend"><strong>Sinalização da porta</strong>${Object.entries(H.states).map(([status,s])=>`<span>${lamps({status})}${s.label}</span>`).join('')}</div>`;
  }
  function roomCard(r) {
    return `<article class="room-card ${r.status}"><div class="room-card-head"><div><span class="room-overline">QUARTO</span><h3>${r.id}</h3></div><span class="room-type">${r.type}</span></div>${badge(r)}<div class="room-door ${r.door?'open':''}">${icon('room')} Porta ${r.door?'aberta':'fechada'}${r.pending?`<span class="pending-dot" title="Pendência registrada">${icon('alert')}</span>`:''}</div><div class="card-divider"></div><div class="room-card-foot">${lamps(r)}<button data-action="detail" data-room="${r.id}" class="text-button" aria-label="Ver quarto ${r.id}">Ver quarto ${icon('arrow')}</button></div></article>`;
  }
  function housekeeping() {
    const tasks = data.rooms.filter(r=>['waiting','cleaning'].includes(r.status));
    const available = data.rooms.filter(r=>r.status==='free').length;
    return `<section class="page-heading"><div><div class="eyebrow">APP DA CAMAREIRA</div><h1>Cuidado em cada detalhe.</h1><p>Organize a arrumação, confira o quarto e avise a recepção.</p></div><span class="device-label">${icon('phone')} Preparado para celular</span></section><div class="housekeeping-banner"><span class="round-icon">${icon('broom')}</span><div><h2>${tasks.length} quartos precisam de atenção</h2><p>${available} livres. Selecione um quarto para continuar.</p></div></div><div class="task-grid">${tasks.map(r=>`<article class="task-card"><div class="task-top"><div><span class="eyebrow">${r.type.toUpperCase()}</span><h2>Quarto ${r.id}</h2></div>${lamps(r,true)}</div>${badge(r)}<p>${r.status==='waiting'?'Aguardando o início da arrumação.':'Arrumação em andamento. Faça a vistoria antes de liberar.'}</p>${r.pending?`<div class="pending-note">${icon('alert')}<span>${esc(r.pending)}</span></div>`:''}<div class="task-actions"><button class="button primary" data-action="${r.status==='waiting'?'clean':'inspection'}" data-room="${r.id}">${icon(r.status==='waiting'?'broom':'check')}${r.status==='waiting'?'Iniciar arrumação':'Conferir e liberar'}</button><button class="button secondary" data-action="${r.pending?'resolve':'pending'}" data-room="${r.id}">${r.pending?'Resolver pendência':'Registrar pendência'}</button></div><div class="task-time">${icon('clock')}${r.updated?'Atualizado às '+time(r.updated):'Quarto de demonstração'}</div></article>`).join('')||`<div class="empty-state">${icon('check')}<h2>Tudo em ordem.</h2><p>Nenhum quarto aguardando arrumação. Registre um checkout na recepção para experimentar o fluxo.</p></div>`}</div><div class="process-line"><span>01 · Aguardar liberação</span>${icon('arrow')}<span>02 · Iniciar arrumação</span>${icon('arrow')}<span>03 · Vistoriar e liberar</span></div>`;
  }
  function guest() {
    const r = selected();
    const tabs = [['lights','light','Luzes e tomadas'],['led','palette','LED RGB'],['ac','snow','Climatização'],['tv','tv','Televisão'],['sound','music','Som'],...(isHome()?[]:[['menu','menu','Cardápio']])];
    return `<div class="guest-toolbar"><div><span class="eyebrow">${isHome()?'CONTROLE DA SUA CASA':'EXPERIÊNCIA DO HÓSPEDE'}</span><p>Painel touch de 7″ · ${hardwareOnline && r.id==='101'?'controlador USB conectado':'modo demonstração'}</p></div><label>${isHome()?'Ambiente':'Quarto'} <select id="guest-room" aria-label="${isHome()?'Selecionar ambiente':'Selecionar quarto da demonstração'}">${data.rooms.filter(room=>!hardwareOnline || room.id==='101').map(room=>`<option ${r.id===room.id?'selected':''} value="${room.id}">${esc(roomLabel(room))}</option>`).join('')}</select></label></div><section class="guest-panel"><header class="guest-header"><div>${wordmark()}<p>${esc(data.config.guestTagline)}</p></div><div class="guest-room-number"><span>${isHome()?'AMBIENTE':'QUARTO'}</span><strong>${esc(roomLabel(r))}</strong></div></header><nav class="guest-nav" aria-label="Controles do quarto">${tabs.map(([id,ic,label])=>`<button data-action="guest-tab" data-tab="${id}" class="${guestTab===id?'active':''}" aria-pressed="${guestTab===id}">${icon(ic)}<span>${label}</span></button>`).join('')}</nav><div class="guest-content">${hardwareInfo.error?`<p class="pending-note" role="alert">Falha no equipamento: ${esc(hardwareInfo.error)}</p>`:""}${guestTab==='lights'?lights(r):guestTab==='led'?ledControl(r):guestTab==='menu'?menu():device(r,guestTab)}</div><div class="guest-footer">${icon('info')} ${guestTab==='menu'?'Cardápio ilustrativo · produtos e preços de exemplo · apenas consulta':hardwareOnline && ['lights','led'].includes(guestTab)?'Controle USB ativo no quarto 101 · aguarde a confirmação do equipamento':'Modo demonstração · controlador físico desconectado'}</div></section>`;
  }
  function lights(r) {
    const aux = bank==='aux' && r.auxiliary;
    const names = aux ? r.relayNames.slice(8,16) : r.relayNames.slice(0,8);
    const bankSelector = r.auxiliary ? `<div class="bank-tabs"><button data-action="bank" data-bank="main" class="${!aux?'active':''}">Principal · 8</button><button data-action="bank" data-bank="aux" class="${aux?'active':''}">Expansão · 8</button></div>` : '';
    return `<div class="guest-content-heading"><div><h2>Deixe o ambiente como você gosta.</h2><p>Toque para ligar ou desligar.</p><button class="button secondary" data-action="alloff-confirm" data-room="${r.id}">Desligar luzes e tomadas</button></div>${bankSelector}</div><div class="relay-grid">${names.map((name,i)=>{const index=i+(aux?8:0),on=r.relays[index];return `<button class="relay-tile ${on?'on':''}" data-action="relay" data-index="${index}" data-room="${r.id}" aria-pressed="${on}">${icon(aux||i>5?'plug':'light')}<span class="relay-name">${esc(name)}</span><span class="relay-bottom"><span>${on?'Ligado':'Desligado'}</span><span class="switch ${on?'on':''}"></span></span></button>`;}).join('')}</div>`;
  }
  function adjust(r, device, property, value, delta, label) { return `<button class="round-button" data-action="adjust" data-room="${r.id}" data-device="${device}" data-property="${property}" data-value="${value+delta}" aria-label="${label}" ${value+delta<({temperature:16,volume:0,channel:1}[property])||value+delta>({temperature:30,volume:100,channel:999}[property])?'disabled':''}>${icon(delta<0?'minus':'plus')}</button>`; }
  function device(r, name) {
    const d=r[name];
    if(name==='ac') return `<div class="device-control"><div class="device-description"><span class="device-glyph">${icon('snow')}</span><h2>Seu clima ideal.</h2><p>Temperatura e modo pelo controle infravermelho.</p><button class="power-button ${d.on?'on':''}" data-action="power" data-device="ac" data-room="${r.id}" aria-pressed="${d.on}">${icon('power')} ${d.on?'Ligado':'Desligado'}</button></div><div class="temperature-box"><span>TEMPERATURA AJUSTADA</span><div class="temperature-adjust">${adjust(r,'ac','temperature',d.temperature,-1,'Diminuir temperatura')}<strong>${d.temperature}<small>°C</small></strong>${adjust(r,'ac','temperature',d.temperature,1,'Aumentar temperatura')}</div><label class="mode-select">Modo <select id="ac-mode" data-room="${r.id}">${['Resfriar','Ventilar','Automático'].map(v=>`<option ${d.mode===v?'selected':''}>${v}</option>`).join('')}</select></label><p>Valor demonstrativo, sem leitura de sensor.</p></div></div>`;
    return `<div class="device-control ${name==='sound'?'sound-control':''}"><div class="device-description"><span class="device-glyph">${icon(name==='tv'?'tv':'music')}</span><h2>${name==='tv'?'Seu momento de descanso.':'A música do seu celular.'}</h2><p>${name==='tv'?'Controle de energia, volume e canais.':'Pareie por Bluetooth e ouça nas caixas do quarto.'}</p><button class="power-button ${d.on?'on':''}" data-action="power" data-device="${name}" data-room="${r.id}" aria-pressed="${d.on}">${icon('power')} ${d.on?'Ligado':'Desligado'}</button></div><div class="media-controls"><label for="device-volume">Volume <strong>${d.volume}%</strong></label><input type="range" id="device-volume" min="0" max="100" step="1" value="${d.volume}" data-device="${name}" data-room="${r.id}"><div class="volume-buttons">${adjust(r,name,'volume',d.volume,-1,'Diminuir volume')}${adjust(r,name,'volume',d.volume,1,'Aumentar volume')}</div>${name==='tv'?`<div class="channel-control"><span>Canal</span>${adjust(r,'tv','channel',d.channel,-1,'Canal anterior')}<strong>${d.channel}</strong>${adjust(r,'tv','channel',d.channel,1,'Próximo canal')}</div>`:`${trackControls(r)}${bluetoothPanel(r)}`}</div></div>`;
  }
  function trackControls(r) {
    const paired=r.sound.bluetooth.paired,number=r.sound.trackNumber || 1;
    return `<section class="track-controls" aria-label="Trocar música"><p>${paired?'Faixa '+number+' · demonstração':'Pareie seu celular para trocar as músicas'}</p><div><button class="button secondary" data-action="track-previous" data-room="${r.id}" aria-label="Música anterior" ${!paired||number===1?'disabled':''}>${icon('previous')} Música anterior</button><button class="button secondary" data-action="track-next" data-room="${r.id}" aria-label="Próxima música" ${!paired?'disabled':''}>Próxima música ${icon('next')}</button></div></section>`;
  }
  function bluetoothPanel(r) {
    const bt = r.sound.bluetooth || { paired: false, device: '', pendingDevice: '', code: '' };
    return `<section class="bluetooth-panel"><div class="bluetooth-head"><span class="bluetooth-mark">${icon('bluetooth')}</span><div><strong>Bluetooth protegido</strong><small>${bt.paired?'Aparelho conectado':bt.pendingDevice?'Confirmação aguardando':'Pronto para receber pedido'}</small></div><span class="connection-dot ${bt.paired?'connected':bt.pendingDevice?'waiting':''}"></span></div>${bt.paired?`<div class="paired-device"><div>${icon('phone')}<span><strong>${esc(bt.device)}</strong><small>Áudio do celular disponível</small></span></div><button class="button bt-disconnect" data-action="bluetooth-disconnect" data-room="${r.id}">Desconectar</button></div>`:bt.pendingDevice?`<button class="button bt-search pending" data-action="show-pairing" data-room="${r.id}">${icon('alert')} Ver pedido de pareamento</button>`:`<button class="button bt-search" data-action="bluetooth-search" data-room="${r.id}">${icon('bluetooth')} Simular pedido do celular</button>`}<p>O celular só será conectado depois que você aceitar a notificação nesta tela.</p></section>`;
  }
  function pairingNotification(id) {
    const room = data.rooms.find(r=>r.id===id), bt = room.sound.bluetooth;
    if (!bt.pendingDevice) { toast('Nenhum pedido de pareamento aguardando.'); return; }
    showDialog(`<div class="pairing-notification"><span class="pairing-icon">${icon('bluetooth')}</span><span class="eyebrow">SOLICITAÇÃO DE BLUETOOTH</span><h2 id="modal-title">Aceitar pareamento?</h2><p class="pairing-device">${icon('phone')} <strong>${esc(bt.pendingDevice)}</strong> quer reproduzir áudio em ${esc(roomLabel(room))}.</p><div class="pairing-code"><span>CONFIRA O CÓDIGO NO CELULAR</span><strong>${esc(bt.code.slice(0,3))} ${esc(bt.code.slice(3))}</strong></div><p class="small-note">Aceite somente se o mesmo código estiver aparecendo no seu celular.</p><div class="pairing-actions"><button class="button reject-pairing" data-action="bluetooth-reject" data-room="${id}">${icon('close')} Recusar</button><button class="button primary accept-pairing" data-action="bluetooth-accept" data-room="${id}">${icon('check')} Aceitar pareamento</button></div></div>`);
  }
  function ledControl(r) {
    const d = r.led;
    const colors = [['#ffffff','Branco'],['#ff4d57','Vermelho'],['#ff9f43','Laranja'],['#3ddc84','Verde'],['#35b8ff','Azul claro'],['#3478f6','Azul'],['#9b5cff','Roxo'],['#ff5fb7','Rosa']];
    return `<div class="rgb-control"><div class="rgb-stage"><div class="rgb-glow ${d.on?'on':''}" style="--rgb:${d.color};--intensity:${d.brightness/100}"><span>${icon('palette')}</span></div><div><span class="eyebrow">FITA DE LED RGB</span><h2>Crie a iluminação ideal.</h2><p>Escolha uma cor, o brilho e o efeito para o ambiente.</p></div><button class="power-button ${d.on?'on':''}" data-action="power" data-device="led" data-room="${r.id}" aria-pressed="${d.on}">${icon('power')} ${d.on?'Ligada':'Desligada'}</button></div><div class="rgb-settings"><div class="setting-title"><span>Cor da fita</span><strong style="color:${d.color}">${d.on?'Ativa':'Pronta'}</strong></div><div class="color-palette" role="group" aria-label="Cores da fita LED">${colors.map(([value,label])=>`<button data-action="led-color" data-room="${r.id}" data-color="${value}" class="color-swatch ${d.color===value?'selected':''}" style="--swatch:${value}" aria-label="${label}" aria-pressed="${d.color===value}"><span></span></button>`).join('')}</div><label class="setting-title" for="led-brightness"><span>Brilho</span><strong>${d.brightness}%</strong></label><input type="range" id="led-brightness" min="1" max="100" step="1" value="${d.brightness}" data-room="${r.id}"><label class="effect-select">Efeito <select id="led-effect" data-room="${r.id}">${['Fixa','Suave','Festa','Leitura','Relaxar'].map(v=>`<option ${d.effect===v?'selected':''}>${v}</option>`).join('')}</select></label></div></div>`;
  }
  function menu() {
    const items = data.config.menuItems;
    return `<div class="guest-content-heading"><div><h2>Sabores que acolhem.</h2><p>Uma prévia do cardápio do hotel.</p></div><span class="menu-consult">Apenas consulta</span></div><div class="menu-grid">${items.map(({category,title,description,price,kind})=>`<article class="menu-item"><div class="food-art ${kind}" aria-hidden="true">${icon(kind==='juice'?'plug':'menu')}</div><div><span class="menu-category">${esc(category)}</span><h3>${esc(title)}</h3><p>${esc(description)}</p><strong>R$ ${esc(price)}</strong></div></article>`).join('')}</div>`;
  }
  function historyPage() { return `<section class="page-heading"><div><span class="eyebrow">LINHA DO TEMPO</span><h1>Cada ação, registrada.</h1><p>Acompanhe as alterações feitas nesta demonstração.</p></div><span class="device-label">Últimos ${data.history.length} eventos</span></section><section class="history-panel">${data.history.length?data.history.map(e=>`<article class="event"><span class="event-icon">${icon('clock')}</span><div><strong>Quarto ${esc(e.room)} <span>·</span> ${esc(e.text)}</strong><p>${esc(e.actor)}</p></div><time datetime="${esc(e.at)}">${new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(e.at))}</time></article>`).join(''):`<div class="empty-state">${icon('clock')}<h2>O primeiro passo aparece aqui.</h2><p>Experimente um check-in, uma arrumação ou um comando do quarto.</p><button class="button primary" data-action="home">Explorar quartos</button></div>`}</section>`; }
  function projectPage() { return `<section class="page-heading"><div><span class="eyebrow">DO CONCEITO AO QUARTO</span><h1>Uma central. Toda a estadia.</h1><p>Uma experiência integrada para o hóspede e para a equipe do hotel.</p></div></section><div class="project-hero branded"><img src="${esc(logoSrc())}" alt="Logo do sistema do hotel"><div><h2>${data.config.logoData?'Identidade personalizada':'STAYCONTROL'}</h2><p>${esc(data.config.guestTagline)} A quantidade de quartos, a identidade visual e o cardápio podem ser personalizados para cada hotel.</p></div></div><div class="project-grid">${[['monitor','Para a recepção','Visão de todos os quartos, check-in, checkout e histórico de movimentações.'],['phone','Para a camareira','Arrumação, registro de pendências e vistoria com liberação pelo celular.'],['room','Para o hóspede','Tela touch de 7″ com iluminação, tomadas, TV, climatização, som e cardápio.']].map(([ic,title,desc])=>`<article class="project-card">${icon(ic)}<h2>${title}</h2><p>${desc}</p></article>`).join('')}</div><section class="specification"><h2>Configuração prevista</h2><div class="spec-grid"><div><strong>Raspberry Pi 5</strong><span>Central de controle</span></div><div><strong>8 + 8 relés</strong><span>Principal + expansão opcional</span></div><div><strong>Tela touch de 7″</strong><span>Comandos pelo toque</span></div><div><strong>Infravermelho</strong><span>TV e ar-condicionado compatíveis</span></div><div><strong>Placa de áudio</strong><span>Modelo a definir</span></div><div><strong>Sensor de porta</strong><span>Abertura e fechamento</span></div></div></section><section class="demo-boundary"><h2>O que esta versão demonstra</h2><p>O fluxo dos quartos, as três interfaces, a sinalização e os comandos simulados. Os dados ficam neste navegador; não são compartilhados com outros celulares. As áreas são trocadas livremente para apresentação, sem contas ou permissões de funcionários.</p><p>Para instalar no hotel: servidor compartilhado, acesso individual da equipe, acesso restrito por quarto e integração com os equipamentos. Luzes apagadas representam “livre” nesta demonstração; na instalação, o painel também precisará detectar falhas de energia e comunicação.</p><button class="button secondary danger" data-action="reset">Reiniciar dados da demonstração</button></section>`; }
  function render() {
    document.body.dataset.edition = edition;
    app.innerHTML = edition === 'escolher' ? editionChooser() : edition==='casa-completa' ? houseCompleteShell() : ['casa','quarto'].includes(edition) ? roomOnlyShell() : shell(page==='history'?historyPage():page==='project'?projectPage():role==='housekeeping'?housekeeping():role==='guest'?guest():overview());
  }
  let previousFocus;
  function showDialog(html) { previousFocus = document.activeElement; modal.innerHTML = `<button class="close-modal" data-action="close" aria-label="Fechar">${icon('close')}</button>${html}`; if(!modal.open)modal.showModal(); }
  function closeDialog() { modal.close(); previousFocus?.focus?.(); }
  function detail(id) {
    const r=data.rooms.find(r=>r.id===id);
    showDialog(`<span class="eyebrow">RECEPÇÃO · ${r.type.toUpperCase()}</span><h2 id="modal-title">Quarto ${r.id}</h2><div class="modal-status">${badge(r)}${lamps(r,true)}</div><p class="muted">${H.states[r.status].lamp}.</p>${r.pending?`<div class="pending-note">${icon('alert')}${esc(r.pending)}</div>`:''}<div class="door-sensor"><span>${icon('room')} Porta ${r.door?'aberta':'fechada'}</span><button class="button secondary" data-action="door" data-room="${id}">Simular ${r.door?'fechamento':'abertura'}</button></div><p class="small-note">Abrir a porta não altera a ocupação. O sensor está simulado.</p><div class="modal-actions">${r.status==='free'?`<button class="button primary" data-action="checkin" data-room="${id}">${icon('check')} Registrar check-in</button>`:r.status==='occupied'?`<button class="button primary" data-action="confirm-checkout" data-room="${id}">Registrar checkout ${icon('arrow')}</button>`:`<button class="button primary" data-action="go-housekeeping" data-room="${id}">${icon('broom')} Abrir área da camareira</button>`}<button class="button secondary" data-action="open-guest" data-room="${id}">Experimentar painel do quarto</button></div>`);
  }
  function inspection(id) {
    const r=data.rooms.find(r=>r.id===id);
    showDialog(`<span class="eyebrow">VISTORIA DA CAMAREIRA</span><h2 id="modal-title">Liberar quarto ${id}</h2><p class="muted">Confira os três itens antes de deixar o quarto livre.</p>${r.pending?`<div class="pending-note">${icon('alert')}<span>Resolva primeiro: ${esc(r.pending)}</span></div><button class="button secondary" data-action="resolve" data-room="${id}">Marcar pendência como resolvida</button>`:''}<form id="inspection-form" data-room="${id}"><div class="checklist">${['Limpeza e arrumação concluídas','Enxoval e itens do quarto conferidos','Equipamentos verificados e nenhuma pendência'].map((text,i)=>`<label><input type="checkbox" name="check${i}" required ${r.pending?'disabled':''}><span>${text}</span></label>`).join('')}</div><p class="small-note">Ao liberar, as duas luzes apagam e o quarto fica disponível na recepção.</p><button class="button primary full" type="submit" ${r.pending?'disabled':''}>${icon('check')} Confirmar vistoria e liberar</button></form>`);
  }
  function adminLogin() {
    showDialog(`<div class="admin-login"><span class="admin-lock">${icon('shield')}</span><span class="eyebrow">ÁREA RESTRITA</span><h2 id="modal-title">Acesso do administrador</h2><p class="muted">As expansões de relés são configuradas somente pela administração.</p><form id="admin-login-form"><label class="field-label" for="admin-pin">PIN do administrador</label><input id="admin-pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" required placeholder="••••"><p class="admin-error" aria-live="polite"></p><button class="button primary full" type="submit">${icon('shield')} Entrar na configuração</button></form></div>`);
  }
  function adminPanel() {
    const room = data.rooms.find(r=>r.id===adminRoom) || data.rooms[0];
    const tabs = [['buttons','grid','Botões'],...(isHome()?[]:[['menu','menu','Cardápio']]),['text','book','Textos'],['brand','palette','Marca'],['system','info','Sistema'],...(edition==='casa-completa'?[['sensors','shield','Sensores'],['mobile','phone','Celular']]:[])];
    let content = '';
    if(adminTab==='buttons') content = `<section class="admin-section"><div class="admin-section-head"><div><h3>${isHome()?'Botões por ambiente':'Botões do quarto'}</h3><p>Personalize os nomes dos controles mostrados na tela.</p></div><label>${isHome()?'Ambiente':'Quarto'} <select id="admin-room">${data.rooms.map(r=>`<option value="${r.id}" ${r.id===room.id?'selected':''}>${esc(roomLabel(r))}</option>`).join('')}</select></label></div><div class="admin-expansion"><div><strong>Placa auxiliar</strong><small>${room.auxiliary?'8 pontos adicionais disponíveis':'Aparece somente quando for necessária'}</small></div><span class="admin-status ${room.auxiliary?'on':''}">${room.auxiliary?'Ativa':'Desativada'}</span><button class="button ${room.auxiliary?'secondary':'primary'}" data-action="admin-toggle-aux" data-room="${room.id}">${room.auxiliary?'Remover':'Adicionar luz ou tomada'}</button></div><form id="relay-names-form" data-room="${room.id}"><div class="admin-fields">${room.relayNames.slice(0,room.auxiliary?16:8).map((name,index)=>`<label><span>${index<8?'Principal':'Auxiliar'} ${index%8+1}</span><input name="relay-${index}" maxlength="32" required value="${esc(name)}"></label>`).join('')}</div><button class="button primary full" type="submit">${icon('check')} Salvar nomes dos botões</button></form></section>`;
    if(adminTab==='menu') content = `<section class="admin-section"><div class="admin-section-head"><div><h3>Cardápio do hotel</h3><p>Edite nomes, descrições e preços mostrados ao hóspede.</p></div></div><form id="menu-config-form"><div class="admin-menu-editor">${data.config.menuItems.map((item,index)=>`<fieldset><legend>Item ${index+1}</legend><button type="button" class="text-button" data-action="menu-remove" data-index="${index}">Remover item</button><label><span>Categoria</span><input name="category-${index}" maxlength="30" required value="${esc(item.category)}"></label><label><span>Nome do produto</span><input name="title-${index}" maxlength="50" required value="${esc(item.title)}"></label><label class="wide"><span>Descrição</span><input name="description-${index}" maxlength="120" required value="${esc(item.description)}"></label><label><span>Preço</span><input name="price-${index}" maxlength="12" inputmode="decimal" required value="${esc(item.price)}"></label></fieldset>`).join('')}</div><button class="button primary full" type="submit">${icon('check')} Salvar cardápio</button><button type="button" class="button secondary full" data-action="menu-add">Adicionar item ao cardápio</button></form></section>`;
    if(adminTab==='text') content = `<section class="admin-section"><div class="admin-section-head"><div><h3>Textos do aplicativo</h3><p>Personalize a mensagem exibida no painel do quarto.</p></div></div><form id="guest-text-form"><label class="admin-wide-field"><span>Mensagem abaixo da marca STAYCONTROL</span><input name="guestTagline" maxlength="60" required value="${esc(data.config.guestTagline)}"></label><div class="admin-preview"><span class="guest-brand"><b>STAY</b><em>CONTROL</em></span><p>${esc(data.config.guestTagline)}</p></div><button class="button primary full" type="submit">${icon('check')} Salvar texto</button></form></section>`;
    if(adminTab==='brand') content = `<section class="admin-section"><div class="admin-section-head"><div><h3>Logo do cliente</h3><p>Personalize o sistema com a identidade visual do hotel.</p></div></div><div class="brand-editor"><div class="brand-upload-preview"><img src="${esc(logoSrc())}" alt="Prévia da logo atual"><span>${data.config.logoData?'Logo personalizada ativa':'Logo STAYCONTROL original'}</span></div><div class="brand-upload-actions"><label class="button primary upload-button">${icon('palette')} Escolher nova logo<input id="brand-logo-input" type="file" accept="image/png,image/jpeg,image/webp"></label><p>Use PNG, JPG ou WebP. A imagem será reduzida automaticamente para caber no equipamento.</p>${data.config.logoData?`<button class="button secondary" data-action="reset-logo">Restaurar logo STAYCONTROL</button>`:''}</div></div><div class="brand-usage"><strong>A nova logo será aplicada em:</strong><span>Tela inicial</span><span>Painel do quarto</span><span>Central do hotel</span><span>Apresentação do projeto</span></div></section>`;
    if(adminTab==='system') content = `<section class="admin-section"><h3>Diagnóstico e cópia de segurança</h3><p>Controlador USB: <strong>${hardwareOnline?'Conectado · quarto 101':'Desconectado · demonstração'}</strong></p><p>Armazenamento: ${storageOK?'Disponível':'Indisponível · dados temporários'}</p><p>${esc(hardwareInfo.error || 'Sem erro de comunicação informado.')}</p><p>Relés, RGB fixo, sensor de porta e sinalização usam o firmware USB. TV, ar-condicionado, áudio, Bluetooth e efeitos RGB ainda são demonstrativos.</p><button class="button primary full" data-action="backup-export">Baixar cópia das configurações</button><label class="button secondary full upload-button">Restaurar cópia<input id="backup-input" type="file" accept="application/json,.json"></label><p>O arquivo inclui os quartos e o histórico deste navegador. O PIN 1215 protege apenas a demonstração; uso no hotel exige autenticação no servidor.</p></section>`;
    if(adminTab==='sensors' && edition==='casa-completa') content = sensorAdmin();
    if(adminTab==='mobile' && edition==='casa-completa') content = mobileAdminPanel();
    showDialog(`<div class="admin-panel"><span class="eyebrow">CONFIGURAÇÃO PROTEGIDA</span><h2 id="modal-title">Personalizar aplicativo</h2><p class="muted">Somente o administrador pode alterar equipamentos, cardápio, textos e marca.</p><nav class="admin-tabs" aria-label="Configurações">${tabs.map(([id,ic,label])=>`<button data-action="admin-tab" data-tab="${id}" class="${adminTab===id?'active':''}">${icon(ic)} ${label}</button>`).join('')}</nav>${content}<button class="button secondary full admin-exit" data-action="admin-logout">${icon('close')} Sair do administrador</button></div>`);
  }
  function applyBrandFile(file) {
    if(!adminUnlocked)return;
    if(!file || !/^image\/(png|jpeg|webp)$/i.test(file.type)){toast('Escolha uma imagem PNG, JPG ou WebP.');return;}
    if(file.size>8000000){toast('A imagem original deve ter no máximo 8 MB.');return;}
    const image=new Image(),url=URL.createObjectURL(file);
    image.onload=()=>{
      const maxWidth=1000,maxHeight=700,scale=Math.min(1,maxWidth/image.width,maxHeight/image.height),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
      canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);
      const logoData=canvas.toDataURL('image/webp',.84);
      if(saveConfig('branding',{logoData},'Logo do cliente aplicada ao sistema.'))adminPanel();
    };
    image.onerror=()=>{URL.revokeObjectURL(url);toast('Não foi possível abrir essa imagem.');};image.src=url;
  }
  function guide() { showDialog(`<span class="eyebrow">APRESENTAÇÃO DO PROJETO</span><h2 id="modal-title">Um ciclo completo em poucos toques.</h2><ol class="guide-steps"><li><strong>Receba o hóspede</strong><p>Na recepção, abra um quarto livre e registre o check-in. A luz vermelha acende.</p></li><li><strong>Experimente o quarto</strong><p>Abra o painel do quarto e teste luzes, climatização, TV, som e cardápio.</p></li><li><strong>Registre a saída</strong><p>Faça o checkout na recepção. A luz verde passa a piscar.</p></li><li><strong>Prepare e libere</strong><p>Na área da camareira, inicie a arrumação: verde acesa. Conclua a vistoria: ambas apagadas e quarto livre.</p></li></ol><p class="small-note">Esta é uma simulação para apresentação. A integração física e o acesso entre dispositivos fazem parte da próxima etapa.</p><button class="button primary full" data-action="close">Começar demonstração ${icon('arrow')}</button>`); }
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-action]'); if(!button || button.disabled)return;
    event.preventDefault(); const a=button.dataset.action, id=button.dataset.room;
    if(adminUnlocked) adminActivity=Date.now();
    if(a==='alloff-confirm') showDialog(`<h2 id="modal-title">Desligar luzes e tomadas?</h2><p>Todos os relés e a fita RGB do quarto ${esc(id)} serão desligados.</p><div class="modal-actions"><button class="button primary" data-action="alloff" data-room="${esc(id)}">Confirmar</button><button class="button secondary" data-action="close">Cancelar</button></div>`);
    if(a==='alloff'){if(commit(id,'alloff',{},'Luzes e tomadas desligadas.'))closeDialog();}
    if(a==='backup-export'&&adminUnlocked){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}), url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='STAYCONTROL-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
    if(['menu-add','menu-remove'].includes(a)&&adminUnlocked){
      const form=document.getElementById('menu-config-form'),values=new FormData(form);
      const items=data.config.menuItems.map((item,index)=>({...item,category:String(values.get('category-'+index)||''),title:String(values.get('title-'+index)||''),description:String(values.get('description-'+index)||''),price:String(values.get('price-'+index)||'')}));
      if(a==='menu-add')items.push({category:'PRATOS',title:'Novo produto',description:'Descrição do produto.',price:'0,00',kind:'plate'});
      else items.splice(Number(button.dataset.index),1);
      if(saveConfig('menu',{items},'Cardápio atualizado.'))adminPanel();
    }
    if(a==='house-page'){housePage=button.dataset.page;render();}
    if(a==='monitor-admin'){adminTab='sensors';adminUnlocked?adminPanel():adminLogin();}
    if(a==='monitor-toggle'&&adminUnlocked){if(await saveSecurity('monitoring',{armed:!data.config.monitoring.armed},'Monitoramento atualizado.'))adminPanel();}
    if(a==='monitor-ack'&&adminUnlocked){if(saveConfig('ackAlerts',{},'Alertas reconhecidos.'))adminPanel();}
    if(a==='sensor-sim'&&edition==='casa-completa'&&!hardwareOnline){const room=data.rooms.find(r=>r.id===id),open=!room.door;if(commit(id,'sensor',{open},'Leitura simulada atualizada.')){try{await mobileApi('sensor',{index:data.rooms.findIndex(r=>r.id===id)+1,open});}catch{toast('Abertura registrada no painel. Entre como administrador para enviar a simulação ao aplicativo do celular.');}}}
    if(a==='mobile-open')location.href='./celular.html';
    if(a==='mobile-pair'&&adminUnlocked){try{const name=document.getElementById('mobile-name').value;const result=await mobileApi('pair',{name});mobilePairCode=result.token;await loadMobileStatus();adminPanel();}catch(error){toast(error.message);}}
    if(a==='mobile-revoke'&&adminUnlocked){try{await mobileApi('revoke',{id:button.dataset.id});await loadMobileStatus();adminPanel();}catch(error){toast(error.message);}}
    if(a==='mobile-test'&&adminUnlocked){try{await mobileApi('test',{});toast('Teste registrado no histórico. Push será enviado se estiver configurado.');}catch(error){toast(error.message);}}
    if(a==='edition'){activateEdition(button.dataset.edition);location.hash=edition;}
    if(a==='choose-edition'){edition='escolher';history.replaceState(null,'',location.pathname+location.search);render();}
    if(a==='home'){page='rooms';role='reception';filter='all';query='';render();}
    if(a==='page'){page=button.dataset.page;render();}
    if(a==='role'){role=button.dataset.role;page='rooms';render();}
    if(a==='filter'){filter=button.dataset.filter;render();}
    if(a==='clear-filter'){filter='all';query='';render();}
    if(a==='detail')detail(id);
    if(a==='close')closeDialog();
    if(a==='admin'){adminUnlocked?adminPanel():adminLogin();}
    if(a==='admin-tab'&&adminUnlocked){adminTab=button.dataset.tab;adminPanel();}
    if(a==='admin-toggle-aux'&&adminUnlocked){if(commit(id,'aux',{},data.rooms.find(r=>r.id===id)?.auxiliary?'Expansão auxiliar removida pelo administrador.':'Expansão auxiliar ativada pelo administrador.')){bank='main';adminPanel();}}
    if(a==='reset-logo'&&adminUnlocked){if(saveConfig('branding',{logoData:''},'Logo STAYCONTROL restaurada.'))adminPanel();}
    if(a==='admin-logout'){adminUnlocked=false;mobilePairCode='';closeDialog();toast('Área do administrador bloqueada.');}
    if(a==='guide')guide();
    if(a==='door'){if(commit(id,'door',{},'Abertura/fechamento simulado. A ocupação foi mantida.'))detail(id);}
    if(a==='checkin'){if(commit(id,'checkin',{},'Check-in registrado. Luz vermelha acesa.'))closeDialog();}
    if(a==='confirm-checkout')showDialog(`<span class="eyebrow">RECEPÇÃO</span><h2 id="modal-title">Checkout do quarto ${id}</h2><p class="muted">O quarto passará para “Aguardando liberação”, com a luz verde piscando.</p><div class="modal-actions"><button class="button primary" data-action="checkout" data-room="${id}">Confirmar checkout</button><button class="button secondary" data-action="close">Cancelar</button></div>`);
    if(a==='checkout'){if(commit(id,'checkout',{},'Checkout registrado. Aguardando liberação.'))closeDialog();}
    if(a==='go-housekeeping'){closeDialog();role='housekeeping';page='rooms';render();}
    if(a==='open-guest'){closeDialog();currentRoom=id;role='guest';page='rooms';guestTab='lights';render();}
    if(a==='clean')commit(id,'clean',{},'Arrumação iniciada. Luz verde acesa.');
    if(a==='inspection')inspection(id);
    if(a==='pending')showDialog(`<span class="eyebrow">CAMAREIRA · QUARTO ${id}</span><h2 id="modal-title">Registrar pendência</h2><form id="pending-form" data-room="${id}"><label class="field-label" for="pending-note">O que precisa de atenção?</label><textarea id="pending-note" name="note" maxlength="300" required placeholder="Ex.: lâmpada do banheiro precisa de troca."></textarea><p class="small-note">O quarto não poderá ser liberado até a pendência ser resolvida.</p><button class="button primary full" type="submit">Salvar pendência</button></form>`);
    if(a==='resolve')showDialog(`<span class="eyebrow">CAMAREIRA · QUARTO ${id}</span><h2 id="modal-title">A pendência foi resolvida?</h2><p class="muted">${esc(data.rooms.find(r=>r.id===id).pending)}</p><div class="modal-actions"><button class="button primary" data-action="confirm-resolve" data-room="${id}">Sim, marcar como resolvida</button><button class="button secondary" data-action="close">Voltar</button></div>`);
    if(a==='confirm-resolve'){if(commit(id,'resolve',{},'Pendência resolvida. Continue a vistoria.'))closeDialog();}
    if(a==='guest-tab'){guestTab=button.dataset.tab;render();}
    if(a==='bank'){const room=data.rooms.find(r=>r.id===currentRoom);bank=button.dataset.bank==='aux'&&room?.auxiliary?'aux':'main';render();}
    if(a==='relay')commit(id,'relay',{index:Number(button.dataset.index)},'Comando simulado.');
    if(a==='track-previous'||a==='track-next')commit(id,'track',{direction:a==='track-next'?'next':'previous'},'Troca de faixa simulada.');
    if(a==='power'){const d=button.dataset.device;commit(id,'device',{device:d,property:'on',value:!data.rooms.find(r=>r.id===id)[d].on},'Comando simulado.');}
    if(a==='adjust')commit(id,'device',{device:button.dataset.device,property:button.dataset.property,value:Number(button.dataset.value)},'Ajuste simulado.');
    if(a==='bluetooth-search'){const code=String(Math.floor(100000+Math.random()*900000));if(commit(id,'bluetooth',{kind:'request',device:isHome()?'Celular do morador':'Celular do hóspede',code},'Pedido recebido. Confirme na tela para parear.'))pairingNotification(id);}
    if(a==='show-pairing')pairingNotification(id);
    
    if(a==='bluetooth-accept'){if(commit(id,'bluetooth',{kind:'accept'},'Pareamento aceito. O som foi ligado.'))closeDialog();}
    if(a==='bluetooth-reject'){if(commit(id,'bluetooth',{kind:'reject'},'Pedido de pareamento recusado.'))closeDialog();}
    if(a==='bluetooth-disconnect')commit(id,'bluetooth',{kind:'disconnect'},'Aparelho Bluetooth desconectado.');
    if(a==='led-color')commit(id,'device',{device:'led',property:'color',value:button.dataset.color},'Cor da fita LED atualizada.');
    if(a==='reset'&&!adminUnlocked){adminLogin();return;}if(a==='reset')showDialog('<span class="eyebrow">DADOS DE EXEMPLO</span><h2 id="modal-title">Recomeçar a demonstração?</h2><p class="muted">Os oito quartos voltarão aos estados iniciais. O histórico e os ajustes desta demonstração serão apagados.</p><div class="modal-actions"><button class="button primary" data-action="confirm-reset">Reiniciar demonstração</button><button class="button secondary" data-action="close">Cancelar</button></div>');
    if(a==='confirm-reset'&&adminUnlocked&&!hardwareOnline){data=seedForEdition(edition);try{localStorage.setItem(KEY,JSON.stringify(data));}catch{storageOK=false;}closeDialog();filter='all';query='';render();toast('Demonstração reiniciada.');}
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='room-search'){const focus=event.target.selectionStart;query=event.target.value;render();const input=document.getElementById('room-search');input.focus();try{input.setSelectionRange(focus,focus);}catch{}}
    if(event.target.id==='device-volume'){event.target.previousElementSibling.querySelector('strong').textContent=event.target.value+'%';}
    if(event.target.id==='led-brightness'){event.target.previousElementSibling.querySelector('strong').textContent=event.target.value+'%';}
  });
  document.addEventListener('change',event=>{
    const el=event.target;
    if(el.id==='backup-input'&&adminUnlocked){
      const file=el.files?.[0];if(!file)return;
      if(file.size>3000000){toast('Arquivo maior que 3 MB.');return;}
      file.text().then(text=>{const next=JSON.parse(text);if(!validData(next))throw Error('Cópia incompatível ou inválida.');
        if(hardwareOnline)throw Error('Desconecte o controlador antes de restaurar os dados.');
        showDialog(`<h2 id="modal-title">Restaurar a cópia?</h2><p>Os dados atuais deste navegador serão substituídos. Baixe uma cópia antes de continuar.</p><button class="button primary" id="restore-backup">Confirmar restauração</button>`);
        document.getElementById('restore-backup').onclick=()=>{if(!adminUnlocked)return;data=next;try{localStorage.setItem(KEY,JSON.stringify(data));}catch{storageOK=false;}render();adminPanel();toast('Cópia restaurada.');};
      }).catch(error=>toast(error.message));return;
    }
    if(el.id==='brand-logo-input'){applyBrandFile(el.files?.[0]);return;}
    if(el.id==='admin-room'&&adminUnlocked){adminRoom=el.value;adminPanel();}
    if(el.id==='guest-room'){currentRoom=el.value;render();}
    if(el.id==='ac-mode')commit(el.dataset.room,'device',{device:'ac',property:'mode',value:el.value},'Modo simulado.');
    if(el.id==='device-volume')commit(el.dataset.room,'device',{device:el.dataset.device,property:'volume',value:Number(el.value)},'Volume simulado.');
    if(el.id==='led-brightness')commit(el.dataset.room,'device',{device:'led',property:'brightness',value:Number(el.value)},'Brilho da fita LED atualizado.');
    if(el.id==='led-effect')commit(el.dataset.room,'device',{device:'led',property:'effect',value:el.value},'Efeito da fita LED atualizado.');
  });
  document.addEventListener('submit',async event=>{
    const form=event.target;event.preventDefault();
    if(form.classList.contains('sensor-config')){
      if(!adminUnlocked)return;const values=new FormData(form);
      if(await saveSecurity('sensorConfig',{room:form.dataset.room,label:String(values.get('label')||''),environment:String(values.get('environment')||''),enabled:values.get('enabled')==='on'},'Sensor configurado.'))adminPanel();return;
    }
    if(form.id==='mobile-contacts-form'){
      if(!adminUnlocked)return;const values=new FormData(form);
      try{await mobileApi('contacts',{phone:String(values.get('phone')||''),email:String(values.get('email')||'')});await loadMobileStatus();adminPanel();toast('Contatos de alerta salvos.');}catch(error){toast(error.message);}return;
    }
    if(form.id==='admin-login-form'){const pin=String(new FormData(form).get('pin')||'');if(edition==='casa-completa'){try{const result=await mobileApi('login',{pin});mobileAdminToken=result.token;await loadMobileStatus();adminUnlocked=true;adminActivity=Date.now();adminPanel();}catch(error){form.querySelector('.admin-error').textContent=error.message;}return;}if(pin==='1215'){adminUnlocked=true;adminActivity=Date.now();adminPanel();}else{const error=form.querySelector('.admin-error');error.textContent='PIN incorreto. Tente novamente.';form.querySelector('input').select();}return;}
    if(!adminUnlocked&&['relay-names-form','menu-config-form','guest-text-form'].includes(form.id)){closeDialog();toast('Entre como administrador para modificar o aplicativo.');return;}
    if(form.id==='relay-names-form'){
      const room=data.rooms.find(r=>r.id===form.dataset.room), values=new FormData(form), names=[...room.relayNames];
      for(let index=0;index<(room.auxiliary?16:8);index++)names[index]=String(values.get('relay-'+index)||'');
      if(saveConfig('relayNames',{room:room.id,names},'Nomes dos botões atualizados.'))adminPanel();return;
    }
    if(form.id==='menu-config-form'){
      const values=new FormData(form),items=data.config.menuItems.map((item,index)=>({category:String(values.get('category-'+index)||''),title:String(values.get('title-'+index)||''),description:String(values.get('description-'+index)||''),price:String(values.get('price-'+index)||''),kind:item.kind}));
      if(saveConfig('menu',{items},'Cardápio atualizado para os hóspedes.'))adminPanel();return;
    }
    if(form.id==='guest-text-form'){const guestTagline=String(new FormData(form).get('guestTagline')||'');if(saveConfig('guestText',{guestTagline},'Texto do painel atualizado.'))adminPanel();return;}
    if(form.id==='inspection-form'){const checks=Array.from(form.querySelectorAll('input[type=checkbox]')).map(e=>e.checked);if(commit(form.dataset.room,'release',{checks},'Quarto livre. As duas luzes estão apagadas.'))closeDialog();}
    if(form.id==='pending-form'){const note=new FormData(form).get('note');if(commit(form.dataset.room,'pending',{note},'Pendência registrada.'))closeDialog();}
  });
  window.addEventListener('storage',event=>{if(event.key===KEY){try{const next=JSON.parse(event.newValue);if(validData(next)){data=next;render();if(modal.open)closeDialog();toast('Atualizado por outra aba da demonstração.');}}catch{}}});
  if('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
  window.addEventListener('hashchange',()=>activateEdition(location.hash.slice(1)));
  document.addEventListener('pointerdown',()=>{if(adminUnlocked)adminActivity=Date.now();});
  document.addEventListener('keydown',()=>{if(adminUnlocked)adminActivity=Date.now();});
  setInterval(()=>{if(adminUnlocked&&Date.now()-adminActivity>300000){adminUnlocked=false;closeDialog();toast('Administrador bloqueado por inatividade.');}},10000);
  pollHardware();
  setInterval(pollHardware, 4000);
  render();
})();





