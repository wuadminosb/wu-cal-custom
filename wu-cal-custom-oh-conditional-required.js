(()=>{'use strict';
window.__ohRules?.stop?.();
const rules=[['verteilung geplant','-1003123026'],['§5 hsg','-1003123039'],['eintrittsgelder eingehoben','-1003123020'],['kooperationsveranstaltung','-1003123009']];
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('de');
const saved=new Map();let queued=false,stopped=false,locked=null;
function button(){return [...document.querySelectorAll('button')].find(b=>norm(b.textContent).includes('zur übersicht gehen'))}
function unlock(){if(locked?.dataset.ohLock==='1'){locked.disabled=false;delete locked.dataset.ohLock}locked=null}
function check(report=false){
const fields=[...document.querySelectorAll('mat-form-field')],missing=[];
for(const [label,id] of rules){
 const source=fields.find(f=>norm(f.querySelector('mat-label')?.textContent).includes(label)&&f.querySelector('mat-select')&&f.getClientRects().length);
 const input=document.getElementById(id);
 if(!source||!input||!input.isConnected)continue;
 if(!saved.has(input))saved.set(input,{required:input.required,aria:input.getAttribute('aria-required')});
 const selection=norm(source.querySelector('.mat-mdc-select-min-line,.mat-mdc-select-value-text,.mat-select-value-text')?.textContent);
 const active=/^ja(?:$|[\s.,;:!()\-])/.test(selection),empty=!String(input.value||'').trim();
 const wanted=saved.get(input).required||active;
 if(input.required!==wanted)input.required=wanted;
 if(input.getAttribute('aria-required')!==String(wanted))input.setAttribute('aria-required',String(wanted));
 if(!active||!empty)input.setCustomValidity('');
 if(active&&empty){missing.push(input);if(report)input.setCustomValidity('Bei Ja ist dieses Feld verpflichtend.')}
}
const next=button();
if(locked&&locked!==next)unlock();
if(next&&missing.length&&!next.disabled){next.disabled=true;next.dataset.ohLock='1';locked=next}
if(!missing.length)unlock();
return missing;
}
function schedule(){if(queued||stopped)return;queued=true;requestAnimationFrame(()=>{queued=false;check()})}
function guard(e){
 if(e.type==='click'&&!norm(e.target.closest?.('button')?.textContent).includes('zur übersicht gehen'))return;
 const missing=check(true);if(!missing.length)return;
 e.preventDefault();e.stopImmediatePropagation();missing[0].focus();missing[0].reportValidity();
}
const obs=new MutationObserver(schedule);
obs.observe(document.body,{childList:true,subtree:true,characterData:true});
for(const t of ['input','change'])document.addEventListener(t,schedule,true);
for(const t of ['click','submit'])document.addEventListener(t,guard,true);
window.__ohRules={version:'20261002-3',check,stop(){
 stopped=true;obs.disconnect();
 for(const t of ['input','change'])document.removeEventListener(t,schedule,true);
 for(const t of ['click','submit'])document.removeEventListener(t,guard,true);
 unlock();
 for(const [input,v] of saved){if(!input.isConnected)continue;input.required=v.required;
 if(v.aria===null)input.removeAttribute('aria-required');else input.setAttribute('aria-required',v.aria);
 input.setCustomValidity('')}
 saved.clear();delete window.__ohRules;
}};
schedule();
})();