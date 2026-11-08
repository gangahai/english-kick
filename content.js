/* English Kick — shared content and adaptive progress (used by index.html and 3d.html) */
(function(){
const LETTERS="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PIC=[
  ["ball","⚽"],["cat","🐱"],["dog","🐶"],["sun","☀️"],["car","🚗"],["bus","🚌"],["egg","🥚"],["fish","🐟"],
  ["hat","🎩"],["bed","🛏️"],["apple","🍎"],["book","📖"],["star","⭐"],["tree","🌳"],["milk","🥛"],["box","📦"],
  ["key","🔑"],["moon","🌙"],["pizza","🍕"],["lion","🦁"],["house","🏠"],["phone","📱"],["shoe","👟"],["bird","🐦"]
];
const FOOT=[
  ["ball","כדור","⚽"],["goal","שער / גול","🥅"],["team","קבוצה","👕"],["kick","בעיטה","🦵"],["win","לנצח","🏆"],
  ["player","שחקן","🏃"],["coach","מאמן","📋"],["fans","אוהדים","📣"],["shirt","חולצה","👕"],["pass","מסירה","↔️"],
  ["run","לרוץ","🏃"],["jump","לקפוץ","🦘"],["cup","גביע","🏆"],["keeper","שוער","🧤"],["referee","שופט","🟨"],
  ["captain","קפטן","©️"],["stadium","אצטדיון","🏟️"],["fast","מהיר","⚡"],["score","להבקיע","🎯"],["lose","להפסיד","😞"]
];
const SENT=[
  ["I kick the ___.","ball",["ball","sun","milk"],"אני בועט בכדור."],
  ["He scores a ___!","goal",["goal","cat","bed"],"הוא מבקיע גול!"],
  ["We ___ the cup!","win",["win","sleep","eat"],"אנחנו זוכים בגביע!"],
  ["The keeper wears ___.","gloves",["gloves","pizza","trees"],"השוער לובש כפפות."],
  ["The ___ shows a red card.","referee",["referee","apple","moon"],"השופט מראה כרטיס אדום."],
  ["Pass the ball to ___!","me",["me","red","run"],"תמסור לי את הכדור!"],
  ["The fans are very ___.","happy",["happy","under","table"],"האוהדים מאוד שמחים."],
  ["She runs very ___.","fast",["fast","book","green"],"היא רצה מהר מאוד."],
  ["My team plays ___ Sunday.","on",["on","dog","yes"],"הקבוצה שלי משחקת ביום ראשון."],
  ["The coach ___ to the players.","talks",["talks","fish","blue"],"המאמן מדבר אל השחקנים."],
  ["Our team is the ___!","best",["best","egg","sit"],"הקבוצה שלנו הכי טובה!"],
  ["I ___ football every day.","play",["play","house","cold"],"אני משחק כדורגל כל יום."]
];
/* famous players: name on the shirt, how the voice says it, Hebrew */
const STARS=[
  ["MESSI","Messi","מסי"],["RONALDO","Ronaldo","רונאלדו"],["NEYMAR","Neymar","ניימאר"],["YAMAL","Yamal","ימאל"],
  ["PEDRI","Pedri","פדרי"],["GAVI","Gavi","גאבי"],["RAPHINHA","Raphinha","ראפיניה"],["OLMO","Olmo","אולמו"],
  ["MBAPPE","Mbappe","אמבפה"],["HAALAND","Haaland","הולאנד"],["SALAH","Salah","סלאח"],["KANE","Kane","קיין"],
  ["VINICIUS","Vinicius","ויניסיוס"],["BELLINGHAM","Bellingham","בלינגהאם"],["MODRIC","Modric","מודריץ'"],["NEUER","Neuer","נוייר"],
  ["SAKA","Saka","סאקה"],["PALMER","Palmer","פאלמר"],["INIESTA","Iniesta","אינייסטה"],["PIQUE","Pique","פיקה"],
  ["ZAHAVI","Zahavi","זהבי"],["BENAYOUN","Benayoun","בניון"],["RASHFORD","Rashford","רשפורד"]
];

const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const opts3=(ans,pool)=>shuffle([ans,...shuffle(pool.filter(x=>x!==ans)).slice(0,2)]);

/* ---------- progress (shared by both pages; same origin = same storage) ---------- */
const KEY="english-kick-v1";
const P={team:null,unlocked:1,stars:{},goals:0,best:{},xp:0,badges:{},flags:{},items:{},hist:{},music:true,ver:2};
try{ const raw=localStorage.getItem(KEY); if(raw){ const old=JSON.parse(raw);
  if(!old.ver){ // v1 had 7 stages; v2 inserts 3 star-player stages. Map old stage numbers to new ones.
    const MAP=[0,1,2,3,5,7,8,10,11]; const st={};
    Object.keys(old.stars||{}).forEach(k=>{ st[MAP[+k]]=old.stars[k]; });
    old.stars=st; const u=old.unlocked||1; old.unlocked=MAP[Math.min(u,8)]; old.ver=2;
  }
  Object.assign(P,old); } }catch(e){}
const save=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(P)); }catch(e){} };

function acc(key){ const it=P.items[key]; if(!it||!it.r.length) return null; return it.r.reduce((a,b)=>a+b,0)/it.r.length; }
function recordItem(stage,key,ok){
  if(key){ const it=P.items[key]||(P.items[key]={c:0,t:0,r:[]}); it.t++; if(ok) it.c++; it.r.push(ok?1:0); if(it.r.length>6) it.r.shift(); }
  if(stage>0){ const h=P.hist[stage]||(P.hist[stage]=[]); h.push(ok?1:0); if(h.length>20) h.shift(); }
  save();
}
function mastery(stage){ const h=P.hist[stage]; if(!h||h.length<5) return null; return h.reduce((a,b)=>a+b,0)/h.length; }
/* weak or unseen items come up more often; no repeats inside one draw */
function pickWeighted(pool,keyFn,n){
  const bag=[...pool], out=[];
  while(out.length<n&&bag.length){
    const ws=bag.map(x=>{ const a=acc(keyFn(x)); return a===null?1.3:1.6-a; });
    let r=Math.random()*ws.reduce((a,b)=>a+b,0), i=0; for(;i<bag.length;i++){ r-=ws[i]; if(r<=0) break; }
    i=Math.min(i,bag.length-1); out.push(bag[i]); bag.splice(i,1);
  }
  return out;
}
/* after a match: decide what opens. win = 7/10, perfect = jump a stage, high mastery also opens the next stage */
function evaluate(stage,goals,shots){
  const before=P.unlocked, m=mastery(stage), N=STAGES.length;
  let target=before, why="";
  if(goals>=7&&target<stage+1){ target=stage+1; why="win"; }
  if(m!==null&&m>=.8&&(P.hist[stage]||[]).length>=10&&target<stage+1){ target=stage+1; why="mastery"; }
  if(goals>=shots&&stage+2<=N&&target<stage+2&&(P.stars[stage+1]||0)===0){ target=stage+2; why="jump"; P.stars[stage+1]=Math.max(P.stars[stage+1]||0,1); }
  P.unlocked=Math.min(Math.max(before,target),N+1); save();
  return {opened:P.unlocked>before, why, to:Math.min(P.unlocked,N), mastery:m};
}

/* ---------- stages: each question carries a key so the system can track what he knows ---------- */
const nameMiss=n=>{ // hide a middle letter that appears only once, so the answer is unambiguous
  const idx=[...n].map((c,i)=>i).filter(i=>i>0&&i<n.length-1&&/[A-Z]/.test(n[i])&&n.split(n[i]).length===2);
  const i=idx.length?idx[Math.floor(Math.random()*idx.length)]:1; return {i, shown:n.slice(0,i)+"_"+n.slice(i+1), letter:n[i]};
};
const STAGES=[
  {t:"אותיות גדולות", s:"שומעים אות ובועטים לאות הנכונה",
   make(){ return pickWeighted(LETTERS,L=>"L:"+L,10).map(L=>({key:"L:"+L, vis:"🔊", ask:"איזו אות שמעת?", speak:L+".", say:L+".", options:opts3(L,LETTERS), answer:L})); }},
  {t:"קטנה וגדולה", s:"מתאימים אות קטנה לאות הגדולה שלה",
   make(){ return pickWeighted(LETTERS,L=>"l:"+L,10).map(L=>({key:"l:"+L, vis:L.toLowerCase(), visEn:true, ask:"מצא את האות הגדולה", say:L+".", options:opts3(L,LETTERS), answer:L})); }},
  {t:"הצליל הראשון", s:"באיזו אות מתחילה המילה?",
   make(){ const lows=LETTERS.map(l=>l.toLowerCase()); return pickWeighted(PIC,p=>"F:"+p[0],10).map(([w,e])=>({key:"F:"+w, vis:e, ask:"באיזו אות מתחילה המילה?", sub:`<span class="en">_${esc(w.slice(1))}</span>`, speak:w, say:w, options:opts3(w[0],lows), answer:w[0], show:w})); }},
  {t:"כוכבים: האות הראשונה", s:"באיזו אות מתחיל השם של הכוכב?", star:true,
   make(){ return pickWeighted(STARS,s=>"S1:"+s[0],10).map(([n,sp,h])=>({key:"S1:"+n, vis:"⭐", ask:`באיזו אות מתחיל השם של ${h}?`, sub:`<span class="en">?${esc(n.slice(1))}</span>`, speak:sp, say:sp, options:opts3(n[0],LETTERS), answer:n[0], show:n, heb:h})); }},
  {t:"מילים ראשונות", s:"רואים תמונה ובוחרים את המילה",
   make(){ const words=PIC.map(p=>p[0]); return pickWeighted(PIC,p=>"W:"+p[0],10).map(([w,e])=>({key:"W:"+w, vis:e, ask:"מה המילה באנגלית?", say:w, options:opts3(w,words), answer:w})); }},
  {t:"כוכבים: האות החסרה", s:"איזו אות חסרה בשם של השחקן?", star:true,
   make(){ return pickWeighted(STARS,s=>"S2:"+s[0],10).map(([n,sp,h])=>{ const m=nameMiss(n); return {key:"S2:"+n, vis:"⭐", ask:`איזו אות חסרה בשם של ${h}?`, sub:`<span class="en">${esc(m.shown)}</span>`, speak:sp, say:sp, options:opts3(m.letter,LETTERS), answer:m.letter, show:n, heb:h}; }); }},
  {t:"מילים מהמגרש", s:"מילים של כדורגל, מעברית לאנגלית",
   make(){ const words=FOOT.map(f=>f[0]); return pickWeighted(FOOT,f=>"FW:"+f[0],10).map(([w,h,e])=>({key:"FW:"+w, vis:e, ask:`איך אומרים "${h}"?`, say:w, options:opts3(w,words), answer:w, heb:h})); }},
  {t:"שמיעה וקריאה", s:"שומעים מילה, בלי תמונה, ומוצאים אותה",
   make(){ const all=[...new Set([...PIC.map(p=>p[0]),...FOOT.map(f=>f[0])])]; return pickWeighted(all,w=>"H:"+w,10).map(w=>({key:"H:"+w, vis:"🔊", ask:"איזו מילה שמעת?", speak:w, say:w, options:opts3(w,all), answer:w})); }},
  {t:"כוכבים: קוראים שמות", s:"קוראים את השם באנגלית ומזהים את השחקן", star:true,
   make(){ const names=STARS.map(s=>s[0]), hebs=STARS.map(s=>s[2]);
     return pickWeighted(STARS,s=>"S3:"+s[0],10).map(([n,sp,h],i)=> i%2
       ? {key:"S3:"+n, vis:"🔊", ask:"איזה שחקן שמעת?", speak:sp, say:sp, options:opts3(n,names), answer:n, heb:h}
       : {key:"S3:"+n, vis:n, visEn:true, visName:true, ask:"מי זה? קרא את השם", say:sp, options:opts3(h,hebs), answer:h, show:n, heb:h}); }},
  {t:"משפטים מהמשחק", s:"משלימים את המילה החסרה במשפט",
   make(){ return pickWeighted(SENT,s=>"SN:"+s[1],10).map(([s,a,o,h])=>({key:"SN:"+a, vis:"📣", ask:"איזו מילה חסרה?", sub:`<span class="en">${esc(s)}</span>`, say:s.replace("___",a), options:shuffle(o), answer:a, heb:h, show:s.replace("___",a)})); }}
];

window.EK={LETTERS,PIC,FOOT,SENT,STARS,STAGES,P,save,acc,recordItem,mastery,pickWeighted,evaluate,shuffle,esc,opts3};
})();
