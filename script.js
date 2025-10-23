const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');

// Match Success Overlay Elemente
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');

// End-Galerie Elemente
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const galleryWinTitle = galleryOverlay.querySelector('h2');
const galleryImagesContainer = document.getElementById('gallery-images'); 
const animatedThumbnail = document.getElementById('animated-match-thumbnail');

// Theme und Schwierigkeit
const themeButtons = document.querySelectorAll('.theme-button');
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyDescription = document.getElementById('difficulty-description');

// Favoriten (Sidebar)
const permanentGallerySidebar = document.getElementById('permanent-gallery-sidebar');

// Kartenaufsteller (Main Content)
const dailyMatchesTitle = document.getElementById('daily-matches-title');
const dailyMatchesGallery = document.getElementById('daily-matches-gallery'); 

// Detailansicht
const imageDetailOverlay = document.getElementById('image-detail-overlay');
const detailImage = document.getElementById('detail-image');
const closeDetailButton = document.getElementById('close-detail');

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

// Konfigurationen KORRIGIERT
const difficultyConfigs = {
    '1': { name: 'Leicht', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px' }, 
    '2': { name: 'Schwer', pairs: 18, columns: 6, cardsTotal: 36, gridMaxW: '780px' } 
};

let currentDifficulty = difficultyConfigs[difficultySlider.value]; 
const BASE_URL = 'Bilder/'; 
const CURRENT_GAME_STORAGE_KEY = 'memoryCurrentGame';

// --- DATENSTRUKTUREN ---
const IN_ITALIEN_FILES = [
    'InItalien/Al ven77.jpeg', 'InItalien/IMG_0051.jpeg', 'InItalien/IMG_0312.jpeg', 'InItalien/IMG_6917.jpeg',
    'InItalien/IMG_8499.jpeg', 'InItalien/IMG_9287.jpeg', 'InItalien/IMG_9332.jpeg', 'InItalien/IMG_9352.jpeg',
    'InItalien/IMG_9369.jpeg', 'InItalien/IMG_9370.jpeg', 'InItalien/IMG_9470.jpeg', 'InItalien/IMG_9480.jpeg',
    'InItalien/IMG_9592.jpeg', 'InItalien/IMG_9593.jpeg', 'InItalien/IMG_9594.jpeg', 'InItalien/IMG_9597.jpeg',
    'InItalien/IMG_9598.jpeg', 'InItalien/IMG_9599.jpeg', 'InItalien/QgNsMtTA.jpeg', 
    'InItalien/extra1.jpeg', 'InItalien/extra2.jpeg' 
];

// ... (BABYFOX_FILES und THROUGH_THE_YEARS_FILES bleiben unverändert, da sie funktionierten)
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
    
    // NEU: Detailansicht Klick
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
    
    // Favoriten-Sektion (Sidebar) - Text KORRIGIERT
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
    
    // Kartenaufsteller (Main Content)
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

// --- SPIELSTAND VERWALTUNG & UI ---

function saveCurrentGame() {
    if (!gameStarted) return; 
    
    // ... (Speicherlogik bleibt) ...
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

    // ... (UI-Elemente laden) ...
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
        
        // KORRIGIERT: Korrekte HTML-Struktur
        card.innerHTML = `
            <div class="front-face">
                <img src="${imageURL}" alt="Memory Bild">
            </div>
            <div class="back-face"></div>
        `;
        
        if (cardState.flipped) {
            card.classList.add('flip');
        }
        if (cardState.match) {
            card.classList.add('match');
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

        // KORRIGIERT: Korrekte HTML-Struktur
        card.innerHTML = `
            <div class="front-face">
                <img src="${imageURL}" alt="Memory Bild">
            </div>
            <div class="back-face"></div>
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
    
    firstCard.classList.add('match'); 
    secondCard.classList.add('match'); 
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImagePath = firstCard.dataset.path;
    const matchedImageSrc = `${BASE_URL}${matchedImagePath}`;
    
    matchedImages.push(matchedImagePath);
    
    // NEU: Pop-up zeigen und Animation starten
    showMatchSuccessAndAnimate(matchedImageSrc, matchedImagePath);
    
    saveCurrentGame();

    resetBoard(); 
    
    if (pairsFound === currentDifficulty.pairs) { 
        setTimeout(gameOver, 2000); 
    }
}

/**
 * Zeigt das Pop-up und startet die Animation in den Aufsteller.
 */
function showMatchSuccessAndAnimate(imageSrc, imagePath) {
    matchedImagePreview.src = imageSrc;
    matchSuccessOverlay.classList.add('active');
    
    // 1. Pop-up kurz anzeigen
    setTimeout(() => {
        matchSuccessOverlay.classList.remove('active'); 
        
        // Initialen Zustand für das Animations-Thumbnail setzen (Pop-up Größe und Position)
        const matchContent = matchSuccessOverlay.querySelector('.overlay-content');
        const matchRect = matchContent.getBoundingClientRect();
        const mainContentRect = document.querySelector('.main-content').getBoundingClientRect();
        
        animatedThumbnail.src = imageSrc;
        animatedThumbnail.classList.remove('hidden-by-default');
        
        // Startposition (Mitte des Pop-up-Overlays)
        animatedThumbnail.style.width = `${matchRect.width - 20}px`; // -Padding
        animatedThumbnail.style.height = `${matchRect.height - 20}px`; // -Padding
        animatedThumbnail.style.top = `${matchRect.top - mainContentRect.top}px`;
        animatedThumbnail.style.left = `${matchRect.left - mainContentRect.left}px`;
        animatedThumbnail.style.opacity = 1;
        animatedThumbnail.style.transition = 'all 0.8s cubic-bezier(0.5, 0.0, 0.5, 1.0)'; // Easing für Rutsch-Effekt

        // Warten, bis das Bild im Aufsteller ist
        loadPermanentGallery(); 
        const newTarget = dailyMatchesGallery.querySelector(`[data-path="${imagePath}"]`);
        
        if (newTarget) {
            const targetRect = newTarget.getBoundingClientRect();
            
            // 2. Animation auslösen (Ändern der Zielkoordinaten)
            const targetX = targetRect.left - mainContentRect.left;
            const targetY = targetRect.top - mainContentRect.top;

            animatedThumbnail.style.width = `${targetRect.width}px`; 
            animatedThumbnail.style.height = `${targetRect.height}px`; 
            animatedThumbnail.style.top = `${targetY}px`;
            animatedThumbnail.style.left = `${targetX}px`;
            animatedThumbnail.style.opacity = 0.8; 

            // 3. Aufräumen nach Animation
            setTimeout(() => {
                animatedThumbnail.classList.add('hidden-by-default');
            }, 800);
        } else {
             // Aufräumen, falls das Element nicht gefunden wird
             animatedThumbnail.classList.add('hidden-by-default');
        }

    }, 800); 
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

function gameOver() {
    soundWin.play();
    
    galleryWinTitle.classList.remove('hidden-by-default');
    
    // End-Galerie zeigen (Logik zur Befüllung)
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

// NEU: Detailansicht KORRIGIERT
function showImageDetail(fullSrc) {
    detailImage.src = fullSrc;
    imageDetailOverlay.classList.add('active');
}

closeDetailButton.addEventListener('click', () => {
    imageDetailOverlay.classList.remove('active');
});

// --- INITIALISIERUNG ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Initiales Styling für den Zurück-Link
    const backLink = document.querySelector('.back-link');
    if (backLink) {
        backLink.classList.add('theme-button'); 
    }

    // Lade initiales Spiel oder starte neues
    if (!loadCurrentGame()) {
        setupGame(true); 
    }
    
    // Event Listener für Theme-Buttons
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

    // Event Listener für Schwierigkeits-Slider
    difficultySlider.addEventListener('input', (e) => {
        const newDifficultyValue = e.target.value;
        currentDifficulty = difficultyConfigs[newDifficultyValue];
        difficultyDescription.textContent = `${currentDifficulty.name} (${currentDifficulty.pairs} Paare)`;
        
        setupGame(true); 
    });
    
    // Event Listener für "Neues Spiel" Button
    closeGalleryButton.addEventListener('click', () => {
        galleryOverlay.classList.remove('active');
        setupGame(true);
    });
    
    // ... (Weitere Event Listener wie History und Score-Logik folgen hier)
});
