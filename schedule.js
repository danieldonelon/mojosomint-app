/* Daily schedule, ported from the MojoSoMint desktop prototype (Schedule view). */
(function(){"use strict";
var DAYM=1440,HH=64,START=300,END=1440;
function pad(n){return String(n).padStart(2,"0");}
function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function parse(s){var a=s.split("-").map(Number);return new Date(a[0],a[1]-1,a[2]);}
function add(s,n){var d=parse(s);d.setDate(d.getDate()+n);return iso(d);}
function wd(s){return parse(s).getDay();}
function hm(s){var a=String(s||"0:0").split(":").map(Number);return(a[0]||0)*60+(a[1]||0);}
function toHM(m){m=((m%DAYM)+DAYM)%DAYM;return pad(Math.floor(m/60))+":"+pad(m%60);}
function lab(m){m=((Math.round(m)%DAYM)+DAYM)%DAYM;var h=Math.floor(m/60);return((h+11)%12+1)+":"+pad(m%60)+" "+(h>=12?"PM":"AM");}
function hlab(h){h=h%24;return((h+11)%12+1)+" "+(h>=12?"PM":"AM");}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function esc(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
var RECUR={none:"Does not repeat",daily:"Every day",weekdays:"Weekdays",weekends:"Weekends",weekly:"Weekly"};
var TONES=[["ink","#111111"],["graphite","#555555"],["stone","#9a9a9a"],["sand","#c9bfae"],["mist","#dcdcdc"]];
function tone(id){for(var i=0;i<TONES.length;i++)if(TONES[i][0]===id)return TONES[i][1];return"#555555";}
function defaultLife(){return{bed:"22:30",wake:"06:15",train:"06:15",trainDur:45,trainRecur:"weekdays",workStart:"09:00",workEnd:"17:00"};}
/* Same default day the prototype builds in applyLife(): Sleep, Train (+weekend), Work / Lunch / Work. */
function lifeEvents(life,today){var o=add(today,-180),out=[];
 function ev(p){p.id=uid();p.date=o;p.completedDates=[];p.skippedDates=[];p.notes=p.notes||"";out.push(p);}
 var bed=hm(life.bed),wake=hm(life.wake),tr=hm(life.train),td=Number(life.trainDur)||45,ws=hm(life.workStart),we=hm(life.workEnd),rr=life.trainRecur||"weekdays";
 ev({title:"Sleep",notes:"Protect the first hours by protecting the last ones.",start:bed,duration:wake<=bed?wake+DAYM-bed:Math.max(15,wake-bed),tone:"ink",recur:"daily",lifeKey:"sleep"});
 var ts=Math.max(0,Math.min(tr,DAYM-td));
 ev({title:"Train",notes:"Train before the world talks. Honest session, not theatrical.",start:ts,duration:td,tone:"graphite",recur:rr,lifeKey:"train"});
 if(rr==="weekdays")ev({title:"Train",notes:"Weekend session. Same standard, no special conditions.",start:Math.max(ts,480),duration:Math.max(45,td),tone:"graphite",recur:"weekends",lifeKey:"train-we"});
 if(we>ws){if(ws<720&&we>765){ev({title:"Work",notes:"The recurring container. Goals sit around this, not inside it.",start:ws,duration:720-ws,tone:"stone",recur:"weekdays",lifeKey:"work-am"});
   ev({title:"Lunch",start:720,duration:45,tone:"mist",recur:"weekdays",lifeKey:"lunch"});
   ev({title:"Work",start:765,duration:we-765,tone:"stone",recur:"weekdays",lifeKey:"work-pm"});}
  else ev({title:"Work",notes:"The recurring container. Goals sit around this, not inside it.",start:ws,duration:we-ws,tone:"stone",recur:"weekdays",lifeKey:"work"});}
 return out;}
function blank(today){return{life:defaultLife(),events:lifeEvents(defaultLife(),today),selected:null};}
function startsOn(e,d){if((e.skippedDates||[]).indexOf(d)>=0)return false;if(!e.recur||e.recur==="none")return e.date===d;if(d<e.date)return false;
 var a=wd(e.date),w=wd(d);if(e.recur==="daily")return true;if(e.recur==="weekdays")return w>=1&&w<=5;if(e.recur==="weekends")return w===0||w===6;if(e.recur==="weekly")return w===a;return false;}
function segments(sc,d){var out=[],p=add(d,-1);(sc.events||[]).forEach(function(e){
 if(startsOn(e,d)){var s=Math.max(e.start,START),t=Math.min(e.start+e.duration,END);if(t>s)out.push({ev:e,start:s,end:t,spill:false,over:e.start+e.duration>DAYM});}
 if(startsOn(e,p)&&e.start+e.duration>DAYM){var t2=Math.min(e.start+e.duration-DAYM,END);if(t2>START)out.push({ev:e,start:START,end:t2,spill:true,over:true});}});
 return out.sort(function(a,b){return a.start-b.start||b.end-a.end;});}
function pack(segs){var cl=[];segs.forEach(function(s){s.ve=Math.max(s.end,s.start+32/HH*60);});segs.forEach(function(s){var l=cl[cl.length-1];if(!l||s.start>=l.max)cl.push({it:[s],max:s.ve});else{l.it.push(s);l.max=Math.max(l.max,s.ve);}});
 cl.forEach(function(c){var ends=[];c.it.forEach(function(s){var k=ends.findIndex(function(x){return s.start>=x-.5;});if(k<0){k=ends.length;ends.push(s.ve);}else ends[k]=s.ve;s.col=k;});c.it.forEach(function(s){s.cols=ends.length;});});return segs;}
function week(d){var x=parse(d),s=new Date(x);s.setDate(x.getDate()-x.getDay());var o=[];for(var i=0;i<7;i++){o.push(iso(new Date(s.getFullYear(),s.getMonth(),s.getDate()+i)));}return o;}
function y(m){return(m-START)/60*HH;}
function nowMin(){var n=new Date();return n.getHours()*60+n.getMinutes();}
function view(sc,today){START=Math.max(0,Math.floor(hm(sc.life.wake)/60)*60);var d=sc.selected||today,segs=pack(segments(sc,d)),dt=parse(d);
 var hours="",grid="";for(var h=START/60;h<=24;h++){hours+='<div class="sc-hour" style="top:'+y(h*60)+'px">'+hlab(h)+'</div>';grid+='<div class="sc-line" style="top:'+y(h*60)+'px"></div>';}
 var blocks=segs.map(function(s){var e=s.ev,g=6,w="calc((100% - "+(s.cols+1)*g+"px) / "+s.cols+")",l="calc("+g+"px + "+s.col+" * ((100% - "+(s.cols+1)*g+"px) / "+s.cols+" + "+g+"px))";
  var ht=Math.max(30,(s.end-s.start)/60*HH-3),done=(e.completedDates||[]).indexOf(d)>=0,c=tone(e.tone),dark=e.tone==="ink"||e.tone==="graphite";
  var endL=s.over&&!s.spill?lab((e.start+e.duration)%DAYM)+" next day":lab(s.spill?s.end:e.start+e.duration);
  return'<div class="sc-ev'+(done?" sc-done":"")+(dark?" sc-dark":"")+'" data-ev="'+e.id+'" style="top:'+y(s.start)+'px;height:'+ht+'px;left:'+l+';width:'+w+';background:'+c+'">'+
  '<div class="sc-evt"><div class="sc-tt">'+esc(e.title)+'</div><div class="sc-tm">'+(s.spill?"From last night · ":"")+lab(s.spill?e.start:s.start)+' – '+endL+(e.recur&&e.recur!=="none"?" · repeats":"")+'</div></div>'+
  (s.spill?"":'<button class="sc-chk" data-chk="'+e.id+'" aria-label="'+(done?"Mark not done":"Mark done")+'">'+(done?"✓":"")+'</button>')+'</div>';}).join("");
 var dows=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],strip=week(d).map(function(x){var p=parse(x);return'<button class="sc-day'+(x===d?" on":"")+(x===today?" today":"")+'" data-sday="'+x+'"><span>'+dows[p.getDay()]+'</span><b>'+p.getDate()+'</b>'+(segments(sc,x).length?'<i></i>':'')+'</button>';}).join("");
 var nm=nowMin(),nl=d===today&&nm>=START?'<div class="sc-now" id="sc-now" style="top:'+y(nm)+'px"></div>':"";
 return'<div class="sc-head"><button id="sc-prev" aria-label="Previous day">‹</button><div class="sc-title"><div class="muted">'+(d===today?"Today":"Schedule")+'</div><h1 id="sc-date">'+esc(dt.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}))+'</h1></div><button id="sc-next" aria-label="Next day">›</button></div>'+
 '<div class="sc-strip">'+strip+'</div><div class="row">'+(d!==today?'<button id="sc-today">Today</button>':'')+'<input type="date" id="sc-pick" value="'+d+'" aria-label="Pick a date"><button class="primary" id="sc-add">+ Add block</button></div>'+
 '<div class="sc-cal" id="sc-cal" style="height:'+(y(END)+8)+'px"><div class="sc-hours">'+hours+'</div><div class="sc-track" id="sc-track">'+grid+blocks+nl+(segs.length?"":'<p class="muted sc-empty">No blocks on this day. Tap a time to add one.</p>')+'</div></div>'+
 '<details class="card"><summary><strong>Your repeating day</strong></summary><p class="muted">Sleep, work and training stay fixed. Rebuild them from these times (other blocks are kept).</p>'+
 [["bed","Bed"],["wake","Wake"],["train","Train"],["workStart","Work starts"],["workEnd","Work ends"]].map(function(f){return'<label for="sl-'+f[0]+'">'+f[1]+'</label><input type="time" id="sl-'+f[0]+'" value="'+esc(sc.life[f[0]])+'">';}).join("")+
 '<div class="row"><button id="sc-life">Rebuild repeating day</button></div></details><div id="sc-modal"></div>';}
function editor(sc,e,d){var n=!e.id,r=e.recur||"none";
 return'<div class="sc-back" data-close></div><div class="sc-sheet" role="dialog" aria-label="'+(n?"Add block":"Edit block")+'"><h2>'+(n?"Add block":"Edit block")+'</h2>'+
 '<label for="se-t">Title</label><input id="se-t" maxlength="80" value="'+esc(e.title||"")+'" placeholder="Work, sleep, gym, a goal…">'+
 '<div class="sc-2"><div><label for="se-s">Start</label><input type="time" id="se-s" value="'+toHM(e.start)+'"></div><div><label for="se-e">End</label><input type="time" id="se-e" value="'+toHM(e.start+e.duration)+'"></div></div>'+
 '<label for="se-r">Repeat</label><select id="se-r">'+Object.keys(RECUR).map(function(k){return'<option value="'+k+'"'+(k===r?" selected":"")+'>'+RECUR[k]+'</option>';}).join("")+'</select>'+
 '<label>Tone</label><div class="sc-tones">'+TONES.map(function(t){return'<button type="button" data-tone="'+t[0]+'" aria-label="'+t[0]+'" aria-pressed="'+((e.tone||"graphite")===t[0])+'" style="background:'+t[1]+'"></button>';}).join("")+'</div>'+
 '<label for="se-n">Notes</label><textarea id="se-n" maxlength="500">'+esc(e.notes||"")+'</textarea>'+
 '<div class="row"><button class="primary" id="se-save">Save</button><button data-close>Cancel</button>'+(n?"":(e.recur&&e.recur!=="none"?'<button id="se-skip">Skip this day</button>':"")+'<button class="danger" id="se-del">Delete</button>')+'</div></div>';}
window.MMSchedule={blank:blank,lifeEvents:lifeEvents,defaultLife:defaultLife,segments:segments,view:view,editor:editor,hm:hm,iso:iso,add:add,uid:uid,START:function(){return START;},HH:HH};
})();
