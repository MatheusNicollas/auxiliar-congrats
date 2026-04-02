// script.js
const totalSteps = 6;
let currentStep = 0;

const formData = {
    name: '',
    relation: '',
    tone: '',
    trait: '',
    memory: '',
    length: ''
};

const progressHeader = document.getElementById('progress-header');
const progressText = document.getElementById('progress-text');
const progressBarFill = document.getElementById('progress-bar-fill');
const backBtn = document.getElementById('back-btn');

document.addEventListener('DOMContentLoaded', () => {
    const inputName = document.getElementById('input-name');
    const btnNext1 = document.getElementById('btn-next-1');
    inputName.addEventListener('input', (e) => {
        formData.name = e.target.value.trim();
        btnNext1.disabled = formData.name.length === 0;
    });

    const inputMemory = document.getElementById('input-memory');
    inputMemory.addEventListener('input', (e) => {
        formData.memory = e.target.value.trim();
    });

    const inputTrait = document.getElementById('input-trait');
    inputTrait.addEventListener('input', (e) => {
        formData.trait = e.target.value.trim();
        updateChips(formData.trait);
    });

    backBtn.addEventListener('click', prevStep);

    // Allow 'Enter' key to progress on input fields
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const nextBtn = input.closest('section').querySelector('.primary-btn');
                if (nextBtn && !nextBtn.disabled) {
                    nextStep();
                }
            }
        });
    });
});

function updateProgress() {
    if (currentStep === 0 || currentStep > totalSteps) {
        progressHeader.classList.add('hidden');
    } else {
        progressHeader.classList.remove('hidden');
        progressText.innerText = `Passo ${currentStep} de ${totalSteps}`;
        const percentage = ((currentStep) / totalSteps) * 100;
        progressBarFill.style.width = `${percentage}%`;
    }
}

function showStep(stepIndex, direction = 'forward') {
    const currentActive = document.querySelector('.step.active');
    const nextActive = document.getElementById(stepIndex > totalSteps ? 'step-final' : `step-${stepIndex}`);

    if (currentActive) {
        currentActive.classList.remove('active');
        if (direction === 'forward') {
            currentActive.classList.add('slide-out-left');
        } else {
            currentActive.classList.add('slide-out-right');
        }

        setTimeout(() => {
            currentActive.classList.remove('slide-out-left', 'slide-out-right');
        }, 400);
    }

    if (nextActive) {
        nextActive.classList.add('active');
        nextActive.classList.remove('slide-out-left', 'slide-out-right');
    }

    updateProgress();

    if (nextActive && stepIndex <= totalSteps) {
        const firstInput = nextActive.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 400);
        }
    }

    if (stepIndex > totalSteps) {
        generateMessage();
    }
}

function nextStep() {
    if (currentStep <= totalSteps) {
        currentStep++;
        showStep(currentStep, 'forward');
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep, 'backward');
    }
}

function selectOption(field, value) {
    formData[field] = value;

    setTimeout(() => {
        nextStep();
    }, 150);
}

function addSuggestion(field, value) {
    const input = document.getElementById(`input-${field}`);
    input.value = value;
    formData[field] = value;

    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);

    updateChips(value);
}

function updateChips(currentValue) {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        if (chip.innerText.toLowerCase() === currentValue.toLowerCase()) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

function skipStep4() {
    formData.memory = '';
    const inputMemory = document.getElementById('input-memory');
    inputMemory.value = '';
    nextStep();
}

function skipStep5() {
    formData.trait = '';
    const inputTrait = document.getElementById('input-trait');
    inputTrait.value = '';
    nextStep();
}

function resetApp() {
    currentStep = 0;

    // Clear formData
    Object.keys(formData).forEach(k => formData[k] = '');

    // Clear inputs
    document.querySelectorAll('input').forEach(input => input.value = '');

    // Disable buttons
    document.getElementById('btn-next-1').disabled = true;

    // Reset chips
    updateChips('');

    showStep(0, 'backward');
}

async function generateMessage() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('result-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');

    try {
        const response = await fetch('https://project-dg73v.vercel.app/api/OpenApiIntegration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        let msgText = '';
        if (data && data.reply) msgText = data.reply;
        else if (data && data.message) msgText = data.message;
        else if (data && data.response) msgText = data.response;
        else if (data && data.text) msgText = data.text;
        else if (typeof data === 'string') msgText = data;
        else msgText = JSON.stringify(data, null, 2);

        document.getElementById('generated-message').innerText = msgText;

        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('result-state').classList.remove('hidden');

        triggerConfetti();

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('error-state').classList.remove('hidden');
    }
}

function triggerConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        document.body.appendChild(confetti);

        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function copyMessage() {
    const message = document.getElementById('generated-message').innerText;
    const btn = document.getElementById('copy-btn');

    navigator.clipboard.writeText(message).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copiado!`;
        btn.style.backgroundColor = 'var(--success-color)';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy!', err);
    });
}
function shareWhatsApp() {
    const message = document.getElementById('generated-message').innerText;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
