const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');

// Match Success Overlay Elemente
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const animatedThumbnail = document.getElementById('animated-match-thumbnail');

// End-Galerie Elemente
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const galleryWinTitle = galleryOverlay.querySelector('h2');
const galleryImagesContainer = document.getElementById('gallery-images'); 

// Theme und Schwierigkeit
const themeButtons = document.querySelectorAll('.theme-button');
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyDescription = document.getElementById('difficulty-description');
const foxHeadSlider = document.getElementById('fox-head-slider'); // NEU

// Favoriten (Sidebar)
const permanentGallerySidebar = document.getElementById('permanent-gallery-sidebar');

// Kartenaufsteller (Main Content)
const dailyMatchesTitle = document.getElementById('daily-matches-title');
const dailyMatchesGallery = document.getElementById('daily-matches-gallery'); 

// Detailansicht
const imageDetailOverlay = document.getElementById('image-detail-overlay');
const detailImage = document.getElementById('detail-image');
// closeDetailButton ist in HTML entfernt, Klick auf Overlay schließt

// Audio
const soundMatch = document.getElementById('sound-match');
const soundError = document.getElementById('sound-error');
const soundWin = document.getElementById('sound-win');

// History Elemente
const historyOverlay = document.getElementById('history-overlay');
const showHistoryBtn = document.getElementById('show-history-btn');
// closeHistoryBtn ist in HTML entfernt

// Spielzustand
let cards = [];
let hasFlippedCard = false; 
let lockBoard = false; 
let firstCard, secondCard; 
let moves = 0;
let pairsFound = 0;
let matchedImages = []; 
let currentTheme = 'Gemixt'; 
let gameStarted = false; 

// Konfigurationen
const difficultyConfigs = {
    '1': { name: 'Leicht', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px' }, 
    '2': { name: 'Schwer', pairs: 18, columns: 6, cardsTotal: 36, gridMaxW: '780px' } 
};

let currentDifficulty = difficultyConfigs[difficultySlider.value]; 
const BASE_URL = 'Bilder/'; 
const CURRENT_GAME_STORAGE_KEY = 'memoryCurrentGame';
const FAVORITES_STORAGE_KEY = 'memoryFavorites';
const HISTORY_STORAGE_KEY = 'memoryHistory';

// --- DATENSTRUKTUREN (VOLLSTÄNDIG) ---
const IN_ITALIEN_FILES = [
    'InItalien/Al ven77.jpeg', 'InItalien/IMG_0051.jpeg', 'InItalien/IMG_0312.jpeg', 'InItalien/IMG_6917.jpeg',
    'InItalien/IMG_8499.jpeg', 'InItalien/IMG_9287.jpeg', 'InItalien/IMG_9332.jpeg', 'InItalien/IMG_9352.jpeg',
    'InItalien/IMG_9369.jpeg', 'InItalien/IMG_9370.jpeg', 'InItalien/IMG_9470.jpeg', 'InItalien/IMG_9480.jpeg',
    'InItalien/IMG_9592.jpeg', 'InItalien/IMG_9593.jpeg', 'InItalien/IMG_9594.jpeg', 'InItalien/IMG_9597.jpeg',
    'InItalien/IMG_9598.jpeg', 'InItalien/IMG_9599.jpeg', 'InItalien/QgNsMtTA.jpeg', 
    'InItalien/extra1.jpeg', 'InItalien/extra2.jpeg', 'InItalien/extra3.jpeg', 
    'InItalien/extra4.jpeg', 'InItalien/extra5.jpeg' 
];

const BABYFOX_FILES = [
    'BabyFox/01292D1E-FB2F-423E-B43C-EFFC54B7DDA8.png', 
    'BabyFox/9978574A-F56F-4AFF-9C68-490AE67EB5DA.png', 
    'BabyFox/IMG_0688.jpeg', 
    'BabyFox/Photo648578813890.1_inner_0-0-749-0-0-1000-749-1000.jpeg', 
    'BabyFox/Photo648581525823_inner_46-11-953-11-46-705-953-705.jpeg',
    'BabyFox/1.jpg', 'BabyFox/2.jpg', 'BabyFox/3.jpg', 'BabyFox/4.jpg', 'BabyFox/5.jpg', 
    'BabyFox/6.jpg', 'BabyFox/7.jpg', 'BabyFox/8.jpg', 'BabyFox/9.jpg', 'BabyFox/10.jpg',
    'BabyFox/11.jpg', 'BabyFox/12.jpg', 'BabyFox/13.jpg', 'BabyFox/14.jpg', 'BabyFox/15.jpg',
    'BabyFox/16.jpg', 'BabyFox/17.jpg', 'BabyFox/18.jpg', 'BabyFox/19.jpg', 'BabyFox/20.jpg'
];

const THROUGH_THE_YEARS_FILES = [
    'ThroughTheYears/1.jpg', 'ThroughTheYears/2.jpg', 'ThroughTheYears/3.jpg', 'ThroughTheYears/4.jpg', 
    'ThroughTheYears/5.jpg', 'ThroughTheYears/6.jpg', 'ThroughTheYears/7.jpg', 'ThroughTheYears/8.jpg', 
    'ThroughTheYears/9.jpg', 'ThroughTheYears/10.jpg', 'ThroughTheYears/11.jpg', 'ThroughTheYears/12.jpg', 
    'ThroughTheYears/13.jpg', 'ThroughTheYears/14.jpg', 'ThroughTheYears/15.jpg', 'ThroughTheYears/16.jpg', 
    'ThroughTheYears/17.jpg', 'ThroughTheYears/18.jpg', 'ThroughTheYears/19.jpg', 'ThroughTheYears/20.jpg'
];

const gameConfigs = {
    'InItalien': { allImagePaths: IN_ITALIEN_FILES, name: 'InItalien' },
    'BabyFox': { allImagePaths: BABYFOX_FILES, name: 'BabyFox' }, 
    'ThroughTheYears': { allImagePaths: THROUGH_THE_YEARS_FILES, name: 'ThroughTheYears' },
    'Gemixt': { name: 'Gemixt' }
};

let currentThemeConfig = gameConfigs['Gemixt'];

// --- SPIELLOGIK ---

function saveCurrentGame() {
    if (!gameStarted || pairsFound === currentDifficulty.pairs) return; 
    
    const gameState = {
        theme: currentTheme,
        difficulty: difficultySlider.value,
        moves: moves,
        pairsFound: pairsFound,
        matchedImages: matchedImages,
        cardsData: cards.map(card => ({ 
            path: card.dataset.path,
            flipped: card.classList.contains('flip'),
            match: card.classList.contains('match')
        }))
    };
    localStorage.setItem(CURRENT_GAME_STORAGE_KEY, JSON.stringify(gameState));
}

function loadCurrentGame() {
    const gameState = JSON.parse(localStorage.getItem(CURRENT_GAME_STORAGE_KEY));
    if (!gameState || gameState.theme !== currentTheme) return false;

    currentDifficulty = difficultyConfigs[gameState.difficulty];
    difficultySlider.value = gameState.difficulty;
    
    // Setze Fuchs-Position basierend auf dem geladenen Wert
    updateDifficultyDisplay(false); 

    moves = gameState.moves;
    pairsFound = gameState.pairsFound;
    matchedImages = gameState.matchedImages;
    gameStarted = (moves > 0 || pairsFound > 0); 

    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 
    memoryGrid.innerHTML = ''; 

    cards = [];
    gameState.cardsData.forEach(cardState => {
        const fullPath = cardState.path;
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.path = fullPath; 
        const imageURL = `${BASE_URL}${fullPath}`; 
        
        card.innerHTML = `
            <div class="front-face">
                <img src="${imageURL}" alt="Memory Bild">
            </div>
            <div class="back-face">🦊</div> 
        `;
        
        if (cardState.flipped) { card.classList.add('flip'); }
        if (cardState.match) { card.classList.add('match'); } 
        
        if (!cardState.match) { card.addEventListener('click', flipCard); }
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });

    loadPermanentGallery();
    resetBoard();
    return true;
}

function setupGame(isNewGame = true) {
    if (isNewGame) {
        localStorage.removeItem(CURRENT_GAME_STORAGE_KEY); 
    }
    
    memoryGrid.innerHTML = '';
    cards = [];
    moves = 0;
    pairsFound = 0;
    matchedImages = []; 
    gameStarted = false;
    
    resetBoard();
    matchSuccessOverlay.classList.remove('active');
    galleryOverlay.classList.remove('active');
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;
    
    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    const MAX_PAIRS = currentDifficulty.pairs; 
    let allPaths = [];

    if (currentThemeConfig.name === 'Gemixt') {
        allPaths = [...BABYFOX_FILES, ...THROUGH_THE_YEARS_FILES, ...IN_ITALIEN_FILES];
    } else if (currentThemeConfig.allImagePaths) {
         allPaths = currentThemeConfig.allImagePaths;
    }
    
    if (allPaths.length < MAX_PAIRS) {
         memoryGrid.innerHTML = `<p style="color:var(--secondary-color); grid-column: 1 / -1; text-align: center;">FEHLER: Konnte nicht genügend Bilder (${allPaths.length}/${MAX_PAIRS}) laden.</p>`;
         return;
    }

    let shuffledPaths = [...allPaths];
    // Shufflen und Paare auswählen
    for (let i = shuffledPaths.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPaths[i], shuffledPaths[j]] = [shuffledPaths[j], shuffledPaths[i]];
    }
    const selectedPaths = shuffledPaths.slice(0, MAX_PAIRS);

    let gameCardValues = []; 
    selectedPaths.forEach(fullPath => {
        gameCardValues.push(fullPath, fullPath); 
    });
    
    // Final Shuffle Array für die Positionen auf dem Feld
    for (let i = gameCardValues.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameCardValues[i], gameCardValues[j]] = [gameCardValues[j], gameCardValues[i]];
    }

    gameCardValues.forEach(fullPath => { 
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.path = fullPath; 
        
        const imageURL = `${BASE_URL}${fullPath}`; 

        card.innerHTML = `
            <div class="front-face">
                <img src="${imageURL}" alt="Memory Bild">
            </div>
            <div class="back-face">🦊</div> 
        `;
        
        card.addEventListener('click', flipCard); 
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });
    
    loadPermanentGallery(); 
}

function flipCard() {
    // Überprüfung, ob ein Overlay aktiv ist (wichtig für Spiel-Blockierung)
    if (lockBoard || matchSuccessOverlay.classList.contains('active') || historyOverlay.classList.contains('active') || imageDetailOverlay.classList.contains('active')) {
        return;
    }
    
    if (this === firstCard) return; 
    if (this.classList.contains('match')) return; 

    if (!gameStarted) {
        gameStarted = true;
        localStorage.removeItem(CURRENT_GAME_STORAGE_KEY);
    }
    
    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        firstCard.classList.add('waiting'); 
        return;
    }
    
    secondCard = this;
    if (firstCard) firstCard.classList.remove('waiting'); 
    
    moves++;
    statsMoves.textContent = `Züge: ${moves}`;
    
    let isMatch = firstCard.dataset.path === secondCard.dataset.path;
    isMatch ? disableCards() : unflipCards();
}

function showImageDetail(fullSrc) {
    detailImage.src = fullSrc;
    imageDetailOverlay.classList.add('active');
}

// --- NEU: SLIDER FUCHS LOGIK ---
function updateDifficultyDisplay(animate = true) {
    const min = difficultySlider.min;
    const max = difficultySlider.max;
    const val = difficultySlider.value;
    
    // Position des Fuchses relativ zum Slider-Wert (0% bis 100%)
    const percentage = (val - min) / (max - min) * 100;
    
    // Anpassen an die Breite des Thumb-Griffs (ca. 10px nach links verschoben)
    const offset = 10; 
    foxHeadSlider.style.left = `calc(${percentage}% - ${offset}px)`;
    
    // Text-Update
    currentDifficulty = difficultyConfigs[val];
    difficultyDescription.textContent = `${currentDifficulty.name} (${currentDifficulty.pairs} Paare)`;

    if (animate) {
         // Kurzes Aufblenden, wenn der Slider bewegt wird
         foxHeadSlider.style.opacity = 1;
         setTimeout(() => { foxHeadSlider.style.opacity = 0; }, 1000);
    } else {
         // Beim Laden initial auf 0 setzen
         foxHeadSlider.style.opacity = 0;
    }
}

// --- INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Initiales Laden
    if (!loadCurrentGame()) {
        updateDifficultyDisplay(false); // Initialer Zustand
        setupGame(true); 
    }

    // Event Listener für Schwierigkeits-Slider
    difficultySlider.addEventListener('input', (e) => {
        updateDifficultyDisplay(true);
    });
    
    difficultySlider.addEventListener('change', () => {
         // Erst wenn der Slider losgelassen wird, wird das neue Spiel gestartet
         setupGame(true); 
    });
    
    // Event Listener für Overlays (Klick auf Overlay schließt)
    
    // Detailansicht
    imageDetailOverlay.addEventListener('click', (e) => {
        // Schließen bei Klick außerhalb des Detail-Bildes
        if (e.target.id === 'image-detail-overlay' || e.target.id === 'detail-image') {
            imageDetailOverlay.classList.remove('active');
        }
    });

    // History-Overlay
    historyOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'history-overlay') {
            historyOverlay.classList.remove('active');
        }
    });

    // End-Galerie Button ist nun "Neues Spiel"
    closeGalleryButton.addEventListener('click', () => {
        galleryOverlay.classList.remove('active');
        setupGame(true);
    });
    
    // History anzeigen
    showHistoryBtn.addEventListener('click', showHistory);
    
    // Theme-Wechsel-Logik (unverändert)
    themeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const newTheme = e.target.dataset.theme;
            
            if (gameStarted && pairsFound < currentDifficulty.pairs) {
                saveCurrentGame();
            }
            
            currentTheme = newTheme;
            currentThemeConfig = gameConfigs[newTheme];
            
            themeButtons.forEach(btn => btn.classList.remove('active-theme'));
            e.target.classList.add('active-theme');
            
            if (!loadCurrentGame()) {
                setupGame(true); 
            }
        });
    });
});

// ... (Restliche Logik wie disableCards, unflipCards, resetBoard, loadPermanentGallery, updateHistory, showHistory, createGalleryItem bleibt wie im letzten vollständigen Prompt. Sie wurde hier für die Kürze des Updates weggelassen, aber in der realen Datei beibehalten.)
