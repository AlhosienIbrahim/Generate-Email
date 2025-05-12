document.addEventListener('DOMContentLoaded', () => {
    const keyboard = {
        currentLanguage: 'en',
        isShiftActive: false,
        inputField: document.getElementById('testInput'),
        backspaceTimeout: null,
        backspaceInterval: null,
        activeKey: null,
        isTouchActive: false,
        hasInserted: false,
        lastTouchTime: 0,

        init() {
            this.setLanguage(navigator.language.startsWith('ar') ? 'ar' : 'en');
            this.setupEventListeners();
            this.inputField.focus();
        },

        setupEventListeners() {
            // Touch events for mobile
            document.addEventListener('touchstart', (e) => {
                const now = Date.now();
                if (now - this.lastTouchTime < 100) return; // Debounce touch events
                this.lastTouchTime = now;

                if (this.isTouchActive) return;
                this.handleTouchStart(e);
            }, { passive: false });

            document.addEventListener('touchmove', (e) => {
                this.handleTouchMove(e);
            }, { passive: false });

            document.addEventListener('touchend', (e) => {
                this.handleTouchEnd(e);
            }, { passive: false });

            document.addEventListener('touchcancel', () => {
                this.handleTouchEnd();
            }, { passive: false });

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
            document.getElementById('generateTextKey').addEventListener('click', (e) => {
                e.preventDefault();
                this.generateName();
                this.inputField.focus();
            });

            document.getElementById('generateEmailKey').addEventListener('click', (e) => {
                e.preventDefault();
                this.generateEmail();
                this.inputField.focus();
            });

            document.getElementById('darkModeToggle').addEventListener('click', (e) => {
                e.preventDefault();
                document.body.classList.toggle('dark-mode');
                document.getElementById('darkIcon').classList.toggle('hidden');
                document.getElementById('lightIcon').classList.toggle('hidden');
                this.inputField.focus();
            });

            // Special keys
            document.getElementById('shiftKey').addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleShift();
                this.inputField.focus();
            });

            document.getElementById('langKey').addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleLanguage();
                this.inputField.focus();
            });

            document.getElementById('spaceKey').addEventListener('click', (e) => {
                e.preventDefault();
                this.insertText(' ');
                this.inputField.focus();
            });

            document.getElementById('enterKey').addEventListener('click', (e) => {
                e.preventDefault();
                this.insertText('\n');
                this.inputField.focus();
            });

            // Backspace key
            const backspaceKey = document.getElementById('backspaceKey');
            backspaceKey.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.isTouchActive) {
                    this.isTouchActive = true;
                    this.activeKey = backspaceKey;
                    backspaceKey.classList.add('active');
                    this.backspace();
                    this.backspaceTimeout = setTimeout(() => {
                        this.backspaceInterval = setInterval(() => this.backspace(), 100);
                    }, 300);
                }
            }, { passive: false });

            backspaceKey.addEventListener('touchend', () => {
                this.handleBackspaceEnd();
            }, { passive: false });

            backspaceKey.addEventListener('touchcancel', () => {
                this.handleBackspaceEnd();
            }, { passive: false });

            backspaceKey.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.activeKey = backspaceKey;
                backspaceKey.classList.add('active');
                this.backspace();
                this.backspaceTimeout = setTimeout(() => {
                    this.backspaceInterval = setInterval(() => this.backspace(), 100);
                }, 300);
            });

            backspaceKey.addEventListener('mouseup', () => {
                this.handleBackspaceEnd();
            });

            backspaceKey.addEventListener('mouseleave', () => {
                this.handleBackspaceEnd();
            });

            // Regular keys - modified to prevent duplicate events
            document.querySelectorAll('.key[data-char]:not(#backspaceKey)').forEach(key => {
                // Remove click event listener to prevent duplicates
                key.addEventListener('touchend', (e) => {
                    if (this.activeKey === key && !this.hasInserted) {
                        e.preventDefault();
                        const char = this.currentLanguage === 'ar'
                            ? this.isShiftActive ? (key.dataset.arSecondary || key.dataset.ar) : key.dataset.ar
                            : this.isShiftActive ? (key.dataset.secondary || key.dataset.char) : key.dataset.char;
                        this.insertText(char);
                        this.hasInserted = true;
                        this.inputField.focus();
                    }
                }, { passive: false });

                key.addEventListener('click', (e) => {
                    // Only process click if not from touch event
                    if (!('ontouchstart' in window) || !this.isTouchActive) {
                        e.preventDefault();
                        const char = this.currentLanguage === 'ar'
                            ? this.isShiftActive ? (key.dataset.arSecondary || key.dataset.ar) : key.dataset.ar
                            : this.isShiftActive ? (key.dataset.secondary || key.dataset.char) : key.dataset.char;
                        this.insertText(char);
                        this.inputField.focus();
                    }
                });
            });
        },

        handleTouchStart(e) {
            if (this.isTouchActive) return;
            this.isTouchActive = true;
            this.hasInserted = false;
            const touch = e.touches[0];
            const key = document.elementFromPoint(touch.clientX, touch.clientY);
            if (key && key.classList.contains('key') && key.dataset.char && key.id !== 'backspaceKey') {
                this.activeKey = key;
                key.classList.add('active');
                e.preventDefault();
            } else {
                this.isTouchActive = false;
            }
        },

        handleTouchMove(e) {
            if (!this.activeKey) return;
            const touch = e.touches[0];
            const currentKey = document.elementFromPoint(touch.clientX, touch.clientY);
            if (currentKey !== this.activeKey) {
                this.activeKey.classList.remove('active');
                this.activeKey = null;
                this.isTouchActive = false;
                this.hasInserted = false;
            }
        },

        handleTouchEnd(e) {
            if (this.activeKey && this.activeKey.dataset.char && this.activeKey.id !== 'backspaceKey' && !this.hasInserted) {
                const char = this.currentLanguage === 'ar'
                    ? this.isShiftActive ? (this.activeKey.dataset.arSecondary || this.activeKey.dataset.ar) : this.activeKey.dataset.ar
                    : this.isShiftActive ? (this.activeKey.dataset.secondary || this.activeKey.dataset.char) : this.activeKey.dataset.char;
                this.insertText(char);
                this.hasInserted = true;
                this.inputField.focus();
                e.preventDefault();
            }
            if (this.activeKey) {
                this.activeKey.classList.remove('active');
                this.activeKey = null;
            }
            this.isTouchActive = false;
            this.hasInserted = false;
        },

        handleMouseDown(e) {
            const key = e.target.closest('.key');
            if (key && key.dataset.char && key.id !== 'backspaceKey') {
                this.activeKey = key;
                key.classList.add('active');
            }
        },

        handleMouseUp() {
            if (this.activeKey && this.activeKey.dataset.char && this.activeKey.id !== 'backspaceKey') {
                const char = this.currentLanguage === 'ar'
                    ? this.isShiftActive ? (this.activeKey.dataset.arSecondary || this.activeKey.dataset.ar) : this.activeKey.dataset.ar
                    : this.isShiftActive ? (this.activeKey.dataset.secondary || this.activeKey.dataset.char) : this.activeKey.dataset.char;
                this.insertText(char);
                this.inputField.focus();
            }
            if (this.activeKey) {
                this.activeKey.classList.remove('active');
                this.activeKey = null;
            }
        },

        handleBackspaceEnd() {
            if (this.activeKey) {
                this.activeKey.classList.remove('active');
                this.activeKey = null;
            }
            clearTimeout(this.backspaceTimeout);
            clearInterval(this.backspaceInterval);
            this.isTouchActive = false;
            this.inputField.focus();
        },

        insertText(text) {
            const start = this.inputField.selectionStart;
            const end = this.inputField.selectionEnd;
            this.inputField.value = this.inputField.value.substring(0, start) + text +
                this.inputField.value.substring(end);
            this.inputField.selectionStart = this.inputField.selectionEnd = start + text.length;
        },

        backspace() {
            const start = this.inputField.selectionStart;
            const end = this.inputField.selectionEnd;

            if (start === 0 && start === end) return;

            if (start === end) {
                const text = this.inputField.value;
                const charStart = start - 1;
                this.inputField.value = text.substring(0, charStart) + text.substring(start);
                this.inputField.selectionStart = this.inputField.selectionEnd = charStart;
            } else {
                this.inputField.value = this.inputField.value.substring(0, start) +
                    this.inputField.value.substring(end);
                this.inputField.selectionStart = this.inputField.selectionEnd = start;
            }
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
            const langKey = document.getElementById('langKey');
            langKey.textContent = lang === 'en' ? 'عربي' : 'English';
            langKey.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
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
