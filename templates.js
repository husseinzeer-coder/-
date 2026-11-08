/* إضافة قالب جديد تكون هنا، دون إنشاء صفحة JavaScript جديدة لكل قالب. */
window.REPORT_TEMPLATES = {
  single12: {
    id:'single12', title:'القالب الثاني — مجموعة 12 طالبًا', image:'./background-12.png',
    width:941, height:1672, editableNames:true,
    groups:[{id:'single',title:'المجموعة',students:Array.from({length:12},(_,i)=>({id:'single-'+(i+1),name:'-',aliases:[]}))}]
  }
};
