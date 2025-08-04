/**
 * UI Effects Module
 * Handles interactive effects, animations, and social media sharing
 */

class UIEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupClickEffects();
        this.setupHoverEffects();
        this.setupSocialMediaShare();
        this.setupFixedPanels();
    }

    // Click Effects
    setupClickEffects() {
        document.addEventListener('click', (e) => {
            this.addClickAnimation(e.target);
        });

        // Add ripple effect to buttons
        const buttons = document.querySelectorAll('button, .btn, .countdown-block');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRippleEffect(e, button);
            });
        });
    }

    addClickAnimation(element) {
        if (element.classList.contains('clickable') || 
            element.tagName === 'BUTTON' || 
            element.closest('button')) {
            
            element.style.transform = 'scale(0.95)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 150);
        }
    }

    createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Hover Effects
    setupHoverEffects() {
        // Add hover effects to interactive elements
        const interactiveElements = document.querySelectorAll('.countdown-block, .panel, .btn, .social-btn');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.addHoverEffect(element);
            });
            
            element.addEventListener('mouseleave', () => {
                this.removeHoverEffect(element);
            });
        });
    }

    addHoverEffect(element) {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    }

    removeHoverEffect(element) {
        element.style.transform = 'translateY(0)';
        element.style.boxShadow = '';
    }

    // Social Media Sharing
    setupSocialMediaShare() {
        const shareButtons = document.querySelectorAll('.social-btn');
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = this.getPlatformFromButton(button);
                this.share(platform);
            });
        });
    }

    getPlatformFromButton(button) {
        const href = button.getAttribute('href') || '';
        const text = button.textContent.toLowerCase();
        
        if (href.includes('twitter.com') || text.includes('twitter') || text.includes('x')) {
            return 'twitter';
        } else if (href.includes('telegram.me') || text.includes('telegram')) {
            return 'telegram';
        } else if (href.includes('discord.gg') || text.includes('discord')) {
            return 'discord';
        } else if (href.includes('reddit.com') || text.includes('reddit')) {
            return 'reddit';
        } else {
            return 'copy';
        }
    }

    share(platform) {
        const url = window.location.href;
        const title = '🚀 Meme Coin Launch - Join the Moon Mission!';
        const text = 'Check out this amazing meme coin launch countdown! TO THE MOON! 🚀';
        
        const shareData = {
            title: title,
            text: text,
            url: url
        };

        switch (platform) {
            case 'twitter':
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                window.open(twitterUrl, '_blank');
                break;
                
            case 'telegram':
                const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
                window.open(telegramUrl, '_blank');
                break;
                
            case 'discord':
                const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2048&scope=bot`;
                window.open(discordUrl, '_blank');
                break;
                
            case 'reddit':
                const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
                window.open(redditUrl, '_blank');
                break;
                
            case 'copy':
            default:
                if (navigator.share) {
                    navigator.share(shareData);
                } else {
                    this.copyToClipboard(url);
                    this.showCopyNotification();
                }
                break;
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    showCopyNotification() {
        const notification = document.createElement('div');
        notification.textContent = 'Link copied to clipboard!';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ade80;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    // Fixed Panels
    setupFixedPanels() {
        this.setupRefreshCountdown();
        this.setupWalletConnection();
        this.setupFloatingElements();
    }

    setupRefreshCountdown() {
        const refreshCount = document.getElementById('refreshCount');
        if (!refreshCount) return;

        let count = 10;
        setInterval(() => {
            count = count === 0 ? 10 : count - 1;
            refreshCount.textContent = count;
        }, 1000);
    }

    setupWalletConnection() {
        const walletConnectBtn = document.querySelector('.wallet-connect-btn');
        const statusText = document.querySelector('.status-text');

        if (walletConnectBtn && statusText) {
            walletConnectBtn.addEventListener('click', () => {
                // Simulate wallet connection
                statusText.textContent = 'Connected';
                walletConnectBtn.textContent = '🔗 Connected';
                walletConnectBtn.style.backgroundColor = '#4ade80';
            });
        }
    }

    setupFloatingElements() {
        // Add floating animation to decorative elements
        const floatingElements = document.querySelectorAll('.floating, .emoji');
        floatingElements.forEach(element => {
            element.style.animation = `float 3s ease-in-out infinite`;
        });

        // Add pulse animation to important elements
        const pulseElements = document.querySelectorAll('.pulse, .countdown-number');
        pulseElements.forEach(element => {
            element.style.animation = `pulse 2s ease-in-out infinite`;
        });
    }

    // Utility Methods
    addCSSAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes float {
                0%, 100% {
                    transform: translateY(0px);
                }
                50% {
                    transform: translateY(-10px);
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
            }
            
            @keyframes spin-slow {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }

    start() {
        // UI Effects are already started in init()
        console.log('UI Effects started');
    }

    destroy() {
        // Clean up any event listeners or intervals if needed
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIEffects };
} else {
    // Browser environment - expose to global scope
    window.UIEffects = UIEffects;
} 