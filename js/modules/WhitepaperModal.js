/**
 * Whitepaper Modal Management
 * Handles the display and interaction of the whitepaper modal
 */
class WhitepaperModal {
    constructor() {
        this.isOpen = false;
        this.overlay = null;
        this.iframe = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for ESC key to close
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    // Show whitepaper
    show() {
        console.log('📄 WhitepaperModal.show() called');
        if (this.isOpen) {
            console.log('📄 Whitepaper is already open');
            return;
        }

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'whitepaper-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        `;

        // Create iframe container
        const container = document.createElement('div');
        container.style.cssText = `
            width: 95%;
            height: 95%;
            max-width: 1400px;
            max-height: 900px;
            position: relative;
            border-radius: 12px;
            overflow: visible;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            border: 4px solid #000;
        `;

        // Create iframe container (inner container for overflow handling)
        const iframeContainer = document.createElement('div');
        iframeContainer.style.cssText = `
            width: 100%;
            height: 100%;
            overflow: hidden;
            border-radius: 12px;
        `;

        // Create iframe
        this.iframe = document.createElement('iframe');
        this.iframe.src = 'whitepaper.html';
        this.iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 12px;
            background: white;
        `;

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '🚀';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF2E63, #9D4EDD);
            color: white;
            border: 4px solid #000;
            font-size: 20px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
            font-family: 'Comic Sans MS', 'Comic Neue', cursive;
            transform: rotate(-5deg);
        `;

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'linear-gradient(135deg, #FF2E63, #FFDD00)';
            closeBtn.style.transform = 'rotate(0deg) scale(1.1)';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'linear-gradient(135deg, #FF2E63, #9D4EDD)';
            closeBtn.style.transform = 'rotate(-5deg) scale(1)';
        });

        closeBtn.addEventListener('click', () => {
            this.close();
        });

        // Assemble DOM
        iframeContainer.appendChild(this.iframe);
        container.appendChild(iframeContainer);
        container.appendChild(closeBtn);
        this.overlay.appendChild(container);
        document.body.appendChild(this.overlay);

        // Add animation effect
        this.overlay.style.opacity = '0';
        this.overlay.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.overlay.style.transition = 'all 0.3s ease';
            this.overlay.style.opacity = '1';
            this.overlay.style.transform = 'scale(1)';
        }, 10);

        this.isOpen = true;

        // Prevent background scrolling
        document.body.style.overflow = 'hidden';

        // Close on overlay click
        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay) {
                this.close();
            }
        });

        console.log('📄 Whitepaper modal created and displayed successfully');
    }

    // Close whitepaper
    close() {
        if (!this.isOpen) return;

        // Add closing animation
        this.overlay.style.transition = 'all 0.3s ease';
        this.overlay.style.opacity = '0';
        this.overlay.style.transform = 'scale(0.9)';

        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
            this.iframe = null;
            this.isOpen = false;

            // Restore background scrolling
            document.body.style.overflow = '';
        }, 300);
    }

    // Toggle display state
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.show();
        }
    }
}

// Make WhitepaperModal available globally for script tag usage
window.WhitepaperModal = WhitepaperModal; 