const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');

// Match Success Overlay Elemente
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const animatedThumbnail = document.getElementById('animated-match-thumbnail');
const mainContent = document.querySelector('.main-content'); // Referenzrahmen für Animation

// End-Galerie Elemente
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const galleryWinTitle = galleryOverlay.querySelector('h2');
const galleryImagesContainer = document.getElementById('gallery-images'); 

// Theme und Schwierigkeit
const themeButtons = document.querySelectorAll('.theme-button');
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyDescription = document.getElementById('difficulty-description');
const foxHeadSlider = document.getElementById('fox-head-slider'); 

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

// Konfigurationen für 8 Paare und 3 Schwierigkeitsgrade (4x4 Grid)
const difficultyConfigs = {
    // 1: Leicht - Klassisches Memory (kein Mischen)
    '1': { name: 'Leicht', description: 'Klassisches Memory. Karten bleiben nach Match an Ort und Stelle.', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px', logic: 'classic' }, 
    // 2: Mittel - Einmaliges Mischen (nach dem ersten Match)
    '2': { name: 'Mittel', description: 'Nach dem ersten Match werden alle restlichen Karten einmalig neu gemischt.', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px', logic: 'shuffleOnce' },
    // 3: Schwer - Ständiges Mischen (nach jedem Zug)
    '3': { name: 'Schwer', description: 'Nach jedem Zug (unabhängig vom Match) werden alle restlichen Karten neu gemischt.', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px', logic: 'shuffleAlways' }
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

// --- FAVORITEN & GALERIE LOGIK ---

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

function createGalleryItem(imagePath, isFavorite = false, showHeart = true) {
    const fullSrc = `${BASE_URL}${imagePath}`;
    const item = document.createElement('div');
    item.classList.add('gallery-item');
    item.dataset.path = imagePath; 
    
    const img = document.createElement('img');
    img.src = fullSrc;
    img.alt = 'Gefundenes Bild';
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
    
    item.addEventListener('click', () => {
        showImageDetail(fullSrc); 
    });

    return item;
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
}

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
    
    dailyMatchesGallery.innerHTML = '';
    const uniqueMatchedImages = [...new Set(matchedImages)];
    
    if (uniqueMatchedImages.length > 0) {
        dailyMatchesTitle.classList.remove('hidden-by-default');
        uniqueMatchedImages.forEach(path => {
            dailyMatchesGallery.appendChild(createGalleryItem(path, false, false));
        });
    } else {
        dailyMatchesTitle.classList.add('hidden-by-default');
    }
}

// --- SPIELLOGIK & UX FUNKTIONEN ---

function saveCurrentGame() {
    if (!gameStarted || pairsFound === currentDifficulty.pairs) return; 
    
    const cardElements = memoryGrid.querySelectorAll('.memory-card');
    const cardsState = Array.from(cardElements).map((card, index) => ({
        path: card.dataset.path,
        flipped: card.classList.contains('flip'),
        match: card.classList.contains('match'),
        position: index 
    }));

    const gameState = {
        theme: currentTheme,
        difficulty: difficultySlider.value,
        moves: moves,
        pairsFound: pairsFound,
        matchedImages: matchedImages,
        cardsData: cardsState,
        initialShuffleComplete: localStorage.getItem('initialShuffleComplete') === 'true' 
    };
    localStorage.setItem(CURRENT_GAME_STORAGE_KEY, JSON.stringify(gameState));
}

function loadCurrentGame() {
    const gameState = JSON.parse(localStorage.getItem(CURRENT_GAME_STORAGE_KEY));
    if (!gameState || gameState.theme !== currentTheme) return false;

    currentDifficulty = difficultyConfigs[gameState.difficulty];
    difficultySlider.value = gameState.difficulty;
    
    updateDifficultyDisplay(false); 

    moves = gameState.moves;
    pairsFound = gameState.pairsFound;
    matchedImages = gameState.matchedImages;
    gameStarted = (moves > 0 || pairsFound > 0); 
    
    if (currentDifficulty.logic === 'shuffleOnce') {
        localStorage.setItem('initialShuffleComplete', gameState.initialShuffleComplete ? 'true' : 'false');
    }

    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 
    memoryGrid.innerHTML = ''; 

    cards = [];
    
    // Sortiere nach gespeicherter Position, um die Reihenfolge wiederherzustellen
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
 * @param {string} fullPath 
 * @returns {HTMLElement}
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
 * @param {boolean} isNewGame 
 */
function setupGame(isNewGame = true) {
    if (isNewGame) {
        localStorage.removeItem(CURRENT_GAME_STORAGE_KEY); 
        localStorage.removeItem('initialShuffleComplete'); 
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
}

/**
 * Hilfsfunktion zum Mischen eines Arrays.
 * @param {Array} array 
 */
function shuffleCardsArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Mischt alle NICHT gefundenen Karten neu und ordnet das Grid neu an, wobei gefundene Karten an ihren Plätzen bleiben.
 */
function reShuffleRemainingCards() {
    // Aktuelle Karten im Grid auslesen
    const currentCards = Array.from(memoryGrid.querySelectorAll('.memory-card'));
    
    // Matched-Karten und ihre Positionen (Index)
    const matchedCardData = currentCards
        .map((card, index) => ({
            path: card.dataset.path,
            index: index,
            isMatch: card.classList.contains('match')
        }))
        .filter(data => data.isMatch);
        
    // Pfade der Unmatched-Karten
    const remainingCards = currentCards.filter(card => !card.classList.contains('match'));
    let remainingPaths = remainingCards.map(card => card.dataset.path);
    
    // Mischen der Pfade
    shuffleCardsArray(remainingPaths);
    
    let finalCardPaths = new Array(currentDifficulty.cardsTotal).fill(null);
    let remainingPathsIndex = 0;

    // 1. Setze Matched-Karten an ihre Positionen
    matchedCardData.forEach(data => {
        finalCardPaths[data.index] = data.path;
    });
    
    // 2. Fülle die leeren Plätze mit den gemischten Pfaden
    for (let i = 0; i < finalCardPaths.length; i++) {
        if (finalCardPaths[i] === null) {
            finalCardPaths[i] = remainingPaths[remainingPathsIndex];
            remainingPathsIndex++;
        }
    }
    
    // Neues Grid erstellen
    memoryGrid.innerHTML = '';
    cards = [];

    finalCardPaths.forEach((path, index) => {
        // Prüfe, ob die Karte an dieser Position eine gefundene (Matched-)Karte war
        const isMatch = matchedCardData.some(d => d.index === index);
        const card = createCardElement(path, isMatch);
        if (isMatch) card.classList.add('match', 'flip'); 
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });
    
    // Nach dem Mischen müssen alle Board-Zustände zurückgesetzt werden.
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
    
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
        
        // Schwer-Modus: Mische nach fehlerhaftem Zug
        if (currentDifficulty.logic === 'shuffleAlways') {
            // Verzögerung, um die Error-Animation zu zeigen.
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
    
    firstCard.classList.add('match'); 
    secondCard.classList.add('match'); 
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImagePath = firstCard.dataset.path;
    const matchedImageSrc = `${BASE_URL}${matchedImagePath}`;
    
    matchedImages.push(matchedImagePath);
    
    showMatchSuccessAndAnimate(matchedImageSrc, matchedImagePath);
    
    // Mittel-Modus: Nach dem ERSTEN Match einmal neu mischen
    if (currentDifficulty.logic === 'shuffleOnce' && localStorage.getItem('initialShuffleComplete') !== 'true' && pairsFound === 1) {
        localStorage.setItem('initialShuffleComplete', 'true');
        // Warten, bis die Animation vorbei ist.
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
}

function showMatchSuccessAndAnimate(imageSrc, imagePath) {
    matchedImagePreview.src = imageSrc;
    
    // Positioniere das Pop-up mittig im Main-Content
    const mainContentRect = mainContent.getBoundingClientRect();
    
    const popupWidth = Math.min(mainContentRect.width * 0.4, 400);
    const popupHeight = Math.min(mainContentRect.height * 0.5, 400); 
    
    matchSuccessOverlay.style.width = `${popupWidth}px`;
    matchSuccessOverlay.style.height = `${popupHeight}px`;
    matchSuccessOverlay.style.top = `${(mainContentRect.height - popupHeight) / 2}px`;
    matchSuccessOverlay.style.left = `${(mainContentRect.width - popupWidth) / 2}px`;
    matchSuccessOverlay.classList.add('active');
    
    // Verzögerung für die Pop-up-Anzeige
    setTimeout(() => {
        
        matchSuccessOverlay.classList.remove('active'); 
        
        // Starte die Animation
        const matchRect = matchSuccessOverlay.getBoundingClientRect(); 
        
        animatedThumbnail.src = imageSrc;
        animatedThumbnail.classList.remove('hidden-by-default');
        
        // Startposition (Mitte des Pop-up-Overlays, relativ zum Main-Content)
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
            
            // Zielkoordinaten relativ zum main-content
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
    
    updateHistory(currentTheme, uniqueMatchedImages.length === currentDifficulty.pairs);

    galleryOverlay.classList.add('active');
    localStorage.removeItem(CURRENT_GAME_STORAGE_KEY);
    localStorage.removeItem('initialShuffleComplete');
    gameStarted = false;
}

function showImageDetail(fullSrc) {
    detailImage.src = fullSrc;
    imageDetailOverlay.classList.add('active');
}

// History-Logik
function updateHistory(theme, completed) {
    let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    let dailyEntry = history.find(entry => entry.date === today);
    if (!dailyEntry) {
        dailyEntry = { date: today, themes: {} };
        history.push(dailyEntry);
    }
    
    dailyEntry.themes[theme] = { completed: completed, timestamp: Date.now() };

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

function showHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<p style="color:var(--secondary-color);">Noch keine Spiele im Verlauf gespeichert.</p>';
    }

    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    history.forEach(dayEntry => {
        const dayHeader = document.createElement('h3');
        dayHeader.textContent = `Datum: ${dayEntry.date}`;
        dayHeader.style.marginTop = '15px';
        dayHeader.style.color = 'var(--secondary-color)';
        historyList.appendChild(dayHeader);

        const themeList = document.createElement('ul');
        themeList.style.listStyleType = 'none';

        for (const theme in dayEntry.themes) {
            const themeItem = document.createElement('li');
            const status = dayEntry.themes[theme].completed ? '✅ Komplett' : '❌ Unvollständig';
            themeItem.innerHTML = `<strong>${theme}:</strong> ${status}`;
            themeList.appendChild(themeItem);
        }
        historyList.appendChild(themeList);
    });

    historyOverlay.classList.add('active');
}

// --- SLIDER FUCHS LOGIK ---
function updateDifficultyDisplay(animate = true) {
    const min = parseFloat(difficultySlider.min);
    const max = parseFloat(difficultySlider.max);
    const val = parseFloat(difficultySlider.value);
    
    // Bei 3 Stufen: 1 (0%), 2 (50%), 3 (100%)
    const correctedPercentage = (val === 1) ? 0 : (val === 2) ? 50 : 100;

    const offset = 10; 
    foxHeadSlider.style.left = `calc(${correctedPercentage}% - ${offset}px)`;
    
    currentDifficulty = difficultyConfigs[val];
    // Nur den ersten Satz der Beschreibung anzeigen
    difficultyDescription.textContent = `${currentDifficulty.name} (8 Paare, ${currentDifficulty.description.split('. ')[0]})`;

    if (animate) {
         foxHeadSlider.style.opacity = 1;
         setTimeout(() => { foxHeadSlider.style.opacity = 0; }, 1000);
    } else {
         foxHeadSlider.style.opacity = 0;
    }
}

// --- INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => {
    
    if (!loadCurrentGame()) {
        updateDifficultyDisplay(false); 
        setupGame(true); 
    }
    
    // Event Listener für Schwierigkeits-Slider
    difficultySlider.addEventListener('input', (e) => {
        updateDifficultyDisplay(true);
    });
    
    difficultySlider.addEventListener('change', () => {
         setupGame(true); 
    });
    
    // Event Listener für Overlays (Klick auf Overlay schließt)
    
    // Detailansicht
    imageDetailOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'image-detail-overlay' || e.target.id === 'detail-content' || e.target.id === 'detail-image') {
            imageDetailOverlay.classList.remove('active');
        }
    });

    // History-Overlay
    historyOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'history-overlay') {
            historyOverlay.classList.remove('active');
        }
    });

    // End-Galerie Button
    closeGalleryButton.addEventListener('click', () => {
        galleryOverlay.classList.remove('active');
        setupGame(true);
    });
    
    // History anzeigen
    showHistoryBtn.addEventListener('click', showHistory);
    
    // Theme-Wechsel-Logik
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
