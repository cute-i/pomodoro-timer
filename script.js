class PomodoroTimer {
    constructor() {
        this.currentPhase = 'idle';
        this.timeLeft = 25 * 60;
        this.totalTime = 25 * 60;
        this.intervalId = null;
        this.pomodoroCount = 0;
        this.phaseOrder = ['working', 'breaking', 'working', 'breaking', 'working', 'breaking', 'working', 'long-breaking'];
        this.phaseIndex = 0;
        
        this.initElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initElements() {
        this.timeDisplay = document.getElementById('time');
        this.statusDisplay = document.getElementById('status');
        this.progressBar = document.getElementById('progress');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.focusInput = document.getElementById('focus-duration');
        this.breakInput = document.getElementById('break-duration');
        this.longBreakInput = document.getElementById('long-break-duration');
        this.pomodoroCountDisplay = document.getElementById('pomodoro-count');
        this.timerCircle = document.querySelector('.timer-circle');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.skipBtn.addEventListener('click', () => this.skip());
        this.focusInput.addEventListener('change', () => this.handleDurationChange());
        this.breakInput.addEventListener('change', () => this.handleDurationChange());
        this.longBreakInput.addEventListener('change', () => this.handleDurationChange());
    }

    getPhaseDuration(phase) {
        switch(phase) {
            case 'working':
                return parseInt(this.focusInput.value) * 60;
            case 'breaking':
                return parseInt(this.breakInput.value) * 60;
            case 'long-breaking':
                return parseInt(this.longBreakInput.value) * 60;
            default:
                return 25 * 60;
        }
    }

    getPhaseName(phase) {
        switch(phase) {
            case 'working':
                return '专注中';
            case 'breaking':
                return '休息中';
            case 'long-breaking':
                return '长休息';
            default:
                return '准备开始';
        }
    }

    getPhaseColor(phase) {
        switch(phase) {
            case 'working':
                return '#fc8181';
            case 'breaking':
                return '#48bb78';
            case 'long-breaking':
                return '#646cff';
            default:
                return '#4a5568';
        }
    }

    start() {
        if (this.currentPhase === 'idle') {
            this.currentPhase = 'working';
            this.totalTime = this.getPhaseDuration('working');
            this.timeLeft = this.totalTime;
            this.phaseIndex = 0;
        }

        this.intervalId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.completePhase();
            }
        }, 1000);

        this.updateControls();
    }

    pause() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.updateControls();
    }

    reset() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.currentPhase = 'idle';
        this.timeLeft = this.getPhaseDuration('working');
        this.totalTime = this.timeLeft;
        this.phaseIndex = 0;
        
        this.updateDisplay();
        this.updateControls();
        this.clearFlash();
    }

    skip() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.completePhase();
    }

    completePhase() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.currentPhase === 'working') {
            this.pomodoroCount++;
            this.pomodoroCountDisplay.textContent = this.pomodoroCount;
        }

        this.playNotificationSound();
        this.flashTimer();

        setTimeout(() => {
            this.nextPhase();
        }, 1000);
    }

    nextPhase() {
        this.phaseIndex++;
        
        if (this.phaseIndex >= this.phaseOrder.length) {
            this.phaseIndex = 0;
        }

        this.currentPhase = this.phaseOrder[this.phaseIndex];
        this.totalTime = this.getPhaseDuration(this.currentPhase);
        this.timeLeft = this.totalTime;

        this.updateDisplay();
        this.updateControls();
        this.clearFlash();
        this.start();
    }

    handleDurationChange() {
        if (this.currentPhase === 'idle') {
            this.timeLeft = this.getPhaseDuration('working');
            this.totalTime = this.timeLeft;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.timeDisplay.textContent = formattedTime;
        this.statusDisplay.textContent = this.getPhaseName(this.currentPhase);
        this.statusDisplay.className = `status-value ${this.currentPhase}`;
        
        this.updateProgress();
    }

    updateProgress() {
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const degrees = progress * 360;
        
        this.progressBar.style.setProperty('--progress-deg', `${degrees}deg`);
        
        const color = this.getPhaseColor(this.currentPhase);
        this.progressBar.style.background = `conic-gradient(${color} 0deg, transparent ${degrees}deg)`;
    }

    updateControls() {
        const isRunning = this.intervalId !== null;
        
        this.startBtn.disabled = isRunning;
        this.pauseBtn.disabled = !isRunning;
        this.skipBtn.disabled = !isRunning;
        this.resetBtn.disabled = false;
        
        this.focusInput.disabled = isRunning;
        this.breakInput.disabled = isRunning;
        this.longBreakInput.disabled = isRunning;
    }

    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    flashTimer() {
        this.timerCircle.classList.add('flash');
    }

    clearFlash() {
        this.timerCircle.classList.remove('flash');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});