(()=>{'use strict';
if(window.__ohRules?.stop)window.__ohRules.stop();
const R=[['verteilung geplant','-1003123026'],['§5 hsg','-1003123039'],['eintrittsgelder eingehoben','-1003123020'],['kooperationsveranstaltung','-1003123009']];
const n=s=>String(s||'').toLocaleLowerCase('de').replace(/\s+/g,' ').trim();
let queued=false,button=null;
function scan(){
 const root=document.querySelector('app-event-info');if(!root)return [];
 const fields=[...root.querySelectorAll('mat-form-field')],missing=[];
 for(const [question,id] of R){
  const source=fields.find(f=>n(f.querySelector('mat-label')?.textContent).includes(question));
  const input=document.getElementById(id);
  if(!source||!input||!root.contains(input))continue;
  const selected=n(source.querySelector('.mat-mdc-select-min-line,.mat-mdc-select-value-text,.mat-select-value-text')?.textContent);
  const required=/^ja($|[\s.,:;!()-])/.test(selected);
  const empty=!input.value.trim();
  input.required=required;
  input.setAttribute('aria-required',String(required));
  if(required&&empty)missing.push(input);
 }
 const next=[...document.querySelectorAll('button')].find(b=>n(b.textContent).includes('zur übersicht gehen'));
 if(button&&button!==next&&button.dataset.oehLock==='1'){button.disabled=false;delete button.dataset.oehLock}
 button=next||null;
 if(button){
  if(missing.length&&!button.disabled){button.disabled=true;button.dataset.oehLock='1'}
  if(!missing.length&&button.dataset.oehLock==='1'){button.disabled=false;delete button.dataset.oehLock}
 }
 return missing;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})}
function guard(e){
 if(e.type==='click'&&!n(e.target.closest?.('button')?.textContent).includes('zur übersicht gehen'))return;
 if(e.type==='submit'&&!e.target.closest?.('app-event-info'))return;
 const missing=scan();if(!missing.length)return;
 e.preventDefault();e.stopImmediatePropagation();missing[0].focus();missing[0].reportValidity();
}
const obs=new MutationObserver(schedule);
obs.observe(document.body,{childList:true,subtree:true,characterData:true});
for(const t of ['input','change'])document.addEventListener(t,schedule,true);
for(const t of ['click','submit'])document.addEventListener(t,guard,true);
window.__ohRules={version:'20261002-2',check:scan,stop(){
 obs.disconnect();
 for(const t of ['input','change'])document.removeEventListener(t,schedule,true);
 for(const t of ['click','submit'])document.removeEventListener(t,guard,true);
 if(button?.dataset.oehLock==='1'){button.disabled=false;delete button.dataset.oehLock}
 delete window.__ohRules;
}};
schedule();
})();