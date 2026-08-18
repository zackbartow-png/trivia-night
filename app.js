const STORAGE_KEY = 'triviaNightGamesV1';
const SELECTED_KEY = 'triviaNightSelectedGameV1';

const DEFAULT_ICONS = ['🍿','⚾','🎵','🏛️','🍕','🧪','❓'];
const DEFAULT_COLORS = ['#36a8f5','#08b7a7','#ff685f','#ffbf2f','#9465df','#1fc8c0','#f2a31c'];
const COLOR_LIBRARY = [
  '#36a8f5','#1d8fe1','#0057b8','#5d7df5','#6c63ff','#9465df','#b65cff','#ef5da8',
  '#ff4f8b','#ff685f','#e64b3c','#f28c28','#f2a31c','#ffbf2f','#ffd84d','#72bf44',
  '#33a852','#08b7a7','#00a58f','#1fc8c0','#39c6d8','#607d8b','#7c6657','#1d2d50'
];
const ICON_LIBRARY = [
  '🍿','🎬','🎞️','📺','🪑','🎭','🎟️','📽️','🎥','🏆',
  '🎵','🎤','🎸','🎧','📻','🎹','🥁','🎷','🎺','🪕',
  '⚾','🏈','🏀','⚽','🎾','🏒','⛳','🎳','🥊','🏎️','🏐','🏓','🏸','🥅','🏅',
  '🍕','🍔','☕','🍸','🍦','🌮','🍩','🍎','🍷','🥨','🍺','🍰','🌶️','🥓','🍣',
  '🧪','⚛️','🚀','⚡','🔭','🧬','💡','🩺','🌡️','🤖','🧲','🔬','🧠','🦠','🪐',
  '🏛️','👑','🌍','📍','🏔️','🗺️','✈️','🚢','🏰','🗽','🌎','🌋','🏜️','🏝️','🧭',
  '📚','✏️','📰','📝','🔤','🎨','🖼️','📷','📸','🧩','🎮','🎲','🃏','♟️','🎯',
  '🐾','🐶','🐱','🦁','🐯','🐻','🦊','🐸','🦈','🐬','🦅','🦉','🐴','🐮','🦖',
  '💻','📱','⌚','💾','💿','📡','🛰️','🔌','💰','💵','🚗','🚂','🚁','🛠️','⚙️',
  '🌲','🌊','☀️','🌙','⭐','🌈','❄️','🔥','👻','🎄','🎃','❤️','💀','👽','🪄',
  '❓','❗','💯','🔔','🕰️','📅','🎁','🧁','👀','🗣️','👥','🎉','🥳','🏁','🔑'
];
const THEME_LIBRARY = [
  {id:'party', name:'Bright Party', desc:'The original bright projector-friendly look.'},
  {id:'dark', name:'Dark Night', desc:'Dark navy stage with bright text and accents.'},
  {id:'ocean', name:'Ocean Blue', desc:'Cool blue background with a clean light stage.'},
  {id:'sunset', name:'Sunset', desc:'Warm peach and coral background.'},
  {id:'retro', name:'Retro Arcade', desc:'Purple/blue retro background with grid accents.'},
  {id:'chalk', name:'Chalkboard', desc:'Dark green chalkboard-inspired background.'}
];


const QUESTION_BANK = {
  movies: [
    {q:'In The Wizard of Oz, what color is the brick road Dorothy follows?',a:'Yellow'},
    {q:'What is the name of the fictional archaeologist played by Harrison Ford in Raiders of the Lost Ark?',a:'Indiana Jones'},
    {q:'Which 1993 film features a theme park filled with cloned dinosaurs?',a:'Jurassic Park'},
    {q:'In Back to the Future, what speed must the DeLorean reach to travel through time?',a:'88 miles per hour'},
    {q:'Which animated film features the characters Woody and Buzz Lightyear?',a:'Toy Story'},
    {q:'What is the name of the kingdom where Disney’s Frozen is primarily set?',a:'Arendelle'},
    {q:'Which actor voices the character of Shrek in the Shrek films?',a:'Mike Myers'},
    {q:'In Jaws, what type of shark terrorizes Amity Island?',a:'Great white shark'},
    {q:'Which film franchise features the phrase “May the Force be with you”?',a:'Star Wars'},
    {q:'What is the name of the hotel in The Shining?',a:'The Overlook Hotel'}
  ],
  sports: [
    {q:'How many points is a touchdown worth before the extra point or conversion?',a:'6'},
    {q:'How many players from one team are on the court at a time in basketball?',a:'5'},
    {q:'What sport uses the terms birdie, eagle, and bogey?',a:'Golf'},
    {q:'How many strikes make an out in baseball?',a:'3'},
    {q:'In tennis, what word is used for a score of zero?',a:'Love'},
    {q:'What color jersey is traditionally worn by the leader of the Tour de France?',a:'Yellow'},
    {q:'How many holes are played in a standard round of golf?',a:'18'},
    {q:'In American football, how many yards are needed for a first down under normal circumstances?',a:'10 yards'},
    {q:'What sport is played at Wimbledon?',a:'Tennis'},
    {q:'In bowling, what is it called when all ten pins are knocked down with the first ball?',a:'A strike'}
  ],
  history: [
    {q:'Who was the first president of the United States?',a:'George Washington'},
    {q:'In what year did the United States Declaration of Independence get adopted?',a:'1776'},
    {q:'Which ancient civilization built Machu Picchu?',a:'The Inca'},
    {q:'Who was the British prime minister for most of World War II?',a:'Winston Churchill'},
    {q:'What ship carried the Pilgrims to North America in 1620?',a:'The Mayflower'},
    {q:'Which ancient city was buried by the eruption of Mount Vesuvius in AD 79?',a:'Pompeii'},
    {q:'The Renaissance began in which European country?',a:'Italy'},
    {q:'Who wrote the Ninety-Five Theses in 1517?',a:'Martin Luther'},
    {q:'Which wall fell in 1989, becoming a symbol of the end of the Cold War?',a:'The Berlin Wall'},
    {q:'What was the name of the first artificial satellite launched into orbit?',a:'Sputnik 1'}
  ],
  science: [
    {q:'What planet is known as the Red Planet?',a:'Mars'},
    {q:'What is the chemical symbol for gold?',a:'Au'},
    {q:'What gas do plants absorb from the atmosphere during photosynthesis?',a:'Carbon dioxide'},
    {q:'How many bones are in the typical adult human body?',a:'206'},
    {q:'What is the largest organ of the human body?',a:'The skin'},
    {q:'What force keeps planets in orbit around the Sun?',a:'Gravity'},
    {q:'What is the center of an atom called?',a:'The nucleus'},
    {q:'At sea level, water freezes at what temperature on the Celsius scale?',a:'0°C'},
    {q:'What is the closest star to Earth?',a:'The Sun'},
    {q:'What blood type is commonly called the universal red-cell donor?',a:'O negative'}
  ],
  food: [
    {q:'What country is traditionally credited as the birthplace of pizza?',a:'Italy'},
    {q:'Guacamole is primarily made from what fruit?',a:'Avocado'},
    {q:'What type of pastry is used to make a traditional éclair?',a:'Choux pastry'},
    {q:'What legume is the main ingredient in traditional hummus?',a:'Chickpeas'},
    {q:'What cheese is traditionally used in a Greek salad?',a:'Feta'},
    {q:'What spirit is the base of a traditional margarita?',a:'Tequila'},
    {q:'Sushi rice is traditionally seasoned with what type of vinegar?',a:'Rice vinegar'},
    {q:'What nut is used to make traditional marzipan?',a:'Almond'},
    {q:'What fruit is dried to make a prune?',a:'Plum'},
    {q:'What Italian dessert literally means “pick me up”?',a:'Tiramisu'}
  ],
  geography: [
    {q:'What is the largest ocean on Earth?',a:'The Pacific Ocean'},
    {q:'What river flows through Paris?',a:'The Seine'},
    {q:'What is the capital of Australia?',a:'Canberra'},
    {q:'Mount Kilimanjaro is located in which country?',a:'Tanzania'},
    {q:'What is the smallest country in the world by area?',a:'Vatican City'},
    {q:'Which U.S. state is made up entirely of islands?',a:'Hawaii'},
    {q:'What desert covers much of northern Africa?',a:'The Sahara Desert'},
    {q:'What is the capital city of Japan?',a:'Tokyo'},
    {q:'Which continent contains the South Pole?',a:'Antarctica'},
    {q:'The Great Barrier Reef lies off the coast of which country?',a:'Australia'}
  ],
  music: [
    {q:'Which band recorded the song “Bohemian Rhapsody”?',a:'Queen'},
    {q:'Which singer is commonly known as the “King of Pop”?',a:'Michael Jackson'},
    {q:'What instrument has 88 keys on a standard modern version?',a:'Piano'},
    {q:'Which band featured John Lennon, Paul McCartney, George Harrison, and Ringo Starr?',a:'The Beatles'},
    {q:'Which singer recorded “Jolene” and “9 to 5”?',a:'Dolly Parton'},
    {q:'What family of instruments includes the violin, viola, cello, and double bass?',a:'Strings'},
    {q:'Which composer wrote the famous Fifth Symphony that begins with four dramatic notes?',a:'Ludwig van Beethoven'},
    {q:'Which singer is known for the song “Respect”?',a:'Aretha Franklin'},
    {q:'What musical symbol raises a note by one semitone?',a:'A sharp'},
    {q:'Which rock band released the album The Dark Side of the Moon?',a:'Pink Floyd'}
  ],
  television: [
    {q:'What is the name of the coffee shop frequently visited by the friends in Friends?',a:'Central Perk'},
    {q:'In The Simpsons, what is the name of the family’s hometown?',a:'Springfield'},
    {q:'What paper company is the setting for The Office?',a:'Dunder Mifflin'},
    {q:'In Stranger Things, what is the alternate dimension called?',a:'The Upside Down'},
    {q:'Which animated TV family lives at 742 Evergreen Terrace?',a:'The Simpsons'},
    {q:'What is the name of the pub featured in Cheers?',a:'Cheers'},
    {q:'In Seinfeld, what is Kramer’s first name?',a:'Cosmo'},
    {q:'What fictional town is the setting of Parks and Recreation?',a:'Pawnee, Indiana'},
    {q:'Which TV series follows a chemistry teacher named Walter White?',a:'Breaking Bad'},
    {q:'In Scooby-Doo, what is the name of the group’s van?',a:'The Mystery Machine'}
  ],
  books: [
    {q:'Who wrote Pride and Prejudice?',a:'Jane Austen'},
    {q:'Who wrote The Great Gatsby?',a:'F. Scott Fitzgerald'},
    {q:'What is the name of the young wizard at the center of J.K. Rowling’s famous series?',a:'Harry Potter'},
    {q:'Who wrote To Kill a Mockingbird?',a:'Harper Lee'},
    {q:'In Charlotte’s Web, what kind of animal is Wilbur?',a:'A pig'},
    {q:'Who wrote The Hobbit?',a:'J.R.R. Tolkien'},
    {q:'What is the surname of the sisters in Little Women?',a:'March'},
    {q:'Who wrote The Catcher in the Rye?',a:'J.D. Salinger'},
    {q:'What fictional detective lives at 221B Baker Street?',a:'Sherlock Holmes'},
    {q:'Which George Orwell novel features a farm run by animals?',a:'Animal Farm'}
  ],
  animals: [
    {q:'What is the largest living land animal?',a:'African elephant'},
    {q:'What is a group of lions called?',a:'A pride'},
    {q:'What is the only mammal capable of true sustained flight?',a:'Bat'},
    {q:'What animal is known for changing color and having independently moving eyes?',a:'Chameleon'},
    {q:'What is the fastest land animal?',a:'Cheetah'},
    {q:'What type of animal is an axolotl?',a:'Salamander'},
    {q:'Which bird is famous for being unable to fly and living in Antarctica?',a:'Penguin'},
    {q:'What do giant pandas primarily eat?',a:'Bamboo'},
    {q:'What is a baby kangaroo called?',a:'A joey'},
    {q:'Which marine mammal is the largest animal known to have lived?',a:'Blue whale'}
  ],
  technology: [
    {q:'What does CPU stand for?',a:'Central Processing Unit'},
    {q:'What does URL stand for?',a:'Uniform Resource Locator'},
    {q:'What does GPS stand for?',a:'Global Positioning System'},
    {q:'What company created the Windows operating system?',a:'Microsoft'},
    {q:'What does PDF stand for?',a:'Portable Document Format'},
    {q:'In computing, what does RAM stand for?',a:'Random Access Memory'},
    {q:'What symbol is commonly used in email addresses between the username and domain?',a:'@'},
    {q:'What does USB stand for?',a:'Universal Serial Bus'},
    {q:'What programming language shares its name with an Indonesian island?',a:'Java'},
    {q:'What does Wi-Fi allow devices to do without a physical network cable?',a:'Connect to a wireless network'}
  ],
  popculture: [
    {q:'What doll brand introduced a boyfriend named Ken in 1961?',a:'Barbie'},
    {q:'What video game character is a plumber who often rescues Princess Peach?',a:'Mario'},
    {q:'Which superhero is also known as Bruce Wayne?',a:'Batman'},
    {q:'What fictional school does Harry Potter attend?',a:'Hogwarts'},
    {q:'What is the name of Mickey Mouse’s dog?',a:'Pluto'},
    {q:'Which board game features properties such as Boardwalk and Park Place?',a:'Monopoly'},
    {q:'What Pokémon is known for its yellow body and lightning-bolt-shaped tail?',a:'Pikachu'},
    {q:'Which superhero carries a shield decorated with a star?',a:'Captain America'},
    {q:'What color are the Smurfs?',a:'Blue'},
    {q:'What toy puzzle consists of a cube with rotating colored faces?',a:'Rubik’s Cube'}
  ],
  general: [
    {q:'How many sides does a hexagon have?',a:'6'},
    {q:'What is the largest planet in our solar system?',a:'Jupiter'},
    {q:'How many letters are in the English alphabet?',a:'26'},
    {q:'What is the capital of Canada?',a:'Ottawa'},
    {q:'What color do you get when you mix blue and yellow paint?',a:'Green'},
    {q:'How many days are in a leap year?',a:'366'},
    {q:'What is the Roman numeral for 50?',a:'L'},
    {q:'What is the square root of 144?',a:'12'},
    {q:'Which chess piece moves in an L shape?',a:'Knight'},
    {q:'What is the name for a word that reads the same forward and backward?',a:'Palindrome'},
    {q:'How many continents are commonly recognized?',a:'7'},
    {q:'What is the main language spoken in Brazil?',a:'Portuguese'}
  ]
};

const MUSIC_IDEA_BANK = [
  'Take on Me — a-ha','Dancing Queen — ABBA','Sweet Caroline — Neil Diamond','Livin’ on a Prayer — Bon Jovi','I Wanna Dance with Somebody — Whitney Houston',
  'Don’t Stop Believin’ — Journey','September — Earth, Wind & Fire','Man! I Feel Like a Woman! — Shania Twain','Uptown Funk — Mark Ronson ft. Bruno Mars','Since U Been Gone — Kelly Clarkson',
  'Mr. Brightside — The Killers','Everybody (Backstreet’s Back) — Backstreet Boys','No Scrubs — TLC','Friends in Low Places — Garth Brooks','Hey Ya! — Outkast',
  'Complicated — Avril Lavigne','I Want It That Way — Backstreet Boys','Before He Cheats — Carrie Underwood','Crazy in Love — Beyoncé ft. Jay-Z','You Shook Me All Night Long — AC/DC'
];

function helperPoolForCategory(name='') {
  const n=String(name).toLowerCase();
  const matches = [
    ['movies',['movie','movies','film','films','cinema','hollywood','disney']],
    ['sports',['sport','sports','football','baseball','basketball','golf','soccer','tennis','athletic']],
    ['history',['history','historic','president','war','ancient','past']],
    ['science',['science','space','chemistry','physics','biology','medical','medicine','nature']],
    ['food',['food','drink','cooking','kitchen','restaurant','beer','wine','cocktail','dessert']],
    ['geography',['geography','world','country','countries','capital','travel','map','places']],
    ['music',['music','song','songs','band','bands','artist','artists','rock','country music']],
    ['television',['tv','television','sitcom','shows','show']],
    ['books',['book','books','literature','author','authors','novel','novels']],
    ['animals',['animal','animals','wildlife','pets','dog','dogs','cat','cats']],
    ['technology',['technology','tech','computer','computers','internet','digital','software']],
    ['popculture',['pop culture','popculture','superhero','superheroes','games','gaming','toys']]
  ];
  const hit=matches.find(([,words])=>words.some(w=>n.includes(w)));
  return hit?.[0] || 'general';
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `game-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function sanitizeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : fallback;
}
const blankCategory = (i) => ({
  name: `Category ${i + 1}`,
  icon: DEFAULT_ICONS[i],
  color: DEFAULT_COLORS[i],
  type: 'standard',
  description: '',
  timerEnabled: false,
  timerSeconds: 30,
  questions: Array.from({ length: 10 }, () => ({ question: '', answer: '', image: '', youtubeUrl: '', youtubeIn: 0, youtubeOut: 0 }))
});
const blankBonus = () => ({ enabled: true, name: 'Bonus Round', question: '', answer: '' });
const createBlankGame = () => ({
  id: makeId(),
  title: `Trivia Night — ${new Date().toLocaleDateString()}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  theme: 'party',
  announcementSeconds: 8,
  announcements: [],
  halftimeImage: '',
  halftimeName: '',
  categories: Array.from({ length: 7 }, (_, i) => blankCategory(i)),
  bonus: blankBonus()
});

let games = loadGames();
let selectedId = localStorage.getItem(SELECTED_KEY) || games[0]?.id || '';
let activeCategory = 0;
let activeQuestion = 0;
let activeBonus = false;
let currentView = 'dashboard';
let categoryModalOpen = false;
let categoryDraft = null;
let presentationModalOpen = false;
// Prevent returning from the operating-system file picker from re-rendering the editor
// before the selected image's change event has a chance to run.
const MEDIA_INPUT_IDS = new Set(['announcementImagesInput','halftimeImageInput','pictureImageInput']);
let mediaFilePickerOpen = false;
let mediaInputBusy = false;
let pendingFocusSyncTimer = null;
let helperSuggestion = null;
let aiHelperLoading = false;
let aiHelperError = '';
let aiDifficulty = 'medium';
let aiFocus = '';

// Inline YouTube trim editor state (Music Rounds only)
let musicTrimPlayer = null;
let musicTrimApiPromise = null;
let musicTrimUiTimer = null;
let musicTrimStopTimer = null;
let musicTrimDraft = null;
let musicTrimLoadedVideoId = '';
let musicTrimPlayerReady = false;
let musicTrimIsScrubbing = false;

function loadGames() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return parsed.map(normalizeGame);
  } catch { return []; }
}
function normalizeGame(game) {
  game.categories = Array.from({length:7}, (_,ci) => {
    const fallback = blankCategory(ci);
    const source = game.categories?.[ci] || fallback;
    const type = ['standard','music','picture'].includes(source.type) ? source.type : 'standard';
    return {
      name: source.name || `Category ${ci+1}`,
      icon: ICON_LIBRARY.includes(source.icon) ? source.icon : DEFAULT_ICONS[ci],
      color: sanitizeColor(source.color, DEFAULT_COLORS[ci]),
      type,
      description: source.description || '',
      timerEnabled: Boolean(source.timerEnabled),
      timerSeconds: Math.min(300, Math.max(5, Number(source.timerSeconds) || 30)),
      questions: Array.from({length:10}, (_,qi) => ({
        question: source.questions?.[qi]?.question || '',
        answer: source.questions?.[qi]?.answer || '',
        image: source.questions?.[qi]?.image || '',
        youtubeUrl: source.questions?.[qi]?.youtubeUrl || source.questions?.[qi]?.youtube || '',
        youtubeIn: Math.max(0, Number(source.questions?.[qi]?.youtubeIn ?? source.questions?.[qi]?.youtubeStart ?? 0) || 0),
        youtubeOut: Math.max(0, Number(source.questions?.[qi]?.youtubeOut ?? source.questions?.[qi]?.youtubeEnd ?? 0) || 0)
      }))
    };
  });
  const sourceBonus = game.bonus || {};
  game.bonus = {
    enabled: typeof sourceBonus.enabled === 'boolean' ? sourceBonus.enabled : false,
    name: sourceBonus.name || 'Bonus Round',
    question: sourceBonus.question || '',
    answer: sourceBonus.answer || ''
  };
  game.theme = THEME_LIBRARY.some(t=>t.id===game.theme) ? game.theme : 'party';
  game.announcementSeconds = Math.min(60, Math.max(2, Number(game.announcementSeconds) || 8));
  game.announcements = Array.isArray(game.announcements) ? game.announcements.filter(x=>x && x.image).map(x=>({id:x.id||makeId(), image:x.image, name:x.name||'Announcement'})).slice(0,12) : [];
  game.halftimeImage = game.halftimeImage || '';
  game.halftimeName = game.halftimeName || '';
  return game;
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    if (selectedId) localStorage.setItem(SELECTED_KEY, selectedId);
    return true;
  } catch (error) {
    console.error(error);
    const el=document.querySelector('#status');
    if(el) el.textContent='Storage full — remove or replace some uploaded images.';
    return false;
  }
}
function selectedGame() { return games.find(g => g.id === selectedId); }
function esc(str='') { return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function categoryFilled(cat) { return cat.questions.filter(q => cat.type === 'music' ? q.answer.trim() : cat.type === 'picture' ? (q.image && q.answer.trim()) : (q.question.trim() && q.answer.trim())).length; }
function filledCount(game) { return game?.categories.reduce((sum,c) => sum + categoryFilled(c), 0) || 0; }
function formattedDate(value) { try { return new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}); } catch { return ''; } }
function setStatus(text='Saved') {
  const el = document.querySelector('#status');
  if (!el) return;
  el.textContent = `✓ ${text}`;
  clearTimeout(setStatus.t);
  setStatus.t = setTimeout(() => el.textContent = '', 1500);
}
function touch(game, message='Saved') { game.updatedAt = new Date().toISOString(); persist(); setStatus(message); }

// Keep this manager window synchronized with edits made in the separate Host Music Player.
// This prevents an older in-memory copy of the game from overwriting saved YouTube clip marks.
function syncGamesFromStorage({render=false}={}) {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (!Array.isArray(parsed)) return false;
    const currentId = selectedId;
    games = parsed.map(normalizeGame);
    if (currentId && games.some(g=>g.id===currentId)) selectedId=currentId;
    else selectedId = localStorage.getItem(SELECTED_KEY) || games[0]?.id || '';
    if (render) {
      if (currentView==='editor' && selectedGame()) renderEditor();
      else renderDashboard();
    }
    return true;
  } catch (error) {
    console.warn('Could not refresh game data from storage', error);
    return false;
  }
}

function saveActiveMusicTrimDraft(message='Clip marks saved') {
  if (!activeMusicQuestion() || !musicTrimDraft) return false;
  syncMusicTrimDraftFromInputs();
  return commitMusicTrimMarks(message);
}

function setView(view) {
  currentView = view;
  document.querySelector('#dashboardView').hidden = view !== 'dashboard';
  document.querySelector('#editorView').hidden = view !== 'editor';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', view === 'dashboard' && n.dataset.view === 'dashboard'));
  const title = document.querySelector('#pageTitle');
  const subtitle = document.querySelector('#pageSubtitle');
  if (view === 'dashboard') {
    title.textContent = 'My Trivia Games';
    subtitle.textContent = 'Create, manage, and launch your trivia nights.';
  } else {
    title.textContent = 'Game Editor';
    subtitle.textContent = 'Build 7 rounds of 10, including trivia, music, or picture rounds, plus an optional final bonus round.';
  }
}

function renderDashboard() {
  const host = document.querySelector('#dashboardView');
  const totalQuestions = games.reduce((sum,g) => sum + filledCount(g) + (g.bonus?.enabled && g.bonus.question.trim() && g.bonus.answer.trim() ? 1 : 0),0);
  const ready = games.filter(g => filledCount(g) === 70 && (!g.bonus?.enabled || (g.bonus.question.trim() && g.bonus.answer.trim()))).length;
  host.innerHTML = `
    <div class="dashboard-hero">
      <div class="hero-card">
        <div class="hero-accent">🏆</div>
        <div>
          <h2>Everything you need for trivia night.</h2>
          <p>Build seven rounds using standard trivia, YouTube-linked music, or picture rounds; add pre-game announcements, halftime, a theme, and an optional bonus round.</p>
          <button class="ui-btn ui-btn-teal" data-action="new">＋ Build a Game</button>
        </div>
      </div>
      <div class="stat-stack">
        <div class="stat-card"><strong>${games.length}</strong><span>Saved Games</span></div>
        <div class="stat-card"><strong>${ready}</strong><span>Game${ready===1?'':'s'} Ready</span></div>
        <div class="stat-card"><strong>${totalQuestions}</strong><span>Questions / Songs Ready</span></div>
        <div class="stat-card"><strong>70+1</strong><span>7 Rounds + Bonus</span></div>
      </div>
    </div>
    ${games.length ? `<div class="game-grid">${games.map(gameCard).join('')}</div>` : `
      <div class="empty-dashboard">
        <div class="big-icon">🎉</div><h2>Create your first Trivia Night</h2>
        <p>Every game has 7 rounds of 10. Any round can be standard trivia, a YouTube-linked Music Round, or a Picture Round, plus an optional one-question bonus round.</p>
        <button class="ui-btn ui-btn-primary" data-action="new">＋ Create New Game</button>
      </div>`}
  `;
}

function gameCard(g) {
  const filled = filledCount(g);
  const pct = Math.round((filled/70)*100);
  const lead = g.categories[0] || blankCategory(0);
  return `
    <article class="game-card">
      <div class="game-head">
        <div class="game-icon" style="--game-accent:${lead.color}">${lead.icon}</div>
        <div>
          <h3>${esc(g.title)}</h3>
          <div class="game-date">Updated ${formattedDate(g.updatedAt)}</div>
        </div>
      </div>
      <div class="category-chips">${g.categories.map(c => `<span class="cat-chip" style="--chip-color:${c.color}"><b>${c.icon}</b>${esc(c.name)}${c.type==='music'?' ♫':c.type==='picture'?' 🖼️':''}</span>`).join('')}<span class="cat-chip bonus-chip ${g.bonus?.enabled?'bonus-on':'bonus-off'}"><b>⭐</b>Bonus ${g.bonus?.enabled?'On':'Off'}</span></div>
      <div class="game-progress-wrap">
        <div class="game-progress">${filled}/70 questions/songs complete</div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="game-actions">
        <button class="ui-btn ui-btn-small" data-action="edit" data-id="${g.id}">✎ Edit</button>
        <button class="ui-btn ui-btn-small" data-action="duplicate" data-id="${g.id}">▣ Duplicate</button>
        <button class="ui-btn ui-btn-small" data-action="answer-pdf" data-id="${g.id}">PDF Answer Sheets</button>
        <a class="ui-btn ui-btn-small ui-btn-teal" href="play.html?game=${encodeURIComponent(g.id)}" target="_blank">▶ Start Game</a>
      </div>
    </article>`;
}


function resetHelper() {
  helperSuggestion = null;
  aiHelperError = '';
  aiHelperLoading = false;
  aiFocus = '';
}
function usedQuestionTexts(game) {
  return new Set((game?.categories || []).flatMap(c => c.questions || []).map(q => (q.question || '').trim().toLowerCase()).filter(Boolean));
}
function suggestHelper() {
  const game=selectedGame(); if (!game || activeBonus) return;
  const cat=game.categories[activeCategory];
  if (cat.type === 'music') {
    const used=new Set(cat.questions.map(q=>(q.answer||'').trim().toLowerCase()).filter(Boolean));
    const available=MUSIC_IDEA_BANK.filter(x=>!used.has(x.toLowerCase()) && x.toLowerCase() !== (helperSuggestion?.a||'').toLowerCase());
    const pick=(available.length?available:MUSIC_IDEA_BANK)[Math.floor(Math.random()*(available.length?available.length:MUSIC_IDEA_BANK.length))];
    helperSuggestion={kind:'music', q:'', a:pick, pool:'Music Round'};
  } else {
    const poolName=helperPoolForCategory(cat.name);
    const pool=QUESTION_BANK[poolName] || QUESTION_BANK.general;
    const used=usedQuestionTexts(game);
    const available=pool.filter(item=>!used.has(item.q.toLowerCase()) && item.q !== helperSuggestion?.q);
    const choices=available.length?available:pool;
    const pick=choices[Math.floor(Math.random()*choices.length)];
    helperSuggestion={kind:'question', q:pick.q, a:pick.a, pool:poolName === 'general' ? 'General Knowledge' : poolName.charAt(0).toUpperCase()+poolName.slice(1)};
  }
  renderEditor();
}
function useHelperSuggestion() {
  const game=selectedGame(); if (!game || !helperSuggestion || activeBonus) return;
  const cat=game.categories[activeCategory]; const q=cat.questions[activeQuestion];
  if (cat.type === 'music') q.answer=helperSuggestion.a;
  else { q.question=helperSuggestion.q; q.answer=helperSuggestion.a; }
  touch(game, cat.type === 'music' ? 'Song idea added' : 'Question added');
  helperSuggestion=null; renderDashboard(); renderEditor();
}


function renderAIHelper(cat, isMusic) {
  const emptyCount = cat.questions.filter(item => isMusic ? !item.answer.trim() : !(item.question.trim() && item.answer.trim())).length;
  const difficultyOptions = ['easy','medium','hard','mixed'].map(v => `<option value="${v}" ${aiDifficulty===v?'selected':''}>${v.charAt(0).toUpperCase()+v.slice(1)}</option>`).join('');
  const suggestionSource = helperSuggestion?.source === 'ai'
    ? `Gemini · ${esc(helperSuggestion.pool || aiDifficulty)}`
    : (isMusic ? 'Built-in song idea' : `Built-in · ${esc(helperSuggestion?.pool || '')}`);
  return `<div class="trivia-helper ai-trivia-helper" style="--helper-color:${cat.color}">
    <div class="helper-head ai-helper-title"><div><span class="helper-kicker">✨ GEMINI ${isMusic?'MUSIC':'TRIVIA'} HELPER</span><strong>${isMusic?'Build your music round faster':'Create questions for this category'}</strong></div><span class="ai-category-pill">${cat.icon} ${esc(cat.name)}</span></div>
    <div class="ai-helper-controls">
      <label class="ai-control-field"><span>Difficulty</span><select id="aiDifficulty" class="text-input">${difficultyOptions}</select></label>
      <label class="ai-control-field ai-focus-field"><span>Extra direction <small>(optional)</small></span><input id="aiFocus" class="text-input" value="${esc(aiFocus)}" placeholder="${isMusic?'Example: 1990s country, recognizable songs':'Example: 1990s only, no date questions'}"></label>
    </div>
    <div class="ai-helper-buttons">
      <button class="ui-btn ui-btn-small ui-btn-primary" data-action="ai-generate" ${aiHelperLoading?'disabled':''}>${aiHelperLoading?'⏳ Gemini is thinking…':`✨ ${isMusic?'Suggest Song with Gemini':'Generate with Gemini'}`}</button>
      <button class="ui-btn ui-btn-small ui-btn-teal" data-action="ai-fill" ${aiHelperLoading || emptyCount===0?'disabled':''}>${isMusic?'♫':'⚡'} Fill ${emptyCount} Empty</button>
      <button class="ui-btn ui-btn-small" data-action="helper-suggest" ${aiHelperLoading?'disabled':''}>Offline Suggestion</button>
    </div>
    ${aiHelperError ? `<div class="ai-helper-error">${esc(aiHelperError)}</div>` : ''}
    ${helperSuggestion ? `<div class="helper-result"><span class="helper-match">${suggestionSource}</span>${isMusic?'':`<div class="helper-question">${esc(helperSuggestion.q)}</div>`}<div class="helper-answer"><b>${isMusic?'Song idea':'Answer'}:</b> ${esc(helperSuggestion.a)}</div><div class="helper-actions"><button class="ui-btn ui-btn-small ${helperSuggestion.source==='ai'?'ui-btn-primary':''}" data-action="${helperSuggestion.source==='ai'?'ai-generate':'helper-suggest'}">↻ Try Another</button><button class="ui-btn ui-btn-small ui-btn-teal" data-action="helper-use">✓ Use This ${isMusic?'Song':'Question'}</button></div></div>` : `<p class="helper-empty">${isMusic?'Gemini can suggest songs that match this round theme. After choosing a song, paste its YouTube link into the song editor.':'Gemini automatically uses the category name. Add a specific theme above if you want a narrower question.'}</p>`}
    <div class="ai-helper-footnote"><span>Gemini-generated content should be reviewed before game night.</span><span>Offline Suggestion works without an API connection.</span></div>
  </div>`;
}

async function generateAIHelper(fillEmpty=false) {
  const game=selectedGame(); if (!game || activeBonus || aiHelperLoading) return;
  const cat=game.categories[activeCategory];
  const isMusic=cat.type==='music';
  const emptyIndexes=cat.questions.map((item,i)=>({item,i})).filter(({item})=>isMusic ? !item.answer.trim() : !(item.question.trim() && item.answer.trim())).map(x=>x.i);
  if (fillEmpty && !emptyIndexes.length) { setStatus('No empty slots'); return; }
  const count=fillEmpty ? Math.min(10,emptyIndexes.length) : 1;
  aiHelperLoading=true; aiHelperError=''; helperSuggestion=null; renderEditor();
  try {
    const response=await fetch('/api/ai-helper',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        category:cat.name,
        roundType:isMusic?'music':'standard',
        difficulty:aiDifficulty,
        focus:aiFocus.trim(),
        count,
        existing:cat.questions.map(item=>isMusic ? item.answer : `${item.question} | ${item.answer}`).filter(Boolean)
      })
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.error || 'Gemini Helper is unavailable.');
    const items=Array.isArray(data.items)?data.items:[];
    if(!items.length) throw new Error('Gemini did not return a usable suggestion.');
    if(fillEmpty){
      emptyIndexes.slice(0,items.length).forEach((idx,n)=>{
        if(isMusic) cat.questions[idx].answer=items[n].answer || '';
        else cat.questions[idx]={question:items[n].question || '',answer:items[n].answer || ''};
      });
      touch(game,isMusic?`${items.length} song ideas added`:`${items.length} Gemini questions added`);
      renderDashboard();
    } else {
      const item=items[0];
      helperSuggestion={kind:isMusic?'music':'question',q:isMusic?'':(item.question||''),a:item.answer||'',pool:`${aiDifficulty.charAt(0).toUpperCase()+aiDifficulty.slice(1)} · Gemini`,source:'ai'};
    }
  } catch(err) {
    const localHint = location.protocol === 'file:' ? ' Host the site to enable AI; Offline Suggestion still works now.' : '';
    aiHelperError=(err?.message || 'Gemini Helper could not connect.') + localHint;
  } finally {
    aiHelperLoading=false; renderEditor();
  }
}

function parseTimecode(value='') {
  const raw=String(value??'').trim(); if(!raw) return 0;
  if(/^\d+(?:\.\d+)?$/.test(raw)) return Math.max(0,Number(raw)||0);
  const parts=raw.split(':').map(x=>Number(x));
  if(parts.some(x=>!Number.isFinite(x)||x<0)) return 0;
  if(parts.length===2) return Math.max(0,parts[0]*60+parts[1]);
  if(parts.length===3) return Math.max(0,parts[0]*3600+parts[1]*60+parts[2]);
  return 0;
}
function formatTimecode(seconds=0) {
  const total=Math.max(0,Math.round(Number(seconds)||0));
  const h=Math.floor(total/3600), m=Math.floor((total%3600)/60), sec=total%60;
  return h ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
}
function formatTimecodePrecise(seconds=0) {
  const n=Math.max(0,Number(seconds)||0), whole=Math.floor(n), tenths=Math.floor((n-whole)*10+1e-6);
  const h=Math.floor(whole/3600), m=Math.floor((whole%3600)/60), sec=whole%60;
  const base=h ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
  return `${base}.${tenths}`;
}
function youtubeVideoId(input='') {
  const raw=String(input||'').trim(); if(!raw) return '';
  if(/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const u=new URL(raw), host=u.hostname.replace(/^www\./,'').toLowerCase();
    if(host==='youtu.be') return (u.pathname.split('/').filter(Boolean)[0]||'').slice(0,11);
    if(host.endsWith('youtube.com')) {
      const v=u.searchParams.get('v'); if(v) return v.slice(0,11);
      const parts=u.pathname.split('/').filter(Boolean);
      if(['embed','shorts','live'].includes(parts[0])) return (parts[1]||'').slice(0,11);
    }
  } catch {}
  return '';
}
function loadYouTubeTrimApi() {
  if(window.YT?.Player) return Promise.resolve(window.YT);
  if(musicTrimApiPromise) return musicTrimApiPromise;
  musicTrimApiPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-trivia-youtube-api]');
    const previous=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{
      try { if(typeof previous==='function') previous(); } catch {}
      if(window.YT?.Player) resolve(window.YT); else reject(new Error('YouTube player API did not initialize.'));
    };
    if(!existing){
      const script=document.createElement('script');
      script.src='https://www.youtube.com/iframe_api';
      script.async=true; script.dataset.triviaYoutubeApi='1';
      script.onerror=()=>reject(new Error('Could not load the YouTube player. Check your internet connection.'));
      document.head.appendChild(script);
    }
    setTimeout(()=>{ if(window.YT?.Player) resolve(window.YT); },500);
  });
  return musicTrimApiPromise;
}
function activeMusicQuestion() {
  const game=selectedGame();
  if(!game || activeBonus) return null;
  const cat=game.categories?.[activeCategory];
  if(!cat || cat.type!=='music') return null;
  return cat.questions?.[activeQuestion] || null;
}
function destroyMusicTrimEditor() {
  if(musicTrimUiTimer){clearInterval(musicTrimUiTimer);musicTrimUiTimer=null;}
  if(musicTrimStopTimer){clearInterval(musicTrimStopTimer);musicTrimStopTimer=null;}
  try { musicTrimPlayer?.destroy?.(); } catch {}
  musicTrimPlayer=null; musicTrimLoadedVideoId=''; musicTrimPlayerReady=false; musicTrimIsScrubbing=false; musicTrimDraft=null;
}
function trimDraftIn(){return Math.max(0,Number(musicTrimDraft?.in)||0);}
function trimDraftOut(){const start=trimDraftIn(),out=Math.max(0,Number(musicTrimDraft?.out)||0);return out>start?out:0;}
function musicTrimCurrentTime(){try{return Math.max(0,Number(musicTrimPlayer?.getCurrentTime?.()||0));}catch{return 0;}}
function musicTrimDuration(){try{return Math.max(0,Number(musicTrimPlayer?.getDuration?.()||0));}catch{return 0;}}
function setMusicTrimMessage(text='', kind='') {
  const el=document.querySelector('#musicTrimSaveStatus'); if(!el)return;
  el.textContent=text; el.dataset.kind=kind;
}
function updateMusicTrimSummary(saved=false) {
  if(!musicTrimDraft)return;
  const start=trimDraftIn(),out=trimDraftOut();
  const inInput=document.querySelector('#musicTrimInInput'), outInput=document.querySelector('#musicTrimOutInput');
  if(inInput && document.activeElement!==inInput) inInput.value=formatTimecodePrecise(start);
  if(outInput && document.activeElement!==outInput) outInput.value=out?formatTimecodePrecise(out):'';
  const inEl=document.querySelector('#musicTrimInValue'), outEl=document.querySelector('#musicTrimOutValue'), lenEl=document.querySelector('#musicTrimLengthValue');
  if(inEl)inEl.textContent=formatTimecodePrecise(start);
  if(outEl)outEl.textContent=out?formatTimecodePrecise(out):'Not set';
  if(lenEl)lenEl.textContent=out?formatTimecodePrecise(out-start):'Manual stop';
  if(saved)setMusicTrimMessage(`Saved: ${formatTimecodePrecise(start)} → ${out?formatTimecodePrecise(out):'manual stop'}`,'saved');
}
function updateMusicTrimTimeline(force=false) {
  if(!musicTrimPlayerReady||!musicTrimPlayer)return;
  const now=musicTrimCurrentTime(),dur=musicTrimDuration();
  const nowEl=document.querySelector('#musicTrimCurrent'),durEl=document.querySelector('#musicTrimDuration'),scrub=document.querySelector('#musicTrimScrubber');
  if(nowEl)nowEl.textContent=formatTimecodePrecise(now);
  if(durEl)durEl.textContent=dur?formatTimecode(dur):'—';
  if(scrub&&dur>0){scrub.max=String(dur);if(!musicTrimIsScrubbing||force)scrub.value=String(Math.min(now,dur));}
}
function startMusicTrimStopMonitor() {
  if(musicTrimStopTimer)clearInterval(musicTrimStopTimer);
  musicTrimStopTimer=setInterval(()=>{
    const out=trimDraftOut(); if(!out||!musicTrimPlayer)return;
    const now=musicTrimCurrentTime();
    if(now>=out-.06){
      try{musicTrimPlayer.pauseVideo();musicTrimPlayer.seekTo(out,true);}catch{}
      clearInterval(musicTrimStopTimer);musicTrimStopTimer=null;updateMusicTrimTimeline(true);
      setMusicTrimMessage(`Clip stopped at OUT ${formatTimecodePrecise(out)}.`,'saved');
    }
  },80);
}
function commitMusicTrimMarks(message='Clip marks saved') {
  const q=activeMusicQuestion(); if(!q||!musicTrimDraft)return false;
  const start=trimDraftIn(),out=trimDraftOut();
  q.youtubeIn=Math.round(start*10)/10;
  q.youtubeOut=out?Math.round(out*10)/10:0;
  const game=selectedGame(); if(game)touch(game,message);
  updateMusicTrimSummary(true);
  return true;
}
function syncMusicTrimDraftFromInputs() {
  if(!musicTrimDraft)return;
  const start=parseTimecode(document.querySelector('#musicTrimInInput')?.value||'0');
  const rawOut=String(document.querySelector('#musicTrimOutInput')?.value||'').trim();
  const out=rawOut?parseTimecode(rawOut):0;
  musicTrimDraft.in=Math.max(0,start);
  musicTrimDraft.out=out>musicTrimDraft.in?out:0;
  updateMusicTrimSummary(false);
}
async function initMusicTrimEditor() {
  const q=activeMusicQuestion(); if(!q)return;
  musicTrimDraft={in:Math.max(0,Number(q.youtubeIn)||0),out:Math.max(0,Number(q.youtubeOut)||0)};
  updateMusicTrimSummary(false);
  const id=youtubeVideoId(q.youtubeUrl);
  const shell=document.querySelector('#musicTrimVideoShell');
  if(!shell)return;
  if(!id){shell.innerHTML='<div class="music-trim-placeholder"><strong>Paste a YouTube link above</strong><span>Then click Load / Reload Video to open the trim editor.</span></div>';setMusicTrimMessage('No YouTube video loaded.','');return;}
  shell.innerHTML='<div id="musicTrimPlayer"></div>';
  setMusicTrimMessage('Loading YouTube trim editor…','');
  try{
    await loadYouTubeTrimApi();
    if(!document.querySelector('#musicTrimPlayer')||activeMusicQuestion()!==q)return;
    musicTrimPlayer=new YT.Player('musicTrimPlayer',{
      width:'100%',height:'100%',videoId:id,
      playerVars:{controls:1,playsinline:1,rel:0,origin:location.origin},
      events:{
        onReady:()=>{
          musicTrimPlayerReady=true;musicTrimLoadedVideoId=id;
          const cue={videoId:id,startSeconds:trimDraftIn()};if(trimDraftOut())cue.endSeconds=trimDraftOut();
          try{musicTrimPlayer.cueVideoById(cue);}catch{}
          musicTrimUiTimer=setInterval(()=>updateMusicTrimTimeline(false),100);
          updateMusicTrimTimeline(true);setMusicTrimMessage('Ready. Scrub the video, then set your IN and OUT marks.','');
        },
        onStateChange:e=>{
          if(window.YT&&e.data===YT.PlayerState.PLAYING)startMusicTrimStopMonitor();
          else if(musicTrimStopTimer){clearInterval(musicTrimStopTimer);musicTrimStopTimer=null;}
        },
        onError:e=>setMusicTrimMessage(`YouTube could not load this video (error ${e.data}). Try another upload.`,'error')
      }
    });
  }catch(error){shell.innerHTML='<div class="music-trim-placeholder"><strong>YouTube player could not load</strong><span>Check the link and your internet connection.</span></div>';setMusicTrimMessage(error.message||'YouTube player failed to load.','error');}
}
function reloadMusicTrimVideo() {
  const q=activeMusicQuestion(); if(!q)return;
  q.youtubeUrl=(document.querySelector('#youtubeUrlInput')?.value||'').trim();
  touch(selectedGame(),'YouTube link saved');
  if(musicTrimUiTimer){clearInterval(musicTrimUiTimer);musicTrimUiTimer=null;}
  if(musicTrimStopTimer){clearInterval(musicTrimStopTimer);musicTrimStopTimer=null;}
  try{musicTrimPlayer?.destroy?.();}catch{}
  musicTrimPlayer=null;musicTrimPlayerReady=false;musicTrimLoadedVideoId='';
  initMusicTrimEditor();
}
function setMusicTrimInHere() {
  if(!musicTrimPlayerReady)return setMusicTrimMessage('Load the YouTube video first.','error');
  const t=Math.round(musicTrimCurrentTime()*10)/10;
  musicTrimDraft.in=t;if(trimDraftOut()&&trimDraftOut()<=t+.1)musicTrimDraft.out=0;
  updateMusicTrimSummary(false);commitMusicTrimMarks('IN mark saved');
}
function setMusicTrimOutHere() {
  if(!musicTrimPlayerReady)return setMusicTrimMessage('Load the YouTube video first.','error');
  const t=Math.round(musicTrimCurrentTime()*10)/10,start=trimDraftIn();
  if(t<=start+.2)return setMusicTrimMessage(`Move past the IN mark (${formatTimecodePrecise(start)}) before setting OUT.`,'error');
  musicTrimDraft.out=t;updateMusicTrimSummary(false);commitMusicTrimMarks('OUT mark saved');
}
function playMusicTrimClip() {
  if(!musicTrimPlayerReady)return;
  const start=trimDraftIn(),out=trimDraftOut(),now=musicTrimCurrentTime();
  try{if(now<start-.25||(out&&now>=out-.08))musicTrimPlayer.seekTo(start,true);musicTrimPlayer.playVideo();}catch{}
}
function goMusicTrimTo(t){if(!musicTrimPlayerReady)return;try{musicTrimPlayer.seekTo(Math.max(0,Number(t)||0),true);updateMusicTrimTimeline(true);}catch{}}

function roundTypeLabel(cat){ return cat.type==='music'?'Music Round':cat.type==='picture'?'Picture Round':'Trivia Round'; }
function defaultRoundDescription(cat){
  if(cat.type==='music') return '♫ Music Round · 10 songs';
  if(cat.type==='picture') return '🖼️ Picture Round · 10 images';
  return 'Get ready for 10 questions!';
}
function compressImageFile(file, maxW=1280, maxH=900, quality=.8){
  return new Promise((resolve,reject)=>{
    if(!file) return reject(new Error('Please choose an image file.'));
    const type=String(file.type||'').toLowerCase();
    const name=String(file.name||'').toLowerCase();
    const supported=['image/jpeg','image/png','image/webp'].includes(type) || /\.(jpe?g|png|webp)$/i.test(name);
    if(!supported) return reject(new Error('Supported picture files are JPG, JPEG, PNG, and WEBP. HEIC/HEIF files need to be converted to JPG first.'));
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('Could not read that image.'));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error('Could not open that image. Try JPG, JPEG, PNG, or WEBP.'));
      img.onload=()=>{
        const scale=Math.min(1,maxW/img.width,maxH/img.height);
        const w=Math.max(1,Math.round(img.width*scale)), h=Math.max(1,Math.round(img.height*scale));
        const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
        const ctx=canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h); ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderEditor() {
  destroyMusicTrimEditor();
  const game = selectedGame();
  const host = document.querySelector('#editorView');
  if (!game) { setView('dashboard'); renderDashboard(); return; }
  const cat = game.categories[activeCategory];
  const q = cat.questions[activeQuestion];
  const isMusic = cat.type === 'music';
  const isPicture = cat.type === 'picture';
  const bonus = game.bonus || blankBonus();
  const activeIcon = activeBonus ? '⭐' : cat.icon;
  const activeColor = activeBonus ? '#f2a31c' : cat.color;
  const themeName=THEME_LIBRARY.find(t=>t.id===game.theme)?.name || 'Bright Party';

  const tabs = `${game.categories.map((c,i)=>`<button class="category-tab ${!activeBonus && i===activeCategory?'active':''}" style="--tab-color:${c.color}" data-action="category" data-index="${i}"><span class="tab-icon">${c.icon}</span><span>${esc(c.name)}${c.type==='music'?' ♫':c.type==='picture'?' 🖼️':''}</span><span class="tab-count">${categoryFilled(c)}/10</span></button>`).join('')}
    <button class="category-tab bonus-tab ${activeBonus?'active':''} ${bonus.enabled?'bonus-enabled':'bonus-disabled'}" style="--tab-color:#f2a31c" data-action="bonus"><span class="tab-icon">⭐</span><span>${esc(bonus.name || 'Bonus Round')}</span><span class="tab-count">${bonus.enabled ? (bonus.question.trim() && bonus.answer.trim() ? 'Ready' : 'On') : 'Off'}</span></button>`;

  const mainContent = activeBonus ? `
    <aside class="question-list-card bonus-side-card">
      <div class="panel-title">FINAL ROUND</div>
      <div class="category-summary bonus-summary" style="--category-color:#f2a31c">
        <div class="category-summary-icon">⭐</div>
        <div class="category-summary-copy"><strong>${esc(bonus.name || 'Bonus Round')}</strong><span>1 question after Category 7</span></div>
      </div>
      <label class="bonus-toggle-row">
        <span><strong>Include Bonus Round</strong><small>Show it at the end of the game</small></span>
        <input id="bonusEnabled" type="checkbox" ${bonus.enabled?'checked':''}>
        <i class="toggle-switch" aria-hidden="true"></i>
      </label>
      <div class="bonus-flow-note"><b>Game flow</b><span>7 categories → ${esc(bonus.name || 'Bonus Round')} → answer reveal → Trivia Complete</span></div>
    </aside>

    <section class="editor-card bonus-editor-card">
      <div class="panel-title">EDIT BONUS ROUND</div>
      <h2>⭐ ${esc(bonus.name || 'Bonus Round')}</h2>
      <p class="bonus-editor-help">This is one extra question after all 70 regular questions. Give the round any category name you want.</p>
      <div class="form-field"><label>Bonus Category Name</label><input id="bonusNameInput" class="text-input" maxlength="42" value="${esc(bonus.name || 'Bonus Round')}" placeholder="Example: Final Wager"></div>
      <div class="form-field"><label>Bonus Question</label><textarea id="bonusQuestionInput" class="text-area bonus-question-area" placeholder="Type the final bonus question...">${esc(bonus.question)}</textarea></div>
      <div class="form-field"><label>Bonus Answer</label><input id="bonusAnswerInput" class="text-input" value="${esc(bonus.answer)}" placeholder="Enter the bonus answer"></div>
      <div class="edit-footer"><button class="ui-btn ui-btn-coral" data-action="clear-bonus">Clear Bonus</button><button class="ui-btn ui-btn-teal" data-action="save">✓ Save Bonus</button></div>
    </section>

    <aside class="preview-column">
      <div class="preview-card bonus-preview-card">
        <div class="panel-title">BONUS PRESENTER PREVIEW</div>
        <div class="mini-presenter bonus-mini-presenter">
          <div class="mini-ribbon bonus-mini-ribbon">⭐ ${esc(bonus.name || 'Bonus Round').toUpperCase()}</div>
          <div class="mini-progress">FINAL QUESTION</div>
          <div class="mini-question">${esc(bonus.question || 'Your bonus question will appear here.')}</div>
        </div>
        <div class="category-intro-preview bonus-intro-preview" style="--category-color:#f2a31c"><span>After Category 7:</span><strong>⭐ ${esc(bonus.name || 'Bonus Round')}</strong><small>One question + answer reveal</small></div>
        <a class="ui-btn ui-btn-primary preview-launch" href="play.html?game=${encodeURIComponent(game.id)}" target="_blank">⛶ Preview Full Screen</a>
      </div>
      <button class="ui-btn ui-btn-coral" data-action="delete">Delete This Game</button>
    </aside>` : `
    <aside class="question-list-card">
      <div class="panel-title">CATEGORY ${activeCategory+1} OF 7</div>
      <div class="category-summary" style="--category-color:${cat.color}">
        <div class="category-summary-icon">${cat.icon}</div>
        <div class="category-summary-copy"><strong>${esc(cat.name)}${isMusic?' ♫':isPicture?' 🖼️':''}</strong><span>${categoryFilled(cat)}/10 ${isMusic?'songs':isPicture?'pictures':'questions'} ready</span></div>
      </div>
      <button class="ui-btn category-edit-btn" data-action="edit-category">✦ Edit Category Settings</button>
      <div class="panel-title question-panel-title">${isMusic?'SONGS':isPicture?'PICTURES':'QUESTIONS'}</div>
      <div class="question-list">
        ${cat.questions.map((item,i)=>`<button class="question-row ${i===activeQuestion?'active':''}" data-action="question" data-index="${i}"><span class="q-number">${i+1}</span><span class="q-label ${(isMusic?item.answer:isPicture?item.image:item.question)?'':'q-empty'}">${isMusic ? (item.answer ? esc(item.answer) : `Song ${i+1} — answer not entered`) : isPicture ? (item.image ? `Picture ${i+1}${item.answer?` — ${esc(item.answer)}`:''}` : `Picture ${i+1} — image not added`) : esc(item.question || 'Empty question')}</span></button>`).join('')}
      </div>
    </aside>

    <section class="editor-card ${isMusic?'music-external-editor':isPicture?'picture-editor':''}">
      <div class="panel-title">EDIT ${isMusic?'SONG':isPicture?'PICTURE':'QUESTION'} ${activeQuestion+1}</div>
      <h2>${cat.icon} ${esc(cat.name)} · ${isMusic?'Song':isPicture?'Picture':'Question'} ${activeQuestion+1}</h2>
      ${(!isPicture ? renderAIHelper(cat,isMusic) : '')}
      ${isMusic ? `
        <div class="external-music-callout"><div class="external-music-icon">✂</div><div><strong>YouTube Clip Editor</strong><span>Paste the YouTube link, trim the exact portion you want to use, and save the IN/OUT marks directly to this song.</span></div></div>
        <div class="form-field"><label>YouTube Link for Song ${activeQuestion+1}</label><div class="music-link-row"><input id="youtubeUrlInput" class="text-input" value="${esc(q.youtubeUrl || '')}" placeholder="https://www.youtube.com/watch?v=..."><button class="ui-btn" data-action="music-trim-load">Load / Reload Video</button></div></div>

        <section class="music-trim-editor" aria-label="YouTube clip editor">
          <div class="music-trim-head"><div><span class="panel-title">TRIM SONG ${activeQuestion+1}</span><strong>Choose exactly what the players will hear</strong></div><span class="music-trim-saved-pill">Saved with this game</span></div>
          <div id="musicTrimVideoShell" class="music-trim-video-shell"><div class="music-trim-placeholder"><strong>Loading trim editor…</strong></div></div>
          <div class="music-trim-timeline">
            <div class="music-trim-clock"><strong id="musicTrimCurrent">0:00.0</strong><span>/</span><span id="musicTrimDuration">—</span></div>
            <input id="musicTrimScrubber" class="music-trim-scrubber" type="range" min="0" max="1" step="0.1" value="0" aria-label="Video timeline">
          </div>
          <div class="music-trim-mark-grid">
            <label><span>IN</span><input id="musicTrimInInput" class="text-input" value="${esc(formatTimecodePrecise(q.youtubeIn || 0))}" placeholder="0:30.0"></label>
            <label><span>OUT</span><input id="musicTrimOutInput" class="text-input" value="${q.youtubeOut ? esc(formatTimecodePrecise(q.youtubeOut)) : ''}" placeholder="0:50.0"></label>
            <div class="music-trim-readout"><span>Saved clip</span><strong><b id="musicTrimInValue">${esc(formatTimecodePrecise(q.youtubeIn || 0))}</b> → <b id="musicTrimOutValue">${q.youtubeOut ? esc(formatTimecodePrecise(q.youtubeOut)) : 'Not set'}</b></strong><small>Length: <b id="musicTrimLengthValue">${q.youtubeOut > q.youtubeIn ? esc(formatTimecodePrecise(q.youtubeOut-q.youtubeIn)) : 'Manual stop'}</b></small></div>
          </div>
          <div class="music-trim-actions">
            <button class="ui-btn" data-action="music-trim-play">▶ Play Clip</button>
            <button class="ui-btn" data-action="music-trim-pause">Ⅱ Pause</button>
            <button class="ui-btn ui-btn-primary" data-action="music-trim-set-in">① Set IN Here</button>
            <button class="ui-btn ui-btn-primary" data-action="music-trim-set-out">② Set OUT Here</button>
            <button class="ui-btn" data-action="music-trim-go-in">Go to IN</button>
            <button class="ui-btn" data-action="music-trim-go-out">Go to OUT</button>
            <button class="ui-btn" data-action="music-trim-clear-out">Clear OUT</button>
            <button class="ui-btn ui-btn-teal" data-action="music-trim-save">✓ Save Clip Marks</button>
          </div>
          <div id="musicTrimSaveStatus" class="music-trim-save-status">The IN and OUT marks are stored with Song ${activeQuestion+1} and are included in your .trivia export.</div>
        </section>

        <div class="form-field"><label>Answer for Song ${activeQuestion+1}</label><input id="answerInput" class="text-input" value="${esc(q.answer)}" placeholder="Example: Take on Me — a-ha"></div>
        <div class="music-host-actions"><a class="ui-btn ui-btn-primary" href="music-player.html?game=${encodeURIComponent(game.id)}" target="_blank">♫ Open Host Music Player</a></div>
        <p class="music-editor-help"><strong>The video is visible here only while you build the round.</strong> During the actual game, use the Host Music Player on your laptop and keep the projector on the Presenter window. The audience still sees only <strong>QUESTION ${activeQuestion+1}</strong>.</p>
      ` : isPicture ? `
        <div class="picture-round-callout"><div>🖼️</div><div><strong>Picture Round</strong><span>Upload the image the audience should identify. The answer stays hidden until the answer slide.</span></div></div>
        <div class="form-field"><label>Picture ${activeQuestion+1}</label><input id="pictureImageInput" class="text-input file-input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"><p class="picker-help">Supported: JPG, JPEG, PNG, WEBP. HEIC/HEIF must be converted to JPG first.</p></div>
        ${q.image ? `<div class="picture-editor-preview"><img src="${q.image}" alt="Picture ${activeQuestion+1} preview"><button class="ui-btn ui-btn-small ui-btn-coral" data-action="remove-picture">Remove Image</button></div>` : `<div class="picture-empty-preview">No image uploaded yet.</div>`}
        <div class="form-field"><label>Optional Picture Prompt</label><textarea id="questionInput" class="text-area picture-prompt" placeholder="Optional: Name this landmark, Who is this?, Identify this logo...">${esc(q.question)}</textarea></div>
        <div class="form-field"><label>Answer</label><input id="answerInput" class="text-input" value="${esc(q.answer)}" placeholder="Enter the correct answer"></div>
      ` : `
        <div class="form-field"><label>Question</label><textarea id="questionInput" class="text-area" placeholder="Type the question the room will see...">${esc(q.question)}</textarea></div>
        <div class="form-field"><label>Answer</label><input id="answerInput" class="text-input" value="${esc(q.answer)}" placeholder="Enter the correct answer"></div>
      `}
      ${cat.timerEnabled ? `<div class="timer-editor-note">⏱ Auto-advance is ON for this round: <strong>${cat.timerSeconds} seconds</strong> per question.</div>` : ''}
      <div class="edit-footer"><button class="ui-btn ui-btn-coral" data-action="clear-question">Clear ${isMusic?'Song':isPicture?'Picture':'Question'}</button><button class="ui-btn ui-btn-teal" data-action="save">✓ Save ${isMusic?'Song':isPicture?'Picture':'Question'}</button></div>
    </section>

    <aside class="preview-column">
      <div class="preview-card">
        <div class="panel-title">LIVE PRESENTER PREVIEW</div>
        <div class="mini-presenter ${isMusic?'music-external-preview':isPicture?'picture-mini-presenter':''}">
          <div class="mini-ribbon" style="background:${cat.color}">${cat.icon} ${esc(cat.name).toUpperCase()}</div>
          <div class="mini-progress">${isPicture?'PICTURE':'QUESTION'} ${activeQuestion+1} OF 10</div>
          ${isPicture ? (q.image ? `<img class="mini-picture" src="${q.image}" alt="Picture preview">` : `<div class="mini-question">PICTURE ${activeQuestion+1}</div>`) : `<div class="mini-question ${isMusic?'music-preview-number':''}">${isMusic ? `QUESTION ${activeQuestion+1}` : esc(q.question || 'Your question will appear here.')}</div>`}
        </div>
        <div class="category-intro-preview" style="--category-color:${cat.color}">
          <span>Before ${isPicture?'Picture':'Question'} 1:</span><strong>${cat.icon} ${esc(cat.name)}${isMusic?' ♫':isPicture?' 🖼️':''}</strong><small>${esc(cat.description || defaultRoundDescription(cat))}</small>
        </div>
        <a class="ui-btn ui-btn-primary preview-launch" href="play.html?game=${encodeURIComponent(game.id)}" target="_blank">⛶ Preview Full Screen</a>
      </div>
      <button class="ui-btn ui-btn-coral" data-action="delete">Delete This Game</button>
    </aside>`;

  host.innerHTML = `
    <div class="editor-header-card">
      <div class="editor-heading-row">
        <div class="game-title-wrap">
          <div class="editor-game-icon" style="--category-color:${activeColor}">${activeIcon}</div>
          <input id="gameTitle" class="game-title-input" value="${esc(game.title)}" aria-label="Game title">
          <span class="theme-chip">🎨 ${esc(themeName)}</span>
        </div>
        <div class="editor-toolbar">
          <button class="ui-btn" data-action="presentation-settings">🎨 Presentation Setup</button>
          <button class="ui-btn ui-btn-teal" data-action="save">✓ Save Game</button>
          <button class="ui-btn" data-action="duplicate" data-id="${game.id}">▣ Duplicate</button>
          <label class="ui-btn" for="importFile">⇧ Import Game</label>
          <button class="ui-btn" data-action="export">⇩ Export .trivia</button>
          <button class="ui-btn" data-action="answer-pdf">PDF Answer Sheets</button>
          <a class="ui-btn" href="music-player.html?game=${encodeURIComponent(game.id)}" target="_blank">♫ Host Music Player</a>
          <a class="ui-btn ui-btn-primary" href="play.html?game=${encodeURIComponent(game.id)}" target="_blank">▶ Start Presenter</a>
        </div>
      </div>
      <div class="category-tabs">${tabs}</div>
    </div>
    <div class="editor-layout">${mainContent}</div>
    <div id="categoryModalHost"></div>
    <div id="presentationModalHost"></div>`;
  renderCategoryModal();
  renderPresentationModal();
  if (isMusic && !activeBonus) setTimeout(initMusicTrimEditor, 0);
}
function openCategoryModal() {
  const game = selectedGame(); if (!game) return;
  const cat = game.categories[activeCategory];
  categoryDraft = { name: cat.name, icon: cat.icon, color: cat.color, type: cat.type || 'standard', description:cat.description||'', timerEnabled:Boolean(cat.timerEnabled), timerSeconds:cat.timerSeconds||30 };
  categoryModalOpen = true;
  renderCategoryModal();
}
function closeCategoryModal() {
  categoryModalOpen = false;
  categoryDraft = null;
  renderCategoryModal();
}
function renderCategoryModal() {
  const host = document.querySelector('#categoryModalHost');
  if (!host) return;
  if (!categoryModalOpen || !categoryDraft) { host.innerHTML=''; return; }
  const typeLabel=categoryDraft.type==='music'?'Music round intro':categoryDraft.type==='picture'?'Picture round intro':'Presenter intro preview';
  host.innerHTML = `
    <div class="modal-backdrop" data-category-backdrop>
      <section class="category-modal" role="dialog" aria-modal="true" aria-label="Edit category">
        <div class="modal-header"><div><div class="panel-title">CATEGORY ${activeCategory+1} OF 7</div><h2>Edit Category</h2></div><button class="modal-close" data-action="category-cancel" aria-label="Close">×</button></div>
        <div class="form-field"><label>Category Name</label><input id="categoryDraftName" class="text-input" maxlength="42" value="${esc(categoryDraft.name)}" placeholder="Category name"></div>
        <div class="form-field"><label>Round Description / Note <span class="optional-label">(shown on intro slide)</span></label><input id="categoryDraftDescription" class="text-input" maxlength="110" value="${esc(categoryDraft.description)}" placeholder="Example: Song / Artist, Name the logo, Multiple choice..."></div>
        <div class="form-field"><label>Round Type</label><select id="categoryDraftType" class="text-input"><option value="standard" ${categoryDraft.type==='standard'?'selected':''}>Standard Trivia</option><option value="music" ${categoryDraft.type==='music'?'selected':''}>♫ Music Round — YouTube Host Player</option><option value="picture" ${categoryDraft.type==='picture'?'selected':''}>🖼️ Picture Round</option></select></div>
        <div class="music-modal-note" ${categoryDraft.type==='music'?'':'hidden'}>▶ Add one YouTube link per song. The video plays in the separate Host Music Player window while the projector displays only QUESTION 1–10 and the answers.</div>
        <div class="music-modal-note picture-modal-note" ${categoryDraft.type==='picture'?'':'hidden'}>🖼️ Upload one image for each of the 10 picture questions. The image appears on the projector; the answer stays hidden.</div>
        <div class="timer-setting-row"><label class="timer-toggle"><input id="categoryDraftTimerEnabled" type="checkbox" ${categoryDraft.timerEnabled?'checked':''}><span><strong>Question Timer + Auto Advance</strong><small>Automatically move to the next question when time expires. Pass Your Papers always stays manual.</small></span></label><label class="timer-seconds">Seconds<input id="categoryDraftTimerSeconds" class="text-input" type="number" min="5" max="300" step="5" value="${categoryDraft.timerSeconds||30}" ${categoryDraft.timerEnabled?'':'disabled'}></label></div>
        <div class="form-field"><label>Category Color</label><div class="color-picker">${COLOR_LIBRARY.map(color => `<button class="color-swatch ${color.toLowerCase()===categoryDraft.color.toLowerCase()?'selected':''}" style="--swatch:${color}" data-action="pick-color" data-color="${color}" title="${color}" aria-label="Choose color ${color}"></button>`).join('')}</div></div>
        <div class="form-field"><label>Choose an Icon</label><p class="picker-help">More than 100 icons are available. Pick one that matches the round.</p><div class="icon-picker">${ICON_LIBRARY.map(icon => `<button class="icon-choice ${icon===categoryDraft.icon?'selected':''}" data-action="pick-icon" data-icon="${icon}" aria-label="Choose ${icon}"><span>${icon}</span></button>`).join('')}</div></div>
        <div class="modal-preview" style="--category-color:${categoryDraft.color}"><div class="modal-preview-icon">${categoryDraft.icon}</div><div><span>${typeLabel}</span><strong>${esc(categoryDraft.name || `Category ${activeCategory+1}`)}${categoryDraft.type==='music'?' ♫':categoryDraft.type==='picture'?' 🖼️':''}</strong><small>${esc(categoryDraft.description || '')}</small></div></div>
        <div class="modal-actions"><button class="ui-btn" data-action="category-cancel">Cancel</button><button class="ui-btn ui-btn-teal" data-action="category-save">✓ Save Category</button></div>
      </section>
    </div>`;
}
function openPresentationModal(){ presentationModalOpen=true; renderPresentationModal(); }
function closePresentationModal(){ presentationModalOpen=false; renderPresentationModal(); }
function renderPresentationModal(){
  const host=document.querySelector('#presentationModalHost'); if(!host) return;
  const game=selectedGame();
  if(!presentationModalOpen || !game){ host.innerHTML=''; return; }
  host.innerHTML=`<div class="modal-backdrop" data-presentation-backdrop>
    <section class="category-modal presentation-modal" role="dialog" aria-modal="true" aria-label="Presentation setup">
      <div class="modal-header"><div><div class="panel-title">PRESENTATION SETUP</div><h2>Theme, Pre-Game & Halftime</h2></div><button class="modal-close" data-action="presentation-close" aria-label="Close">×</button></div>
      <div class="form-field"><label>Presenter Theme / Background</label><div class="theme-picker">${THEME_LIBRARY.map(t=>`<button class="theme-choice theme-${t.id} ${game.theme===t.id?'selected':''}" data-action="theme-select" data-theme="${t.id}"><span class="theme-preview"></span><strong>${t.name}</strong><small>${t.desc}</small></button>`).join('')}</div></div>
      <div class="presentation-section"><div><h3>Pre-Game Announcement Loop</h3><p>Upload announcement/rules images. They loop continuously until you manually start Category 1.</p></div><label class="ui-btn ui-btn-primary file-button">＋ Add Images<input id="announcementImagesInput" type="file" accept="image/*" multiple hidden></label></div>
      <div class="announcement-options"><label>Seconds per slide<input id="announcementSecondsInput" class="text-input" type="number" min="2" max="60" value="${game.announcementSeconds||8}"></label><span>${game.announcements.length}/12 slides</span></div>
      <div class="announcement-grid">${game.announcements.length?game.announcements.map((a,i)=>`<div class="announcement-thumb"><img src="${a.image}" alt="Announcement ${i+1}"><span>${i+1}. ${esc(a.name||'Announcement')}</span><button data-action="remove-announcement" data-index="${i}" aria-label="Remove announcement">×</button></div>`).join(''):'<div class="empty-media-state">No pre-game images uploaded.</div>'}</div>
      <div class="presentation-section halftime-section"><div><h3>Halftime Screen</h3><p>Optional single image shown after Round 4 answers and before Round 5.</p></div><label class="ui-btn file-button">Upload Halftime Image<input id="halftimeImageInput" type="file" accept="image/*" hidden></label></div>
      ${game.halftimeImage?`<div class="halftime-preview"><img src="${game.halftimeImage}" alt="Halftime preview"><button class="ui-btn ui-btn-small ui-btn-coral" data-action="remove-halftime">Remove Halftime Image</button></div>`:'<div class="empty-media-state">No halftime image selected.</div>'}
      <p class="image-storage-note">Images are automatically compressed before they are stored with the game. Large numbers of image-heavy games may reach the browser storage limit.</p>
      <div class="modal-actions"><button class="ui-btn ui-btn-teal" data-action="presentation-close">✓ Done</button></div>
    </section></div>`;
}


function renderAll() { renderDashboard(); renderEditor(); setView(currentView); }
function newGame() {
  const game = createBlankGame();
  games.unshift(game); selectedId = game.id; activeCategory = 0; activeQuestion = 0; activeBonus = false; persist();
  currentView = 'editor'; renderAll();
  setTimeout(openCategoryModal, 0);
}
function openEditor(id) { selectedId=id; activeCategory=0; activeQuestion=0; activeBonus=false; resetHelper(); persist(); currentView='editor'; renderAll(); }
function duplicateGame(id) {
  const source = games.find(g=>g.id===id); if (!source) return;
  const copy = structuredClone(source); copy.id=makeId(); copy.title=`${source.title} Copy`; copy.createdAt=new Date().toISOString(); copy.updatedAt=copy.createdAt;
  games.unshift(copy); selectedId=copy.id; persist(); setStatus('Duplicated'); currentView='editor'; renderAll();
}
function deleteGame() {
  const game=selectedGame(); if (!game) return;
  if (!confirm(`Delete “${game.title}”?`)) return;
  games=games.filter(g=>g.id!==game.id); selectedId=games[0]?.id||''; persist(); currentView='dashboard'; renderAll();
}
function clearQuestion() {
  const game=selectedGame(); if (!game) return;
  game.categories[activeCategory].questions[activeQuestion]={question:'',answer:'',image:'',youtubeUrl:'',youtubeIn:0,youtubeOut:0};
  touch(game,'Cleared'); renderEditor();
}
function clearBonus() {
  const game=selectedGame(); if (!game) return;
  game.bonus.question=''; game.bonus.answer='';
  touch(game,'Bonus cleared'); renderEditor();
}
function exportGame() {
  const game=selectedGame(); if (!game) return;
  const triviaFile = {
    format: 'trivia-night-game',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    game
  };
  const blob=new Blob([JSON.stringify(triviaFile,null,2)],{type:'application/x-trivia+json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`${game.title.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'trivia-game'}.trivia`;
  a.click();
  URL.revokeObjectURL(url);
  setStatus('Game exported as .trivia');
}
async function exportAnswerSheetsPdf(id) {
  const game = games.find(g=>g.id===id) || selectedGame();
  if (!game) return;
  if (!window.TriviaAnswerSheets?.download) { alert('The PDF exporter did not load. Please refresh the page and try again.'); return; }
  try {
    await window.TriviaAnswerSheets.download(game);
    setStatus('Answer-sheet PDF exported');
  } catch (error) {
    console.error(error);
    alert('The answer-sheet PDF could not be created. Please refresh and try again.');
  }
}

function importGame(file) {
  const reader=new FileReader(); reader.onload=()=>{
    try {
      const parsed=JSON.parse(reader.result);
      const sourceGame = parsed?.format === 'trivia-night-game' && parsed?.game ? parsed.game : parsed;
      const data=normalizeGame(sourceGame);
      if (!data.title || !Array.isArray(data.categories) || data.categories.length!==7) throw new Error('Invalid');
      data.id=makeId(); data.createdAt=new Date().toISOString(); data.updatedAt=data.createdAt;
      games.unshift(data); selectedId=data.id; persist(); activeCategory=0; activeQuestion=0; activeBonus=false; currentView='editor'; renderAll(); setStatus('Trivia game imported');
    } catch { alert('That file could not be imported. Please choose a Trivia Night .trivia file or an older Trivia Night .json export.'); }
  }; reader.readAsText(file);
}

function saveActiveField(target) {
  const game=selectedGame(); if (!game) return;
  const cat=game.categories[activeCategory]; const q=cat.questions[activeQuestion];
  if (target.id==='gameTitle') game.title=target.value;
  if (target.id==='questionInput') q.question=target.value;
  if (target.id==='answerInput') q.answer=target.value;
  if (target.id==='youtubeUrlInput') q.youtubeUrl=target.value.trim();
  if (target.id==='musicTrimInInput') { if(musicTrimDraft){musicTrimDraft.in=parseTimecode(target.value);if(trimDraftOut()&&trimDraftOut()<=musicTrimDraft.in)musicTrimDraft.out=0;updateMusicTrimSummary(false);setMusicTrimMessage('IN value changed — click Save Clip Marks to keep it.','dirty');} return; }
  if (target.id==='musicTrimOutInput') { if(musicTrimDraft){const out=parseTimecode(target.value);musicTrimDraft.out=out>trimDraftIn()?out:0;updateMusicTrimSummary(false);setMusicTrimMessage('OUT value changed — click Save Clip Marks to keep it.','dirty');} return; }
  if (target.id==='youtubeInInput') {
    q.youtubeIn=parseTimecode(target.value);
    if(q.youtubeOut && q.youtubeOut<=q.youtubeIn) q.youtubeOut=0;
  }
  if (target.id==='youtubeOutInput') {
    const out=parseTimecode(target.value);
    q.youtubeOut=out>q.youtubeIn ? out : 0;
  }
  if (target.id==='bonusNameInput') game.bonus.name=target.value;
  if (target.id==='bonusQuestionInput') game.bonus.question=target.value;
  if (target.id==='bonusAnswerInput') game.bonus.answer=target.value;
  if (target.id==='bonusEnabled') { game.bonus.enabled=target.checked; touch(game,target.checked?'Bonus enabled':'Bonus disabled'); renderDashboard(); renderEditor(); return; }
  if (target.id==='announcementSecondsInput') { game.announcementSeconds=Math.min(60,Math.max(2,Number(target.value)||8)); touch(game,'Slide timing saved'); return; }
  if (target.id==='categoryDraftName' && categoryDraft) { categoryDraft.name=target.value; const preview=document.querySelector('.modal-preview strong'); if(preview) preview.textContent=(target.value || `Category ${activeCategory+1}`) + (categoryDraft.type==='music'?' ♫':categoryDraft.type==='picture'?' 🖼️':''); return; }
  if (target.id==='categoryDraftDescription' && categoryDraft) { categoryDraft.description=target.value; const preview=document.querySelector('.modal-preview small'); if(preview) preview.textContent=target.value; return; }
  if (target.id==='categoryDraftType' && categoryDraft) { categoryDraft.type=['music','picture'].includes(target.value)?target.value:'standard'; renderCategoryModal(); return; }
  if (target.id==='categoryDraftTimerEnabled' && categoryDraft) { categoryDraft.timerEnabled=target.checked; renderCategoryModal(); return; }
  if (target.id==='categoryDraftTimerSeconds' && categoryDraft) { categoryDraft.timerSeconds=Math.min(300,Math.max(5,Number(target.value)||30)); return; }
  if (target.id==='aiDifficulty') { aiDifficulty=target.value || 'medium'; return; }
  if (target.id==='aiFocus') { aiFocus=target.value; return; }
  if (!['gameTitle','questionInput','answerInput','youtubeUrlInput','youtubeInInput','youtubeOutInput','bonusNameInput','bonusQuestionInput','bonusAnswerInput'].includes(target.id)) return;
  touch(game);
  if (target.id==='questionInput' || target.id==='bonusQuestionInput') { const preview=document.querySelector('.mini-question'); if(preview) preview.textContent=target.value || (activeBonus ? 'Your bonus question will appear here.' : 'Your question will appear here.'); }
}

function routeAction(el) {
  const action=el.dataset.action;
  if (action==='new') newGame();
  if (action==='edit') openEditor(el.dataset.id);
  if (action==='duplicate') duplicateGame(el.dataset.id);
  if (action==='export') exportGame();
  if (action==='answer-pdf') exportAnswerSheetsPdf(el.dataset.id);
  if (action==='delete') deleteGame();
  if (action==='clear-question') { resetHelper(); clearQuestion(); }
  if (action==='helper-suggest') { aiHelperError=''; suggestHelper(); }
  if (action==='helper-use') useHelperSuggestion();
  if (action==='ai-generate') generateAIHelper(false);
  if (action==='ai-fill') generateAIHelper(true);
  if (action==='clear-bonus') clearBonus();
  if (action==='save') { if(activeMusicQuestion() && musicTrimDraft) commitMusicTrimMarks('Clip marks saved'); persist(); setStatus('Saved'); renderDashboard(); }
  if (action==='music-trim-load') reloadMusicTrimVideo();
  if (action==='music-trim-play') playMusicTrimClip();
  if (action==='music-trim-pause') { try{musicTrimPlayer?.pauseVideo?.();}catch{} }
  if (action==='music-trim-set-in') setMusicTrimInHere();
  if (action==='music-trim-set-out') setMusicTrimOutHere();
  if (action==='music-trim-go-in') goMusicTrimTo(trimDraftIn());
  if (action==='music-trim-go-out') { const out=trimDraftOut(); if(out)goMusicTrimTo(out); }
  if (action==='music-trim-clear-out') { if(musicTrimDraft){musicTrimDraft.out=0;updateMusicTrimSummary(false);commitMusicTrimMarks('OUT mark cleared');} }
  if (action==='music-trim-save') { syncMusicTrimDraftFromInputs(); commitMusicTrimMarks('Clip marks saved'); }
  if (action==='category') { saveActiveMusicTrimDraft('Clip marks saved'); activeBonus=false; activeCategory=Number(el.dataset.index); activeQuestion=0; resetHelper(); closeCategoryModal(); closePresentationModal(); renderEditor(); }
  if (action==='question') { saveActiveMusicTrimDraft('Clip marks saved'); activeBonus=false; activeQuestion=Number(el.dataset.index); resetHelper(); renderEditor(); }
  if (action==='bonus') { saveActiveMusicTrimDraft('Clip marks saved'); activeBonus=true; resetHelper(); closeCategoryModal(); closePresentationModal(); renderEditor(); }
  if (action==='categories') { if (!selectedGame()) return; saveActiveMusicTrimDraft('Clip marks saved'); currentView='editor'; activeBonus=false; activeCategory=0; renderAll(); openCategoryModal(); }
  if (action==='questions') { if (!selectedGame()) return; saveActiveMusicTrimDraft('Clip marks saved'); currentView='editor'; activeBonus=false; activeQuestion=0; renderAll(); }
  if (action==='edit-category') { closePresentationModal(); openCategoryModal(); }
  if (action==='category-cancel') closeCategoryModal();
  if (action==='presentation-settings') { closeCategoryModal(); openPresentationModal(); }
  if (action==='presentation-close') { closePresentationModal(); renderEditor(); }
  if (action==='theme-select') {
    const game=selectedGame(); if(!game) return;
    if(THEME_LIBRARY.some(t=>t.id===el.dataset.theme)) game.theme=el.dataset.theme;
    touch(game,'Theme saved'); renderPresentationModal();
  }
  if (action==='remove-announcement') {
    const game=selectedGame(); if(!game) return;
    game.announcements.splice(Number(el.dataset.index),1); touch(game,'Announcement removed'); renderPresentationModal();
  }
  if (action==='remove-halftime') {
    const game=selectedGame(); if(!game) return;
    game.halftimeImage=''; game.halftimeName=''; touch(game,'Halftime image removed'); renderPresentationModal();
  }
  if (action==='remove-picture') {
    const game=selectedGame(); if(!game) return;
    game.categories[activeCategory].questions[activeQuestion].image=''; touch(game,'Picture removed'); renderEditor();
  }
  if (action==='pick-icon' && categoryDraft) {
    categoryDraft.icon=el.dataset.icon;
    document.querySelectorAll('.icon-choice').forEach(x=>x.classList.remove('selected')); el.classList.add('selected');
    const previewIcon=document.querySelector('.modal-preview-icon'); if(previewIcon) previewIcon.textContent=categoryDraft.icon;
  }
  if (action==='pick-color' && categoryDraft) {
    categoryDraft.color=el.dataset.color;
    document.querySelectorAll('.color-swatch').forEach(x=>x.classList.remove('selected')); el.classList.add('selected');
    const preview=document.querySelector('.modal-preview'); if(preview) preview.style.setProperty('--category-color',categoryDraft.color);
  }
  if (action==='category-save' && categoryDraft) {
    const game=selectedGame(); const cat=game?.categories?.[activeCategory]; if (!game || !cat) return;
    cat.name=(categoryDraft.name || `Category ${activeCategory+1}`).trim().slice(0,42);
    cat.icon=categoryDraft.icon || DEFAULT_ICONS[activeCategory];
    cat.color=sanitizeColor(categoryDraft.color, DEFAULT_COLORS[activeCategory]);
    cat.type=['music','picture'].includes(categoryDraft.type)?categoryDraft.type:'standard';
    cat.description=(categoryDraft.description||'').trim().slice(0,110);
    cat.timerEnabled=Boolean(categoryDraft.timerEnabled);
    cat.timerSeconds=Math.min(300,Math.max(5,Number(categoryDraft.timerSeconds)||30));
    categoryModalOpen=false; categoryDraft=null; resetHelper(); touch(game,'Category saved'); renderDashboard(); renderEditor();
  }
}

async function handleImageInput(target){
  const game=selectedGame(); if(!game) return;
  try{
    if(target.id==='announcementImagesInput'){
      const remaining=Math.max(0,12-game.announcements.length);
      const files=[...target.files].slice(0,remaining);
      if(!files.length) return;
      setStatus('Processing images…');
      for(const file of files){
        const image=await compressImageFile(file,1400,900,.8);
        game.announcements.push({id:makeId(),image,name:file.name.replace(/\.[^.]+$/,'')||'Announcement'});
      }
      if(!persist()) alert('The browser storage is full. Remove some uploaded images and try again.');
      else setStatus(`${files.length} announcement${files.length===1?'':'s'} added`);
      renderPresentationModal();
    }
    if(target.id==='halftimeImageInput' && target.files[0]){
      setStatus('Processing halftime image…');
      game.halftimeImage=await compressImageFile(target.files[0],1600,1000,.82);
      game.halftimeName=target.files[0].name.replace(/\.[^.]+$/,'');
      if(!persist()) alert('The browser storage is full. Remove some uploaded images and try again.');
      else setStatus('Halftime image added');
      renderPresentationModal();
    }
    if(target.id==='pictureImageInput' && target.files[0]){
      // Snapshot the file and question before any async image work. Returning from the
      // OS file picker can fire focus/visibility events, so do not rely on the live input
      // or active question after compression starts.
      const file=target.files[0];
      const categoryIndex=activeCategory;
      const questionIndex=activeQuestion;
      setStatus('Processing picture…');
      const image=await compressImageFile(file,2200,2200,.9);
      const currentGame=selectedGame();
      const q=currentGame?.categories?.[categoryIndex]?.questions?.[questionIndex];
      if(!currentGame || !q) throw new Error('Could not find that picture question. Please try again.');
      q.image=image;
      currentGame.updatedAt=new Date().toISOString();
      if(!persist()) alert('The browser storage is full. Remove some uploaded images and try again.');
      else setStatus(`Picture added: ${file.name}`);
      renderDashboard();
      renderEditor();
    }
  }catch(error){ console.error(error); alert(error.message||'That image could not be added.'); }
  target.value='';
}

document.addEventListener('pointerdown', e=>{ if(e.target.id==='musicTrimScrubber') musicTrimIsScrubbing=true; });
document.addEventListener('pointerup', e=>{ if(e.target.id==='musicTrimScrubber'){musicTrimIsScrubbing=false;updateMusicTrimTimeline(true);} });
document.addEventListener('input', e=>{
  if(e.target.id!=='musicTrimScrubber'||!musicTrimPlayerReady)return;
  musicTrimIsScrubbing=true;const t=Number(e.target.value)||0;
  const nowEl=document.querySelector('#musicTrimCurrent');if(nowEl)nowEl.textContent=formatTimecodePrecise(t);
  try{musicTrimPlayer.seekTo(t,false);}catch{}
});
document.addEventListener('change', e=>{
  if(e.target.id!=='musicTrimScrubber'||!musicTrimPlayerReady)return;
  const t=Number(e.target.value)||0;try{musicTrimPlayer.seekTo(t,true);}catch{}musicTrimIsScrubbing=false;updateMusicTrimTimeline(true);
});

document.addEventListener('click', e=>{
  if (MEDIA_INPUT_IDS.has(e.target?.id)) mediaFilePickerOpen=true;
  if (e.target.matches('[data-category-backdrop]')) { closeCategoryModal(); return; }
  if (e.target.matches('[data-presentation-backdrop]')) { closePresentationModal(); renderEditor(); return; }
  const el=e.target.closest('[data-action]'); if (el) routeAction(el);
  const nav=e.target.closest('[data-view]'); if (nav) { saveActiveMusicTrimDraft('Clip marks saved'); currentView=nav.dataset.view; closeCategoryModal(); closePresentationModal(); renderAll(); }
});
document.addEventListener('input', e=> saveActiveField(e.target));
document.addEventListener('change', e=>{
  if(MEDIA_INPUT_IDS.has(e.target.id)){
    mediaFilePickerOpen=false;
    mediaInputBusy=true;
    clearTimeout(pendingFocusSyncTimer);
    Promise.resolve(handleImageInput(e.target)).finally(()=>{ mediaInputBusy=false; });
    return;
  }
  saveActiveField(e.target);
});
// Manual IN/OUT values also save when the field is committed (blur/change).
document.addEventListener('change', e=>{
  if(e.target?.id==='musicTrimInInput' || e.target?.id==='musicTrimOutInput') {
    saveActiveMusicTrimDraft('Clip marks saved');
  }
});

// The Host Music Player writes changes to the same localStorage game. Refresh this tab
// whenever those changes arrive or whenever the user returns from the Host Player.
window.addEventListener('storage', e=>{
  if(e.key===STORAGE_KEY) syncGamesFromStorage({render:true});
});
window.addEventListener('focus', ()=>{
  clearTimeout(pendingFocusSyncTimer);
  // File dialogs return focus before the file input's change event in some browsers.
  // Delay synchronization so we do not destroy the input before its selected file is handled.
  pendingFocusSyncTimer=setTimeout(()=>{
    if(mediaFilePickerOpen){ mediaFilePickerOpen=false; return; }
    if(!mediaInputBusy) syncGamesFromStorage({render:true});
  },350);
});
document.addEventListener('visibilitychange', ()=>{
  if(!document.hidden && !mediaFilePickerOpen && !mediaInputBusy) syncGamesFromStorage({render:true});
});
window.addEventListener('beforeunload', ()=>{
  try { saveActiveMusicTrimDraft('Clip marks saved'); persist(); } catch {}
});

document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ if(categoryModalOpen) closeCategoryModal(); if(presentationModalOpen){ closePresentationModal(); renderEditor(); } } });
document.querySelector('#createGame').addEventListener('click', newGame);
document.querySelector('#logoHome').addEventListener('click', ()=>{saveActiveMusicTrimDraft('Clip marks saved'); currentView='dashboard'; closeCategoryModal(); closePresentationModal(); renderAll();});
document.querySelector('#importFile').addEventListener('change', e=>{ if(e.target.files[0]) importGame(e.target.files[0]); e.target.value=''; });

persist();
renderAll();

