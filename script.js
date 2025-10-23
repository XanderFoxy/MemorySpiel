const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const themeButtons = document.querySelectorAll('.theme-button');
const galleryImagesContainer = document.getElementById('gallery-images'); 

const permanentGallery = document.getElementById('permanent-gallery');
const dailyMatchesGallery = document.getElementById('daily-matches-gallery'); // NEU: Aufsteller für aktuelle Funde
const galleryInfo = document.querySelector('.gallery-info'); // NEU: Infotext

const imageDetailOverlay = document.getElementById('image-detail-overlay');
const detailImage = document.getElementById('detail-image');
const closeDetailButton = document.getElementById('close-detail');

const difficultySlider = document.getElementById('difficulty-slider');
const difficultyDescription = document.getElementById('difficulty-description');

const dailyScoreSpan = document.getElementById('daily-score'); // NEU
const showHistoryBtn = document.getElementById('show-history-btn'); // NEU
const historyOverlay = document.getElementById('history-overlay'); // NEU
const closeHistoryBtn = document.getElementById('close-history'); // NEU
const historyList = document.getElementById('history-list'); // NEU

const soundMatch = document.getElementById('sound-match');
const soundError = document.getElementById('sound-error');
const soundWin = document.getElementById('sound-win');

let cards = [];
let hasFlippedCard = false; 
let lockBoard = false; 
let firstCard, secondCard; 
let moves = 0;
let pairsFound = 0;
let matchedImages = []; 
let currentTheme = 'Gemixt'; // Speichert den Namen des aktuellen Themas

const difficultyConfigs = {
    '1': { name: 'Leicht', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px' }, 
    '2': { name: 'Schwer', pairs: 18, columns: 6, cardsTotal: 36, gridMaxW: '780px' } 
};

let currentDifficulty = difficultyConfigs[difficultySlider.value]; 
const BASE_URL = 'Bilder/'; 
const CURRENT_GAME_STORAGE_KEY = 'memoryCurrentGame';
const DAILY_SCORE_STORAGE_KEY = 'memoryDailyScore';
const HISTORY_STORAGE_KEY = 'memoryHistory';

// --- DATEN UND UTILITIES ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function selectRandomImagePaths(allPaths, count) {
    if (allPaths.length < count) {
        count = allPaths.length;
    }
    let shuffled = [...allPaths];
    shuffleArray(shuffled);
    return shuffled.slice(0, count);
}

function generateNumberedPaths(folderName, maxPossibleImages = 20) {
    let allNumbers = [];
    for (let i = 1; i <= maxPossibleImages; i++) {
        // Hier wird nur bis 20 generiert, selbst wenn mehr benötigt werden
        allNumbers.push(`${folderName}/${i}.jpg`);
    }
    return allNumbers;
}

// Pfade
const IN_ITALIEN_FILES = [
    'InItalien/Al ven77.jpeg', 'InItalien/IMG_0051.jpeg', 'InItalien/IMG_0312.jpeg', 'InItalien/IMG_6917.jpeg',
    'InItalien/IMG_8499.jpeg', 'InItalien/IMG_9287.jpeg', 'InItalien/IMG_9332.jpeg', 'InItalien/IMG_9352.jpeg',
    'InItalien/IMG_9369.jpeg', 'InItalien/IMG_9370.jpeg', 'InItalien/IMG_9470.jpeg', 'InItalien/IMG_9480.jpeg',
    'InItalien/IMG_9592.jpeg', 'InItalien/IMG_9593.jpeg', 'InItalien/IMG_9594.jpeg', 'InItalien/IMG_9597.jpeg',
    'InItalien/IMG_9598.jpeg', 'InItalien/IMG_9599.jpeg', 'InItalien/QgNsMtTA.jpeg', 
    'InItalien/extra1.jpeg', 'InItalien/extra2.jpeg' // Mindestens 20 für 18 Paare
];

const BABYFOX_FILES = [
    'BabyFox/01292D1E-FB2F-423E-B43C-EFFC54B7DDA8.png', 
    'BabyFox/9978574A-F56F-4AFF-9C68-490AE67EB5DA.png', 
    'BabyFox/IMG_0688.jpeg', 
    'BabyFox/Photo648578813890.1_inner_0-0-749-0-0-1000-749-1000.jpeg', 
    'BabyFox/Photo648581525823_inner_46-11-953-11-46-705-953-705.jpeg',
    ...generateNumberedPaths('BabyFox', 20)
];

const THROUGH_THE_YEARS_FILES = generateNumberedPaths('ThroughTheYears', 20);

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

function showImageDetail(imageSrc) {
    detailImage.src = imageSrc;
    imageDetailOverlay.classList.add('active');
}

if (closeDetailButton) {
    closeDetailButton.addEventListener('click', () => {
        imageDetailOverlay.classList.remove('active');
    });
}

function loadPermanentGallery() {
    permanentGallery.innerHTML = '';
    const favorites = getFavorites();
    
    // Infotext nur anzeigen, wenn keine Favoriten da sind
    if (favorites.length === 0) {
         galleryInfo.style.display = 'block';
    } else {
        galleryInfo.style.display = 'none';
        favorites.forEach(path => {
            // Favoriten: mit Herz
            permanentGallery.appendChild(createGalleryItem(path, true, true)); 
        });
    }
    
    // Anzeigen der tagesaktuellen Funde (Aufsteller)
    dailyMatchesGallery.innerHTML = '';
    const uniqueMatchedImages = [...new Set(matchedImages)];
    uniqueMatchedImages.forEach(path => {
        // Tagesfund: ohne Herz, da Favoriten-Galerie schon da ist
        dailyMatchesGallery.appendChild(createGalleryItem(path, false, false));
    });
    
    // Verstecke den Aufsteller, wenn er leer ist
    dailyMatchesGallery.style.display = uniqueMatchedImages.length > 0 ? 'flex' : 'none';
}

// --- SPIELSTAND VERWALTUNG (Neu) ---

function getCurrentDateString() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getDailyScore() {
    const today = getCurrentDateString();
    let score = JSON.parse(localStorage.getItem(DAILY_SCORE_STORAGE_KEY) || '{}');
    if (!score[today]) {
        score[today] = 0;
    }
    return score;
}

function updateDailyScore(gamesWon = 0) {
    const today = getCurrentDateString();
    let score = getDailyScore();
    score[today] = (score[today] || 0) + gamesWon;
    localStorage.setItem(DAILY_SCORE_STORAGE_KEY, JSON.stringify(score));
    dailyScoreSpan.textContent = `Heute: ${score[today]} Spiel${score[today] === 1 ? '' : 'e'}`;
}

function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
}

function saveGameToHistory() {
    const history = getHistory();
    const gameResult = {
        date: new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' }),
        theme: currentThemeConfig.name,
        difficulty: currentDifficulty.name,
        moves: moves,
        pairsFound: pairsFound,
        totalPairs: currentDifficulty.pairs,
        images: [...new Set(matchedImages)], // Nur die gefundenen Pfade
        won: pairsFound === currentDifficulty.pairs
    };
    history.unshift(gameResult); // Fügt das neueste Ergebnis vorne hinzu
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 50))); // Speichert max. 50 Spiele
}

function saveCurrentGame() {
    const gameState = {
        theme: currentTheme,
        difficulty: difficultySlider.value,
        moves: moves,
        pairsFound: pairsFound,
        matchedImages: matchedImages,
        gridHTML: memoryGrid.innerHTML,
        cardsData: cards.map(card => ({ // Speichert den Zustand jeder Karte
            path: card.dataset.path,
            classList: Array.from(card.classList),
            flipped: card.classList.contains('flip') 
        }))
    };
    localStorage.setItem(CURRENT_GAME_STORAGE_KEY, JSON.stringify(gameState));
}

function loadCurrentGame() {
    const gameState = JSON.parse(localStorage.getItem(CURRENT_GAME_STORAGE_KEY));
    if (!gameState || gameState.theme !== currentTheme) return false;

    // UI-Elemente laden
    currentDifficulty = difficultyConfigs[gameState.difficulty];
    difficultySlider.value = gameState.difficulty;
    difficultyDescription.textContent = `${currentDifficulty.name} (${currentDifficulty.pairs} Paare)`;
    statsMoves.textContent = `Züge: ${gameState.moves}`;
    statsPairsFound.textContent = `Gefunden: ${gameState.pairsFound}`;

    // Variablen laden
    moves = gameState.moves;
    pairsFound = gameState.pairsFound;
    matchedImages = gameState.matchedImages;

    // Grid laden
    memoryGrid.innerHTML = gameState.gridHTML;
    cards = Array.from(memoryGrid.querySelectorAll('.memory-card'));
    
    // Zustand der Karten wiederherstellen
    cards.forEach((card, index) => {
        const cardState = gameState.cardsData[index];
        // Klassen wiederherstellen
        card.className = cardState.classList.join(' ');
        
        // Event Listener neu zuweisen
        if (!card.classList.contains('match')) {
            card.addEventListener('click', flipCard);
        }
    });

    loadPermanentGallery();
    
    // Status zurücksetzen (keine Karten aktiv)
    resetBoard();
    
    return true;
}

// --- SPIELLOGIK ---

difficultySlider.addEventListener('input', (e) => {
    currentDifficulty = difficultyConfigs[e.target.value];
    const name = e.target.value === '2' ? 'Schwer' : 'Leicht';
    const pairs = e.target.value === '2' ? 18 : 8;
    difficultyDescription.textContent = `${name} (${pairs} Paare)`;
});

difficultySlider.addEventListener('change', () => {
    // Wenn Schwierigkeit geändert wird, starte neues Spiel (vorherigen Stand verwerfen)
    localStorage.removeItem(CURRENT_GAME_STORAGE_KEY);
    setupGame(); 
});

themeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const newTheme = e.target.dataset.theme;
        
        // Aktuelles Spiel speichern, bevor das Thema gewechselt wird
        if (cards.length > 0 && pairsFound < currentDifficulty.pairs) {
            saveCurrentGame();
        }
        
        // Neues Thema setzen
        currentTheme = newTheme;
        currentThemeConfig = gameConfigs[newTheme];
        
        themeButtons.forEach(btn => btn.classList.remove('active-theme'));
        e.target.classList.add('active-theme');
        
        // Versuchen, den gespeicherten Stand des neuen Themas zu laden, sonst neues Spiel starten
        if (!loadCurrentGame()) {
            setupGame();
        }
    });
});


function setupGame(isNewGame = true) {
    if (isNewGame) {
        localStorage.removeItem(CURRENT_GAME_STORAGE_KEY); // Vorheriges Spiel endgültig löschen
    }
    
    memoryGrid.innerHTML = '';
    cards = [];
    moves = 0;
    pairsFound = 0;
    matchedImages = []; 
    
    resetBoard();
    matchSuccessOverlay.classList.remove('active');
    galleryOverlay.classList.remove('active');
    
    const MAX_PAIRS = currentDifficulty.pairs; 
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;
    
    // Grid-Styling anwenden
    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    let selectedPaths = [];
    
    if (currentThemeConfig.name === 'Gemixt') {
        let allPaths = [
            ...BABYFOX_FILES, 
            ...THROUGH_THE_YEARS_FILES, 
            ...IN_ITALIEN_FILES
        ];
        selectedPaths = selectRandomImagePaths(allPaths, MAX_PAIRS);

    } else if (currentThemeConfig.allImagePaths) {
        selectedPaths = selectRandomImagePaths(currentThemeConfig.allImagePaths, MAX_PAIRS);
    }
    
    if (selectedPaths.length === 0 || selectedPaths.length < MAX_PAIRS) {
        const pathCount = selectedPaths.length;
        console.error(`FEHLER: Nur ${pathCount} einzigartige Bilder gefunden. Benötigt: ${MAX_PAIRS}`);
        memoryGrid.innerHTML = `<p style="color:var(--secondary-color); grid-column: 1 / -1; text-align: center;">FEHLER: Konnte nicht genügend Bilder (${pathCount}/${MAX_PAIRS}) laden. Prüfe die Pfade im Ordner "${currentThemeConfig.name}"!</p>`;
        return;
    }

    let gameCardValues = []; 
    selectedPaths.forEach(fullPath => {
        gameCardValues.push(fullPath, fullPath); 
    });
    
    shuffleArray(gameCardValues);

    gameCardValues.forEach(fullPath => { 
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.path = fullPath; 
        
        const imageURL = `${BASE_URL}${fullPath}`; 

        card.innerHTML = `
            <div class="front-face">
                <img src="${imageURL}" alt="Memory Bild">
            </div>
            <span class="back-face">🦊</span>
        `;
        
        card.addEventListener('click', flipCard); 
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });
    
    loadPermanentGallery(); // Initialer Load der Galerien
}


function flipCard() {
    // Wenn eine Karte in einem **neuen Spiel** angeklickt wird, lösche den alten Pausen-Stand
    if (cards.length > 0 && moves === 0 && pairsFound === 0) {
         localStorage.removeItem(CURRENT_GAME_STORAGE_KEY);
    }

    if (lockBoard) return;
    if (this === firstCard) return; 
    if (this.classList.contains('match')) return; 

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        firstCard.classList.add('waiting'); // NEU: Orange/Gelber Warte-Status
        return;
    }
    
    secondCard = this;
    firstCard.classList.remove('waiting'); // Warte-Status entfernen
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
    
    firstCard.classList.add('match'); 
    secondCard.classList.add('match'); 
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImagePath = firstCard.dataset.path;
    const matchedImageSrc = `${BASE_URL}${matchedImagePath}`;
    
    matchedImages.push(matchedImagePath);
    showMatchSuccess(matchedImageSrc, matchedImagePath);

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
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    
    // "Waiting" Klasse von der ersten Karte entfernen, falls der Fehlerfall eintritt
    if (firstCard) {
        firstCard.classList.remove('waiting');
    }

    [firstCard, secondCard] = [null, null];
}

function showMatchSuccess(imageSrc, imagePath) {
    matchedImagePreview.src = imageSrc;
    matchSuccessOverlay.classList.add('active');
    
    setTimeout(() => {
        matchSuccessOverlay.classList.remove('active'); 
        // WICHTIG: Das Bild erst in die Galerie legen, NACHDEM das Popup weg ist
        loadPermanentGallery();
    }, 1500);
}

function gameOver() {
    soundWin.play();
    
    // Score speichern
    updateDailyScore(1); 
    saveGameToHistory(); 
    localStorage.removeItem(CURRENT_GAME_STORAGE_KEY); // Endgültiger Abschluss

    galleryImagesContainer.innerHTML = '';
    const favorites = getFavorites();

    // Alle gefundenen Bilder anzeigen (aus dem gesamten Spiel)
    const uniqueMatchedImages = [...new Set(matchedImages)];
    uniqueMatchedImages.forEach(path => {
        // Erstellt das Galerie-Item, nun mit korrekter, proportionaler Darstellung
        const item = createGalleryItem(path, favorites.includes(path), true);
        galleryImagesContainer.appendChild(item);
    });
    
    galleryOverlay.classList.add('active');
}

closeGalleryButton.addEventListener('click', () => {
    galleryOverlay.classList.remove('active');
    setupGame(true); // Starte wirklich ein neues Spiel
});

// --- VERLAUF-LOGIK (Neu) ---

showHistoryBtn.addEventListener('click', () => {
    renderHistory();
    historyOverlay.classList.add('active');
});

closeHistoryBtn.addEventListener('click', () => {
    historyOverlay.classList.remove('active');
});

function renderHistory() {
    historyList.innerHTML = '';
    const history = getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="color: white;">Noch keine Spiele abgeschlossen.</p>';
        return;
    }
    
    history.forEach(game => {
        const item = document.createElement('div');
        item.classList.add('history-item');
        item.style.backgroundColor = game.won ? 'rgba(56, 199, 56, 0.1)' : 'rgba(255, 56, 56, 0.1)';
        item.style.border = `1px solid ${game.won ? 'var(--match-color)' : 'var(--error-color)'}`;
        item.style.padding = '15px';
        item.style.marginBottom = '10px';
        item.style.borderRadius = '8px';
        
        item.innerHTML = `
            <p><strong>Datum:</strong> ${game.date}</p>
            <p><strong>Thema:</strong> ${game.theme}</p>
            <p><strong>Schwierigkeit:</strong> ${game.difficulty} (${game.totalPairs} Paare)</p>
            <p><strong>Ergebnis:</strong> ${game.won ? 'Gewonnen! 🥳' : 'Nicht gewonnen 😔'}</p>
            <p><strong>Züge:</strong> ${game.moves}</p>
            <div class="history-images" style="display: flex; gap: 5px; overflow-x: auto; margin-top: 10px;">
                ${game.images.map(path => `<div class="gallery-item" style="width: 50px; height: 50px;">
                    <img src="${BASE_URL}${path}" style="object-fit: contain;">
                </div>`).join('')}
            </div>
        `;
        
        historyList.appendChild(item);
    });
}

// --- INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => {
    // Tages-Score initialisieren/anzeigen
    updateDailyScore(0);
    
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
});
