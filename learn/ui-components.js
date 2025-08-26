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
        
        if (modal && modalImage && modalTitle && modalDescription) {
            // Update modal content
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
                description = `You are now ${article} ${levelData.name}! Keep practicing to reach the next level.`;
            }
            modalDescription.textContent = description;
            
            // Show modal with animation
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
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