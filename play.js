const STORAGE_KEY='triviaNightGamesV1';
const DEFAULT_ICONS=['🍿','⚾','🎵','🏛️','🍕','🧪','❓'];
const DEFAULT_COLORS=['#36a8f5','#08b7a7','#ff685f','#ffbf2f','#9465df','#1fc8c0','#f2a31c'];
const BONUS_COLOR='#f2a31c';
const gameId=new URLSearchParams(location.search).get('game');
let games=[]; try { games=JSON.parse(localStorage.getItem(STORAGE_KEY))||[]; } catch {}
const game=games.find(g=>g.id===gameId)||games[0];
let categoryIndex=0, questionIndex=0, phase='intro';

const stage=document.querySelector('#stage');
const gameName=document.querySelector('#gameName');
const progress=document.querySelector('#progress');
const nextBtn=document.querySelector('#nextBtn');
const backBtn=document.querySelector('#backBtn');
const fullscreenBtn=document.querySelector('#fullscreenBtn');
function esc(s=''){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function valid(){ return game && Array.isArray(game.categories) && game.categories.length===7; }
function catIcon(cat){ return cat?.icon || DEFAULT_ICONS[categoryIndex]; }
function catColor(cat){ return /^#[0-9a-f]{6}$/i.test(cat?.color||'') ? cat.color : DEFAULT_COLORS[categoryIndex]; }
function catName(cat){ return cat?.name || `Category ${categoryIndex+1}`; }
function isMusicRound(cat){ return cat?.type === 'music'; }
function bonusEnabled(){ return Boolean(game?.bonus?.enabled); }
function bonusQuestion(){ return game?.bonus?.question || '[Bonus question not entered]'; }
function bonusAnswer(){ return game?.bonus?.answer || '[Bonus answer not entered]'; }

function render(){
  if(!valid()){
    gameName.textContent='Trivia Night'; progress.textContent='';
    stage.innerHTML='<div class="no-game"><h1>No game found</h1><p>Open a game from the Trivia Night manager first.</p></div>';
    nextBtn.disabled=true; backBtn.disabled=true; return;
  }
  const cat=game.categories[categoryIndex];
  const icon=catIcon(cat); const color=catColor(cat); const name=catName(cat); const music=isMusicRound(cat);
  gameName.textContent=game.title;
  backBtn.disabled=categoryIndex===0 && phase==='intro';

  if(phase==='intro'){
    progress.textContent=`Category ${categoryIndex+1}/7 · Ready`;
    stage.innerHTML=`<section class="slide category-intro-slide confetti-field" style="--slide-color:${color}">
      <div class="intro-logo"><span>TRIVIA</span><b>★ NIGHT ★</b></div>
      <div class="intro-label">UP NEXT</div>
      <h1 class="intro-category-name">${esc(name).toUpperCase()}</h1>
      <div class="intro-icon-wrap" style="--category-color:${color}"><div class="intro-icon">${icon}</div></div>
      <div class="intro-category-count">Category ${categoryIndex+1} of 7</div>
      <div class="intro-subtitle">${music?'♫ Music Round · 10 songs':'Get ready for 10 questions!'}</div>
      <button class="intro-stage-button" data-presenter-next>START CATEGORY ▶</button>
      <div class="intro-start-cue">You can also use Right Arrow, Enter, or Space</div>
    </section>`;
    nextBtn.querySelector('span').textContent='Start Category';
  } else if(phase==='question'){
    progress.textContent=`Category ${categoryIndex+1}/7 · Question ${questionIndex+1}/10`;
    if(music){
      stage.innerHTML=`<section class="slide music-external-slide confetti-field" style="--slide-color:${color}">
        <div class="slide-category">${icon} ${esc(name)}</div>
        <div class="music-external-kicker">♫ MUSIC ROUND</div>
        <div class="music-external-question">QUESTION ${questionIndex+1}</div>
        <div class="music-external-count">${questionIndex+1} OF 10</div>
      </section>`;
    } else {
      const text=cat.questions?.[questionIndex]?.question || '[Question not entered]';
      stage.innerHTML=`<section class="slide confetti-field" style="--slide-color:${color}">
        <div class="slide-category">${icon} ${esc(name)}</div>
        <div class="slide-count">QUESTION ${questionIndex+1} OF 10</div>
        <div class="question-star left">★</div><div class="question-star right">★</div>
        <div class="slide-question">${esc(text)}</div>
      </section>`;
    }
    nextBtn.querySelector('span').textContent=questionIndex===9?'Pass Papers':'Next';
  } else if(phase==='pass'){
    progress.textContent=`Category ${categoryIndex+1}/7 · Round Complete`;
    stage.innerHTML=`<section class="slide pass-slide confetti-field">
      <div class="pass-burst a">★</div><div class="pass-burst b">★</div>
      <h1>PASS<br><span class="pass-your">YOUR</span><br>PAPERS</h1>
      <div class="pass-instruction">When the papers are passed, continue to reveal all 10 answers.</div>
    </section>`;
    nextBtn.querySelector('span').textContent='Show Answers';
  } else if(phase==='answers'){
    progress.textContent=`Category ${categoryIndex+1}/7 · Answers`;
    stage.innerHTML=`<section class="slide answer-slide confetti-field" style="--slide-color:${color}">
      <h1 class="answers-heading">ANSWERS</h1>
      <div class="answers-subheading">${icon} ${esc(name)}${music?' · MUSIC ROUND':''}</div>
      <div class="answer-grid">${cat.questions.map((q,i)=>`<div class="answer-row"><div class="answer-number" style="background:${color}">${i+1}</div><div class="answer-text">${esc(q.answer || '[Answer not entered]')}</div></div>`).join('')}</div>
    </section>`;
    if(categoryIndex<6) nextBtn.querySelector('span').textContent='Next Category';
    else nextBtn.querySelector('span').textContent=bonusEnabled()?'Bonus Round':'Finish Game';
  } else if(phase==='bonusIntro'){
    progress.textContent='Bonus Round · Ready';
    stage.innerHTML=`<section class="slide bonus-intro-slide confetti-field" style="--slide-color:${BONUS_COLOR}">
      <div class="intro-logo"><span>TRIVIA</span><b>★ NIGHT ★</b></div>
      <div class="bonus-kicker">FINAL ROUND</div>
      <h1 class="bonus-title">BONUS<br><span>ROUND</span></h1>
      <div class="bonus-star-wrap"><div class="bonus-star">⭐</div></div>
      <div class="bonus-subtitle">One final question!</div>
      <button class="intro-stage-button bonus-start-button" data-presenter-next>SHOW BONUS QUESTION ▶</button>
    </section>`;
    nextBtn.querySelector('span').textContent='Show Question';
  } else if(phase==='bonusQuestion'){
    progress.textContent='Bonus Round · Question';
    stage.innerHTML=`<section class="slide bonus-question-slide confetti-field" style="--slide-color:${BONUS_COLOR}">
      <div class="slide-category bonus-ribbon">⭐ BONUS ROUND</div>
      <div class="slide-count">FINAL QUESTION</div>
      <div class="question-star left">★</div><div class="question-star right">★</div>
      <div class="slide-question">${esc(bonusQuestion())}</div>
    </section>`;
    nextBtn.querySelector('span').textContent='Show Answer';
  } else if(phase==='bonusAnswer'){
    progress.textContent='Bonus Round · Answer';
    stage.innerHTML=`<section class="slide bonus-answer-slide confetti-field" style="--slide-color:${BONUS_COLOR}">
      <div class="bonus-answer-label">⭐ BONUS ANSWER</div>
      <div class="bonus-answer-question">${esc(bonusQuestion())}</div>
      <div class="bonus-answer-value">${esc(bonusAnswer())}</div>
    </section>`;
    nextBtn.querySelector('span').textContent='Finish Game';
  } else {
    progress.textContent='Game Complete';
    stage.innerHTML=`<section class="slide complete-slide confetti-field"><div class="complete-trophy">🏆</div><h1>TRIVIA<br><span>COMPLETE!</span></h1><p>Thanks for playing.</p></section>`;
    nextBtn.querySelector('span').textContent='Restart Game';
  }
}
function next(){
  if(!valid()) return;
  if(phase==='intro'){ questionIndex=0; phase='question'; }
  else if(phase==='question'){ if(questionIndex<9) questionIndex++; else phase='pass'; }
  else if(phase==='pass') phase='answers';
  else if(phase==='answers'){
    if(categoryIndex<6){ categoryIndex++; questionIndex=0; phase='intro'; }
    else if(bonusEnabled()) phase='bonusIntro';
    else phase='complete';
  }
  else if(phase==='bonusIntro') phase='bonusQuestion';
  else if(phase==='bonusQuestion') phase='bonusAnswer';
  else if(phase==='bonusAnswer') phase='complete';
  else { categoryIndex=0; questionIndex=0; phase='intro'; }
  render();
}
function back(){
  if(!valid()) return;
  if(phase==='intro'){
    if(categoryIndex>0){ categoryIndex--; questionIndex=9; phase='answers'; }
  } else if(phase==='question'){
    if(questionIndex>0) questionIndex--;
    else phase='intro';
  } else if(phase==='pass'){
    phase='question'; questionIndex=9;
  } else if(phase==='answers'){
    phase='pass';
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
nextBtn.addEventListener('click',next); backBtn.addEventListener('click',back); fullscreenBtn.addEventListener('click',fullscreen);
stage.addEventListener('click',e=>{ if(e.target.closest('[data-presenter-next]')) next(); });
document.addEventListener('keydown',e=>{
  if(['ArrowRight','Enter',' '].includes(e.key)){e.preventDefault();next();}
  if(e.key==='ArrowLeft'){e.preventDefault();back();}
  if(e.key.toLowerCase()==='f') fullscreen();
});
render();
