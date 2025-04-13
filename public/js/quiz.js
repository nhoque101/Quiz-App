document.addEventListener('DOMContentLoaded', () => {
    // Check if quiz settings exist
    if (!sessionStorage.getItem('quizSettings') || !sessionStorage.getItem('quizStartTime')) {
        console.log('Quiz settings not found. Redirecting to home page.');
        window.location.href = 'index.html';
        return;
    }
    
    // Flag to track if quiz is being submitted normally
    let isSubmittingQuiz = false;
    
    // Add beforeunload event listener to warn when closing tab
    window.addEventListener('beforeunload', (e) => {
        // Don't show warning if quiz is being submitted normally
        if (isSubmittingQuiz) {
            return;
        }
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
    });
    
    // DOM Elements
    const progressBar = document.getElementById('progress-bar');
    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const optionA = document.getElementById('text-a');
    const optionB = document.getElementById('text-b');
    const optionC = document.getElementById('text-c');
    const optionD = document.getElementById('text-d');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const homeButton = document.getElementById('home-btn');
    const restartButton = document.getElementById('restart-btn');
    const quitButton = document.getElementById('quit-btn');
    const errorMessage = document.getElementById('error-message');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    const timerDisplay = document.getElementById('timer-display');
    const timerValue = document.getElementById('timer-value');
    
    // Quiz state
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let quizSettings = JSON.parse(sessionStorage.getItem('quizSettings'));
    let quizId = sessionStorage.getItem('quizId');
    let timerInterval = null;
    let timeRemaining = 0;
    
    // Initialize quiz
    initQuiz();
    
    // Initialize quiz
    async function initQuiz() {
        try {
            // Fetch questions from API
            const response = await fetch(`/api/questions?count=${quizSettings.questionCount}&quizId=${quizId}`);
            questions = await response.json();
            
            // Initialize user answers
            userAnswers = questions.map(() => null);
            
            // Display first question
            displayQuestion(0);
            
            // Initialize timer if enabled
            initTimer();
        } catch (error) {
            console.error('Error initializing quiz:', error);
            alert('Failed to load quiz questions. Please try again.');
        }
    }
    
    // Display question
    function displayQuestion(index) {
        const question = questions[index];
        
        // Update question text
        questionText.textContent = question.question;
        
        // Update options with letter designations
        optionA.textContent = question.A;
        optionB.textContent = question.B;
        optionC.textContent = question.C;
        optionD.textContent = question.D;
        
        // Update question number
        questionNumber.textContent = `Question ${index + 1} of ${questions.length}`;
        
        // Update progress bar
        const progress = ((index + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Update navigation buttons
        // Disable previous button if using per-question timer or if on first question
        prevButton.disabled = quizSettings.timerType === 'question' || index === 0;
        
        if (index === questions.length - 1) {
            nextButton.textContent = 'Submit';
        } else {
            nextButton.textContent = 'Next';
        }
        
        // Clear any previous selection
        clearSelectedOption();
        
        // Set selected option if user has answered this question
        if (userAnswers[index] !== null) {
            const option = document.getElementById(`option-${userAnswers[index].toLowerCase()}`);
            if (option) {
                option.checked = true;
            }
        }
        
        // Hide error message
        errorMessage.classList.add('hidden');
        
        // Reset question timer if per-question timer is enabled
        if (quizSettings.timerType === 'question') {
            resetQuestionTimer();
        }
    }
    
    // Clear selected option
    function clearSelectedOption() {
        const options = document.querySelectorAll('input[name="answer"]');
        options.forEach(option => {
            option.checked = false;
        });
    }
    
    // Get selected option
    function getSelectedOption() {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        return selectedOption ? selectedOption.value : null;
    }
    
    // Initialize timer
    function initTimer() {
        if (quizSettings.timerType === 'none') {
            timerDisplay.classList.add('hidden');
            return;
        }
        
        timerDisplay.classList.remove('hidden');
        
        if (quizSettings.timerType === 'quiz') {
            // Quiz timer
            timeRemaining = quizSettings.timerDuration;
            updateTimerDisplay();
            
            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimerDisplay();
                
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    submitQuiz();
                }
            }, 1000);
        } else if (quizSettings.timerType === 'question') {
            // Question timer
            resetQuestionTimer();
        }
    }
    
    // Reset question timer
    function resetQuestionTimer() {
        if (quizSettings.timerType !== 'question') return;
        
        clearInterval(timerInterval);
        timeRemaining = quizSettings.timerDuration;
        updateTimerDisplay();
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                
                // Auto-move to next question or submit if last question
                if (currentQuestionIndex < questions.length - 1) {
                    currentQuestionIndex++;
                    displayQuestion(currentQuestionIndex);
                } else {
                    submitQuiz();
                }
            }
        }, 1000);
    }
    
    // Update timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerValue.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Submit quiz
    async function submitQuiz() {
        // Set flag to prevent beforeunload warning
        isSubmittingQuiz = true;
        
        // Clear any active timers
        clearInterval(timerInterval);
        
        // Calculate time spent
        const startTime = parseInt(sessionStorage.getItem('quizStartTime'));
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime) / 1000); // in seconds
        
        // Prepare answers for submission
        const answers = questions.map((question, index) => {
            const selectedAnswer = userAnswers[index];
            const selectedAnswerText = selectedAnswer ? question[selectedAnswer] : 'Not answered';
            
            return {
                question: question.question,
                selectedAnswer: selectedAnswer || null,
                selectedAnswerText: selectedAnswerText,
                isCorrect: selectedAnswer === question.answer
            };
        });
        
        try {
            // Submit answers to API
            const response = await fetch(`/api/submit/${quizId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    answers,
                    timeSpent
                })
            });
            
            const results = await response.json();
            
            // Save results to session storage
            sessionStorage.setItem('quizResults', JSON.stringify(results));
            
            // Navigate to results page
            window.location.href = 'results.html';
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        }
    }
    
    // Show confirmation modal
    function showConfirmationModal(title, message, confirmAction) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        modalConfirm.onclick = () => {
            modalOverlay.classList.add('hidden');
            confirmAction();
        };
        
        modalCancel.onclick = () => {
            modalOverlay.classList.add('hidden');
        };
        
        modalOverlay.classList.remove('hidden');
    }
    
    // Event Listeners
    
    // Previous button click
    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        }
    });
    
    // Next button click
    nextButton.addEventListener('click', () => {
        // Get selected option
        const selectedOption = getSelectedOption();
        
        // If no option is selected, show error message
        if (!selectedOption) {
            errorMessage.classList.remove('hidden');
            document.getElementById('question-container').classList.add('shake');
            
            // Remove shake animation after it completes
            setTimeout(() => {
                document.getElementById('question-container').classList.remove('shake');
            }, 500);
            
            return;
        }
        
        // Save user's answer
        userAnswers[currentQuestionIndex] = selectedOption;
        
        // If this is the last question, submit the quiz
        if (currentQuestionIndex === questions.length - 1) {
            submitQuiz();
        } else {
            // Otherwise, move to the next question
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        }
    });
    
    // Home button click
    homeButton.addEventListener('click', () => {
        showConfirmationModal(
            'Return to Home',
            'Return to home? Your progress will be lost.',
            () => {
                clearInterval(timerInterval);
                window.location.href = 'index.html';
            }
        );
    });
    
    // Restart button click
    restartButton.addEventListener('click', () => {
        showConfirmationModal(
            'Restart Quiz',
            'Restart quiz? Your current progress will be lost.',
            () => {
                clearInterval(timerInterval);
                sessionStorage.setItem('quizStartTime', Date.now().toString());
                window.location.href = 'quiz.html';
            }
        );
    });
    
    // Quit button click
    quitButton.addEventListener('click', () => {
        showConfirmationModal(
            'Quit Quiz?',
            'Quit quiz? Your progress will be lost.',
            () => {
                clearInterval(timerInterval);
                window.location.href = 'index.html';
            }
        );
    });
    
    // Radio button change
    document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.addEventListener('change', () => {
            errorMessage.classList.add('hidden');
        });
    });
});
