// Violet Template - Interactive JavaScript

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    
    // Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Animate icon
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (mobileMenu.classList.contains('hidden')) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    const mobileLinks = mobileMenu?.querySelectorAll('a');
    if (mobileLinks) {
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                const icon = menuToggle?.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Update slider values
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
        const updateValue = () => {
            const value = slider.value;
            const max = slider.max || 100;
            const percentage = (value / max) * 100;
            
            // Find the associated value display
            const parent = slider.closest('.bg-white\\/5, [class*="bg-"]');
            const valueDisplay = parent?.querySelector('span.font-bold');
            
            if (valueDisplay) {
                if (slider.min === '0' && slider.max === '100') {
                    valueDisplay.textContent = `${value}%`;
                } else {
                    valueDisplay.textContent = value;
                }
            }
        };
        
        slider.addEventListener('input', updateValue);
        updateValue(); // Initial update
    });
    
    // Button click animations
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Form validation and submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message
            const button = this.querySelector('button[type="submit"]');
            if (button) {
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check mr-2"></i>ส่งสำเร็จ!';
                button.disabled = true;
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                    form.reset();
                }, 2000);
            }
        });
    });
    
    // Add fade-in animation to sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';
                entry.target.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Card hover effect enhancement
    const cards = document.querySelectorAll('.bg-white\\/5');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Stat counter animation
    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            
            if (element.textContent.includes('$')) {
                element.textContent = '$' + value.toLocaleString();
            } else if (element.textContent.includes('K')) {
                element.textContent = value.toLocaleString() + 'K';
            } else {
                element.textContent = value.toLocaleString();
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };
    
    // Observe stat cards for animation
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statValue = entry.target.querySelector('.text-3xl');
                if (statValue) {
                    const text = statValue.textContent;
                    const numMatch = text.match(/\d+/);
                    if (numMatch) {
                        const endValue = parseInt(numMatch[0]);
                        animateValue(statValue, 0, endValue, 2000);
                    }
                }
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.text-center:has(.text-3xl)').forEach(stat => {
        statObserver.observe(stat);
    });
    
    // Notification system
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'from-green-600 to-teal-600',
            error: 'from-red-600 to-pink-600',
            warning: 'from-yellow-600 to-orange-600',
            info: 'from-purple-600 to-blue-600'
        };
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        notification.className = `fixed top-20 right-4 z-50 px-6 py-4 bg-gradient-to-r ${colors[type]} rounded-lg shadow-lg text-white flex items-center gap-3 animate-fade-in`;
        notification.innerHTML = `
            <i class="fas ${icons[type]} text-xl"></i>
            <span>${message}</span>
            <button class="ml-4 hover:text-gray-200" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    };
    
    // Add animation classes
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(animationStyles);
    
    console.log('Violet Template initialized successfully! 🎉');
});

// Utility functions
const VioletTemplate = {
    // Show loading spinner
    showLoading: function(element) {
        if (!element) return;
        const spinner = document.createElement('div');
        spinner.className = 'spinner mx-auto';
        spinner.style.cssText = `
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-left-color: #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        `;
        element.appendChild(spinner);
    },
    
    // Hide loading spinner
    hideLoading: function(element) {
        if (!element) return;
        const spinner = element.querySelector('.spinner');
        if (spinner) spinner.remove();
    },
    
    // Scroll to top
    scrollToTop: function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },
    
    // Copy to clipboard
    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            if (window.showNotification) {
                window.showNotification('คัดลอกสำเร็จ!', 'success');
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
};

// Export for use in other scripts
window.VioletTemplate = VioletTemplate;
