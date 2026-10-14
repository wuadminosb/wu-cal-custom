(() => {
'use strict';
const WU='#0085AD', SG='.wu-series-weekdays', RS='.usi-searchResults-sidebar', RG='.usi-dayOfWeekButtons';
const imp=(e,p,v)=>e&&e.style.setProperty(p,v,'important');
const weekend=t=>['0','6'].includes(t.getAttribute('value'));
const state=t=>{
  const b=t.querySelector('.mat-button-toggle-button'); if(!b||weekend(t)) return;
  const on=b.getAttribute('aria-pressed')==='true', bg=on?WU:'#fff', fg=on?'#fff':WU;
  imp(t,'background-color',bg); imp(t,'border-color',WU); imp(t,'color',fg);
  imp(b,'background-color',bg); imp(b,'color',fg); imp(b.querySelector('.mat-button-toggle-label-content'),'color',fg);
};
const watch=t=>{
  const b=t.querySelector('.mat-button-toggle-button'); if(!b||b.dataset.wuObs) return;
  b.dataset.wuObs='1'; new MutationObserver(()=>state(t)).observe(b,{attributes:true,attributeFilter:['aria-pressed']});
};
const searchWeekly=()=>document.querySelectorAll(SG).forEach(g=>{
  if(g.closest(RS)) return;
  g.querySelectorAll('mat-button-toggle').forEach(t=>{ if(!weekend(t)){state(t);watch(t);} });
});
const field=(root,label)=>[...root.querySelectorAll('mat-form-field')].find(f=>[...f.querySelectorAll('mat-label')].some(l=>l.textContent.trim()===label))||null;
const sidebarField=f=>{
  if(!f)return;
  [['display','flex'],['width','100%'],['max-width','100%'],['min-width','0'],['margin','0 0 8px 0'],['padding','0']].forEach(x=>imp(f,...x));
  ['.mat-mdc-text-field-wrapper','.mat-mdc-form-field-flex','.mdc-notched-outline'].forEach(s=>{const e=f.querySelector(s);imp(e,'width','100%');imp(e,'max-width','100%');});
  const i=f.querySelector('.mat-mdc-form-field-infix'); if(i){imp(i,'width','auto');imp(i,'min-width','0');imp(i,'max-width','none');imp(i,'flex','1 1 auto');}
};
const weeklyResults=(repeat,g)=>{
  if(g.previousElementSibling!==repeat) repeat.insertAdjacentElement('afterend',g);
  [['display','flex'],['position','static'],['width','auto'],['height','36px'],['gap','8px'],['margin','8px 0 14px 0'],['padding','0'],['border','0'],['overflow','visible'],['background','transparent']].forEach(x=>imp(g,...x));
  g.querySelectorAll('mat-button-toggle').forEach(t=>{
    if(weekend(t)){imp(t,'display','none');return;}
    const b=t.querySelector('.mat-button-toggle-button'), l=b?.querySelector('.mat-button-toggle-label-content'); if(!b)return;
    [['display','flex'],['flex','0 0 48px'],['width','48px'],['min-width','48px'],['max-width','48px'],['height','36px'],['margin','0'],['padding','0'],['border','1px solid '+WU],['border-radius','0'],['box-shadow','none'],['overflow','hidden']].forEach(x=>imp(t,...x));
    [['display','flex'],['align-items','center'],['justify-content','center'],['width','48px'],['min-width','48px'],['height','34px'],['margin','0'],['padding','0'],['border','0'],['border-radius','0'],['box-shadow','none']].forEach(x=>imp(b,...x));
    if(l)[['display','block'],['width','100%'],['pading','0'],['margin','0'],['line-height','34px'],['text-align','center'],['font-size','14px'],['font-weight','400']].forEach(x=>imp(l,...x));
    state(t);watch(t);
  });
};
const results=()=>{
  if(!location.pathname.includes('/searchresults'))return;
  const s=document.querySelector(RS); if(!s)return;
  const repeat=s.querySelector('.wu-repeat-field')||field(s,'Wiederholt'); if(!repeat)return;
  const txt=(repeat.textContent||'').replace(/\s+/g,' ').trim();
  if(/Monatlich/i.test(txt)){
    const ord=field(s,'Wiederkehrend jede'), day=field(s,'Tag');
    if(ord&&day){ if(ord.previousElementSibling!==repeat)repeat.insertAdjacentElement('afterend',ord); if(day.previousElementSibling!==ord)ord.insertAdjacentElement('afterend',day); [repeat,ord,day].forEach(sidebarField); }
  } else if(/Wöchentlich/i.test(txt)){
    const g=s.querySelector(RG); if(g)weeklyResults(repeat,g);
  }
};
const hideSat=()=>{
  if(!location.pathname.includes('/search'))return;
  document.querySelectorAll('.cdk-overlay-container [role="option"],.cdk-overlay-container mat-option,.cdk-overlay-container .mat-mdc-option,.cdk-overlay-container .mat-option,.mat-mdc-select-panel [role="option"],.mat-select-panel [role="option"]').forEach(o=>{
    if((o.textContent||'').replace(/\s+/g,' ').trim()==='Samstag'){imp(o,'display','none');o.setAttribute('aria-hidden','true');}
  });
};
let pending=false;
const refresh=()=>{pending=false;searchWeekly();results();hideSat();};
const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(refresh);};
const init=()=>{refresh();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});const ov=document.querySelector('.cdk-overlay-container')||document.body;new MutationObserver(()=>requestAnimationFrame(hideSat)).observe(ov,{subtree:true,childList:true});};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded', init,{once:true}):init();
})();