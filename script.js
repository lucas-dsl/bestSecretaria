const formData = {};

function closeModalOnOutsideClick(event) {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent.contains(event.target) && event.target.id === 'registrationModal') {
        closeModal();
    }
}

function openModal() {
    const modal = document.getElementById('registrationModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    nextStep(1);
}

function closeModal() {
    const modal = document.getElementById('registrationModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach(step => step.classList.remove('active'));
    document.getElementById('step-1').classList.add('active');
}

function displayError(inputId, message) {
    const inputElement = document.getElementById(inputId);
    const errorElement = document.getElementById(`error-${inputId}`);

    if (errorElement) {
        if (message) {
            inputElement.classList.add('input-error');
            errorElement.textContent = message;
        } else {
            inputElement.classList.remove('input-error');
            errorElement.textContent = '';
        }
    }
}

function handleStep1Validation() {
    if (validateCurrentStep('step-1')) {
        nextStep(2);
    }
}

function validateCurrentStep(stepId) {
    let isValid = true;

    if (stepId === 'step-1') {
        const nameInput = document.getElementById('fullName');
        const whatsappInput = document.getElementById('whatsapp');

        displayError('fullName', '');
        displayError('whatsapp', '');

        if (!nameInput.value.trim()) {
            displayError('fullName', 'Por favor, digite seu nome completo.');
            isValid = false;
        }

        const phoneCleaned = whatsappInput.value.replace(/\D/g, '');
        const phoneRegex = /^\d{10,11}$/;

        if (!whatsappInput.value.trim()) {
            displayError('whatsapp', 'O campo WhatsApp é obrigatório.');
            isValid = false;
        } else if (!phoneRegex.test(phoneCleaned)) {
            displayError('whatsapp', 'Número inválido. Use 10 ou 11 dígitos (com DDD).');
            isValid = false;
        }

        return isValid;
    }

    if (stepId === 'step-2') {
        const selectedWorkplace = document.querySelector('input[name="workplace"]:checked');
        const questionTitle = document.querySelector('#form-step-2 .question-title');

        if (!selectedWorkplace) {
            questionTitle.style.color = '#ff4d4f';
            setTimeout(() => questionTitle.style.color = 'var(--color-text-dark)', 1000);
            return false;
        }
        questionTitle.style.color = 'var(--color-text-dark)';
        return true;
    }

    if (stepId === 'step-3') {
        const toolsChecked = document.querySelectorAll('input[name="tools"]:checked');
        const questionTitle = document.querySelector('#form-step-3 .question-title');

        // Valida que pelo menos uma ferramenta de interesse foi marcada
        if (toolsChecked.length === 0) {
            questionTitle.style.color = '#ff4d4f';
            setTimeout(() => questionTitle.style.color = 'var(--color-text-dark)', 1000);
            return false;
        }
        questionTitle.style.color = 'var(--color-text-dark)';
        return true;
    }

    return true;
}

function nextStep(stepNumber) {
    const currentStep = document.querySelector('.form-step.active');
    const currentStepId = currentStep ? currentStep.id : null;

    if (currentStepId && stepNumber > parseInt(currentStepId.split('-')[1])) {
        if (!validateCurrentStep(currentStepId)) {
            return;
        }
        collectData(currentStepId);
    }

    const nextStepElement = document.getElementById(`step-${stepNumber}`);

    if (currentStep) {
        currentStep.classList.remove('active');
    }

    if (nextStepElement) {
        nextStepElement.classList.add('active');
    }
}

function collectData(stepId) {
    if (stepId === 'step-1') {
        formData.fullName = document.getElementById('fullName').value;
        formData.whatsapp = document.getElementById('whatsapp').value.replace(/\D/g, '');
    } else if (stepId === 'step-2') {
        formData.workplace = document.querySelector('input[name="workplace"]:checked').value;
    } else if (stepId === 'step-3') {
        formData.organization = document.getElementById('currentOrganization').value;
        formData.tools = Array.from(document.querySelectorAll('input[name="tools"]:checked'))
            .map(cb => cb.value);
    }
}

document.getElementById('form-step-3').addEventListener('submit', function (e) {
    e.preventDefault();

    // Chama a validação no submit
    if (!validateCurrentStep('step-3')) {
        return;
    }

    collectData('step-3');
    console.log('Dados prontos para envio:', formData);

    generateWhatsappLink(formData);

    nextStep('final');
});

function generateWhatsappLink(data) {
    const { fullName, whatsapp, workplace, tools, organization } = data;
    const phoneNumber = '5511999999999';

    let message = `Olá Helena! Meu cadastro na lista de espera foi finalizado. 😊\n\n`;
    message += `*Nome*: ${fullName}\n`;
    message += `*WhatsApp*: ${whatsapp}\n`;
    message += `*Local de Trabalho*: ${workplace}\n`;
    message += `*Interesse em Ferramentas*: ${tools.join(', ') || 'Nenhuma selecionada'}\n`;
    message += `*Organização Atual*: ${organization || 'Não informado'}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    document.getElementById('whatsappLink').href = whatsappUrl;
}