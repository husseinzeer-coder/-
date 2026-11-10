/* مساحة عمل واحدة: تبويبات داخل التطبيق مع حفظ محلي مستقل. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const META='fatima-hoffaz:workspace-tabs-v1',LAST='fatima-hoffaz:workspace-last-v1',MAX=5;
 const panes={meeting:$('meetingPane'),single12:$('singlePane')};
 let tabs=[],activeId=null;
 const safeGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
 const saveMeta=()=>{try{localStorage.setItem(META,JSON.stringify(tabs));if(activeId)localStorage.setItem(LAST,activeId)}catch(e){warn('تعذر الحفظ المحلي، تحقق من مساحة المتصفح.')}};
 const warn=t=>{$('workspaceWarning').textContent=t};
 const newId=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 function initData(){
  try{const saved=JSON.parse(safeGet(META)||'null');if(Array.isArray(saved))tabs=saved.filter(t=>t&&typeof t.id==='string'&&['meeting','single12'].includes(t.type)&&typeof t.name==='string').slice(0,MAX).map(t=>({id:t.id,type:t.type,name:t.name.slice(0,45),legacy:!!t.legacy}));}catch(e){}
  if(!tabs.length){
   const oldMeeting=safeGet('fatima-hoffaz:meeting-v2');
   const oldMem=safeGet('fatima-hoffaz-v3:single12:lastDate')||safeGet('fatima-hoffaz:v3:names:single12');
   if(oldMeeting)tabs.push({id:'legacy-meeting',type:'meeting',name:'تقرير اللقاء السابق',legacy:true});
   if(oldMem)tabs.push({id:'legacy-single12',type:'single12',name:'تقرير التسميع السابق',legacy:true});
  }
 }
 function refreshTabs(){
  const box=$('workspaceTabs');box.replaceChildren();
  tabs.forEach(tab=>{
   const shell=document.createElement('div');shell.className='workspace-tab'+(tab.id===activeId?' active':'');shell.setAttribute('role','presentation');
   const select=document.createElement('button');select.type='button';select.textContent=tab.name;select.title='فتح التقرير — انقر مرتين لإعادة التسمية';select.setAttribute('role','tab');select.setAttribute('aria-selected',String(tab.id===activeId));select.addEventListener('click',()=>activate(tab.id));
   select.addEventListener('dblclick',()=>rename(tab.id));
   const close=document.createElement('button');close.type='button';close.className='tab-close';close.textContent='×';close.title='حذف التقرير';close.setAttribute('aria-label','حذف '+tab.name);close.addEventListener('click',()=>remove(tab.id));
   shell.append(select,close);box.append(shell);
  });
  $('addWorkspaceTab').disabled=tabs.length>=MAX;
  $('addWorkspaceTab').title=tabs.length>=MAX?'الحد الأقصى خمسة تقارير':'إضافة تقرير مستقل';
 }
 function activate(id){
  const tab=tabs.find(t=>t.id===id);if(!tab)return;
  activeId=id;
  Object.entries(panes).forEach(([type,el])=>el.hidden=type!==tab.type);
  if(tab.type==='meeting')window.MeetingController.activate(tab.legacy?'legacy-meeting':tab.id);
  else window.MemorizationController.activate(tab.legacy?'legacy-single12':tab.id,tab.legacy);
  saveMeta();refreshTabs();
  document.title=tab.name+' — إدارة تقارير الحفاظ';
 }
 function chooser(defaultType='meeting'){
  if(tabs.length>=MAX){warn('الحد الأقصى خمسة تقارير. احذف تقريرًا قبل الإضافة.');return;}
  $('workspaceChooser').hidden=false;
  $('workspaceType').value=defaultType;
  $('workspaceName').value='';
  $('chooserTitle').textContent=tabs.length?'إضافة تقرير جديد':'اختر نوع التقرير الأول';
  warn('');
  $('workspaceName').focus();
 }
 function add(){
  if(tabs.length>=MAX)return warn('لا يمكن تجاوز خمسة تقارير');
  const type=$('workspaceType').value;
  if(!['meeting','single12'].includes(type))return;
  const name=$('workspaceName').value.trim().slice(0,45)||(type==='meeting'?'تقرير اللقاء':'إنجاز التسميع');
  const tab={id:newId(),type,name,legacy:false};
  tabs.push(tab);$('workspaceChooser').hidden=true;activate(tab.id);
 }
 function rename(id){
  const tab=tabs.find(t=>t.id===id);if(!tab)return;
  const v=prompt('اسم التبويب الجديد:',tab.name);
  if(v===null)return;
  if(v.trim()){tab.name=v.trim().slice(0,45);saveMeta();refreshTabs();if(activeId===id)document.title=tab.name+' — إدارة تقارير الحفاظ'}
 }
 function clearTabStorage(tab){
  try{
   const keys=[];
   for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(tab.type==='meeting'&&k===(tab.legacy?'fatima-hoffaz:meeting-v2':'fatima-hoffaz:workspace:meeting:'+tab.id))keys.push(k);
    if(tab.type==='single12'){
     const prefix='fatima-hoffaz-v3:single12'+(tab.legacy?'':':'+tab.id)+':';
     if(k.startsWith(prefix)||k==='fatima-hoffaz:v3:names:single12'+(tab.legacy?'':':'+tab.id))keys.push(k);
    }
   }
   keys.forEach(k=>localStorage.removeItem(k));
  }catch(e){warn('تعذر حذف كل البيانات من التخزين المحلي')}
 }
 function remove(id){
  const tab=tabs.find(t=>t.id===id);if(!tab)return;
  if(!confirm('حذف تقرير «'+tab.name+'» مع بياناته المحفوظة على هذا الجهاز؟ لا يمكن التراجع عن الحذف.'))return;
  clearTabStorage(tab);tabs=tabs.filter(t=>t.id!==id);
  if(activeId===id){
   activeId=null;
   if(tabs.length)activate(tabs[0].id);
   else {Object.values(panes).forEach(p=>p.hidden=true);$('workspaceChooser').hidden=false;chooser();}
  }else{saveMeta();refreshTabs();}
 }
 function exportBackup(){
  const data={version:1,tabs,last:activeId,storage:{}};
  try{
   for(const t of tabs){
    const prefix=t.type==='meeting'?(t.legacy?'fatima-hoffaz:meeting-v2':'fatima-hoffaz:workspace:meeting:'+t.id):'fatima-hoffaz-v3:single12'+(t.legacy?'':':'+t.id)+':';
    for(let i=0;i<localStorage.length;i++){
     const k=localStorage.key(i);
     if(k===prefix||t.type==='single12'&&(k.startsWith(prefix)||k==='fatima-hoffaz:v3:names:single12'+(t.legacy?'':':'+t.id)))data.storage[k]=localStorage.getItem(k);
    }
   }
   const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='نسخة-احتياطية-تقارير-الحفاظ.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }catch(e){alert('تعذر إنشاء النسخة الاحتياطية')}
 }
 async function importBackup(file){
  if(!file)return;
  try{
   if(file.size>6*1024*1024)throw Error('الملف أكبر من الحد المسموح');
   const data=JSON.parse(await file.text());
   if(data.version!==1||!Array.isArray(data.tabs)||!data.storage||typeof data.storage!=='object')throw Error('صيغة النسخة الاحتياطية غير صحيحة');
   if(data.tabs.length>MAX)throw Error('النسخة تحتوي على أكثر من خمسة تقارير');
   const valid=data.tabs.every(t=>t&&typeof t.id==='string'&&typeof t.name==='string'&&['meeting','single12'].includes(t.type)&&t.id.length<140);
   if(!valid)throw Error('بيانات تبويبات غير صالحة');
   if(!confirm('استعادة النسخة الاحتياطية ستستبدل قائمة التقارير الحالية. يفضل تصدير نسخة أولًا. هل تريد المتابعة؟'))return;
   const previous=[...tabs];previous.forEach(clearTabStorage);
   for(const [k,v] of Object.entries(data.storage)){if(typeof v!=='string'||!k.startsWith('fatima-hoffaz'))continue;localStorage.setItem(k,v)}
   tabs=data.tabs.map(t=>({id:t.id,type:t.type,name:t.name.slice(0,45),legacy:!!t.legacy}));
   activeId=null;
   if(tabs.length)activate(tabs.some(t=>t.id===data.last)?data.last:tabs[0].id);else chooser();
   saveMeta();refreshTabs();
  }catch(e){alert('تعذر الاستعادة: '+e.message)}
 }
 function backupButtons(){
  const exp=document.createElement('button');exp.type='button';exp.className='workspace-add';exp.textContent='نسخة احتياطية';exp.title='تنزيل بيانات التقارير إلى ملف JSON';exp.addEventListener('click',exportBackup);
  const imp=document.createElement('button');imp.type='button';imp.className='workspace-add';imp.textContent='استعادة';imp.title='استعادة تقارير محفوظة من ملف JSON';
  const file=document.createElement('input');file.type='file';file.accept='.json,application/json';file.hidden=true;
  imp.addEventListener('click',()=>file.click());file.addEventListener('change',async()=>{await importBackup(file.files?.[0]);file.value=''});
  $('addWorkspaceTab').after(exp,imp,file);
 }
 $('addWorkspaceTab').addEventListener('click',()=>chooser(activeId&&tabs.find(t=>t.id===activeId)?.type||'meeting'));
 $('confirmWorkspace').addEventListener('click',add);
 $('cancelWorkspace').addEventListener('click',()=>{if(tabs.length)$('workspaceChooser').hidden=true});
 $('workspaceName').addEventListener('keydown',e=>{if(e.key==='Enter')add()});
 backupButtons();
 initData();
 // توافق روابط التقارير القديمة التي كانت تفتح في صفحة meeting.html منفصلة.
 const oldReportId=new URLSearchParams(location.search).get('report');
 if(oldReportId&&/^[a-zA-Z0-9-]{1,120}$/.test(oldReportId)){
   const existing=safeGet('fatima-hoffaz:meeting-v2:'+oldReportId);
   if(existing&&!tabs.some(t=>t.id===oldReportId)&&tabs.length<MAX){
     try{localStorage.setItem('fatima-hoffaz:workspace:meeting:'+oldReportId,existing)}catch(e){}
     tabs.push({id:oldReportId,type:'meeting',name:'تقرير لقاء مستعاد',legacy:false});
     saveMeta();
   }
 }
 const desired=new URLSearchParams(location.search).get('view');
 const last=safeGet(LAST);
 if(tabs.length){
  const wanted=(oldReportId&&tabs.some(t=>t.id===oldReportId)?oldReportId:null)||(desired==='meeting'?tabs.find(t=>t.type==='meeting')?.id:last);
  activate(tabs.some(t=>t.id===wanted)?wanted:tabs[0].id);
 }else{
  Object.values(panes).forEach(p=>p.hidden=true);
  chooser(desired==='single12'?'single12':'meeting');
 }
 refreshTabs();
})();