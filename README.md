# easydb
IndexedDB - Probably the easiest way in the whole wide friggn world.

Are you pissed off about just how stupid the IndexedDB interface is?
Then this is for you.

Use easydb and it will be simple.

Link to the easydb.js file in the usual way: $.getScript('easydb.js'); 

or

<script src='easydb.js'></script>

// Sample Code
idb.busy(true);
idb.tables('Cars');
idb.queryNames('make'); //Searchable index
idb.queryNames('color'); //Searchable index
idb.queryNames(['make','colour']); //Searchable index

idb.tables('People');
idb.queryNames(['age','weight']); //Searchable index
idb.queryNames('age'); //Searchable index

idb.open=indexedDB.open('MyDatabase',1);
idb.open.onerror=(e)=>{Print('IndexedDB error '+ e)}
idb.open.onsuccess=()=>{idb.done()}
idb.open.onerror=()=>{console.log('DB error');}


function CreateNewDataRow(Make)=>
{
DataSet={};
var DataSet['Make']=Toyota;
idb.putRow(DataSet).then(()=>idb.done());
}

function UpdateDataRow(Make)=>
{
DataSet={};
var DataSet['Make']=Toyota;
idb.table('Cars');
idb.putRow(DataSet).then(()=>idb.done());
}

function GetCarMake(Make) {
idb.table('Cars');
idb.queryName('Make');
idb.match(Make);
idb.property('data');
idb.getProperty().then((x)=>{console.log(idb.value(x));idb.done()}); 
}

function GetCarColour(Colour) {
idb.table('Cars');
idb.queryName('Colour');
idb.match(Make);
idb.property('data');
idb.getProperty().then((x)=>{console.log(idb.value(x));idb.done()}); 
}

function GetCarMakeAndColour(Make,Colour) {
idb.table('Cars');
idb.queryName('MakeColour');
idb.match([Make,Colour]);
idb.property('data');
idb.getProperty().then((x)=>{console.log(idb.value(x));idb.done()}); 
}

