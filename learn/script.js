// Kannada keyboard layout
const kannadaKeyboard = {
    vowels: [
        ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ೠ'],
        ['ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ', 'ಂ', 'ಃ']
    ],
    consonants: [
        ['ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ'],
        ['ಚ', 'ಛ', 'ಜ', 'ಝ', 'ಞ'],
        ['ಟ', 'ಠ', 'ಡ', 'ಢ', 'ಣ'],
        ['ತ', 'ಥ', 'ದ', 'ಧ', 'ನ'],
        ['ಪ', 'ಫ', 'ಬ', 'ಭ', 'ಮ'],
        ['ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ'],
        ['ಸ', 'ಹ', 'ಳ', 'ೞ']
    ],
    halant: '್',
    halfConsonants: [
        ['ಕ್', 'ಖ್', 'ಗ್', 'ಘ್', 'ಙ್'],
        ['ಚ್', 'ಛ್', 'ಜ್', 'ಝ್', 'ಞ್'],
        ['ಟ್', 'ಠ್', 'ಡ್', 'ಢ್', 'ಣ್'],
        ['ತ್', 'ಥ್', 'ದ್', 'ಧ್', 'ನ್'],
        ['ಪ್', 'ಫ್', 'ಬ್', 'ಭ್', 'ಮ್'],
        ['ಯ್', 'ರ್', 'ಲ್', 'ವ್', 'ಶ್', 'ಷ್'],
        ['ಸ್', 'ಹ್', 'ಳ್', 'ೞ್']
    ],
    special: [],
};

// Game state
let currentWord = null;
let currentAnswer = '';
let usedWords = [];

// DOM elements
const englishWordEl = document.getElementById('englishWord');
const kannadaInputEl = document.getElementById('kannadaInput');
const feedbackEl = document.getElementById('feedback');
const checkBtn = document.getElementById('checkBtn');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const keyboardEl = document.getElementById('kannadaKeyboard');

// Initialize the game
async function initGame() {
    document.getElementById('keyboardContainer').classList.add('compact');
    createKeyboard();
    setupEventListeners();
    loadNewWord();
}

// Create Kannada keyboard
function createKeyboard() {
    keyboardEl.innerHTML = '';
    
    // Flatten all keys into a single array for compact layout
    const allKeys = [].concat(
        ...kannadaKeyboard.vowels,
        ...kannadaKeyboard.halfConsonants,
        [kannadaKeyboard.halant],
        kannadaKeyboard.special,
        ['Space', '⌫']
    );
    
    // Calculate optimal keys per row based on screen width
    const keysPerRow = calculateOptimalKeysPerRow();
    console.log(`Screen optimized: ${keysPerRow} keys per row`);
    
    for (let i = 0; i < allKeys.length; i += keysPerRow) {
        const rowEl = document.createElement('div');
        rowEl.className = 'keyboard-row compact-row';
        allKeys.slice(i, i + keysPerRow).forEach(keyText => {
            let type = 'key';
            if (kannadaKeyboard.vowels.flat().includes(keyText)) type = 'vowel';
            else if (kannadaKeyboard.halfConsonants.flat().includes(keyText)) type = 'half-consonant';
            else if (keyText === kannadaKeyboard.halant) type = 'halant';
            else if (kannadaKeyboard.special.includes(keyText)) type = 'special';
            else if (keyText === 'Space') type = 'space';
            else if (keyText === '⌫') type = 'backspace';
            
            const key = createKey(keyText, type);
            rowEl.appendChild(key);
        });
        keyboardEl.appendChild(rowEl);
    }
}

// Calculate optimal number of keys per row based on screen size
function calculateOptimalKeysPerRow() {
    const screenWidth = window.innerWidth;
    const containerPadding = 10; // Approximate padding from container
    const keyMinWidth = 35; // Minimum key width in pixels
    const keyGap = 4; // Gap between keys
    
    // Calculate available width for keys
    const availableWidth = screenWidth - (containerPadding * 2);
    
    // Calculate maximum keys that can fit
    const maxKeysPerRow = Math.floor(availableWidth / (keyMinWidth + keyGap));
    
    // Set reasonable limits based on screen size
    let optimalKeys;
    
    if (screenWidth <= 480) {
        // Very small screens (phones in portrait)
        optimalKeys = Math.min(maxKeysPerRow, 8);
    } else if (screenWidth <= 768) {
        // Small screens (phones in landscape, small tablets)
        optimalKeys = Math.min(maxKeysPerRow, 10);
    } else if (screenWidth <= 1024) {
        // Medium screens (tablets, small laptops)
        optimalKeys = Math.min(maxKeysPerRow, 12);
    } else {
        // Large screens (laptops, desktops)
        optimalKeys = Math.min(maxKeysPerRow, 15);
    }
    
    // Ensure minimum of 6 keys per row
    return Math.max(optimalKeys, 6);
}

// Create a keyboard key
function createKey(text, type) {
    const key = document.createElement('div');
    key.className = `key ${type}`;
    key.textContent = text;
    key.addEventListener('click', () => handleKeyPress(text));
    return key;
}

// Handle keyboard key press
function handleKeyPress(key) {
    if (key === 'Space') {
        currentAnswer += ' ';
    } else if (key === '⌫') {
        // Remove last half-consonant if present, else last character
        const lastHalfConsonant = getLastHalfConsonant(currentAnswer);
        if (lastHalfConsonant) {
            currentAnswer = currentAnswer.slice(0, -lastHalfConsonant.length);
        } else {
            currentAnswer = currentAnswer.slice(0, -1);
        }
        updateInputDisplay();
    } else if (key === 'Enter') {
        checkAnswer();
    } else {
        // Only replace the last half-consonant (not all conjuncts)
        if (isVowel(key)) {
            // Find the last half-consonant in the string
            const match = currentAnswer.match(/([\u0C80-\u0CFF]್)$/);
            if (match) {
                const lastHalfConsonant = match[1];
                const idx = currentAnswer.lastIndexOf(lastHalfConsonant);
                const fullConsonant = combineHalfConsonantWithVowel(lastHalfConsonant, key);
                currentAnswer = currentAnswer.slice(0, idx) + fullConsonant;
                kannadaInputEl.value = currentAnswer;
                return;
            }
        }
        currentAnswer += key;
        updateInputDisplay();
    }
}

// Helper to get the last half-consonant (2 code points)
function getLastHalfConsonant(text) {
    // Try last 2 chars, then last 3 chars (for rare cases), else last char
    if (!text) return '';
    for (let len = 3; len >= 1; len--) {
        const part = text.slice(-len);
        if (isHalfConsonant(part)) return part;
    }
    return '';
}

// Check if a character is a vowel
function isVowel(char) {
    const vowels = ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ', 'ಊ', 'ಋ', 'ೠ', 'ಎ', 'ಏ', 'ಐ', 'ಒ', 'ಓ', 'ಔ'];
    return vowels.includes(char);
}

// Check if a character is a half consonant
function isHalfConsonant(char) {
    return char && char.endsWith('್');
}

// Combine half consonant with vowel to form full consonant
function combineHalfConsonantWithVowel(halfConsonant, vowel) {
    // Check if consonantMap is loaded from consonants.js
    if (typeof consonantMap === 'undefined') {
        console.error('consonantMap not loaded from consonants.js');
        return halfConsonant + vowel;
    }
    
    if (consonantMap[halfConsonant] && consonantMap[halfConsonant][vowel]) {
        return consonantMap[halfConsonant][vowel];
    }
    
    // If no mapping found, just return the original combination
    return halfConsonant + vowel;
}

// Update input display
function updateInputDisplay() {
    kannadaInputEl.value = currentAnswer;
}

// Load a new word
function loadNewWord() {
    console.log('loadNewWord called');
    console.log('englishWordEl:', englishWordEl);
    
    // Check if vocabulary is loaded
    if (typeof vocabulary === 'undefined' || !vocabulary || vocabulary.length === 0) {
        console.error('Vocabulary not loaded yet!');
        setTimeout(() => {
            console.log('Retrying loadNewWord...');
            loadNewWord();
        }, 100);
        return;
    }
    
    console.log('vocabulary length:', vocabulary.length);
    
    // Reset used words if all words have been used
    if (usedWords.length === vocabulary.length) {
        usedWords = [];
    }
    // Find a word that hasn't been used (track by English word string)
    let availableWords = vocabulary.filter(word => !usedWords.includes(word.english));
    if (availableWords.length === 0) {
        // All words used, reset and use all
        availableWords = [...vocabulary];
        usedWords = [];
    }
    // If only one word is available, use it
    if (availableWords.length === 1) {
        currentWord = availableWords[0];
    } else {
        // Pick a word that is not the current word
        let filtered = availableWords.filter(word => !currentWord || word.english !== currentWord.english);
        if (filtered.length === 0) {
            filtered = availableWords;
        }
        currentWord = filtered[Math.floor(Math.random() * filtered.length)];
    }
    usedWords.push(currentWord.english);
    
    console.log('Selected word:', currentWord);
    
    // Update display
    if (englishWordEl) {
        englishWordEl.textContent = currentWord.english;
        console.log('Updated englishWordEl with:', currentWord.english);
    } else {
        console.error('englishWordEl is null!');
    }
    currentAnswer = '';
    updateInputDisplay();
    clearFeedback();
}

// Check answer
function checkAnswer() {
    if (!currentWord) return;
    
    const userAnswer = currentAnswer.trim();
    const correctAnswer = currentWord.kannada.trim();
    const isCorrect = userAnswer === correctAnswer;
    
    // Update Firebase stats if user is authenticated
    if (window.firebaseAuth && window.firebaseAuth.isAuthenticated()) {
        window.firebaseAuth.updateStats(isCorrect, currentWord.english);
    }
    
    if (isCorrect) {
        showFeedback('Correct! Well done! 🎉', 'correct');
        setTimeout(() => {
            loadNewWord();
        }, 2000);
    } else {
        showFeedback(`Incorrect. The correct answer is: ${correctAnswer}`, 'incorrect');
        setTimeout(() => {
            loadNewWord();
        }, 2000);
    }
}

// Show feedback
function showFeedback(message, type) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.feedback-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = `feedback-popup ${type}`;
    popup.textContent = message;
    
    // Add popup to body
    document.body.appendChild(popup);
    
    // Show popup with animation
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);
    
    // Auto-hide popup after 3 seconds
    setTimeout(() => {
        popup.classList.add('hide');
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 300);
    }, 3000);
}

// Clear feedback
function clearFeedback() {
    const existingPopup = document.querySelector('.feedback-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Clear the original feedback element (though it won't be visible)
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
}

// Show answer
function showAnswer() {
    if (!currentWord) return;
    showFeedback(`The answer is: ${currentWord.kannada}`, 'hint');
    console.log('Setting timeout for next word (show answer)...');
    setTimeout(() => {
        console.log('Loading next word (show answer)...');
        loadNewWord();
    }, 2000);
}

// Start new game
function newGame() {
    usedWords = [];
    loadNewWord();
    clearFeedback();
}

// Setup event listeners
function setupEventListeners() {
    checkBtn.addEventListener('click', checkAnswer);
    showAnswerBtn.addEventListener('click', showAnswer);
    
    // Set up responsive keyboard
    setupResponsiveKeyboard();

    // Keyboard input
    kannadaInputEl.addEventListener('input', (e) => {
        currentAnswer = e.target.value;
        updateInputDisplay();
    });
    
    // Enter key to check answer
    kannadaInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Backspace key (only for keyboard mode)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && document.activeElement !== kannadaInputEl) {
            const lastHalfConsonant = getLastHalfConsonant(currentAnswer);
            if (lastHalfConsonant) {
                currentAnswer = currentAnswer.slice(0, -lastHalfConsonant.length);
            } else {
                currentAnswer = currentAnswer.slice(0, -1);
            }
            updateInputDisplay();
        }
    });
}

// Add a resize listener to recreate keyboard when screen size changes
function setupResponsiveKeyboard() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('Screen resized, recreating keyboard...');
            createKeyboard();
        }, 250); // Debounce resize events
    });
}

// Listen for user authentication
window.addEventListener('userAuthenticated', (event) => {
    const { user, stats } = event.detail;
    console.log('User authenticated:', user.isAnonymous ? 'Anonymous' : user.displayName);
    console.log('User stats:', stats);
    
    // Initialize game now that user is authenticated
    if (!gameInitialized) {
        initGame();
        gameInitialized = true;
    }
});

let gameInitialized = false;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Don't initialize game immediately - wait for authentication
    console.log('DOM loaded, waiting for authentication...');
});
