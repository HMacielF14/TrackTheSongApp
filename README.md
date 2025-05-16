# 1 | Track the Word

## 2 | Description

Track the Word is a music guessing game you play in your browser. You’ll get a word and try to think of a song that has that word in the lyrics.

There are two modes:
- **Solo Mode** – You type in any word and guess a song with that word.
- **Ranked Challenge** – The game gives you a random word, and you have 30 seconds to come up with a song. The faster you guess, the more points you get.

## 3 | Target Browsers

This game was made for computers. It might also work on iOS and Android devices, but it was not designed for mobile use.

## 4 | Developer Manual

This section is for developers who want to install, run, or improve the game.

### A | How to Install the Application

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/track-the-word.git
   cd track-the-word
   ```

2. Install dependencies (this application uses Node.js and Express):
   ```bash
   npm install
   ```

### B | How to Run the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and go to:
   ```
   http://localhost:3000
   ```

### C | Tests

This application does not have any tests available at this time.

### D | API Documentation

- **GET /getWord**  
  Returns a random word for the game.

- **POST /addRanking**  
  Adds a new score to the rankings.

- **GET /getRanking**  
  Returns the list of ranked scores in descending order.

### E | Known Bugs

- `/getWord` might return repeated words even with code to prevent it.

### F | Future Development

- Add a Duo Mode where two players take turns.  
- Improve word generation algorithm.  
- Add support for different languages.