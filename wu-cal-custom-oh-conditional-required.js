(()=>{'use strict';
if(window.__ohRules)return;
const rules=[
['Ist im Zuge der Veranstaltung eine Verteilung geplant','-1003123026'],
['Handelt es sich um eine Veranstaltung gemäß §5 HSG','-1003123039'],
['Werden Teilnehmer*innengebühren oder Eintrittsgelder eingehoben','-1003123020'],
['Handelt es sich um eine Kooperationsveranstaltung','-1003123009']];
const normal=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase().replace(/[?*.:]+$/g,'');
const states=new Map();
let pending=false;
function refresh(force=false){
 const root=document.querySelector('app-event-info app-dynamic-form');
 if(!root)return [];
 const fields=[...root.querySelectorAll('mat-form-field')];
 const missing=[];
 for(const [name,id] of rules){
  const source=fields.find(f=>normal(f.querySelector('mat-label')?.textContent)===normal(name));
  const target=root.querySelector('input[id="'+id+'"]');
  const input=target, label=input?.closest('mat-form-field')?.querySelector('mat-label');
  if(!source||!input||!label)continue;
  let s=states.get(id);
  if(!s||s.input!==input){
   s?.mark.remove();s?.error.remove();
   const mark=document.createElement('span');mark.textContent=' *';mark.style.color='#d32f2f';mark.setAttribute('aria-hidden','true');label.append(mark);
   const error=document.createElement('div');error.textContent='Dieses Feld ist bei Ja verpflichtend.';error.style.color='#d32f2f';error.hidden=true;input.closest('mat-form-field').append(error);
   s={input,mark,error,original:input.hasAttribute('required'),aria:input.getAttribute('aria-required')};states.set(id,s);
  }
  const chosen=normal(source.querySelector('.mat-mdc-select-value-text,.mat-mdc-select-min-line')?.textContent);
  const yes=/^ja\b/.test(chosen), invalid=yes&&!input.value.trim();
  s.mark.hidden=!yes;
  input.toggleAttribute('required',yes||s.original);
  input.setAttribute('aria-required',String(yes||s.original));
  if(!invalid)input.setCustomValidity('');
  else if(force)input.setCustomValidity('Dieses Feld ist bei Ja verpflichtend.');
  s.error.hidden=!(force&&invalid);
  if(invalid)missing.push(input);
 }
 return missing;
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;refresh()})}
function guard(e){
 if(e.type==='click'&&normal(e.target.closest('button,a')?.textContent)!==normal('Zur Übersicht gehen'))return;
 const invalid=refresh(true);if(!invalid.length)return;
 e.preventDefault();e.stopImmediatePropagation();invalid[0].focus();invalid[0].reportValidity();
}
const observer=new MutationObserver(schedule);
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
document.addEventListener('click',guard,true);
document.addEventListener('submit',guard,true);
document.addEventListener('input',schedule,true);
window.__ohRules={refresh,stop(){observer.disconnect();document.removeEventListener('click',guard,true);document.removeEventListener('submit',guard,true);document.removeEventListener('input',schedule,true);for(const s of states.values()){s.mark.remove();s.error.remove();s.input.setCustomValidity('');s.input.toggleAttribute('required',s.original);if(s.aria===null)s.input.removeAttribute('aria-required');else s.input.setAttribute('aria-required',s.aria)}states.clear();delete window.__ohRules}};
schedule();
})();