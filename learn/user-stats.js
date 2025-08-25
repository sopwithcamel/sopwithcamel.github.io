// filepath: /Users/amur/Documents/GitHub/sopwithcamel.github.io/learn/user-stats.js
class UserStats {
    constructor() {
        this.stats = {
            gamesPlayed: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            wordGuesses: new Map() // word -> array of {correct: boolean, date: timestamp}
        };
    }
    
    // Reset stats to initial values
    reset() {
        this.stats = {
            gamesPlayed: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            wordGuesses: new Map()
        };
        console.log('User stats reset to initial values');
    }
    
    // Load stats from parsed data (from localStorage or Firestore)
    loadFromData(data) {
        this.stats = {
            ...this.stats,
            ...data,
            wordGuesses: new Map(data.wordGuesses || [])
        };
        console.log('User stats loaded from data:', this.stats);
        
        // Run garbage collection after loading
        this.cleanupOldGuesses();
    }
    
    // Update stats with a new guess
    updateWithGuess(isCorrect, word) {
        this.stats.totalAnswers++;
        
        // Record the guess for this word
        if (!this.stats.wordGuesses.has(word)) {
            this.stats.wordGuesses.set(word, []);
        }
        this.stats.wordGuesses.get(word).push({
            correct: isCorrect,
            date: Date.now()
        });
        
        if (isCorrect) {
            this.stats.correctAnswers++;
        }
        
        console.log(`Stats updated for word "${word}": ${isCorrect ? 'correct' : 'incorrect'}`);
    }
    
    // Garbage collect guesses older than 30 days
    cleanupOldGuesses() {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        let totalRemovedGuesses = 0;
        let wordsToDelete = [];
        let hasChanges = false;
        
        for (const [word, guesses] of this.stats.wordGuesses) {
            const recentGuesses = guesses.filter(guess => guess.date > thirtyDaysAgo);
            
            if (recentGuesses.length === 0) {
                // No recent guesses, mark word for deletion
                wordsToDelete.push(word);
                totalRemovedGuesses += guesses.length;
                hasChanges = true;
            } else if (recentGuesses.length < guesses.length) {
                // Some guesses were old, update with only recent ones
                this.stats.wordGuesses.set(word, recentGuesses);
                totalRemovedGuesses += (guesses.length - recentGuesses.length);
                hasChanges = true;
            }
        }
        
        // Remove words with no recent guesses
        wordsToDelete.forEach(word => {
            this.stats.wordGuesses.delete(word);
        });
        
        if (hasChanges) {
            console.log(`Garbage collection: Removed ${totalRemovedGuesses} old guesses for ${wordsToDelete.length} words`);
        }
        
        return { hasChanges, totalRemovedGuesses, wordsDeleted: wordsToDelete.length };
    }
    
    // Get current stats object
    getStats() {
        return this.stats;
    }
    
    // Export stats for saving (converts Map to array for JSON compatibility)
    exportForSave() {
        return {
            ...this.stats,
            wordGuesses: Array.from(this.stats.wordGuesses),
            lastUpdated: new Date().toISOString()
        };
    }
    
    // Export stats for Firestore (converts Map to object)
    exportForFirestore() {
        const wordGuessesFlat = {};
        for (const [word, guesses] of this.stats.wordGuesses) {
            wordGuessesFlat[word] = guesses;
        }
        
        return {
            ...this.stats,
            wordGuesses: wordGuessesFlat,
            lastUpdated: new Date().toISOString()
        };
    }
    
    // Calculate accuracy percentage
    getAccuracy() {
        return this.stats.totalAnswers > 0 
            ? Math.round((this.stats.correctAnswers / this.stats.totalAnswers) * 100)
            : 0;
    }
    
    // Helper methods for word guess tracking
    getWordGuessHistory(word) {
        return this.stats.wordGuesses.get(word) || [];
    }
    
    getWordAccuracy(word) {
        const guesses = this.getWordGuessHistory(word);
        if (guesses.length === 0) return 0;
        
        const correctGuesses = guesses.filter(guess => guess.correct).length;
        return Math.round((correctGuesses / guesses.length) * 100);
    }
    
    getTotalGuessesForWord(word) {
        return this.getWordGuessHistory(word).length;
    }
    
    getCorrectGuessesForWord(word) {
        return this.getWordGuessHistory(word).filter(guess => guess.correct).length;
    }
    
    getRecentGuessesForWord(word, limit = 5) {
        const guesses = this.getWordGuessHistory(word);
        return guesses.slice(-limit);
    }
    
    getAllWordsWithGuesses() {
        return Array.from(this.stats.wordGuesses.keys());
    }
    
    getWordsLearned(minCorrectAnswers = 1) {
        return this.getAllWordsWithGuesses().filter(word => {
            return this.getCorrectGuessesForWord(word) >= minCorrectAnswers;
        });
    }
    
    getWordsNeedingPractice(accuracyThreshold = 70, minGuesses = 3) {
        return this.getAllWordsWithGuesses().filter(word => {
            const accuracy = this.getWordAccuracy(word);
            const totalGuesses = this.getTotalGuessesForWord(word);
            return totalGuesses >= minGuesses && accuracy < accuracyThreshold;
        });
    }
    
    getWordsByAccuracy() {
        const words = this.getAllWordsWithGuesses();
        return words.map(word => ({
            word,
            accuracy: this.getWordAccuracy(word),
            totalGuesses: this.getTotalGuessesForWord(word),
            correctGuesses: this.getCorrectGuessesForWord(word)
        })).sort((a, b) => a.accuracy - b.accuracy);
    }
}