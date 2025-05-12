document.addEventListener('DOMContentLoaded', () => {
    const keyboard = {
        currentLanguage: 'en',
        isShiftActive: false,
        inputField: document.getElementById('testInput'),
        backspaceInterval: null,
        pressedKeys: new Set(),
        activeKey: null,
        lastTouchTime: 0,

        init() {
            this.setLanguage(navigator.language.startsWith('ar') ? 'ar' : 'en');
            this.setupEventListeners();
            this.inputField.focus();
        },

        setupEventListeners() {
            // Mouse events for desktop
            document.addEventListener('mousedown', (e) => this.handleKeyPressStart(e));
            document.addEventListener('mouseup', () => this.handleKeyPressEnd());
            document.addEventListener('mouseleave', () => this.handleKeyPressEnd());
            
            // Touch events for mobile
            document.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.lastTouchTime = Date.now();
                this.handleKeyPressStart(e);
            }, { passive: false });
            
            document.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleKeyPressEnd();
            }, { passive: false });
            
            // Click events for the generate buttons (works for both touch and mouse)
            document.getElementById('generateTextKey').addEventListener('click', (e) => {
                e.preventDefault();
                this.generateName();
            });
            
            document.getElementById('generateEmailKey').addEventListener('click', (e) => {
                e.preventDefault();
                this.generateEmail();
            });

            document.getElementById('darkModeToggle').addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                document.getElementById('darkIcon').classList.toggle('hidden');
                document.getElementById('lightIcon').classList.toggle('hidden');
            });
        },

        handleKeyPressStart(e) {
            const key = e.target.closest('.key');
            if (!key) return;
            
            this.activeKey = key;
            key.classList.add('active');
            
            // Handle special keys immediately
            if (key.id === 'backspaceKey') {
                this.backspace();
                this.backspaceInterval = setInterval(() => this.backspace(), 100);
            } else if (key.id === 'generateTextKey') {
                this.generateName();
            } else if (key.id === 'generateEmailKey') {
                this.generateEmail();
            } else if (key.dataset.char) {
                const char = this.currentLanguage === 'ar'
                    ? this.isShiftActive ? (key.dataset.arSecondary || key.dataset.ar) : key.dataset.ar
                    : this.isShiftActive ? (key.dataset.secondary || key.dataset.char) : key.dataset.char;
                this.insertText(char);
            }
        },

        handleKeyPressEnd() {
            if (this.activeKey) {
                this.activeKey.classList.remove('active');
                clearInterval(this.backspaceInterval);
                this.activeKey = null;
            }
        },

        // باقي الدوال تبقى كما هي بدون تغيير...
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