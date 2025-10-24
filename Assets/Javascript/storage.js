// ==============================================================================
// 📄 Storage.js - Logik für localStorage, Favoriten und Spielverlauf (History)
// ==============================================================================

const FAVORITES_STORAGE_KEY = 'memoryFavorites';
const HISTORY_STORAGE_KEY = 'memoryHistory';
const CURRENT_GAME_STORAGE_KEY = 'memoryCurrentGame';
const CURRENT_GAME_ID_KEY = 'memoryCurrentGameId'; 

/**
 * Erzeugt eine eindeutige ID für das aktuelle Spiel.
 */
function generateGameId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

/**
 * Holt die Favoriten aus dem LocalStorage.
 */
function getFavorites() {
    try {
        const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        // Set sorgt für Eindeutigkeit der Pfade
        return favorites ? [...new Set(JSON.parse(favorites).filter(Boolean))] : []; 
    } catch (e) {
        console.error("Fehler beim Laden der Favoriten:", e);
        return [];
    }
}

/**
 * Speichert die Favoriten im LocalStorage.
 */
function saveFavorites(favorites) {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...new Set(favorites)]));
    } catch (e) {
        console.error("Fehler beim Speichern der Favoriten:", e);
    }
}

/**
 * Fügt ein Bild zu den Favoriten hinzu oder entfernt es.
 */
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
    
    // UI-Update-Funktionen (aus UI.js) aufrufen
    if (typeof loadPermanentGallery === 'function') {
        loadPermanentGallery(); 
    }
    if (typeof updateDailyGalleryFavoriteStatus === 'function') {
         updateDailyGalleryFavoriteStatus(imagePath, index === -1);
    }
}

/**
 * Aktualisiert oder speichert den Spielverlauf (History).
 */
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
        // Ersetze unvollständiges Spiel, wenn Fortschritt gemacht wurde oder wenn Spiel abgeschlossen wird.
        if (!completed || (completed && !existingEntry.completed)) {
             history[existingIndex] = newEntry; 
        } 
    } else {
        history.push(newEntry);
    }
    
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}


// Exporte der Funktionen für das Spiel-Setup (in script.js genutzt)
function saveCurrentGame(cards, currentTheme, difficultyValue, moves, pairsFound, matchedImages, initialShuffleComplete) {
    const gameId = localStorage.getItem(CURRENT_GAME_ID_KEY) || generateGameId();
    
    // Prüfen, ob das Spiel noch läuft
    if (pairsFound === window.currentDifficulty.pairs) return; 
    
    const cardsState = Array.from(cards).map((card, index) => ({
        path: card.dataset.path,
        flipped: card.classList.contains('flip'),
        match: card.classList.contains('match'),
        position: index 
    }));

    const gameState = {
        id: gameId,
        theme: currentTheme,
        difficulty: difficultyValue,
        moves: moves,
        pairsFound: pairsFound,
        matchedImages: matchedImages,
        cardsData: cardsState,
        initialShuffleComplete: initialShuffleComplete 
    };
    localStorage.setItem(CURRENT_GAME_STORAGE_KEY, JSON.stringify(gameState));
    localStorage.setItem(CURRENT_GAME_ID_KEY, gameId);
}

function loadCurrentGameData() {
    const gameState = JSON.parse(localStorage.getItem(CURRENT_GAME_STORAGE_KEY));
    return gameState;
}

function clearCurrentGameData() {
    localStorage.removeItem(CURRENT_GAME_STORAGE_KEY); 
    localStorage.removeItem('initialShuffleComplete'); 
    localStorage.removeItem(CURRENT_GAME_ID_KEY);
}
