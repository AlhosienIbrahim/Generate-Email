document.addEventListener('DOMContentLoaded', () => {
    const keyboard = {
        currentLanguage: 'en',
        isShiftActive: false,
        inputField: document.getElementById('testInput'),
        backspaceInterval: null,
        activeKey: null,
        touchStartTime: 0,

        init() {
            this.setLanguage(navigator.language.startsWith('ar') ? 'ar' : 'en');
            this.setupEventListeners();
            this.inputField.focus();
        },

        setupEventListeners() {
            // Touch events for mobile
            document.addEventListener('touchstart', (e) => {
                this.handleTouchStart(e);
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                this.handleTouchEnd(e);
            }, { passive: true });

            document.addEventListener('touchcancel', () => {
                this.handleTouchEnd();
            }, { passive: true });

            // Mouse events for desktop fallback
            document.addEventListener('mousedown', (e) => {
                this.handleMouseDown(e);
            });

            document.addEventListener('mouseup', () => {
                this.handleMouseUp();
            });

            document.addEventListener('mouseleave', () => {
                this.handleMouseUp();
            });

            // Special buttons
            document.getElementById('generateTextKey').addEventListener('click', () => {
                this.generateName();
            });

            document.getElementById('generateEmailKey').addEventListener('click', () => {
                this.generateEmail();
            });

            document.getElementById('darkModeToggle').addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                document.getElementById('darkIcon').classList.toggle('hidden');
                document.getElementById('lightIcon').classList.toggle('hidden');
            });

            // Special keys
            document.getElementById('shiftKey').addEventListener('click', () => {
                this.toggleShift();
            });

            document.getElementById('langKey').addEventListener('click', () => {
                this.toggleLanguage();
            });

            document.getElementById('spaceKey').addEventListener('click', () => {
                this.insertText(' ');
            });

            document.getElementById('enterKey').addEventListener('click', () => {
                this.insertText('\n');
            });
        },

        handleTouchStart(e) {
            this.touchStartTime = Date.now();
            const touch = e.touches[0];
            const key = document.elementFromPoint(touch.clientX, touch.clientY);
            if (key && key.classList.contains('key')) {
                this.activeKey = key;
                key.classList.add('active');
                this.handleKeyPress(key);
            }
        },

        handleTouchEnd(e) {
            if (this.activeKey) {
                this.activeKey.classList.remove('active');
                clearInterval(this.backspaceInterval);
                
                // Check if it's a long press (more than 300ms)
                if (Date.now() - this.touchStartTime > 300 && 
                    this.activeKey.id === 'backspaceKey') {
                    clearInterval(this.backspaceInterval);
                }
                
                this.activeKey = null;
            }
        },

        handleMouseDown(e) {
            const key = e.target.closest('.key');
            if (key) {
                this.activeKey = key;
                key.classList.add('active');
                this.handleKeyPress(key);
            }
        },

        handleMouseUp() {
            if (this.activeKey) {
                this.activeKey.classList.remove('active');
                clearInterval(this.backspaceInterval);
                this.activeKey = null;
            }
        },

        handleKeyPress(key) {
            if (key.id === 'backspaceKey') {
                this.backspace();
                this.backspaceInterval = setInterval(() => this.backspace(), 100);
            } else if (key.dataset.char) {
                const char = this.currentLanguage === 'ar'
                    ? this.isShiftActive ? (key.dataset.arSecondary || key.dataset.ar) : key.dataset.ar
                    : this.isShiftActive ? (key.dataset.secondary || key.dataset.char) : key.dataset.char;
                this.insertText(char);
            }
        },

        insertText(text) {
            const start = this.inputField.selectionStart;
            const end = this.inputField.selectionEnd;
            this.inputField.value = this.inputField.value.substring(0, start) + text + 
                                  this.inputField.value.substring(end);
            this.inputField.selectionStart = this.inputField.selectionEnd = start + text.length;
            this.inputField.focus();
        },

        backspace() {
            const start = this.inputField.selectionStart;
            const end = this.inputField.selectionEnd;
            
            if (start === 0 && start === end) return;
            
            if (start === end) {
                this.inputField.value = this.inputField.value.substring(0, start - 1) + 
                                    this.inputField.value.substring(start);
                this.inputField.selectionStart = this.inputField.selectionEnd = start - 1;
            } else {
                this.inputField.value = this.inputField.value.substring(0, start) + 
                                    this.inputField.value.substring(end);
                this.inputField.selectionStart = this.inputField.selectionEnd = start;
            }
            this.inputField.focus();
        },

        toggleShift() {
            this.isShiftActive = !this.isShiftActive;
            document.getElementById('shiftKey').classList.toggle('active', this.isShiftActive);
            this.updateKeyLabels();
        },

        toggleLanguage() {
            this.setLanguage(this.currentLanguage === 'en' ? 'ar' : 'en');
        },

        setLanguage(lang) {
            this.currentLanguage = lang;
            document.getElementById('langKey').textContent = lang === 'en' ? 'عربي' : 'English';
            this.updateKeyLabels();
        },

        updateKeyLabels() {
            document.querySelectorAll('.key[data-char]').forEach(key => {
                const primaryChar = this.currentLanguage === 'ar'
                    ? this.isShiftActive ? (key.dataset.arSecondary || key.dataset.ar) : key.dataset.ar
                    : this.isShiftActive ? (key.dataset.secondary || key.dataset.char) : key.dataset.char;
                const secondaryChar = this.currentLanguage === 'ar'
                    ? this.isShiftActive ? key.dataset.ar : (key.dataset.arSecondary || '')
                    : this.isShiftActive ? key.dataset.char : (key.dataset.secondary || '');

                key.innerHTML = `<span>${primaryChar}</span>${secondaryChar ? `<span class="secondary-char">${secondaryChar}</span>` : ''}`;
            });
        },

        generateRandomName(length) {
            const vowels = 'aeiou';
            const consonants = 'bcdfghjklmnpqrstvwxyz';
            let name = '';
            for (let i = 0; i < length; i++) {
                name += i % 2 === 0
                    ? consonants.charAt(Math.floor(Math.random() * consonants.length))
                    : vowels.charAt(Math.floor(Math.random() * vowels.length));
            }
            return name.charAt(0).toUpperCase() + name.slice(1);
        },

        generateName() {
            const firstName = this.generateRandomName(3 + Math.floor(Math.random() * 5));
            const lastName = this.generateRandomName(3 + Math.floor(Math.random() * 7));
            this.insertText(`${firstName} ${lastName}`);
        },

        generateEmail() {
            const firstName = this.generateRandomName(3 + Math.floor(Math.random() * 5)).toLowerCase();
            const lastName = this.generateRandomName(3 + Math.floor(Math.random() * 7)).toLowerCase();
            const randomNum = Math.floor(Math.random() * 1000);
            const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com'];
            this.insertText(`${firstName}.${lastName}${randomNum}@${domains[Math.floor(Math.random() * domains.length)]}`);
        }
    };

    keyboard.init();
});
