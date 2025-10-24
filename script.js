const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');

// Match Success Overlay Elemente
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const animatedThumbnail = document.getElementById('animated-match-thumbnail');
const mainContent = document.querySelector('.main-content'); 

// End-Galerie Elemente
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const galleryWinTitle = galleryOverlay.querySelector('h2');
const galleryImagesContainer = document.getElementById('gallery-images'); 

// Theme und Schwierigkeit
const themeButtons = document.querySelectorAll('.theme-button');
const difficultySlider = document.getElementById('difficulty-slider');
const foxHeadSlider = document.getElementById('fox-head-slider'); 
const difficultyNote = document.getElementById('difficulty-note');
const difficultyDescriptionPostit = document.getElementById('difficulty-description-postit');

// Favoriten (Sidebar)
const permanentGallerySidebar = document.getElementById('permanent-gallery-sidebar');

// Kartenaufsteller (Main Content)
const dailyMatchesTitle = document.getElementById('daily-matches-title');
const dailyMatchesGallery = document.getElementById('daily-matches-gallery'); 

// Detailansicht
const imageDetailOverlay = document.getElementById('image-detail-overlay');
const detailImage = document.getElementById('detail-image');

// History Elemente
const historyOverlay = document.getElementById('history-overlay');
const historyList = document.getElementById('history-list');
const showHistoryBtn = document.getElementById('show-history-btn');
const historyGameDetailOverlay = document.getElementById('history-game-detail-overlay');
const historyGameGallery = document.getElementById('history-game-gallery');
const historyDetailDate = document.getElementById('history-detail-date');

// Audio
const soundMatch = document.getElementById('sound-match');
const soundError = document.getElementById('sound-error');
const soundWin = document.getElementById('sound-win');

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
// Globale Variable für Post-it Status (wird von Postit.js initialisiert und verwaltet)
let isPostItClosed = false; 

// Konfigurationen für 8 Paare und 3 Schwierigkeitsgrade
const difficultyConfigs = {
    '1': { name: 'Leicht', description: 'Klassisches Memory. Karten bleiben nach Match an Ort und Stelle.', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px', logic: 'classic' }, 
    '2': { name: 'Mittel', description: 'Nach dem ersten Match werden alle restlichen Karten einmalig neu gemischt. Mehr Herausforderung.', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px', logic: 'shuffleOnce' },
    '3': { name: 'Schwer', description: 'Nach jedem Zug (unabhängig vom Match) werden alle restlichen Karten neu gemischt. Maximale Herausforderung!', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px', logic: 'shuffleAlways' }
};

let currentDifficulty = difficultyConfigs[difficultySlider.value]; 
const BASE_URL = 'Bilder/'; 
const CURRENT_GAME_STORAGE_KEY = 'memoryCurrentGame';
const FAVORITES_STORAGE_KEY = 'memoryFavorites';
const HISTORY_STORAGE_KEY = 'memoryHistory';
const CURRENT_GAME_ID_KEY = 'memoryCurrentGameId'; 
const POST_IT_CLOSED_KEY = 'memoryPostItClosed'; 


// --- DATENSTRUKTUREN (Ordnerverzeichnisse sind jetzt korrigiert: Großschreibung!) ---
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

let currentThemeConfig = gameConfigs['Gemixt'];

// --- FAVORITEN & GALERIE LOGIK ---

/**
 * Erstellt ein Galerie-Item mit korrekter Skalierung.
 */
function createGalleryItem(imagePath, isFavorite = false, showHeart = true) {
    const fullSrc = `${BASE_URL}${imagePath}`;
    const item = document.createElement('div');
    item.classList.add('gallery-item');
    item.dataset.path = imagePath; 
    
    const img = document.createElement('img');
    img.src = fullSrc;
    img.alt = 'Gefundenes Bild';
    // object-fit: contain (aus CSS) stellt die korrekte proportionale Skalierung sicher.
    item.appendChild(img);

    if (showHeart) {
        const icon = document.createElement('span');
        icon.classList.add('favorite-icon', 'fas', 'fa-heart');
        if (isFavorite) {
            icon.classList.add('active');
        }

        icon.addEventListener('click', (e) => {
            e.stopPropagation(); 
            toggleFavorite(imagePath, icon);
        });
        item.appendChild(icon);
    }
    
    // Klick-Handler für Detailansicht
    item.addEventListener('click', () => {
        showImageDetail(fullSrc); 
    });

    return item;
}

function getFavorites() {
    try {
        const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return favorites ? [...new Set(JSON.parse(favorites).filter(Boolean))] : []; 
    } catch (e) {
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...new Set(favorites)]));
    } catch (e) {
        console.error("Fehler beim Speichern der Favoriten:", e);
    }
}

function toggleFavorite(imagePath, iconElement) {
    let favorites = getFavorites();
    const index = favorites.indexOf(imagePath);

    if (index === -1) {
        favorites.push(imagePath);
        iconElement.classList.add('active');
    } else {
        favorites.splice(index, 1);
        iconElement.classList.remove('active');
    }
    saveFavorites(favorites);
    loadPermanentGallery(); 
    
    // Update Favoritenstatus in der aktuellen Tagesgalerie
    const dailyItems = dailyMatchesGallery.querySelectorAll(`[data-path="${imagePath}"] .favorite-icon`);
    dailyItems.forEach(icon => {
        if (index === -1) {
            icon.classList.add('active');
        } else {
            icon.classList.remove('active');
        }
    });
}


/**
 * Lädt die Favoriten in die Sidebar und die gefundenen Bilder in den Kartenaufsteller.
 */
function loadPermanentGallery() {
    permanentGallerySidebar.innerHTML = '';
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
         const message = document.createElement('p');
         message.classList.add('gallery-info');
         message.innerHTML = "Herz für Favorit";
         message.style.color = 'var(--secondary-color)';
         message.style.fontSize = '0.9em';
         message.style.padding = '5px 0';
         permanentGallerySidebar.appendChild(message);
    } else {
        favorites.forEach(path => {
            permanentGallerySidebar.appendChild(createGalleryItem(path, true, true)); 
        });
    }
    
    // Tagesgalerie (Kartenaufsteller) aktualisieren
    dailyMatchesGallery.innerHTML = '';
    const uniqueMatchedImages = [...new Set(matchedImages)];
    
    if (uniqueMatchedImages.length > 0) {
        dailyMatchesTitle.classList.remove('hidden-by-default');
        uniqueMatchedImages.forEach(path => {
            dailyMatchesGallery.appendChild(createGalleryItem(path, favorites.includes(path), true));
        });
    } else {
        // Ausgeblendet, wenn keine Paare gefunden wurden.
        dailyMatchesTitle.classList.add('hidden-by-default'); 
    }
}

// --- SPIELLOGIK & UX FUNKTIONEN ---

function generateGameId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

function saveCurrentGame() {
    const gameId = localStorage.getItem(CURRENT_GAME_ID_KEY) || generateGameId();

    if (!gameStarted || pairsFound === currentDifficulty.pairs) return; 
    
    const cardElements = memoryGrid.querySelectorAll('.memory-card');
    const cardsState = Array.from(cardElements).map((card, index) => ({
        path: card.dataset.path,
        flipped: card.classList.contains('flip'),
        match: card.classList.contains('match'),
        position: index 
    }));

    const gameState = {
        id: gameId,
        theme: currentTheme,
        difficulty: difficultySlider.value,
        moves: moves,
        pairsFound: pairsFound,
        matchedImages: matchedImages,
        cardsData: cardsState,
        initialShuffleComplete: localStorage.getItem('initialShuffleComplete') === 'true' 
    };
    localStorage.setItem(CURRENT_GAME_STORAGE_KEY, JSON.stringify(gameState));
    localStorage.setItem(CURRENT_GAME_ID_KEY, gameId);
}

function loadCurrentGame() {
    // isPostItClosed wird von Postit.js im window-Scope verwaltet.
    const currentPostItStatus = window.isPostItClosed || false; 
    
    const gameState = JSON.parse(localStorage.getItem(CURRENT_GAME_STORAGE_KEY));
    if (!gameState || gameState.theme !== currentTheme) return false;

    currentDifficulty = difficultyConfigs[gameState.difficulty];
    difficultySlider.value = gameState.difficulty;
    
    // Rufe die ausgelagerte Funktion auf
    if (typeof updateDifficultyDisplay === 'function') {
        updateDifficultyDisplay(false); 
    }

    moves = gameState.moves;
    pairsFound = gameState.pairsFound;
    matchedImages = gameState.matchedImages;
    gameStarted = (moves > 0 || pairsFound > 0); 
    
    if (currentDifficulty.logic === 'shuffleOnce') {
        localStorage.setItem('initialShuffleComplete', gameState.initialShuffleComplete ? 'true' : 'false');
    }
    localStorage.setItem(CURRENT_GAME_ID_KEY, gameState.id);

    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;
    
    // Post-it Logik beim Laden (nutzt globalen Status)
    if (gameStarted || currentPostItStatus) {
        difficultyNote.classList.add('hidden-by-default');
    } else {
        difficultyNote.classList.remove('hidden-by-default');
    }

    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 
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

    loadPermanentGallery();
    resetBoard();
    return true;
}

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
        localStorage.removeItem(CURRENT_GAME_STORAGE_KEY); 
        localStorage.removeItem('initialShuffleComplete'); 
        localStorage.removeItem(CURRENT_GAME_ID_KEY);
        
        // Post-it-Status beim Neustart zurücksetzen, es sei denn es wurde vom Nutzer geschlossen
        if (!window.isPostItClosed) {
             localStorage.removeItem(POST_IT_CLOSED_KEY);
        }
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
    
    // Post-it anzeigen (nutzt globalen Status)
    if (!window.isPostItClosed) {
        difficultyNote.classList.remove('hidden-by-default');
    } else {
         difficultyNote.classList.add('hidden-by-default');
    }
    
    difficultyDescriptionPostit.innerHTML = `**${currentDifficulty.name}:** ${currentDifficulty.description}`;
    
    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    const MAX_PAIRS = currentDifficulty.pairs; 
    let allPaths = currentThemeConfig.allImagePaths;
    
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
    
    loadPermanentGallery(); 
    localStorage.setItem(CURRENT_GAME_ID_KEY, generateGameId());
}

function shuffleCardsArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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
    
    let finalCardPaths = new Array(currentDifficulty.cardsTotal).fill(null);
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

function flipCard() {
    if (lockBoard || matchSuccessOverlay.classList.contains('active') || historyOverlay.classList.contains('active') || imageDetailOverlay.classList.contains('active')) {
        return;
    }
    
    if (this === firstCard) return; 
    if (this.classList.contains('match')) return; 

    if (!gameStarted) {
        gameStarted = true;
        // Post-it verschwindet beim ersten Zug
        difficultyNote.classList.add('hidden-by-default');
        // Setze isPostItClosed auf true und speichere es (Funktion kommt aus Postit.js)
        window.isPostItClosed = true; 
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
    
    moves++;
    statsMoves.textContent = `Züge: ${moves}`;
    
    let isMatch = firstCard.dataset.path === secondCard.dataset.path;
    
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
        
        if (currentDifficulty.logic === 'shuffleAlways') {
            setTimeout(() => {
                reShuffleRemainingCards();
            }, 1500);
        }
    }
}

function disableCards() {
    pairsFound++;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;
    soundMatch.play();
    
    firstCard.classList.remove('waiting'); 
    
    firstCard.classList.add('match'); 
    secondCard.classList.add('match'); 
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImagePath = firstCard.dataset.path;
    const matchedImageSrc = `${BASE_URL}${matchedImagePath}`;
    
    matchedImages.push(matchedImagePath);
    
    showMatchSuccessAndAnimate(matchedImageSrc, matchedImagePath);
    
    if (currentDifficulty.logic === 'shuffleOnce' && localStorage.getItem('initialShuffleComplete') !== 'true' && pairsFound === 1) {
        localStorage.setItem('initialShuffleComplete', 'true');
        setTimeout(() => {
             reShuffleRemainingCards();
        }, 1500); 
    }
    
    saveCurrentGame();

    resetBoard(); 
    
    if (pairsFound === currentDifficulty.pairs) { 
        setTimeout(gameOver, 2000); 
    }
}

function unflipCards() {
    lockBoard = true;
    soundError.play();
    
    firstCard.classList.remove('waiting'); // Entferne Leuchten
    firstCard.classList.add('error');
    secondCard.classList.add('error');
    
    setTimeout(() => {
        firstCard.classList.remove('flip', 'error');
        secondCard.classList.remove('flip', 'error');
        
        resetBoard();
    }, 1500); 
    
    if (currentDifficulty.logic !== 'shuffleAlways') {
        saveCurrentGame();
    }
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
    document.querySelectorAll('.memory-card.waiting').forEach(card => card.classList.remove('waiting'));
}

function showMatchSuccessAndAnimate(imageSrc, imagePath) {
    matchedImagePreview.src = imageSrc;
    
    const mainContentRect = mainContent.getBoundingClientRect();
    
    const popupWidth = Math.min(mainContentRect.width * 0.4, 400);
    const popupHeight = Math.min(mainContentRect.height * 0.5, 400); 
    
    matchSuccessOverlay.style.width = `${popupWidth}px`;
    matchSuccessOverlay.style.height = `${popupHeight}px`;
    matchSuccessOverlay.style.top = `${(mainContentRect.height - popupHeight) / 2}px`;
    matchSuccessOverlay.style.left = `${(mainContentRect.width - popupWidth) / 2}px`;
    matchSuccessOverlay.classList.add('active');
    
    setTimeout(() => {
        
        matchSuccessOverlay.classList.remove('active'); 
        
        const matchRect = matchSuccessOverlay.getBoundingClientRect(); 
        
        animatedThumbnail.src = imageSrc;
        animatedThumbnail.classList.remove('hidden-by-default');
        
        animatedThumbnail.style.width = `${matchRect.width - 20}px`; 
        animatedThumbnail.style.height = `${matchRect.height - 20}px`; 
        animatedThumbnail.style.top = `${matchRect.top - mainContentRect.top + 10}px`; 
        animatedThumbnail.style.left = `${matchRect.left - mainContentRect.left + 10}px`;
        animatedThumbnail.style.opacity = 1;
        animatedThumbnail.style.transition = 'all 0.8s cubic-bezier(0.5, 0.0, 0.5, 1.0)';

        
        loadPermanentGallery(); 
        
        const newTarget = dailyMatchesGallery.querySelector(`[data-path="${imagePath}"]`);
        
        if (newTarget) {
            const targetRect = newTarget.getBoundingClientRect();
            
            const targetX = targetRect.left - mainContentRect.left;
            const targetY = targetRect.top - mainContentRect.top;

            animatedThumbnail.style.width = `${targetRect.width}px`; 
            animatedThumbnail.style.height = `${targetRect.height}px`; 
            animatedThumbnail.style.top = `${targetY}px`;
            animatedThumbnail.style.left = `${targetX}px`;
            animatedThumbnail.style.opacity = 0.8; 

            setTimeout(() => {
                animatedThumbnail.classList.add('hidden-by-default');
                animatedThumbnail.style.transition = 'none'; 
            }, 800);
        } else {
             animatedThumbnail.classList.add('hidden-by-default');
        }

    }, 800); 
}

function gameOver() {
    soundWin.play();
    
    galleryWinTitle.classList.remove('hidden-by-default');
    
    galleryImagesContainer.innerHTML = '';
    const uniqueMatchedImages = [...new Set(matchedImages)];
    const favorites = getFavorites();
    
    uniqueMatchedImages.forEach(path => {
         galleryImagesContainer.appendChild(
             createGalleryItem(path, favorites.includes(path), true)
         );
    });
    
    const gameId = localStorage.getItem(CURRENT_GAME_ID_KEY) || generateGameId();
    updateHistory(gameId, currentTheme, moves, currentDifficulty.pairs, uniqueMatchedImages, true);

    galleryOverlay.classList.add('active');
    localStorage.removeItem(CURRENT_GAME_STORAGE_KEY);
    localStorage.removeItem('initialShuffleComplete');
    localStorage.removeItem(CURRENT_GAME_ID_KEY);
    gameStarted = false;
}

function showImageDetail(fullSrc) {
    detailImage.src = fullSrc;
    imageDetailOverlay.style.position = 'fixed'; 
    imageDetailOverlay.classList.add('active');
}

// History-Logik
function updateHistory(id, theme, moves, totalPairs, matchedImages, completed) {
    let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    const today = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    
    const newEntry = {
        id: id,
        date: today,
        theme: theme,
        moves: moves,
        pairs: totalPairs,
        completed: completed,
        matchedImages: matchedImages,
        timestamp: timestamp
    };
    
    const existingIndex = history.findIndex(entry => entry.id === id);
    
    if (existingIndex !== -1) {
        const existingEntry = history[existingIndex];
        
        // Wenn das neue Spiel unvollständig ist und das alte auch, ersetzen (um den Fortschritt zu speichern)
        // ODER wenn das neue Spiel abgeschlossen ist (um das Spiel zu beenden).
        if (!completed || (completed && !existingEntry.completed)) {
             history[existingIndex] = newEntry; 
        } 
        
    } else {
        history.push(newEntry);
    }
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function showHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<p style="color:var(--secondary-color);">Noch keine Spiele im Verlauf gespeichert.</p>';
        document.getElementById('daily-score').textContent = 'Heute: 0 Spiele';
        historyOverlay.classList.add('active');
        return;
    }
    
    history.sort((a, b) => b.timestamp - a.timestamp); // Neueste Spiele zuerst
    
    const today = new Date().toISOString().split('T')[0];
    let todayCount = 0;

    history.forEach(gameEntry => {
        if (gameEntry.date === today && gameEntry.completed) todayCount++; // Zähle nur abgeschlossene Spiele
        
        const item = document.createElement('div');
        item.classList.add('history-item');
        item.dataset.gameId = gameEntry.id;
        
        const dateObj = new Date(gameEntry.timestamp);
        const timeStr = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        const statusIcon = gameEntry.completed ? '✅' : '⏳';
        const completionText = gameEntry.completed ? 'Komplett' : 'Unvollständig';

        item.innerHTML = `
            <span class="history-date">${gameEntry.date} - ${timeStr}</span>
            <span class="history-theme"><strong>${gameEntry.theme}</strong></span>
            <span class="history-status">${statusIcon} ${completionText}</span>
            <span class="history-score">Züge: ${gameEntry.moves}</span>
        `;
        
        // Detailansicht öffnet, wenn History-Item geklickt wird
        item.addEventListener('click', () => {
             viewHistoryGameDetails(gameEntry);
        });
        
        historyList.appendChild(item);
    });
    
    document.getElementById('daily-score').textContent = `Heute: ${todayCount} abgeschl. Spiele`;
    historyOverlay.classList.add('active');
}

function viewHistoryGameDetails(gameEntry) {
    historyGameGallery.innerHTML = '';
    historyDetailDate.textContent = `${gameEntry.date} (${gameEntry.theme}, ${gameEntry.completed ? 'Komplett' : 'Unvollständig'})`;
    
    const favorites = getFavorites();
    
    if (gameEntry.matchedImages && gameEntry.matchedImages.length > 0) {
        gameEntry.matchedImages.forEach(path => {
            historyGameGallery.appendChild(
                createGalleryItem(path, favorites.includes(path), true)
            );
        });
    } else {
         historyGameGallery.innerHTML = '<p style="color:var(--secondary-color); font-size: 0.9em; padding: 10px;">Noch keine Paare in diesem Spiel gefunden.</p>';
    }
    
    historyGameDetailOverlay.classList.add('active');
}


// --- INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Die Variable window.isPostItClosed wird von Assets/JavaScript/Postit.js geladen.
    
    // Event Listener für Overlays
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
        galleryOverlay.classList.remove('active');
        setupGame(true);
    });
    
    showHistoryBtn.addEventListener('click', showHistory);
    
    // Event-Listener für Slider sind jetzt in Assets/JavaScript/Slider.js
    
    // Korrektur: Update Difficulty Display beim Initialisieren, bevor es zum Game Setup geht
    if (typeof updateDifficultyDisplay === 'function') {
        updateDifficultyDisplay(false); 
    }
    
    themeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const newTheme = e.target.dataset.theme;
            
            if (gameStarted && pairsFound < currentDifficulty.pairs) {
                 const gameId = localStorage.getItem(CURRENT_GAME_ID_KEY) || generateGameId();
                 updateHistory(gameId, currentTheme, moves, currentDifficulty.pairs, [...new Set(matchedImages)], false);
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
    
    if (!loadCurrentGame()) {
        if (typeof updateDifficultyDisplay === 'function') {
            updateDifficultyDisplay(false); 
        }
        setupGame(true); 
    }
    
    // Lade die heutige Spielanzahl beim Start
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayCount = history.filter(entry => entry.date === today && entry.completed).length; 
    document.getElementById('daily-score').textContent = `Heute: ${todayCount} abgeschl. Spiele`;
});
