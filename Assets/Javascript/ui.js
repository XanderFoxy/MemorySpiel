// ==============================================================================
// 📄 UI.js - Logik für Galerien, Overlays, DOM-Elemente und Animationen
// ==============================================================================

const BASE_URL = 'Bilder/'; 

// Elemente aus Index.html, die hier manipuliert werden
const mainContent = document.querySelector('.main-content');
const permanentGallerySidebar = document.getElementById('permanent-gallery-sidebar');
const dailyMatchesGallery = document.getElementById('daily-matches-gallery'); 
const dailyMatchesTitle = document.getElementById('daily-matches-title');
const galleryOverlay = document.getElementById('gallery-overlay');
const galleryImagesContainer = document.getElementById('gallery-images'); 
const galleryWinTitle = galleryOverlay.querySelector('h2');
const matchSuccessOverlay = document.getElementById('match-success-overlay');
const matchedImagePreview = document.getElementById('matched-image-preview');
const animatedThumbnail = document.getElementById('animated-match-thumbnail');
const imageDetailOverlay = document.getElementById('image-detail-overlay');
const detailImage = document.getElementById('detail-image');


/**
 * Erstellt das DOM-Element für ein Galerie-Item.
 */
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
            // Funktion aus Storage.js aufrufen
            if (typeof toggleFavorite === 'function') {
                toggleFavorite(imagePath, icon);
            }
        });
        item.appendChild(icon);
    }
    
    item.addEventListener('click', () => {
        showImageDetail(fullSrc); 
    });

    return item;
}

/**
 * Lädt Favoriten in die Sidebar und gefundene Bilder in die Tagesgalerie.
 */
function loadPermanentGallery() {
    permanentGallerySidebar.innerHTML = '';
    // Funktion aus Storage.js aufrufen
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
    
    // Tagesgalerie (Kartenaufsteller) aktualisieren - benötigt matchedImages aus script.js
    dailyMatchesGallery.innerHTML = '';
    // Globaler Zugriff auf matchedImages (wird in script.js definiert)
    const uniqueMatchedImages = [...new Set(window.matchedImages || [])];
    
    if (uniqueMatchedImages.length > 0) {
        dailyMatchesTitle.classList.remove('hidden-by-default');
        uniqueMatchedImages.forEach(path => {
            dailyMatchesGallery.appendChild(createGalleryItem(path, favorites.includes(path), true));
        });
    } else {
        dailyMatchesTitle.classList.add('hidden-by-default'); 
    }
}

/**
 * Aktualisiert den Favoriten-Status im Kartenaufsteller (Tagesgalerie) nach einer Änderung.
 */
function updateDailyGalleryFavoriteStatus(imagePath, isNowFavorite) {
     const dailyItems = dailyMatchesGallery.querySelectorAll(`[data-path="${imagePath}"] .favorite-icon`);
     dailyItems.forEach(icon => {
         icon.classList[isNowFavorite ? 'add' : 'remove']('active');
     });
}

/**
 * Zeigt das Match Success Overlay und animiert das Bild zur Tagesgalerie.
 */
function showMatchSuccessAndAnimate(matchedImageSrc, matchedImagePath) {
    matchedImagePreview.src = matchedImageSrc;
    
    // ... (Logik zur Größenbestimmung des Popups bleibt hier) ...
    const mainContentRect = mainContent.getBoundingClientRect();
    const popupWidth = Math.min(mainContentRect.width * 0.4, 400);
    const popupHeight = Math.min(mainContentRect.height * 0.5, 400); 
    
    matchSuccessOverlay.style.width = `${popupWidth}px`;
    matchSuccessOverlay.style.height = `${popupHeight}px`;
    matchSuccessOverlay.style.top = `${(mainContentRect.height - popupHeight) / 2}px`;
    matchSuccessOverlay.style.left = `${(mainContentRect.width - popupWidth) / 2}px`;
    matchSuccessOverlay.classList.add('active');
    
    // ... (Animation Logik) ...
    setTimeout(() => {
        
        matchSuccessOverlay.classList.remove('active'); 
        
        const matchRect = matchSuccessOverlay.getBoundingClientRect(); 
        
        animatedThumbnail.src = matchedImageSrc;
        animatedThumbnail.classList.remove('hidden-by-default');
        animatedThumbnail.style.width = `${matchRect.width - 20}px`; 
        animatedThumbnail.style.height = `${matchRect.height - 20}px`; 
        animatedThumbnail.style.top = `${matchRect.top - mainContentRect.top + 10}px`; 
        animatedThumbnail.style.left = `${matchRect.left - mainContentRect.left + 10}px`;
        animatedThumbnail.style.opacity = 1;
        animatedThumbnail.style.transition = 'all 0.8s cubic-bezier(0.5, 0.0, 0.5, 1.0)';

        loadPermanentGallery(); // Aktualisiert die Galerien vor der Animation

        const newTarget = dailyMatchesGallery.querySelector(`[data-path="${matchedImagePath}"]`);
        
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

/**
 * Zeigt die End-Galerie an (Game Over).
 */
function showGameOverGallery(matchedImages) {
    // Funktion aus Storage.js aufrufen
    const favorites = getFavorites(); 

    galleryWinTitle.classList.remove('hidden-by-default');
    
    galleryImagesContainer.innerHTML = '';
    const uniqueMatchedImages = [...new Set(matchedImages)];
    
    uniqueMatchedImages.forEach(path => {
         galleryImagesContainer.appendChild(
             createGalleryItem(path, favorites.includes(path), true)
         );
    });
    
    galleryOverlay.classList.add('active');
}

/**
 * Zeigt die Detailansicht eines Bildes.
 */
function showImageDetail(fullSrc) {
    detailImage.src = fullSrc;
    imageDetailOverlay.style.position = 'fixed'; 
    imageDetailOverlay.classList.add('active');
}
