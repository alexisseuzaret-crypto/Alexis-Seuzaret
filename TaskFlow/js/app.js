let filterCategory='all',filterPriority='all',calOff=0,calView='week',dragId=null,editingId=null;
let activeView='focus',selectedNoteId=null,notesCatFilter='all',notesDraft=null;
let completionChart=null;

const escapeHtml=s=>{const d=document.createElement('div');d.textContent=s;return d.innerHTML};
function daysUntil(dateStr){const[y,m,d]=dateStr.split('-').map(Number);const t=new Date(y,m-1,d);const now=new Date();now.setHours(0,0,0,0);return Math.ceil((t-now)/864e5)}
const PRIORITY_ORDER={critique:0,haute:1,moyenne:2,moderee:3,basse:4};
const PRIORITY_LABELS={critique:'Critique',haute:'Haute',moyenne:'Moyenne',moderee:'Modérée',basse:'Basse'};
const PRIORITY_DOTS={critique:5,haute:4,moyenne:3,moderee:2,basse:1};
const CATEGORY_LABELS={travail:'Travail',personnel:'Personnel',sante:'Santé',urgent:'Urgent',apprentissage:'Apprentissage'};
const NOTE_CATEGORY_LABELS={travail:'Travail',personnel:'Personnel',idees:'Idées',projets:'Projets',autre:'Autre'};
const EISENHOWER_LABELS={do:'Faire maintenant',plan:'Planifier',delegate:'Déléguer',eliminate:'Éliminer'};
const JOURS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const MOIS=['jan.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const JOURS_FULL=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
function dateKey(d){return d.toISOString().slice(0,10)}
function filt(){return tasks.filter(t=>(filterCategory==='all'||t.cat===filterCategory)&&(filterPriority==='all'||t.prio===filterPriority))}

/* ═══ CONFIRM ═══ */
let confirmResolve=null;
function showConfirm(msg){return new Promise(r=>{confirmResolve=r;document.getElementById('confirm-msg').textContent=msg;document.getElementById('confirm-dialog').classList.add('open')})}
function execConfirm(){if(confirmResolve)confirmResolve(true);confirmResolve=null;document.getElementById('confirm-dialog').classList.remove('open')}
function cancelConfirm(){if(confirmResolve)confirmResolve(false);confirmResolve=null;document.getElementById('confirm-dialog').classList.remove('open')}

/* ═══ THEME ═══ */
let theme=localStorage.getItem('tf2-theme')||'dark';
function applyTheme(){document.documentElement.setAttribute('data-theme',theme==='light'?'light':'');document.getElementById('theme-btn').innerHTML=theme==='dark'?'&#9789;':'&#9788;'}
document.getElementById('theme-btn').onclick=()=>{theme=theme==='dark'?'light':'dark';localStorage.setItem('tf2-theme',theme);applyTheme()};
applyTheme();

/* ═══ NAV ═══ */
function switchView(v){
  activeView=v;
  document.querySelectorAll('#vnav button').forEach(x=>x.classList.remove('act'));
  document.querySelectorAll('#bnav .bnav-btn').forEach(x=>x.classList.remove('act'));
  document.querySelectorAll('.vw').forEach(x=>x.classList.remove('act'));
  document.getElementById('v-'+v)?.classList.add('act');
  document.querySelectorAll(`[data-v="${v}"]`).forEach(x=>x.classList.add('act'));
  renderAll();
}
document.getElementById('vnav').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.v)switchView(b.dataset.v)});
document.getElementById('bnav').addEventListener('click',e=>{const b=e.target.closest('.bnav-btn');if(b&&b.dataset.v)switchView(b.dataset.v)});
document.getElementById('sb-cats').addEventListener('click',e=>{const b=e.target.closest('.sb-cat');if(!b)return;filterCategory=b.dataset.c;document.querySelectorAll('.sb-cat').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderAll()});
document.getElementById('sb-prios').addEventListener('click',e=>{const b=e.target.closest('.sb-prio');if(!b)return;filterPriority=b.dataset.p;document.querySelectorAll('.sb-prio').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderAll()});
function toggleMore(e){e.stopPropagation();document.getElementById('more-overlay').classList.toggle('open')}
function closeMore(){document.getElementById('more-overlay').classList.remove('open')}

/* ═══ FAB CONTEXTUEL ═══ */
function fabAction(){
  if(activeView==='habits')openHabitModal();
  else if(activeView==='notes')createNote();
  else if(activeView==='calendar'){openModal();setTimeout(()=>{const dates=calView==='day'?dayDate(calOff):weekDates(calOff);document.getElementById('f-due').value=dateKey(dates[0])},50)}
  else openModal();
}

/* ═══ EISENHOWER SUGGESTION ═══ */
let eiSuggQ=null;
function checkEiSugg(){
  const prio=document.getElementById('f-prio').value;
  const due=document.getElementById('f-due').value;
  const el=document.getElementById('ei-suggest');
  if(!due&&(prio==='moyenne'||prio==='haute')){el.style.display='none';eiSuggQ=null;return}
  const days=due?daysUntil(due):Infinity;
  let suggestion=null;
  if(prio==='critique'&&days<=3)suggestion={q:'do',label:'Faire maintenant \uD83D\uDD34'};
  else if((prio==='haute'||prio==='critique')&&days<=7)suggestion={q:'plan',label:'Planifier \uD83D\uDD35'};
  else if((prio==='basse'||prio==='moderee')&&(days>14||!due))suggestion={q:'eliminate',label:'Éliminer ou Déléguer'};
  if(suggestion&&document.getElementById('f-eq').value!==suggestion.q){
    eiSuggQ=suggestion.q;
    document.getElementById('ei-suggest-text').innerHTML='\uD83D\uDCA1 Suggestion : cette tâche va plutôt dans <strong>'+suggestion.label+'</strong>';
    el.style.display='flex';
  } else {el.style.display='none';eiSuggQ=null}
}
function applyEiSugg(){if(eiSuggQ)document.getElementById('f-eq').value=eiSuggQ;document.getElementById('ei-suggest').style.display='none';eiSuggQ=null}
function dismissEiSugg(){document.getElementById('ei-suggest').style.display='none';eiSuggQ=null}

/* ═══ RECURRENCE ═══ */
function toggleRecurDay(){
  const v=document.getElementById('f-recur').value;
  const fg=document.getElementById('fg-recur-day');
  const sel=document.getElementById('f-recur-day');
  const lbl=document.getElementById('lbl-recur-day');
  if(v==='weekly'){fg.style.display='';lbl.textContent='Jour de la semaine';sel.innerHTML='<option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option><option value="0">Dimanche</option>'}
  else if(v==='monthly'){fg.style.display='';lbl.textContent='Jour du mois';sel.innerHTML=Array.from({length:28},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}
  else{fg.style.display='none'}
}
function calcNextDue(t){
  const now=new Date();
  if(t.recurrence==='daily'){const d=new Date(now);d.setDate(d.getDate()+1);return dateKey(d)}
  if(t.recurrence==='weekly'){const day=t.recurDay||1;let d=new Date(now);d.setDate(d.getDate()+1);while(d.getDay()!==day)d.setDate(d.getDate()+1);return dateKey(d)}
  if(t.recurrence==='monthly'){const day=t.recurDay||1;let d=new Date(now.getFullYear(),now.getMonth(),day);if(d<=now)d.setMonth(d.getMonth()+1);return dateKey(d)}
  return '';
}

/* ═══ MODAL ═══ */
function openModal(taskId){
  editingId=taskId||null;
  document.getElementById('ei-suggest').style.display='none';eiSuggQ=null;
  if(editingId){
    const t=tasks.find(x=>x.id===editingId);if(!t)return;
    document.getElementById('modal-title').textContent='Modifier la tâche';
    document.getElementById('btn-submit').textContent='Enregistrer';
    document.getElementById('f-title').value=t.title;document.getElementById('f-desc').value=t.desc||'';
    document.getElementById('f-cat').value=t.cat;document.getElementById('f-prio').value=t.prio;
    document.getElementById('f-dur').value=t.dur||'';document.getElementById('f-due').value=t.due||'';
    document.getElementById('f-status').value=t.status;document.getElementById('f-eq').value=t.eq;
    document.getElementById('f-recur').value=t.recurrence||'never';toggleRecurDay();
    if(t.recurDay!=null)document.getElementById('f-recur-day').value=t.recurDay;
  } else {
    document.getElementById('modal-title').textContent='Nouvelle tâche';
    document.getElementById('btn-submit').textContent='Créer la tâche';
    ['f-title','f-desc','f-dur'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('f-due').value='';document.getElementById('f-cat').value='travail';
    document.getElementById('f-prio').value='moyenne';document.getElementById('f-status').value='todo';
    document.getElementById('f-eq').value='plan';document.getElementById('f-recur').value='never';toggleRecurDay();
  }
  document.getElementById('modal').classList.add('open');document.getElementById('f-title').focus();
}
function closeModal(){document.getElementById('modal').classList.remove('open');editingId=null}
function openHabitModal(){document.getElementById('habit-modal').classList.add('open');document.getElementById('fh-name').value='';setTimeout(()=>document.getElementById('fh-name').focus(),50)}
function closeHabitModal(){document.getElementById('habit-modal').classList.remove('open')}
async function saveNewHabit(){const name=document.getElementById('fh-name').value.trim();if(!name){toast('Nom requis !');return}const h={id:null,name,checks:{}};const r=await insertHabit(h);if(r){habits.push(r);renderAll();toast('Habitude créée ✓')}closeHabitModal()}

async function saveTask(){
  const title=document.getElementById('f-title').value.trim();if(!title){toast('Titre requis !');return}
  const fields={title,desc:document.getElementById('f-desc').value.trim(),cat:document.getElementById('f-cat').value,prio:document.getElementById('f-prio').value,dur:document.getElementById('f-dur').value.trim(),due:document.getElementById('f-due').value,status:document.getElementById('f-status').value,eq:document.getElementById('f-eq').value,recurrence:document.getElementById('f-recur').value,recurDay:document.getElementById('f-recur').value!=='never'&&document.getElementById('f-recur').value!=='daily'?Number(document.getElementById('f-recur-day').value):null};
  if(editingId){const t=tasks.find(x=>x.id===editingId);if(t){Object.assign(t,fields);renderAll();await updateTaskDB(t);toast('Tâche modifiée ✓')}}
  else{const t={id:null,...fields,calDay:null,calHour:null,completedAt:null};const r=await insertTask(t);if(r){tasks.push(r);renderAll();toast('Tâche créée ✓')}}
  closeModal();
}
async function delTask(id){const ok=await showConfirm('Supprimer cette tâche ?');if(!ok)return;await deleteTaskDB(id);tasks=tasks.filter(t=>t.id!==id);renderAll();toast('Tâche supprimée')}
async function delHabit(id){const ok=await showConfirm('Supprimer cette habitude ?');if(!ok)return;await deleteHabitDB(id);habits=habits.filter(h=>h.id!==id);renderAll();toast('Habitude supprimée')}
async function toggleDone(id){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  if(t.status!=='done'){
    t.status='done';t.completedAt=dateKey(new Date());
    renderAll();await updateTaskDB(t);
    if(t.recurrence&&t.recurrence!=='never'){
      const nt={id:null,title:t.title,desc:t.desc,cat:t.cat,prio:t.prio,dur:t.dur,due:calcNextDue(t),status:'todo',eq:t.eq,calDay:null,calHour:null,completedAt:null,recurrence:t.recurrence,recurDay:t.recurDay};
      const r=await insertTask(nt);if(r){tasks.push(r);renderAll();toast('Prochaine occurrence créée ✓')}
    }
  } else {t.status='todo';t.completedAt=null;renderAll();await updateTaskDB(t)}
}

/* ═══ DRAG ═══ */
function dStart(e){dragId=e.target.closest('[data-id]').dataset.id;e.dataTransfer.effectAllowed='move';e.target.closest('[data-id]').style.opacity='.5'}
function dEnd(e){const el=e.target.closest('[data-id]');if(el)el.style.opacity='1';dragId=null}
function dragOver(e){e.preventDefault();e.currentTarget.classList.add('dragover')}
function dragLeave(e){e.currentTarget.classList.remove('dragover')}

/* ═══ SIDEBAR ═══ */
function renderSidebar(){
  const all=tasks.length,done=tasks.filter(t=>t.status==='done').length,doing=tasks.filter(t=>t.status==='doing').length,todo=tasks.filter(t=>t.status==='todo').length;
  document.getElementById('prog-txt').textContent=done+'/'+all;
  document.getElementById('prog-fill').style.width=all?(done/all*100)+'%':'0%';
  document.getElementById('st-todo').textContent=todo;document.getElementById('st-doing').textContent=doing;document.getElementById('st-done').textContent=done;
  document.getElementById('cc-all').textContent=all;
  ['travail','personnel','sante','urgent','apprentissage'].forEach(c=>{const el=document.getElementById('cc-'+c);if(el)el.textContent=tasks.filter(t=>t.cat===c).length});
  document.getElementById('top-sub').textContent=(todo+doing)+' tâche'+(todo+doing>1?'s':'')+' en attente';
}

/* ═══ KANBAN ═══ */
function cardHTML(t){
  const dots=Array(PRIORITY_DOTS[t.prio]||1).fill('<span></span>').join('');
  const recurIcon=t.recurrence&&t.recurrence!=='never'?'<span class="card-recur">\uD83D\uDD04</span>':'';
  return `<div class="card" draggable="true" data-id="${t.id}" ondragstart="dStart(event)" ondragend="dEnd(event)">
    <div class="card-actions"><button class="card-act-btn" onclick="openModal('${t.id}')">&#9998;</button><button class="card-act-btn del" onclick="delTask('${t.id}')">&#10005;</button></div>
    <div class="card-top"><span class="badge b-${t.cat}">${CATEGORY_LABELS[t.cat]||t.cat}</span><span class="card-dots">${dots}</span>${recurIcon}</div>
    <div class="card-title">${escapeHtml(t.title)}</div>
    ${t.desc?'<div class="card-desc">'+escapeHtml(t.desc)+'</div>':''}
    <div class="card-foot">${t.dur?'<span>&#128339; '+escapeHtml(t.dur)+'</span>':''}${t.due?'<span>&#128197; '+t.due+'</span>':''}</div></div>`}
function renderKanban(){
  const f=filt();['todo','doing','done'].forEach(s=>{
    const items=f.filter(t=>t.status===s).sort((a,b)=>PRIORITY_ORDER[a.prio]-PRIORITY_ORDER[b.prio]);
    document.getElementById('k-'+s).innerHTML=items.map(cardHTML).join('')||'<div style="color:var(--tx3);text-align:center;padding:20px;font-size:.8rem">Glissez des tâches ici</div>';
    document.getElementById('kc-'+s).textContent=items.length})}
/* kOver/kLeave remplaces par dragOver/dragLeave */
async function kDrop(e){e.preventDefault();e.currentTarget.classList.remove('dragover');if(!dragId)return;const t=tasks.find(x=>x.id===dragId);if(t){t.status=e.currentTarget.dataset.st;renderAll();await updateTaskDB(t)}dragId=null}

/* ═══ FOCUS ═══ */
function renderFocus(){
  const now=new Date(),h=now.getHours(),today=dateKey(now);
  const greeting=h<12?'Bonjour \u2600\uFE0F':h<18?'Bon après-midi \uD83C\uDF24\uFE0F':'Bonsoir \uD83C\uDF19';
  const dateStr=JOURS_FULL[now.getDay()]+' '+now.getDate()+' '+MOIS[now.getMonth()]+' '+now.getFullYear();
  const tasksDoneToday=tasks.filter(t=>t.completedAt===today).length;
  const habitsToday=habits.filter(hb=>hb.checks&&hb.checks[today]).length;
  const pending=tasks.filter(t=>t.status!=='done');
  const scored=pending.map(t=>{let s=(5-(PRIORITY_ORDER[t.prio]||2))*10;if(t.due){const d=daysUntil(t.due);if(d<=0)s+=100;else if(d<=1)s+=80;else if(d<=3)s+=50;else if(d<=7)s+=20}if(t.eq==='do')s+=30;return{...t,_s:s}}).sort((a,b)=>b._s-a._s).slice(0,3);
  const top3=scored.map((t,i)=>{const d=t.status==='done';const meta=[];if(t.due){const dd=daysUntil(t.due);meta.push(dd<=0?'<span style="color:var(--red)">En retard</span>':dd<=1?'<span style="color:var(--red)">Demain</span>':'&#128197; '+t.due)}meta.push(PRIORITY_LABELS[t.prio]);
    return `<div class="focus-task${d?' done':''}"><div class="focus-task-rank">${i+1}</div><div class="focus-chk${d?' on':''}" onclick="toggleDone('${t.id}')"></div><div class="focus-task-info"><div class="focus-task-title">${escapeHtml(t.title)}</div><div class="focus-task-meta">${meta.join(' · ')}</div></div></div>`}).join('')||'<div class="focus-empty">Aucune tâche en attente !</div>';
  const habitPct=habits.length?Math.round(habitsToday/habits.length*100):0;
  const habitsHTML=habits.map(hb=>{const checked=hb.checks&&hb.checks[today];const{cur:streak}=calcStreaks(hb);
    return `<div class="focus-habit${checked?' checked':''}" onclick="toggleFocusHabit('${hb.id}')"><div class="focus-chk${checked?' on':''}"></div><span class="focus-habit-name">${escapeHtml(hb.name)}</span>${streak>0?'<span class="focus-habit-streak">&#128293; '+streak+'j</span>':''}</div>`}).join('')||'<div class="focus-empty">Aucune habitude</div>';
  const in3=new Date();in3.setDate(in3.getDate()+3);
  const upcoming=tasks.filter(t=>t.due&&t.status!=='done'&&new Date(t.due)<=in3).sort((a,b)=>a.due.localeCompare(b.due));
  const deadlines=upcoming.map(t=>{const dd=daysUntil(t.due);const u=dd<=1;const w=dd<=2&&!u;const cls=u?'urgent':w?'warning':'';const dc=u?'red':w?'orange':'normal';const dl=dd<0?'En retard':dd===0?"Aujourd'hui":dd===1?'Demain':dd+'j';
    return `<div class="focus-deadline ${cls}"><div class="focus-deadline-info"><div class="focus-deadline-title">${escapeHtml(t.title)}</div><div class="focus-deadline-cat"><span class="badge b-${t.cat}" style="font-size:.58rem">${CATEGORY_LABELS[t.cat]}</span></div></div><span class="focus-deadline-days ${dc}">${dl}</span></div>`}).join('')||'<div class="focus-empty">Aucune échéance dans les 3 prochains jours</div>';
  document.getElementById('focus-content').innerHTML=`<div class="focus-header"><div class="focus-greeting">${greeting}</div><div class="focus-date">${dateStr}</div><div class="focus-scores"><div class="focus-score-item"><div class="focus-score-num">${tasksDoneToday}</div><div class="focus-score-label">Tâches terminées</div></div><div class="focus-score-item"><div class="focus-score-num">${habitsToday}/${habits.length}</div><div class="focus-score-label">Habitudes du jour</div></div><div class="focus-score-item"><div class="focus-score-num">${pending.length}</div><div class="focus-score-label">Restantes</div></div></div></div>
  <div class="focus-section"><div class="focus-section-title"><span>&#127919;</span> Mes 3 priorités du jour</div>${top3}</div>
  <div class="focus-section"><div class="focus-section-title"><span>&#9989;</span> Habitudes du jour</div><div class="focus-habits-count">${habitsToday}/${habits.length} (${habitPct}%)</div><div class="focus-habits-bar"><div class="focus-habits-fill" style="width:${habitPct}%"></div></div>${habitsHTML}</div>
  <div class="focus-section"><div class="focus-section-title"><span>&#9200;</span> Échéances proches</div>${deadlines}</div>`;
}
async function toggleFocusHabit(id){const hb=habits.find(x=>x.id===id);if(!hb)return;const today=dateKey(new Date());if(!hb.checks)hb.checks={};hb.checks[today]=!hb.checks[today];if(!hb.checks[today])delete hb.checks[today];renderAll();await updateHabit(hb)}

/* ═══ CALENDAR ═══ */
function weekDates(off){const n=new Date(),d=n.getDay(),m=new Date(n);m.setDate(n.getDate()-(d===0?6:d-1)+off*7);return Array.from({length:7},(_,i)=>{const x=new Date(m);x.setDate(m.getDate()+i);return x})}
function dayDate(off){const d=new Date();d.setDate(d.getDate()+off);return[d]}
const HOURS=Array.from({length:14},(_,i)=>i+7);
function renderCalendar(){
  const isDay=calView==='day',dates=isDay?dayDate(calOff):weekDates(calOff),today=dateKey(new Date());
  const filtered=filt();
  if(isDay){const d=dates[0];document.getElementById('cal-label').textContent=JOURS_FULL[d.getDay()]+' '+d.getDate()+' '+MOIS[d.getMonth()]+' '+d.getFullYear()}
  else{const d0=dates[0],d6=dates[6];document.getElementById('cal-label').textContent=d0.getDate()+' '+MOIS[d0.getMonth()]+' — '+d6.getDate()+' '+MOIS[d6.getMonth()]+' '+d6.getFullYear()}
  const unpl=filtered.filter(t=>!t.calDay&&t.status!=='done');
  document.getElementById('cal-unpl').innerHTML=unpl.map(t=>`<div class="cal-mini" draggable="true" data-id="${t.id}" ondragstart="dStart(event)" ondragend="dEnd(event)"><div class="cal-mini-t">${escapeHtml(t.title)}</div><div class="cal-mini-s">${CATEGORY_LABELS[t.cat]||''} · ${t.dur||'—'}</div></div>`).join('')||'<div style="color:var(--tx3);padding:12px;font-size:.78rem;text-align:center">Aucune</div>';
  document.getElementById('cal-hdr').innerHTML='<div class="cal-hdr-time"></div>'+dates.map(d=>`<div class="cal-hdr-day ${dateKey(d)===today?'today':''}">${JOURS[(d.getDay()+6)%7]}<span class="num">${d.getDate()}</span></div>`).join('');
  const timeCol=HOURS.map(h=>`<div class="cal-time-slot">${String(h).padStart(2,'0')}h</div>`).join('');
  const dayCols=dates.map(d=>{const key=dateKey(d),dt=filtered.filter(t=>t.calDay===key);const slots=HOURS.map(()=>'<div class="cal-hour-slot"></div>').join('');const evts=dt.map(t=>{const hh=t.calHour||7;return`<div class="cal-evt" style="top:${(hh-7)*48}px;height:46px" draggable="true" data-id="${t.id}" ondragstart="dStart(event)" ondragend="dEnd(event)">${escapeHtml(t.title)}</div>`}).join('');return`<div class="cal-day-col" data-day="${key}" ondragover="dragOver(event)" ondragleave="dragLeave(event)" ondrop="cdDrop(event)">${slots}${evts}</div>`}).join('');
  document.getElementById('cal-body').innerHTML=`<div class="cal-time-col">${timeCol}</div><div class="cal-days-wrap">${dayCols}</div>`;
}
function calNav(dir){calOff+=dir;renderCalendar()}
function calMode(m){calView=m;document.querySelectorAll('.cal-toolbar button').forEach(b=>b.classList.remove('act'));const id={week:'cal-btn-sem',day:'cal-btn-day'};document.getElementById(id[m])?.classList.add('act');renderCalendar()}
/* cdOver/cdLeave remplaces par dragOver/dragLeave */
async function cdDrop(e){e.preventDefault();e.currentTarget.classList.remove('dragover');if(!dragId)return;const t=tasks.find(x=>x.id===dragId);if(t){const col=e.currentTarget.closest('.cal-day-col');if(col){t.calDay=col.dataset.day;const rect=col.getBoundingClientRect();t.calHour=Math.min(20,Math.max(7,Math.floor((e.clientY-rect.top)/48)+7))}renderAll();await updateTaskDB(t)}dragId=null}
/* cuOver/cuLeave remplaces par dragOver/dragLeave */
async function cuDrop(e){e.preventDefault();e.currentTarget.classList.remove('dragover');if(!dragId)return;const t=tasks.find(x=>x.id===dragId);if(t){t.calDay=null;t.calHour=null;renderAll();await updateTaskDB(t)}dragId=null}

/* ═══ EISENHOWER ═══ */
function renderEisenhower(){
  ['do','plan','delegate','eliminate'].forEach(q=>{
    const items=filt().filter(t=>t.eq===q).sort((a,b)=>PRIORITY_ORDER[a.prio]-PRIORITY_ORDER[b.prio]);
    document.getElementById('eq-'+q).innerHTML=items.map(t=>{const ri=t.recurrence&&t.recurrence!=='never'?' \uD83D\uDD04':'';return`<div class="eq-card" draggable="true" data-id="${t.id}" ondragstart="dStart(event)" ondragend="dEnd(event)"><span class="badge b-${t.cat}" style="font-size:.6rem">${CATEGORY_LABELS[t.cat]||t.cat}</span><span class="eq-card-t">${escapeHtml(t.title)}${ri}</span><button class="eq-card-x" onclick="openModal('${t.id}')">&#9998;</button><button class="eq-card-x" onclick="delTask('${t.id}')">&#10005;</button></div>`}).join('')||'<div style="color:var(--tx3);font-size:.78rem;padding:16px;text-align:center">Glissez des tâches ici</div>';
    document.getElementById('ec-'+q).textContent=items.length})}
/* eOver/eLeave remplaces par dragOver/dragLeave */
async function eDrop(e){e.preventDefault();e.currentTarget.classList.remove('dragover');if(!dragId)return;const t=tasks.find(x=>x.id===dragId);if(t){t.eq=e.currentTarget.dataset.eq;renderAll();await updateTaskDB(t)}dragId=null}

/* ═══ NOTES ═══ */
document.getElementById('notes-cats').addEventListener('click',e=>{const b=e.target.closest('.notes-cat-btn');if(!b)return;notesCatFilter=b.dataset.nc;document.querySelectorAll('.notes-cat-btn').forEach(x=>x.classList.remove('act'));b.classList.add('act');renderNotes()});
function renderNotes(){
  const filtered=notesCatFilter==='all'?notes:notes.filter(n=>n.cat===notesCatFilter);
  document.getElementById('notes-list').innerHTML=filtered.map(n=>`<div class="note-item${selectedNoteId===n.id?' active':''}" onclick="selectNote('${n.id}')"><div class="note-item-title">${escapeHtml(n.title||'Sans titre')}</div><div class="note-item-preview">${escapeHtml((n.content||'').slice(0,80))}</div><div class="note-item-meta"><span class="badge b-${n.cat}" style="font-size:.55rem">${NOTE_CATEGORY_LABELS[n.cat]||n.cat}</span></div></div>`).join('')||'<div style="color:var(--tx3);padding:20px;text-align:center;font-size:.84rem">Aucune note</div>';
}
function selectNote(id){
  selectedNoteId=id;const n=notes.find(x=>x.id===id);if(!n)return;
  document.getElementById('notes-empty-state').style.display='none';
  document.getElementById('notes-form').style.display='flex';
  document.getElementById('n-title').value=n.title;document.getElementById('n-content').value=n.content;document.getElementById('n-cat').value=n.cat;
  if(window.innerWidth<=768){document.getElementById('notes-side').classList.add('hidden');document.getElementById('notes-editor').classList.remove('hidden')}
  renderNotes();
}
function deselectNote(){
  selectedNoteId=null;notesDraft=null;
  document.getElementById('notes-form').style.display='none';document.getElementById('notes-empty-state').style.display='flex';
  document.getElementById('notes-side').classList.remove('hidden');
  if(window.innerWidth<=768)document.getElementById('notes-editor').classList.add('hidden');
  renderNotes();
}
function createNote(){
  notesDraft={id:null,title:'',content:'',cat:'autre'};
  selectedNoteId='draft';
  document.getElementById('notes-empty-state').style.display='none';
  document.getElementById('notes-form').style.display='flex';
  document.getElementById('n-title').value='';document.getElementById('n-content').value='';document.getElementById('n-cat').value='autre';
  if(window.innerWidth<=768){document.getElementById('notes-side').classList.add('hidden');document.getElementById('notes-editor').classList.remove('hidden')}
  renderNotes();
  setTimeout(()=>document.getElementById('n-title').focus(),50);
}
async function saveNote(){
  if(selectedNoteId==='draft'){
    const title=document.getElementById('n-title').value.trim(),content=document.getElementById('n-content').value,cat=document.getElementById('n-cat').value;
    if(!title&&!content){toast('Note vide — non sauvegardée');deselectNote();return}
    const n={id:null,title,content,cat,createdAt:null,updatedAt:null};
    const r=await insertNote(n);if(r){notes.unshift(r);selectedNoteId=r.id;notesDraft=null;renderNotes();toast('Note créée ✓')}
    return;
  }
  const n=notes.find(x=>x.id===selectedNoteId);if(!n)return;
  n.title=document.getElementById('n-title').value.trim();n.content=document.getElementById('n-content').value;n.cat=document.getElementById('n-cat').value;
  await updateNoteDB(n);renderNotes();toast('Note enregistrée ✓');
}
async function deleteNote(){
  if(!selectedNoteId)return;const ok=await showConfirm('Supprimer cette note ?');if(!ok)return;
  await deleteNoteDB(selectedNoteId);notes=notes.filter(n=>n.id!==selectedNoteId);deselectNote();toast('Note supprimée');
}

/* ═══ HABITS VIEW ═══ */
function calcStreaks(h){
  let cur=0;const d=new Date();while(h.checks&&h.checks[dateKey(d)]){cur++;d.setDate(d.getDate()-1)}
  const dates=Object.keys(h.checks||{}).filter(k=>h.checks[k]).sort();let best=0,run=0;
  for(let i=0;i<dates.length;i++){if(i===0)run=1;else{const diff=Math.round((new Date(dates[i])-new Date(dates[i-1]))/864e5);run=diff===1?run+1:1}if(run>best)best=run}
  return{cur,best};
}
function renderHabits(){
  const today=new Date();
  const html=habits.map(hb=>{
    const{cur,best}=calcStreaks(hb);
    const dots=Array.from({length:14},(_,i)=>{const dd=new Date(today);dd.setDate(today.getDate()-13+i);const k=dateKey(dd);const on=hb.checks&&hb.checks[k]?'on':'';const label=dd.getDate()+'/'+String(dd.getMonth()+1).padStart(2,'0');return`<div class="habit-card-dot ${on}" onclick="toggleHabitDay('${hb.id}','${k}')" title="${label}">${dd.getDate()}</div>`}).join('');
    return `<div class="habit-card"><div class="habit-card-header"><span class="habit-card-name">${escapeHtml(hb.name)}</span><button class="habit-card-del" onclick="delHabit('${hb.id}')">&#10005;</button></div><div class="habit-card-dots">${dots}</div><div class="habit-card-streak"><span>&#128293; Série actuelle : <strong>${cur}j</strong></span><span>&#127942; Record : <strong>${best}j</strong></span></div></div>`}).join('')||'<div class="focus-empty">Aucune habitude</div>';
  document.getElementById('habits-content').innerHTML=`<div class="habits-grid">${html}</div><button onclick="openHabitModal()" style="margin-top:16px;padding:10px 20px;border:none;border-radius:8px;background:var(--or);color:#fff;font-weight:600;cursor:pointer;font-size:.86rem">+ Nouvelle habitude</button>`;
}
async function toggleHabitDay(id,key){const hb=habits.find(x=>x.id===id);if(!hb)return;if(!hb.checks)hb.checks={};hb.checks[key]=!hb.checks[key];if(!hb.checks[key])delete hb.checks[key];renderAll();await updateHabit(hb)}

/* ═══ STATS ═══ */
function renderStats(){
  const now=new Date(),today=dateKey(now);
  const all=tasks.length,done=tasks.filter(t=>t.status==='done').length,pct=all?Math.round(done/all*100):0;
  const tasksDoneToday=tasks.filter(t=>t.completedAt===today).length;
  const habitsToday=habits.filter(h=>h.checks&&h.checks[today]).length;
  // Weekly comparison
  const dow=(now.getDay()+6)%7;
  let thisW=0,lastW=0;
  for(let i=0;i<=dow;i++){const d=new Date();d.setDate(d.getDate()-i);thisW+=tasks.filter(t=>t.completedAt===dateKey(d)).length}
  for(let i=0;i<=dow;i++){const d=new Date();d.setDate(d.getDate()-7-i);lastW+=tasks.filter(t=>t.completedAt===dateKey(d)).length}
  const weekDiff=lastW>0?Math.round((thisW-lastW)/lastW*100):(thisW>0?100:0);
  const weekCls=weekDiff>0?'up':weekDiff<0?'down':'flat';
  const weekSign=weekDiff>0?'+':'';
  // Category bars
  const cats=['travail','personnel','sante','urgent','apprentissage'];
  const catColors={travail:'var(--amber)',personnel:'var(--blue)',sante:'var(--green)',urgent:'var(--red)',apprentissage:'var(--or3)'};
  const catBars=cats.map(c=>{const n=tasks.filter(t=>t.cat===c).length;return`<div class="st-bar-r"><span class="lb">${CATEGORY_LABELS[c]}</span><div class="bar"><div class="fill" style="width:${all?n/all*100:0}%;background:${catColors[c]}"></div></div><span class="vl">${n}</span></div>`}).join('');
  const prios=['critique','haute','moyenne','moderee','basse'];
  const prioColors={critique:'var(--red)',haute:'var(--or)',moyenne:'var(--yellow)',moderee:'var(--blue)',basse:'var(--green)'};
  const prioBars=prios.map(p=>{const n=tasks.filter(t=>t.prio===p).length;return`<div class="st-bar-r"><span class="lb">${PRIORITY_LABELS[p]}</span><div class="bar"><div class="fill" style="width:${all?n/all*100:0}%;background:${prioColors[p]}"></div></div><span class="vl">${n}</span></div>`}).join('');
  // Habit streaks
  const streakHTML=habits.map(hb=>{const{cur,best}=calcStreaks(hb);return`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--brd)"><span style="flex:1;font-size:.84rem">${escapeHtml(hb.name)}</span><span style="font-size:.82rem;color:var(--or);font-weight:600">&#128293; ${cur}j</span><span style="font-size:.75rem;color:var(--tx3)">Record : ${best}j</span></div>`}).join('')||'<div style="color:var(--tx3);font-size:.82rem">Aucune habitude</div>';

  document.getElementById('stats-content').innerHTML=`<div class="stats-grid">
    <div class="st-card"><div class="st-card-t">Bilan du jour</div><div class="st-big">${tasksDoneToday+habitsToday}</div><div class="st-sub">${tasksDoneToday} tâche${tasksDoneToday>1?'s':''} complétée${tasksDoneToday>1?'s':''}, ${habitsToday} habitude${habitsToday>1?'s':''} cochée${habitsToday>1?'s':''}</div></div>
    <div class="st-card"><div class="st-card-t">Score hebdomadaire</div><div class="st-week-cmp"><div class="st-week-num ${weekCls}">${weekSign}${weekDiff}%</div><div><div style="font-size:.84rem;color:var(--tx2)">Cette semaine : <strong>${thisW}</strong></div><div style="font-size:.78rem;color:var(--tx3)">Semaine dernière : ${lastW}</div></div></div></div>
    <div class="st-card"><div class="st-card-t">Progression globale</div><div class="st-big">${pct}%</div><div class="st-sub">${done}/${all} tâches terminées</div></div>
    <div class="st-card" style="grid-column:1/-1"><div class="st-card-t">Tâches complétées (30 derniers jours)</div><div class="st-chart-wrap"><canvas id="completion-chart"></canvas></div></div>
    <div class="st-card"><div class="st-card-t">Par catégorie</div>${catBars}</div>
    <div class="st-card"><div class="st-card-t">Par priorité</div>${prioBars}</div>
    <div class="st-card"><div class="st-card-t">Streaks habitudes</div>${streakHTML}</div>
  </div>`;
  // Chart.js
  const labels=[],values=[];
  for(let i=29;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);labels.push(d.getDate()+' '+MOIS[d.getMonth()]);values.push(tasks.filter(t=>t.completedAt===dateKey(d)).length)}
  const ctx=document.getElementById('completion-chart');
  if(ctx){
    if(completionChart)completionChart.destroy();
    const isDark=theme==='dark';
    completionChart=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Tâches complétées',data:values,borderColor:'#f97316',backgroundColor:'rgba(249,115,22,.15)',fill:true,tension:.3,pointRadius:2,pointHoverRadius:5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:isDark?'#666':'#a8a29e',maxTicksLimit:10,font:{size:10}},grid:{color:isDark?'#2a2a2a':'#e5e5e5'}},y:{beginAtZero:true,ticks:{color:isDark?'#666':'#a8a29e',stepSize:1,font:{size:10}},grid:{color:isDark?'#2a2a2a':'#e5e5e5'}}}}});
  }
}

/* ═══ RENDER ALL ═══ */
const VIEW_RENDERERS={
  focus:renderFocus,
  kanban:renderKanban,
  calendar:renderCalendar,
  eisenhower:renderEisenhower,
  notes:renderNotes,
  habits:renderHabits,
  stats:renderStats
};
function renderAll(){
  renderSidebar();
  const renderView=VIEW_RENDERERS[activeView];
  if(renderView)renderView();
}

/* ═══ TOAST ═══ */
function toast(m){const e=document.createElement('div');e.className='toast';e.textContent=m;document.getElementById('toasts').appendChild(e);setTimeout(()=>e.remove(),3e3)}

/* ═══ NOTIFICATIONS ═══ */
function initNotifications(){
  if(!('Notification' in window))return;
  if(Notification.permission==='default')Notification.requestPermission();
}
function checkDeadlines(){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const now=new Date(),today=dateKey(now);
  const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);const tmrw=dateKey(tomorrow);
  tasks.forEach(t=>{
    if(t.status==='done'||!t.due)return;
    const key='tf-n-'+t.id+'-'+t.due;const last=localStorage.getItem(key);
    if(last&&Date.now()-Number(last)<36e5)return;
    if(t.due===tmrw){localStorage.setItem(key,Date.now());new Notification('TaskFlow',{body:'\u23F0 Rappel : '+t.title+' est due demain',icon:'icon-192.svg'})}
    else if(t.due<today){localStorage.setItem(key,Date.now());new Notification('TaskFlow',{body:'\uD83D\uDD34 En retard : '+t.title+' était due le '+t.due,icon:'icon-192.svg'})}
  });
}

/* ═══ TOUCH DRAG ═══ */
let touchDragId=null,touchGhost=null,touchStartX=0,touchStartY=0,touchMoved=false;
function initTouchDrag(){document.addEventListener('touchstart',onTS,{passive:false});document.addEventListener('touchmove',onTM,{passive:false});document.addEventListener('touchend',onTE,{passive:false})}
function onTS(e){const c=e.target.closest('[data-id][draggable]');if(!c||e.target.closest('button'))return;const t=e.touches[0];touchStartX=t.clientX;touchStartY=t.clientY;touchMoved=false;touchDragId=c.dataset.id}
function onTM(e){if(!touchDragId)return;const t=e.touches[0];if(!touchMoved&&Math.abs(t.clientX-touchStartX)<8&&Math.abs(t.clientY-touchStartY)<8)return;touchMoved=true;e.preventDefault();
  if(!touchGhost){const c=document.querySelector(`[data-id="${touchDragId}"][draggable]`);if(!c)return;touchGhost=c.cloneNode(true);touchGhost.className='touch-ghost';touchGhost.style.width=c.offsetWidth+'px';document.body.appendChild(touchGhost);c.style.opacity='.3'}
  touchGhost.style.left=(t.clientX-60)+'px';touchGhost.style.top=(t.clientY-30)+'px';
  document.querySelectorAll('.dragover').forEach(el=>el.classList.remove('dragover'));
  const u=document.elementFromPoint(t.clientX,t.clientY);if(u){const col=u.closest('[data-st]')||u.closest('[data-eq]')||u.closest('[data-day]');if(col)col.classList.add('dragover');const up=u.closest('.cal-side');if(up)up.classList.add('dragover')}}
async function onTE(e){if(!touchDragId)return;document.querySelectorAll('.dragover').forEach(el=>el.classList.remove('dragover'));
  if(touchGhost){touchGhost.remove();touchGhost=null}const oc=document.querySelector(`[data-id="${touchDragId}"][draggable]`);if(oc)oc.style.opacity='1';
  if(!touchMoved){touchDragId=null;return}const tc=e.changedTouches[0],u=document.elementFromPoint(tc.clientX,tc.clientY),t=tasks.find(x=>x.id===touchDragId);touchDragId=null;if(!t||!u)return;
  const kC=u.closest('[data-st]');if(kC){t.status=kC.dataset.st;renderAll();await updateTaskDB(t);return}
  const eC=u.closest('[data-eq]');if(eC){t.eq=eC.dataset.eq;renderAll();await updateTaskDB(t);return}
  const dC=u.closest('[data-day]');if(dC){t.calDay=dC.dataset.day;const r=dC.getBoundingClientRect();t.calHour=Math.min(20,Math.max(7,Math.floor((tc.clientY-r.top)/48)+7));renderAll();await updateTaskDB(t);return}
  const uC=u.closest('.cal-side');if(uC){t.calDay=null;t.calHour=null;renderAll();await updateTaskDB(t)}}

/* ═══ INIT ═══ */
const isMobile=window.innerWidth<=768;
if(isMobile){calView='day'}
initTouchDrag();

(async function(){
  await Promise.all([loadTasks(),loadHabits(),loadNotes()]);
  document.getElementById('loading-screen').classList.add('hidden');
  renderAll();
  if(isMobile){calMode('day')}
  initNotifications();
  setTimeout(checkDeadlines,2000);
  setInterval(checkDeadlines,36e5);
})();
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeHabitModal();cancelConfirm();closeMore()}if(e.key==='n'&&!e.ctrlKey&&!e.metaKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.querySelector('.modal-bg.open'))fabAction()});
