/* قوالب فارغة من أسماء الطلاب: تُكتب الأسماء من واجهة المستخدم فقط. */
window.REPORT_TEMPLATES={
  classic:{
    id:'classic',title:'القالب الأول — مجموعتان',image:'./bakgrounds/background.png',
    width:1620,height:971,editableNames:true,
    groups:[
      {id:'group-1',title:'المجموعة الأولى',students:Array.from({length:6},(_,i)=>({id:'group-1-'+(i+1),name:'-',aliases:[]}))},
      {id:'group-2',title:'المجموعة الثانية',students:Array.from({length:6},(_,i)=>({id:'group-2-'+(i+1),name:'-',aliases:[]}))}
    ]
  },
  single12:{
    id:'single12',title:'القالب الثاني — مجموعة 12 طالبًا',image:'./bakgrounds/background-12.png',
    width:941,height:1672,editableNames:true,
    groups:[{id:'single',title:'المجموعة',students:Array.from({length:12},(_,i)=>({id:'single-'+(i+1),name:'-',aliases:[]}))}]
  }
};