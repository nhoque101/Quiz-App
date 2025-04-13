const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Load questions from JSON file
const questionsPath = path.join(__dirname, 'questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// Store previously served questions for each session
const sessionQuestions = new Map();

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// API endpoint to get random questions
app.get('/api/questions', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const quizId = req.query.quizId;
  
  if (!quizId) {
    return res.status(400).json({ error: 'Quiz ID is required' });
  }
  
  // Get previously served questions for this session
  let previousQuestions = sessionQuestions.get(quizId) || [];
  
  // If we're running low on unique questions, reset the history
  if (questions.length - previousQuestions.length < count) {
    previousQuestions = [];
  }
  
  // Filter out previously served questions
  const availableQuestions = questions.filter(q => 
    !previousQuestions.includes(questions.indexOf(q))
  );
  
  // Shuffle and select the requested number of questions
  const shuffledQuestions = shuffleArray(availableQuestions);
  const selectedQuestions = shuffledQuestions.slice(0, count);
  
  // Update the previously served questions
  const newPreviousQuestions = [
    ...previousQuestions,
    ...selectedQuestions.map(q => questions.indexOf(q))
  ];
  sessionQuestions.set(quizId, newPreviousQuestions);
  
  res.json(selectedQuestions);
});

// API endpoint to submit quiz answers
app.post('/api/submit/:quizId', (req, res) => {
  const { answers, timeSpent } = req.body;
  const quizId = req.params.quizId;
  
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Answers array is required' });
  }
  
  // Calculate results
  let correctCount = 0;
  const details = answers.map(answer => {
    const question = questions.find(q => q.question === answer.question);
    const isCorrect = question && question.answer === answer.selectedAnswer;
    
    if (isCorrect) {
      correctCount++;
    }
    
    return {
      question: answer.question,
      selectedAnswer: answer.selectedAnswer,
      selectedAnswerText: answer.selectedAnswerText,
      correctAnswer: question ? question.answer : null,
      correctAnswerText: question ? question[question.answer] : null,
      isCorrect
    };
  });
  
  const totalQuestions = answers.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  
  const results = {
    quizId,
    score,
    correctCount,
    wrongCount: totalQuestions - correctCount,
    totalQuestions,
    timeSpent,
    details
  };
  
  res.json(results);
});

// Serve the HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/quiz', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/quiz.html'));
});

app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/results.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
