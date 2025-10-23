const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const themeButtons = document.querySelectorAll('.theme-button');
const galleryImagesContainer = document.getElementById('gallery-images'); 

// NEUE DOM-Elemente für Galerie/Favoriten
const permanentGalleryContainer = document.getElementById('permanent-gallery-container');
const permanentGallery = document.getElementById('permanent-gallery'); // Der tatsächliche Halter
const imageDetailOverlay = document.getElementById('image-detail-overlay');
const detailImage = document.getElementById('detail-image');
const closeDetailButton = document.getElementById('close-detail');

const difficultySlider = document.getElementById('difficulty-slider');
const difficultyDescription = document.getElementById('difficulty-description');

const soundMatch = document.getElementById('sound-match');
const soundError = document.getElementById('sound-error');
const soundWin = document.getElementById('sound-win');

let cards = [];
let hasFlippedCard = false; 
let lockBoard = false; 
let firstCard, secondCard; 
let moves = 0;
let pairsFound = 0;
let matchedImages = []; // Aktuell gesammelte Bilder dieses Spiels

const difficultyConfigs = {
    '1': { name: 'Leicht', pairs: 8, columns: 4, cardsTotal: 16, gridMaxW: '520px' }, 
    '2': { name: 'Schwer', pairs: 18, columns: 6, cardsTotal: 36, gridMaxW: '780px' } 
};

let currentDifficulty = difficultyConfigs[difficultySlider.value]; 
const BASE_URL = 'Bilder/'; 

// --- Datenstrukturen (KORRIGIERT FÜR BABYFOX) ---

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
        allNumbers.push(`${folderName}/${i}.jpg`);
    }
    return allNumbers;
}

const BABYFOX_FILES = [
    'BabyFox/01292D1E-FB2F-423E-B43C-EFFC54B7DDA8.png', 
    'BabyFox/9978574A-F56F-4AFF-9C68-490AE67EB5DA.png', 
    'BabyFox/IMG_0688.jpeg', 
    'BabyFox/Photo648578813890.1_inner_0-0-749-0-0-1000-749-1000.jpeg', 
    'BabyFox/Photo648581525823_inner_46-11-953-11-46-705-953-705.jpeg',
    ...generateNumberedPaths('BabyFox', 20)
];

const IN_ITALIEN_FILES = [
    'InItalien/Al ven77.jpeg', 'InItalien/IMG_0051.jpeg', 'InItalien/IMG_0312.jpeg', 'InItalien/IMG_6917.jpeg',
    'InItalien/IMG_8499.jpeg', 'InItalien/IMG_9287.jpeg', 'InItalien/IMG_9332.jpeg', 'InItalien/IMG_9352.jpeg',
    'InItalien/IMG_9369.jpeg', 'InItalien/IMG_9370.jpeg', 'InItalien/IMG_9470.jpeg', 'InItalien/IMG_9480.jpeg',
    'InItalien/IMG_9592.jpeg', 'InItalien/IMG_9593.jpeg', 'InItalien/IMG_9594.jpeg', 'InItalien/IMG_9597.jpeg',
    'InItalien/IMG_9598.jpeg', 'InItalien/IMG_9599.jpeg', 'InItalien/QgNsMtTA.jpeg' 
];

const gameConfigs = {
    'InItalien': { allImagePaths: IN_ITALIEN_FILES, name: 'InItalien' },
    'BabyFox': { allImagePaths: BABYFOX_FILES, name: 'BabyFox' }, 
    'ThroughTheYears': { allImagePaths: generateNumberedPaths('ThroughTheYears', 20), name: 'ThroughTheYears' },
    'Gemixt': { name: 'Gemixt' }
};

let currentThemeConfig = gameConfigs['Gemixt']; 

// --- FAVORITEN UND GALERIE LOGIK (Wieder eingefügt und korrigiert) ---

function getFavorites() {
    try {
        const favorites = localStorage.getItem('memoryFavorites');
        // Filtert Duplikate und leere Einträge
        return favorites ? [...new Set(JSON.parse(favorites).filter(Boolean))] : []; 
    } catch (e) {
        console.error("Fehler beim Lesen der Favoriten aus localStorage:", e);
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem('memoryFavorites', JSON.stringify([...new Set(favorites)]));
    } catch (e) {
        console.error("Fehler beim Speichern der Favoriten in localStorage:", e);
    }
}

function createGalleryItem(imageSrc, isFavorite = false) {
    const item = document.createElement('div');
    item.classList.add('gallery-item');
    item.dataset.src = imageSrc;
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Gefundenes Bild';
    item.appendChild(img);

    const icon = document.createElement('span');
    icon.classList.add('favorite-icon', 'fas', 'fa-heart');
    if (isFavorite) {
        icon.classList.add('active');
    }

    icon.addEventListener('click', (e) => {
        e.stopPropagation(); 
        toggleFavorite(imageSrc, icon);
    });
    
    item.addEventListener('click', () => {
        showImageDetail(imageSrc);
    });

    item.appendChild(icon);
    return item;
}

function toggleFavorite(imageSrc, iconElement) {
    let favorites = getFavorites();
    const index = favorites.indexOf(imageSrc);

    if (index === -1) {
        favorites.push(imageSrc);
        iconElement.classList.add('active');
    } else {
        favorites.splice(index, 1);
        iconElement.classList.remove('active');
    }
    saveFavorites(favorites);
    // Lade Galerie neu, um die Änderung zu reflektieren (besonders bei "Alle" Ansicht)
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
    
    // Anzeigen der Favoriten (falls vorhanden)
    if (favorites.length > 0) {
        favorites.forEach(src => {
            permanentGallery.appendChild(createGalleryItem(src, true)); 
        });
    } else {
         const message = document.createElement('p');
         message.textContent = "Deine Favoriten erscheinen hier, sobald du Bilder markierst.";
         message.style.marginTop = '10px';
         message.style.color = 'var(--primary-color)';
         permanentGallery.appendChild(message);
    }
}

// --- SPIELLOGIK (Mit Galerie-Integration) ---

// ... (Slider- und Theme-Event-Listener bleiben unverändert) ...

function setupGame() {
    memoryGrid.innerHTML = '';
    cards = [];
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    moves = 0;
    pairsFound = 0;
    matchedImages = []; 
    
    matchSuccessOverlay.classList.remove('active');
    galleryOverlay.classList.remove('active');
    
    const MAX_PAIRS = currentDifficulty.pairs; 
    
    statsMoves.textContent = `Züge: ${moves}`;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;

    memoryGrid.style.gridTemplateColumns = `repeat(${currentDifficulty.columns}, 1fr)`;
    memoryGrid.style.maxWidth = currentDifficulty.gridMaxW; 

    let selectedPaths = [];
    
    if (currentThemeConfig.name === 'Gemixt') {
        const allPaths = [];
        ['BabyFox', 'ThroughTheYears', 'InItalien'].forEach(folderName => {
             const config = gameConfigs[folderName];
             if (config && config.allImagePaths) {
                 allPaths.push(...config.allImagePaths);
             }
        });
        selectedPaths = selectRandomImagePaths(allPaths, MAX_PAIRS);

    } else if (currentThemeConfig.allImagePaths) {
        selectedPaths = selectRandomImagePaths(currentThemeConfig.allImagePaths, MAX_PAIRS);
    }
    
    if (selectedPaths.length === 0 || selectedPaths.length < MAX_PAIRS) {
        console.error(`Fehler: Konnte nicht genügend Bilder (${selectedPaths.length}) für das Spiel laden. Pfade prüfen!`);
        memoryGrid.innerHTML = '<p style="color:red; grid-column: 1 / -1; text-align: center;">FEHLER: Konnte nicht genügend Bilder laden. Thema oder Pfade prüfen!</p>';
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
            <img class="front-face" src="${imageURL}" alt="Memory Bild">
            <span class="back-face">🦊</span>
        `;
        
        memoryGrid.appendChild(card);
        cards.push(card);
    });
    
    cards.forEach(card => card.addEventListener('click', flipCard));
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; 
    if (this.classList.contains('match')) return; 

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    
    secondCard = this;
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
    
    // Karten bleiben offen (match und flip)
    firstCard.classList.add('match', 'flip'); 
    secondCard.classList.add('match', 'flip'); 
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImageSrc = firstCard.querySelector('.front-face img').src;
    
    showMatchSuccess(matchedImageSrc);
    
    // Füge das Bild zur Galerie hinzu, nachdem das Overlay weg ist (Simulation der Animation)
    setTimeout(() => {
        // Füge das gefundene Bild zur Favoritenliste hinzu, wenn es noch nicht da ist
        let favorites = getFavorites();
        if (!favorites.includes(matchedImageSrc)) {
             // Wichtig: Ich füge es nicht automatisch zu den Favoriten hinzu, 
             // sondern *zeige* es nur in der Galerie an. Da wir keine 
             // "aktuelle Spiel"-Galerie mehr haben, verwende ich loadPermanentGallery 
             // um die Favoriten anzuzeigen.
        }
        
        loadPermanentGallery(); 
    }, 1500);
    
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
    [firstCard, secondCard] = [null, null];
}

function showMatchSuccess(imageSrc) {
    matchedImagePreview.src = imageSrc;
    matchSuccessOverlay.classList.add('active');
    setTimeout(() => {
        matchSuccessOverlay.classList.remove('active');
    }, 1500);
}

function gameOver() {
    soundWin.play();
    // Zeigt die einfache "Glückwunsch" Overlay (kann entfernt werden, wenn nicht gewünscht)
    galleryOverlay.classList.add('active'); 
}

closeGalleryButton.addEventListener('click', () => {
    galleryOverlay.classList.remove('active');
    setupGame(); 
});


document.addEventListener('DOMContentLoaded', () => {
    const initialDifficulty = difficultyConfigs[difficultySlider.value];
    difficultyDescription.textContent = `${initialDifficulty.name} (${initialDifficulty.pairs} Paare)`;
    
    const initialThemeButton = document.querySelector('.theme-button[data-theme="Gemixt"]');
    if (initialThemeButton) {
        themeButtons.forEach(btn => btn.classList.remove('active-theme'));
        initialThemeButton.classList.add('active-theme');
    }
    currentThemeConfig = gameConfigs['Gemixt'];

    // Lade die Favoriten beim Start
    loadPermanentGallery();
    
    setupGame();
});
