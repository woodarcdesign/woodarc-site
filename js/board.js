/* WoodArc cutting board configurator: live drawing, price and order link.
   Prices and sizes live here — change them in one place. */
(function(){
  var PRICE={S:490,M:790,L:1090}, LOGO=200, OWN=60;
  var DIM={S:[30,20],M:[40,28],L:[50,30]}, DIA={S:25,M:32,L:40}, THICK='2,5';
  var T={
    form:{rekt:['Rektangel','Rectangle'],rund:['Rund','Round'],oval:['Oval','Oval'],egen:['Egen form','Your own shape']},
    grep:{fing:['Fingergrep under, i begge ender','Finger grips underneath, both ends'],uten:['Uten grep','No grip']},
    renne:{ja:['Med saftrenne','With juice groove'],nei:['Uten saftrenne','Without juice groove']},
    tekst:{uten:['Uten tekst','No text'],navn:['Navn','Name'],logo:['Logo','Logo']},
    att:{egen:['Legg ved et bilde eller en tegning av formen du ønsker.','Attach a photo or drawing of the shape you want.'],logo:['Legg ved logoen som bilde.','Attach the logo as an image.']},
    head:{form:['Form','Shape'],grep:['Grep','Grip'],renne:['Saftrenne','Juice groove'],tekst:['Tekst','Text'],str:['Størrelse','Size'],price:['Pris','Price'],see:['Se fjøla','See the board'],chosen:['Valgt fjøl','Chosen board'],from:['fra','from'],quote:['endelig pris etter tegning','final price after the drawing']}
  };
  var DEF={form:'rekt',grep:'fing',renne:'ja',tekst:'navn',str:'M',navn:''};
  var KEYS=['form','grep','renne','tekst','str'];
  var NS='http://www.w3.org/2000/svg';

  function lang(){return document.documentElement.getAttribute('data-lang')==='en'?1:0}
  function both(a){return '<span lang="nb">'+esc(a[0])+'</span><span lang="en">'+esc(a[1])+'</span>'}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  function parse(q){
    var c=Object.assign({},DEF), p=new URLSearchParams(q||location.search), v=(p.get('valg')||'').split('-');
    if(v.length===5){
      if(T.form[v[0]])c.form=v[0]; if(T.grep[v[1]])c.grep=v[1]; if(T.renne[v[2]])c.renne=v[2];
      if(T.tekst[v[3]])c.tekst=v[3]; if(PRICE[v[4]])c.str=v[4];
    }
    c.navn=(p.get('tekst')||'').slice(0,18);
    return fix(c);
  }
  function fix(c){if(c.form==='egen'&&c.grep==='fing')c.grep='uten';return c}
  function code(c){return KEYS.map(function(k){return c[k]}).join('-')}
  function query(c){return 'valg='+code(c)+(c.tekst==='navn'&&c.navn?'&tekst='+encodeURIComponent(c.navn):'')}
  function dims(c){return c.form==='rund'?'Ø '+DIA[c.str]+' cm':DIM[c.str][0]+' × '+DIM[c.str][1]+' cm'}
  function price(c){var p=PRICE[c.str]+(c.tekst==='logo'?LOGO:0)+(c.form==='egen'?OWN:0);return p}
  function kr(n){return n.toLocaleString('nb-NO').replace(/ /g,' ')+' kr'}
  function priceHTML(c){
    var p=kr(price(c));
    return c.form==='egen'?both([T.head.from[0]+' '+p+' – '+T.head.quote[0],T.head.from[1]+' '+p+' – '+T.head.quote[1]]):p;
  }
  function textLine(c,l){
    if(c.tekst==='navn')return T.tekst.navn[l]+(c.navn?': '+c.navn:'');
    return T.tekst[c.tekst][l];
  }
  function summaryHTML(c){
    return [
      [T.head.form,T.form[c.form]],[T.head.grep,T.grep[c.grep]],[T.head.renne,T.renne[c.renne]],
      [T.head.tekst,[textLine(c,0),textLine(c,1)]],[T.head.str,[c.str+' · '+dims(c)+' × 2,5 cm',c.str+' · '+dims(c)+' × 2.5 cm']]
    ].map(function(r){return '<li><b>'+both(r[0])+'</b><span>'+both(r[1])+'</span></li>'}).join('');
  }
  function attachHTML(c){
    var a=[];if(c.form==='egen')a.push(T.att.egen);if(c.tekst==='logo')a.push(T.att.logo);
    return a.map(function(x){return '<p class="cfg-attach">📎 '+both(x)+'</p>'}).join('');
  }
  function emailLines(c){
    var l=lang(), base='https://woodarc.no/skjaerefjoler/?';
    var pr=kr(price(c)); if(c.form==='egen')pr=T.head.from[l]+' '+pr+' ('+T.head.quote[l]+')';
    return [
      T.head.chosen[l]+':',
      '- '+T.head.form[l]+': '+T.form[c.form][l],
      '- '+T.head.grep[l]+': '+T.grep[c.grep][l],
      '- '+T.head.renne[l]+': '+T.renne[c.renne][l],
      '- '+T.head.tekst[l]+': '+textLine(c,l),
      '- '+T.head.str[l]+': '+c.str+', '+dims(c)+' × '+(l?'2.5':'2,5')+' cm',
      '- '+T.head.price[l]+': '+pr,
      T.head.see[l]+': '+base+query(c)+'#velg'
    ].concat(c.form==='egen'?['','>>> '+T.att.egen[l]]:[]).concat(c.tekst==='logo'?[(c.form==='egen'?'':'\n')+'>>> '+T.att.logo[l]]:[]);
  }

  /* ---------- drawing ---------- */
  var FISH='M8 30c0-10 10-16 24-16 12 0 22 6 28 14l6-8c2-2 5-1 5 2l-2 12 2 10c0 3-3 4-5 2l-6-6c-6 6-16 10-28 10C18 50 8 42 8 30z';
  var FB=[8,12.6,71,50.2]; // fish bounding box in its own units
  function el(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
  function shape(c,x,y,w,h,attrs,parent){
    var a=Object.assign({},attrs);
    if(c.form==='rekt'){a.x=x;a.y=y;a.width=w;a.height=h;a.rx=Math.min(w,h)*0.09;return el('rect',a,parent)}
    if(c.form==='rund'||c.form==='oval'){a.cx=x+w/2;a.cy=y+h/2;a.rx=w/2;a.ry=h/2;return el('ellipse',a,parent)}
    var sx=w/(FB[2]-FB[0]), sy=h/(FB[3]-FB[1]);
    a.d=FISH;a.transform='translate('+x+' '+y+') scale('+sx+' '+sy+') translate('+(-FB[0])+' '+(-FB[1])+')';
    a['vector-effect']='non-scaling-stroke';return el('path',a,parent);
  }
  function draw(svg,c,side){
    var back=side==='back';
    while(svg.firstChild)svg.removeChild(svg.firstChild);
    var W=400,H=290,k=5.6;
    var wcm=c.form==='rund'?DIA[c.str]:DIM[c.str][0], hcm=c.form==='rund'?DIA[c.str]:DIM[c.str][1];
    var w=wcm*k,h=hcm*k,x=(W-w)/2,y=(H-h)/2, cm=k;
    var id='b'+Math.random().toString(36).slice(2,7);
    if(back)svg=el('g',{transform:'translate('+W+' 0) scale(-1 1)'},svg);
    var defs=el('defs',{},svg), cp=el('clipPath',{id:id},defs); shape(c,x,y,w,h,{},cp);
    // shadow + board
    shape(c,x+3,y+5,w,h,{fill:'rgba(60,35,15,.12)'},svg);
    shape(c,x,y,w,h,{fill:'#D9B079',stroke:'#8A5A2B','stroke-width':2},svg);
    // grain
    var g=el('g',{'clip-path':'url(#'+id+')',stroke:'#B9884F','stroke-width':1,fill:'none',opacity:.55},svg);
    for(var i=1;i<9;i++){var yy=y+h*i/9;el('path',{d:'M'+x+' '+yy+' C '+(x+w*.3)+' '+(yy-4)+', '+(x+w*.6)+' '+(yy+5)+', '+(x+w)+' '+(yy-2)},g)}
    var cut={fill:'none',stroke:'#7A4E22','stroke-width':2.2};
    var endIn=1.7*cm, sideIn=1.7*cm;
    // juice groove
    if(c.renne==='ja'&&!back){
      if(c.form==='egen')el('ellipse',Object.assign({cx:x+w*.40,cy:y+h*.49,rx:w*.29,ry:h*.30},cut),svg);
      else if(c.form==='rund')shape(c,x+endIn,y+endIn,w-2*endIn,h-2*endIn,cut,svg);
      else shape(c,x+endIn,y+sideIn,w-2*endIn,h-2*sideIn,cut,svg);
    }
    // grips / hole
    var dark={fill:'#B98A55',stroke:'#7A4E22','stroke-width':1.6};
    if(c.grep==='fing'&&back){
      // D-shaped pockets cut into the underside, open through the end edges
      var gh=Math.min(9,hcm*.42)*cm, d=2.2*cm, cy0=y+h/2, pk={fill:'#B98A55',stroke:'#7A4E22','stroke-width':1.6,'clip-path':'url(#'+id+')'};
      var lx=x, rx=x+w;
      el('path',Object.assign({d:'M'+(lx-2)+' '+(cy0-gh/2)+' C '+(lx+d*1.25)+' '+(cy0-gh/2)+', '+(lx+d*1.25)+' '+(cy0+gh/2)+', '+(lx-2)+' '+(cy0+gh/2)+' Z'},pk),svg);
      el('path',Object.assign({d:'M'+(rx+2)+' '+(cy0-gh/2)+' C '+(rx-d*1.25)+' '+(cy0-gh/2)+', '+(rx-d*1.25)+' '+(cy0+gh/2)+', '+(rx+2)+' '+(cy0+gh/2)+' Z'},pk),svg);
    }
    // text / logo: kept out of the main cutting area (bottom-right corner on rectangles, bottom on round/oval/own)
    if(back)return;
    var ax,ay,anc,room;
    if(c.form==='rekt'){ax=x+w-3*cm;ay=y+h-3*cm;anc='end';room=w*.55}
    else if(c.form==='egen'){ax=x+w*.40;ay=y+h*.74;anc='middle';room=w*.32}
    else{ax=x+w/2;ay=y+h-(c.form==='rund'?4.2:3.6)*cm;anc='middle';room=w*(c.form==='rund'?.45:.45)}
    if(c.tekst==='navn'){
      var t=c.navn||(lang()?'Name':'Navn'), fs=Math.min(2.8*cm,room/Math.max(3,t.length)*1.75);
      var tx=el('text',{x:ax,y:ay,'text-anchor':anc,'font-family':'Georgia,serif','font-size':fs,fill:'#6B4320',opacity:c.navn?.95:.45},svg);
      tx.textContent=t;
    } else if(c.tekst==='logo'){
      var r=2*cm, cx=anc==='end'?ax-r:ax, cy=ay-r*.7, pts=[];
      for(var j=0;j<10;j++){var a=-Math.PI/2+j*Math.PI/5, rr=j%2?r*.45:r;pts.push((cx+rr*Math.cos(a)).toFixed(1)+','+(cy+rr*Math.sin(a)).toFixed(1))}
      el('polygon',{points:pts.join(' '),fill:'none',stroke:'#6B4320','stroke-width':1.8},svg);
    }
  }

  window.WoodArcBoard={attachHTML:attachHTML,parse:parse,fix:fix,query:query,draw:draw,summaryHTML:summaryHTML,priceHTML:priceHTML,emailLines:emailLines,dims:dims};

  /* ---------- configurator on the cutting board page ---------- */
  var form=document.getElementById('cfg');
  if(!form)return;
  var svg=document.getElementById('cfg-svg'), sum=document.getElementById('cfg-sum'), pr=document.getElementById('cfg-price'),
      go=document.getElementById('cfg-go'), nameWrap=document.getElementById('cfg-navn-wrap'), nameIn=document.getElementById('cfg-navn'), backFig=document.getElementById('cfg-back'), backSvg=document.getElementById('cfg-svg-back'), att=document.getElementById('cfg-attach'), bar=document.getElementById('cfg-bar'), barGo=document.getElementById('cfg-bar-go'), barTxt=document.getElementById('cfg-bar-txt');
  var c=parse();
  function read(){
    KEYS.forEach(function(k){var r=form.querySelector('input[name="'+k+'"]:checked');if(r)c[k]=r.value});
    c.navn=nameIn.value.slice(0,18); fix(c); write();
  }
  function write(){
    KEYS.forEach(function(k){var r=form.querySelector('input[name="'+k+'"][value="'+c[k]+'"]');if(r)r.checked=true});
    var fing=form.querySelector('input[name="grep"][value="fing"]');
    fing.disabled=c.form==='egen'; fing.closest('label').classList.toggle('off',fing.disabled);
    nameWrap.hidden=c.tekst!=='navn';
    form.querySelectorAll('[data-dim]').forEach(function(s){var z=s.getAttribute('data-dim');s.textContent=c.form==='rund'?'Ø '+DIA[z]+' cm':DIM[z][0]+' × '+DIM[z][1]+' cm'});
    draw(svg,c); backFig.hidden=c.grep!=='fing'; if(c.grep==='fing')draw(backSvg,c,'back'); sum.innerHTML=summaryHTML(c); pr.innerHTML=priceHTML(c); att.innerHTML=attachHTML(c);
    go.href='../bestill/?hva=skjaerefjoler&'+query(c);
    if(bar){barGo.href=go.href;barTxt.innerHTML='<b>'+priceHTML(c)+'</b><span>'+c.str+' · '+both(T.form[c.form])+'</span>'}
    try{history.replaceState(null,'','?'+query(c)+location.hash)}catch(e){}
  }
  nameIn.value=c.navn;
  form.addEventListener('change',read); nameIn.addEventListener('input',read);
  document.querySelectorAll('[data-l]').forEach(function(b){b.addEventListener('click',function(){draw(svg,c);if(c.grep==='fing')draw(backSvg,c,'back')})});
  write();
  if(bar&&'IntersectionObserver' in window){
    var inSec=false, prevVis=false, upd=function(){bar.classList.toggle('show',inSec&&!prevVis)};
    new IntersectionObserver(function(e){inSec=e[0].isIntersecting;upd()}).observe(document.getElementById('velg'));
    new IntersectionObserver(function(e){prevVis=e[0].isIntersecting;upd()},{threshold:.15}).observe(document.querySelector('.cfg-preview'));
    barTxt.addEventListener('click',function(){document.querySelector('.cfg-preview').scrollIntoView({behavior:'smooth',block:'center'})});
  }
  if(new URLSearchParams(location.search).get('valg')&&location.hash==='#velg'){var s=document.getElementById('velg');if(s)setTimeout(function(){s.scrollIntoView()},50)}
})();
