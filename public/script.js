let timeLeft = 20;
let timerInterval;
let startTime;
let totalScore = 0;
let progressBar; 


// Start the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
    if (location.pathname.endsWith("ranked.html")) {
        startTimer();

        document.getElementById("guessForm").addEventListener("submit", function (e) {
            e.preventDefault();
            checkSongRanked();
        });
    }
});

// Start a timer
function startTimer() {
    generateWordRanked();
    startTime = Date.now();
    timeLeft = 30;

    // Create circular progress bar
    if (!progressBar) {
        progressBar = new ProgressBar.Circle("#progressContainer", {
            strokeWidth: 6,
            easing: "linear",
            duration: timeLeft * 1000,
            color: "#00ffcc",
            trailColor: "#eee",
            trailWidth: 1,
            text: {
                autoStyleContainer: false
            },
            from: { color: '#00ffcc' },
            to: { color: '#ff6b6b' },
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.setText(`${String(timeLeft).padStart(2, '0')}`);
            }
        });
    }

    progressBar.set(1);
    progressBar.animate(0);

    updateCountdown();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateCountdown, 1000);
}


// Generate word and display it
function generateWordRanked() {
    const url = `./getword`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const el = document.getElementById("generatedWord");
            el.innerText = data.word;

            // Baffle effect
            const b = baffle(el);
            b.set({
                characters: '█▓▒░<>/',
                speed: 75
            });
            b.start();
            b.reveal(1000); // reveal in 1s
        });
}

// Countdown logic
function updateCountdown() {
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        if (progressBar) {
            progressBar.setText("⏰");
        }
        showResult("⏳ Time's up! You didn't guess in time.", true);
        disableForm();
        handleLoss();
        return;
    }

    if (progressBar) {
        progressBar.setText(`${String(timeLeft).padStart(2, '0')}`);
    }

    timeLeft--;
}


// Handle Ranked Song Check
function checkSongRanked() {
    const song = encodeURIComponent(document.getElementById("song").value);
    const artist = encodeURIComponent(document.getElementById("artist").value);
    const word = document.getElementById("generatedWord").innerText.trim().toLowerCase();

    const url = `https://api.lyrics.ovh/v1/${artist}/${song}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showResult("🚫 Song or artist not found. Please try again.");
                return;
            }

            const lyrics = data.lyrics.toLowerCase();
            const timePassed = Math.floor((Date.now() - startTime) / 1000);
            let score = Math.max(0, 300 - timePassed * 10);

            if (lyrics.includes(word)) {
                totalScore += score;
                showResult(`✅ Correct! The word appears in the lyrics. You scored ${score} points.`);
                document.getElementById("scoreOutput").innerText = `Round: ${score} | Total: ${totalScore}`;
                clearInterval(timerInterval);
                disableForm();

                setTimeout(() => {
                    enableForm();
                    document.getElementById("scoreOutput").innerText = "";
                    document.getElementById("artist").value = "";
                    document.getElementById("song").value = "";
                    startRound();
                }, 3000);
            } else {
                showResult("❌ Sorry, the word was not found in the lyrics.");
            }
        });
}

// Show result
function showResult(message) {
    const resultsSection = document.getElementById("results");
    resultsSection.innerHTML = `<p style="color: "#00ffcc"">${message}</p>`;
}

// Helpers to lock/unlock form
function disableForm() {
    document.getElementById("artist").disabled = true;
    document.getElementById("song").disabled = true;
    document.querySelector("#guessForm button").disabled = true;
}

function enableForm() {
    document.getElementById("artist").disabled = false;
    document.getElementById("song").disabled = false;
    document.querySelector("#guessForm button").disabled = false;
}

function handleLoss() {
    const playerName = prompt("⏱ Time's up! Enter your name to save your total score:");

    if (playerName) {
        fetch("/addRanking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                playerName: playerName,
                score: totalScore,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Score submitted:", data);
            })
            .catch((err) => {
                console.error("Failed to submit score:", err);
            });
    }

    // Reset everything for a new game
    totalScore = 0;

    setTimeout(() => {
        enableForm();
        document.getElementById("scoreOutput").innerText = "";
        document.getElementById("artist").value = "";
        document.getElementById("song").value = "";
        startRound();
    }, 3000);
}

function loadRankings() {
    console.log('Loading Rankings...')
    fetch('/getRankings')
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#rankingsTable tbody");
            tbody.innerHTML = ''; // Clear old table

            data.forEach((entry, index) => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.playerName}</td>
                    <td>${entry.score}</td>
                `;

                tbody.appendChild(row);
            });
        })
        .catch(err => {
            console.error("Error loading rankings:", err);
        });
}

document.addEventListener("DOMContentLoaded", () => {

    if (location.pathname === "/" || location.pathname.endsWith("/index.html")) {
        loadRankings();
    }
});
