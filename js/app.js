// js/app.js - Core application functionality

/**
 * Dental Kids App - Main Application Controller
 * Handles navigation, user interactions, and app state management
 */

class DentalKidsApp {
    constructor() {
        this.currentSection = 'home';
        this.soundEnabled = true;
        this.userProgress = this.loadProgress();
        this.animations = [];
        
        // Initialize app when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the application
     */
    init() {
        console.log('🦷 Dental Kids App initializing...');
        
        this.setupLoadingScreen();
        this.setupNavigation();
        this.setupSoundToggle();
        this.setupProcedureCards();
        this.setupHelpButton();
        this.setupModal();
        this.updateProgressDisplay();
        this.playWelcomeSound();
        
        console.log('✅ App initialized successfully!');
    }
    
    /**
     * Setup and hide loading screen
     */
    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        
        if (loadingScreen) {
            // Hide loading screen after 2.5 seconds with animation
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                
                // Remove from DOM after animation completes
                setTimeout(() => {
                    loadingScreen.remove();
                }, 500);
            }, 2500);
        }
    }
    
    /**
     * Setup navigation functionality
     */
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.content-section');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = button.dataset.section;
                this.navigateToSection(targetSection, button);
            });
        });
        
        // Setup CTA button
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', () => {
                this.navigateToSection('procedures');
            });
        }
    }
    
    /**
     * Navigate to specific section
     */
    navigateToSection(sectionName, activeButton = null) {
        // Update current section
        this.currentSection = sectionName;
        
        // Update navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        if (activeButton) {
            activeButton.classList.add('active');
        } else {
            // Find and activate the correct button
            const targetButton = document.querySelector(`[data-section="${sectionName}"]`);
            if (targetButton) {
                targetButton.classList.add('active');
            }
        }
        
        // Update sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.classList.add('animate-fadeOut');
        });
        
        // Show target section with animation
        setTimeout(() => {
            const targetSection = document.getElementById(`${sectionName}-section`);
            if (targetSection) {
                sections.forEach(s => s.classList.remove('animate-fadeOut'));
                targetSection.classList.add('active', 'animate-fadeIn');
                
                // Trigger section-specific animations
                this.triggerSectionAnimations(sectionName);
            }
        }, 200);
        
        this.playClickSound();
        console.log(`📍 Navigated to: ${sectionName}`);
    }
    
    /**
     * Trigger animations for specific sections
     */
    triggerSectionAnimations(sectionName) {
        const section = document.getElementById(`${sectionName}-section`);
        if (!section) return;
        
        switch (sectionName) {
            case 'procedures':
                this.animateProcedureCards();
                break;
            case 'progress':
                this.animateProgressCircle();
                this.animateBadges();
                break;
            case 'tips':
                this.animateTipCards();
                break;
        }
    }
    
    /**
     * Animate procedure cards with stagger effect
     */
    animateProcedureCards() {
        const cards = document.querySelectorAll('.procedure-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }
    
    /**
     * Animate progress circle
     */
    animateProgressCircle() {
        const progressRing = document.getElementById('progress-ring-fill');
        const progressText = document.getElementById('progress-percentage');
        
        if (progressRing && progressText) {
            const completionRate = this.calculateCompletionRate();
            const circumference = 2 * Math.PI * 50; // radius = 50
            const offset = circumference - (completionRate / 100) * circumference;
            
            // Animate progress ring
            setTimeout(() => {
                progressRing.style.strokeDashoffset = offset;
                
                // Animate percentage counter
                let current = 0;
                const increment = completionRate / 30; // 30 steps
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= completionRate) {
                        current = completionRate;
                        clearInterval(timer);
                    }
                    progressText.textContent = Math.round(current) + '%';
                }, 50);
            }, 500);
        }
        
        // Update other progress stats
        document.getElementById('procedures-completed').textContent = this.userProgress.completedProcedures.length;
        document.getElementById('badges-earned').textContent = this.userProgress.badges.length;
    }
    
    /**
     * Animate tip cards
     */
    animateTipCards() {
        const cards = document.querySelectorAll('.tip-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, index * 100);
        });
    }
    
    /**
     * Setup sound toggle functionality
     */
    setupSoundToggle() {
        const soundToggle = document.getElementById('sound-toggle');
        const soundIcon = document.querySelector('.sound-icon');
        
        if (soundToggle && soundIcon) {
            soundToggle.addEventListener('click', () => {
                this.soundEnabled = !this.soundEnabled;
                soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
                
                // Visual feedback
                soundToggle.classList.add('animate-scaleUp');
                setTimeout(() => {
                    soundToggle.classList.remove('animate-scaleUp');
                }, 300);
                
                this.saveProgress();
                console.log(`🔊 Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
            });
        }
    }
    
    /**
     * Setup procedure cards interactivity
     */
    setupProcedureCards() {
        const procedureCards = document.querySelectorAll('.procedure-card');
        
        procedureCards.forEach(card => {
            const procedureType = card.dataset.procedure;
            const startButton = card.querySelector('.start-procedure-btn');
            
            // Card hover effects
            card.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
            
            // Start procedure button
            if (startButton) {
                startButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.startProcedure(procedureType);
                });
            }
            
            // Card click to start procedure
            card.addEventListener('click', () => {
                this.startProcedure(procedureType);
            });
        });
    }
    
    /**
     * Start a dental procedure
     */
    startProcedure(procedureType) {
        console.log(`🦷 Starting procedure: ${procedureType}`);
        
        this.playClickSound();
        this.showProcedureModal(procedureType);
        
        // Add visual feedback to clicked card
        const card = document.querySelector(`[data-procedure="${procedureType}"]`);
        if (card) {
            card.classList.add('animate-scaleUp');
            setTimeout(() => {
                card.classList.remove('animate-scaleUp');
            }, 300);
        }
    }
    
    /**
     * Setup modal functionality
     */
    setupModal() {
        const modal = document.getElementById('procedure-modal');
        const closeButton = document.querySelector('.close-modal');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // Close modal on outside click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }
    
    /**
     * Show procedure modal
     */
    showProcedureModal(procedureType) {
        const modal = document.getElementById('procedure-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('procedure-content');
        
        if (modal && modalTitle && modalContent) {
            // Set modal content based on procedure type
            const procedureData = this.getProcedureData(procedureType);
            modalTitle.textContent = procedureData.title;
            modalContent.innerHTML = procedureData.content;
            
            // Show modal with animation
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            console.log(`📱 Opened modal for: ${procedureType}`);
        }
    }
    
    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('procedure-modal');
        
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            
            this.playClickSound();
            console.log('📱 Modal closed');
        }
    }
    
    /**
     * Get procedure data for modal
     */
    getProcedureData(procedureType) {
        const procedures = {
            cleaning: {
                title: '🪥 Tooth Cleaning Adventure',
                content: `
                    <div class="procedure-steps">
                        <div class="step-indicator">Step 1 of 3: SHOW</div>
                        <div class="procedure-animation">
                            <div class="tooth-demo">🦷</div>
                            <div class="brush-demo">🪥</div>
                        </div>
                        <h3>Let me show you how we clean teeth!</h3>
                        <p>Watch as the special dental brush gently cleans around your tooth. It might tickle a little, but it doesn't hurt!</p>
                        <button class="next-step-btn" onclick="app.nextProcedureStep('cleaning', 'tell')">
                            Tell Me More! 📚
                        </button>
                    </div>
                `
            },
            xray: {
                title: '📸 X-Ray Superhero Vision',
                content: `
                    <div class="procedure-steps">
                        <div class="step-indicator">Step 1 of 3: SHOW</div>
                        <div class="procedure-animation">
                            <div class="xray-demo">📸✨</div>
                        </div>
                        <h3>X-rays give us superhero vision!</h3>
                        <p>Just like Superman can see through walls, X-rays help us see inside your teeth to make sure they're healthy!</p>
                        <button class="next-step-btn" onclick="app.nextProcedureStep('xray', 'tell')">
                            Tell Me More! 📚
                        </button>
                    </div>
                `
            },
            filling: {
                title: '🔧 Cavity Filling Hero Mission',
                content: `
                    <div class="procedure-steps">
                        <div class="step-indicator">Step 1 of 3: SHOW</div>
                        <div class="procedure-animation">
                            <div class="filling-demo">🦷🔧</div>
                        </div>
                        <h3>We're tooth repair heroes!</h3>
                        <p>Sometimes teeth get tiny holes called cavities. We fix them with special tooth-colored material, just like fixing a wall!</p>
                        <button class="next-step-btn" onclick="app.nextProcedureStep('filling', 'tell')">
                            Tell Me More! 📚
                        </button>
                    </div>
                `
            },
            checkup: {
                title: '🔍 Dental Treasure Hunt',
                content: `
                    <div class="procedure-steps">
                        <div class="step-indicator">Step 1 of 3: SHOW</div>
                        <div class="procedure-animation">
                            <div class="checkup-demo">🔍🦷</div>
                        </div>
                        <h3>Let's go on a treasure hunt in your mouth!</h3>
                        <p>We use a special mirror and light to explore every tooth, looking for hidden problems before they become big ones!</p>
                        <button class="next-step-btn" onclick="app.nextProcedureStep('checkup', 'tell')">
                            Tell Me More! 📚
                        </button>
                    </div>
                `
            }
        };
        
        return procedures[procedureType] || procedures.cleaning;
    }
    
    /**
     * Handle next step in procedure (Show-Tell-Do flow)
     */
    nextProcedureStep(procedureType, step) {
        const modalContent = document.getElementById('procedure-content');
        if (!modalContent) return;
        
        const stepContent = this.getProcedureStepContent(procedureType, step);
        modalContent.innerHTML = stepContent;
        
        this.playClickSound();
        console.log(`📖 Showing ${step} step for ${procedureType}`);
    }
    
    /**
     * Get content for specific procedure step
     */
    getProcedureStepContent(procedureType, step) {
        // This will be expanded in procedures.js
        return `<div class="step-content">Step ${step} content for ${procedureType}</div>`;
    }
    
    /**
     * Setup help button
     */
    setupHelpButton() {
        const helpButton = document.getElementById('help-button');
        
        if (helpButton) {
            helpButton.addEventListener('click', () => {
                this.showHelpModal();
            });
        }
    }
    
    /**
     * Show help modal
     */
    showHelpModal() {
        const modal = document.getElementById('procedure-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('procedure-content');
        
        if (modal && modalTitle && modalContent) {
            modalTitle.textContent = '❓ Help & Instructions';
            modalContent.innerHTML = `
                <div class="help-content">
                    <h3>How to use Dental Kids App:</h3>
                    <ul>
                        <li>🏠 <strong>Home:</strong> Start your dental adventure here</li>
                        <li>🔧 <strong>Procedures:</strong> Learn about dental treatments</li>
                        <li>🏆 <strong>Progress:</strong> See your brave badges and achievements</li>
                        <li>💡 <strong>Tips:</strong> Learn how to keep your teeth healthy</li>
                    </ul>
                    
                    <h3>In each procedure you will:</h3>
                    <div class="help-steps">
                        <div class="help-step">
                            <span class="step-number">1</span>
                            <strong>SHOW:</strong> Watch what happens
                        </div>
                        <div class="help-step">
                            <span class="step-number">2</span>
                            <strong>TELL:</strong> Learn all about it
                        </div>
                        <div class="help-step">
                            <span class="step-number">3</span>
                            <strong>DO:</strong> Practice it yourself
                        </div>
                    </div>
                    
                    <button class="help-close-btn" onclick="app.closeModal()">
                        Got it! 👍
                    </button>
                </div>
            `;
            
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            this.playClickSound();
        }
    }
    
    /**
     * Calculate completion rate based on user progress
     */
    calculateCompletionRate() {
        const totalProcedures = 4; // cleaning, xray, filling, checkup
        const completed = this.userProgress.completedProcedures.length;
        return Math.round((completed / totalProcedures) * 100);
    }
    
    /**
     * Animate badges display
     */
    animateBadges() {
        const badgesContainer = document.getElementById('badges-container');
        if (!badgesContainer) return;
        
        // Clear existing badges
        badgesContainer.innerHTML = '';
        
        // Add earned badges
        this.userProgress.badges.forEach((badge, index) => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge-item';
            badgeElement.innerHTML = `
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
            `;
            
            badgeElement.style.opacity = '0';
            badgeElement.style.transform = 'scale(0)';
            badgesContainer.appendChild(badgeElement);
            
            // Animate in with delay
            setTimeout(() => {
                badgeElement.style.transition = 'all 0.5s ease';
                badgeElement.style.opacity = '1';
                badgeElement.style.transform = 'scale(1)';
            }, index * 200);
        });
    }
    
    /**
     * Sound effects
     */
    playClickSound() {
        if (this.soundEnabled) {
            // Create a simple click sound using Web Audio API
            this.playTone(800, 0.1, 'sawtooth');
        }
    }
    
    playHoverSound() {
        if (this.soundEnabled) {
            this.playTone(600, 0.05, 'sine');
        }
    }
    
    playWelcomeSound() {
        if (this.soundEnabled) {
            // Play a welcome melody
            setTimeout(() => this.playTone(523, 0.2, 'sine'), 100); // C
            setTimeout(() => this.playTone(659, 0.2, 'sine'), 300); // E
            setTimeout(() => this.playTone(784, 0.2, 'sine'), 500); // G
        }
    }
    
    /**
     * Play tone using Web Audio API
     */
    playTone(frequency, duration, type = 'sine') {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.log('Audio not supported in this browser');
        }
    }
    
    /**
     * Progress tracking
     */
    loadProgress() {
        const savedProgress = localStorage.getItem('dentalKidsProgress');
        if (savedProgress) {
            return JSON.parse(savedProgress);
        }
        
        return {
            completedProcedures: [],
            badges: [],
            soundEnabled: true,
            visitCount: 0
        };
    }
    
    saveProgress() {
        this.userProgress.soundEnabled = this.soundEnabled;
        localStorage.setItem('dentalKidsProgress', JSON.stringify(this.userProgress));
    }
    
    /**
     * Award badge to user
     */
    awardBadge(badgeId, badgeName, badgeIcon) {
        // Check if badge already exists
        if (!this.userProgress.badges.find(b => b.id === badgeId)) {
            this.userProgress.badges.push({
                id: badgeId,
                name: badgeName,
                icon: badgeIcon,
                earnedAt: new Date().toISOString()
            });
            
            this.saveProgress();
            this.showBadgeNotification(badgeName, badgeIcon);
            console.log(`🏆 Badge awarded: ${badgeName}`);
        }
    }
    
    /**
     * Show badge notification
     */
    showBadgeNotification(badgeName, badgeIcon) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <div class="badge-notification-content">
                <div class="badge-icon-large">${badgeIcon}</div>
                <div class="badge-text">
                    <div class="badge-title">Badge Earned!</div>
                    <div class="badge-name">${badgeName}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
        
        this.playWelcomeSound();
    }
    
    /**
     * Update progress display
     */
    updateProgressDisplay() {
        // This will be called when navigating to progress section
        const progressSection = document.getElementById('progress-section');
        if (progressSection && progressSection.classList.contains('active')) {
            this.animateProgressCircle();
            this.animateBadges();
        }
    }
}

// Initialize the app
const app = new DentalKidsApp();

// Global function for modal interactions
window.showSection = function(sectionName) {
    app.navigateToSection(sectionName);
};

console.log('🦷 Dental Kids App loaded successfully!');