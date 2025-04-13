# Quiz Master Application

A responsive quiz application with a Node.js/Express.js backend and vanilla JavaScript frontend, featuring robust session management and route protection.

## Features

- **Home Page**: 
  - Select question count (5-20)
  - Flexible timer settings (None, Per Question, or Entire Quiz)
  - Timer duration customization
  - Settings persistence when returning from results

- **Quiz Page**: 
  - Interactive question navigation
  - Real-time progress tracking
  - Dynamic timer display
  - Answer validation with visual feedback
  - Route protection (redirects to home if accessed directly) user already had quiz session in the same tab (in this case s new quiz will satrt with previos sessin setting). 
  - Session-based quiz state management
  - Confirmation modals for navigation actions
  - Auto-submission on timer expiration

- **Results Page**:
  - Detailed score analysis with visual feedback
  - Time tracking statistics
  - Color-coded performance indicators
  - Expandable answer review section
  - Multiple continuation options (retry, new settings, home)
  - Route protection (redirects to home if accessed directly from another tab) unless user already had quiz session in the same tab ( in this case previous quiz result will dispaly)

## Session Management & Route Protection

The application implements comprehensive session management and route protection:

- **Quiz Page Protection**:
  - Checks for valid quiz settings in session storage
  - Automatically redirects to home page if accessed directly
  - Prevents accidental navigation with confirmation dialogs

- **Results Page Protection**:
  - Verifies quiz results existence in session storage
  - Redirects to home page if accessed without completing a quiz
  - Preserves quiz settings for retry functionality

- **Session Storage Structure**:
  - `quizSettings`: Question count, timer type, timer duration
  - `quizId`: Unique identifier for tracking question history
  - `quizStartTime`: Timestamp for quiz initiation
  - `quizResults`: Detailed results after submission
  - `previousQuestions`: Tracking for question randomization
  - `fromResults`: Flag for settings persistence

## Project Structure

```
quiz-app/
├── public/
│   ├── css/
│   │   ├── style.css         # Main styles
│   │   └── responsive.css    # Responsive design styles
│   ├── js/
│   │   ├── main.js          # Home page & session initialization
│   │   ├── quiz.js          # Quiz logic & protection
│   │   └── results.js       # Results display & navigation
│   ├── index.html           # Home page
│   ├── quiz.html            # Protected quiz page
│   └── results.html         # Protected results page
├── server/
│   ├── questions.json       # Quiz questions database
│   └── server.js            # Express.js server
├── package.json
└── README.md
```

## API Endpoints

- **GET /api/questions**: 
  - Returns random set of questions based on count parameter
  - Uses quiz ID to track and prevent question repetition
  - Implements Fisher-Yates shuffle for true randomization

- **POST /api/submit/:quizId**: 
  - Accepts quiz answers and calculates results
  - Processes timing and scoring data
  - Returns detailed performance analysis

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **State Management**: Session Storage
- **Data Storage**: JSON file

## Security Features

- Route protection through session storage validation
- Navigation protection with confirmation dialogs
- Question randomization and repeat prevention
- Timer-based auto-submission
- Client-side state management

## License

This project is open source and available under the [MIT License](LICENSE).
