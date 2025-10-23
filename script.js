const memoryGrid = document.querySelector('.memory-grid');
const statsMoves = document.getElementById('moves');
const statsPairsFound = document.getElementById('pairs-found');
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const galleryOverlay = document.getElementById('gallery-overlay');
const closeGalleryButton = document.getElementById('close-gallery');
const themeButtons = document.querySelectorAll('.theme-button');
const galleryImagesContainer = document.getElementById('gallery-images'); // (Nicht mehr primär für Galerie verwendet)

// NEUE DOM-Elemente
const permanentGallery = document.getElementById('permanent-gallery');
const imageDetailOverlay = document.getElementById('image-detail-overlay');
const detailImage = document.getElementById('detail-image');
const closeDetailButton = document.getElementById('close-detail');

// ... (Restliche Konstanten und Variablen bleiben unverändert) ...
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
const BASE_URL = 'https://xanderfoxy.github.io/MemorySpiel/Bilder/';

// ... (shuffleArray, selectRandomImagePaths, generateNumberedPaths, IN_ITALIEN_FILES, gameConfigs bleiben unverändert) ...

// Hilfsfunktion zur Verwaltung der Favoriten im Local Storage
function getFavorites() {
    try {
        const favorites = localStorage.getItem('memoryFavorites');
        return favorites ? JSON.parse(favorites) : [];
    } catch (e) {
        console.error("Fehler beim Lesen der Favoriten aus localStorage:", e);
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem('memoryFavorites', JSON.stringify(favorites));
    } catch (e) {
        console.error("Fehler beim Speichern der Favoriten in localStorage:", e);
    }
}

// Funktion, um das Galerie-Element zu erstellen
function createGalleryItem(imageSrc, isFavorite = false) {
    const item = document.createElement('div');
    item.classList.add('gallery-item');
    item.dataset.src = imageSrc;
    item.title = "Klicken für Großansicht";

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Gefundenes Bild';
    item.appendChild(img);

    const icon = document.createElement('span');
    icon.classList.add('favorite-icon', 'fas', 'fa-heart');
    if (isFavorite) {
        icon.classList.add('active');
    }

    // Event Listener für Favoriten-Funktion
    icon.addEventListener('click', (e) => {
        e.stopPropagation(); // Verhindert, dass das Großansicht-Overlay geöffnet wird
        toggleFavorite(imageSrc, icon);
    });
    
    // Event Listener für Großansicht
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
        // Nicht Favorit -> Hinzufügen
        favorites.push(imageSrc);
        iconElement.classList.add('active');
        console.log("Bild zu Favoriten hinzugefügt.");
    } else {
        // Ist Favorit -> Entfernen
        favorites.splice(index, 1);
        iconElement.classList.remove('active');
        console.log("Bild aus Favoriten entfernt.");
    }
    saveFavorites(favorites);
}

function showImageDetail(imageSrc) {
    detailImage.src = imageSrc;
    imageDetailOverlay.classList.add('active');
}

closeDetailButton.addEventListener('click', () => {
    imageDetailOverlay.classList.remove('active');
});


function setupGame() {
    // ... (Setup-Logik bleibt unverändert, löscht nur das Grid) ...
    memoryGrid.innerHTML = '';
    cards = [];
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    moves = 0;
    pairsFound = 0;
    matchedImages = []; 
    
    // ... (Overlays verstecken, Stats setzen, Grid-Styling setzen) ...

    // Fülle die Galerie mit Favoriten am Start des Spiels (damit Favoriten immer da sind)
    loadPermanentGallery();
    
    // ... (Bilder- und Karten-Erstellungs-Logik bleibt unverändert) ...
    // ... (Wenn das Grid erstellt wurde)
    cards.forEach(card => card.addEventListener('click', flipCard));
}

function loadPermanentGallery() {
    permanentGallery.innerHTML = '';
    const favorites = getFavorites();
    
    // Anzeigen der Favoriten (falls vorhanden)
    if (favorites.length > 0) {
        const title = document.createElement('h3');
        title.textContent = "Deine Favoriten (Alle Spiele)";
        title.style.margin = "10px 0";
        title.style.color = "var(--secondary-color)";
        permanentGallery.appendChild(title);

        const favContainer = document.createElement('div');
        favContainer.style.display = 'flex';
        favContainer.style.overflowX = 'auto';
        favContainer.style.paddingBottom = '10px';
        favContainer.style.gap = '15px';
        
        favorites.forEach(src => {
            // Favoriten werden als Favoriten angezeigt
            favContainer.appendChild(createGalleryItem(src, true)); 
        });
        permanentGallery.appendChild(favContainer);
    } else {
         const message = document.createElement('p');
         message.textContent = "Finde ein Paar und füge es zu deinen Favoriten hinzu (Herz-Symbol)!";
         message.style.marginTop = '10px';
         message.style.color = 'rgba(255, 255, 255, 0.7)';
         permanentGallery.appendChild(message);
    }
}

// Funktion, die ein gefundenes Bild zur permanenten Galerie hinzufügt
function updatePermanentGallery(imageSrc) {
    const favorites = getFavorites();
    const isFavorite = favorites.includes(imageSrc);
    
    // Lösche und lade die Galerie neu, um Duplikate zu vermeiden
    loadPermanentGallery();
}

function disableCards() {
    pairsFound++;
    statsPairsFound.textContent = `Gefunden: ${pairsFound}`;
    soundMatch.play();
    
    // KORREKTUR: Karten bleiben permanent offen (durch die 'flip' und 'match' Klassen)
    firstCard.classList.add('match', 'flip');
    secondCard.classList.add('match', 'flip');
    
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const matchedImageSrc = firstCard.querySelector('.front-face img').src;
    
    showMatchSuccess(matchedImageSrc);
    
    // Füge das Bild zur permanenten Galerie hinzu, nachdem das Overlay weg ist
    setTimeout(() => {
        // Bild zur aktuellen Spiel-Galerie hinzufügen (optional, falls Sie das noch brauchen)
        matchedImages.push(matchedImageSrc); 
        
        // Füge das Bild zur permanenten Anzeige hinzu (visueller Effekt der Füllung)
        // Hinweis: Wir verwenden hier die Load-Funktion, um Konsistenz mit Favoriten zu gewährleisten.
        // Für eine echte "Flug-Animation" wäre deutlich komplexeres CSS/JS nötig.
        loadPermanentGallery(); 
    }, 1500);
    
    resetBoard(); 
    
    if (pairsFound === currentDifficulty.pairs) { 
        setTimeout(gameOver, 1000); 
    }
}

// ... (unflipCards, resetBoard, showMatchSuccess, gameOver, closeGalleryButton.addEventListener bleiben unverändert) ...

document.addEventListener('DOMContentLoaded', () => {
    // ... (Initialisierung des Sliders und des Themes bleibt unverändert) ...
    setupGame();
});

