const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');

// Match Success Overlay Elemente
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const matchSuccessTitle = matchSuccessOverlay.querySelector('h2');

// End-Galerie Elemente
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const galleryWinTitle = galleryOverlay.querySelector('h2');
const galleryImagesContainer = document.getElementById('gallery-images'); 

// Theme und Schwierigkeit
const themeButtons = document.querySelectorAll('.theme-button');
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyDescription = document.getElementById('difficulty-description');

// Favoriten (Sidebar)
const permanentGallerySidebar = document.getElementById('permanent-gallery-sidebar');
const galleryInfo = permanentGallerySidebar.querySelector('.gallery-info');

// Kartenaufsteller (Main Content)
const dailyMatchesContainer = document.getElementById('daily-matches-container');
const dailyMatchesTitle = document.getElementById('daily-matches-title');
const dailyMatchesGallery = document.getElementById('daily-matches-gallery'); 

// Detailansicht
const imageDetailOverlay = document.getElementById('image-detail-overlay');
const detailImage = document.getElementById('detail-image');
const closeDetailButton = document.getElementById('close-detail');

// Score und Verlauf
const dailyScoreSpan = document.getElementById('daily-score');
const showHistoryBtn = document.getElementById('show-history-btn');
const historyOverlay = document.getElementById('history-overlay');
const closeHistoryBtn = document.getElementById('close-history');
const historyList = document.getElementById('history-list');

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

// Konfigurationen
const difficultyConfigs = {
    '1': { name: 'Leicht', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px' }, 
    '2': { name: 'Schwer', pairs: 18, columns: 6, cardsTotal: 36, gridMaxW: '780px' } 
};

let currentDifficulty = difficultyConfigs[difficultySlider.value]; 
const BASE_URL = 'Bilder/'; 
const CURRENT_GAME_STORAGE_KEY = 'memoryCurrentGame';
const DAILY_SCORE_STORAGE_KEY = 'memoryDailyScore';
const HISTORY_STORAGE_KEY = 'memoryHistory';

// --- DATENSTRUKTUREN ---
const IN_ITALIEN_FILES = [
    'InItalien/Al ven77.jpeg', 'InItalien/IMG_0051.jpeg', 'InItalien/IMG_0312.jpeg', 'InItalien/IMG_6917.jpeg',
    'InItalien/IMG_8499.jpeg', 'InItalien/IMG_9287.jpeg', 'InItalien/IMG_9332.jpeg', 'InItalien/IMG_9352.jpeg',
    'InItalien/IMG_9369.jpeg', 'InItalien/IMG_9370.jpeg', 'InItalien/IMG_9470.jpeg', 'InItalien/IMG_9480.jpeg',
    'InItalien/IMG_9592.jpeg', 'InItalien/IMG_9593.jpeg', 'InItalien/IMG_9594.jpeg', 'InItalien/IMG_9597.jpeg',
    'InItalien/IMG_9598.jpeg', 'InItalien/IMG_9599.jpeg', 'InItalien/QgNsMtTA.jpeg', 
    'InItalien/extra1.jpeg', 'InItalien/extra2.jpeg' 
];

const BABYFOX_FILES = [
    'BabyFox/01292D1E-FB2F-423E-B43C-EFFC54B7DDA8.png', 
    'BabyFox/9978574A-F56F-4AFF-9C68-490AE67EB5DA.png', 
    'BabyFox/IMG_0688.jpeg', 
    'BabyFox/Photo648578813890.1_inner_0-0-749-0-0-1000-749-1000.jpeg', 
    'BabyFox/Photo648581525823_inner_46-11-953-11-46-705-953-705.jpeg',
    ...((folderName, maxPossibleImages = 20) => {
        let allNumbers = [];
        for (let i = 1; i <= maxPossibleImages; i++) {
            allNumbers.push(`${folderName}/${i}.jpg`);
        }
        return allNumbers;
    })('BabyFox', 20)
];

const THROUGH_THE_YEARS_FILES = ((folderName, maxPossibleImages = 20) => {
        let allNumbers = [];
        for (let i = 1; i <= maxPossibleImages; i++) {
            allNumbers.push(`${folderName}/${i}.jpg`);
        }
        return allNumbers;
    })('ThroughTheYears', 20);

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
        const favorites = localStorage.getItem('memoryFavorites');
        return favorites ? [...new Set(JSON.parse(favorites).filter(Boolean))] : []; 
    } catch (e) {
        console.error("Fehler beim Laden der Favoriten:", e);
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem('memoryFavorites', JSON.stringify([...new Set(favorites)]));
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
    
    // Favoriten-Sektion (Sidebar)
    if (favorites.length === 0) {
         // Nachricht, wenn keine Favoriten vorhanden
         const message = document.createElement('p');
         message.classList.add('gallery-info');
         message.textContent = "Markiere Bilder (❤️), um sie dauerhaft zu speichern.";
         message.style.color = 'var(--secondary-color)';
         permanentGallerySidebar.appendChild(message);
    } else {
        favorites.forEach(path => {
            permanentGallerySidebar.appendChild(createGalleryItem(path, true, true)); 
        });
    }
    
    // Kartenaufsteller (Main Content)
    dailyMatchesGallery.innerHTML = '';
    const uniqueMatchedImages = [...new Set(matchedImages)];
    
    if (uniqueMatchedImages.length > 0) {
        dailyMatchesTitle.classList.remove('hidden-by-default');
        uniqueMatchedImages.forEach(path => {
            // Tagesfund: ohne Herz
            dailyMatchesGallery.appendChild(createGalleryItem(path, false, false));
        });
    } else {
        dailyMatchesTitle.classList.add('hidden-by-default');
    }
}

// --- SPIELSTAND VERWALTUNG & UI ---

function saveCurrentGame() {
    if (!gameStarted) return; // Nur speichern, wenn das Spiel begonnen wurde
    
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

    // UI-Elemente und Variablen laden
    currentDifficulty = difficultyConfigs[gameState.difficulty];
    difficultySlider.value = gameState.difficulty;
    difficultyDescription.textContent = `${currentDifficulty.name} (${currentDifficulty.pairs} Paare)`;
    
    moves = gameState.moves;
    pairsFound = gameState.pairsFound;
    matchedImages = gameState.matchedImages;
    gameStarted = (moves > 0 || pairsFound > 0); 

    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    // Grid neu erstellen und Zustand wiederherstellen
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
        
        // Wichtig: Korrekte HTML-Struktur beibehalten!
        card.innerHTML = `
            <div class="front-face">
                <img src="${imageURL}" alt="Memory Bild">
            </div>
            <div class="back-face">🦊</div>
        `;
        
        if (cardState.flipped) {
            card.classList.add('flip');
        }
        if (cardState.match) {
            card.classList.add('match');
            // Gematche Karten haben keinen Listener mehr
        } else {
            card.addEventListener('click', flipCard);
        }
        
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
    
    // Grid-Styling anwenden
    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    // Bilderauswahl-Logik
    const MAX_PAIRS = currentDifficulty.pairs; 
    let selectedPaths = [];
    let allPaths = [];

    if (currentThemeConfig.name === 'Gemixt') {
        allPaths = [...BABYFOX_FILES, ...THROUGH_THE_YEARS_FILES, ...IN_ITALIEN_FILES];
    } else if (currentThemeConfig.allImagePaths) {
         allPaths = currentThemeConfig.allImagePaths;
    }
    
    // Shuffling und Auswahl
    if (allPaths.length < MAX_PAIRS) {
        memoryGrid.innerHTML = `<p style="color:var(--secondary-color); grid-column: 1 / -1; text-align: center;">FEHLER: Konnte nicht genügend Bilder (${allPaths.length}/${MAX_PAIRS}) laden.</p>`;
        return;
    }

    let shuffledPaths = [...allPaths];
    for (let i = shuffledPaths.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPaths[i], shuffledPaths[j]] = [shuffledPaths[j], shuffledPaths[i]];
    }
    selectedPaths = shuffledPaths.slice(0, MAX_PAIRS);

    let gameCardValues = []; 
    selectedPaths.forEach(fullPath => {
        gameCardValues.push(fullPath, fullPath); 
    });
    
    // Final Shuffle Array
    for (let i = gameCardValues.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameCardValues[i], gameCardValues[j]] = [gameCardValues[j], gameCardValues[i]];
    }

    gameCardValues.forEach(fullPath => { 
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.path = fullPath; 
        
        const imageURL = `${BASE_URL}${fullPath}`; 

        // KORRIGIERT: Korrekte HTML-Struktur für den 3D-Flip
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

// --- CORE SPIELLOGIK ---

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; 
    if (this.classList.contains('match')) return; 

    // Spielstart-Logik
    if (!gameStarted) {
         localStorage.removeItem(CURRENT_GAME_STORAGE_KEY);
         gameStarted = true;
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
    
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.path === secondCard.dataset.path;
    
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    pairsFound++;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;
    soundMatch.play();
    
    // Match-Klassen hinzufügen und Listener entfernen
    firstCard.classList.add('match'); 
    secondCard.classList.add('match'); 
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImagePath = firstCard.dataset.path;
    const matchedImageSrc = `${BASE_URL}${matchedImagePath}`;
    
    matchedImages.push(matchedImagePath);
    showMatchSuccess(matchedImageSrc); 
    
    saveCurrentGame();

    resetBoard(); 
    
    if (pairsFound === currentDifficulty.pairs) { 
        setTimeout(gameOver, 1000); 
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
        saveCurrentGame();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    if (firstCard) {
        firstCard.classList.remove('waiting');
    }
    [firstCard, secondCard] = [null, null];
}

function showMatchSuccess(imageSrc) {
    matchSuccessTitle.classList.remove('hidden-by-default'); // Zeigt "Volltreffer!"
    matchedImagePreview.src = imageSrc;
    matchSuccessOverlay.classList.add('active');
    
    setTimeout(() => {
        matchSuccessOverlay.classList.remove('active'); 
        matchSuccessTitle.classList.add('hidden-by-default'); // Blendet "Volltreffer!" wieder aus
        loadPermanentGallery(); // Aktualisiert den Aufsteller
    }, 1500);
}

function gameOver() {
    soundWin.play();
    
    // Speichert den Score und die Historie (Logik hier gekürzt, da sie nicht direkt kritisiert wurde)
    // ... updateDailyScore(); updateHistory(); ...

    galleryWinTitle.classList.remove('hidden-by-default'); // Zeigt "Glückwunsch! Alle Paare gefunden."
    
    galleryImagesContainer.innerHTML = '';
    const uniqueMatchedImages = [...new Set(matchedImages)];
    const favorites = getFavorites();
    
    uniqueMatchedImages.forEach(path => {
         galleryImagesContainer.appendChild(
             createGalleryItem(path, favorites.includes(path), true)
         );
    });

    galleryOverlay.classList.add('active');
    localStorage.removeItem(CURRENT_GAME_STORAGE_KEY);
    gameStarted = false;
}

// ... (Logik für Detailansicht, History, etc. hier der Kürze wegen ausgelassen, aber im Original beibehalten)

// --- INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialen Zustand setzen/laden
    const activeThemeButton = document.querySelector('.theme-button.active-theme');
    if (activeThemeButton) {
        currentTheme = activeThemeButton.dataset.theme;
        currentThemeConfig = gameConfigs[currentTheme];
    }

    // Versuchen, einen pausierten Spielstand zu laden
    if (!loadCurrentGame()) {
        // Starte neues Spiel, wenn kein Stand gefunden wird
        setupGame(true); 
    }
    
    // Event Listener für Theme-Buttons
    themeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const newTheme = e.target.dataset.theme;
            
            if (gameStarted && pairsFound < currentDifficulty.pairs) {
                saveCurrentGame(); // Speichere den laufenden Stand des alten Themas
            }
            
            currentTheme = newTheme;
            currentThemeConfig = gameConfigs[newTheme];
            
            themeButtons.forEach(btn => btn.classList.remove('active-theme'));
            e.target.classList.add('active-theme');
            
            if (!loadCurrentGame()) {
                setupGame(true); // Starte neues Spiel für das neue Thema
            }
        });
    });

    // Event Listener für Schwierigkeits-Slider
    difficultySlider.addEventListener('input', (e) => {
        const newDifficultyValue = e.target.value;
        currentDifficulty = difficultyConfigs[newDifficultyValue];
        difficultyDescription.textContent = `${currentDifficulty.name} (${currentDifficulty.pairs} Paare)`;
        
        // Startet sofort ein neues Spiel mit der neuen Schwierigkeit (löscht vorherigen Stand)
        setupGame(true); 
    });
    
    // Event Listener für "Neues Spiel" Button
    closeGalleryButton.addEventListener('click', () => {
        setupGame(true);
    });
    
    // ... (Detail- und History-Overlay Listener folgen hier) ...
});
