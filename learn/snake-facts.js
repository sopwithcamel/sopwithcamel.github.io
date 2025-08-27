// Snake Facts - AI-powered snake fact generation and display
class SnakeFacts {
    constructor() {
        // No initialization needed for now
    }
    
    // Generate a funny fact about a specific snake using AI
    async generateSnakeFact(snakeName) {
        // Check if Firebase AI is available
        if (!window.firebaseAuth || !window.firebaseAuth.generativeModel) {
            console.warn('AI model not available, returning default fact');
            return `The ${snakeName} is amazing! Did you know snakes can't blink? They have fixed transparent scales over their eyes instead of eyelids! 🐍`;
        }
        
        try {
            const prompt = `Write a short, funny and interesting fact about the "${snakeName}" snake. 
            
            Make it:
            1. Educational but entertaining
            2. 1-2 sentences maximum
            3. Family-friendly and fun
            4. Include its scientific name if known
            
            Focus on something unique, quirky, or surprising about this specific snake species.`;
            
            console.log('Generating snake fact for:', snakeName);
            
            const result = await window.firebaseAuth.generativeModel.generateContent(prompt);
            
            console.log('AI result received:', result);
            
            // More robust response handling
            if (result && result.response) {
                const response = result.response;
                console.log('Response object:', response);
                
                // Try to get text from response
                if (typeof response.text === 'function') {
                    const text = await response.text();
                    console.log('Generated text:', text);
                    return text;
                } else if (response.text) {
                    return response.text;
                } else if (response.candidates && response.candidates[0] && response.candidates[0].content) {
                    // Fallback: try to extract from candidates
                    const content = response.candidates[0].content;
                    if (content.parts && content.parts[0] && content.parts[0].text) {
                        return content.parts[0].text;
                    }
                }
            }
            
            throw new Error('Unable to extract text from AI response');
            
        } catch (error) {
            console.error('Error generating snake fact:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            return `The ${snakeName} is fascinating! Fun fact: Snakes smell with their tongues by collecting chemical information from the air! 🐍`;
        }
    }
    
    // Generate and format snake fact for display
    async generateAndFormatSnakeFact(snakeName, levelData) {
        try {
            // Check if Firebase AI is available
            if (window.firebaseAuth && window.firebaseAuth.generativeModel) {
                const snakeFact = await this.generateSnakeFact(snakeName);
                
                // Convert Markdown to HTML
                const htmlSnakeFact = this.markdownToHtml(snakeFact);
                
                // Create the final description with level info + AI fact
                const levelInfo = `You are now ${levelData.isMaxLevel ? 'a' : ['A', 'E', 'I', 'O', 'U'].includes(snakeName[0]) ? 'an' : 'a'} ${snakeName} <strong>(Level ${levelData.level})</strong>!${levelData.isMaxLevel ? ' You have mastered Kannada learning!' : ''}<br><br>`;
                return levelInfo + htmlSnakeFact;
                
            } else {
                // Fallback if AI is not available
                return `You are now ${levelData.isMaxLevel ? 'a' : ['A', 'E', 'I', 'O', 'U'].includes(snakeName[0]) ? 'an' : 'a'} ${snakeName} <strong>(Level ${levelData.level})</strong>!${levelData.isMaxLevel ? ' You have mastered Kannada learning!' : ''}<br><br>The ${snakeName} is an amazing snake! Keep practicing to learn more! 🐍`;
            }
        } catch (error) {
            console.error('Error generating snake fact:', error);
            // Show fallback message on error
            return `You are now ${levelData.isMaxLevel ? 'a' : ['A', 'E', 'I', 'O', 'U'].includes(snakeName[0]) ? 'an' : 'a'} ${snakeName} <strong>(Level ${levelData.level})</strong>!${levelData.isMaxLevel ? ' You have mastered Kannada learning!' : ''}<br><br>The ${snakeName} is fascinating! Snakes are incredible creatures with amazing abilities! 🐍`;
        }
    }
    
    // Get loading message for snake fact generation
    getLoadingMessage(snakeName, levelData) {
        return `You are now ${levelData.isMaxLevel ? 'a' : ['A', 'E', 'I', 'O', 'U'].includes(snakeName[0]) ? 'an' : 'a'} ${snakeName} <strong>(Level ${levelData.level})</strong>! ${levelData.isMaxLevel ? 'You have mastered Kannada learning! ' : ''}Generating snake fact... 🤔`;
    }
    
    // Simple Markdown to HTML converter for basic formatting
    markdownToHtml(markdown) {
        let html = markdown;
        
        // Convert **bold** to <strong>
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Convert _italic_ to <em>
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        // Convert `code` to <code>
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert line breaks to <br>
        html = html.replace(/\n/g, '<br>');
        
        // Convert scientific names in parentheses to italic
        html = html.replace(/\(([A-Z][a-z]+ [a-z]+)\)/g, '<em>($1)</em>');
        
        return html;
    }
}

// Initialize global snake facts instance
window.snakeFacts = new SnakeFacts();