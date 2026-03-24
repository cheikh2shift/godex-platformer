class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.loadSounds();
    }

    loadSounds() {
        const soundFiles = {
            'jump': 'assets/sounds/sfx_jump.ogg',
            'coin': 'assets/sounds/sfx_coin.ogg',
            'hurt': 'assets/sounds/sfx_hurt.ogg',
            'gem': 'assets/sounds/sfx_gem.ogg',
            'magic': 'assets/sounds/sfx_magic.ogg'
        };

        for (const [name, path] of Object.entries(soundFiles)) {
            const audio = new Audio(path);
            audio.preload = 'auto';
            this.sounds[name] = audio;
        }
    }

    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName].cloneNode();
        sound.volume = 0.5;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

const soundManager = new SoundManager();
