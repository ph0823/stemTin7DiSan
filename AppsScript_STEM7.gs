/**
 * STEM Tin 7 - Hành trình di sản số: Google Apps Script backend.
 * Install as standalone Apps Script, run setup() once, deploy Web app
 * Execute as: Me; Who has access: Anyone.
 * JSON payload posted as HTML form to hidden iframe (cross-origin compatible).
 *
 * IMPORTANT: 4-character access codes are convenient, not high-security identity.
 * Never store personal sensitive data. Change the default teacher password.
 */
var APP_VERSION = 1;
var SHEET_NAME = 'Nhom_STEM7';
var AUDIT_NAME = 'Lich_su_chinh_sua';
var COLS = ['id','klass','group','accessHash','payload','createdAt','firstAt','lastAt','updatedAt','seconds','revision','teacherEditedAt','teacherNote','lastEditor','codeVersion','studentEditedAt'];
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
    return {groups:all_(sh).map(function(r){return publicRecord_(r,false)})};
  }
  if(action==='teacherGet'){
    requireSession_(q.token,'teacher');
    var t=rowOf_(sh,klass,group);if(!t)throw Error('Không tìm thấy nhóm');
    return {record:publicRecord_(t.v,true)};
  }
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    var entry=rowOf_(sh,klass,group);
    if(action==='createGroup'){
      assertName_(klass,group);
      if(entry)throw Error('Lớp/nhóm đã tồn tại. Nhập mã nhóm để mở bài.');
      var pin=pin_(),now=new Date(),data=filteredPayload_(q.data);
      var id=Utilities.getUuid(),v=[id,klass,group,digest_(pin),data,now,now,now,now,0,1,'','','Học sinh',1,now];
      sh.appendRow(v);return {code:pin,token:authToken_('student',id,{codeVersion:1}),record:publicRecord_(v,true)};
    }
    if(!entry)throw Error('Chưa có nhóm trên máy chủ');
    var row=entry.row,v=entry.v;
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
    if(action==='teacherSave'){
      requireSession_(q.token,'teacher');
      var rev=Number(q.revision||0);if(rev!==Number(v[10]||0))return {conflict:true,record:publicRecord_(v,true)};
      var previous=String(v[4]||''),replacement=filteredPayload_(q.data),note=clean_(q.note,1000),nowT=new Date();
      v[4]=replacement;v[8]=nowT;v[10]=rev+1;v[11]=nowT;v[12]=safeCell_(note);v[13]='Giáo viên';
      writeAudit_(ss,klass,group,'Giáo viên','Chỉnh sửa',v[10],previous,replacement,note);
      sh.getRange(row,1,1,COLS.length).setValues([v]);
      return {record:publicRecord_(v,true)};
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
  var html='<!doctype html><meta charset="utf-8"><script>(function(){var m='+json+';var w=window;for(var i=0;i<7;i++){if(w.parent===w)break;w=w.parent;try{w.postMessage(m,"https://ph0823.github.io")}catch(e){}}})();</script>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function doGet(){return HtmlService.createHtmlOutput('<p>STEM Tin 7 API đang hoạt động. Dữ liệu yêu cầu gửi bằng POST.</p>')}
