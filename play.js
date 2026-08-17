const STORAGE_KEY='triviaNightGamesV1';
const DEFAULT_ICONS=['🍿','⚾','🎵','🏛️','🍕','🧪','❓'];
const DEFAULT_COLORS=['#36a8f5','#08b7a7','#ff685f','#ffbf2f','#9465df','#1fc8c0','#f2a31c'];
const BONUS_COLOR='#f2a31c';
const gameId=new URLSearchParams(location.search).get('game');
let games=[]; try { games=JSON.parse(localStorage.getItem(STORAGE_KEY))||[]; } catch {}
const game=games.find(g=>g.id===gameId)||games[0];
let categoryIndex=0, questionIndex=0, announcementIndex=0;
let phase=(game?.announcements?.length?'pregame':'intro');
let timerHandle=null, announcementHandle=null;
let hostMusicCategoryIndex=null;
const presenterStateKey=`triviaNightPresenterState:${gameId||'default'}`;
const presenterChannel=('BroadcastChannel' in window && gameId) ? new BroadcastChannel(`trivia-night-${gameId}`) : null;
const musicHostStateKey=`triviaNightMusicHostState:${gameId||'default'}`;
const musicHostCommandKey=`triviaNightMusicHostCommand:${gameId||'default'}`;
let musicHostState=null;
let musicHostStatusTimer=null;

const stage=document.querySelector('#stage');
const gameName=document.querySelector('#gameName');
const progress=document.querySelector('#progress');
const nextBtn=document.querySelector('#nextBtn');
const backBtn=document.querySelector('#backBtn');
const fullscreenBtn=document.querySelector('#fullscreenBtn');
function esc(s=''){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function valid(){ return game && Array.isArray(game.categories) && game.categories.length===7; }
function catIcon(cat){ return cat?.icon || DEFAULT_ICONS[categoryIndex]; }
function catColor(cat){ return /^#[0-9a-f]{6}$/i.test(cat?.color||'') ? cat.color : DEFAULT_COLORS[categoryIndex]; }
function catName(cat){ return cat?.name || `Category ${categoryIndex+1}`; }
function catType(cat){ return ['music','picture'].includes(cat?.type)?cat.type:'standard'; }
function catDescription(cat){ return String(cat?.description||'').trim(); }
function timerEnabled(cat){ return Boolean(cat?.timerEnabled) && Number(cat?.timerSeconds)>0; }
function timerSeconds(cat){ return Math.min(300,Math.max(5,Number(cat?.timerSeconds)||30)); }
function bonusEnabled(){ return Boolean(game?.bonus?.enabled); }
function bonusName(){ return game?.bonus?.name || 'Bonus Round'; }
function bonusQuestion(){ return game?.bonus?.question || '[Bonus question not entered]'; }
function bonusAnswer(){ return game?.bonus?.answer || '[Bonus answer not entered]'; }
function announcements(){ return Array.isArray(game?.announcements)?game.announcements.filter(x=>x?.image):[]; }
function hasHalftime(){ return Boolean(game?.halftimeImage); }
function clearTimer(){ if(timerHandle){clearInterval(timerHandle);timerHandle=null;} }
function clearAnnouncementLoop(){ if(announcementHandle){clearInterval(announcementHandle);announcementHandle=null;} }
function clearAutomation(){ clearTimer(); clearAnnouncementLoop(); }
function setTheme(){ document.body.dataset.theme=game?.theme||'party'; }
function broadcastPresenterState(){
  if(!game) return;
  const payload={type:'presenter-state',gameId:game.id,phase,categoryIndex,questionIndex,updatedAt:Date.now()};
  try { localStorage.setItem(presenterStateKey,JSON.stringify(payload)); } catch {}
  try { presenterChannel?.postMessage(payload); } catch {}
}

function musicHostConnected(){
  return Boolean(musicHostState && musicHostState.gameId===game?.id && Date.now()-Number(musicHostState.updatedAt||0)<3500);
}
function updateMusicSlideControls(){
  const btn=stage.querySelector('[data-music-toggle]');
  const status=stage.querySelector('[data-music-host-status]');
  if(!btn || phase!=='question' || catType(game?.categories?.[categoryIndex])!=='music') return;
  const connected=musicHostConnected();
  const sameSong=connected && Number(musicHostState.categoryIndex)===categoryIndex && Number(musicHostState.questionIndex)===questionIndex;
  const playing=sameSong && Boolean(musicHostState.playing);
  btn.classList.toggle('is-playing',playing);
  btn.querySelector('.music-play-icon').textContent=playing?'Ⅱ':'▶';
  btn.querySelector('.music-play-label').textContent=playing?'PAUSE MUSIC':'PLAY MUSIC';
  if(status){
    status.textContent=!connected?'OPEN HOST MUSIC PLAYER':sameSong?(playing?'HOST PLAYER · PLAYING':'HOST PLAYER · READY'):'HOST PLAYER · READY';
    status.classList.toggle('is-connected',connected);
  }
}
function sendMusicHostCommand(command){
  if(phase!=='question' || catType(game?.categories?.[categoryIndex])!=='music') return;
  const payload={type:'music-player-command',gameId:game.id,command,categoryIndex,questionIndex,nonce:`${Date.now()}-${Math.random()}`,updatedAt:Date.now()};
  try { presenterChannel?.postMessage(payload); } catch {}
  try { localStorage.setItem(musicHostCommandKey,JSON.stringify(payload)); } catch {}
  const status=stage.querySelector('[data-music-host-status]');
  if(status) status.textContent=musicHostConnected()?'SENDING TO HOST PLAYER…':'OPEN HOST MUSIC PLAYER';
}
function applyMusicHostState(state){
  if(!state || state.type!=='music-player-state' || state.gameId!==game?.id) return;
  musicHostState=state;
  updateMusicSlideControls();
}
function startMusicHostStatusMonitor(){
  if(musicHostStatusTimer) return;
  musicHostStatusTimer=setInterval(updateMusicSlideControls,750);
}

function startQuestionTimer(cat){
  // When the host music player is controlling this music category, question changes are manual.
  // The saved YouTube OUT mark stops playback, but never advances the presenter slide.
  if(hostMusicCategoryIndex===categoryIndex && catType(cat)==='music') return;
  if(!timerEnabled(cat) || phase!=='question') return;
  let remaining=timerSeconds(cat);
  const value=document.querySelector('#questionTimerValue');
  const timer=document.querySelector('.question-timer');
  if(value) value.textContent=remaining;
  timerHandle=setInterval(()=>{
    if(phase!=='question'){ clearTimer(); return; }
    remaining-=1;
    if(value) value.textContent=Math.max(0,remaining);
    if(timer) timer.classList.toggle('timer-warning',remaining<=5);
    if(remaining<=0){ clearTimer(); next(); }
  },1000);
}
function startAnnouncementLoop(){
  if(announcementHandle) return;
  const slides=announcements();
  if(phase!=='pregame' || slides.length<2) return;
  const ms=Math.max(2,Math.min(60,Number(game.announcementSeconds)||8))*1000;
  announcementHandle=setInterval(()=>{
    if(phase!=='pregame'){ clearAnnouncementLoop(); return; }
    announcementIndex=(announcementIndex+1)%slides.length;
    render(false);
  },ms);
}
function roundDefaultSubtitle(cat){
  if(catType(cat)==='music') return '♫ Music Round · 10 songs';
  if(catType(cat)==='picture') return '🖼️ Picture Round · 10 images';
  return 'Get ready for 10 questions!';
}
function timerMarkup(cat){ return timerEnabled(cat)?`<div class="question-timer" aria-label="Question timer"><span id="questionTimerValue">${timerSeconds(cat)}</span><small>SEC</small></div>`:''; }

function render(resetAutomation=true){
  if(resetAutomation) clearAutomation();
  if(!valid()){
    gameName.textContent='Trivia Night'; progress.textContent='';
    stage.innerHTML='<div class="no-game"><h1>No game found</h1><p>Open a game from the Trivia Night manager first.</p></div>';
    nextBtn.disabled=true; backBtn.disabled=true; return;
  }
  setTheme();
  const cat=game.categories[categoryIndex];
  const icon=catIcon(cat), color=catColor(cat), name=catName(cat), type=catType(cat);
  gameName.textContent=game.title;
  backBtn.disabled=phase==='pregame' || (categoryIndex===0 && phase==='intro' && announcements().length===0);

  if(phase==='pregame'){
    const slides=announcements();
    if(!slides.length){ phase='intro'; render(); return; }
    announcementIndex=Math.min(announcementIndex,slides.length-1);
    progress.textContent=`Pre-Game · Slide ${announcementIndex+1}/${slides.length}`;
    stage.innerHTML=`<section class="slide media-slide announcement-slide"><img src="${slides[announcementIndex].image}" alt="Pre-game announcement ${announcementIndex+1}"></section>`;
    nextBtn.querySelector('span').textContent='Start Game';
    startAnnouncementLoop();
  } else if(phase==='intro'){
    progress.textContent=`Category ${categoryIndex+1}/7 · Ready`;
    stage.innerHTML=`<section class="slide category-intro-slide confetti-field" style="--slide-color:${color}">
      <div class="intro-logo"><span>TRIVIA</span><b>★ NIGHT ★</b></div>
      <div class="intro-label">UP NEXT</div>
      <h1 class="intro-category-name">${esc(name).toUpperCase()}</h1>
      ${catDescription(cat)?`<div class="intro-description">(${esc(catDescription(cat).replace(/^\(+|\)+$/g,'').trim())})</div>`:''}
      <div class="intro-icon-wrap" style="--category-color:${color}"><div class="intro-icon">${icon}</div></div>
      <div class="intro-category-count">Category ${categoryIndex+1} of 7</div>
      <div class="intro-subtitle">${esc(roundDefaultSubtitle(cat))}</div>
      <button class="intro-stage-button" data-presenter-next>START CATEGORY ▶</button>
      <div class="intro-start-cue">You can also use Right Arrow, Enter, or Space</div>
    </section>`;
    nextBtn.querySelector('span').textContent='Start Category';
  } else if(phase==='question'){
    progress.textContent=`Category ${categoryIndex+1}/7 · ${type==='picture'?'Picture':'Question'} ${questionIndex+1}/10`;
    const item=cat.questions?.[questionIndex]||{};
    if(type==='music'){
      stage.innerHTML=`<section class="slide music-external-slide confetti-field" style="--slide-color:${color}">
        <div class="slide-category">${icon} ${esc(name)}</div>
        <div class="slide-count">QUESTION ${questionIndex+1} OF 10</div>
        ${timerMarkup(cat)}
        <div class="music-external-kicker">♫ MUSIC ROUND</div>
        <div class="music-external-question">QUESTION ${questionIndex+1}</div>
        <div class="music-slide-controls">
          <button class="music-slide-play-button" type="button" data-music-toggle aria-label="Play or pause the host music player"><span class="music-play-icon">▶</span><span class="music-play-label">PLAY MUSIC</span></button>
          <div class="music-slide-host-status" data-music-host-status>CONNECTING TO HOST PLAYER…</div>
        </div>
      </section>`;
    } else if(type==='picture'){
      stage.innerHTML=`<section class="slide picture-round-slide confetti-field ${item.question?'has-picture-prompt':''}" style="--slide-color:${color}">
        <div class="slide-category">${icon} ${esc(name)}</div>
        <div class="slide-count">PICTURE ${questionIndex+1} OF 10</div>
        ${timerMarkup(cat)}
        ${item.image?`<div class="picture-media-frame"><img class="presenter-picture" src="${item.image}" alt="Picture ${questionIndex+1}"></div>`:`<div class="picture-missing">PICTURE ${questionIndex+1}<small>No image uploaded</small></div>`}
        ${item.question?`<div class="picture-prompt-text">${esc(item.question)}</div>`:''}
      </section>`;
    } else {
      const text=item.question || '[Question not entered]';
      stage.innerHTML=`<section class="slide confetti-field" style="--slide-color:${color}">
        <div class="slide-category">${icon} ${esc(name)}</div>
        <div class="slide-count">QUESTION ${questionIndex+1} OF 10</div>
        ${timerMarkup(cat)}
        <div class="question-star left">★</div><div class="question-star right">★</div>
        <div class="slide-question">${esc(text)}</div>
      </section>`;
    }
    nextBtn.querySelector('span').textContent=questionIndex===9?'Pass Papers':'Next';
    startQuestionTimer(cat);
  } else if(phase==='pass'){
    progress.textContent=`Category ${categoryIndex+1}/7 · Round Complete`;
    stage.innerHTML=`<section class="slide pass-slide confetti-field">
      <div class="pass-burst a">★</div><div class="pass-burst b">★</div>
      <h1>PASS<br><span class="pass-your">YOUR</span><br>PAPERS</h1>
      <div class="pass-instruction">When the papers are passed, manually continue to reveal all 10 answers.</div>
    </section>`;
    nextBtn.querySelector('span').textContent='Show Answers';
  } else if(phase==='answers'){
    progress.textContent=`Category ${categoryIndex+1}/7 · Answers`;
    stage.innerHTML=`<section class="slide answer-slide confetti-field" style="--slide-color:${color}">
      <h1 class="answers-heading">ANSWERS</h1>
      <div class="answers-subheading">${icon} ${esc(name)}${type==='music'?' · MUSIC ROUND':type==='picture'?' · PICTURE ROUND':''}</div>
      <div class="answer-grid">${cat.questions.map((q,i)=>`<div class="answer-row"><div class="answer-number" style="background:${color}">${i+1}</div><div class="answer-text">${esc(q.answer || '[Answer not entered]')}</div></div>`).join('')}</div>
    </section>`;
    if(categoryIndex===3 && hasHalftime()) nextBtn.querySelector('span').textContent='Halftime';
    else if(categoryIndex<6) nextBtn.querySelector('span').textContent='Next Category';
    else nextBtn.querySelector('span').textContent=bonusEnabled()?bonusName():'Finish Game';
  } else if(phase==='halftime'){
    progress.textContent='Halftime · Between Rounds 4 & 5';
    stage.innerHTML=`<section class="slide media-slide halftime-slide"><img src="${game.halftimeImage}" alt="Halftime"></section>`;
    nextBtn.querySelector('span').textContent='Start Round 5';
  } else if(phase==='bonusIntro'){
    progress.textContent=`${bonusName()} · Ready`;
    stage.innerHTML=`<section class="slide bonus-intro-slide confetti-field" style="--slide-color:${BONUS_COLOR}">
      <div class="intro-logo"><span>TRIVIA</span><b>★ NIGHT ★</b></div>
      <div class="bonus-kicker">FINAL ROUND</div>
      <h1 class="bonus-title bonus-custom-title">${esc(bonusName()).toUpperCase()}</h1>
      <div class="bonus-star-wrap"><div class="bonus-star">⭐</div></div>
      <div class="bonus-subtitle">One final question!</div>
      <button class="intro-stage-button bonus-start-button" data-presenter-next>SHOW BONUS QUESTION ▶</button>
    </section>`;
    nextBtn.querySelector('span').textContent='Show Question';
  } else if(phase==='bonusQuestion'){
    progress.textContent=`${bonusName()} · Question`;
    stage.innerHTML=`<section class="slide bonus-question-slide confetti-field" style="--slide-color:${BONUS_COLOR}">
      <div class="slide-category bonus-ribbon">⭐ ${esc(bonusName()).toUpperCase()}</div>
      <div class="slide-count">FINAL QUESTION</div>
      <div class="question-star left">★</div><div class="question-star right">★</div>
      <div class="slide-question">${esc(bonusQuestion())}</div>
    </section>`;
    nextBtn.querySelector('span').textContent='Show Answer';
  } else if(phase==='bonusAnswer'){
    progress.textContent=`${bonusName()} · Answer`;
    stage.innerHTML=`<section class="slide bonus-answer-slide confetti-field" style="--slide-color:${BONUS_COLOR}">
      <div class="bonus-answer-label">⭐ ${esc(bonusName()).toUpperCase()} ANSWER</div>
      <div class="bonus-answer-question">${esc(bonusQuestion())}</div>
      <div class="bonus-answer-value">${esc(bonusAnswer())}</div>
    </section>`;
    nextBtn.querySelector('span').textContent='Finish Game';
  } else {
    progress.textContent='Game Complete';
    stage.innerHTML=`<section class="slide complete-slide confetti-field"><div class="complete-trophy">🏆</div><h1>TRIVIA<br><span>COMPLETE!</span></h1><p>Thanks for playing.</p></section>`;
    nextBtn.querySelector('span').textContent='Restart Game';
  }
  broadcastPresenterState();
  updateMusicSlideControls();
}
function next(){
  if(!valid()) return;
  clearAutomation();
  if(phase==='pregame'){ categoryIndex=0; questionIndex=0; phase='intro'; }
  else if(phase==='intro'){ questionIndex=0; phase='question'; }
  else if(phase==='question'){ if(questionIndex<9) questionIndex++; else phase='pass'; }
  else if(phase==='pass') phase='answers';
  else if(phase==='answers'){
    if(categoryIndex===3 && hasHalftime()) phase='halftime';
    else if(categoryIndex<6){ categoryIndex++; questionIndex=0; phase='intro'; }
    else if(bonusEnabled()) phase='bonusIntro';
    else phase='complete';
  }
  else if(phase==='halftime'){ categoryIndex=4; questionIndex=0; phase='intro'; }
  else if(phase==='bonusIntro') phase='bonusQuestion';
  else if(phase==='bonusQuestion') phase='bonusAnswer';
  else if(phase==='bonusAnswer') phase='complete';
  else { categoryIndex=0; questionIndex=0; announcementIndex=0; phase=announcements().length?'pregame':'intro'; }
  render();
}
function back(){
  if(!valid()) return;
  clearAutomation();
  if(phase==='pregame') return;
  if(phase==='intro'){
    if(categoryIndex===0 && announcements().length){ announcementIndex=0; phase='pregame'; }
    else if(categoryIndex===4 && hasHalftime()){ categoryIndex=3; phase='halftime'; }
    else if(categoryIndex>0){ categoryIndex--; questionIndex=9; phase='answers'; }
  } else if(phase==='question'){
    if(questionIndex>0) questionIndex--;
    else phase='intro';
  } else if(phase==='pass'){
    phase='question'; questionIndex=9;
  } else if(phase==='answers'){
    phase='pass';
  } else if(phase==='halftime'){
    categoryIndex=3; phase='answers';
  } else if(phase==='bonusIntro'){
    categoryIndex=6; phase='answers';
  } else if(phase==='bonusQuestion'){
    phase='bonusIntro';
  } else if(phase==='bonusAnswer'){
    phase='bonusQuestion';
  } else if(phase==='complete'){
    if(bonusEnabled()) phase='bonusAnswer';
    else { phase='answers'; categoryIndex=6; }
  }
  render();
}
async function fullscreen(){ if(!document.fullscreenElement) await document.documentElement.requestFullscreen?.(); else await document.exitFullscreen?.(); }
presenterChannel?.addEventListener('message',e=>{
  const msg=e.data||{};
  if(msg.type==='music-player-state'){ applyMusicHostState(msg); return; }
  if(msg.type!=='presenter-command') return;
  if(msg.command==='next') next();
  if(msg.command==='back') back();
  if(msg.command==='music-question'){
    const targetCategory=Number(msg.categoryIndex);
    const targetQuestion=Number(msg.questionIndex);
    const targetCat=game?.categories?.[targetCategory];
    if(targetCat?.type==='music' && Number.isInteger(targetQuestion) && targetQuestion>=0 && targetQuestion<10){
      clearAutomation();
      categoryIndex=targetCategory;
      questionIndex=targetQuestion;
      phase='question';
      hostMusicCategoryIndex=targetCategory;
      render();
    }
  }
});
nextBtn.addEventListener('click',next); backBtn.addEventListener('click',back); fullscreenBtn.addEventListener('click',fullscreen);
stage.addEventListener('click',e=>{
  if(e.target.closest('[data-presenter-next]')) next();
  if(e.target.closest('[data-music-toggle]')) sendMusicHostCommand('toggle');
});
document.addEventListener('keydown',e=>{
  if(['ArrowRight','Enter',' '].includes(e.key)){e.preventDefault();next();}
  if(e.key==='ArrowLeft'){e.preventDefault();back();}
  if(e.key.toLowerCase()==='f') fullscreen();
});
window.addEventListener('storage',e=>{
  if(e.key===musicHostStateKey && e.newValue){try{applyMusicHostState(JSON.parse(e.newValue));}catch{}}
});
try{const savedHostState=JSON.parse(localStorage.getItem(musicHostStateKey)||'null');if(savedHostState)applyMusicHostState(savedHostState);}catch{}
startMusicHostStatusMonitor();
render();
