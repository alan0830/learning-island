/* 美式／英式拼字對照（常見差異） */
(function(){
  var pairs=[
    ['color','colour'],['favor','favour'],['honor','honour'],['labor','labour'],['neighbor','neighbour'],
    ['behavior','behaviour'],['flavor','flavour'],['humor','humour'],['rumor','rumour'],['vapor','vapour'],
    ['organize','organise'],['realize','realise'],['recognize','recognise'],['analyze','analyse'],
    ['apologize','apologise'],['criticize','criticise'],['emphasize','emphasise'],['summarize','summarise'],
    ['memorize','memorise'],['normalize','normalise'],['prioritize','prioritise'],
    ['center','centre'],['theater','theatre'],['meter','metre'],['liter','litre'],['fiber','fibre'],
    ['traveler','traveller'],['traveling','travelling'],['canceled','cancelled'],['modeling','modelling'],['labeled','labelled'],
    ['defense','defence'],['offense','offence'],['license','licence'],
    ['catalog','catalogue'],['dialog','dialogue'],['analog','analogue'],
    ['gray','grey'],['plow','plough'],['skeptical','sceptical'],['maneuver','manoeuvre'],
    ['airplane','aeroplane'],['aluminum','aluminium'],['mom','mum'],['tire','tyre'],['curb','kerb'],
    ['pajamas','pyjamas'],['mustache','moustache'],['jewelry','jewellery'],['counselor','counsellor'],
    ['fulfill','fulfil'],['enroll','enrol'],['skillful','skilful']
  ];
  var US={},UK={};
  pairs.forEach(function(p){US[p[1]]=p[0];UK[p[0]]=p[1]});
  function convert(w,map){
    w=String(w||''); var k=w.toLowerCase(); if(!k) return w;
    if(map[k]) return map[k];
    var m=k.match(/^(.*?)(ers|ing|ed|es|er|ly|s)$/);
    if(m && m[2]==='ers' && map[m[1]+'er']) return map[m[1]+'er']+'s';
    if(m && map[m[1]]) return map[m[1]]+m[2];
    if(m && (m[2]==='ing'||m[2]==='ed'||m[2]==='es') && map[m[1]+'e']){
      var b=map[m[1]+'e'];
      if(m[2]==='es') return b+'s';
      return (/e$/.test(b)?b.slice(0,-1):b)+m[2];
    }
    return k;
  }
  window.toUS=function(w){return convert(w,US)};
  window.toUK=function(w){return convert(w,UK)};
  window.pattyVariant=function(w,mode){return mode==='uk'?window.toUK(w):window.toUS(w)};
})();
