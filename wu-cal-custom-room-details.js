(function () {
'use strict';
const KEY='AD.0.122', ROOT='app-space-details', STYLE='wu-room-details-v2-style';
const CFG={
name:'Sitzungssaal 2',
verified:'2026-08-26',
source:'https://www.wu.ac.at/universitaet/organisation/dienstleistungseinrichtungen/campusmanagement/veranstaltungsmanagement/raeume/sitzungssaal-2',
details:[['Raumnummer','AD.0.122'],['Bestuhlung','flexibel'],['Catering','kaltes Catering möglich'],['Fläche','76 m²'],['Bühne','keine Bühne']],
tech:[
['Projektion','<dl><div><dt>Ausstattung</dt><dd>1 Deckenprojektor Sony VPL-PHZ10</dd></div><div><dt>Bildformat</dt><dd>16:10</dd></div><div><dt>Standardauflösung</dt><dd>1280 × 800 Pixel</dd></div></dl>'],
['PC','<dl><div><dt>Vortragenden-PC</dt><dd>Lenovo M910Q</dd></div></dl>'],
['Lautsprecher','<dl><div><dt>Ausstattung</dt><dd>2 fest verbaute Lautsprecher</dd></div><div><dt>Modell</dt><dd>JBL Control 1 Pro</dd></div></dl>'],
['Mikrofone','<dl><div><dt>Funkmikrofone</dt><dd>Maximal 1 Funkmikrofon gleichzeitig</dd></div><div><dt>Varianten</dt><dd>Taschensender oder Handsender</dd></div><div><dt>Modelle</dt><dd>Sennheiser SKM 300 und SK 300</dd></div></dl>'],
['Vortragendentisch','<dl><div><dt>Ausführung</dt><dd>Fix verbauter Vortragendentisch</dd></div><div><dt>Anschlüsse</dt><dd>1 HDMI-Anschluss und 1 USB-Anschluss</dd></div></dl>'],
['Wireless Presenter','<p>Die Bereitstellung und Reservierung erfolgt nach Verfügbarkeit und Absprache mit dem Technik-Team.</p><p>Presenter zum Weiterschalten von Folien inklusive Laserpointer, ohne direkt am Vortragendentisch stehen zu müssen.</p>','Buchbare Zusatzausstattung'],
['Kabel und Adapter','<p>Diverse Multimedia-Kabel und Adapter können auf Nachfrage bereitgestellt werden.</p><ul><li>HDMI-Kabel</li><li>DisplayPort-zu-HDMI-Adapter</li><li>Mini-DisplayPort-zu-HDMI-Adapter</li><li>XLR-Kabel</li></ul>','Buchbare Zusatzausstattung']
],
settings:[
['32 Klassenzimmer','https://www.wu.ac.at/fileadmin/wu/_processed_/b/f/csm_Klassenzimmer_32_450d0cdf1b.png','https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Sitzungssaal2/Klassenzimmer_32.pdf'],
['30 Theater','https://www.wu.ac.at/fileadmin/wu/_processed_/1/7/csm_AD_-_SS_2_-_Theaterbestuhlung_30_Pax_-_Setting_2_5f145cad9e.png','https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Sitzungssaal2/AD_-_SS_2_-_Theaterbestuhlung_30_Pax_-_Setting_2.pdf'],
['30 Konferenz Standard','https://www.wu.ac.at/fileadmin/wu/_processed_/3/2/csm_Konferenzbestuhlung_30_Pax_-_Standard_fd4763e062.png','https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Sitzungssaal2/Konferenzbestuhlung_30_Pax_-_Standard.pdf'],
['25 U-Form','https://www.wu.ac.at/fileadmin/wu/_processed_/2/5/csm_U_Form_25_51d25c422b.png','https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Sitzungssaal2/U_Form_25.pdf'],
['30 Sesselkreis','https://www.wu.ac.at/fileadmin/wu/_processed_/2/b/csm_Sesselkreis_30_679c18976c.png','https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Sitzungssaal2/Sesselkreis_30.pdf'],
['30 Tischgruppen 5er je 6 Sessel','https://www.wu.ac.at/fileadmin/wu/_processed_/c/4/csm_Tischgruppen_5_er_je_6_Sessel_30_c1252434c9.png','https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Sitzungssaal2/Tischgruppen_5_er_je_6_Sessel_30.pdf']
]};
function norm(v){return String(v||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim().toLowerCase()}
function addStyles(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`
${ROOT}[data-wu-room-v2]{--b:#0b80a7;--bd:#075f7d;--br:#d2d2d2;--tx:#262626}
${ROOT}[data-wu-room-v2] .usi-spaceFeatures,${ROOT}[data-wu-room-v2] .usi-spaceSetups{display:none!important}
.wu-r-row{display:flex!important;align-items:flex-start!important;gap:24px!important;width:100%!important;height:auto!important;overflow:visible!important}
.wu-r-gallery{flex:1 1 auto!important;min-width:0!important;max-width:calc(100% - 454px)!important}
.wu-r-side{position:static!important;display:block!important;flex:0 0 430px!important;width:430px!important;max-width:430px!important;height:auto!important;overflow:visible!important;transform:none!important}
.wu-r-side .usi-spaceDetailsContainer,.wu-r-side .usi-detailsInfo{width:100%!important;height:auto!important;overflow:visible!important;max-width:100%!important}
.wu-r-side .usi-detailsLine,.wu-r-detail{display:flex!important;gap:16px!important;padding:9px 0!important;border-bottom:1px solid var(--br)!important}
.wu-r-side .usi-detailsLine>.label,.wu-r-detail dt{flex:0 0 42%!important;margin:0!important;color:#666!important;font-size:12px!important;font-weight:700!important}
.wu-r-side .usi-detailsLine>.usi-detail,.wu-r-detail dd{flex:1!important;margin:0!important;font-size:12px!important;white-space:nowrap!important}
.wu-r-nav{display:grid!important;grid-template-columns:minmax(110px,auto) 1fr minmax(110px,auto)!important;align-items:center!important;gap:12px!important;margin:12px 0!important}
.wu-r-nav button,.wu-r-pdf{border:0!important;background:var(--b)!important;color:#fff!important;font-weight:700!important;cursor:pointer!important;text-decoration:none!important}
.wu-r-nav button{min-height:44px!important;padding:9px 16px!important;font-size:14px!important}
.wu-r-count{text-align:center!important;font-size:13px!important;font-weight:700!important}
.wu-r-gallery .usi-thumbnailButtons{opacity:.68!important}.wu-r-gallery .usi-thumbnailButtons.wu-r-active{opacity:1!important;box-shadow:0 0 0 3px var(--b)!important}
.wu-r-section{width:100%!important;margin:45px 0 0!important;font-family:Verdana,Arial,sans-serif!important;color:var(--tx)!important}
.wu-r-section>h2{margin:0 0 20px!important;padding:0 0 12px!important;border-bottom:4px solid var(--b)!important;font-size:27px!important}
.wu-r-sub{margin:34px 0 14px!important;padding:0 0 9px!important;border-bottom:3px solid var(--bd)!important;font-size:17px!important}
.wu-r-tech{margin:0 0 8px!important;border:1px solid var(--br)!important}
.wu-r-tech>summary{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:16px 20px!important;background:#f4f4f4!important;font-size:17px!important;font-weight:700!important;cursor:pointer!important;list-style:none!important}
.wu-r-tech>summary::-webkit-details-marker{display:none}.wu-r-tech[open]>summary{background:var(--b)!important;color:#fff!important}
.wu-r-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:28px!important;height:28px!important;border:1px solid currentColor!important;border-radius:50%!important}
.wu-r-content{padding:20px 22px!important;border-top:1px solid var(--br)!important}.wu-r-content dl{margin:0!important}.wu-r-content dl div{display:grid!important;grid-template-columns:210px 1fr!important;gap:22px!important;padding:9px 0!important;border-bottom:1px solid #e3e3e3!important}.wu-r-content dt{font-weight:700!important;color:#666!important}.wu-r-content dd{margin:0!important}
.wu-r-grid{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:12px!important}.wu-r-card{display:flex!important;flex-direction:column!important;height:220px!important;border:1px solid var(--br)!important;text-align:center!important}.wu-r-img{display:flex!important;align-items:center!important;height:105px!important;border-bottom:5px solid var(--bd)!important}.wu-r-img img{width:100%!important;height:100%!important;object-fit:contain!important;padding:6px!important}.wu-r-card div:last-child{display:flex!important;flex:1!important;flex-direction:column!important;align-items:center!important;padding:9px 8px!important}.wu-r-card h3{font-size:12px!important;margin:0 0 7px!important}.wu-r-pdf{margin:auto 0 0!important;padding:6px 7px!important;font-size:10px!important}
@media(max-width:950px){.wu-r-row{flex-wrap:wrap!important}.wu-r-gallery,.wu-r-side{flex:0 0 100%!important;width:100%!important;max-width:100%!important}.wu-r-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media(max-width:650px){.wu-r-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.wu-r-content dl div{grid-template-columns:1fr!important}}
@media(max-width:430px){.wu-r-grid{grid-template-columns:1fr!important}}
`;document.head.appendChild(s)}
function apply(){
const root=document.querySelector(ROOT);if(!root)return;
const title=norm(root.querySelector('.usi-detailsTitle,h1')?.textContent);
if(!title.includes('ad.0.122')&&!title.includes('sitzungssaal 2'))return;
if(root.dataset.wuRoomV2==='done')return;
const row=[...root.querySelectorAll('.usi-row')].find(r=>r.querySelector('.usi-op-imageViewerContainer')&&r.querySelector('.usi-spaceDetails'));if(!row)return;
const gallery=row.querySelector('.usi-op-imageViewerContainer'), side=row.querySelector('.usi-spaceDetails'), info=side.querySelector('.usi-detailsInfo')||side.querySelector('.usi-spaceDetailsContainer');if(!gallery||!side||!info)return;
root.dataset.wuRoomV2='done';addStyles();row.classList.add('wu-r-row');gallery.classList.add('wu-r-gallery');side.classList.add('wu-r-side');
const have=[...info.querySelectorAll('.usi-detailsLine')].map(x=>norm(x.textContent));
const dl=document.createElement('dl');dl.id='wu-r-details';CFG.details.forEach(([l,v])=>{if(have.some(x=>x.startsWith(norm(l))))return;const d=document.createElement('div');d.className='wu-r-detail';d.innerHTML='<dt></dt><dd></dd>';d.children[0].textContent=l;d.children[1].textContent=v;dl.appendChild(d)});if(dl.children.length)info.appendChild(dl);
const tech=document.createElement('section');tech.className='wu-r-section';tech.id='wu-r-tech';tech.innerHTML='<h2>Technische Details</h2>';let sub='';CFG.tech.forEach(([t,c,s])=>{if(s&&s!==sub){const h=document.createElement('h3');h.className='wu-r-sub';h.textContent=s;tech.appendChild(h);sub=s}const d=document.createElement('details');d.className='wu-r-tech';d.innerHTML='<summary><span></span><span class="wu-r-icon" aria-hidden="true">+</span></summary><div class="wu-r-content"></div>';d.querySelector('summary span').textContent=t;d.querySelector('.wu-r-content').innerHTML=c;d.addEventListener('toggle',()=>d.querySelector('.wu-r-icon').textContent=d.open?'−':'+');tech.appendChild(d)});
const sets=document.createElement('section');sets.className='wu-r-section';sets.id='wu-r-settings';sets.innerHTML='<h2>Settings Standard</h2><div class="wu-r-grid"></div>';const grid=sets.querySelector('.wu-r-grid');CFG.settings.forEach(([t,img,pdf])=>{const a=document.createElement('article');a.className='wu-r-card';a.innerHTML=`<a class="wu-r-img" target="_blank" rel="noopener noreferrer"><img loading="lazy"></a><div><h3></h3><a class="wu-r-pdf" target="_blank" rel="noopener noreferrer">↓ PDF öffnen</a></div>`;a.querySelector('h3').textContent=t;const im=a.querySelector('img');im.src=img;im.alt='Stellplan '+t;for(const x of a.querySelectorAll('a'))x.href=pdf;grid.appendChild(a)});
row.after(tech);tech.after(sets);
const main=gallery.querySelector('.usi-desktopSpaceImg'), mainImg=main?.querySelector('img'), thumbs=[...gallery.querySelectorAll('.usi-thumbnailButtons')].filter(x=>x.querySelector('img'));
if(main&&mainImg&&thumbs.length){const slides=thumbs.map(x=>{const i=x.querySelector('img');return [i.currentSrc||i.src,i.alt||'Raumbild']});let i=Math.max(0,slides.findIndex(x=>norm(x[1])===norm(mainImg.alt)));const nav=document.createElement('div');nav.className='wu-r-nav';nav.innerHTML='<button type="button">‹ Zurück</button><span class="wu-r-count" aria-live="polite"></span><button type="button">Weiter ›</button>';main.after(nav);const show=n=>{i=(n+slides.length)%slides.length;mainImg.removeAttribute('srcset');mainImg.src=slides[i][0];mainImg.alt=slides[i][1];thumbs.forEach((x,j)=>x.classList.toggle('wu-r-active',j===i));nav.querySelector('.wu-r-count').textContent=(i+1)+' von '+slides.length};nav.children[0].onclick=e=>{e.preventDefault();show(i-1)};nav.children[2].onclick=e=>{e.preventDefault();show(i+1)};thumbs.forEach((x,j)=>x.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();show(j)},true));main.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation()},true);show(i)}
}
let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply()})};[0,100,300,700,1500,3000].forEach(ms=>setTimeout(apply,ms));new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
})();
