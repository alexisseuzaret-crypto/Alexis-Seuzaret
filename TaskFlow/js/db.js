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
async function loadTasks(){const{data,error}=await sb.from('tasks').select('*').order('id',{ascending:true});if(error){console.error('loadTasks:',error);toast('Erreur chargement tâches');return}tasks=(data||[]).map(rowToTask)}
async function insertTask(t){const row=taskToRow(t);const{data,error}=await sb.from('tasks').insert(row).select();if(error){console.error('insertTask:',error);toast('Erreur création tâche');return null}if(data&&data[0])t.id=String(data[0].id);return t}
async function updateTaskDB(t){const{error}=await sb.from('tasks').update(taskToRow(t)).eq('id',Number(t.id));if(error){console.error('updateTask:',error);toast('Erreur mise à jour tâche')}}
async function deleteTaskDB(id){const{error}=await sb.from('tasks').delete().eq('id',Number(id));if(error){console.error('deleteTask:',error);toast('Erreur suppression tâche')}}

/* ═══ CRUD HABITS ═══ */
async function loadHabits(){const{data,error}=await sb.from('habits').select('*').order('id',{ascending:true});if(error){console.error('loadHabits:',error);toast('Erreur chargement habitudes');return}habits=(data||[]).map(rowToHabit)}
async function updateHabit(h){const{error}=await sb.from('habits').update(habitToRow(h)).eq('id',Number(h.id));if(error){console.error('updateHabit:',error);toast('Erreur mise à jour habitude')}}
async function insertHabit(h){const{data,error}=await sb.from('habits').insert(habitToRow(h)).select();if(error){console.error('insertHabit:',error);toast('Erreur création habitude');return null}if(data&&data[0])h.id=String(data[0].id);return h}
async function deleteHabitDB(id){const{error}=await sb.from('habits').delete().eq('id',Number(id));if(error){console.error('deleteHabit:',error);toast('Erreur suppression habitude')}}

/* ═══ CRUD NOTES ═══ */
async function loadNotes(){const{data,error}=await sb.from('notes').select('*').order('updated_at',{ascending:false});if(error){console.error('loadNotes:',error);toast('Erreur chargement notes');return}notes=(data||[]).map(rowToNote)}
async function insertNote(n){const{data,error}=await sb.from('notes').insert(noteToRow(n)).select();if(error){console.error('insertNote:',error);toast('Erreur création note');return null}if(data&&data[0]){n.id=String(data[0].id);n.createdAt=data[0].created_at;n.updatedAt=data[0].updated_at}return n}
async function updateNoteDB(n){const{error}=await sb.from('notes').update(noteToRow(n)).eq('id',Number(n.id));if(error){console.error('updateNote:',error);toast('Erreur mise à jour note')}}
async function deleteNoteDB(id){const{error}=await sb.from('notes').delete().eq('id',Number(id));if(error){console.error('deleteNote:',error);toast('Erreur suppression note')}}
