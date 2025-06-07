const indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB||window.shimIndexedDB;
const easydb={};

easydb.queueLater=(FunctionName,Params)=>
{
if(typeof easydb.queueLater.counter=='undefined') easydb.queueLater.counter=0;
if(easydb.queue.list.length==0) easydb.queueLater.counter=0;
easydb.queueLater.counter++;
if(easydb.queueLater.counter>20) {console.trace('Too many queue calls');return}
setTimeout(()=>easydb.queueAdd(FunctionName,Params),1000);
}

easydb.QueueWrapper=function(fn,context,params) {return function(){
easydb.console('QueueWrapper',fn.name)
fn.apply(context,params)
}}

easydb.queueAdd=(FunctionName,Params,First)=> 
{
if(!Array.isArray(Params))Params=[Params];
var fn=easydb.QueueWrapper(FunctionName,this,Params);
if(First) easydb.queue.list.unshift(fn);
if(!First) easydb.queue.list.push(fn);
if(easydb.busy()) return; 
if(easydb.queue.list.length==0) return; 
setTimeout(()=>easydb.queueKeepAlive(FunctionName.name),100);
(easydb.queue.list.shift())(); //Remove and execute the first function on the queue
}

easydb.queueKeepAlive=(comment='')=>
{
if(easydb.queue.list.length==0) return; 
if(easydb.busy()) return; //Queue is already activated
easydb.busy(true,'queueKeepAlive '+comment);
}

easydb.queue=(FunctionName='',Params='',First=false,comment='')=> 
{
var ThisFunction;
if(typeof easydb.queue.list=='undefined') easydb.queue.list=[];
if(FunctionName!='') 
  { 
  easydb.queueAdd(FunctionName,Params,First);
  return;
  }
if(easydb.queue.list.length==0) return; 
easydb.console('queue',comment)
setTimeout(()=>easydb.queueKeepAlive(comment),100);
(easydb.queue.list.shift())(); //Remove and execute the first function on the queue
}

easydb.getKey=async(Value)=> 
{
if(easydb.queryName()=='') 
  {
  console.trace('easydb.getKey() needs to be in the same function as easydb.table() and easydb.queryName()');
  return '';
  }
easydb.busy(true,'getKey',Value);
return new Promise((resolve, reject)=>{const request=easydb.queryName().getKey(Value);request.onsuccess=()=>{resolve(request.result)};request.onerror=()=>{reject(request.error)}});
}

easydb.console=(action='',comment='',param='')=>
{
if(comment=='') return;
console.log(action,comment,param,Date.now()-StartingTime);
}

easydb.value=(x,comment='')=>
{
var xx=x;
if(x!==null) if(isNaN(x)) xx=x.slice(0,20);
easydb.console('value',comment,xx);
if(typeof x=='undefined') return '';
if(x===null) return '';
if(x=='') return '';
return x;
}

easydb.hasValue=(Value)=>
{
if(typeof Value=='undefined') return false;
if(Value===null) return false;
if(Value=='') return false;
return true;
}

easydb.getProperty=async(comment='')=>
{
easydb.console('getProperty',comment);
const TheKey=await easydb.key(easydb.match());
easydb.console('getProperty',comment,TheKey);
if(TheKey=='') return '';
const dataset=await easydb.getKeyRow(comment);
if(typeof dataset=='undefined') {console.log('Key found but no row',easydb.match(),easydb.table(),easydb.queryName());return ''};
var TheText='';
if(dataset!==null) TheText=dataset[easydb.property()];
if(typeof TheText===null) TheText='';
if(typeof TheText=='undefined') TheText='';
return TheText;
}

easydb.getRows=async(comment='')=> 
{
if(easydb.queryName()=='')
  { 
  console.trace('easydb.getRows() needs to be in the same function as easydb.table() and easydb.queryName()');
  return '';
  }
easydb.all(false);
if(easydb.match()=='') return '';
easydb.busy(true,'getRows');
return new Promise((resolve, reject)=>{const request=easydb.queryName().getAll(easydb.match());request.onsuccess=()=>{resolve(request.result)};request.onerror=()=>{reject(request.error)}});
}

easydb.getRow=async(comment='')=> 
{
easydb.console('getRow',comment);
if(easydb.queryName()=='')
  { 
  console.trace('easydb.getRows() needs to be in the same function as easydb.table() and easydb.queryName()');
  return '';
  }
if(easydb.match()=='') return '';
easydb.busy(true,'getRow');
if(easydb.all()) return new Promise((resolve, reject)=>{const request=easydb.queryName().getAll(easydb.match());request.onsuccess=()=>{resolve(request.result)};request.onerror=()=>{reject(request.error)}});
return new Promise((resolve, reject)=>{const request=easydb.queryName().get(easydb.match());request.onsuccess=()=>{resolve(request.result)};request.onerror=()=>{reject(request.error)}});
}

easydb.getKeyRow=async(comment='')=> 
{
easydb.console('getKeyRow',comment);
var TheKey=await easydb.key();
if(TheKey=='') return '';
if(easydb.table()=='')
  {
  console.trace('easydb.getKeyRow() needs to be in the same function as easydb.table() and easydb.queryName()');
  return '';
  }
easydb.busy(true,'getKeyRow '+comment);
return new Promise((resolve, reject)=>{const request=easydb.table().get(TheKey);request.onsuccess=()=>{resolve(request.result)};request.onerror=()=>{reject(request.error)}});
}

easydb.data=(Value='')=>
{
if(Value=='')
  {
  if(easydb.data.value=='') console.trace('easydb.data() needs to be in the same function as easydb.table() and easydb.queryName()');
  return easydb.data.value;
  }
easydb.data.value=Value;
}

easydb.putRow=async()=>
{
if(easydb.table()=='') {console.trace('easydb.putRow() needs to be in the same function as easydb.table() and easydb.queryName()');return}
var Data=easydb.data();
easydb.busy(true,'putRow');
return new Promise((resolve, reject)=>{const request=easydb.table().put(Data);request.onsuccess=()=>{resolve(request.result)};request.onerror=()=>{reject(request.error)}});
}

easydb.clearTable=async(TableName)=>
{
easydb.busy(true);
return new Promise((resolve, reject)=>{const request=easydb.open.result.transaction(TableName,'readwrite').objectStore(TableName).clear();request.onsuccess=()=>{resolve(request.result)};request.onerror=()=>{reject(request.error)}});
}

easydb.createDB=()=>
{
easydb.busy(true);
easydb.tables().forEach((item)=>{easydb.createTable(item)});
}

easydb.deleteRow=async()=>
{
if(easydb.table()=='') return console.log('No table named');
if(easydb.match()=='') {console.log('No match set for delete');return}
easydb.busy(true);
var k=await easydb.key(easydb.match());
if(k=='') return;
easydb.table().delete(k);
}

easydb.match=(Value='')=>
{
if(Value=='') 
  {
  if(easydb.match.value=='') console.trace('easydb.match() needs to be in the same function as easydb.table() and easydb.queryName()');
  return easydb.match.value;
  }
easydb.match.value=Value;
}

easydb.done=(comment='')=>
{
easydb.console('done',comment);
//if(comment!='') {console.log('------');console.log('');}
easydb.reset();
easydb.busy(false,'done '+comment);//Calls the next function on the queue.
}

easydb.all=(State='')=>
{
if(typeof easydb.all.state=='undefined') easydb.all.state=false;
if(State==='') return easydb.all.state;
easydb.all.state=State;
ClearTimer('idb-all');
Timer('idb-all',setTimeout(()=>{easydb.all.state=false},120));
}

easydb.reset=()=>
{
easydb.table.value='';
easydb.queryName.value='';
easydb.match.value=Value='';
easydb.property.value='';
easydb.key.value='';
}

easydb.busy=(State='',comment='')=>
{
easydb.console('busy',comment,State);
if(typeof easydb.busy.state=='undefined') {easydb.busy.state=false;Timer('idb-busy',setTimeout(()=>{easydb.busy.state=false;easydb.queue()},2000))}
if(State==='') return easydb.busy.state;
easydb.busy.state=State;
ClearTimer('idb-busy');
if(easydb.busy.state===false) {easydb.queue();return;}//Do the first function in the queue;
Timer('idb-busy',setTimeout(()=>{
  easydb.console('busy timeout',comment);
  easydb.reset()
  easydb.busy.state=false;
  easydb.queue()
},120));//Transaction takes less than 120ms.The user can also actively flag the transaction as done, to make it quicker.
}

easydb.property=(PropertyName='')=>
{
if(PropertyName=='')
  {
  if(easydb.property.value=='') console.trace('easydb.property() needs to be in the same function as easydb.table() and easydb.queryName()');
  return easydb.property.value;
  }
easydb.property.value=PropertyName;
}

easydb.setKey=(Value='')=>{easydb.key.value=Value}

easydb.key=async(Value='')=>
{
if(Value=='') 
  {
  if(easydb.key.value=='') console.trace('easydb.key() needs to be in the same function as easydb.table() and easydb.queryName()');
  return easydb.key.value;
  }
easydb.busy(true);
easydb.key.value='';
var TheKey=await easydb.getKey(Value);
if(typeof TheKey=='undefined') TheKey='';
easydb.key.value=TheKey;
return TheKey;
}

easydb.updateRow=async(comment='')=>
{
Value=easydb.data();
easydb.console('updateRow',comment,Value);
if(Value=='') {console.trace('No index value for update');return}
easydb.busy(true);
const TheKey=await easydb.key();
if(TheKey=='') {console.trace('No key for update'); return;}
const dataset=await easydb.getKeyRow(comment);
if(dataset=='') {console.trace('No row for update'); return;}
if(typeof dataset!=='object') {console.trace('No object for update'); return;}
dataset[easydb.property()]=Value;
easydb.data(dataset);
easydb.putRow();
}

easydb.table=(TableName='',comment='')=>
{
if(typeof easydb.table.value=='undefined') easydb.table.value='';
if(TableName=='') 
  {
  if(easydb.table.value=='') return '';
  if(typeof easydb.open=='undefined') {console.log('No database'); return '';}
  return easydb.open.result.transaction(easydb.table.value,'readwrite').objectStore(easydb.table.value);
  }
easydb.table.value=TableName;
easydb.console('table',comment,TableName+'-'+easydb.table.value);
}

easydb.tables=(TableName='')=>
{
if(TableName=='') return easydb.tables.array;
if(typeof easydb.tables.array=='undefined') easydb.tables.array=[];
if(easydb.tables.array.includes(TableName)) return;
easydb.tables.array.push(TableName);
}

QueryNameFormatted=(QueryName)=>
{
if(!Array.isArray(QueryName)) return ucfirst(QueryName);
var Name='';
QueryName.forEach((item)=>{Name+=ucfirst(item)});
return Name;
}

easydb.queryNames=(QueryName='')=>
{
if(QueryName=='') return easydb.queryNames.array;
if(typeof easydb.queryNames.array=='undefined') easydb.queryNames.array=[];
var k=easydb.tables().join(',').split(',');
var TableName=k.pop(); //Most recent table name
var obj={};
obj['queryName']=QueryNameFormatted(QueryName);
obj['property']=QueryName;
obj['table']=TableName;
easydb.queryNames.array.push(obj);
}

easydb.queryName=(QueryName='',comment='')=>
{
if(typeof easydb.queryName.value=='undefined') easydb.queryName.value='';
if(QueryName=='') 
  {
  if(easydb.table()=='') return '';
  return easydb.table().index(easydb.queryName.value);
  }
easydb.queryName.value=ucfirst(QueryName);
easydb.console('queryName',comment,QueryName+'-'+easydb.queryName.value);
}

easydb.createQueryName=(IndexObj,table)=>
{
var QueryName=IndexObj['queryName'];
var Property=IndexObj['property'];
table.createIndex(QueryName,Property,{unique:false});
}

easydb.createTable=(TableName)=>
{
easydb.busy(true);
const table=easydb.open.result.createObjectStore(TableName,{keyPath:'id',autoIncrement:true});
var QueryNames=easydb.queryNames();
const TheseQueryNames=QueryNames.filter(o=>o.table==TableName);
TheseQueryNames.forEach((item)=>{easydb.createQueryName(item,table)});
}

ucfirst=(text)=>{return String(text).charAt(0).toUpperCase()+String(text).slice(1)}

//# sourceURL=easydb.js