(function(){
  // always start a new page at the top (unless a #section link was used)
  if('scrollRestoration' in history) history.scrollRestoration='manual';
  if(!location.hash) window.scrollTo(0,0);
  var root=document.documentElement, key='woodarc-lang';
  function lang(){return root.getAttribute('data-lang')==='en'?'en':'nb'}
  function applyLang(){
    var l=lang();
    document.querySelectorAll('[data-ph-nb]').forEach(function(el){el.placeholder=el.getAttribute('data-ph-'+l)});
    document.querySelectorAll('option[data-nb]').forEach(function(o){o.textContent=o.getAttribute('data-'+l)});
  }
  function set(l){root.setAttribute('data-lang',l);root.setAttribute('lang',l);try{localStorage.setItem(key,l)}catch(e){}applyLang()}
  document.querySelectorAll('[data-l]').forEach(function(b){b.addEventListener('click',function(){set(b.getAttribute('data-l'))})});
  applyLang();

  var bar=document.getElementById('bar');
  function onScroll(){bar.classList.toggle('scrolled',window.scrollY>8)}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  // order form: builds an email the visitor sends from their own mail program
  var form=document.getElementById('orderform');
  if(!form) return;
  var pre=new URLSearchParams(location.search).get('hva');
  if(pre&&form.hva.querySelector('option[value="'+pre+'"]')) form.hva.value=pre;
  var L={
    nb:{subj:'Forespørsel',name:'Navn',contact:'Kontakt',what:'Hva',wood:'Treslag',size:'Størrelse',text:'Tekst',idea:'Idé',when:'Når',hello:'Hei WoodArc,',end:'(Legg gjerne ved bilder eller skisser.)',missing:'Fyll ut feltene merket med *.',copied:'Kopiert!'},
    en:{subj:'Request',name:'Name',contact:'Contact',what:'What',wood:'Wood',size:'Size',text:'Text',idea:'Idea',when:'When',hello:'Hi WoodArc,',end:'(Feel free to attach photos or sketches.)',missing:'Please fill in the fields marked *.',copied:'Copied!'}
  };
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var t=L[lang()], bad=null;
    ['navn','kontakt','hva','ide'].forEach(function(n){var f=form[n];var ok=f.value.trim()!=='';f.classList.toggle('invalid',!ok);if(!ok&&!bad)bad=f});
    if(bad){bad.focus();alertBox(t.missing);return}
    alertBox('');
    var what=form.hva.options[form.hva.selectedIndex].textContent;
    var lines=[t.hello,'',
      t.what+': '+what,
      t.wood+': '+form.treslag.options[form.treslag.selectedIndex].textContent,
      form.storrelse.value.trim()?t.size+': '+form.storrelse.value.trim():null,
      form.nar.value.trim()?t.when+': '+form.nar.value.trim():null,
      form.tekst.value.trim()?'\n'+t.text+':\n'+form.tekst.value.trim():null,
      '\n'+t.idea+':\n'+form.ide.value.trim(),
      '\n'+t.name+': '+form.navn.value.trim(),
      t.contact+': '+form.kontakt.value.trim(),
      '',t.end].filter(function(x){return x!==null});
    var body=lines.join('\n'), subject=t.subj+': '+what+' – '+form.navn.value.trim();
    document.getElementById('fallback-text').value='Til: woodarcdesign@gmail.com\nEmne: '+subject+'\n\n'+body;
    document.getElementById('fallback').hidden=false;
    location.href='mailto:woodarcdesign@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  });
  function alertBox(msg){var a=document.getElementById('formmsg');if(!a){a=document.createElement('p');a.id='formmsg';a.className='formmsg';a.setAttribute('role','alert');form.querySelector('.submit').prepend(a)}a.textContent=msg;a.hidden=!msg}
  document.getElementById('copybtn').addEventListener('click',function(){
    var ta=document.getElementById('fallback-text');ta.select();
    try{navigator.clipboard.writeText(ta.value)}catch(e){document.execCommand('copy')}
    this.textContent=L[lang()].copied;
  });
  form.addEventListener('input',function(e){e.target.classList.remove('invalid')});
})();
