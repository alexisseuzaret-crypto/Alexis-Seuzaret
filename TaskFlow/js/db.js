/* ═══ SUPABASE CONFIG ═══ */
const SUPABASE_URL='https://byigvrfltmqmmwylsmmi.supabase.co';
const SUPABASE_KEY='sb_publishable_NlPe78o7ymxyj0O6mp9e0g_6iXQjBQ_';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

/* ═══ DONNEES GLOBALES ═══ */
let tasks=[],habits=[],notes=[],projects=[],projectTasks=[],pushupLog=[],runningLog=[],swimmingLog=[],mealsLog=[],waterLog=[],savedMeals=[],calEvents=[];

/* ═══ MAPPING DB <-> APP ═══ */
function rowToTask(r){return{id:String(r.id),title:r.title||'',desc:r.description||'',cat:r.category||'travail',prio:r.priority||'moyenne',dur:r.duration||'',due:r.due_date||'',status:r.status||'todo',eq:r.quadrant||'plan',calDay:r.cal_day||null,calHour:r.cal_hour||null,completedAt:r.completed_at||null,recurrence:r.recurrence_type||'never',recurDay:r.recurrence_day||null,position:r.position??null}}
function taskToRow(t){return{title:t.title,description:t.desc||'',category:t.cat||'travail',priority:t.prio||'moyenne',duration:t.dur||'',due_date:t.due||null,status:t.status||'todo',quadrant:t.eq||'plan',cal_day:t.calDay||null,cal_hour:t.calHour||null,completed_at:t.completedAt||null,recurrence_type:t.recurrence||'never',recurrence_day:t.recurDay||null,position:t.position??null}}
function rowToHabit(r){return{id:String(r.id),name:r.name||'',checks:r.completions||{},position:r.position??null}}
function habitToRow(h){return{name:h.name,completions:h.checks||{},position:h.position??null}}
function rowToNote(r){return{id:String(r.id),title:r.title||'',content:r.content||'',cat:r.category||'autre',createdAt:r.created_at,updatedAt:r.updated_at,position:r.position??null}}
function noteToRow(n){return{title:n.title,content:n.content||'',category:n.cat||'autre',position:n.position??null}}

/* ═══ CRUD TASKS ═══ */
async function loadTasks(){
  console.warn('[DB] loadTasks →');
  const{data,error}=await sb.from('tasks').select('*').order('id',{ascending:true});
  if(error){console.error('[DB] loadTasks ERREUR:',error);toast('Erreur chargement tâches');return}
  console.warn('[DB] loadTasks ← '+( data||[]).length+' tâches');
  tasks=(data||[]).map(rowToTask)
}
async function insertTask(t){
  const row=taskToRow(t);
  console.warn('[DB] insertTask →',row);
  const{data,error}=await sb.from('tasks').insert(row).select();
  if(error){console.error('[DB] insertTask ERREUR:',error);toast('Erreur création tâche — '+error.message);return null}
  console.warn('[DB] insertTask ← OK',data);
  if(data&&data[0])t.id=String(data[0].id);
  return t
}
async function updateTaskDB(t){
  const row=taskToRow(t);
  console.warn('[DB] updateTask → id='+t.id,row);
  const{data,error}=await sb.from('tasks').update(row).eq('id',t.id).select();
  if(error){console.error('[DB] updateTask ERREUR:',error);toast('Erreur mise à jour tâche — '+error.message);return}
  if(!data?.length){
    console.error('[DB] updateTask ÉCHEC : 0 lignes affectées, id='+t.id+' (RLS ou id introuvable)');
    toast('⚠️ Tâche non sauvegardée (0 lignes — vérifier RLS Supabase)');
  } else {
    console.warn('[DB] updateTask ← OK',data[0]);
  }
}
async function deleteTaskDB(id){
  console.warn('[DB] deleteTask → id='+id);
  const{data,error,count}=await sb.from('tasks').delete().eq('id',id).select();
  if(error){console.error('[DB] deleteTask ERREUR:',error);toast('Erreur suppression tâche — '+error.message);return}
  if(!data?.length){
    console.error('[DB] deleteTask ÉCHEC : 0 lignes affectées, id='+id+' (RLS ou id introuvable)');
    toast('⚠️ Suppression non sauvegardée (RLS Supabase ?)');
  } else {
    console.warn('[DB] deleteTask ← OK, supprimé id='+id);
  }
}

/* ═══ CRUD HABITS ═══ */
async function loadHabits(){
  console.warn('[DB] loadHabits →');
  const{data,error}=await sb.from('habits').select('*').order('id',{ascending:true});
  if(error){console.error('[DB] loadHabits ERREUR:',error);toast('Erreur chargement habitudes');return}
  console.warn('[DB] loadHabits ← '+(data||[]).length+' habitudes');
  habits=(data||[]).map(rowToHabit)
}
async function updateHabit(h){
  const row=habitToRow(h);
  console.warn('[DB] updateHabit → id='+h.id,row);
  const{data,error}=await sb.from('habits').update(row).eq('id',h.id).select();
  if(error){console.error('[DB] updateHabit ERREUR:',error);toast('Erreur mise à jour habitude — '+error.message);return}
  if(!data?.length){
    console.error('[DB] updateHabit ÉCHEC : 0 lignes affectées, id='+h.id);
    toast('⚠️ Habitude non sauvegardée (RLS Supabase ?)');
  } else {
    console.warn('[DB] updateHabit ← OK');
  }
}
async function insertHabit(h){
  const row=habitToRow(h);
  console.warn('[DB] insertHabit →',row);
  const{data,error}=await sb.from('habits').insert(row).select();
  if(error){console.error('[DB] insertHabit ERREUR:',error);toast('Erreur création habitude — '+error.message);return null}
  console.warn('[DB] insertHabit ← OK',data);
  if(data&&data[0])h.id=String(data[0].id);
  return h
}
async function deleteHabitDB(id){
  console.warn('[DB] deleteHabit → id='+id);
  const{data,error}=await sb.from('habits').delete().eq('id',id).select();
  if(error){console.error('[DB] deleteHabit ERREUR:',error);toast('Erreur suppression habitude — '+error.message);return}
  if(!data?.length){
    console.error('[DB] deleteHabit ÉCHEC : 0 lignes affectées, id='+id);
    toast('⚠️ Suppression habitude non sauvegardée');
  } else {
    console.warn('[DB] deleteHabit ← OK');
  }
}

/* ═══ CRUD NOTES ═══ */
async function loadNotes(){
  console.warn('[DB] loadNotes →');
  const{data,error}=await sb.from('notes').select('*').order('updated_at',{ascending:false});
  if(error){console.error('[DB] loadNotes ERREUR:',error);toast('Erreur chargement notes');return}
  console.warn('[DB] loadNotes ← '+(data||[]).length+' notes');
  notes=(data||[]).map(rowToNote)
}
async function insertNote(n){
  const row=noteToRow(n);
  console.warn('[DB] insertNote →',row);
  const{data,error}=await sb.from('notes').insert(row).select();
  if(error){console.error('[DB] insertNote ERREUR:',error);toast('Erreur création note — '+error.message);return null}
  console.warn('[DB] insertNote ← OK',data);
  if(data&&data[0]){n.id=String(data[0].id);n.createdAt=data[0].created_at;n.updatedAt=data[0].updated_at}
  return n
}
async function updateNoteDB(n){
  const row={...noteToRow(n),updated_at:new Date().toISOString()};
  console.warn('[DB] updateNote → id='+n.id,row);
  const{data,error}=await sb.from('notes').update(row).eq('id',n.id).select();
  if(error){console.error('[DB] updateNote ERREUR:',error);toast('Erreur mise à jour note — '+error.message);return}
  if(!data?.length){
    console.error('[DB] updateNote ÉCHEC : 0 lignes affectées, id='+n.id);
    toast('⚠️ Note non sauvegardée (RLS Supabase ?)');
  } else {
    console.warn('[DB] updateNote ← OK');
  }
}
/* ═══ BATCH POSITIONS ═══ */
async function updateTaskPositions(list){
  if(!list.length)return;
  console.warn('[DB] updateTaskPositions →',list.length,'tâches');
  await Promise.all(list.map(t=>sb.from('tasks').update({position:t.position}).eq('id',t.id)));
}
async function updateNotePositions(list){
  if(!list.length)return;
  console.warn('[DB] updateNotePositions →',list.length,'notes');
  await Promise.all(list.map(n=>sb.from('notes').update({position:n.position}).eq('id',n.id)));
}
async function updateHabitPositions(list){
  if(!list.length)return;
  console.warn('[DB] updateHabitPositions →',list.length,'habitudes');
  await Promise.all(list.map(h=>sb.from('habits').update({position:h.position}).eq('id',h.id)));
}

/* ═══ CRUD PROJETS ═══ */
function rowToProject(r){return{id:String(r.id),name:r.name||'',desc:r.description||'',cat:r.category||'autre',startDate:r.start_date||null,deadline:r.deadline||null,status:r.status||'en_cours',color:r.color||'#6366f1',createdAt:r.created_at}}
function projectToRow(p){return{name:p.name,description:p.desc||'',category:p.cat||'autre',start_date:p.startDate||null,deadline:p.deadline||null,status:p.status||'en_cours',color:p.color||'#6366f1'}}
function rowToPTask(r){return{id:String(r.id),projectId:String(r.project_id),title:r.title||'',status:r.status||'todo',priority:r.priority||'moyenne',dueDate:r.due_date||null,position:r.position??null}}
function ptaskToRow(t){return{project_id:Number(t.projectId),title:t.title,status:t.status||'todo',priority:t.priority||'moyenne',due_date:t.dueDate||null,position:t.position??null}}

async function loadProjects(){
  const{data,error}=await sb.from('projects').select('*').order('created_at',{ascending:false});
  if(error){console.error('[DB] loadProjects ERREUR:',error);toast('Erreur chargement projets');return}
  projects=(data||[]).map(rowToProject)
}
async function loadProjectTasks(){
  const{data,error}=await sb.from('project_tasks').select('*').order('position',{ascending:true,nullsFirst:false});
  if(error){console.error('[DB] loadProjectTasks ERREUR:',error);toast('Erreur chargement sous-tâches');return}
  projectTasks=(data||[]).map(rowToPTask)
}
async function insertProject(p){
  const row=projectToRow(p);
  const{data,error}=await sb.from('projects').insert(row).select();
  if(error){console.error('[DB] insertProject ERREUR:',error);toast('Erreur création projet — '+error.message);return null}
  if(data&&data[0])p.id=String(data[0].id);
  return p
}
async function updateProjectDB(p){
  const row=projectToRow(p);
  const{data,error}=await sb.from('projects').update(row).eq('id',p.id).select();
  if(error){console.error('[DB] updateProject ERREUR:',error);toast('Erreur mise à jour projet — '+error.message);return}
  if(!data?.length)toast('⚠️ Projet non sauvegardé');
}
async function deleteProjectDB(id){
  const{data,error}=await sb.from('projects').delete().eq('id',id).select();
  if(error){console.error('[DB] deleteProject ERREUR:',error);toast('Erreur suppression projet — '+error.message);return}
}
async function insertProjectTask(t){
  const row=ptaskToRow(t);
  const{data,error}=await sb.from('project_tasks').insert(row).select();
  if(error){console.error('[DB] insertProjectTask ERREUR:',error);toast('Erreur création sous-tâche — '+error.message);return null}
  if(data&&data[0])t.id=String(data[0].id);
  return t
}
async function updateProjectTaskDB(t){
  const row=ptaskToRow(t);
  const{data,error}=await sb.from('project_tasks').update(row).eq('id',t.id).select();
  if(error){console.error('[DB] updateProjectTask ERREUR:',error);toast('Erreur mise à jour sous-tâche — '+error.message);return}
  if(!data?.length)toast('⚠️ Sous-tâche non sauvegardée');
}
async function deleteProjectTaskDB(id){
  const{data,error}=await sb.from('project_tasks').delete().eq('id',id).select();
  if(error){console.error('[DB] deleteProjectTask ERREUR:',error);toast('Erreur suppression sous-tâche — '+error.message);return}
}
async function updateProjectTaskPositions(list){
  if(!list.length)return;
  await Promise.all(list.map(t=>sb.from('project_tasks').update({position:t.position}).eq('id',t.id)));
}

/* ═══ CRUD SPORT ═══ */
function rowToPushup(r){return{id:String(r.id),date:r.date,completed:r.completed||false,count:r.count}}
function rowToRun(r){return{id:String(r.id),date:r.date,duration:r.duration,distance:parseFloat(r.distance),calories:r.calories}}
function rowToSwim(r){return{id:String(r.id),date:r.date,duration:r.duration,style:r.style,calories:r.calories}}

async function loadPushupLog(){
  const{data,error}=await sb.from('pushup_log').select('*').order('date',{ascending:false}).limit(365);
  if(error){console.error('[DB] loadPushupLog ERREUR:',error);return}
  pushupLog=(data||[]).map(rowToPushup)
}
async function upsertPushup(date,completed,count){
  const{data,error}=await sb.from('pushup_log').upsert({date,completed,count},{onConflict:'date'}).select();
  if(error){console.error('[DB] upsertPushup ERREUR:',error);toast('Erreur sauvegarde pompes — '+error.message);return null}
  return data?.[0]||null
}
async function loadRunningLog(){
  const{data,error}=await sb.from('running_log').select('*').order('date',{ascending:false}).limit(50);
  if(error){console.error('[DB] loadRunningLog ERREUR:',error);return}
  runningLog=(data||[]).map(rowToRun)
}
async function insertRun(r){
  const{data,error}=await sb.from('running_log').insert({date:r.date,duration:r.duration,distance:r.distance,calories:r.calories}).select();
  if(error){console.error('[DB] insertRun ERREUR:',error);toast('Erreur enregistrement course — '+error.message);return null}
  if(data&&data[0])r.id=String(data[0].id);return r
}
async function deleteRunDB(id){
  const{error}=await sb.from('running_log').delete().eq('id',id);
  if(error)console.error('[DB] deleteRun ERREUR:',error)
}
async function loadSwimmingLog(){
  const{data,error}=await sb.from('swimming_log').select('*').order('date',{ascending:false}).limit(50);
  if(error){console.error('[DB] loadSwimmingLog ERREUR:',error);return}
  swimmingLog=(data||[]).map(rowToSwim)
}
async function insertSwim(s){
  const{data,error}=await sb.from('swimming_log').insert({date:s.date,duration:s.duration,style:s.style,calories:s.calories}).select();
  if(error){console.error('[DB] insertSwim ERREUR:',error);toast('Erreur enregistrement natation — '+error.message);return null}
  if(data&&data[0])s.id=String(data[0].id);return s
}
async function deleteSwimDB(id){
  const{error}=await sb.from('swimming_log').delete().eq('id',id);
  if(error)console.error('[DB] deleteSwim ERREUR:',error)
}

/* ═══ CRUD ALIMENTATION ═══ */
function rowToMeal(r){return{id:String(r.id),date:r.date,moment:r.moment,description:r.description,calories:r.calories,proteines:parseFloat(r.proteines)||0,glucides:parseFloat(r.glucides)||0,lipides:parseFloat(r.lipides)||0}}
function rowToWater(r){return{id:String(r.id),date:r.date,glasses:r.glasses||0}}

async function loadMeals(){
  const{data,error}=await sb.from('meals').select('*').order('date',{ascending:false}).limit(200);
  if(error){console.error('[DB] loadMeals ERREUR:',error);return}
  mealsLog=(data||[]).map(rowToMeal)
}
async function insertMeal(m){
  const{data,error}=await sb.from('meals').insert({date:m.date,moment:m.moment,description:m.description,calories:m.calories,proteines:m.proteines,glucides:m.glucides,lipides:m.lipides}).select();
  if(error){console.error('[DB] insertMeal ERREUR:',error);toast('Erreur ajout repas — '+error.message);return null}
  if(data&&data[0])m.id=String(data[0].id);return m
}
async function deleteMealDB(id){
  const{error}=await sb.from('meals').delete().eq('id',id);
  if(error)console.error('[DB] deleteMeal ERREUR:',error)
}
async function loadWaterLog(){
  const{data,error}=await sb.from('water_log').select('*').order('date',{ascending:false}).limit(30);
  if(error){console.error('[DB] loadWaterLog ERREUR:',error);return}
  waterLog=(data||[]).map(rowToWater)
}
async function upsertWater(date,glasses){
  const{data,error}=await sb.from('water_log').upsert({date,glasses},{onConflict:'date'}).select();
  if(error){console.error('[DB] upsertWater ERREUR:',error);return null}
  return data?.[0]||null
}

/* ═══ REPAS FAVORIS (saved_meals) ═══
   SQL Supabase :
   create table saved_meals (id bigserial primary key, name text not null,
     description text, calories int, proteines numeric, glucides numeric,
     lipides numeric, created_at timestamptz default now());
   alter table saved_meals enable row level security;
   create policy "all" on saved_meals for all using (true) with check (true);
*/
let savedMealsLocalOnly=false; /* true si table Supabase indisponible */
function rowToSavedMeal(r){return{id:String(r.id),name:r.name||'',description:r.description||'',calories:r.calories||0,proteines:parseFloat(r.proteines)||0,glucides:parseFloat(r.glucides)||0,lipides:parseFloat(r.lipides)||0}}
function _syncFavLocal(){localStorage.setItem('tf-saved-meals',JSON.stringify(savedMeals))}
async function loadSavedMeals(){
  const{data,error}=await sb.from('saved_meals').select('*').order('created_at',{ascending:false});
  if(error){
    console.warn('[DB] saved_meals indisponible, utilisation localStorage');
    savedMealsLocalOnly=true;
    try{savedMeals=JSON.parse(localStorage.getItem('tf-saved-meals')||'[]')}catch(e){savedMeals=[]}
    return;
  }
  savedMealsLocalOnly=false;
  savedMeals=(data||[]).map(rowToSavedMeal);
}
async function insertSavedMeal(m){
  if(savedMealsLocalOnly){
    const item={id:Date.now().toString(),name:m.name,description:m.description,calories:m.calories,proteines:m.proteines,glucides:m.glucides,lipides:m.lipides};
    savedMeals.unshift(item);_syncFavLocal();return item;
  }
  const{data,error}=await sb.from('saved_meals').insert({name:m.name,description:m.description,calories:m.calories,proteines:m.proteines,glucides:m.glucides,lipides:m.lipides}).select();
  if(error){
    console.warn('[DB] insertSavedMeal erreur, bascule localStorage:',error);
    savedMealsLocalOnly=true;
    const item={id:Date.now().toString(),name:m.name,description:m.description,calories:m.calories,proteines:m.proteines,glucides:m.glucides,lipides:m.lipides};
    savedMeals.unshift(item);_syncFavLocal();return item;
  }
  if(data&&data[0])return rowToSavedMeal(data[0]);
  return null;
}
async function deleteSavedMealDB(id){
  if(!savedMealsLocalOnly){
    const{error}=await sb.from('saved_meals').delete().eq('id',id);
    if(error){
      console.warn('[DB] deleteSavedMealDB erreur:',error);
      toast('Erreur suppression favori — '+error.message);
      return; /* ne pas retirer localement si Supabase a échoué */
    }
  }
  savedMeals=savedMeals.filter(x=>x.id!==id);
  if(savedMealsLocalOnly)_syncFavLocal();
}

async function deleteNoteDB(id){
  console.warn('[DB] deleteNote → id='+id);
  const{data,error}=await sb.from('notes').delete().eq('id',id).select();
  if(error){console.error('[DB] deleteNote ERREUR:',error);toast('Erreur suppression note — '+error.message);return}
  if(!data?.length){
    console.error('[DB] deleteNote ÉCHEC : 0 lignes affectées, id='+id);
    toast('⚠️ Suppression note non sauvegardée');
  } else {
    console.warn('[DB] deleteNote ← OK');
  }
}

/* ═══ CRUD EVENTS CALENDRIER ═══
   SQL Supabase à exécuter dans le dashboard :

   create table events (
     id bigserial primary key,
     title text not null,
     date date not null,
     start_hour int not null default 9,
     duration int not null default 60,
     color text default '#3b82f6',
     created_at timestamptz default now()
   );
   alter table events enable row level security;
   create policy "all" on events for all using (true) with check (true);
*/
function rowToCalEvent(r){return{id:String(r.id),title:r.title||'',date:r.date||'',startHour:r.start_hour||9,duration:r.duration||60,color:r.color||'#3b82f6'}}
async function loadCalEvents(){
  const{data,error}=await sb.from('events').select('*').order('date',{ascending:false}).limit(500);
  if(error){console.error('[DB] loadCalEvents ERREUR:',error);return}
  calEvents=(data||[]).map(rowToCalEvent)
}
async function insertCalEvent(ev){
  const{data,error}=await sb.from('events').insert({title:ev.title,date:ev.date,start_hour:ev.startHour,duration:ev.duration,color:ev.color||'#3b82f6'}).select();
  if(error){console.error('[DB] insertCalEvent ERREUR:',error);toast('Erreur création événement — '+error.message);return null}
  if(data&&data[0])ev.id=String(data[0].id);return ev
}
async function deleteCalEventDB(id){
  const{error}=await sb.from('events').delete().eq('id',id);
  if(error){console.error('[DB] deleteCalEvent ERREUR:',error);toast('Erreur suppression événement — '+error.message)}
}
