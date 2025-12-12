const typingText = document.querySelector(".typing-text");
const inputField = document.querySelector("#input-field");
const timeTag = document.querySelector("#timer");
const wpmTag = document.querySelector("#wpm");
const accuracyTag = document.querySelector("#accuracy");
const restartBtn = document.querySelector("#restart-btn");
const historyList = document.querySelector("#history-list");
const clearHistoryBtn = document.querySelector("#clear-history");

let timer;
let maxTime = 60;
let timeLeft = maxTime;
let charIndex = 0;
let mistakes = 0;
let isTyping = false;

// Sample paragraphs
const paragraphs = [
    "The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. Believe you can and you're halfway there.",
    "In the middle of difficulty lies opportunity. Do not go where the path may lead, go instead where there is no path and leave a trail.",
    "Technology is best when it brings people together. It is not about bits and bytes, but about the quality of communication and connection."
];

function loadParagraph() {
    const ranIndex = Math.floor(Math.random() * paragraphs.length);
    typingText.innerHTML = "";
    paragraphs[ranIndex].split("").forEach(char => {
        let span = `<span>${char}</span>`;
        typingText.innerHTML += span;
    });
    typingText.querySelectorAll("span")[0].classList.add("active");
    
    // Focus input on load so user can start typing immediately
    document.addEventListener("keydown", () => inputField.focus());
    typingText.addEventListener("click", () => inputField.focus());
}

function initTyping() {
    let characters = typingText.querySelectorAll("span");
    let typedChar = inputField.value.split("")[charIndex];

    if (charIndex < characters.length && timeLeft > 0) {
        if (!isTyping) {
            timer = setInterval(initTimer, 1000);
            isTyping = true;
        }

        if (typedChar == null) { // Backspace
            if (charIndex > 0) {
                charIndex--;
                if (characters[charIndex].classList.contains("incorrect")) {
                    mistakes--;
                }
                characters[charIndex].classList.remove("correct", "incorrect");
            }
        } else {
            if (characters[charIndex].innerText === typedChar) {
                characters[charIndex].classList.add("correct");
            } else {
                mistakes++;
                characters[charIndex].classList.add("incorrect");
            }
            charIndex++;
        }

        characters.forEach(span => span.classList.remove("active"));
        if (charIndex < characters.length) {
            characters[charIndex].classList.add("active");
        }

        // Stats Calculation
        let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
        wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
        
        let accuracy = Math.round(((charIndex - mistakes) / charIndex) * 100);
        accuracy = accuracy < 0 || !accuracy || accuracy === Infinity ? 100 : accuracy;

        wpmTag.innerText = wpm;
        accuracyTag.innerText = accuracy + "%";
    } else {
        clearInterval(timer);
        inputField.value = "";
        saveResult();
    }
}

function initTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeTag.innerText = timeLeft + "s";
        
        // Live WPM update
        let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
        wpmTag.innerText = wpm;
    } else {
        clearInterval(timer);
        saveResult();
    }
}

function saveResult() {
    // Prevent saving if no characters were typed
    if(charIndex === 0) return;

    const result = {
        date: new Date().toLocaleDateString(),
        wpm: wpmTag.innerText,
        accuracy: accuracyTag.innerText
    };

    let history = JSON.parse(localStorage.getItem("typeHistory")) || [];
    history.unshift(result); // Add new result to the top
    if (history.length > 5) history.pop(); // Keep only last 5
    localStorage.setItem("typeHistory", JSON.stringify(history));
    
    renderHistory();
}

function renderHistory() {
    let history = JSON.parse(localStorage.getItem("typeHistory")) || [];
    historyList.innerHTML = history.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.wpm}</td>
            <td>${item.accuracy}</td>
        </tr>
    `).join("");
}

function resetTest() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = mistakes = isTyping = 0;
    inputField.value = "";
    timeTag.innerText = timeLeft + "s";
    wpmTag.innerText = 0;
    accuracyTag.innerText = "100%";
}

function clearHistory() {
    localStorage.removeItem("typeHistory");
    renderHistory();
}

loadParagraph();
renderHistory();
inputField.addEventListener("input", initTyping);
restartBtn.addEventListener("click", resetTest);
clearHistoryBtn.addEventListener("click", clearHistory);