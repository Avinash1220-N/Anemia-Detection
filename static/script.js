// Render backend used by the deployed Vercel frontend.
const API_BASE_URL = "https://detection-of-anemia.onrender.com";

let selectedFile = null;

// DOM Elements
const fileInput = document.getElementById("fileInput");
const chooseBtn = document.getElementById("chooseBtn");
const uploadBtn = document.getElementById("uploadBtn");
const detectBtn = document.getElementById("detectBtn");
const preview = document.getElementById("preview");
const previewSection = document.getElementById("previewSection");
const resultsSection = document.getElementById("resultsSection");
const resultText = document.getElementById("result");
const confidenceText = document.getElementById("confidence");
const confidenceFill = document.getElementById("confidenceFill");
const meterValue = document.getElementById("meterValue");
const resultIndicator = document.getElementById("resultIndicator");
const clinicalSummary = document.getElementById("clinicalSummary");
const medicalNotes = document.getElementById("medicalNotes");
const loadingOverlay = document.getElementById("loadingOverlay");

// =============================
// FILE SELECT
// =============================
chooseBtn?.addEventListener("click", () => fileInput.click());

fileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert("File must be under 10MB.");
        return;
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
        preview.src = event.target.result;
        previewSection.style.display = "block";
        resultsSection.style.display = "none";
    };

    reader.readAsDataURL(file);

    uploadBtn.disabled = false;
    detectBtn.disabled = false;
});

// =============================
// PREDICT
// =============================
detectBtn?.addEventListener("click", async () => {

    if (!selectedFile) {
        alert("Upload image first.");
        return;
    }

    loadingOverlay.style.display = "flex";

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {

        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Prediction failed");
        }

        showResults(data);

    } catch (err) {
        console.error(err);
        alert("Server error: " + err.message);
    }

    loadingOverlay.style.display = "none";
});


// =============================
// SHOW RESULTS
// =============================
function showResults(data) {

    const confidencePercent = (data.confidence * 100).toFixed(2);
    const isAnemic = data.result.toLowerCase() === "anemic";

    resultText.innerText = data.result;
    confidenceText.innerText = confidencePercent + "%";

    confidenceFill.style.width = confidencePercent + "%";
    meterValue.innerText = confidencePercent + "%";

    resultIndicator.innerHTML =
        isAnemic ? "⚠️ Anemia Detected" : "✅ Normal Hemoglobin Appearance";

    clinicalSummary.innerText =
        isAnemic ?
        "Possible anemia detected. Please consult a clinician." :
        "No anemia pattern detected.";

    medicalNotes.innerHTML =
        isAnemic ?
        "<ul><li>Consider CBC test</li><li>Check hemoglobin level</li></ul>" :
        "<ul><li>Maintain healthy diet</li><li>Regular health checkups</li></ul>";

    resultsSection.style.display = "block";
}


// =============================
// CHATBOT
// =============================
const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotSend = document.getElementById("chatbotSend");
const chatbotContainer = document.getElementById("chatbotContainer");
const chatbotToggle = document.getElementById("chatbotToggle");
const openChatbotBtn = document.getElementById("openChatbotBtn");
const chatbotTyping = document.getElementById("chatbotTyping");
let hasShownChatbotWelcome = false;

function displayTyping(isVisible) {
    if (!chatbotTyping) return;
    chatbotTyping.style.display = isVisible ? "block" : "none";
}

function ensureWelcomeMessage() {
    if (hasShownChatbotWelcome || !chatbotMessages) return;

    displayMessage(
        "Hello. I can answer general questions about anemia and your screening results. Please consult a healthcare professional for medical advice.",
        "bot"
    );
    hasShownChatbotWelcome = true;
}

function openChatbot() {
    if (!chatbotContainer) return;

    chatbotContainer.style.display = "flex";
    if (openChatbotBtn) {
        openChatbotBtn.style.display = "none";
    }

    ensureWelcomeMessage();
    chatbotInput?.focus();
}

function closeChatbot() {
    if (chatbotContainer) {
        chatbotContainer.style.display = "none";
    }
    if (openChatbotBtn) {
        openChatbotBtn.style.display = "flex";
    }
    displayTyping(false);
}

openChatbotBtn?.addEventListener("click", openChatbot);
chatbotToggle?.addEventListener("click", closeChatbot);

chatbotSend?.addEventListener("click", sendMessage);

chatbotInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

async function sendMessage() {

    const msg = chatbotInput.value.trim();
    if (!msg) return;

    displayMessage(msg, "user");
    chatbotInput.value = "";
    displayTyping(true);

    try {

        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        displayMessage(data.reply, "bot");

    } catch (err) {

        displayMessage("Server error: " + err.message, "bot");

    } finally {
        displayTyping(false);
    }

}

function displayMessage(text, sender) {

    const div = document.createElement("div");
    div.classList.add("chatbot-message", sender);

    div.innerHTML = `<div class="message-content">${text}</div>`;

    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

window.showMainApp = () => {
    closeChatbot();
    ensureWelcomeMessage();
};
