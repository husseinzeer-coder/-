
(()=>{'use strict';
const $=id=>document.getElementById('m-'+id),canvas=$('report'),ctx=canvas.getContext('2d');
let storageKey='fatima-hoffaz:meeting-v2';const MAX=25;
const img=new Image();img.src='./meeting-background.png';
const defaults=()=>({title:'تقرير اللقاء',day:'',date:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Amman'}),label1:'عنوان الدرس',value1:'',label2:'التسميع',value2:'',label3:'التلقين',value3:'',headSurah:'السورة',headVerses:'الآيات',headNotes:'الملاحظات',logo:null,students:[]});
let state=defaults(),logoImg=null,painting=0;
const DAY_FIELDS=['surah','verses','notes','discipline','award','awardColor','absent'];
const DAILY_TOP=['value1','value2','value3'];
function snapshotDay(date=state.date){if(!date)return;state.days??={};state.days[date]={fields:Object.fromEntries(DAILY_TOP.map(k=>[k,state[k]])),students:state.students.map(st=>Object.fromEntries(DAY_FIELDS.map(k=>[k,st[k]])))};}
function loadDay(date){const saved=state.days?.[date];for(const k of DAILY_TOP)state[k]=saved?.fields?.[k]??'';state.students=state.students.map((st,i)=>{const daily=saved?.students?.[i];return {...st,...Object.fromEntries(DAY_FIELDS.map(k=>[k,daily?.[k]??blank()[k]]))}});for(const k of DAILY_TOP)$(k).value=field(k)}
const blank=()=>({name:'-',surah:'',verses:'',notes:'',discipline:'good',award:'',awardColor:'#1761b9',absent:false});
function message(s){$('message').textContent=s}
function save(){snapshotDay();try{localStorage.setItem(storageKey,JSON.stringify(state))}catch(e){message('المساحة المحلية ممتلئة؛ قد لا تُحفظ الصورة أو البيانات.')}}
function field(name){return String(state[name]||'')}
const topIds=['title','day','date','label1','value1','label2','value2','label3','value3','headSurah','headVerses','headNotes'];
for(const id of topIds){$(id).value=field(id);$(id).addEventListener('input',()=>{if(id==='date'){snapshotDay();state.date=$(id).value;save();render();message('تم تحديث تاريخ التقرير دون حذف أي من البيانات المكتوبة.');return;}state[id]=$(id).value;save();render()})}
function count(){const filled=state.students.filter(s=>s.name.trim()&&s.name.trim()!=='-').length;$('counter').textContent=`(${filled} ظاهر / ${state.students.length} مضاف / 25 حد أقصى)`;$('addStudent').disabled=state.students.length>=MAX}
function node(tag,cls='',value){const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x}
function input(s,key,placeholder){const x=node('input');x.type='text';x.placeholder=placeholder;x.value=s[key]||'';x.setAttribute('aria-label',placeholder);x.addEventListener('input',()=>{s[key]=x.value;save();count();render()});return x}
function buildRows(){const parent=$('rows');parent.replaceChildren();state.students.forEach((s,i)=>{const row=node('div','editing'+(s.absent?' absent':''));row.append(node('span','num',String(i+1)));
 const name=input(s,'name','اسم الطالب');const surah=input(s,'surah','السورة');const verses=input(s,'verses','الآيات');const notes=input(s,'notes','الملاحظات');
 const dis=node('select');[['good','منضبط'],['bad','غير منضبط']].forEach(([v,t])=>{const o=new Option(t,v);dis.add(o)});dis.value=s.discipline;dis.addEventListener('change',()=>{s.discipline=dis.value;save();render()});
 const prize=node('div','prize');const prizeText=input(s,'award','الجائزة');const color=node('input');color.type='color';color.value=/^#[0-9a-f]{6}$/i.test(s.awardColor)?s.awardColor:'#1761b9';color.title='لون خانة الجائزة';color.addEventListener('input',()=>{s.awardColor=color.value;save();render()});prize.append(prizeText,color);
 const absent=node('label','gone');const cb=node('input');cb.type='checkbox';cb.checked=!!s.absent;cb.addEventListener('change',()=>{s.absent=cb.checked;row.classList.toggle('absent',s.absent);[surah,verses,notes,dis,prizeText,color].forEach(el=>el.disabled=s.absent);save();render()});absent.append(cb,document.createTextNode('غائب'));
 const del=node('button','remove','حذف');del.type='button';del.addEventListener('click',()=>{Object.values(state.days||{}).forEach(day=>{if(Array.isArray(day.students))day.students.splice(i,1)});state.students.splice(i,1);save();buildRows();render()});
 [surah,verses,notes,dis,prizeText,color].forEach(el=>el.disabled=!!s.absent);
 row.append(name,surah,verses,notes,dis,prize,absent,del);parent.append(row)});count()}
$('addStudent').addEventListener('click',()=>{if(state.students.length>=MAX)return;state.students.push(blank());save();buildRows();render();const inputs=$('rows').querySelectorAll('.editing');inputs[inputs.length-1]?.querySelector('input')?.focus()});
$('reset').addEventListener('click',()=>{
 if(!confirm('تفريغ بيانات يوم '+(state.date||'اليوم')+' فقط؟ ستبقى أسماء الطلاب والشعار وعناوين الخانات وبيانات الأيام الأخرى محفوظة.'))return;
 for(const k of DAILY_TOP){state[k]='';$(k).value=''}
 state.students=state.students.map(st=>({...st,...Object.fromEntries(DAY_FIELDS.map(k=>[k,blank()[k]]))}));
 save();buildRows();render();message('تم تفريغ بيانات اليوم الحالي فقط مع الاحتفاظ بكشف الأسماء والأيام الأخرى.');
});
$('nameList').addEventListener('paste',()=>{setTimeout(()=>{if($('nameList').value.trim())$('importNames').click()},0)});
$('importNames').addEventListener('click',()=>{
 const names=$('nameList').value.split(/\r?\n/).map(n=>n.trim()).filter(n=>n&&n!=='-');
 if(!names.length){message('الصق اسمًا واحدًا على الأقل، وكل اسم في سطر مستقل.');return;}
 if(names.length>MAX){message('الحد الأقصى 25 طالبًا. القائمة تتضمن '+names.length+' اسمًا، ولم تُعدّل البيانات.');return;}
 const hasExisting=state.students.some(st=>st.name.trim()&&st.name.trim()!=='-');
 if(hasExisting&&!confirm('سيُستبدل كشف الأسماء الحالي ('+state.students.length+' صفًا) بالكشف الجديد، وستُفرغ بيانات الطلاب المرتبطة بالأسماء السابقة في جميع الأيام. هل تريد المتابعة؟'))return;
 state.students=names.map(name=>({...blank(),name}));state.days={};
 for(const k of DAILY_TOP){state[k]='';$(k).value=''}
 save();buildRows();render();$('nameList').value='';
 message('تم إدراج '+names.length+' طالبًا تلقائيًا من كشف الأسماء.');
});
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function text(t,x,y,max,font=24,color='#0d3542',weight='700',align='center'){t=String(t??'');ctx.save();ctx.direction='rtl';ctx.font=`${weight} ${font}px Tahoma, Arial, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='middle';let n=font;while(ctx.measureText(t).width>max&&n>10){n--;ctx.font=`${weight} ${n}px Tahoma, Arial, sans-serif`;}ctx.fillText(t,x,y,max);ctx.restore()}
function rounded(x,y,w,h,r,fill,stroke,line=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke()}}
async function loadLogo(data){if(!data)return null;return await new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=data})}
function logoCrop(im){if(!im)return;const cx=113,cy=166,rad=77;ctx.save();ctx.beginPath();ctx.arc(cx,cy,rad,0,2*Math.PI);ctx.clip();const scale=Math.max(rad*2/im.width,rad*2/im.height),w=im.width*scale,h=im.height*scale;ctx.drawImage(im,cx-w/2,cy-h/2,w,h);ctx.restore()}
function drawHeading(){ctx.fillStyle='#0d3542';text(state.title||'تقرير اللقاء',443,153,410,53,'#0c3440','900','center');
 const d=state.date?state.date.split('-').reverse().join('/'):'';
 text(state.day||'اليوم',804,133,155,24,'#0d3542','700','center');text(d,804,181,177,22,'#0d3542','700','center');
 // إحداثيات مستقلة لكل بطاقة: نقل النص فقط دون تحريك الخلفية الفنية.
 const infos=[
   {x:595,w:298,k:'label1',v:'value1',dx:-20,dy:-15,titleX:704,titleY:352,titleWidth:212,titleSize:22},
   {x:310,w:262,k:'label2',v:'value2',dx:-15,dy:-12,titleX:365,titleY:312,titleWidth:125,titleSize:20},
   {x:31,w:261,k:'label3',v:'value3',dx:-15,dy:-8,titleX:135,titleY:312,titleWidth:130,titleSize:20}
 ];
 // إحداثيات العناوين مأخوذة من مراكز الشرائط الزرقاء وليس من مراكز البطاقات البيضاء.
 // كما يُقيَّد عرض النص بعرض الشريط حتى لا يخرج إلى الإطار البرتقالي.
 infos.forEach(({x,w,k,v,dx,dy,titleX,titleY,titleWidth,titleSize})=>{
   text(state[k],titleX,titleY,titleWidth,titleSize,'#ffffff','700','center');
   text(state[v],x+w/2+dx,359+dy,w-22,24,'#0e3542');
 });
 logoCrop(logoImg)
}
function drawTable(){
 const students=state.students.filter(s=>s.name.trim()&&s.name.trim()!=='-').slice(0,MAX);
 const n=students.length;
 const right=911,top=463,bottom=1496, gap=6, headerH=51,headerGap=10;
 const widths=[48,200,105,90,200,103,98];
 const labels=['الرقم','الاسم',state.headSurah||'السورة',state.headVerses||'الآيات',state.headNotes||'الملاحظات','الانضباط','الجائزة'];
 const positions=[];let pos=right;
 for(const w of widths){pos-=w;positions.push(pos);pos-=gap}
 const drawCell=(x,y,w,h,fill,stroke='#E4BA83',r=7)=>{
   rounded(x,y,w,h,Math.min(r,h/4),fill,stroke,1.05);
 };
 for(let j=0;j<7;j++){
   drawCell(positions[j],top,widths[j],headerH,'#F7AD5D','#E88720',8);
   text(labels[j],positions[j]+widths[j]/2,top+headerH/2,widths[j]-10,20,'#153746','800','center');
 }
 const startY=top+headerH+headerGap;
 const usable=bottom-startY;
 const rowGap=n>20?4:n>14?7:12;
 const rowH=n?Math.min(83,(usable-(n-1)*rowGap)/n):0;
 for(let i=0;i<n;i++){
   const st=students[i],y=startY+i*(rowH+rowGap),mid=y+rowH/2;
   const background=i%2===0?'#FFFBF4':'#FFF4E6';
   drawCell(positions[0],y,widths[0],rowH,'#FCE6CD','#E6B383');
   text(i+1,positions[0]+widths[0]/2,mid,widths[0]-8,19,'#133944','700');
   if(st.absent){
     // يبقى الاسم ظاهرًا، وتندمج فقط خانات السورة والآيات والملاحظات والانضباط والجائزة.
     drawCell(positions[1],y,widths[1],rowH,'#F6E6C7');
     text(st.name,positions[1]+widths[1]/2,mid,widths[1]-10,Math.min(22,Math.max(14,rowH*.55)),'#143B46','700');
     const left=positions[6],mergedRight=positions[2]+widths[2],w=mergedRight-left;
     drawCell(left,y,w,rowH,'#F9D8D3','#DD9A95');
     text('غائب',left+w/2,mid,w-20,Math.min(30,Math.max(19,rowH*.55)),'#A52E2D','800');
     continue;
   }
   const values=[st.name,st.surah,st.verses,st.notes,st.discipline==='bad'?'غير منضبط':'منضبط',st.award];
   for(let j=1;j<7;j++){
     let fill=background,fg='#143B46',size=j===1?22:19;
     if(j===1){fill='#F6E6C7';size=22}
     if(j===5){fill=st.discipline==='bad'?'#F3C4C1':'#BFDFC6';fg=st.discipline==='bad'?'#9D2928':'#185B37';size=17}
     if(j===6&&st.award.trim()){fill=st.awardColor||'#1761b9';fg='#FFFFFF'}
     drawCell(positions[j],y,widths[j],rowH,fill);
     const value=String(values[j-1]||'');
     if(j===4&&value.length>23&&rowH>42){
       const words=value.split(/\s+/),half=Math.ceil(words.length/2);
       text(words.slice(0,half).join(' '),positions[j]+widths[j]/2,mid-9,widths[j]-10,15,fg);
       text(words.slice(half).join(' '),positions[j]+widths[j]/2,mid+9,widths[j]-10,15,fg);
     }else text(value,positions[j]+widths[j]/2,mid,widths[j]-10,Math.min(size,Math.max(13,rowH*.55)),fg,j===1?'700':'600');
   }
 }
 if(!n)text('أدخل أسماء الطلاب لتظهر خاناتهم هنا',471,650,720,29,'#728982','600');
}
function render(){const version=++painting;ctx.clearRect(0,0,941,1672);if(img.complete&&img.naturalWidth)ctx.drawImage(img,0,0,941,1672);else{ctx.fillStyle='#fff9f0';ctx.fillRect(0,0,941,1672)}drawHeading();drawTable()}
img.onload=render;img.onerror=()=>message('تعذر تحميل خلفية التقرير. تأكد من وجود meeting-background.png');
async function setLogo(data){state.logo=data;logoImg=await loadLogo(data);$('logoPreview').src=data||'';if(!data)$('logoPreview').removeAttribute('src');save();render()}
$('logoFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>8*1024*1024){message('اختر شعارًا أقل من 8 ميغابايت');return}const reader=new FileReader();reader.onload=async()=>{const im=await loadLogo(reader.result);if(!im){message('تعذر قراءة الصورة');return}const c=document.createElement('canvas');c.width=c.height=360;const q=c.getContext('2d');const sc=Math.max(360/im.width,360/im.height);q.drawImage(im,(360-im.width*sc)/2,(360-im.height*sc)/2,im.width*sc,im.height*sc);await setLogo(c.toDataURL('image/jpeg',.86));message('تمت إضافة الشعار وقصه ليتناسب مع الدائرة.')};reader.readAsDataURL(file)});
$('removeLogo').addEventListener('click',()=>{$('logoFile').value='';setLogo(null)});
function blob(){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('فشل إنشاء PNG')),'image/png'))}
function filename(){return 'تقرير-اللقاء-'+(state.date||'بدون-تاريخ')+'.png'}
function downloadFile(b){const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=filename();document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)}
$('download').addEventListener('click',async()=>{try{if(!img.complete||!img.naturalWidth)throw Error('الخلفية لم تُحمّل بعد');render();downloadFile(await blob());message('تم تجهيز صورة PNG.')}catch(e){message(e.message)}});
$('share').addEventListener('click',async()=>{try{render();const b=await blob(),file=new File([b],filename(),{type:'image/png'});if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'تقرير اللقاء'});else downloadFile(b)}catch(e){if(e.name!=='AbortError')message(e.message)}});
$('print').addEventListener('click',async()=>{render();window.print()});
async function activate(tabId){
 storageKey=tabId==='legacy-meeting'?'fatima-hoffaz:meeting-v2':'fatima-hoffaz:workspace:meeting:'+tabId;
 state=defaults();logoImg=null;
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&typeof saved==='object')state={...state,...saved,students:Array.isArray(saved.students)?saved.students.slice(0,MAX).map(st=>({...blank(),...st})):[]}}catch(e){}
 if(!state.students.length)state.students=Array.from({length:12},()=>blank());
 if(!state.days||typeof state.days!=='object'){state.days={};snapshotDay()}
 loadDay(state.date);
 topIds.forEach(id=>$(id).value=field(id));
 $('logoFile').value='';$('logoPreview').removeAttribute('src');
 buildRows();render();
 if(state.logo){const forKey=storageKey;const im=await loadLogo(state.logo);if(storageKey!==forKey)return;logoImg=im;if(im)$('logoPreview').src=state.logo;render()}
}
window.MeetingController={activate};
})();
