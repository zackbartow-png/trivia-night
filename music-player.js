const STORAGE_KEY='triviaNightGamesV1';
const gameId=new URLSearchParams(location.search).get('game');
const stateKey=`triviaNightPresenterState:${gameId||'default'}`;
let games=[]; try{games=JSON.parse(localStorage.getItem(STORAGE_KEY))||[];}catch{}
let game=games.find(g=>g.id===gameId)||games[0];
let player=null, apiReady=false, selectedCategoryIndex=0, selectedQuestionIndex=0, currentVideoId='', muted=false;
const channel=('BroadcastChannel' in window && game?.id)?new BroadcastChannel(`trivia-night-${game.id}`):null;

const gameTitle=document.querySelector('#gameTitle');
const presenterLink=document.querySelector('#presenterLink');
const categorySelect=document.querySelector('#categorySelect');
const trackList=document.querySelector('#trackList');
const playerShell=document.querySelector('#playerShell');
const currentTrack=document.querySelector('#currentTrack');
const currentLink=document.querySelector('#currentLink');
const questionBadge=document.querySelector('#questionBadge');
const presenterBackBtn=document.querySelector('#presenterBackBtn');
const presenterNextBtn=document.querySelector('#presenterNextBtn');
const syncStatus=document.querySelector('#syncStatus');
const buttons=['playBtn','pauseBtn','restartBtn','back10Btn','forward10Btn','muteBtn'].reduce((a,id)=>(a[id]=document.querySelector('#'+id),a),{});

function escText(s=''){return String(s);}
function musicCategories(){return (game?.categories||[]).map((cat,index)=>({cat,index})).filter(x=>x.cat?.type==='music');}
function youtubeId(input=''){
  const raw=String(input||'').trim(); if(!raw)return '';
  if(/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  try{
    const u=new URL(raw);
    const host=u.hostname.replace(/^www\./,'').toLowerCase();
    if(host==='youtu.be') return u.pathname.split('/').filter(Boolean)[0]?.slice(0,11)||'';
    if(host.endsWith('youtube.com')){
      const v=u.searchParams.get('v'); if(v) return v.slice(0,11);
      const parts=u.pathname.split('/').filter(Boolean);
      if(['embed','shorts','live'].includes(parts[0])) return (parts[1]||'').slice(0,11);
    }
  }catch{}
  return '';
}
function currentQuestion(){return game?.categories?.[selectedCategoryIndex]?.questions?.[selectedQuestionIndex]||{};}
function setControls(enabled){Object.values(buttons).forEach(b=>b.disabled=!enabled);}
function renderQueue(){
  if(!game){gameTitle.textContent='No game found';categorySelect.innerHTML='<option>No game found</option>';trackList.innerHTML='';return;}
  gameTitle.textContent=game.title||'Trivia Night'; presenterLink.href=`play.html?game=${encodeURIComponent(game.id)}`;
  const cats=musicCategories();
  if(!cats.length){categorySelect.innerHTML='<option>No Music Rounds</option>';trackList.innerHTML='<div class="sub">Change a category to Music Round in the game editor first.</div>';return;}
  if(!cats.some(x=>x.index===selectedCategoryIndex)) selectedCategoryIndex=cats[0].index;
  categorySelect.innerHTML=cats.map(({cat,index})=>`<option value="${index}" ${index===selectedCategoryIndex?'selected':''}>${index+1}. ${String(cat.name||`Category ${index+1}`).replace(/[<>&]/g,'')}</option>`).join('');
  const cat=game.categories[selectedCategoryIndex];
  trackList.innerHTML=(cat.questions||[]).map((q,i)=>{
    const linked=Boolean(youtubeId(q.youtubeUrl));
    return `<button class="track ${i===selectedQuestionIndex?'active':''}" data-q="${i}"><span class="qnum">${i+1}</span><span class="track-copy"><strong>${(q.answer||`Song ${i+1}`).replace(/[<>&]/g,'')}</strong><small>${linked?'YouTube link ready':'No YouTube link added'}</small></span><span class="${linked?'linked':'missing'}">${linked?'✓':'!'}</span></button>`;
  }).join('');
  updateTrackMeta();
}
function updateTrackMeta(){
  const q=currentQuestion(); const id=youtubeId(q.youtubeUrl);
  currentTrack.textContent=q.answer||`Song ${selectedQuestionIndex+1}`;
  currentLink.textContent=q.youtubeUrl||'No YouTube link added for this song.';
  questionBadge.textContent=`QUESTION ${selectedQuestionIndex+1}`;
  renderActiveRow();
  if(apiReady && id) cueVideo(id);
  else if(!id){currentVideoId='';setControls(false);}
}
function renderActiveRow(){document.querySelectorAll('.track').forEach((el,i)=>el.classList.toggle('active',Number(el.dataset.q)===selectedQuestionIndex));}
function createPlayer(videoId){
  playerShell.innerHTML='<div id="youtubePlayer"></div>';
  player=new YT.Player('youtubePlayer',{
    width:'640',height:'360',videoId,
    playerVars:{controls:1,playsinline:1,rel:0,origin:location.origin},
    events:{
      onReady:()=>{setControls(true);currentVideoId=videoId;},
      onError:e=>{syncStatus.innerHTML=`<strong>YouTube player:</strong> This video could not be loaded in the embedded player (error ${e.data}). Try another YouTube upload.`;}
    }
  });
}
function cueVideo(videoId){
  if(!videoId||!apiReady)return;
  if(!player){createPlayer(videoId);return;}
  if(videoId===currentVideoId)return;
  try{player.cueVideoById({videoId,startSeconds:0});currentVideoId=videoId;setControls(true);}catch{}
}
window.onYouTubeIframeAPIReady=()=>{apiReady=true;const id=youtubeId(currentQuestion().youtubeUrl);if(id)cueVideo(id);};

function selectTrack(qIndex,fromPresenter=false){
  selectedQuestionIndex=Math.max(0,Math.min(9,Number(qIndex)||0));
  updateTrackMeta();
  if(fromPresenter) syncStatus.innerHTML=`<strong>Presenter sync:</strong> Music Round question ${selectedQuestionIndex+1} is ready. Press Play when you want the music to start.`;
}
function handlePresenterState(state){
  if(!state||state.type!=='presenter-state'||state.gameId!==game?.id)return;
  const cat=game.categories?.[state.categoryIndex];
  if(state.phase==='question' && cat?.type==='music'){
    selectedCategoryIndex=state.categoryIndex; categorySelect.value=String(selectedCategoryIndex); renderQueue(); selectTrack(state.questionIndex,true);
  }else{
    const label=state.phase==='pass'?'Pass Your Papers':state.phase==='answers'?'Answers':state.phase==='intro'?`Category ${Number(state.categoryIndex)+1} intro`:state.phase;
    syncStatus.innerHTML=`<strong>Presenter sync:</strong> Presenter is currently on ${label}. The last music song remains cued here.`;
  }
}

categorySelect.addEventListener('change',()=>{selectedCategoryIndex=Number(categorySelect.value)||0;selectedQuestionIndex=0;renderQueue();updateTrackMeta();});
trackList.addEventListener('click',e=>{const row=e.target.closest('[data-q]');if(row)selectTrack(Number(row.dataset.q),false);});
buttons.playBtn.addEventListener('click',()=>player?.playVideo());
buttons.pauseBtn.addEventListener('click',()=>player?.pauseVideo());
buttons.restartBtn.addEventListener('click',()=>{if(!player)return;player.seekTo(0,true);player.playVideo();});
buttons.back10Btn.addEventListener('click',()=>{if(!player)return;player.seekTo(Math.max(0,(player.getCurrentTime?.()||0)-10),true);});
buttons.forward10Btn.addEventListener('click',()=>{if(!player)return;const dur=player.getDuration?.()||1e9;player.seekTo(Math.min(dur,(player.getCurrentTime?.()||0)+10),true);});
buttons.muteBtn.addEventListener('click',()=>{if(!player)return;muted=!muted;if(muted){player.mute();buttons.muteBtn.textContent='Unmute';}else{player.unMute();buttons.muteBtn.textContent='Mute';}});
presenterBackBtn.addEventListener('click',()=>channel?.postMessage({type:'presenter-command',command:'back'}));
presenterNextBtn.addEventListener('click',()=>channel?.postMessage({type:'presenter-command',command:'next'}));
channel?.addEventListener('message',e=>handlePresenterState(e.data));
window.addEventListener('storage',e=>{
  if(e.key===stateKey && e.newValue){try{handlePresenterState(JSON.parse(e.newValue));}catch{}}
  if(e.key===STORAGE_KEY){try{games=JSON.parse(e.newValue)||[];game=games.find(g=>g.id===gameId)||games[0];renderQueue();}catch{}}
});

renderQueue();
try{const state=JSON.parse(localStorage.getItem(stateKey)||'null');if(state)handlePresenterState(state);}catch{}
