/* ═══ SUPABASE CONFIG ═══ */
const SUPABASE_URL='https://byigvrfltmqmmwylsmmi.supabase.co';
const SUPABASE_KEY='sb_publishable_NlPe78o7ymxyj0O6mp9e0g_6iXQjBQ_';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

/* ═══ DONNEES GLOBALES ═══ */
let tasks=[],habits=[],notes=[];

/* ═══ MAPPING DB <-> APP ═══ */
function rowToTask(r){return{id:String(r.id),title:r.title||'',desc:r.description||'',cat:r.category||'travail',prio:r.priority||'moyenne',dur:r.duration||'',due:r.due_date||'',status:r.completed?'done':(r.status||'todo'),eq:r.quadrant||'plan',calDay:r.cal_day||null,calHour:r.cal_hour||null,completedAt:r.completed_at||null,recurrence:r.recurrence_type||'never',recurDay:r.recurrence_day||null}}
function taskToRow(t){return{title:t.title,description:t.desc||'',category:t.cat||'travail',priority:t.prio||'moyenne',duration:t.dur||'',due_date:t.due||null,completed:t.status==='done',status:t.status||'todo',quadrant:t.eq||'plan',cal_day:t.calDay||null,cal_hour:t.calHour||null,completed_at:t.completedAt||null,recurrence_type:t.recurrence||'never',recurrence_day:t.recurDay||null}}
function rowToHabit(r){return{id:String(r.id),name:r.name||'',checks:r.completions||{}}}
function habitToRow(h){return{name:h.name,completions:h.checks||{}}}
function rowToNote(r){return{id:String(r.id),title:r.title||'',content:r.content||'',cat:r.category||'autre',createdAt:r.created_at,updatedAt:r.updated_at}}
function noteToRow(n){return{title:n.title,content:n.content||'',category:n.cat||'autre'}}

/* ═══ CRUD TASKS ═══ */
async function loadTasks(){
  console.log('[DB] loadTasks →');
  const{data,error}=await sb.from('tasks').select('*').order('id',{ascending:true});
  if(error){console.error('[DB] loadTasks ERREUR:',error);toast('Erreur chargement tâches');return}
  console.log('[DB] loadTasks ← '+( data||[]).length+' tâches');
  tasks=(data||[]).map(rowToTask)
}
async function insertTask(t){
  const row=taskToRow(t);
  console.log('[DB] insertTask →',row);
  const{data,error}=await sb.from('tasks').insert(row).select();
  if(error){console.error('[DB] insertTask ERREUR:',error);toast('Erreur création tâche — '+error.message);return null}
  console.log('[DB] insertTask ← OK',data);
  if(data&&data[0])t.id=String(data[0].id);
  return t
}
async function updateTaskDB(t){
  const row=taskToRow(t);
  console.log('[DB] updateTask → id='+t.id,row);
  const{data,error}=await sb.from('tasks').update(row).eq('id',t.id).select();
  if(error){console.error('[DB] updateTask ERREUR:',error);toast('Erreur mise à jour tâche — '+error.message);return}
  if(!data?.length){
    console.error('[DB] updateTask ÉCHEC : 0 lignes affectées, id='+t.id+' (RLS ou id introuvable)');
    toast('⚠️ Tâche non sauvegardée (0 lignes — vérifier RLS Supabase)');
  } else {
    console.log('[DB] updateTask ← OK',data[0]);
  }
}
async function deleteTaskDB(id){
  console.log('[DB] deleteTask → id='+id);
  const{data,error,count}=await sb.from('tasks').delete().eq('id',id).select();
  if(error){console.error('[DB] deleteTask ERREUR:',error);toast('Erreur suppression tâche — '+error.message);return}
  if(!data?.length){
    console.error('[DB] deleteTask ÉCHEC : 0 lignes affectées, id='+id+' (RLS ou id introuvable)');
    toast('⚠️ Suppression non sauvegardée (RLS Supabase ?)');
  } else {
    console.log('[DB] deleteTask ← OK, supprimé id='+id);
  }
}

/* ═══ CRUD HABITS ═══ */
async function loadHabits(){
  console.log('[DB] loadHabits →');
  const{data,error}=await sb.from('habits').select('*').order('id',{ascending:true});
  if(error){console.error('[DB] loadHabits ERREUR:',error);toast('Erreur chargement habitudes');return}
  console.log('[DB] loadHabits ← '+(data||[]).length+' habitudes');
  habits=(data||[]).map(rowToHabit)
}
async function updateHabit(h){
  const row=habitToRow(h);
  console.log('[DB] updateHabit → id='+h.id,row);
  const{data,error}=await sb.from('habits').update(row).eq('id',h.id).select();
  if(error){console.error('[DB] updateHabit ERREUR:',error);toast('Erreur mise à jour habitude — '+error.message);return}
  if(!data?.length){
    console.error('[DB] updateHabit ÉCHEC : 0 lignes affectées, id='+h.id);
    toast('⚠️ Habitude non sauvegardée (RLS Supabase ?)');
  } else {
    console.log('[DB] updateHabit ← OK');
  }
}
async function insertHabit(h){
  const row=habitToRow(h);
  console.log('[DB] insertHabit →',row);
  const{data,error}=await sb.from('habits').insert(row).select();
  if(error){console.error('[DB] insertHabit ERREUR:',error);toast('Erreur création habitude — '+error.message);return null}
  console.log('[DB] insertHabit ← OK',data);
  if(data&&data[0])h.id=String(data[0].id);
  return h
}
async function deleteHabitDB(id){
  console.log('[DB] deleteHabit → id='+id);
  const{data,error}=await sb.from('habits').delete().eq('id',id).select();
  if(error){console.error('[DB] deleteHabit ERREUR:',error);toast('Erreur suppression habitude — '+error.message);return}
  if(!data?.length){
    console.error('[DB] deleteHabit ÉCHEC : 0 lignes affectées, id='+id);
    toast('⚠️ Suppression habitude non sauvegardée');
  } else {
    console.log('[DB] deleteHabit ← OK');
  }
}

/* ═══ CRUD NOTES ═══ */
async function loadNotes(){
  console.log('[DB] loadNotes →');
  const{data,error}=await sb.from('notes').select('*').order('updated_at',{ascending:false});
  if(error){console.error('[DB] loadNotes ERREUR:',error);toast('Erreur chargement notes');return}
  console.log('[DB] loadNotes ← '+(data||[]).length+' notes');
  notes=(data||[]).map(rowToNote)
}
async function insertNote(n){
  const row=noteToRow(n);
  console.log('[DB] insertNote →',row);
  const{data,error}=await sb.from('notes').insert(row).select();
  if(error){console.error('[DB] insertNote ERREUR:',error);toast('Erreur création note — '+error.message);return null}
  console.log('[DB] insertNote ← OK',data);
  if(data&&data[0]){n.id=String(data[0].id);n.createdAt=data[0].created_at;n.updatedAt=data[0].updated_at}
  return n
}
async function updateNoteDB(n){
  const row=noteToRow(n);
  console.log('[DB] updateNote → id='+n.id,row);
  const{data,error}=await sb.from('notes').update(row).eq('id',n.id).select();
  if(error){console.error('[DB] updateNote ERREUR:',error);toast('Erreur mise à jour note — '+error.message);return}
  if(!data?.length){
    console.error('[DB] updateNote ÉCHEC : 0 lignes affectées, id='+n.id);
    toast('⚠️ Note non sauvegardée (RLS Supabase ?)');
  } else {
    console.log('[DB] updateNote ← OK');
  }
}
async function deleteNoteDB(id){
  console.log('[DB] deleteNote → id='+id);
  const{data,error}=await sb.from('notes').delete().eq('id',id).select();
  if(error){console.error('[DB] deleteNote ERREUR:',error);toast('Erreur suppression note — '+error.message);return}
  if(!data?.length){
    console.error('[DB] deleteNote ÉCHEC : 0 lignes affectées, id='+id);
    toast('⚠️ Suppression note non sauvegardée');
  } else {
    console.log('[DB] deleteNote ← OK');
  }
}
