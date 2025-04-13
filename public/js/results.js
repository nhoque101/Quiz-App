document.addEventListener('DOMContentLoaded', () => {
    // Check if quiz results exist
    if (!sessionStorage.getItem('quizResults')) {
        console.log('Quiz results not found. Redirecting to home page.');
        window.location.href = 'index.html';
        return;
    }
    
    // DOM Elements
    const scorePercentage = document.getElementById('score-percentage');
    const scoreFraction = document.getElementById('score-fraction');
    const scoreCircle = document.querySelector('.score-circle');
    const timeTaken = document.getElementById('time-taken');
    const correctAnswers = document.getElementById('correct-answers');
    const wrongAnswers = document.getElementById('wrong-answers');
    const performanceMessage = document.getElementById('performance-message');
    const showAnswersBtn = document.getElementById('show-answers-btn');
    const answersDetails = document.getElementById('answers-details');
    const answersList = document.getElementById('answers-list');
    const retryBtn = document.getElementById('retry-btn');
    const newSettingsBtn = document.getElementById('new-settings-btn');
    const homeBtn = document.getElementById('home-btn');
    
    // Get quiz results from session storage
    const quizResults = JSON.parse(sessionStorage.getItem('quizResults'));
    
    // Display results
    displayResults();
    
    // Display results
    function displayResults() {
        // Display score
        const score = quizResults.score;
        scorePercentage.textContent = `${score}%`;
        scoreFraction.textContent = `${quizResults.correctCount} / ${quizResults.totalQuestions}`;
        
        // Set score circle color based on score
        if (score < 40) {
            scoreCircle.style.borderColor = 'var(--low-score-color)';
        } else if (score < 70) {
            scoreCircle.style.borderColor = 'var(--medium-score-color)';
        } else {
            scoreCircle.style.borderColor = 'var(--high-score-color)';
        }
        
        // Display statistics
        timeTaken.textContent = formatTime(quizResults.timeSpent);
        correctAnswers.textContent = quizResults.correctCount;
        wrongAnswers.textContent = quizResults.wrongCount;
        
        // Display performance message
        if (score < 40) {
            performanceMessage.textContent = 'Keep practicing to improve!';
        } else if (score < 70) {
            performanceMessage.textContent = 'Good job! Keep learning.';
        } else if (score < 90) {
            performanceMessage.textContent = 'Great work! You\'re doing well.';
        } else {
            performanceMessage.textContent = 'Excellent! You\'re a quiz master!';
        }
        
        // Populate answer details
        populateAnswerDetails();
    }
    
    // Format time in seconds to a readable format
    function formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} seconds`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            
            if (remainingSeconds === 0) {
                return `${minutes} minute${minutes > 1 ? 's' : ''}`;
            } else {
                return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
            }
        }
    }
    
    // Populate answer details
    function populateAnswerDetails() {
        // Clear previous content
        answersList.innerHTML = '';
        
        // Add each answer detail
        quizResults.details.forEach((detail, index) => {
            const answerItem = document.createElement('div');
            answerItem.className = 'answer-item';
            
            // Question text
            const questionNumber = document.createElement('div');
            questionNumber.className = 'answer-question';
            questionNumber.textContent = `Question ${index + 1}: ${detail.question}`;
            
            // Answer details container
            const answerDetails = document.createElement('div');
            answerDetails.className = 'answer-details';
            
            // Your answer
            const yourAnswer = document.createElement('div');
            yourAnswer.className = detail.isCorrect ? 'correct-answer' : 'wrong-answer';
            
            // Format your answer text
            const yourAnswerText = detail.selectedAnswer === null ? 
                'Not answered' : 
                `${detail.selectedAnswer} - ${detail.selectedAnswerText}`;
            
            yourAnswer.innerHTML = `Your Answer: <strong>${yourAnswerText}</strong>`;
            answerDetails.appendChild(yourAnswer);
            
            // Show correct answer if wrong
            if (!detail.isCorrect) {
                const correctAnswer = document.createElement('div');
                correctAnswer.className = 'correct-answer';
                const correctAnswerText = `${detail.correctAnswer} - ${detail.correctAnswerText}`;
                correctAnswer.innerHTML = `Correct Answer: <strong>${correctAnswerText}</strong>`;
                answerDetails.appendChild(correctAnswer);
            }
            
            // Add to DOM
            answerItem.appendChild(questionNumber);
            answerItem.appendChild(answerDetails);
            answersList.appendChild(answerItem);
        });
    }
    
    // Event Listeners
    
    // Show/hide answer details
    showAnswersBtn.addEventListener('click', () => {
        if (answersDetails.classList.contains('hidden')) {
            answersDetails.classList.remove('hidden');
            showAnswersBtn.textContent = 'Hide Answer Details';
        } else {
            answersDetails.classList.add('hidden');
            showAnswersBtn.textContent = 'Show Answer Details';
        }
    });
    
    // Retry with same settings
    retryBtn.addEventListener('click', () => {
        // Update quiz start time
        sessionStorage.setItem('quizStartTime', Date.now().toString());
        
        // Navigate to quiz page
        window.location.href = 'quiz.html';
    });
    
    // Play with new settings
    newSettingsBtn.addEventListener('click', () => {
        // Set flag to indicate coming from results page
        sessionStorage.setItem('fromResults', 'true');
        
        // Navigate to home page
        window.location.href = 'index.html';
    });
    
    // Home button
    homeBtn.addEventListener('click', () => {
        // Navigate to home page
        window.location.href = 'index.html';
    });
});
