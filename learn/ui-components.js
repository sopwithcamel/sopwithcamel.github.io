// UI Components - Modal and other UI functionality
class UIComponents {
    constructor() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Snake level modal elements
        const levelImage = document.getElementById('levelImage');
        const snakeModal = document.getElementById('snakeLevelModal');
        const closeSnakeModal = document.getElementById('closeSnakeModal');
        const prevBtn = document.getElementById('snakeModalPrev');
        const nextBtn = document.getElementById('snakeModalNext');
        
        if (levelImage) {
            levelImage.addEventListener('click', () => {
                this.showSnakeModal();
            });
        }
        
        if (closeSnakeModal) {
            closeSnakeModal.addEventListener('click', () => {
                this.hideSnakeModal();
            });
        }
        
        if (snakeModal) {
            snakeModal.addEventListener('click', (e) => {
                if (e.target === snakeModal) {
                    this.hideSnakeModal();
                }
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prevSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }
    }
    
    // Snake level modal methods
    showSnakeModal() {
        // Check if user is authenticated and has stats
        if (!window.firebaseAuth || !window.firebaseAuth.isAuthenticated() || !window.firebaseAuth.getUserStats()) {
            return;
        }
        
        const userStats = window.firebaseAuth.getUserStats();
        
        // Get actual vocabulary size from vocabulary.js
        const totalVocabularySize = typeof vocabulary !== 'undefined' ? vocabulary.length : 100;
        
        // Get current expertise level
        const levelData = userStats.getExpertiseLevel(totalVocabularySize);
        
        // Get modal elements
        const modal = document.getElementById('snakeLevelModal');
        const modalImage = document.getElementById('snakeModalImage');
        const modalTitle = document.getElementById('snakeModalTitle');
        const modalDescription = document.getElementById('snakeModalDescription');
        const wordsList = document.getElementById('snakeModalWordsList');
        const practiceList = document.getElementById('snakeModalPracticeList');
        const prevBtn = document.getElementById('snakeModalPrev');
        const nextBtn = document.getElementById('snakeModalNext');
        const slideIndicators = document.getElementById('snakeModalIndicators');
        
        if (modal && modalImage && modalTitle && modalDescription && wordsList && practiceList) {
            // Update modal content for first slide
            const imageNumber = levelData.level.toString().padStart(2, '0');
            modalImage.src = `img/${imageNumber}.png`;
            modalImage.alt = levelData.name;
            modalTitle.textContent = levelData.name;
            
            // Create description based on level - simple snake identity
            let description;
            if (levelData.isMaxLevel) {
                description = `Congratulations! You are now a ${levelData.name}. You have mastered Kannada learning!`;
            } else {
                // Use proper article (a/an) based on first letter
                const article = ['A', 'E', 'I', 'O', 'U'].includes(levelData.name[0]) ? 'an' : 'a';
                description = `You are now ${article} ${levelData.name}!`;
            }
            modalDescription.textContent = description;
            
            // Get mastered words (words with high expertise)
            const masteredWords = this.getMasteredWords(userStats, 0.7); // 70% expertise threshold
            
            // Get practice words (words with low expertise but attempted)
            const practiceWords = this.getPracticeWords(userStats, 0.6); // Below 60% expertise threshold
            
            // Populate words list for second slide
            this.populateWordsList(wordsList, masteredWords, false);
            
            // Populate practice words list for third slide
            this.populateWordsList(practiceList, practiceWords, true);
            
            // Reset slider to first slide
            this.currentSlide = 0;
            this.updateSlider();
            
            // Show modal with animation
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }
    
    getMasteredWords(userStats, expertiseThreshold = 0.7) {
        const wordsWithExpertise = [];
        const allWordsWithGuesses = userStats.getAllWordsWithGuesses();
        
        // Check if vocabulary is available
        if (typeof vocabulary === 'undefined') return [];
        
        for (const englishWord of allWordsWithGuesses) {
            const expertise = userStats.getWordExpertise(englishWord);
            if (expertise >= expertiseThreshold) {
                // Find the Kannada translation
                const vocabEntry = vocabulary.find(entry => entry.english === englishWord);
                if (vocabEntry) {
                    wordsWithExpertise.push({
                        english: englishWord,
                        kannada: vocabEntry.kannada,
                        expertise: expertise
                    });
                }
            }
        }
        
        // Sort by expertise (highest first) and take top 20
        return wordsWithExpertise
            .sort((a, b) => b.expertise - a.expertise)
            .slice(0, 20);
    }
    
    getPracticeWords(userStats, expertiseThreshold = 0.6) {
        const wordsNeedingPractice = [];
        const allWordsWithGuesses = userStats.getAllWordsWithGuesses();
        
        // Check if vocabulary is available
        if (typeof vocabulary === 'undefined') return [];
        
        console.log('Getting practice words for', allWordsWithGuesses.length, 'attempted words');
        
        for (const englishWord of allWordsWithGuesses) {
            const expertise = userStats.getWordExpertise(englishWord);
            const totalGuesses = userStats.getTotalGuessesForWord(englishWord);
            
            console.log(`Word: ${englishWord}, Expertise: ${expertise.toFixed(2)}, Attempts: ${totalGuesses}`);
            
            // Include words that have been attempted at least once and have low expertise
            if (expertise < expertiseThreshold && totalGuesses >= 1) {
                // Find the Kannada translation
                const vocabEntry = vocabulary.find(entry => entry.english === englishWord);
                if (vocabEntry) {
                    wordsNeedingPractice.push({
                        english: englishWord,
                        kannada: vocabEntry.kannada,
                        expertise: expertise,
                        attempts: totalGuesses
                    });
                    console.log(`Added to practice: ${englishWord} (${vocabEntry.kannada})`);
                }
            }
        }
        
        console.log('Practice words found:', wordsNeedingPractice.length);
        
        // Sort by expertise (lowest first, most struggling words first) and take top 20
        return wordsNeedingPractice
            .sort((a, b) => a.expertise - b.expertise)
            .slice(0, 20);
    }
    
    populateWordsList(wordsList, words, isPracticeList = false) {
        if (words.length === 0) {
            const message = isPracticeList 
                ? '<p class="no-words">Great job! No words need extra practice right now! 💪</p>'
                : '<p class="no-words">Keep practicing to master more words! 🎯</p>';
            wordsList.innerHTML = message;
            return;
        }
        
        // Create two-column layout
        const leftColumn = document.createElement('div');
        leftColumn.className = 'words-column';
        const rightColumn = document.createElement('div');
        rightColumn.className = 'words-column';
        
        words.forEach((word, index) => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.textContent = word.kannada;
            
            // Alternate between left and right columns
            if (index % 2 === 0) {
                leftColumn.appendChild(wordItem);
            } else {
                rightColumn.appendChild(wordItem);
            }
        });
        
        wordsList.innerHTML = '';
        wordsList.appendChild(leftColumn);
        wordsList.appendChild(rightColumn);
    }
    
    updateSlider() {
        const slide1 = document.querySelector('.snake-slide-1');
        const slide2 = document.querySelector('.snake-slide-2');
        const slide3 = document.querySelector('.snake-slide-3');
        const prevBtn = document.getElementById('snakeModalPrev');
        const nextBtn = document.getElementById('snakeModalNext');
        const indicators = document.querySelectorAll('.slide-indicator');
        
        if (slide1 && slide2 && slide3) {
            // Hide all slides first
            slide1.style.display = 'none';
            slide2.style.display = 'none';
            slide3.style.display = 'none';
            
            // Show current slide
            if (this.currentSlide === 0) {
                slide1.style.display = 'block';
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'block';
            } else if (this.currentSlide === 1) {
                slide2.style.display = 'block';
                if (prevBtn) prevBtn.style.display = 'block';
                if (nextBtn) nextBtn.style.display = 'block';
            } else if (this.currentSlide === 2) {
                slide3.style.display = 'block';
                if (prevBtn) prevBtn.style.display = 'block';
                if (nextBtn) nextBtn.style.display = 'none';
            }
            
            // Update indicators
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === this.currentSlide);
            });
        }
    }
    
    nextSlide() {
        if (this.currentSlide < 2) {
            this.currentSlide++;
            this.updateSlider();
        }
    }
    
    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSlider();
        }
    }
    
    hideSnakeModal() {
        const modal = document.getElementById('snakeLevelModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
}

// Initialize UI components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing UI Components...');
    window.uiComponents = new UIComponents();
});