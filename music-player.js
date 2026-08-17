const STORAGE_KEY='triviaNightGamesV1';
const gameId=new URLSearchParams(location.search).get('game');
const stateKey=`triviaNightPresenterState:${gameId||'default'}`;
const presenterCommandKey=`triviaNightPresenterCommand:${gameId||'default'}`;
let games=[]; try{games=JSON.parse(localStorage.getItem(STORAGE_KEY))||[];}catch{}
let game=games.find(g=>g.id===gameId)||games[0];
let player=null, apiReady=false, selectedCategoryIndex=0, selectedQuestionIndex=0, currentVideoId='', muted=false;
let clipTimer=null, uiTimer=null, isScrubbing=false, playerReady=false;
let pendingSongAutoplay=null;
const channel=('BroadcastChannel' in window && game?.id)?new BroadcastChannel(`trivia-night-${game.id}`):null;
const musicHostStateKey=`triviaNightMusicHostState:${gameId||'default'}`;
const musicHostCommandKey=`triviaNightMusicHostCommand:${gameId||'default'}`;
let hostHeartbeatTimer=null, pendingPresenterPlaybackCommand=null, lastCommandNonce='';
let presenterPlaybackArmed=false, pendingArm=false, autoplayBlocked=false;
window.name='triviaMusicHost';

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
const remoteEnable=document.querySelector('#remoteEnable');
const enablePresenterPlayBtn=document.querySelector('#enablePresenterPlayBtn');
const remoteEnableText=document.querySelector('#remoteEnableText');
const clipRange=document.querySelector('#clipRange');
const currentTimeEl=document.querySelector('#currentTime');
const durationEl=document.querySelector('#durationTime');
const scrubber=document.querySelector('#trimScrubber');
const inValue=document.querySelector('#inValue');
const outValue=document.querySelector('#outValue');
const clipDuration=document.querySelector('#clipDuration');
const buttons=['playBtn','pauseBtn','restartBtn','back10Btn','forward10Btn','muteBtn','setInBtn','setOutBtn','clearOutBtn','goInBtn','goOutBtn'].reduce((a,id)=>(a[id]=document.querySelector('#'+id),a),{});

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
function clipIn(q=currentQuestion()){return Math.max(0,Number(q.youtubeIn)||0);}
function clipOut(q=currentQuestion()){
  const start=clipIn(q), out=Math.max(0,Number(q.youtubeOut)||0);
  return out>start ? out : 0;
}
function fmt(seconds=0, tenths=false){
  const n=Math.max(0,Number(seconds)||0);
  const whole=Math.floor(n), h=Math.floor(whole/3600),m=Math.floor((whole%3600)/60),s=whole%60;
  const base=h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`;
  return tenths?`${base}.${Math.floor((n-whole)*10)}`:base;
}

function isPlayerPlaying(){
  try{return typeof YT!=='undefined' && player?.getPlayerState?.()===YT.PlayerState.PLAYING;}catch{return false;}
}
function publishMusicPlayerState(extra={}){
  if(!game)return;
  const payload={type:'music-player-state',gameId:game.id,categoryIndex:selectedCategoryIndex,questionIndex:selectedQuestionIndex,playing:isPlayerPlaying(),playerReady:Boolean(playerReady),presenterPlaybackArmed,autoplayBlocked,currentTime:getCurrent(),updatedAt:Date.now(),...extra};
  try{channel?.postMessage(payload);}catch{}
  try{localStorage.setItem(musicHostStateKey,JSON.stringify(payload));}catch{}
}
function startHostHeartbeat(){
  if(hostHeartbeatTimer)return;
  publishMusicPlayerState();
  hostHeartbeatTimer=setInterval(()=>publishMusicPlayerState(),1000);
}
function stopHostHeartbeat(){if(hostHeartbeatTimer){clearInterval(hostHeartbeatTimer);hostHeartbeatTimer=null;}}
function setPresenterPlaybackArmed(armed,message=''){
  presenterPlaybackArmed=Boolean(armed);
  autoplayBlocked=false;
  if(remoteEnable){
    remoteEnable.classList.toggle('ready',presenterPlaybackArmed);
  }
  if(enablePresenterPlayBtn){
    enablePresenterPlayBtn.disabled=presenterPlaybackArmed;
    enablePresenterPlayBtn.textContent=presenterPlaybackArmed?'Presenter Play Enabled':'Enable Presenter Play';
  }
  if(remoteEnableText){
    remoteEnableText.textContent=presenterPlaybackArmed
      ? 'Ready — the PLAY MUSIC button on the presenter can now start Song 1–10.'
      : 'Click once after opening this host window. Then PLAY MUSIC on the presenter can start the saved clip.';
  }
  if(message)syncStatus.innerHTML=message;
  publishMusicPlayerState();
}
function verifyRemotePlaybackStarted(songNumber){
  setTimeout(()=>{
    if(isPlayerPlaying()){
      autoplayBlocked=false;
      publishMusicPlayerState({playing:true});
      syncStatus.innerHTML=`<strong>Presenter control:</strong> Song ${songNumber} is playing from its saved IN mark.`;
    }else if(autoplayBlocked || !presenterPlaybackArmed){
      syncStatus.innerHTML='<strong>Presenter play was blocked:</strong> Click Enable Presenter Play once in this host window, then use PLAY MUSIC on the presenter again.';
    }
  },550);
}
function playSelectedClipFromIn(){
  if(!playerReady||!player)return false;
  const q=currentQuestion(), id=youtubeId(q.youtubeUrl);
  if(!id)return false;
  const start=clipIn(q), out=clipOut(q);
  try{
    // Always start the presenter-requested song from its saved IN mark.
    // loadVideoById both loads and plays when the video changes; otherwise
    // seek + play restarts the already-loaded clip.
    if(currentVideoId!==id){
      const obj={videoId:id,startSeconds:start};
      if(out)obj.endSeconds=out;
      player.loadVideoById(obj);
      currentVideoId=id;
      playerReady=true;
    }else{
      player.seekTo(start,true);
      player.playVideo();
    }
    startClipMonitor();
    verifyRemotePlaybackStarted(selectedQuestionIndex+1);
    return true;
  }catch{return false;}
}
function armPresenterPlayback(){
  if(!playerReady||!player){
    pendingArm=true;
    syncStatus.innerHTML='<strong>Presenter control:</strong> Waiting for the YouTube player to finish loading…';
    return;
  }
  const q=currentQuestion(), id=youtubeId(q.youtubeUrl);
  if(!id){
    syncStatus.innerHTML='<strong>Presenter control:</strong> Add a YouTube link to this song first.';
    return;
  }
  // A direct click in this host window supplies the browser user activation
  // required for later scripted playback from the presenter window.
  try{
    const wasMuted=player.isMuted?.()||false;
    player.mute?.();
    const start=clipIn(q);
    player.seekTo?.(start,true);
    player.playVideo?.();
    setTimeout(()=>{
      try{
        player.pauseVideo?.();
        player.seekTo?.(start,true);
        if(!wasMuted)player.unMute?.();
      }catch{}
      pendingArm=false;
      setPresenterPlaybackArmed(true,'<strong>Presenter control:</strong> Enabled. PLAY MUSIC on the presenter now controls this YouTube player.');
    },180);
  }catch{
    setPresenterPlaybackArmed(false,'<strong>Presenter control:</strong> Could not enable remote playback. Click the native YouTube Play button once, then try Enable Presenter Play again.');
  }
}
function runPendingPresenterPlaybackCommand(){
  if(!pendingPresenterPlaybackCommand || !playerReady || !player)return;
  const command=pendingPresenterPlaybackCommand;
  if(command.categoryIndex!==selectedCategoryIndex || command.questionIndex!==selectedQuestionIndex)return;
  let state=null;try{state=player.getPlayerState?.();}catch{}
  if(typeof YT!=='undefined' && state!==YT.PlayerState.CUED && state!==YT.PlayerState.PAUSED && state!==YT.PlayerState.PLAYING && state!==YT.PlayerState.ENDED)return;
  pendingPresenterPlaybackCommand=null;
  if(command.command==='pause') player.pauseVideo?.();
  else if(command.command==='play') playSelectedClipFromIn();
  else if(command.command==='toggle') { if(isPlayerPlaying()) player.pauseVideo?.(); else playSelectedClipFromIn(); }
  setTimeout(()=>publishMusicPlayerState(),60);
}
function handleMusicPlayerCommand(msg){
  if(!msg || msg.type!=='music-player-command' || msg.gameId!==game?.id)return;
  if(msg.nonce && msg.nonce===lastCommandNonce)return;
  if(msg.nonce)lastCommandNonce=msg.nonce;
  const targetCategory=Number(msg.categoryIndex),targetQuestion=Number(msg.questionIndex);
  const targetCat=game?.categories?.[targetCategory];
  if(targetCat?.type!=='music' || !Number.isInteger(targetQuestion) || targetQuestion<0 || targetQuestion>9)return;
  const sameTarget=selectedCategoryIndex===targetCategory && selectedQuestionIndex===targetQuestion;
  selectedCategoryIndex=targetCategory;selectedQuestionIndex=targetQuestion;
  categorySelect.value=String(selectedCategoryIndex);
  pendingPresenterPlaybackCommand={command:msg.command,categoryIndex:targetCategory,questionIndex:targetQuestion};
  if(!sameTarget){
    renderQueue({cue:false});
    updateTrackMeta(true);
  }else{
    renderActiveRow();
    questionBadge.textContent=`QUESTION ${selectedQuestionIndex+1}`;
    runPendingPresenterPlaybackCommand();
  }
  syncStatus.innerHTML=`<strong>Presenter control:</strong> Question ${selectedQuestionIndex+1} requested ${String(msg.command||'play').toUpperCase()}.`;
}
function setControls(enabled){
  Object.values(buttons).forEach(b=>{if(b)b.disabled=!enabled;});
  if(scrubber)scrubber.disabled=!enabled;
}
function updateClipRange(){
  const q=currentQuestion(), start=clipIn(q), out=clipOut(q);
  clipRange.textContent=`IN ${fmt(start)} · OUT ${out?fmt(out):'—'}`;
  if(inValue) inValue.textContent=fmt(start,true);
  if(outValue) outValue.textContent=out?fmt(out,true):'Not set';
  if(clipDuration) clipDuration.textContent=out?fmt(Math.max(0,out-start),true):'Manual stop';
  if(buttons.goOutBtn) buttons.goOutBtn.disabled=!playerReady || !out;
  if(buttons.clearOutBtn) buttons.clearOutBtn.disabled=!playerReady || !out;
}
function renderQueue({cue=true}={}){
  if(!game){gameTitle.textContent='No game found';categorySelect.innerHTML='<option>No game found</option>';trackList.innerHTML='';return;}
  gameTitle.textContent=game.title||'Trivia Night'; presenterLink.href=`play.html?game=${encodeURIComponent(game.id)}`;
  const cats=musicCategories();
  if(!cats.length){categorySelect.innerHTML='<option>No Music Rounds</option>';trackList.innerHTML='<div class="sub">Change a category to Music Round in the game editor first.</div>';return;}
  if(!cats.some(x=>x.index===selectedCategoryIndex)) selectedCategoryIndex=cats[0].index;
  categorySelect.innerHTML=cats.map(({cat,index})=>`<option value="${index}" ${index===selectedCategoryIndex?'selected':''}>${index+1}. ${String(cat.name||`Category ${index+1}`).replace(/[<>&]/g,'')}</option>`).join('');
  const cat=game.categories[selectedCategoryIndex];
  trackList.innerHTML=(cat.questions||[]).map((q,i)=>{
    const linked=Boolean(youtubeId(q.youtubeUrl));
    const start=clipIn(q),out=clipOut(q),clip=out?`Clip ${fmt(start)}–${fmt(out)}`:start?`Starts ${fmt(start)}`:'Full/manual clip';
    return `<button class="track ${i===selectedQuestionIndex?'active':''}" data-q="${i}"><span class="qnum">${i+1}</span><span class="track-copy"><strong>Song ${i+1}</strong><small>${linked?`${clip} · Ready`:'No YouTube link added'}</small></span><span class="${linked?'linked':'missing'}">${linked?'✓':'!'}</span></button>`;
  }).join('');
  updateTrackMeta(cue);
}
function pendingMatches(categoryIndex=selectedCategoryIndex,questionIndex=selectedQuestionIndex){
  return Boolean(pendingSongAutoplay && pendingSongAutoplay.categoryIndex===categoryIndex && pendingSongAutoplay.questionIndex===questionIndex);
}
function tryPendingSongAutoplay(){
  if(!pendingMatches() || !pendingSongAutoplay.presenterReady || !playerReady || !player) return;
  let state=null;
  try{state=player.getPlayerState?.();}catch{}
  // Wait until the requested video has actually been cued before starting it.
  if(typeof YT!=='undefined' && state!==YT.PlayerState.CUED && state!==YT.PlayerState.PAUSED && state!==YT.PlayerState.ENDED) return;
  const songNumber=selectedQuestionIndex+1;
  pendingSongAutoplay=null;
  playClip();
  syncStatus.innerHTML=`<strong>Song ${songNumber}:</strong> Presenter moved to Question ${songNumber} and the saved clip started automatically. It will stop at OUT without advancing the slide.`;
}
function sendPresenterCommand(command,extra={}){
  const payload={type:'presenter-command',gameId:game?.id||gameId,command,nonce:`host-${Date.now()}-${Math.random()}`,...extra};
  try{channel?.postMessage(payload);}catch{}
  // Same-origin fallback: storage events reach the presenter even when BroadcastChannel is unreliable.
  try{localStorage.setItem(presenterCommandKey,JSON.stringify(payload));}catch{}
  return payload;
}

function requestPresenterSong(qIndex){
  selectedQuestionIndex=Math.max(0,Math.min(9,Number(qIndex)||0));
  const id=youtubeId(currentQuestion().youtubeUrl);
  pendingSongAutoplay={categoryIndex:selectedCategoryIndex,questionIndex:selectedQuestionIndex,presenterReady:false};
  updateTrackMeta(true);
  sendPresenterCommand('music-question',{
    categoryIndex:selectedCategoryIndex,
    questionIndex:selectedQuestionIndex
  });
  if(!id){
    syncStatus.innerHTML=`<strong>Song ${selectedQuestionIndex+1}:</strong> Presenter was asked to move, but this song has no usable YouTube link.`;
  }else{
    syncStatus.innerHTML=`<strong>Song ${selectedQuestionIndex+1}:</strong> Moving the presenter to Question ${selectedQuestionIndex+1}. Playback will start automatically when the slide is ready.`;
  }
}

function updateTrackMeta(cue=true){
  const q=currentQuestion(); const id=youtubeId(q.youtubeUrl);
  currentTrack.textContent=`Song ${selectedQuestionIndex+1}`;
  currentLink.textContent='';
  questionBadge.textContent=`QUESTION ${selectedQuestionIndex+1}`;
  updateClipRange(); renderActiveRow();
  if(cue && apiReady && id) cueVideo(id);
  else if(!id){currentVideoId='';playerReady=false;setControls(false);}
}
function renderActiveRow(){document.querySelectorAll('.track').forEach(el=>el.classList.toggle('active',Number(el.dataset.q)===selectedQuestionIndex));}
function playerCueObject(videoId){
  const q=currentQuestion(),start=clipIn(q),out=clipOut(q),obj={videoId,startSeconds:start};
  if(out)obj.endSeconds=out;
  return obj;
}
function createPlayer(videoId){
  playerShell.innerHTML='<div id="youtubePlayer"></div>';
  player=new YT.Player('youtubePlayer',{
    width:'360',height:'203',videoId,
    playerVars:{controls:1,playsinline:1,rel:0,origin:location.origin},
    events:{
      onReady:()=>{playerReady=true;setControls(true);currentVideoId=videoId;try{player.getIframe?.().setAttribute('allow','autoplay; encrypted-media; picture-in-picture');}catch{}cueCurrentClip();startUiMonitor();publishMusicPlayerState();if(pendingArm)armPresenterPlayback();runPendingPresenterPlaybackCommand();},
      onStateChange:e=>{
        if(e.data===YT.PlayerState.PLAYING)startClipMonitor();else stopClipMonitor();
        if(e.data===YT.PlayerState.CUED || e.data===YT.PlayerState.PAUSED || e.data===YT.PlayerState.PLAYING) updateTimeline(true);
        if(e.data===YT.PlayerState.CUED || e.data===YT.PlayerState.PAUSED || e.data===YT.PlayerState.ENDED) tryPendingSongAutoplay();
        publishMusicPlayerState();
        if(e.data===YT.PlayerState.CUED || e.data===YT.PlayerState.PAUSED || e.data===YT.PlayerState.ENDED) runPendingPresenterPlaybackCommand();
      },
      onAutoplayBlocked:()=>{autoplayBlocked=true;publishMusicPlayerState({playing:false,autoplayBlocked:true});syncStatus.innerHTML='<strong>Presenter play was blocked by the browser:</strong> Click Enable Presenter Play once in this host window, then press PLAY MUSIC on the presenter again.';},
      onError:e=>{syncStatus.innerHTML=`<strong>YouTube player:</strong> This video could not be loaded in the embedded player (error ${e.data}). Try another YouTube upload.`;}
    }
  });
}
function cueCurrentClip(){
  const id=youtubeId(currentQuestion().youtubeUrl); if(!player||!id)return;
  try{player.cueVideoById(playerCueObject(id));currentVideoId=id;playerReady=true;setControls(true);updateClipRange();}catch{}
}
function cueVideo(videoId){
  if(!videoId||!apiReady)return;
  if(!player){createPlayer(videoId);return;}
  try{player.cueVideoById(playerCueObject(videoId));currentVideoId=videoId;playerReady=true;setControls(true);updateClipRange();}catch{}
}
window.onYouTubeIframeAPIReady=()=>{apiReady=true;const id=youtubeId(currentQuestion().youtubeUrl);if(id)cueVideo(id);};

function getCurrent(){try{return Math.max(0,Number(player?.getCurrentTime?.()||0));}catch{return 0;}}
function getDuration(){try{return Math.max(0,Number(player?.getDuration?.()||0));}catch{return 0;}}
function updateTimeline(force=false){
  if(!playerReady||!player)return;
  const now=getCurrent(), dur=getDuration();
  if(currentTimeEl)currentTimeEl.textContent=fmt(now,true);
  if(durationEl)durationEl.textContent=dur?fmt(dur):'—';
  if(scrubber&&dur>0){
    scrubber.max=String(dur);
    if(!isScrubbing||force)scrubber.value=String(Math.min(now,dur));
  }
}
function startUiMonitor(){
  stopUiMonitor();
  uiTimer=setInterval(()=>updateTimeline(false),100);
}
function stopUiMonitor(){if(uiTimer){clearInterval(uiTimer);uiTimer=null;}}
function startClipMonitor(){
  stopClipMonitor();
  clipTimer=setInterval(()=>{
    if(!player)return;
    const out=clipOut(); if(!out)return;
    const now=getCurrent();
    if(now>=out-.06){
      player.pauseVideo?.();
      player.seekTo?.(out,true);
      stopClipMonitor();
      updateTimeline(true);
      syncStatus.innerHTML=`<strong>Clip complete:</strong> Reached OUT mark at ${fmt(out,true)}. The presenter stays on this question. Choose another Song # when you are ready to move on.`;
      publishMusicPlayerState({playing:false});
    }
  },80);
}
function stopClipMonitor(){if(clipTimer){clearInterval(clipTimer);clipTimer=null;}}
function playClip(){
  if(!player)return;
  const start=clipIn(),out=clipOut(),now=getCurrent();
  if(now<start-.3 || (out && now>=out-.08)) player.seekTo(start,true);
  player.playVideo();
  setTimeout(()=>publishMusicPlayerState(),80);
}
function restartClip(){
  if(!player)return;
  const start=clipIn();
  player.seekTo(start,true);
  player.playVideo();
  syncStatus.innerHTML=`<strong>Clip restarted:</strong> Playing from IN ${fmt(start,true)}${clipOut()?` to OUT ${fmt(clipOut(),true)}`:''}.`;
}
function persistMarks(message){
  if(!game)return;
  game.updatedAt=new Date().toISOString();
  const idx=games.findIndex(g=>g.id===game.id); if(idx>=0)games[idx]=game;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(games));}catch{}
  updateClipRange();
  // Refresh only the queue labels. Do NOT re-cue or reload the video when a mark is saved.
  renderQueue({cue:false});
  if(message)syncStatus.innerHTML=message;
}
function setInHere(){
  if(!playerReady||!player)return;
  const q=currentQuestion(),time=Math.round(getCurrent()*10)/10;
  q.youtubeIn=time;
  if(Number(q.youtubeOut)||0){if(Number(q.youtubeOut)<=time+.1)q.youtubeOut=0;}
  persistMarks(`<strong>IN mark saved:</strong> ${fmt(time,true)}. Now scrub forward and click Set OUT Here.`);
}
function setOutHere(){
  if(!playerReady||!player)return;
  const q=currentQuestion(),time=Math.round(getCurrent()*10)/10,start=clipIn(q);
  if(time<=start+.2){syncStatus.innerHTML=`<strong>OUT mark not saved:</strong> Move past the IN mark (${fmt(start,true)}) first.`;return;}
  q.youtubeOut=time;
  persistMarks(`<strong>OUT mark saved:</strong> ${fmt(time,true)}. Your clip is ${fmt(time-start,true)} long. Press Play Clip to test it.`);
}
function clearOut(){
  const q=currentQuestion(); q.youtubeOut=0;
  persistMarks('<strong>OUT mark cleared:</strong> The song will continue until you pause or advance.');
}
function goTo(seconds){
  if(!playerReady||!player)return;
  player.seekTo(Math.max(0,Number(seconds)||0),true);
  updateTimeline(true);
}
function selectTrack(qIndex,fromPresenter=false){
  selectedQuestionIndex=Math.max(0,Math.min(9,Number(qIndex)||0));
  updateTrackMeta(true);
  if(fromPresenter) syncStatus.innerHTML=`<strong>Presenter sync:</strong> Music Round question ${selectedQuestionIndex+1} is cued at its IN mark.`;
}
function handlePresenterState(state){
  if(!state||state.type!=='presenter-state'||state.gameId!==game?.id)return;
  const cat=game.categories?.[state.categoryIndex];
  if(state.phase==='question' && cat?.type==='music'){
    const sameSelection=selectedCategoryIndex===state.categoryIndex && selectedQuestionIndex===state.questionIndex;
    selectedCategoryIndex=state.categoryIndex;
    categorySelect.value=String(selectedCategoryIndex);
    if(!sameSelection){
      renderQueue({cue:false});
      selectTrack(state.questionIndex,true);
    }else{
      renderActiveRow();
      questionBadge.textContent=`QUESTION ${selectedQuestionIndex+1}`;
    }
    if(pendingMatches(state.categoryIndex,state.questionIndex)){
      pendingSongAutoplay.presenterReady=true;
      tryPendingSongAutoplay();
    }else if(!pendingSongAutoplay){
      syncStatus.innerHTML=`<strong>Presenter sync:</strong> Music Round question ${selectedQuestionIndex+1} is selected.`;
    }
  }else{
    const label=state.phase==='pass'?'Pass Your Papers':state.phase==='answers'?'Answers':state.phase==='intro'?`Category ${Number(state.categoryIndex)+1} intro`:state.phase;
    syncStatus.innerHTML=`<strong>Presenter sync:</strong> Presenter is currently on ${label}. The last music song remains cued here.`;
  }
}

categorySelect.addEventListener('change',()=>{selectedCategoryIndex=Number(categorySelect.value)||0;selectedQuestionIndex=0;pendingSongAutoplay=null;renderQueue({cue:true});});
trackList.addEventListener('click',e=>{const row=e.target.closest('[data-q]');if(row)requestPresenterSong(Number(row.dataset.q));});
buttons.playBtn.addEventListener('click',playClip);
buttons.pauseBtn.addEventListener('click',()=>{player?.pauseVideo();setTimeout(()=>publishMusicPlayerState(),60);});
buttons.restartBtn.addEventListener('click',restartClip);
buttons.back10Btn.addEventListener('click',()=>goTo(Math.max(clipIn(),getCurrent()-10)));
buttons.forward10Btn.addEventListener('click',()=>{const out=clipOut(),dur=getDuration()||1e9,max=out||dur;goTo(Math.min(max,getCurrent()+10));});
buttons.muteBtn.addEventListener('click',()=>{if(!player)return;muted=!muted;if(muted){player.mute();buttons.muteBtn.textContent='Unmute';}else{player.unMute();buttons.muteBtn.textContent='Mute';}});
buttons.setInBtn.addEventListener('click',setInHere);
buttons.setOutBtn.addEventListener('click',setOutHere);
buttons.clearOutBtn.addEventListener('click',clearOut);
buttons.goInBtn.addEventListener('click',()=>goTo(clipIn()));
buttons.goOutBtn.addEventListener('click',()=>{if(clipOut())goTo(clipOut());});
if(scrubber){
  scrubber.addEventListener('pointerdown',()=>{isScrubbing=true;});
  scrubber.addEventListener('input',()=>{
    if(!playerReady||!player)return;
    isScrubbing=true;
    const t=Number(scrubber.value)||0;
    if(currentTimeEl)currentTimeEl.textContent=fmt(t,true);
    try{player.seekTo(t,false);}catch{}
  });
  scrubber.addEventListener('change',()=>{
    if(!playerReady||!player)return;
    const t=Number(scrubber.value)||0;
    try{player.seekTo(t,true);}catch{}
    isScrubbing=false;updateTimeline(true);
  });
  scrubber.addEventListener('pointerup',()=>{isScrubbing=false;updateTimeline(true);});
}
enablePresenterPlayBtn?.addEventListener('click',armPresenterPlayback);

// Expose a same-origin direct control fallback in addition to BroadcastChannel.
window.TriviaMusicHostController={
  gameId:game?.id||'',
  receivePresenterCommand:handleMusicPlayerCommand,
  playSong:(categoryIndex,questionIndex)=>handleMusicPlayerCommand({type:'music-player-command',gameId:game?.id,command:'play',categoryIndex,questionIndex,nonce:`direct-${Date.now()}-${Math.random()}`})
};

presenterBackBtn.addEventListener('click',()=>sendPresenterCommand('back'));
presenterNextBtn.addEventListener('click',()=>sendPresenterCommand('next'));
channel?.addEventListener('message',e=>{const msg=e.data||{};if(msg.type==='presenter-state')handlePresenterState(msg);if(msg.type==='music-player-command')handleMusicPlayerCommand(msg);});
window.addEventListener('storage',e=>{
  if(e.key===stateKey && e.newValue){try{handlePresenterState(JSON.parse(e.newValue));}catch{}}
  if(e.key===musicHostCommandKey && e.newValue){try{handleMusicPlayerCommand(JSON.parse(e.newValue));}catch{}}
  if(e.key===STORAGE_KEY){try{games=JSON.parse(e.newValue)||[];game=games.find(g=>g.id===gameId)||games[0];renderQueue({cue:false});}catch{}}
});
window.addEventListener('beforeunload',()=>{stopClipMonitor();stopUiMonitor();stopHostHeartbeat();try{localStorage.removeItem(musicHostStateKey);}catch{}});

renderQueue({cue:false});
try{const state=JSON.parse(localStorage.getItem(stateKey)||'null');if(state)handlePresenterState(state);}catch{}
startHostHeartbeat();
