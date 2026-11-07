(function(){"use strict";
var KEY="mm.pwa",LEGACY="mojosomint",SCHEMA=3,D=window.MM_DATA,MS=window.MMSchedule;
function iso(d){d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function blank(){return{schema:SCHEMA,archetype:null,days:{},goals:[],journal:[],metrics:{opens:0,commitments:0,completions:0,storeClicks:0},created:iso(),schedule:MS.blank(iso())};}
function migrate(s){if(!s||typeof s!=="object")return blank();
 if(!s.schema||s.schema<2){var b=blank();b.archetype=s.archetype||null;b.days=s.days||{};b.goals=s.goals||[];b.journal=s.journal||[];s=b;}
 if(!s.schedule||!Array.isArray(s.schedule.events))s.schedule=MS.blank(iso());if(!s.schedule.life)s.schedule.life=MS.defaultLife();s.schedule.selected=null;
 s.metrics=Object.assign(blank().metrics,s.metrics||{});s.schema=SCHEMA;return s;}
function fromLegacy(raw){var b=blank();try{var o=JSON.parse(raw);
 (o.goals||[]).forEach(function(g){var t=g.title||g.name;if(t)b.goals.push({id:uid(),text:String(t),kind:"goal"});});
 Object.keys(o.journals||{}).forEach(function(d){var n=o.journals[d]&&o.journals[d].note;if(n)b.journal.push({id:uid(),date:d,text:String(n)});});}catch(e){}return b;}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function load(){var r=localStorage.getItem(KEY);if(r){try{return migrate(JSON.parse(r));}catch(e){return blank();}}
 var l=localStorage.getItem(LEGACY);return l?fromLegacy(l):blank();}
var S=load();function save(){localStorage.setItem(KEY,JSON.stringify(S));}
S.metrics.opens++;save();
function esc(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
var V=document.getElementById("view"),tab="today";
function h(html){V.innerHTML=html;}
var R={
plan:function(){return MS.view(S.schedule,iso());},
today:function(){var t=S.days[iso()],a=S.archetype&&D.arch[S.archetype];
 var sugg=a?'<p class="muted">Suggested for '+esc(a.name)+': '+esc(a.action)+'</p>':'<p class="muted">Pick your archetype in Code for a suggested action.</p>';
 if(!t)return'<h1>Today</h1><p>Choose one meaningful commitment.</p>'+sugg+
 (S.goals.length?'<div class="row">'+S.goals.map(function(g){return'<button data-pick="'+esc(g.text)+'">'+esc(g.text)+'</button>';}).join("")+'</div>':"")+
 '<label for="c">Today I will…</label><input id="c" maxlength="140" autocomplete="off"><div class="row"><button class="primary" id="set">Commit</button>'+(a?'<button id="usesugg">Use suggestion</button>':"")+'</div>';
 return'<h1>Today</h1><div class="card '+(t.done?"done":"")+'"><div class="muted">Your commitment</div><h2 style="margin:4px 0">'+(t.done?'<span class="check">✓</span> ':"")+esc(t.text)+'</h2>'+
 (t.done?'<p>Kept. Nice work.</p>':'<div class="row"><button class="primary" id="done">Mark done</button><button id="chg">Change</button></div>')+'</div>'+
 '<label for="r">Reflection (optional, private)</label><textarea id="r" maxlength="500" placeholder="One line on how it went">'+esc(t.reflection||"")+'</textarea><div class="row"><button id="saver">Save reflection</button></div>'+sugg;},
code:function(){var a=S.archetype&&D.arch[S.archetype];
 return'<h1>Discipline Code</h1><p class="muted">Pick the archetype that fits how you work, or enter your quiz result. It is a preference framework, not a diagnosis, and you can change it anytime.</p><div class="chips">'+
 Object.keys(D.arch).map(function(k){return'<button data-arch="'+k+'" aria-pressed="'+(S.archetype===k)+'">'+D.arch[k].name.replace("The ","")+'</button>';}).join("")+'</div>'+
 (a?'<h2>'+esc(a.name)+'</h2><p>'+esc(a.desc)+'</p><h2>Your Code</h2><ol class="code">'+D.core.concat(a.code).map(function(l){return"<li>"+esc(l)+"</li>";}).join("")+'</ol><div class="card"><div class="muted">Suggested action</div>'+esc(a.action)+'</div>':'<h2>The core</h2><ol class="code">'+D.core.map(function(l){return"<li>"+esc(l)+"</li>";}).join("")+'</ol>');},
review:function(){var cells="",kept=0,set=0,now=new Date();
 for(var i=6;i>=0;i--){var d=new Date(now);d.setDate(now.getDate()-i);var k=iso(d),x=S.days[k];if(x){set++;if(x.done)kept++;}
  cells+='<div class="day '+(x&&x.done?"kept":"")+'">'+d.toLocaleDateString(undefined,{weekday:"short"}).slice(0,2)+'<br>'+(x&&x.done?"✓":x?"·":"")+'</div>';}
 var list=Object.keys(S.days).sort().reverse().slice(0,14).map(function(k){var x=S.days[k];return'<li><span>'+esc(k)+' — '+esc(x.text)+(x.reflection?'<br><span class="muted">'+esc(x.reflection)+'</span>':"")+'</span><span>'+(x.done?"✓ kept":"open")+'</span></li>';}).join("");
 var total=Object.keys(S.days).filter(function(k){return S.days[k].done;}).length;
 return'<h1>Weekly review</h1><p id="sum"><strong>'+kept+' of '+set+'</strong> commitments kept in the last 7 days. '+total+' kept all-time.</p><div class="week">'+cells+'</div><p class="muted">No streaks to break. A missed day is just a day; the next one counts the same.</p>'+
 '<h2>Goals &amp; protocols</h2><p class="muted">Simple anchors you can pick as a daily commitment.</p><ul class="list">'+S.goals.map(function(g){return'<li><span>'+esc(g.text)+'</span><button data-delgoal="'+g.id+'" aria-label="Remove">Remove</button></li>';}).join("")+'</ul><label for="g">Add a goal or protocol</label><input id="g" maxlength="100"><div class="row"><button id="addg">Add</button></div><h2>Recent</h2><ul class="list">'+(list||'<li class="muted">Nothing yet.</li>')+'</ul>';},
journal:function(){return'<h1>Journal</h1><p class="muted">Private. Stored only on this device, never sent anywhere.</p><label for="j">New entry</label><textarea id="j" maxlength="4000"></textarea><div class="row"><button class="primary" id="addj">Save entry</button></div><ul class="list">'+
 S.journal.slice().reverse().map(function(e){return'<li><span><strong>'+esc(e.date)+'</strong><br>'+esc(e.text)+'</span><button data-delj="'+e.id+'">Delete</button></li>';}).join("")+'</ul>'+
 '<h2>Your data</h2><p class="muted">Export regularly; iOS can clear data for home-screen apps that go unused for a while. Data does not sync between devices.</p><div class="row"><button id="exp">Export JSON</button><button class="danger" id="wipe">Delete all data</button></div><p id="msg" class="muted" role="status"></p>';},
about:function(){return'<h1>About</h1><p><strong>Become the Vision.</strong> MojoSoMint is a daily discipline companion: one commitment a day, kept honestly, reviewed weekly.</p><p>This is an early test version. Everything stays on this device. No account, no tracking, no notifications.</p><div class="row"><a class="btn" id="store" href="https://mojosomint.com" target="_blank" rel="noopener">Visit mojosomint.com</a></div><p class="muted">Drop 01 updates are on the store site.</p><p class="muted">Version 0.4 (Phase 0 test · schedule · voice)</p>';}};
function render(){h(R[tab]());document.querySelectorAll(".tabs button").forEach(function(b){b.toggleAttribute("aria-current",b.dataset.tab===tab);if(b.dataset.tab===tab)b.setAttribute("aria-current","page");});}
function commit(text){text=(text||"").trim();if(!text)return;S.days[iso()]={text:text,done:false,reflection:""};S.metrics.commitments++;save();render();}
document.addEventListener("click",function(e){var b=e.target.closest("button,a");if(!b)return;var d=b.dataset,t=S.days[iso()];
 if(d.tab){tab=d.tab;if(tab==="plan")S.schedule.selected=null;render();V.focus();if(tab==="plan")scrollNow();return;}
 if(sched(b,d,e))return;
 if(b.id==="set")commit(document.getElementById("c").value);
 else if(b.id==="usesugg")commit(D.arch[S.archetype].action);
 else if(d.pick)commit(d.pick);
 else if(b.id==="done"&&t){t.done=true;t.doneAt=new Date().toISOString();S.metrics.completions++;save();render();}
 else if(b.id==="chg"){delete S.days[iso()];save();render();}
 else if(b.id==="saver"&&t){t.reflection=document.getElementById("r").value.trim();save();b.textContent="Saved";}
 else if(d.arch){S.archetype=d.arch;save();render();}
 else if(b.id==="addg"){var g=document.getElementById("g").value.trim();if(g){S.goals.push({id:uid(),text:g,kind:"goal"});save();render();}}
 else if(d.delgoal){S.goals=S.goals.filter(function(x){return x.id!==d.delgoal;});save();render();}
 else if(b.id==="addj"){var j=document.getElementById("j").value.trim();if(j){S.journal.push({id:uid(),date:iso(),text:j});save();render();}}
 else if(d.delj){if(confirm("Delete this entry?")){S.journal=S.journal.filter(function(x){return x.id!==d.delj;});save();render();}}
 else if(b.id==="exp"){var blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="mojosomint-"+iso()+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},1000);document.getElementById("msg").textContent="Exported.";}
 else if(b.id==="wipe"){if(confirm("Delete ALL MojoSoMint data on this device? This cannot be undone. Export first if you want a copy.")){localStorage.removeItem(KEY);localStorage.removeItem(LEGACY);S=blank();save();tab="today";render();}}
 else if(b.id==="store"){S.metrics.storeClicks++;save();}
});
var SC=S.schedule,ED=null,SH=null,SHF=null;
function scrollNow(){var n=document.getElementById("sc-now")||document.querySelector(".sc-ev");if(n&&n.scrollIntoView)n.scrollIntoView({block:"center"});}
function day(){return S.schedule.selected||iso();}
function openEd(e){ED=JSON.parse(JSON.stringify(e));document.getElementById("sc-modal").innerHTML=MS.editor(S.schedule,ED,day());document.getElementById("se-t").focus();}
function openSheet(e){ED=null;SH=e.id;var m=document.getElementById("sc-modal");m.innerHTML=MS.detail(S.schedule,e,day());SHF=document.activeElement;document.getElementById("sd-close").focus();bindSwipe();}
function closeEd(){var had=SH;ED=null;SH=null;var m=document.getElementById("sc-modal");if(m)m.innerHTML="";if(had){var t=document.querySelector('[data-ev="'+had+'"]');if(t)t.focus();}}
function bindSwipe(){var sh=document.getElementById("sd");if(!sh)return;var y0=null,dy=0;
 sh.addEventListener("touchstart",function(e){if(sh.scrollTop>0)return;y0=e.touches[0].clientY;dy=0;sh.style.transition="none";},{passive:true});
 sh.addEventListener("touchmove",function(e){if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);sh.style.transform="translateY("+dy+"px)";},{passive:true});
 sh.addEventListener("touchend",function(){if(y0==null)return;y0=null;sh.style.transition="";if(dy>90)closeEd();else sh.style.transform="";});}
function sched(b,d,e){var sc=S.schedule;
 if(d.close!==undefined){closeEd();return true;}
 if(SH&&/^sd-/.test(b.id)){var x0=sc.events.find(function(q){return q.id===SH;});if(!x0){closeEd();return true;}
  if(b.id==="sd-done"){x0.completedDates=x0.completedDates||[];var k=x0.completedDates.indexOf(day());if(k>=0)x0.completedDates.splice(k,1);else x0.completedDates.push(day());save();render();openSheet(x0);document.getElementById("sd-done").focus();return true;}
  if(b.id==="sd-edit"){SH=null;openEd(x0);return true;}
  if(b.id==="sd-skip"){(x0.skippedDates=x0.skippedDates||[]).push(day());save();SH=null;closeEd();render();return true;}
  if(b.id==="sd-del"){var rp=x0.recur&&x0.recur!=="none";if(!confirm(rp?"Delete this repeating block from every day?":"Delete this block?"))return true;sc.events=sc.events.filter(function(q){return q.id!==x0.id;});save();SH=null;closeEd();render();return true;}}
 if(b.id==="sc-prev"||b.id==="sc-next"){sc.selected=MS.add(day(),b.id==="sc-prev"?-1:1);render();return true;}
 if(b.id==="sc-today"){sc.selected=null;render();scrollNow();return true;}
 if(d.sday){sc.selected=d.sday===iso()?null:d.sday;render();return true;}
 if(b.id==="sc-add"){var n=new Date(),m=Math.max(MS.START(),Math.round((n.getHours()*60+n.getMinutes())/15)*15);openEd({start:m,duration:30,recur:"none",tone:"graphite"});return true;}
 if(d.chk){var x=sc.events.find(function(q){return q.id===d.chk;});if(x){x.completedDates=x.completedDates||[];var i=x.completedDates.indexOf(day());if(i>=0)x.completedDates.splice(i,1);else x.completedDates.push(day());save();render();}return true;}
 if(d.tone&&ED){ED.tone=d.tone;document.querySelectorAll("[data-tone]").forEach(function(t){t.setAttribute("aria-pressed",t.dataset.tone===d.tone);});return true;}
 if(b.id==="se-save"&&ED){var t=document.getElementById("se-t").value.trim();if(!t){document.getElementById("se-t").focus();return true;}
  var st=MS.hm(document.getElementById("se-s").value),en=MS.hm(document.getElementById("se-e").value),du=en-st;if(du<=0)du+=1440;du=Math.max(15,du);
  var r=document.getElementById("se-r").value,nt=document.getElementById("se-n").value.trim();
  if(ED.id){var o=sc.events.find(function(q){return q.id===ED.id;});if(o){o.title=t;o.start=st;o.duration=du;o.recur=r;o.notes=nt;o.tone=ED.tone;delete o.lifeKey;}}
  else sc.events.push({id:MS.uid(),title:t,start:st,duration:du,recur:r,notes:nt,tone:ED.tone||"graphite",date:day(),completedDates:[],skippedDates:[]});
  save();closeEd();render();return true;}
 if(b.id==="se-skip"&&ED){var o2=sc.events.find(function(q){return q.id===ED.id;});if(o2){(o2.skippedDates=o2.skippedDates||[]).push(day());save();}closeEd();render();return true;}
 if(b.id==="se-del"&&ED){var rep=ED.recur&&ED.recur!=="none";if(!confirm(rep?"Delete this repeating block from every day?":"Delete this block?"))return true;sc.events=sc.events.filter(function(q){return q.id!==ED.id;});save();closeEd();render();return true;}
 if(b.id==="sc-life"){var L={};["bed","wake","train","workStart","workEnd"].forEach(function(k){L[k]=document.getElementById("sl-"+k).value||sc.life[k];});sc.life=Object.assign({},sc.life,L);
  sc.events=sc.events.filter(function(q){return !q.lifeKey;}).concat(MS.lifeEvents(sc.life,iso()));save();render();return true;}
 return false;}
document.addEventListener("click",function(e){if(tab!=="plan"||e.target.closest("button,a,.sc-sheet"))return;
 if(e.target.closest(".sc-back")){closeEd();return;}
 var ev=e.target.closest("[data-ev]");if(ev){var x=S.schedule.events.find(function(q){return q.id===ev.dataset.ev;});if(x)openSheet(x);return;}
 var tr=e.target.closest("#sc-track");if(tr){var r=tr.getBoundingClientRect(),m=MS.START()+Math.floor((e.clientY-r.top)/MS.HH*4)*15;openEd({start:m,duration:30,recur:"none",tone:"graphite"});}});
document.addEventListener("keydown",function(e){if(tab!=="plan")return;
 if(e.key==="Escape"&&(ED||SH)){e.preventDefault();closeEd();return;}
 var ev=e.target.closest&&e.target.closest("[data-ev]");if(ev&&(e.key==="Enter"||e.key===" ")&&!e.target.closest("button")){e.preventDefault();var x=S.schedule.events.find(function(q){return q.id===ev.dataset.ev;});if(x)openSheet(x);}});
document.addEventListener("change",function(e){if(e.target.id==="sc-pick"&&e.target.value){S.schedule.selected=e.target.value===iso()?null:e.target.value;render();}});
setInterval(function(){if(tab==="plan"&&!ED&&!SH)render();},60000);
render();
if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});
})();
