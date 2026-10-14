(function (root) {
  'use strict';
  const states = {
    free: { label: 'Livre', lamp: 'As duas luzes apagadas', green: false, red: false },
    occupied: { label: 'Ocupado', lamp: 'Luz vermelha acesa', green: false, red: true },
    cleaning: { label: 'Em arrumação', lamp: 'Luz verde acesa', green: true, red: false },
    waiting: { label: 'Aguardando liberação', lamp: 'Luz verde piscando', green: true, red: false }
  };
  const relayNames = ['Luz principal', 'Cabeceira esquerda', 'Cabeceira direita', 'Luz do banheiro', 'Luz de leitura', 'Luz de entrada', 'Tomada 1', 'Tomada 2'];
  const auxiliaryNames = Array.from({length: 8}, (_, i) => 'Auxiliar ' + (i + 1));
  const defaultMenu = [
    { category: 'CAFÉ DA MANHÃ', title: 'Café da manhã completo', description: 'Pães, frutas, café e suco.', price: '32,00', kind: 'coffee' },
    { category: 'PRATOS', title: 'Prato do dia', description: 'Arroz, legumes e proteína do dia.', price: '45,00', kind: 'plate' },
    { category: 'LANCHES', title: 'Sanduíche da casa', description: 'Pão artesanal, queijo, salada e frango.', price: '28,00', kind: 'sandwich' },
    { category: 'BEBIDAS', title: 'Suco natural', description: 'Consulte os sabores disponíveis.', price: '12,00', kind: 'juice' }
  ];
  function seed() {
    const statuses = ['occupied', 'cleaning', 'waiting', 'free', 'occupied', 'free', 'waiting', 'free'];
    return { version: 3, history: [], config: { guestTagline: 'O controle na sua mão.', logoData: '', menuItems: JSON.parse(JSON.stringify(defaultMenu)) }, rooms: statuses.map((status, i) => ({
      id: String(101 + i), type: i % 3 === 0 ? 'Suíte' : 'Standard', status, door: false,
      updated: null, pending: '', auxiliary: false, relays: Array(16).fill(false), relayNames: [...relayNames, ...auxiliaryNames],
      ac: { on: false, temperature: 23, mode: 'Resfriar' },
      tv: { on: false, volume: 25, channel: 1 }, sound: { on: false, volume: 35, bluetooth: { paired: false, device: '', pendingDevice: '', code: '' } },
      led: { on: false, color: '#35b8ff', brightness: 70, effect: 'Fixa' }
    })) };
  }
  function lamps(status) { if (!states[status]) throw Error('Estado inválido.'); return { green: states[status].green, red: states[status].red, blinking: status === 'waiting' }; }
  function change(state, id, action, payload = {}) {
    const next = JSON.parse(JSON.stringify(state));
    const room = next.rooms.find(r => r.id === id);
    if (!room) throw Error('Quarto não encontrado.');
    let text, actor = 'Recepção · demonstração';
    const expect = value => { if (room.status !== value) throw Error('O estado do quarto mudou. Confira a situação atual.'); };
    switch (action) {
      case 'track': {
        if (!['previous','next'].includes(payload.direction)) throw Error('Comando de música inválido.');
        if (!room.sound.bluetooth.paired) throw Error('Aceite o pareamento do celular antes de trocar a música.');
        room.sound.trackNumber = Math.max(1,Math.min(9999,(room.sound.trackNumber || 1)+(payload.direction==='next'?1:-1)));
        text = 'Música simulada · faixa ' + room.sound.trackNumber; actor = 'Painel de som · demonstração'; break;
      }
      case 'alloff': room.relays.fill(false); room.led.on = false; text = 'Luzes, tomadas e fita RGB desligadas'; actor = 'Painel do quarto · demonstração'; break;
      case 'checkin': expect('free'); if (room.pending) throw Error('Resolva a pendência antes do check-in.'); room.status = 'occupied'; text = 'Check-in registrado'; break;
      case 'checkout': expect('occupied'); room.status = 'waiting'; text = 'Checkout registrado · aguardando liberação'; break;
      case 'clean': expect('waiting'); room.status = 'cleaning'; text = 'Arrumação iniciada'; actor = 'Camareira · demonstração'; break;
      case 'release':
        expect('cleaning');
        if (room.pending) throw Error('Resolva a pendência antes de liberar o quarto.');
        if (!Array.isArray(payload.checks) || payload.checks.length !== 3 || !payload.checks.every(x => x === true)) throw Error('Conclua os três itens da vistoria.');
        room.status = 'free'; text = 'Vistoria concluída · quarto livre'; actor = 'Camareira · demonstração'; break;
      case 'pending':
        if (!['cleaning', 'waiting'].includes(room.status)) throw Error('Registre pendências durante a preparação do quarto.');
        if (typeof payload.note !== 'string' || !payload.note.trim()) throw Error('Descreva a pendência.');
        room.pending = payload.note.trim().slice(0, 300); text = 'Pendência registrada: ' + room.pending; actor = 'Camareira · demonstração'; break;
      case 'resolve': if (!room.pending) throw Error('Não há pendência para resolver.'); room.pending = ''; text = 'Pendência resolvida'; actor = 'Camareira · demonstração'; break;
      case 'sensor':
        if (!next.config.monitoring || typeof payload.open !== 'boolean') throw Error('Leitura de sensor inválida.');
        room.door=payload.open;
        if (room.door && room.security.enabled && next.config.monitoring.armed) room.security.alarm=true;
        text = (payload.source==='hardware'?'Sensor USB':'Sensor simulado') + ' · ' + room.security.label + (room.door?' aberto':' fechado');
        if(room.security.alarm && room.door) text += ' · alerta de abertura';
        actor='Monitoramento residencial'; break;
      case 'door': room.door = !room.door; text = 'Sensor simulado · porta ' + (room.door ? 'aberta' : 'fechada'); break;
      case 'aux': room.auxiliary = !room.auxiliary; if (!room.auxiliary) room.relays.fill(false, 8); text = 'Expansão simulada ' + (room.auxiliary ? 'ativada' : 'desativada'); break;
      case 'relay': {
        const index = payload.index;
        if (!Number.isInteger(index) || index < 0 || index > 15 || (index > 7 && !room.auxiliary)) throw Error('Saída indisponível.');
        room.relays[index] = !room.relays[index];
        text = 'Comando simulado · relé ' + (index + 1) + (room.relays[index] ? ' ligado' : ' desligado'); actor = 'Painel do quarto · demonstração'; break;
      }
      case 'device': {
        const { device, property, value } = payload;
        const properties = { ac: ['on', 'temperature', 'mode'], tv: ['on', 'volume', 'channel'], sound: ['on', 'volume'], led: ['on', 'color', 'brightness', 'effect'] };
        if (!properties[device]?.includes(property)) throw Error('Comando inválido.');
        if (property === 'on' && typeof value !== 'boolean') throw Error('Comando inválido.');
        if (property === 'mode' && !['Resfriar', 'Ventilar', 'Automático'].includes(value)) throw Error('Modo inválido.');
        if (property === 'color' && (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value))) throw Error('Cor inválida.');
        if (property === 'effect' && !['Fixa', 'Suave', 'Festa', 'Leitura', 'Relaxar'].includes(value)) throw Error('Efeito inválido.');
        const ranges = { temperature: [16, 30], volume: [0, 100], channel: [1, 999], brightness: [1, 100] };
        if (ranges[property] && (!Number.isInteger(value) || value < ranges[property][0] || value > ranges[property][1])) throw Error('Valor fora do intervalo.');
        room[device][property] = value; text = 'Comando simulado · ' + ({ ac: 'ar-condicionado', tv: 'TV', sound: 'som', led: 'fita LED RGB' }[device]); actor = 'Painel do quarto · demonstração'; break;
      }
      case 'bluetooth': {
        if (!room.sound.bluetooth || typeof room.sound.bluetooth !== 'object') room.sound.bluetooth = { paired: false, device: '', pendingDevice: '', code: '' };
        if (payload.kind === 'request') {
          if (room.sound.bluetooth.paired) throw Error('Desconecte o aparelho atual antes de parear outro.');
          if (room.sound.bluetooth.pendingDevice) throw Error('Aceite ou recuse o pedido atual antes de receber outro.');
          if (typeof payload.device !== 'string' || !payload.device.trim()) throw Error('Aparelho Bluetooth inválido.');
          if (typeof payload.code !== 'string' || !/^\d{6}$/.test(payload.code)) throw Error('Código de pareamento inválido.');
          room.sound.bluetooth.pendingDevice = payload.device.trim().slice(0, 80);
          room.sound.bluetooth.code = payload.code;
          text = 'Bluetooth simulado · pedido de pareamento recebido';
        } else if (payload.kind === 'accept') {
          if (!room.sound.bluetooth.pendingDevice) throw Error('Não há pedido de pareamento para aceitar.');
          room.sound.bluetooth = { paired: true, device: room.sound.bluetooth.pendingDevice, pendingDevice: '', code: '' };
          room.sound.on = true;
          text = 'Bluetooth simulado · pareamento aceito para ' + room.sound.bluetooth.device;
        } else if (payload.kind === 'reject') {
          if (!room.sound.bluetooth.pendingDevice) throw Error('Não há pedido de pareamento para recusar.');
          text = 'Bluetooth simulado · pedido de pareamento recusado';
          room.sound.bluetooth.pendingDevice = '';
          room.sound.bluetooth.code = '';
        } else if (payload.kind === 'connect') {
          throw Error('O pareamento exige um pedido e o aceite do hóspede na tela.');
        } else if (payload.kind === 'disconnect') {
          if (!room.sound.bluetooth.paired) throw Error('Nenhum aparelho Bluetooth conectado.');
          text = 'Bluetooth simulado · ' + room.sound.bluetooth.device + ' desconectado';
          room.sound.bluetooth = { paired: false, device: '', pendingDevice: '', code: '' };
        } else throw Error('Ação Bluetooth inválida.');
        actor = 'Painel do quarto · demonstração'; break;
      }
      default: throw Error('Ação desconhecida.');
    }
    room.updated = new Date().toISOString();
    next.history.unshift({ id: (root.crypto?.randomUUID?.() || Date.now() + '-' + Math.random()), room: id, text, actor, at: room.updated });
    next.history = next.history.slice(0, 100);
    return next;
  }
  function configure(state, action, payload = {}) {
    const next = JSON.parse(JSON.stringify(state));
    const clean = (value, max, label) => {
      if (typeof value !== 'string' || !value.trim()) throw Error(label + ' não pode ficar vazio.');
      return value.trim().slice(0, max);
    };
    if (action === 'monitoring') {
      if (!next.config.monitoring || typeof payload.armed !== 'boolean') throw Error('Configuração de monitoramento inválida.');
      if (payload.armed && !next.rooms.some(r=>r.security.enabled)) throw Error('Habilite pelo menos um sensor.');
      if (payload.armed && next.rooms.some(r=>r.security.enabled && r.door)) throw Error('Feche as portas e janelas habilitadas antes de ativar.');
      next.config.monitoring.armed=payload.armed;
    } else if(action === 'sensorConfig') {
      if (!next.config.monitoring) throw Error('Sensores indisponíveis nesta versão.');
      if (next.config.monitoring.armed) throw Error('Desative o monitoramento antes de alterar os sensores.');
      const room=next.rooms.find(r=>r.id===payload.room);
      if(!room || typeof payload.enabled !== 'boolean') throw Error('Sensor inválido.');
      room.security.label=clean(payload.label,50,'Nome do sensor');
      room.security.enabled=payload.enabled;
      room.type=clean(payload.environment,32,'Ambiente');
    } else if(action === 'ackAlerts') {
      if (!next.config.monitoring) throw Error('Monitoramento indisponível.');
      if(next.config.monitoring.armed && next.rooms.some(r=>r.security.enabled && r.door)) throw Error('Feche os sensores em alerta ou desative o monitoramento.');
      next.rooms.forEach(r=>{r.security.alarm=false;});
    } else if (action === 'relayNames') {
      const room = next.rooms.find(r => r.id === payload.room);
      if (!room) throw Error('Quarto não encontrado.');
      if (!Array.isArray(payload.names) || payload.names.length !== 16) throw Error('Informe os nomes dos 16 pontos.');
      room.relayNames = payload.names.map((name, index) => clean(name, 32, 'Nome do ponto ' + (index + 1)));
    } else if (action === 'menu') {
      if (!Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > 40) throw Error('O cardápio deve ter de 1 a 40 itens.');
      next.config.menuItems = payload.items.map((item, index) => ({
        category: clean(item.category, 30, 'Categoria do item ' + (index + 1)).toUpperCase(),
        title: clean(item.title, 50, 'Nome do item ' + (index + 1)),
        description: clean(item.description, 120, 'Descrição do item ' + (index + 1)),
        price: normalizePrice(item.price),
        kind: ['coffee','plate','sandwich','juice'].includes(item.kind) ? item.kind : 'plate'
      }));
    } else if (action === 'guestText') {
      next.config.guestTagline = clean(payload.guestTagline, 60, 'Texto de boas-vindas');
    } else if (action === 'branding') {
      if (typeof payload.logoData !== 'string') throw Error('Logo inválida.');
      if (payload.logoData && !/^data:image\/(png|jpeg|webp);base64,/i.test(payload.logoData)) throw Error('Use uma imagem PNG, JPG ou WebP.');
      if (payload.logoData.length > 1800000) throw Error('A imagem ficou grande demais. Escolha um arquivo menor.');
      next.config.logoData = payload.logoData;
    } else throw Error('Configuração desconhecida.');
    if(['monitoring','sensorConfig','ackAlerts'].includes(action)) {
      next.history.unshift({id:root.crypto?.randomUUID?.() || Date.now()+'-'+Math.random(),room:payload.room || 'Casa',text:action==='monitoring'?(payload.armed?'Monitoramento ativado':'Monitoramento desativado'):action==='ackAlerts'?'Alertas reconhecidos pelo administrador':'Configuração do sensor atualizada',actor:'Administrador residencial',at:new Date().toISOString()});
      next.history=next.history.slice(0,100);
    }
    return next;
  }
  function normalizePrice(value) {
    if (typeof value !== 'string') throw Error('Preço inválido.');
    const text = value.trim().replace(/^R\$\s*/i, '');
    if (!/^\d{1,5}([,.]\d{1,2})?$/.test(text)) throw Error('Informe um preço válido, como 32,90.');
    return Number(text.replace(',', '.')).toFixed(2).replace('.', ',');
  }
  function valid(state) {
    if (!state || !Array.isArray(state.rooms) || !state.config || !Array.isArray(state.config.menuItems)) return false;
    if(state.config.monitoring && (typeof state.config.monitoring.armed !== 'boolean' || !state.rooms.every(r=>r.security && typeof r.security.enabled==='boolean' && typeof r.security.alarm==='boolean' && typeof r.security.label==='string' && r.security.label.trim() && typeof r.type==='string' && r.type.trim()))) return false;
    const menuOK = state.config.menuItems.length >= 1 && state.config.menuItems.length <= 40 && state.config.menuItems.every(item => item && ['category','title','description','price'].every(k => typeof item[k] === 'string' && item[k].trim()) && /^\d{1,5}([,.]\d{1,2})?$/.test(item.price) && ['coffee','plate','sandwich','juice'].includes(item.kind));
    const devicesOK = state.rooms.every(r => r && ['ac','tv','sound','led'].every(k => r[k] && typeof r[k].on === 'boolean') && Number.isInteger(r.ac.temperature) && r.ac.temperature >= 16 && r.ac.temperature <= 30 && ['Resfriar','Ventilar','Automático'].includes(r.ac.mode) && ['tv','sound'].every(k => Number.isInteger(r[k].volume) && r[k].volume >= 0 && r[k].volume <= 100) && Number.isInteger(r.tv.channel) && r.tv.channel >= 1 && r.tv.channel <= 999 && r.led.brightness >= 1 && r.led.brightness <= 100 && ['Fixa','Suave','Festa','Leitura','Relaxar'].includes(r.led.effect));
    if (!menuOK || !devicesOK) return false;
    if (!Array.isArray(state.history) || state.history.length > 100 || !state.history.every(e => e && ['id','room','text','actor','at'].every(k => typeof e[k] === 'string') && Number.isFinite(Date.parse(e.at)))) return false;
    return state && state.version === 3 && Array.isArray(state.history) && state.config && typeof state.config.guestTagline === 'string' && typeof state.config.logoData === 'string' && (!state.config.logoData || /^data:image\/(png|jpeg|webp);base64,/i.test(state.config.logoData)) && Array.isArray(state.config.menuItems) && state.config.menuItems.length >= 1 && state.config.menuItems.length <= 40 && Array.isArray(state.rooms) && state.rooms.length === 8 && state.rooms.every((r, i) => r.id === String(101+i) && states[r.status] && typeof r.door === 'boolean' && typeof r.pending === 'string' && typeof r.auxiliary === 'boolean' && Array.isArray(r.relays) && r.relays.length === 16 && r.relays.every(v => typeof v === 'boolean') && Array.isArray(r.relayNames) && r.relayNames.length === 16 && r.relayNames.every(v => typeof v === 'string' && !!v.trim()) && r.ac && r.tv && r.sound && r.sound.bluetooth && typeof r.sound.bluetooth.paired === 'boolean' && typeof r.sound.bluetooth.device === 'string' && typeof r.sound.bluetooth.pendingDevice === 'string' && typeof r.sound.bluetooth.code === 'string' && r.led && typeof r.led.on === 'boolean' && /^#[0-9a-f]{6}$/i.test(r.led.color) && Number.isInteger(r.led.brightness));
  }
  function homeSeed() {
    const state = seed();
    const names = ['Sala','Suíte','Quarto 2','Cozinha','Escritório','Varanda','Garagem','Área externa'];
    state.config.guestTagline = 'Sua casa, no seu toque.';
    state.rooms.forEach((room,index)=>{room.type=names[index];room.status='free';room.relayNames=['Luz principal','Luz de apoio','Luz de leitura','Luz decorativa','Tomada 1','Tomada 2','Reserva 1','Reserva 2',...auxiliaryNames];});
    return state;
  }
  function homeCompleteSeed() {
    const state=homeSeed();
    state.config.monitoring={armed:false};
    const labels=['Porta de entrada','Porta da suíte','Janela do quarto','Porta da cozinha','Janela do escritório','Porta da varanda','Portão da garagem','Portão externo'];
    state.rooms.forEach((room,index)=>{room.security={label:labels[index],enabled:true,alarm:false};});
    return state;
  }
  const api = { states, relayNames, seed, homeSeed, homeCompleteSeed, lamps, change, configure, valid };
  root.Hotel = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

