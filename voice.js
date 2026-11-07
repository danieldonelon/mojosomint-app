/* Talk-to-text: mic button beside every text field. Web Speech API with graceful fallback. */
(function(){"use strict";
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
var standalone=window.navigator.standalone===true||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches);
var active=null; // {rec,btn,field,base}
var MIC='<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
function hint(field,msg){var w=field.closest(".mic-wrap"),h=w&&w.nextElementSibling;if(!h||!h.classList||!h.classList.contains("mic-hint")){h=document.createElement("p");h.className="mic-hint muted";h.setAttribute("role","status");h.setAttribute("aria-live","polite");(w||field).after(h);}h.textContent=msg;}
function clearHint(field){var w=field.closest(".mic-wrap"),h=w&&w.nextElementSibling;if(h&&h.classList.contains("mic-hint"))h.textContent="";}
function setState(btn,on){btn.classList.toggle("listening",on);btn.setAttribute("aria-pressed",on);btn.setAttribute("aria-label",on?"Stop voice input":"Start voice input");}
function join(a,b){a=a||"";b=(b||"").trim();if(!b)return a;return a&&!/\s$/.test(a)?a+" "+b:a+b;}
function fire(f){f.dispatchEvent(new Event("input",{bubbles:true}));}
function stop(){if(!active)return;var a=active;active=null;try{a.rec.stop();}catch(e){}setState(a.btn,false);}
function fallback(field,why){field.focus();hint(field,(why?why+" ":"")+"Tap the mic on your keyboard to dictate instead.");}
function start(btn,field){
 if(!SR){fallback(field,standalone?"Voice input isn't available in the home-screen app.":"Voice input isn't supported in this browser.");return;}
 var rec;try{rec=new SR();}catch(e){fallback(field,"Voice input couldn't start.");return;}
 var base=field.value,finalTxt="",got=false;
 rec.lang=document.documentElement.lang||"en-US";rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
 active={rec:rec,btn:btn,field:field};setState(btn,true);hint(field,"Listening… tap the mic again to stop.");
 rec.onresult=function(ev){var interim="";for(var i=ev.resultIndex;i<ev.results.length;i++){var r=ev.results[i];if(r.isFinal)finalTxt=join(finalTxt,r[0].transcript);else interim=join(interim,r[0].transcript);}
  got=got||!!(finalTxt||interim);var v=join(base,join(finalTxt,interim));if(field.maxLength>0)v=v.slice(0,field.maxLength);field.value=v;fire(field);};
 rec.onerror=function(ev){var e=ev&&ev.error;got=true;
  if(e==="not-allowed"||e==="service-not-allowed")fallback(field,"Microphone access is off. Allow it in Settings › Safari › Microphone, or");
  else if(e==="no-speech")hint(field,"Didn't catch that. Tap the mic and try again.");
  else if(e==="aborted")clearHint(field);
  else fallback(field,"Voice input stopped ("+(e||"error")+").");
  if(active&&active.rec===rec){active=null;setState(btn,false);}};
 rec.onend=function(){if(active&&active.rec===rec){active=null;setState(btn,false);}
  var v=join(base,finalTxt);if(field.maxLength>0)v=v.slice(0,field.maxLength);if(finalTxt){field.value=v;fire(field);}
  var h=field.closest(".mic-wrap");h=h&&h.nextElementSibling;if(h&&h.classList.contains("mic-hint")&&/^Listening/.test(h.textContent))h.textContent=finalTxt?"Added.":(got?"":"Didn't catch that. Tap the mic and try again.");};
 try{rec.start();}catch(e){active=null;setState(btn,false);fallback(field,"Voice input couldn't start.");}}
function enhance(root){(root||document).querySelectorAll('input:not([type]),input[type=text],input[type=search],textarea').forEach(function(f){
 if(f.dataset.mic||!f.id)return;f.dataset.mic="1";var w=document.createElement("div");w.className="mic-wrap"+(f.tagName==="TEXTAREA"?" mic-ta":"");f.parentNode.insertBefore(w,f);w.appendChild(f);
 var b=document.createElement("button");b.type="button";b.className="mic";b.dataset.micFor=f.id;b.innerHTML=MIC;setState(b,false);w.appendChild(b);});}
document.addEventListener("click",function(e){var b=e.target.closest("button.mic");if(!b)return;e.stopPropagation();var f=document.getElementById(b.dataset.micFor);if(!f)return;
 if(active&&active.btn===b){stop();return;}stop();start(b,f);},true);
var V=document.getElementById("view");enhance(V);new MutationObserver(function(){if(active&&!document.body.contains(active.btn))stop();enhance(V);}).observe(V,{childList:true,subtree:true});
window.MMVoice={supported:!!SR,standalone:standalone,stop:stop};
})();
