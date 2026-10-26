const manicureServices = [
  { id:'manicure-completa', category:'Manicure', name:'Manicure completa sin esmalte', duration:45, price:12000, description:'Limpieza rusa, limado, exfoliación e hidratación.' },
  { id:'manicure-express-semi', category:'Manicure', name:'Manicure express semi', duration:30, price:12000, description:'Limado, esmaltado e hidratación.' },
  { id:'manicure-semi', category:'Manicure', name:'Manicure semipermanente', duration:90, price:18000, description:'Preparación completa, esmaltado, exfoliación e hidratación.' },
  { id:'manicure-degrade-francesa', category:'Manicure', name:'Manicure degradé o francesa', duration:90, price:23000, description:'Limpieza rusa, diseño, exfoliación e hidratación.' },
  { id:'softgel', category:'Manicure', name:'Extensión softgel', duration:150, price:32000, description:'Preparación, extensión, exfoliación e hidratación.' },
  { id:'bano-gel-semi', category:'Manicure', name:'Baño de gel con semi', duration:90, price:28000, description:'Refuerzo y esmaltado semipermanente.' },
  { id:'manicure-varon', category:'Manicure', name:'Manicure varón', duration:90, price:20000, description:'Limpieza rusa, limado, brillo, exfoliación e hidratación.' },
  { id:'retiro-extensiones', category:'Manicure', name:'Retiro de extensiones', duration:60, price:10000, description:'Retiro de extensiones realizadas en Fénix.' },
  { id:'retiro-otro-lugar', category:'Manicure', name:'Retiro de otro lugar', duration:60, price:15000, description:'Retiro seguro de extensiones realizadas en otro lugar.' },
  { id:'retiro-limpieza-rusa', category:'Manicure', name:'Retiro con limpieza rusa', duration:60, price:15000, description:'Retiro de extensiones, limpieza y preparación de la uña.' },
];

const pedicureServices = [
  { id:'pedicure-completa', category:'Pedicure y pedispa', name:'Pedicure completa sin esmalte', duration:120, price:20000, description:'Limpieza rusa, limado de uñas y pie completo e hidratación.' },
  { id:'pedicure-semi', category:'Pedicure y pedispa', name:'Pedicure semipermanente', duration:120, price:24000, description:'Limpieza, limado, esmaltado e hidratación.' },
  { id:'pedicure-varon', category:'Pedicure y pedispa', name:'Pedicure varón', duration:150, price:26000, description:'Limpieza rusa, limado e hidratación.' },
  { id:'pedispa-brillo', category:'Pedicure y pedispa', name:'Pedispa brillo', duration:120, price:25000, description:'Remojo, limado, limpieza rusa, exfoliación e hidratación.' },
  { id:'pedispa-semi', category:'Pedicure y pedispa', name:'Pedispa semipermanente', duration:150, price:28000, description:'Pedispa completo con esmaltado semipermanente.' },
  { id:'pedispa-varon', category:'Pedicure y pedispa', name:'Pedispa varón', duration:150, price:28000, description:'Cuidado completo de pies para varón.' },
];

const waxZones = [
  ['medio-brazo','Medio brazo',30,5500,8000],['media-espalda','Media espalda',45,6000,9000],['media-pierna','Media pierna',60,6000,8000],
  ['abdomen','Abdomen',45,5000,9000],['axilas','Axilas',30,5000,6000],['barba','Barba',30,null,7000],['bozo','Bozo',30,5000,4000],
  ['brazos-completos','Brazos completos',60,9000,10000],['cejas','Cejas',30,5000,6000],['cola','Cola',30,4000,6000],['cuello','Cuello',30,5000,6000],
  ['espalda-completa','Espalda completa',60,8000,12000],['frente','Frente',30,5000,6000],['gluteos','Glúteos',45,5000,8000],['hombros','Hombros',30,3000,4500],
  ['manos-dedos','Manos y dedos',30,4000,5000],['menton','Mentón',30,3000,4000],['muslos','Muslos',45,7000,8000],['nariz','Nariz',30,3000,4000],
  ['nuca','Nuca',30,6000,6500],['orejas','Orejas',30,4000,6000],['parche','Parche',30,2000,2500],['patillas','Patillas',30,5000,6000],
  ['pecho-dorso','Pecho o dorso completo',60,null,12000],['pecho-abdomen','Pecho y abdomen',60,12000,null],['pezones','Pezones',30,3000,5000],
  ['piernas-completas','Piernas completas',90,15000,16000],['pomulos','Pómulos',30,4000,6000],['rebaje-completo','Rebaje completo',90,16000,20000],
  ['rebaje-corto','Rebaje corto',45,8000,10000],['rebaje-largo','Rebaje largo',60,12000,14000],['rebaje-brasileno','Rebaje semicompleto brasileño',90,16000,16000],
  ['rodilla','Rodilla',30,4000,5000],['rostro-completo','Rostro completo',60,15000,18000],
];

const waxServices = waxZones.flatMap(([id,name,duration,dama,varon]) => [
  dama == null ? null : { id:`dep-dama-${id}`, category:'Depilación dama', name:`${name} · Dama`, duration, price:dama, description:'Depilación con cera. Duración estimada según la zona.' },
  varon == null ? null : { id:`dep-varon-${id}`, category:'Depilación varón', name:`${name} · Varón`, duration, price:varon, description:'Depilación con cera. Duración estimada según la zona.' },
].filter(Boolean));

const services = [...manicureServices,...pedicureServices,...waxServices].map((service)=>({ ...service, deposit:Math.min(5000,service.price) }));
const categories = [...new Set(services.map((service)=>service.category))];
const timeSlots = Array.from({length:24},(_,index)=>{const total=9*60+index*30;return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;});
const fixedHolidays = new Set(['01-01','05-01','05-21','06-21','06-29','07-16','08-15','09-18','09-19','10-12','10-31','11-01','12-08','12-25']);
const datedHolidays = new Set(['2026-04-03','2026-04-04']);
function isHoliday(iso){return datedHolidays.has(iso)||fixedHolidays.has(iso.slice(5));}
const state = { step:1, category:categories[0], service:null, modality:'En salón', date:null, dateLabel:null, time:null, bookingId:null, holdUntil:null, client:null };
const money = (value) => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(value);
const durationLabel = (minutes) => minutes < 60 ? `${minutes} min` : minutes % 60 ? `${Math.floor(minutes/60)} h ${minutes%60} min` : `${minutes/60} h`;
const $ = (selector,root=document) => root.querySelector(selector);
const $$ = (selector,root=document) => [...root.querySelectorAll(selector)];

function showError(message) {
  let box = $('[data-booking-error]');
  if (!box) { box = document.createElement('p'); box.dataset.bookingError=''; box.className='booking-error'; $('.step-area').prepend(box); }
  box.textContent=message; box.hidden=false; box.scrollIntoView({behavior:'smooth',block:'center'});
}
function clearError(){ const box=$('[data-booking-error]'); if(box) box.hidden=true; }

const categoryContainer=$('[data-categories]');
const serviceContainer=$('[data-services]');
function renderCategories(){
  categoryContainer.innerHTML='';
  categories.forEach((category)=>{const button=document.createElement('button');button.type='button';button.className=`category-tab${state.category===category?' is-active':''}`;button.textContent=category;button.addEventListener('click',()=>{state.category=category;state.service=null;$('[data-step="1"] [data-next]').disabled=true;renderCategories();renderServices();updateSummary();});categoryContainer.append(button);});
}
function renderServices(){
  serviceContainer.innerHTML='';
  services.filter((service)=>service.category===state.category).forEach((service)=>{const label=document.createElement('label');label.className='service-option';label.innerHTML=`<input type="radio" name="service" value="${service.id}"><span><b>${service.name}</b><small>${service.description}<br>${durationLabel(service.duration)}</small><em>${money(service.price)} · Abono ${money(service.deposit)}</em></span>`;label.querySelector('input').addEventListener('change',()=>{state.service=service;state.date=null;state.dateLabel=null;state.time=null;$('[data-step="1"] [data-next]').disabled=false;updateSummary();});serviceContainer.append(label);});
}
renderCategories();renderServices();

function isoDate(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function futureDates(){const dates=[],cursor=new Date();cursor.setHours(12,0,0,0);while(dates.length<18){const iso=isoDate(cursor);if(cursor.getDay()!==0&&!isHoliday(iso))dates.push(new Date(cursor));cursor.setDate(cursor.getDate()+1);}return dates;}
const dateContainer=$('[data-dates]');
futureDates().forEach((date)=>{const iso=isoDate(date);const weekday=new Intl.DateTimeFormat('es-CL',{weekday:'short'}).format(date).replace('.','');const month=new Intl.DateTimeFormat('es-CL',{month:'short'}).format(date).replace('.','');const fullLabel=new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long'}).format(date);const button=document.createElement('button');button.type='button';button.className='date-button';button.dataset.date=iso;button.dataset.label=fullLabel;button.innerHTML=`<span>${weekday}</span><strong>${date.getDate()}</strong><small>${month}</small>`;dateContainer.append(button);});
const customDate=$('[data-custom-date]');
customDate.min=isoDate(new Date());
customDate.addEventListener('change',()=>{if(!customDate.value)return;const chosen=new Date(`${customDate.value}T12:00:00`);if(chosen.getDay()===0||isHoliday(customDate.value)){showError('Fénix no atiende los domingos ni los días festivos. Elige otra fecha.');customDate.value='';return;}clearError();$$('.date-button').forEach((item)=>item.classList.remove('is-selected'));state.date=customDate.value;state.dateLabel=new Intl.DateTimeFormat('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(chosen);state.time=null;void renderTimes();updateSummary();});

function updateSummary(){
  $('[data-summary-service]').textContent=state.service?.name||'Sin seleccionar';
  $('[data-summary-modality]').textContent=state.modality;
  $('[data-summary-date]').textContent=state.dateLabel||'Sin seleccionar';
  $('[data-summary-time]').textContent=state.time||'Sin seleccionar';
  $('[data-summary-price]').textContent=state.service?money(state.service.price+(state.modality==='A domicilio'?4000:0)):'$0';
  $('[data-summary-delivery-row]').hidden=state.modality!=='A domicilio';
  $('[data-summary-deposit]').textContent=state.service?money(state.service.deposit):'$0';
}
function setStep(step){clearError();state.step=step;$$('[data-step]').forEach((panel)=>{const active=Number(panel.dataset.step)===step;panel.hidden=!active;panel.classList.toggle('is-active',active);});$$('[data-progress]').forEach((item)=>{const number=Number(item.dataset.progress);item.classList.toggle('is-active',number===step);item.classList.toggle('is-complete',number<step);});$('.booking-card').scrollIntoView({behavior:'smooth',block:'start'});}

$$('input[name="modality"]').forEach((input)=>input.addEventListener('change',()=>{state.modality=input.value;updateSummary();}));
dateContainer.addEventListener('click',(event)=>{const button=event.target.closest('.date-button');if(!button)return;$$('.date-button').forEach((item)=>item.classList.toggle('is-selected',item===button));customDate.value='';state.date=button.dataset.date;state.dateLabel=button.dataset.label;state.time=null;void renderTimes();updateSummary();});

async function renderTimes(){
  const container=$('[data-times]');container.innerHTML='<p class="empty-hint">Consultando horarios…</p>';let occupied=[];
  try{const query=new URLSearchParams({date:state.date,serviceId:state.service.id});const response=await fetch(`/api/availability?${query}`,{cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error);occupied=data.occupied||[];}catch{container.innerHTML='<p class="empty-hint">No se pudieron consultar los horarios. Intenta nuevamente.</p>';return;}
  container.innerHTML='';
  timeSlots.forEach((time)=>{const button=document.createElement('button');button.type='button';button.className='time-button';button.textContent=time;const slotDate=new Date(`${state.date}T${time}:00`);const unavailable=occupied.includes(time)||slotDate.getTime()<=Date.now();button.disabled=unavailable;button.title=unavailable?'Horario no disponible':`Seleccionar ${time}`;button.addEventListener('click',()=>{$$('.time-button').forEach((item)=>item.classList.toggle('is-selected',item===button));state.time=time;$('[data-step="2"] [data-next]').disabled=false;updateSummary();});container.append(button);});
  if(!container.querySelector('.time-button:not(:disabled)')) container.innerHTML='<p class="empty-hint">No quedan horarios disponibles para este día.</p>';
}

$$('[data-next]').forEach((button)=>button.addEventListener('click',()=>setStep(state.step+1)));
$$('[data-back]').forEach((button)=>button.addEventListener('click',()=>setStep(state.step-1)));

$('[data-client-form]').addEventListener('submit',async(event)=>{event.preventDefault();clearError();if(!state.service||!state.date||!state.time)return;const submit=event.currentTarget.querySelector('[type="submit"]');submit.disabled=true;submit.textContent='Guardando hora…';const form=new FormData(event.currentTarget);state.client={name:String(form.get('name')||'').trim(),phone:String(form.get('phone')||'').trim(),email:String(form.get('email')||'').trim()};try{const response=await fetch('/api/bookings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({serviceId:state.service.id,modality:state.modality,date:state.date,dateLabel:state.dateLabel,time:state.time,...state.client})});const data=await response.json();if(!response.ok)throw new Error(data.error||'No fue posible guardar la reserva.');state.bookingId=data.booking.id;state.holdUntil=data.booking.holdUntil;$('[data-bank-amount]').textContent=money(data.booking.deposit);setStep(4);startCountdown();}catch(error){showError(error instanceof Error?error.message:'No fue posible guardar la reserva.');}finally{submit.disabled=false;submit.innerHTML='Retener esta hora <span>→</span>';}});

let countdownTimer;
function startCountdown(){clearInterval(countdownTimer);const update=()=>{const remaining=Math.max(0,state.holdUntil-Date.now());const minutes=String(Math.floor(remaining/60000)).padStart(2,'0');const seconds=String(Math.floor((remaining%60000)/1000)).padStart(2,'0');$('[data-countdown]').textContent=`${minutes}:${seconds}`;if(!remaining){clearInterval(countdownTimer);$('[data-send-receipt]').disabled=true;$('[data-send-receipt]').textContent='Tiempo finalizado';}};update();countdownTimer=setInterval(update,1000);}

async function notifyAdmin(){const response=await fetch('https://formsubmit.co/ajax/bernardita.leiva.m@gmail.com',{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({_subject:`Nueva reserva ${state.bookingId} con comprobante`,_url:window.location.href,Reserva:state.bookingId,Cliente:state.client?.name||'',Servicio:state.service?.name||'',Modalidad:state.modality,Fecha:`${state.dateLabel} a las ${state.time}`,WhatsApp:state.client?.phone||'',Abono:money(state.service?.deposit||0),'Revisar de forma segura':`${window.location.origin}/admin`,_template:'table',_captcha:'false'})});const data=await response.json().catch(()=>({}));if(!response.ok||!data.success)throw new Error(data.message||'El proveedor de correo no aceptó el aviso.');}

$('[data-send-receipt]').addEventListener('click',async()=>{clearError();const input=$('[data-receipt]');const file=input.files?.[0];if(!file){showError('Selecciona una imagen o PDF del comprobante.');return;}if(file.size>8*1024*1024){showError('El comprobante debe pesar menos de 8 MB.');return;}const button=$('[data-send-receipt]');button.disabled=true;button.textContent='Guardando comprobante…';const form=new FormData();form.append('receipt',file);try{const response=await fetch(`/api/bookings/${encodeURIComponent(state.bookingId)}/receipt`,{method:'PUT',body:form});const data=await response.json();if(!response.ok)throw new Error(data.error||'No fue posible enviar el comprobante.');button.textContent='Enviando aviso por correo…';await notifyAdmin();$('[data-demo-status]').hidden=false;button.textContent='Comprobante y aviso enviados';input.disabled=true;}catch(error){showError(error instanceof Error?error.message:'No fue posible completar el envío.');button.disabled=false;button.innerHTML='Reintentar envío <span>→</span>';}});

updateSummary();
