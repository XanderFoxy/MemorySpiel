/* Slider Design */
.difficulty-slider-container {
    position: relative;
    padding: 30px 5px 15px; 
}
#fox-head-slider {
    position: absolute;
    top: 20px; 
    transform: translateY(-50%) translateX(-50%); /* Zentrieren des Fuchskopfes */
    font-size: 1.8rem;
    pointer-events: none; 
    color: var(--secondary-color);
    text-shadow: 0 0 5px var(--primary-color);
    z-index: 10;
    opacity: 0.8; 
    transition: left 0.2s ease-out, opacity 0.5s;
    background-color: var(--secondary-color);
    border-radius: 50%;
    padding: 5px;
    border: 3px solid var(--card-main-color);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    line-height: 1; 
}

#difficulty-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 10px;
    background: var(--button-bg-inactive);
    border-radius: 5px;
    outline: none;
    /* --slider-fill kommt aus style.css und wird per JS gesetzt */
    background-image: var(--slider-fill); 
    transition: background-image 0.2s; 
}
#difficulty-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0; 
    height: 0;
    cursor: pointer;
}
.slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 0.8em;
    color: white;
    position: relative;
    padding: 0 5px;
    font-weight: bold;
}
.slider-labels span:nth-child(2) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: var(--wait-color);
}
#label-easy { color: var(--match-color); }
#label-hard { color: var(--error-color); }

/* Post-it Notiz Stil */
.post-it-note {
    position: absolute;
    top: 10px;
    right: 10px;
    max-width: 250px;
    background-color: #fffa8d; 
    color: var(--text-color);
    padding: 15px;
    border-radius: 0 5px 5px 5px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    transform: rotate(2deg); 
    z-index: 100;
    transition: opacity 0.5s ease-out, transform 0.5s ease-in;
}

.post-it-content {
    font-size: 0.9em;
    line-height: 1.4;
    padding-right: 15px; /* Platz für den Schließ-Button */
}

.post-it-corner {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #fffa8d 50%, #e0d97e 50%); 
    border-radius: 0 5px 0 0;
}

/* NEU: Post-it Schließen Button */
.post-it-close-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    color: var(--card-main-color);
    font-weight: bold;
    cursor: pointer;
    font-size: 1em;
    padding: 2px 5px;
    line-height: 1;
    z-index: 110;
}
.post-it-close-button:hover {
    color: var(--error-color);
}
