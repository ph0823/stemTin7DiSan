/**
 * STEM Tin 7 - Hành trình di sản số: Google Apps Script backend.
 * Install as standalone Apps Script, run setup() once, deploy Web app
 * Execute as: Me; Who has access: Anyone.
 * JSON payload posted as HTML form to hidden iframe (cross-origin compatible).
 *
 * IMPORTANT: 4-character access codes are convenient, not high-security identity.
 * Never store personal sensitive data. Change the default teacher password.
 */
var APP_VERSION = 5;
function stemProgress_(d){
 if(!d||!d.sites||!['nga','cu','giong'].every(function(k){return d.sites[k]&&typeof d.sites[k]==='object'}))return null;
 var ids=['nga','cu','giong'],names=['Ngã Ba Giồng','Địa đạo Củ Chi','Giồng Cá Vồ'],m=d.mapAnswers||{},c=d.checks||{},sn=d.snapshots||{},a=sn.before,b=sn.after;
 function t(x){return String(x||'').trim()}
 function words(x){return t(x)?t(x).split(/\s+/).length:0}
 function order(x){return typeof x==='string'&&x.split(',').sort().join(',')==='cu,giong,nga'}
 function ok(x){return !!(x&&x.sites&&ids.every(function(k){return x.sites[k]&&typeof x.sites[k]==='object'}))}
 function task(id,passed,label,hint){return {id:id,ok:!!passed,label:label,hint:hint||label}}
 var diff=ok(a)&&ok(b)&&(ids.some(function(k){var x=a.sites[k],y=b.sites[k];return ['desc','source','image','imageSource','license','cardStyle'].some(function(f){return t(x[f])!==t(y[f])})})||['order','mode','reason','sketch','message','compareText','estimate'].some(function(f){return t(a[f])!==t(b[f])}));
 var cards=ids.map(function(k,i){var x=d.sites[k],w=words(x.desc),source=!!t(x.source),missing=[];if(w<25)missing.push('viết thêm '+(25-w)+' từ');if(!source)missing.push('ghi nguồn');return task(k,w>=25&&source,names[i],names[i]+': '+missing.join(', '))});
 var comparison=order(d.order)&&order(d.compareOrder)&&d.order!==d.compareOrder&&t(d.compareText).length>=8;
 var reason=t(d.reason).length>=12,message=t(d.message).length>=12;
 var checked=['peer0','peer1','peer2','0','1','2','3','4','5'].some(function(k){return c[k]===true});
 var groups=[
 [task('map',m.prediction==='giong'&&m.line==='order','Trả lời đúng hai câu hỏi bản đồ',m.prediction!=='giong'?'Trả lời câu 1 về vị trí di tích':'Trả lời câu 2 về đường nét đứt')].concat(cards),
 [task('compare',comparison,'So sánh hai phương án A/B',!order(d.order)||!order(d.compareOrder)||d.order===d.compareOrder?'Chọn hai thứ tự khác nhau':'Viết câu so sánh hai phương án (ít nhất 8 ký tự)'),task('reason',reason,'Giải thích lí do lựa chọn','Viết lí do chọn hành trình (ít nhất 12 ký tự)'),task('message',message,'Viết thông điệp bảo tồn','Viết thông điệp bảo tồn (ít nhất 12 ký tự)')],
 [task('before',ok(a),'Lưu bài trước khi sửa'),task('issues',t(d.issues).length>=5,'Ghi góp ý đã nhận','Ghi góp ý đã nhận (ít nhất 5 ký tự)'),task('check',checked,'Đánh dấu tiêu chí kiểm thử','Đánh dấu ít nhất một tiêu chí đã kiểm tra'),task('after',ok(a)&&ok(b)&&diff&&t(d.fix).length>=5,'Cải tiến và lưu bài sau khi sửa',!ok(a)?'Lưu bài trước khi sửa':!ok(b)?'Sửa sản phẩm, ghi phần đã sửa và lưu bài sau khi sửa':!diff?'Hai bản giống nhau: sửa ít nhất một nội dung rồi lưu bản sau': 'Ghi phần đã sửa (ít nhất 5 ký tự)')],
 [task('self',!!t(d.selfAssessment),'Tự đánh giá sản phẩm','Chọn mức tự đánh giá sản phẩm'),task('report',cards.every(function(x){return x.ok})&&order(d.order)&&reason&&t(d.fix).length>=5,'Chuẩn bị nội dung báo cáo','Chuẩn bị đủ ba thẻ, lí do chọn hành trình và điều đã sửa')]
 ];
 var stages=groups.map(function(x){return {done:x.filter(function(v){return v.ok}).length,total:x.length,items:x}});
 var done=stages.reduce(function(n,x){return n+x.done},0),total=stages.reduce(function(n,x){return n+x.total},0);
 var started=done>0||ids.some(function(k){var x=d.sites[k];return ['desc','source','image','imageSource','license'].some(function(f){return !!t(x[f])})||(d.visited||{})[k]===true})||!!(m.prediction||m.line)||['reason','compareText','message','sketch','tester','issues','fix','recheck','selfAssessment'].some(function(f){return !!t(d[f])})||Object.keys(c).some(function(k){return c[k]===true})||ok(a)||ok(b);
 return {version:2,done:done,total:total,percent:Math.round(done*100/total),stages:stages,started:started};
}
var RUBRIC_VERSION='KHBD-2026-11-25',RUBRIC_NAME='Danh_gia_STEM7',RUBRIC_COLS=['groupId','klass','group','assessmentJSON'];
function rubricTotal_(x){if(!Array.isArray(x)||x.length!==6)return null;var n=0;for(var i=0;i<6;i++){var v=x[i];if(typeof v!=='number'||!isFinite(v)||v<0||v>(i<4?2:1)||(i<4?v%1!==0:v*2%1!==0))return null;n+=v}return n}
/* V5: append-only assessment history; existing V4 rows remain valid drafts. */
function rubricStatus_(a){return a&&['draft','revision','final'].indexOf(a.status)>=0?a.status:'draft'}
function rubricIndex_(ss){
  var sh=ss.getSheetByName(RUBRIC_NAME),out=Object.create(null);
  if(sh&&sh.getLastRow()>1)sh.getRange(2,1,sh.getLastRow()-1,4).getValues().forEach(function(r,i){
    try{
      var a=JSON.parse(String(r[3])),total=rubricTotal_(a.scores);
      if(a.version!==RUBRIC_VERSION||total===null)return;
      a.total=total;a.status=rubricStatus_(a);
      var id=String(r[0]),item=out[id]||(out[id]={history:[],published:null,assessment:null});
      item.history.push(a);
      if(!item.assessment||Number(a.revision)>=Number(item.assessment.revision)){item.row=i+2;item.assessment=a}
      if(a.status!=='draft'&&(!item.published||Number(a.revision)>=Number(item.published.revision)))item.published=a;
    }catch(e){}
  });
  Object.keys(out).forEach(function(id){out[id].history.sort(function(a,b){return Number(b.revision)-Number(a.revision)})});
  return out;
}
function studentAssessment_(ss,v){
  var item=rubricIndex_(ss)[String(v[0])],a=item&&item.published;
  if(!a)return null;
  return {version:a.version,scores:a.scores.slice(),total:a.total,note:a.note||'',status:a.status,sourceRevision:a.sourceRevision,revision:a.revision,updatedAt:a.updatedAt,changedSince:Number(v[10]||0)!==Number(a.sourceRevision)};
}
function teacherRecord_(v,full,index){
  var out=publicRecord_(v,full);
  try{out.progress=stemProgress_(JSON.parse(String(v[4]||'{}')))}catch(e){out.progress=null}
  var item=index[String(v[0])];out.rubric=item?item.assessment:null;
  if(full){out.rubricHistory=item?item.history.slice(0,50):[];out.rubricHistoryCount=item?item.history.length:0}
  return out;
}
var SHEET_NAME = 'Nhom_STEM7';
var AUDIT_NAME = 'Lich_su_chinh_sua';
var FEEDBACK_NAME = 'Gop_y_cheo_STEM7';
var DELETED_NAME = 'Bai_da_xoa_STEM7';
var FEEDBACK_COLS = ['id','klass','targetGroup','authorGroup','role','checks','comment','status','createdAt','moderatedAt'];
var COLS = ['id','klass','group','accessHash','payload','createdAt','firstAt','lastAt','updatedAt','seconds','revision','teacherEditedAt','teacherNote','lastEditor','codeVersion','studentEditedAt','createRequestHash'];
var PIN_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
var MAX_JSON_LENGTH = 35000;
function setup(){
  var p=PropertiesService.getScriptProperties();
  var ssid=p.getProperty('STEM_SPREADSHEET_ID');
  var ss=ssid?SpreadsheetApp.openById(ssid):SpreadsheetApp.create('STEM7 - Hành trình di sản số');
  p.setProperty('STEM_SPREADSHEET_ID',ss.getId());
  if(!p.getProperty('STEM_PEPPER'))p.setProperty('STEM_PEPPER',Utilities.getUuid()+Utilities.getUuid());
  if(!p.getProperty('STEM_TEACHER_HASH'))p.setProperty('STEM_TEACHER_HASH',digest_('22112026'));
  if(!p.getProperty('STEM_TEACHER_EPOCH'))p.setProperty('STEM_TEACHER_EPOCH','1');
  ensureSheet_(ss,SHEET_NAME,COLS);
  ensureSheet_(ss,AUDIT_NAME,['time','klass','group','actor','action','revision','oldPayload','newPayload','note']);
  ensureSheet_(ss,FEEDBACK_NAME,FEEDBACK_COLS);
  ensureSheet_(ss,RUBRIC_NAME,RUBRIC_COLS);
  ensureSheet_(ss,DELETED_NAME,['time','klass','group','recordId','revision','actor']);
  Logger.log('Bảng tính: '+ss.getUrl());
  Logger.log('Mật khẩu giáo viên ban đầu: 22112026. Đổi ngay sau khi đăng nhập.');
}
function ensureSheet_(ss,name,headers){
  var sh=ss.getSheetByName(name)||ss.insertSheet(name);
  if(sh.getLastRow()===0){sh.appendRow(headers);sh.setFrozenRows(1)}
  else if(sh.getLastColumn()<headers.length){sh.getRange(1,sh.getLastColumn()+1,1,headers.length-sh.getLastColumn()).setValues([headers.slice(sh.getLastColumn())])}
  return sh;
}
function env_(){
  var p=PropertiesService.getScriptProperties();
  if(!p.getProperty('STEM_SPREADSHEET_ID')||!p.getProperty('STEM_PEPPER'))throw Error('Chưa chạy setup() trong Apps Script');
  return {p:p,ss:SpreadsheetApp.openById(p.getProperty('STEM_SPREADSHEET_ID'))};
}
function digest_(value){
  var pepper=PropertiesService.getScriptProperties().getProperty('STEM_PEPPER')||'';
  return Utilities.computeHmacSha256Signature(String(value),pepper).map(function(x){return ('0'+(x&255).toString(16)).slice(-2)}).join('');
}
function clean_(x,max){return String(x===undefined||x===null?'':x).trim().slice(0,max||200)}
function key_(klass,group){return clean_(klass,30).toUpperCase()+'|'+clean_(group,50).toUpperCase()}
function sheet_(){return env_().ss.getSheetByName(SHEET_NAME)}
function all_(sh){return sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,COLS.length).getValues():[]}
function deletedGroup_(ss,klass,group){
  var sheet=ss.getSheetByName(DELETED_NAME);
  if(!sheet||sheet.getLastRow()<2)return false;
  var rows=sheet.getRange(2,2,sheet.getLastRow()-1,2).getValues(),target=key_(klass,group);
  return rows.some(function(r){return key_(r[0],r[1])===target});
}
function deleteMatchingRows_(sheet,matcher){
  if(!sheet||sheet.getLastRow()<2)return 0;
  var rows=sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).getValues(),count=0;
  for(var i=rows.length-1;i>=0;i--)if(matcher(rows[i])){sheet.deleteRow(i+2);count++}
  return count;
}
function rowOf_(sh,klass,group){
  var rows=all_(sh),search=key_(klass,group);
  for(var i=0;i<rows.length;i++)if(key_(rows[i][1],rows[i][2])===search)return {row:i+2,v:rows[i]};
  return null;
}
function authToken_(role,groupId,extra){
  var tok=Utilities.getUuid()+Utilities.getUuid(),hash=digest_(tok),p=PropertiesService.getScriptProperties();
  var session={role:role,groupId:groupId||'',created:Date.now(),epoch:p.getProperty('STEM_TEACHER_EPOCH')||'1'};
  if(extra){Object.keys(extra).forEach(function(k){session[k]=extra[k]})}
  CacheService.getScriptCache().put('session:'+hash,JSON.stringify(session),21600);
  return tok;
}
function requireSession_(token,role,groupId,allowDefault){
  var value=CacheService.getScriptCache().get('session:'+digest_(clean_(token,150)));
  if(!value)throw Error('Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.');
  var s=JSON.parse(value);
  if(role==='teacher'&&s.role!=='teacher')throw Error('Không có quyền giáo viên');
  if(role==='teacher'&&s.epoch!==(PropertiesService.getScriptProperties().getProperty('STEM_TEACHER_EPOCH')||'1'))throw Error('Phiên giáo viên đã hết hạn sau khi đổi mật khẩu');
  if(role==='teacher'&&s.mustChange&&!allowDefault)throw Error('Cần đổi mật khẩu mặc định trước khi xem hoặc chỉnh sửa bài');
  if(role==='student'&&s.role!=='student')throw Error('Không có quyền học sinh');
  if(role==='student'&&s.groupId!==groupId)throw Error('Sai nhóm truy cập');
  return s;
}
function assertName_(klass,group){
  if(!/^[\p{L}\p{N} ._-]{1,30}$/u.test(klass)||!/^[\p{L}\p{N} ._-]{1,50}$/u.test(group))throw Error('Tên lớp/nhóm không hợp lệ');
}
/* Khóa tạo bài idempotent: chỉ người giữ requestKey ngẫu nhiên mới
   có thể nhận lại mã của lần tạo trước. Không dùng tên lớp/nhóm làm khóa.
   Dữ liệu cũ thiếu cột createRequestHash vẫn đọc bình thường. */
function createKey_(raw){
  var k=clean_(raw,120);
  if(!/^[a-f0-9]{32,80}$/i.test(k))throw Error('Mã yêu cầu tạo bài chưa hợp lệ. Hãy tải lại ứng dụng.');
  return digest_('create-stem7:'+k);
}
function pinForRequest_(hash){
  var alphabet=PIN_ALPHABET,out='';
  for(var i=0;i<4;i++)out+=alphabet.charAt(parseInt(hash.substr(i*2,2),16)%alphabet.length);
  return out;
}
function pin_(){
  // UUID-derived random bits spread over 32-character alphabet.
  var h=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,''),out='';
  for(var i=0;i<4;i++)out+=PIN_ALPHABET.charAt(parseInt(h.substr(i*2,2),16)%PIN_ALPHABET.length);
  return out;
}
function throttle_(key,limit){
  var cache=CacheService.getScriptCache(),k='fail:'+digest_(key),n=Number(cache.get(k)||0);
  if(n>=limit)throw Error('Quá nhiều lần nhập sai. Vui lòng thử lại sau 15 phút.');
  return {cache:cache,key:k,count:n};
}
function wrong_(rate){rate.cache.put(rate.key,String(rate.count+1),900)}
function clearFails_(rate){rate.cache.remove(rate.key)}
function time_(){return new Date().toISOString()}
function filteredPayload_(obj){
  if(!obj||typeof obj!=='object'||Array.isArray(obj)||!obj.sites||typeof obj.sites!=='object')throw Error('Thiếu bài làm');
  var sites=['nga','cu','giong'];
  sites.forEach(function(id){if(!obj.sites[id]||typeof obj.sites[id]!=='object')throw Error('Thiếu dữ liệu di tích '+id)});
  var value=JSON.stringify(obj);
  if(value.length>MAX_JSON_LENGTH)throw Error('Bài làm vượt dung lượng cho phép');
  return value;
}
function safeCell_(s){s=clean_(s,6000);return /^[=+@\-]/.test(s)?"'"+s:s}
function writeAudit_(ss,klass,group,actor,action,rev,oldText,newText,note){
  var sh=ss.getSheetByName(AUDIT_NAME);sh.appendRow([new Date(),safeCell_(klass),safeCell_(group),actor,action,rev,oldText,newText,safeCell_(note||'')]);
}

/* Đọc chéo: chỉ các nhóm cùng lớp có phiên đăng nhập hợp lệ mới xem được
   bản công khai đã lọc. Không bao giờ trả mã nhóm, phiên đăng nhập hay
   nội dung kiểm thử nội bộ. Góp ý nằm trong một sheet riêng. */
function feedbackSheet_(ss){return ensureSheet_(ss,FEEDBACK_NAME,FEEDBACK_COLS)}
function feedbackRows_(sh){return sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,FEEDBACK_COLS.length).getValues():[]}
function safePublicData_(v){
  var payload={};try{payload=JSON.parse(String(v[4]||'{}'))}catch(e){}
  var names={nga:'Ngã Ba Giồng',cu:'Địa đạo Củ Chi',giong:'Giồng Cá Vồ'},sites={};
  ['nga','cu','giong'].forEach(function(id){
    var item=payload.sites&&payload.sites[id]||{};
    sites[id]={name:names[id],desc:clean_(item.desc,1200),source:clean_(item.source,400)};
  });
  var valid=['nga','cu','giong'],ord=clean_(payload.order,50).split(',');
  if(ord.length!==3||ord.some(function(id){return valid.indexOf(id)<0})||new Set(ord).size!==3)ord=valid;
  return {klass:clean_(v[1],30),group:clean_(v[2],50),sites:sites,order:ord,
    reason:clean_(payload.reason,600),message:clean_(payload.message,400),
    compareText:clean_(payload.compareText,450),updatedAt:v[8],revision:Number(v[10]||0)};
}
function validReviewer_(token,klass,sh){
  var cached=CacheService.getScriptCache().get('session:'+digest_(clean_(token,150)));
  if(!cached)throw Error('Phiên nhóm hết hạn. Hãy đăng nhập lại.');
  var session=JSON.parse(cached);
  if(session.role!=='student')throw Error('Cần đăng nhập bằng tài khoản nhóm học sinh');
  var rows=all_(sh),self=null;
  for(var i=0;i<rows.length;i++)if(rows[i][0]===session.groupId){self=rows[i];break}
  if(!self)throw Error('Không tìm thấy nhóm đang đăng nhập');
  requireSession_(token,'student',self[0]);
  if(Number(session.codeVersion||1)!==Number(self[14]||1))throw Error('Phiên nhóm đã hết hạn, hãy đăng nhập lại');
  if(key_(self[1],'')!==key_(klass,''))throw Error('Chỉ xem được nhóm cùng lớp');
  return self;
}
function filterFeedbackText_(raw,max){
  var x=clean_(raw,max+10).replace(/\s+/g,' ').trim();
  if(x.length<12||x.length>max)throw Error('Góp ý cần từ 12 đến '+max+' ký tự');
  if(/https?:\/\/|www\.|@|<[^>]*>|\b\d{9,}\b/i.test(x))throw Error('Không nhập liên kết hoặc thông tin liên lạc');
  var simple=x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
  simple=simple.replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  var abuse=/(?:^| )(?:dit|du ma|dm|dmm|vl|vcl|clm|lol|ngu|oc cho|cho de|con cho|khon nan|mat day|do dien|fuck|shit|bitch|stupid|idiot)(?: |$)/;
  if(abuse.test(simple))throw Error('Góp ý chứa từ ngữ không phù hợp. Hãy viết nhận xét lịch sự, cụ thể.');
  if(/(.)\1{7,}/i.test(x))throw Error('Góp ý có ký tự lặp quá nhiều');
  return x;
}
function publicFeedback_(r,teacher){
  return {id:String(r[0]),klass:String(r[1]),targetGroup:String(r[2]),
    authorGroup:String(r[3]),role:String(r[4]),checks:String(r[5]).split(',').filter(Boolean),
    comment:String(r[6]),createdAt:r[8] instanceof Date?r[8].toISOString():String(r[8]),
    status:teacher?String(r[7]):undefined};
}
function feedbackFor_(sheet,klass,group,teacher){
  return feedbackRows_(sheet).filter(function(r){return key_(r[1],r[2])===key_(klass,group)&&(teacher||String(r[7])==='visible')})
    .slice(-80).reverse().map(function(r){return publicFeedback_(r,teacher)});
}
function sendFeedback_(sheet,klass,targetGroup,authorGroup,role,raw,checks){
  var text=filterFeedbackText_(raw,role==='teacher'?500:300);
  if(!Array.isArray(checks))checks=[];
  var allowed=['info','card','route'],valid=[];
  checks.forEach(function(x){if(allowed.indexOf(x)>=0&&valid.indexOf(x)<0)valid.push(x)});
  if(role==='student'&&!valid.length)throw Error('Hãy đánh dấu ít nhất một tiêu chí trước khi gửi góp ý.');
  var all=feedbackRows_(sheet),today=Date.now(),recent=all.filter(function(r){
    return key_(r[1],r[2])===key_(klass,targetGroup)&&String(r[3])===authorGroup&&
      String(r[4])===role&&(today-new Date(r[8]).getTime()<86400000);
  });
  if(role==='student'&&recent.length>=3)throw Error('Nhóm em đã gửi tối đa 3 góp ý cho nhóm này hôm nay.');
  if(role==='student'&&recent.length&&today-new Date(recent[recent.length-1][8]).getTime()<45000)
    throw Error('Hãy chờ một chút trước khi gửi góp ý tiếp theo.');
  var row=[Utilities.getUuid(),klass,targetGroup,authorGroup,role,valid.join(','),safeCell_(text),'visible',new Date(),''];
  sheet.appendRow(row);
  return publicFeedback_(row,false);
}

function publicRecord_(v,includePayload){
  var out={id:v[0],klass:v[1],group:v[2],createdAt:v[5],firstAt:v[6],lastAt:v[7],updatedAt:v[8],seconds:Number(v[9]||0),revision:Number(v[10]||0),teacherEditedAt:v[11],teacherNote:v[12],lastEditor:v[13],studentEditedAt:v[15]||v[8]};
  if(includePayload)out.data=JSON.parse(String(v[4]||'{}'));
  return out;
}
function handle_(q){
  var action=clean_(q.action,40),klass=clean_(q.klass,30),group=clean_(q.group,50);
  var E=env_(),ss=E.ss,sh=ss.getSheetByName(SHEET_NAME);
  if(action==='ping')return {ready:true,version:APP_VERSION};
  if(action==='teacherLogin'){
    var rate=throttle_('teacher',5),pwd=clean_(q.password,128);
    if(pwd.length!==8||digest_(pwd)!==E.p.getProperty('STEM_TEACHER_HASH')){wrong_(rate);throw Error('Sai mật khẩu giáo viên')}
    clearFails_(rate);
    return {token:authToken_('teacher','',{mustChange:pwd==='22112026'}),mustChange:pwd==='22112026'};
  }
  if(action==='teacherPassword'){
    requireSession_(q.token,'teacher',null,true);
    var newPass=clean_(q.newPassword,128);
    if(newPass.length!==8)throw Error('Mật khẩu giáo viên phải có đúng 8 ký tự');
    if(newPass==='22112026')throw Error('Không sử dụng lại mật khẩu mặc định');
    E.p.setProperty('STEM_TEACHER_HASH',digest_(newPass));
    var nextEpoch=String(Number(E.p.getProperty('STEM_TEACHER_EPOCH')||'1')+1);
    E.p.setProperty('STEM_TEACHER_EPOCH',nextEpoch);
    CacheService.getScriptCache().put('session:'+digest_(q.token),JSON.stringify({role:'teacher',groupId:'',created:Date.now(),epoch:nextEpoch,mustChange:false}),21600);
    return {changed:true};
  }
  if(action==='teacherList'){
    requireSession_(q.token,'teacher');
    var index=rubricIndex_(ss);return {rubricSupported:true,assessmentWorkflow:true,groups:all_(sh).map(function(r){return teacherRecord_(r,false,index)})};
  }
  if(action==='teacherGet'){
    requireSession_(q.token,'teacher');
    var t=rowOf_(sh,klass,group);if(!t)throw Error('Không tìm thấy nhóm');
    return {rubricSupported:true,assessmentWorkflow:true,record:teacherRecord_(t.v,true,rubricIndex_(ss))};
  }

  if(action==='peerList'||action==='peerGet'||action==='peerSend'||action==='peerInbox'){
    var own=validReviewer_(q.token,klass,sh),selfGroup=String(own[2]);
    if(action==='peerList'){
      return {groups:all_(sh).filter(function(r){return key_(r[1],'')===key_(klass,'')&&key_(r[1],r[2])!==key_(klass,selfGroup)})
        .map(function(r){return {klass:String(r[1]),group:String(r[2]),updatedAt:r[8],revision:Number(r[10]||0)}})};
    }
    if(action==='peerInbox'){
      return {feedback:feedbackFor_(feedbackSheet_(ss),klass,selfGroup,false)};
    }
    if(!group||key_(klass,group)===key_(klass,selfGroup))throw Error('Hãy chọn nhóm khác cùng lớp');
    var target=rowOf_(sh,klass,group);if(!target)throw Error('Không tìm thấy bài của nhóm cần xem');
    if(action==='peerGet')return {record:safePublicData_(target.v)};
    var fs=feedbackSheet_(ss);
    var lockPeer=LockService.getScriptLock();lockPeer.waitLock(20000);
    try{return {feedback:sendFeedback_(fs,klass,group,selfGroup,'student',q.comment,q.checks)}}
    finally{lockPeer.releaseLock()}
  }
  if(action==='teacherFeedbackList'||action==='teacherFeedbackSend'||action==='teacherFeedbackModerate'){
    requireSession_(q.token,'teacher');
    var feedbackSheet=feedbackSheet_(ss);
    if(action==='teacherFeedbackList')return {feedback:feedbackFor_(feedbackSheet,klass,group,true)};
    var lockFeedback=LockService.getScriptLock();lockFeedback.waitLock(20000);
    try{
      if(action==='teacherFeedbackSend'){
        if(!rowOf_(sh,klass,group))throw Error('Nhóm cần nhận xét không tồn tại');
        return {feedback:sendFeedback_(feedbackSheet,klass,group,'Giáo viên','teacher',q.comment,q.checks)};
      }
      var identifier=clean_(q.feedbackId,70),next=q.visible===true?'visible':'hidden',rows=feedbackRows_(feedbackSheet);
      for(var z=0;z<rows.length;z++){
        if(String(rows[z][0])===identifier&&key_(rows[z][1],rows[z][2])===key_(klass,group)){
          feedbackSheet.getRange(z+2,8).setValue(next);
          feedbackSheet.getRange(z+2,10).setValue(new Date());
          return {changed:true,status:next};
        }
      }
      throw Error('Không tìm thấy nhận xét cần duyệt');
    }finally{lockFeedback.releaseLock()}
  }

  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var entry=rowOf_(sh,klass,group);
    if(action==='createGroup'){
      assertName_(klass,group);
      if(deletedGroup_(ss,klass,group))throw Error('Bài này đã được giáo viên xóa. Em hãy liên hệ giáo viên trước khi tạo bài mới.');
      /* Máy khách cũ vẫn được hỗ trợ, nhưng yêu cầu mới dùng requestKey
         để thử lại sau khi mất kết nối mà không tạo thêm dòng. */
      var reqHash=q.requestKey?createKey_(q.requestKey):'';
      if(entry){
        var prior=entry.v,priorHash=String(prior[16]||'');
        if(reqHash&&priorHash===reqHash){
          var samePin=pinForRequest_(reqHash);
          if(digest_(samePin)!==String(prior[3]))
            throw Error('Mã bài đã được thay đổi. Hãy liên hệ giáo viên để lấy mã mới.');
          return {code:samePin,reused:true,token:authToken_('student',prior[0],{codeVersion:Number(prior[14]||1)}),record:publicRecord_(prior,true)};
        }
        throw Error('Lớp/nhóm đã tồn tại trên Google Sheets. Không tạo trùng hoặc ghi đè. Hãy mở bài bằng mã 4 ký tự.');
      }
      var pin=reqHash?pinForRequest_(reqHash):pin_(),now=new Date(),data=filteredPayload_(q.data);
      var id=Utilities.getUuid(),v=[id,klass,group,digest_(pin),data,now,now,now,now,0,1,'','','Học sinh',1,now,reqHash];
      sh.appendRow(v);
      return {code:pin,reused:false,token:authToken_('student',id,{codeVersion:1}),record:publicRecord_(v,true)};
    }
    if(action==='teacherDelete'){
      requireSession_(q.token,'teacher');
      if(!entry)throw Error('Bài không còn tồn tại. Hãy tải lại danh sách.');
      if(clean_(q.recordId,100)!==String(entry.v[0]))throw Error('Thông tin bài đã thay đổi. Hãy tải lại trước khi xóa.');
      if(Number(q.revision)!==Number(entry.v[10]||0))throw Error('Bài vừa được cập nhật. Hãy tải lại trước khi xóa.');
      var recordId=String(entry.v[0]),targetKey=key_(klass,group);
      // Đánh dấu trước để bản lưu offline không thể tạo lại bài vừa xóa.
      var deletedSheet=ensureSheet_(ss,DELETED_NAME,['time','klass','group','recordId','revision','actor']);
      if(!deletedGroup_(ss,klass,group))deletedSheet.appendRow([new Date(),klass,group,recordId,entry.v[10],'Giáo viên']);
      var removedRubric=deleteMatchingRows_(ss.getSheetByName(RUBRIC_NAME),function(r){return String(r[0])===recordId});
      var removedFeedback=deleteMatchingRows_(ss.getSheetByName(FEEDBACK_NAME),function(r){
        return key_(r[1],r[2])===targetKey||(key_(r[1],'')===key_(klass,'')&&key_(r[3],klass)===key_(group,klass));
      });
      // Lịch sử chứa cả bản bài cũ: xóa lịch sử của bài để không lưu sót nội dung.
      var removedAudit=deleteMatchingRows_(ss.getSheetByName(AUDIT_NAME),function(r){return key_(r[1],r[2])===targetKey});
      sh.deleteRow(entry.row);
      return {deleted:true,recordId:recordId,rubricRows:removedRubric,feedbackRows:removedFeedback,auditRows:removedAudit};
    }
    if(!entry)throw Error('Chưa có nhóm trên máy chủ');
    var row=entry.row,v=entry.v;
    if(action==='studentAssessment'){
      var auth=requireSession_(q.token,'student',v[0]);
      if(Number(auth.codeVersion||1)!==Number(v[14]||1))throw Error('Phiên bài đã hết hạn, hãy đăng nhập lại.');
      return {assessment:studentAssessment_(ss,v)};
    }
    if(action==='studentGet'){
      var session=requireSession_(q.token,'student',v[0]);
      if(Number(session.codeVersion||1)!==Number(v[14]||1))throw Error('Phiên cũ đã bị vô hiệu hóa khi đổi mã nhóm');
      return {record:publicRecord_(v,true)};
    }
    if(action==='studentLogin'){
      var rate=throttle_('group:'+key_(klass,group),5),code=clean_(q.code,10).toUpperCase();
      if(code.length!==4||digest_(code)!==v[3]){wrong_(rate);throw Error('Sai mã nhóm')}
      clearFails_(rate);v[7]=new Date();sh.getRange(row,8).setValue(v[7]);
      return {token:authToken_('student',v[0],{codeVersion:Number(v[14]||1)}),record:publicRecord_(v,true)};
    }
    if(action==='studentSave'||action==='studentHeartbeat'){
      var session=requireSession_(q.token,'student',v[0]);
      if(Number(session.codeVersion||1)!==Number(v[14]||1))throw Error('Mã nhóm đã thay đổi. Đăng nhập lại bằng mã mới.');
      var now=new Date(),delta=Math.max(0,Math.min(60,Number(q.activeSeconds)||0));
      v[7]=now;v[9]=Number(v[9]||0)+Math.floor(delta);
      if(action==='studentSave'){
        var revision=Number(q.revision||0);if(revision!==Number(v[10]||0))return {conflict:true,record:publicRecord_(v,true)};
        var oldText=String(v[4]||''),newText=filteredPayload_(q.data);
        v[4]=newText;v[8]=now;v[10]=revision+1;v[13]='Học sinh';v[15]=now;
        writeAudit_(ss,klass,group,'Học sinh','Lưu bài',v[10],oldText,newText,'');
      }
      sh.getRange(row,1,1,COLS.length).setValues([v]);
      return {record:publicRecord_(v,action==='studentSave')};
    }
    if(action==='teacherRubricSave'){
      requireSession_(q.token,'teacher');
      var total=rubricTotal_(q.scores),status=q.status===undefined?'draft':String(q.status);
      if(q.version!==RUBRIC_VERSION||total===null||['draft','revision','final'].indexOf(status)<0)throw Error('Rubric hoặc mức điểm không hợp lệ.');
      var note=clean_(q.note,1000);
      if(status==='revision'&&!note)throw Error('Hãy ghi rõ nội dung học sinh cần chỉnh sửa.');
      var ix=rubricIndex_(ss),old=ix[String(v[0])],rev=old?Number(old.assessment.revision||0):0;
      if(Number(q.rubricRevision)!==rev||Number(q.sourceRevision)!==Number(v[10]||0))return {conflict:true};
      var a={version:RUBRIC_VERSION,scores:q.scores.slice(),total:total,note:note,status:status,sourceRevision:Number(v[10]||0),revision:rev+1,updatedAt:time_()};
      var sheet=ensureSheet_(ss,RUBRIC_NAME,RUBRIC_COLS),cells=[String(v[0]),safeCell_(v[1]),safeCell_(v[2]),JSON.stringify(a)];
      sheet.appendRow(cells);
      return {assessment:a,history:[a].concat(old?old.history:[]).slice(0,50),historyCount:1+(old?old.history.length:0)};
    }
    if(action==='teacherSave'){
      requireSession_(q.token,'teacher');
      var rev=Number(q.revision||0);if(rev!==Number(v[10]||0))return {conflict:true,record:publicRecord_(v,true)};
      var previous=String(v[4]||''),replacement=filteredPayload_(q.data),note=clean_(q.note,1000),nowT=new Date();
      v[4]=replacement;v[8]=nowT;v[10]=rev+1;v[11]=nowT;v[12]=safeCell_(note);v[13]='Giáo viên';
      writeAudit_(ss,klass,group,'Giáo viên','Chỉnh sửa',v[10],previous,replacement,note);
      sh.getRange(row,1,1,COLS.length).setValues([v]);
      return {rubricSupported:true,assessmentWorkflow:true,record:teacherRecord_(v,true,rubricIndex_(ss))};
    }
    if(action==='teacherRotateCode'){
      requireSession_(q.token,'teacher');var newCode=pin_();v[3]=digest_(newCode);v[14]=Number(v[14]||1)+1;
      sh.getRange(row,4).setValue(v[3]);sh.getRange(row,15).setValue(v[14]);
      writeAudit_(ss,klass,group,'Giáo viên','Đổi mã nhóm',v[10],'','','Đã tạo mã truy cập mới');
      return {code:newCode};
    }
    throw Error('Hành động không được hỗ trợ');
  }finally{lock.releaseLock()}
}
function doPost(e){
  var q={},id='';
  try{
    if(!e||!e.parameter||!e.parameter.payload)throw Error('Thiếu dữ liệu yêu cầu');
    q=JSON.parse(e.parameter.payload);id=clean_(q.requestId,100);
    var result=handle_(q);var out={stem7Bridge:1,requestId:id,ok:true,result:result};
  }catch(err){var out={stem7Bridge:1,requestId:id,ok:false,error:String(err.message||err)}}
  // Response only to the GitHub Pages app origin, never to arbitrary embedding sites.
  // The browser client also verifies the requestId and Google origin.
  var json=JSON.stringify(out).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
  var html='<!doctype html><meta charset="utf-8"><script>(function(){'
    +'var m='+json+';var target="https://ph0823.github.io";'
    +'var origins=window.location.ancestorOrigins,w=window;'
    +'if(origins&&origins.length){'
    +'for(var i=0;i<origins.length;i++){'
    +'if(origins[i]===target){for(var j=0;j<=i;j++)w=w.parent;w.postMessage(m,target);return;}'
    +'}'
    +'return;'
    +'}'
    +'/* Chrome 75 supports ancestorOrigins. Without it, try the usual '
    +'Apps Script double-frame path without broadcasting credentials. */'
    +'try{window.parent.parent.postMessage(m,target)}catch(e){}'
    +'})();</script>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function doGet(){return HtmlService.createHtmlOutput('<p>STEM Tin 7 API đang hoạt động. Dữ liệu yêu cầu gửi bằng POST.</p>')}
