(()=>{'use strict';
const KEY='__wuOehRequester';window[KEY]?.stop?.();
const norm=s=>String(s??'').replace(/\s+/g,' ').trim().toLocaleLowerCase('de');
const visible=new Set(['fraktion','club','sonstiges']);
const find=text=>[...document.querySelectorAll('mat-form-field')].find(f=>norm(f.querySelector('mat-label')?.textContent).includes(text));
const btn=()=>[...document.querySelectorAll('button')].find(b=>norm(b.textContent).includes('zur übersicht gehen'));
let scheduled=false,stopped=false,locked=null,original=null;
// Never unlock a button while another OEH conditional field is missing.
function release(){if(locked?.dataset.oehRequesterLock==='1'){locked.disabled=!!window.__ohRules?.check?.().length;delete locked.dataset.oehRequesterLock}locked=null;}
function restore(){if(!original)return;
if(original.field.isConnected)original.field.style.display=original.display;
if(original.input.isConnected){original.input.required=original.required;original.input.setCustomValidity('');
if(original.aria===null)original.input.removeAttribute('aria-required');else original.input.setAttribute('aria-required',original.aria)}
original=null}
function check(){
const source=find('für wen wird die raumanfrage gestellt'),field=find('bezeichnung der fraktion');
const input=field?.querySelector('input:not([type="hidden"]),textarea');
if(!source||!field||!input){restore();release();return []}
if(original?.input!==input){restore();original={field,input,display:field.style.display,required:input.required,aria:input.getAttribute('aria-required')}}
const choice=norm(source.querySelector('.mat-mdc-select-min-line,.mat-mdc-select-value-text,.mat-select-value-text')?.textContent);
const show=visible.has(choice),missing=show&&!input.value.trim();
const display=show?original.display:'none';
if(field.style.display!==display)field.style.display=display;
if(input.required!==show)input.required=show;
if(input.getAttribute('aria-required')!==String(show))input.setAttribute('aria-required',String(show));
if(!missing)input.setCustomValidity('');
const b=btn();if(b!==locked)release();
if(missing&&b&&!b.disabled){b.disabled=true;b.dataset.oehRequesterLock='1';locked=b}
else if(!missing)release();
return missing?[input]:[]
}
function tick(){if(scheduled||stopped)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(!stopped)check()})}
function guard(e){if(e.type==='click'){const b=e.target.closest?.('button');if(!b||!norm(b.textContent).includes('zur übersicht gehen'))return}
const missing=check();if(!missing.length)return;e.preventDefault();e.stopImmediatePropagation();
missing[0].setCustomValidity('Bei dieser Auswahl ist die Bezeichnung erforderlich.');missing[0].focus();missing[0].reportValidity()}
const obs=new MutationObserver(tick);obs.observe(document.body,{subtree:true,childList:true});
for(const e of ['input','change'])document.addEventListener(e,tick,true);
for(const e of ['click','submit'])document.addEventListener(e,guard,true);
window[KEY]={version:'20261002-5',check,stop(){stopped=true;obs.disconnect();
for(const e of ['input','change'])document.removeEventListener(e,tick,true);
for(const e of ['click','submit'])document.removeEventListener(e,guard,true);
release();restore();delete window[KEY]}};
tick()})();