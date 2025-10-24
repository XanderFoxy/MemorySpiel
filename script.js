// ==============================================================================
// 📄 Script.js - Kern-Spiellogik und Initialisierung
// (Alle Storage- und UI-Funktionen sind ausgelagert)
// ==============================================================================

// WICHTIG: Die ausgelagerten Dateien (slider.js, postit.js, storage.js, ui.js) 
// müssen in index.html vor dieser Datei eingebunden sein!

const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');

// Detailansicht
const imageDetailOverlay = document.getElementById('image-detail-overlay');

// Audio
const soundMatch = document.getElementById('sound-match');
const soundError = document.getElementById('sound-error');
const soundWin = document.getElementById('sound-win');

// Theme und Schwierigkeit
const themeButtons = document.querySelectorAll('.theme-button');
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyNote = document.getElementById('difficulty-note');
const difficultyDescriptionPostit = document.getElementById('difficulty-description-postit');

// History Elemente
const historyOverlay = document.getElementById('history-overlay');
const historyGameDetailOverlay = document.getElementById('history-game-detail-overlay');
const showHistoryBtn = document.getElementById('show-history-btn');
const closeGalleryButton = document.getElementById('close-gallery');

// Globale Spielzustände (werden über das window-Objekt von ausgelagerten Dateien genutzt)
let cards = [];
let hasFlippedCard = false; 
let lockBoard = false; 
let firstCard, secondCard; 
window.moves = 0; // Global, da in saveCurrentGame genutzt
window.pairsFound = 0; // Global, da in saveCurrentGame genutzt
window.matchedImages = []; // Global, da in saveCurrentGame und UI.js genutzt
window.gameStarted = false; 
window.isPostItClosed = false; // Wird von postit.js verwaltet

// Konfigurationen
const difficultyConfigs = {
    '1': { name: 'Leicht', description: 'Klassisches Memory. Karten bleiben nach Match an Ort und Stelle.', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px', logic: 'classic' }, 
    '2': { name: 'Mittel', description: 'Nach dem ersten Match werden alle restlichen Karten einmalig neu gemischt. Mehr Herausforderung.', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px', logic: 'shuffleOnce' },
    '3': { name: 'Schwer', description: 'Nach jedem Zug (unabhängig vom Match) werden alle restlichen Karten neu gemischt. Maximale Herausforderung!', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px', logic: 'shuffleAlways' }
};

// 🛑 KORREKTUR: Diese Zeile wurde entfernt, da difficultySlider.value beim Laden des Skripts noch nicht verfügbar ist.
// window.currentDifficulty = difficultyConfigs[difficultySlider.value]; 
window.currentDifficulty = null; // Auf null setzen, wird im DOMContentLoaded initialisiert

// Korrigierte Ordnerpfade (Großschreibung bleibt wie gewünscht!)
const BASE_URL = 'Bilder/'; 
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
    'Through The Years/1.jpg', 'Through The Years/2.jpg', 'Through The Years/3.jpg', 'Through The Years/4.jpg', 
    'Through The Years/5.jpg', 'Through The Years/6.jpg', 'Through The Years/7.jpg', 'Through The Years/8.jpg', 
    'Through The Years/9.jpg', 'Through The Years/10.jpg', 'Through The Years/11.jpg', 'Through The Years/12.jpg', 
    'Through The Years/13.jpg', 'Through The Years/14.jpg', 'Through The Years/15.jpg', 'Through The Years/16.jpg', 
    'Through The Years/17.jpg', 'Through The Years/18.jpg', 'Through The Years/19.jpg', 'Through The Years/20.jpg'
];

const gameConfigs = {
    'InItalien': { allImagePaths: IN_ITALIEN_FILES, name: 'InItalien' },
    'BabyFox': { allImagePaths: BABYFOX_FILES, name: 'BabyFox' }, 
    'ThroughTheYears': { allImagePaths: THROUGH_THE_YEARS_FILES, name: 'Through The Years' },
    'Gemixt': { name: 'Gemixt', allImagePaths: [...BABYFOX_FILES, ...THROUGH_THE_YEARS_FILES, ...IN_ITALIEN_FILES] }
};

window.currentTheme = 'Gemixt'; 
window.currentThemeConfig = gameConfigs['Gemixt'];

// --- SPIELLOGIK ---

/**
 * Erzeugt das DOM-Element für eine Karte.
 */
function createCardElement(fullPath, isMatch = false) {
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
    
    if (isMatch) {
        card.classList.add('match', 'flip');
    } else {
        card.addEventListener('click', flipCard); 
    }
    
    return card;
}

/**
 * Erzeugt die Karten für ein neues Spiel und mischt sie.
 */
function setupGame(isNewGame = true) {
    if (isNewGame) {
        // Clear Storage (Funktionen aus storage.js)
        if (typeof clearCurrentGameData === 'function') {
            clearCurrentGameData(); 
        }
        
        // Post-it-Status beim Neustart zurücksetzen, es sei denn es wurde vom Nutzer geschlossen
        if (!window.isPostItClosed && typeof setPostItClosedStatus === 'function') {
             setPostItClosedStatus(false);
        }
    }
    
    memoryGrid.innerHTML = '';
    cards = [];
    window.moves = 0;
    window.pairsFound = 0;
    window.matchedImages = []; 
    window.gameStarted = false;
    
    resetBoard();
    
    // UI-Updates (werden jetzt in ui.js gehandhabt)
    if (typeof loadPermanentGallery === 'function') {
        loadPermanentGallery(); 
    }
    document.getElementById('gallery-overlay').classList.remove('active');
    document.getElementById('match-success-overlay').classList.remove('active');
    
    statsMoves.textContent = `Züge: ${window.moves}`;
    statsPairsFound.textContent = `Gefunden: ${window.pairsFound}`;
    
    // Post-it anzeigen/ausblenden (nutzt globalen Status)
    difficultyNote.classList.toggle('hidden-by-default', window.isPostItClosed);
    difficultyDescriptionPostit.innerHTML = `**${window.currentDifficulty.name}:** ${window.currentDifficulty.description}`;
    
    memoryGrid.style.gridTemplateColumns = `repeat(${window.currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = window.currentDifficulty.gridMaxW; 

    const MAX_PAIRS = window.currentDifficulty.pairs; 
    let allPaths = window.currentThemeConfig.allImagePaths;
    
    if (allPaths.length < MAX_PAIRS) {
         memoryGrid.innerHTML = `<p style="color:var(--secondary-color); grid-column: 1 / -1; text-align: center;">FEHLER: Konnte nicht genügend Bilder (${allPaths.length}/${MAX_PAIRS}) laden.</p>`;
         return;
    }

    let shuffledPaths = [...allPaths];
    for (let i = shuffledPaths.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPaths[i], shuffledPaths[j]] = [shuffledPaths[j], shuffledPaths[i]];
    }
    const selectedPaths = shuffledPaths.slice(0, MAX_PAIRS);

    let gameCardValues = []; 
    selectedPaths.forEach(fullPath => {
        gameCardValues.push(fullPath, fullPath); 
    });
    
    shuffleCardsArray(gameCardValues);

    gameCardValues.forEach(fullPath => { 
        const card = createCardElement(fullPath);
        memoryGrid.appendChild(card);
        cards.push(card);
    });
    
    // Nur setzen, wenn generateGameId existiert (aus storage.js)
    if (typeof localStorage.setItem === 'function' && typeof generateGameId === 'function') {
        localStorage.setItem(CURRENT_GAME_ID_KEY, generateGameId());
    }
}

/**
 * Mischt das Array (Fisher-Yates).
 */
function shuffleCardsArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Mischt die noch nicht gefundenen Karten neu.
 */
function reShuffleRemainingCards() {
    const currentCards = Array.from(memoryGrid.querySelectorAll('.memory-card'));
    
    const matchedCardData = currentCards
        .map((card, index) => ({
            path: card.dataset.path,
            index: index,
            isMatch: card.classList.contains('match')
        }))
        .filter(data => data.isMatch);
        
    const remainingCards = currentCards.filter(card => !card.classList.contains('match'));
    let remainingPaths = remainingCards.map(card => card.dataset.path);
    
    shuffleCardsArray(remainingPaths);
    
    let finalCardPaths = new Array(window.currentDifficulty.cardsTotal).fill(null);
    let remainingPathsIndex = 0;

    matchedCardData.forEach(data => {
        finalCardPaths[data.index] = data.path;
    });
    
    for (let i = 0; i < finalCardPaths.length; i++) {
        if (finalCardPaths[i] === null) {
            finalCardPaths[i] = remainingPaths[remainingPathsIndex];
            remainingPathsIndex++;
        }
    }
    
    memoryGrid.innerHTML = '';
    cards = [];

    finalCardPaths.forEach((path, index) => {
        const isMatch = matchedCardData.some(d => d.index === index);
        const card = createCardElement(path, isMatch);
        if (isMatch) card.classList.add('match', 'flip'); 
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });
    
    resetBoard();
}

/**
 * Deckt eine Karte auf.
 */
function flipCard() {
    // Sperren, wenn Brett gesperrt oder Overlay aktiv ist (wird direkt im DOM geprüft)
    if (lockBoard || document.querySelector('.overlay.active')) {
        return;
    }
    
    if (this === firstCard || this.classList.contains('match')) return; 

    if (!window.gameStarted) {
        window.gameStarted = true;
        difficultyNote.classList.add('hidden-by-default');
        // Funktion aus postit.js aufrufen
        if (typeof setPostItClosedStatus === 'function') {
            setPostItClosedStatus(true);
        }
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
    
    window.moves++;
    statsMoves.textContent = `Züge: ${window.moves}`;
    
    let isMatch = firstCard.dataset.path === secondCard.dataset.path;
    
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
        
        if (window.currentDifficulty.logic === 'shuffleAlways') {
            setTimeout(() => {
                reShuffleRemainingCards();
            }, 1500);
        }
    }
}

/**
 * Paare gefunden.
 */
function disableCards() {
    window.pairsFound++;
    statsPairsFound.textContent = `Gefunden: ${window.pairsFound}`;
    soundMatch.play();
    
    firstCard.classList.remove('waiting'); 
    
    firstCard.classList.add('match'); 
    secondCard.classList.add('match'); 
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImagePath = firstCard.dataset.path;
    const matchedImageSrc = `${BASE_URL}${matchedImagePath}`;
    
    window.matchedImages.push(matchedImagePath);
    
    // ui.js-Funktion aufrufen
    if (typeof showMatchSuccessAndAnimate === 'function') {
        showMatchSuccessAndAnimate(matchedImageSrc, matchedImagePath);
    }
    
    // ShuffleOnce Logik
    if (window.currentDifficulty.logic === 'shuffleOnce' && localStorage.getItem('initialShuffleComplete') !== 'true' && window.pairsFound === 1) {
        localStorage.setItem('initialShuffleComplete', 'true');
        setTimeout(() => {
             reShuffleRemainingCards();
        }, 1500); 
    }
    
    // Save-Funktion aufrufen (storage.js)
    if (typeof saveCurrentGame === 'function') {
         saveCurrentGame(cards, window.currentTheme, difficultySlider.value, window.moves, window.pairsFound, window.matchedImages, localStorage.getItem('initialShuffleComplete') === 'true');
    }

    resetBoard(); 
    
    if (window.pairsFound === window.currentDifficulty.pairs) { 
        setTimeout(gameOver, 2000); 
    }
}

/**
 * Paare nicht gefunden.
 */
function unflipCards() {
    lockBoard = true;
    soundError.play();
    
    firstCard.classList.remove('waiting'); 
    firstCard.classList.add('error');
    secondCard.classList.add('error');
    
    setTimeout(() => {
        firstCard.classList.remove('flip', 'error');
        secondCard.classList.remove('flip', 'error');
        
        resetBoard();
    }, 1500); 
    
    // Speichern, wenn nicht 'shuffleAlways' (da dort im setTimeout gespeichert wird)
    if (window.currentDifficulty.logic !== 'shuffleAlways') {
        if (typeof saveCurrentGame === 'function') {
             saveCurrentGame(cards, window.currentTheme, difficultySlider.value, window.moves, window.pairsFound, window.matchedImages, localStorage.getItem('initialShuffleComplete') === 'true');
        }
    }
}

/**
 * Setzt den Board-Zustand zurück.
 */
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
    document.querySelectorAll('.memory-card.waiting').forEach(card => card.classList.remove('waiting'));
}

/**
 * Spiel beendet (Gewonnen).
 */
function gameOver() {
    soundWin.play();
    
    // Nur ausführen, wenn die Funktionen existieren (storage.js, ui.js)
    if (typeof updateHistory === 'function' && typeof showGameOverGallery === 'function' && typeof clearCurrentGameData === 'function' && typeof generateGameId === 'function') {
        const gameId = localStorage.getItem(CURRENT_GAME_ID_KEY) || generateGameId();
        const uniqueMatchedImages = [...new Set(window.matchedImages)];
        
        updateHistory(gameId, window.currentTheme, window.moves, window.currentDifficulty.pairs, uniqueMatchedImages, true);
        showGameOverGallery(window.matchedImages);
        clearCurrentGameData(); 
    }

    window.gameStarted = false;
}

/**
 * Lädt ein gespeichertes Spiel oder startet neu.
 */
function loadOrStartGame() {
    // Stellen Sie sicher, dass die nötigen Funktionen existieren (storage.js, ui.js, slider.js)
    if (typeof loadCurrentGameData !== 'function' || typeof updateDifficultyDisplay !== 'function' || typeof loadPermanentGallery !== 'function') {
         console.error("Kann Spiel nicht laden. Eine Funktion aus Storage.js/UI.js/Slider.js fehlt.");
         setupGame(true);
         return false;
    }
    
    // 1. Daten aus Storage laden (Funktion aus storage.js)
    const gameState = loadCurrentGameData();
    
    // Prüfen, ob ein gültiges Spiel im aktuellen Theme gespeichert ist
    if (!gameState || gameState.theme !== window.currentTheme) {
        // Starte neues Spiel
        setupGame(true);
        return false;
    }

    // 2. Spielzustand wiederherstellen
    window.currentDifficulty = difficultyConfigs[gameState.difficulty];
    difficultySlider.value = gameState.difficulty;
    
    // Update Slider-UI (Funktion aus slider.js)
    if (typeof updateDifficultyDisplay === 'function') {
        updateDifficultyDisplay(false); 
    }

    window.moves = gameState.moves;
    window.pairsFound = gameState.pairsFound;
    window.matchedImages = gameState.matchedImages;
    window.gameStarted = (window.moves > 0 || window.pairsFound > 0); 
    
    if (window.currentDifficulty.logic === 'shuffleOnce') {
        localStorage.setItem('initialShuffleComplete', gameState.initialShuffleComplete ? 'true' : 'false');
    }
    localStorage.setItem(CURRENT_GAME_ID_KEY, gameState.id);

    statsMoves.textContent = `Züge: ${window.moves}`;
    statsPairsFound.textContent = `Gefunden: ${window.pairsFound}`;
    
    // Post-it Logik beim Laden (nutzt globalen Status)
    const postitStatus = window.isPostItClosed || false; 
    difficultyNote.classList.toggle('hidden-by-default', window.gameStarted || postitStatus);
    
    memoryGrid.style.gridTemplateColumns = `repeat(${window.currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = window.currentDifficulty.gridMaxW; 
    memoryGrid.innerHTML = ''; 

    cards = [];
    
    gameState.cardsData.sort((a, b) => a.position - b.position);
    
    gameState.cardsData.forEach(cardState => {
        const fullPath = cardState.path;
        const card = createCardElement(fullPath);
        
        if (cardState.flipped) { card.classList.add('flip'); }
        if (cardState.match) { card.classList.add('match'); } 
        
        if (!cardState.match) { card.addEventListener('click', flipCard); }
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });

    // UI-Update (Funktion aus ui.js)
    loadPermanentGallery();
    resetBoard();
    return true;
}


// --- INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 🛑 KORREKTUR: window.currentDifficulty MUSS hier initialisiert werden, 
    // nachdem difficultySlider im DOM gefunden wurde.
    if (difficultySlider && difficultySlider.value) {
        window.currentDifficulty = difficultyConfigs[difficultySlider.value]; 
    } else {
        // Fallback, wenn der Slider aus irgendeinem Grund nicht gefunden wird
        window.currentDifficulty = difficultyConfigs['1']; 
    }
    
    // Event Listener für Overlays (jetzt hier, da es die DOM-Struktur betrifft)
    [imageDetailOverlay, historyOverlay, historyGameDetailOverlay].forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('overlay')) {
                overlay.classList.remove('active');
            }
        });
    });
    
    document.querySelector('.close-history-detail').addEventListener('click', () => {
         historyGameDetailOverlay.classList.remove('active');
    });

    closeGalleryButton.addEventListener('click', () => {
        document.getElementById('gallery-overlay').classList.remove('active');
        setupGame(true); // Neues Spiel starten
    });
    
    // History Button (Funktion aus ui.js)
    if (typeof showHistory === 'function') {
        showHistoryBtn.addEventListener('click', showHistory);
    }
    
    // Update Difficulty Display beim Initialisieren, bevor es zum Game Setup geht (slider.js)
    if (typeof updateDifficultyDisplay === 'function') {
        updateDifficultyDisplay(false); 
    }
    
    // Theme-Buttons
    themeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const newTheme = e.target.dataset.theme;
            
            // Unvollständiges Spiel speichern (History-Update aus storage.js)
            if (window.gameStarted && window.pairsFound < window.currentDifficulty.pairs && typeof updateHistory === 'function') {
                 // gameId und generateGameId müssen aus storage.js stammen
                 const gameId = localStorage.getItem(CURRENT_GAME_ID_KEY) || (typeof generateGameId === 'function' ? generateGameId() : null); 
                 if (gameId) {
                    updateHistory(gameId, window.currentTheme, window.moves, window.currentDifficulty.pairs, [...new Set(window.matchedImages)], false);
                 }
            }
            
            window.currentTheme = newTheme;
            window.currentThemeConfig = gameConfigs[newTheme];
            
            themeButtons.forEach(btn => btn.classList.remove('active-theme'));
            e.target.classList.add('active-theme');
            
            loadOrStartGame();
        });
    });
    
    // Start/Laden des Spiels
    loadOrStartGame();
    
    // Lade die heutige Spielanzahl beim Start (Funktion aus storage.js)
    if (typeof updateDailyScoreDisplay === 'function') {
         updateDailyScoreDisplay();
    }
});
