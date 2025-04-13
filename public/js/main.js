document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const questionCountSlider = document.getElementById('question-count');
    const questionCountValue = document.getElementById('question-count-value');
    const timerOptions = document.querySelectorAll('input[name="timer-type"]');
    const perQuestionTimerContainer = document.getElementById('per-question-timer-container');
    const entireQuizTimerContainer = document.getElementById('entire-quiz-timer-container');
    const perQuestionDurationSlider = document.getElementById('per-question-duration');
    const perQuestionDurationValue = document.getElementById('per-question-duration-value');
    const entireQuizDurationSlider = document.getElementById('entire-quiz-duration');
    const entireQuizDurationValue = document.getElementById('entire-quiz-duration-value');
    const startQuizButton = document.getElementById('start-quiz');
    
    // Check if coming from results page
    const fromResults = sessionStorage.getItem('fromResults') === 'true';
    if (fromResults) {
        // Restore previous settings
        const quizSettings = JSON.parse(sessionStorage.getItem('quizSettings') || '{}');
        if (quizSettings.questionCount) {
            questionCountSlider.value = quizSettings.questionCount;
            questionCountValue.textContent = quizSettings.questionCount;
        }
        
        if (quizSettings.timerType) {
            const timerOption = document.getElementById(quizSettings.timerType + '-timer');
            if (timerOption) {
                timerOption.checked = true;
                
                if (quizSettings.timerType === 'question') {
                    perQuestionTimerContainer.classList.remove('hidden');
                    if (quizSettings.timerDuration) {
                        perQuestionDurationSlider.value = quizSettings.timerDuration;
                        perQuestionDurationValue.textContent = quizSettings.timerDuration;
                    }
                } else if (quizSettings.timerType === 'quiz') {
                    entireQuizTimerContainer.classList.remove('hidden');
                    if (quizSettings.timerDuration) {
                        entireQuizDurationSlider.value = quizSettings.timerDuration;
                        entireQuizDurationValue.textContent = quizSettings.timerDuration;
                    }
                }
            }
        }
        
        // Clear the flag
        sessionStorage.removeItem('fromResults');
    }
    
    // Update question count value when slider changes
    questionCountSlider.addEventListener('input', () => {
        questionCountValue.textContent = questionCountSlider.value;
    });
    
    // Show/hide timer duration based on timer option
    timerOptions.forEach(option => {
        option.addEventListener('change', () => {
            // Hide both timer containers first
            perQuestionTimerContainer.classList.add('hidden');
            entireQuizTimerContainer.classList.add('hidden');
            
            // Show appropriate timer container based on selection
            if (option.value === 'question') {
                perQuestionTimerContainer.classList.remove('hidden');
            } else if (option.value === 'quiz') {
                entireQuizTimerContainer.classList.remove('hidden');
            }
        });
    });
    
    // Update per-question timer duration value when slider changes
    perQuestionDurationSlider.addEventListener('input', () => {
        perQuestionDurationValue.textContent = perQuestionDurationSlider.value;
    });
    
    // Update entire quiz timer duration value when slider changes
    entireQuizDurationSlider.addEventListener('input', () => {
        entireQuizDurationValue.textContent = entireQuizDurationSlider.value;
    });
    
    // Start quiz button click handler
    startQuizButton.addEventListener('click', () => {
        // Get selected timer option
        const selectedTimerOption = document.querySelector('input[name="timer-type"]:checked');
        const timerType = selectedTimerOption ? selectedTimerOption.value : 'none';
        
        // Get appropriate timer duration based on timer type
        let timerDuration = 0;
        if (timerType === 'question') {
            timerDuration = parseInt(perQuestionDurationSlider.value);
        } else if (timerType === 'quiz') {
            timerDuration = parseInt(entireQuizDurationSlider.value) * 60; // Convert minutes to seconds
        }
        
        // Create quiz settings object
        const quizSettings = {
            questionCount: parseInt(questionCountSlider.value),
            timerType: timerType,
            timerDuration: timerDuration
        };
        
        // Generate a unique quiz ID
        const quizId = 'quiz_' + Date.now();
        
        // Save settings to session storage
        sessionStorage.setItem('quizSettings', JSON.stringify(quizSettings));
        sessionStorage.setItem('quizId', quizId);
        sessionStorage.setItem('quizStartTime', Date.now().toString());
        
        // Redirect to quiz page
        window.location.href = 'quiz.html';
    });
});
