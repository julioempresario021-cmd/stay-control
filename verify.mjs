import test from 'node:test';
import assert from 'node:assert/strict';
import './dist/model.js';
const H = globalThis.Hotel;
test('Casa Completa possui oito sensores e dados válidos',()=>{
  const s=H.homeCompleteSeed();assert.ok(H.valid(s));assert.equal(s.config.monitoring.armed,false);
  assert.equal(s.rooms.filter(r=>r.security.enabled).length,8);assert.equal(s.rooms[0].security.label,'Porta de entrada');
});
test('monitoramento recusa ativação com abertura e mantém alerta até reconhecimento',()=>{
  let s=H.homeCompleteSeed();s=H.change(s,'101','sensor',{open:true});
  assert.throws(()=>H.configure(s,'monitoring',{armed:true}),/Feche/);
  s=H.change(s,'101','sensor',{open:false});s=H.configure(s,'monitoring',{armed:true});
  s=H.change(s,'101','sensor',{open:true});assert.equal(s.rooms[0].security.alarm,true);
  assert.throws(()=>H.configure(s,'ackAlerts'),/Feche/);
  s=H.change(s,'101','sensor',{open:false});assert.equal(s.rooms[0].security.alarm,true);
  s=H.configure(s,'ackAlerts');assert.equal(s.rooms[0].security.alarm,false);assert.ok(H.valid(s));
});
test('sensor desabilitado não gera alerta e configuração exige desativação',()=>{
  let s=H.configure(H.homeCompleteSeed(),'sensorConfig',{room:'101',label:'Porta principal',environment:'Entrada',enabled:false});
  s=H.configure(s,'monitoring',{armed:true});s=H.change(s,'101','sensor',{open:true});assert.equal(s.rooms[0].security.alarm,false);
  assert.throws(()=>H.configure(s,'sensorConfig',{room:'102',label:'Teste',environment:'Sala',enabled:true}),/Desative/);
  assert.throws(()=>H.change(s,'102','sensor',{open:'yes'}));
  assert.equal(s.rooms[0].type,'Entrada');assert.ok(s.history.length>0);
});
test('leitura USB registra sensor e rejeita cópia com configuração inválida',()=>{
  let s=H.change(H.homeCompleteSeed(),'108','sensor',{open:true,source:'hardware'});assert.match(s.history[0].text,/USB/);
  s.rooms[0].security.enabled='sim';assert.equal(H.valid(s),false);
});
test('troca de faixa exige aceite e suporta próxima/anterior',()=>{
  let s=H.homeSeed();assert.throws(()=>H.change(s,'101','track',{direction:'next'}),/pareamento/);
  s=H.change(s,'101','bluetooth',{kind:'request',device:'Celular',code:'123456'});
  s=H.change(s,'101','bluetooth',{kind:'accept'});
  s=H.change(s,'101','track',{direction:'next'});assert.equal(s.rooms[0].sound.trackNumber,2);
  s=H.change(s,'101','track',{direction:'previous'});assert.equal(s.rooms[0].sound.trackNumber,1);
  assert.throws(()=>H.change(s,'101','track',{direction:'invalid'}));assert.ok(H.valid(s));
});
test('versão Casa inicia com ambientes e controles independentes do hotel',()=>{
  const casa=H.homeSeed(),hotel=H.seed();assert.ok(H.valid(casa));
  assert.equal(casa.rooms[0].type,'Sala');assert.equal(casa.rooms[3].type,'Cozinha');
  const alterada=H.change(casa,'101','relay',{index:0});assert.equal(alterada.rooms[0].relays[0],true);
  assert.equal(hotel.rooms[0].relays[0],false);assert.equal(hotel.rooms[0].status,'occupied');
  assert.equal(casa.config.guestTagline,'Sua casa, no seu toque.');
});
test('Bluetooth não permite conexão direta nem troca do pedido sem decisão',()=>{
  assert.throws(()=>H.change(H.seed(),'101','bluetooth',{kind:'connect',device:'Celular'}),/aceite/);
  const s=H.change(H.seed(),'101','bluetooth',{kind:'request',device:'Celular A',code:'123456'});
  assert.throws(()=>H.change(s,'101','bluetooth',{kind:'request',device:'Celular B',code:'654321'}),/pedido atual/);
  assert.equal(s.rooms[0].sound.bluetooth.pendingDevice,'Celular A');
});
test('cardápio cresce e valida preços sem aceitar valores inválidos',()=>{
  const seed=H.seed(), item={...seed.config.menuItems[0],title:'Sobremesa',price:'19.9'};
  const state=H.configure(seed,'menu',{items:[...seed.config.menuItems,item]});
  assert.equal(state.config.menuItems.length,5);assert.equal(state.config.menuItems[4].price,'19,90');assert.ok(H.valid(state));
  assert.throws(()=>H.configure(seed,'menu',{items:[{...item,price:'-10'}]}));
  assert.throws(()=>H.configure(seed,'menu',{items:[]}));
});
test('cópias inválidas são recusadas antes da restauração',()=>{
  for(const mutate of [s=>s.rooms[0].ac.temperature=100,s=>s.rooms[0].tv.volume=-1,s=>s.history.push({at:'inválido'}),s=>s.config.menuItems[0].price='texto']){
    const s=H.seed();mutate(s);assert.equal(H.valid(s),false);
  }
});
test('desligamento geral mantém a ocupação e as preferências',()=>{
  let s=H.change(H.seed(),'101','relay',{index:0});
  s=H.change(s,'101','device',{device:'led',property:'on',value:true});
  s=H.change(s,'101','alloff');assert.ok(s.rooms[0].relays.every(v=>!v));assert.equal(s.rooms[0].led.on,false);assert.equal(s.rooms[0].status,'occupied');assert.equal(s.rooms[0].ac.temperature,23);
});
test('sinalização corresponde exatamente aos quatro estados acordados', () => {
  assert.deepEqual(H.lamps('free'), {green:false,red:false,blinking:false});
  assert.deepEqual(H.lamps('occupied'), {green:false,red:true,blinking:false});
  assert.deepEqual(H.lamps('cleaning'), {green:true,red:false,blinking:false});
  assert.deepEqual(H.lamps('waiting'), {green:true,red:false,blinking:true});
});
test('ciclo completo, vistoria obrigatória e histórico preservado', () => {
  let state = H.seed();
  const original = JSON.stringify(state);
  state = H.change(state, '104', 'checkin');
  assert.equal(state.rooms[3].status, 'occupied');
  state = H.change(state, '104', 'checkout');
  assert.equal(state.rooms[3].status, 'waiting');
  state = H.change(state, '104', 'clean');
  assert.throws(() => H.change(state, '104', 'release', { checks: [true,false,true] }));
  state = H.change(state, '104', 'release', { checks: [true,true,true] });
  assert.equal(state.rooms[3].status, 'free');
  assert.equal(state.history.length, 4);
  assert.equal(JSON.stringify(H.seed()), original);
});
test('pendência bloqueia liberação até resolução explícita', () => {
  let state = H.change(H.seed(), '102', 'pending', {note:'Lâmpada queimada'});
  assert.throws(()=>H.change(state,'102','release',{checks:[true,true,true]}),/pendência/);
  state=H.change(state,'102','resolve');
  state=H.change(state,'102','release',{checks:[true,true,true]});
  assert.equal(state.rooms[1].status,'free');
});
test('porta não altera ocupação em nenhum estado', () => {
  for(const room of H.seed().rooms) {
    const state=H.change(H.seed(),room.id,'door');
    assert.equal(state.rooms.find(r=>r.id===room.id).status,room.status);
    assert.equal(state.rooms.find(r=>r.id===room.id).door,true);
  }
});
test('recusa transições incorretas e quarto inexistente', () => {
  assert.throws(()=>H.change(H.seed(),'101','release',{checks:[true,true,true]}));
  assert.throws(()=>H.change(H.seed(),'104','checkout'));
  assert.throws(()=>H.change(H.seed(),'103','checkin'));
  assert.throws(()=>H.change(H.seed(),'999','door'));
});
test('oito saídas principais e oito auxiliares opcionais', () => {
  let state=H.seed();
  for(let index=0;index<8;index++)state=H.change(state,'101','relay',{index});
  assert.throws(()=>H.change(state,'101','relay',{index:8}));
  state=H.change(state,'101','aux');
  for(let index=8;index<16;index++)state=H.change(state,'101','relay',{index});
  assert.equal(state.rooms[0].relays.filter(Boolean).length,16);
  assert.throws(()=>H.change(state,'101','relay',{index:16}));
  state=H.change(state,'101','aux');
  assert.equal(state.rooms[0].relays.filter(Boolean).length,8);
});
test('validação de comandos e limites', () => {
  assert.throws(()=>H.change(H.seed(),'101','device',{device:'ac',property:'temperature',value:31}));
  assert.throws(()=>H.change(H.seed(),'101','device',{device:'tv',property:'volume',value:-1}));
  assert.throws(()=>H.change(H.seed(),'101','device',{device:'sound',property:'on',value:'yes'}));
  const s=H.change(H.seed(),'101','device',{device:'ac',property:'temperature',value:24});
  assert.equal(s.rooms[0].ac.temperature,24);
  assert.equal(s.rooms[0].status,'occupied');
});
test('estado recarregável e histórico limitado',()=>{
  let s=H.seed();for(let i=0;i<110;i++)s=H.change(s,'101','door');
  assert.equal(s.history.length,100);
  assert.ok(H.valid(JSON.parse(JSON.stringify(s))));
  assert.ok(!H.valid(null));assert.ok(!H.valid({version:1}));
});
test('pareamento Bluetooth simulado liga o som e pode ser encerrado',()=>{
  let state=H.change(H.seed(),'101','bluetooth',{kind:'request',device:'Celular do hóspede',code:'482731'});
  assert.equal(state.rooms[0].sound.bluetooth.paired,false);
  assert.equal(state.rooms[0].sound.bluetooth.pendingDevice,'Celular do hóspede');
  assert.equal(state.rooms[0].sound.on,false);
  state=H.change(state,'101','bluetooth',{kind:'accept'});
  assert.equal(state.rooms[0].sound.on,true);
  assert.deepEqual(state.rooms[0].sound.bluetooth,{paired:true,device:'Celular do hóspede',pendingDevice:'',code:''});
  state=H.change(state,'101','bluetooth',{kind:'disconnect'});
  assert.deepEqual(state.rooms[0].sound.bluetooth,{paired:false,device:'',pendingDevice:'',code:''});
  assert.throws(()=>H.change(state,'101','bluetooth',{kind:'disconnect'}));
  assert.throws(()=>H.change(state,'101','bluetooth',{kind:'accept'}));
  assert.throws(()=>H.change(state,'101','bluetooth',{kind:'request',device:'Celular',code:'123'}));
  state=H.change(state,'101','bluetooth',{kind:'request',device:'Outro celular',code:'123456'});
  state=H.change(state,'101','bluetooth',{kind:'reject'});
  assert.equal(state.rooms[0].sound.bluetooth.pendingDevice,'');
});
test('fita LED RGB aceita energia, cor, brilho e efeito válidos',()=>{
  let state=H.change(H.seed(),'101','device',{device:'led',property:'on',value:true});
  state=H.change(state,'101','device',{device:'led',property:'color',value:'#9b5cff'});
  state=H.change(state,'101','device',{device:'led',property:'brightness',value:42});
  state=H.change(state,'101','device',{device:'led',property:'effect',value:'Relaxar'});
  assert.deepEqual(state.rooms[0].led,{on:true,color:'#9b5cff',brightness:42,effect:'Relaxar'});
  assert.throws(()=>H.change(state,'101','device',{device:'led',property:'color',value:'purple'}));
  assert.throws(()=>H.change(state,'101','device',{device:'led',property:'brightness',value:0}));
  assert.throws(()=>H.change(state,'101','device',{device:'led',property:'effect',value:'Inexistente'}));
});
test('administrador personaliza botões, cardápio e texto do hóspede',()=>{
  let state=H.seed();
  const names=[...state.rooms[0].relayNames];names[0]='Lustre';names[6]='Tomada da mesa';
  state=H.configure(state,'relayNames',{room:'101',names});
  assert.equal(state.rooms[0].relayNames[0],'Lustre');
  assert.equal(state.rooms[0].relayNames[6],'Tomada da mesa');
  const items=state.config.menuItems.map((item,index)=>index===0?{...item,title:'Café executivo',price:'39,90'}:item);
  state=H.configure(state,'menu',{items});
  assert.equal(state.config.menuItems[0].title,'Café executivo');
  assert.equal(state.config.menuItems[0].price,'39,90');
  state=H.configure(state,'guestText',{guestTagline:'Bem-vindo ao seu quarto.'});
  assert.equal(state.config.guestTagline,'Bem-vindo ao seu quarto.');
  state=H.configure(state,'branding',{logoData:'data:image/png;base64,QUJD'});
  assert.equal(state.config.logoData,'data:image/png;base64,QUJD');
  state=H.configure(state,'branding',{logoData:''});
  assert.equal(state.config.logoData,'');
  assert.ok(H.valid(state));
  assert.throws(()=>H.configure(state,'relayNames',{room:'101',names:['Só um']}));
  assert.throws(()=>H.configure(state,'branding',{logoData:'https://exemplo.com/logo.png'}));
});
