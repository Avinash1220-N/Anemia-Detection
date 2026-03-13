// Render backend used by the deployed Vercel frontend.
const API_BASE_URL = "https://anemia-detection-kat7.onrender.com";

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
const diagnosisBadge = document.getElementById("diagnosisBadge");
const riskLevel = document.getElementById("riskLevel");
const clinicalSummary = document.getElementById("clinicalSummary");
const medicalNotes = document.getElementById("medicalNotes");
const riskInterpretation = document.getElementById("riskInterpretation");
const suggestedTests = document.getElementById("suggestedTests");
const symptomChecklist = document.getElementById("symptomChecklist");
const dietGuidance = document.getElementById("dietGuidance");
const downloadSummaryBtn = document.getElementById("downloadSummaryBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
let latestResultSnapshot = null;

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
function getSeverityLabel(data, isAnemic) {
    if (data.severity) return data.severity;
    return isAnemic ? "Mild" : "Normal";
}

function getResultTheme(isAnemic, severity) {
    const normalizedSeverity = severity.toLowerCase();

    if (!isAnemic) {
        return {
            badgeClass: "diagnosis-badge",
            riskClass: "risk-pill normal",
            indicatorClass: "result-indicator normal",
            indicatorText: "Normal Hemoglobin Appearance",
            gaugeColor: "linear-gradient(90deg, #22c55e, #84cc16)"
        };
    }

    if (normalizedSeverity === "severe") {
        return {
            badgeClass: "diagnosis-badge severe",
            riskClass: "risk-pill severe",
            indicatorClass: "result-indicator anemic",
            indicatorText: "High-Risk Anemia Pattern",
            gaugeColor: "linear-gradient(90deg, #f97316, #dc2626)"
        };
    }

    if (normalizedSeverity === "moderate") {
        return {
            badgeClass: "diagnosis-badge moderate",
            riskClass: "risk-pill moderate",
            indicatorClass: "result-indicator anemic",
            indicatorText: "Moderate Anemia Risk Pattern",
            gaugeColor: "linear-gradient(90deg, #eab308, #f97316)"
        };
    }

    return {
        badgeClass: "diagnosis-badge mild",
        riskClass: "risk-pill mild",
        indicatorClass: "result-indicator anemic",
        indicatorText: "Mild Anemia Risk Pattern",
        gaugeColor: "linear-gradient(90deg, #84cc16, #eab308)"
    };
}

function buildClinicalNotes(result, severity, confidencePercent) {
    if (result.toLowerCase() === "normal") {
        return `
            <p>The uploaded conjunctiva image is more consistent with a normal appearance on this AI screening model.</p>
            <ul>
                <li>Estimated screening confidence: ${confidencePercent}%.</li>
                <li>Continue balanced intake of iron, folate, vitamin B12, and protein.</li>
                <li>Arrange clinician review if symptoms such as fatigue, pallor, dizziness, or shortness of breath are present.</li>
                <li>This tool supports screening only and does not replace laboratory testing or medical diagnosis.</li>
            </ul>
        `;
    }

    if (severity.toLowerCase() === "severe") {
        return `
            <p>The model detected a high-risk anemia pattern that should be reviewed promptly by a clinician.</p>
            <ul>
                <li>Recommended next step: CBC, hemoglobin, hematocrit, ferritin, and iron profile testing.</li>
                <li>Assess for significant fatigue, palpitations, breathlessness, chest discomfort, or fainting.</li>
                <li>Urgent medical review is appropriate if symptoms are worsening or severe.</li>
                <li>Please confirm this screening result with clinical examination and laboratory testing.</li>
            </ul>
        `;
    }

    if (severity.toLowerCase() === "moderate") {
        return `
            <p>The model suggests a moderate anemia pattern and follow-up testing would be appropriate.</p>
            <ul>
                <li>Recommended next step: CBC and hemoglobin evaluation with iron studies if advised by a clinician.</li>
                <li>Review dietary iron intake, menstrual history, recent illness, or chronic blood loss risk factors.</li>
                <li>Monitor symptoms such as fatigue, headaches, dizziness, or reduced exercise tolerance.</li>
                <li>Use this result as a screening prompt rather than a final diagnosis.</li>
            </ul>
        `;
    }

    return `
        <p>The model suggests a mild anemia pattern that may warrant non-urgent clinical follow-up.</p>
        <ul>
            <li>Recommended next step: consider CBC and hemoglobin testing if symptoms or risk factors are present.</li>
            <li>Supportive measures may include reviewing diet for iron, folate, and vitamin B12 intake.</li>
            <li>Watch for ongoing fatigue, dizziness, pallor, or weakness.</li>
            <li>Please discuss the result with a healthcare professional for confirmation.</li>
        </ul>
    `;
}

function buildCarePlan(result, severity, confidencePercent) {
    if (result.toLowerCase() === "normal") {
        return {
            interpretation: `
                <p>Low AI screening concern for anemia on this image.</p>
                <ul>
                    <li>Model confidence: ${confidencePercent}%.</li>
                    <li>No visual anemia pattern was flagged by the screening model.</li>
                </ul>
            `,
            tests: `
                <ul>
                    <li>No urgent testing suggested from this screen alone.</li>
                    <li>Consider CBC only if symptoms, prior anemia history, or clinician concern are present.</li>
                </ul>
            `,
            symptoms: `
                <ul>
                    <li>Monitor fatigue or weakness.</li>
                    <li>Watch for dizziness or headaches.</li>
                    <li>Review with a clinician if pallor or breathlessness develops.</li>
                </ul>
            `,
            diet: `
                <ul>
                    <li>Maintain iron-rich foods such as leafy greens, legumes, beans, eggs, and lean meats.</li>
                    <li>Include vitamin C sources to support iron absorption.</li>
                    <li>Keep regular meals with protein, folate, and vitamin B12 sources.</li>
                </ul>
            `
        };
    }

    if (severity.toLowerCase() === "severe") {
        return {
            interpretation: `
                <p>High-risk AI screening result for anemia.</p>
                <ul>
                    <li>This pattern deserves prompt clinical evaluation.</li>
                    <li>Confidence on this screen: ${confidencePercent}%.</li>
                </ul>
            `,
            tests: `
                <ul>
                    <li>CBC with hemoglobin and hematocrit.</li>
                    <li>Ferritin, serum iron, TIBC, and transferrin saturation.</li>
                    <li>Reticulocyte count, B12, and folate if clinically indicated.</li>
                </ul>
            `,
            symptoms: `
                <ul>
                    <li>Severe fatigue or weakness.</li>
                    <li>Shortness of breath, palpitations, or chest discomfort.</li>
                    <li>Dizziness, fainting, or worsening exercise intolerance.</li>
                </ul>
            `,
            diet: `
                <ul>
                    <li>Do not rely on diet alone for a high-risk result.</li>
                    <li>Use clinician guidance before starting supplements.</li>
                    <li>Focus on iron, folate, B12, hydration, and protein while awaiting evaluation.</li>
                </ul>
            `
        };
    }

    if (severity.toLowerCase() === "moderate") {
        return {
            interpretation: `
                <p>Moderate AI screening concern for anemia.</p>
                <ul>
                    <li>Further lab review would be appropriate.</li>
                    <li>Confidence on this screen: ${confidencePercent}%.</li>
                </ul>
            `,
            tests: `
                <ul>
                    <li>CBC and hemoglobin check.</li>
                    <li>Iron profile and ferritin if advised.</li>
                    <li>Review for blood loss, menstrual history, or chronic illness.</li>
                </ul>
            `,
            symptoms: `
                <ul>
                    <li>Tiredness or low stamina.</li>
                    <li>Headaches or dizziness.</li>
                    <li>Pale appearance or reduced concentration.</li>
                </ul>
            `,
            diet: `
                <ul>
                    <li>Increase iron-rich foods like spinach, lentils, beans, eggs, and lean meats.</li>
                    <li>Add citrus or other vitamin C foods with meals.</li>
                    <li>Review B12 and folate intake with a clinician if needed.</li>
                </ul>
            `
        };
    }

    return {
        interpretation: `
            <p>Mild AI screening concern for anemia.</p>
            <ul>
                <li>This may be an early or lower-risk pattern.</li>
                <li>Confidence on this screen: ${confidencePercent}%.</li>
            </ul>
        `,
        tests: `
            <ul>
                <li>Consider CBC and hemoglobin testing if symptoms are present.</li>
                <li>Discuss follow-up timing with a healthcare professional.</li>
            </ul>
        `,
        symptoms: `
            <ul>
                <li>Mild fatigue or weakness.</li>
                <li>Dizziness or headaches.</li>
                <li>Pallor or reduced exercise tolerance.</li>
            </ul>
        `,
        diet: `
            <ul>
                <li>Increase iron-rich foods and pair them with vitamin C sources.</li>
                <li>Review intake of folate and vitamin B12.</li>
                <li>Stay consistent with balanced meals and hydration.</li>
            </ul>
        `
    };
}

function htmlBlockToLines(html) {
    const container = document.createElement("div");
    container.innerHTML = html;

    return Array.from(container.querySelectorAll("p, li"))
        .map((node) => node.textContent.trim())
        .filter(Boolean);
}

function buildDownloadText(snapshot) {
    const sections = [
        "AI-Powered Anemia Detection Summary",
        "",
        `Prediction: ${snapshot.result}`,
        `Risk Level: ${snapshot.severity}`,
        `Confidence: ${snapshot.confidencePercent}%`,
        `Indicator: ${snapshot.indicatorText}`,
        `Clinical Recommendation: ${snapshot.clinicalSummary}`,
        "",
        "Risk Interpretation:",
        ...htmlBlockToLines(snapshot.carePlan.interpretation).map((line) => `- ${line}`),
        "",
        "Suggested Tests:",
        ...htmlBlockToLines(snapshot.carePlan.tests).map((line) => `- ${line}`),
        "",
        "Symptom Checklist:",
        ...htmlBlockToLines(snapshot.carePlan.symptoms).map((line) => `- ${line}`),
        "",
        "Diet Support:",
        ...htmlBlockToLines(snapshot.carePlan.diet).map((line) => `- ${line}`),
        "",
        "Detailed Clinical Notes:",
        ...htmlBlockToLines(snapshot.notesHtml).map((line) => `- ${line}`),
        "",
        "Important: This AI result is for screening support only and is not a medical diagnosis. Please consult a healthcare professional."
    ];

    return sections.join("\n");
}

function downloadResultSummary() {
    if (!latestResultSnapshot) return;

    const fileContent = buildDownloadText(latestResultSnapshot);
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeDate = new Date().toISOString().slice(0, 10);

    link.href = objectUrl;
    link.download = `anemia-screening-summary-${safeDate}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
}

downloadSummaryBtn?.addEventListener("click", downloadResultSummary);

function showResults(data) {
    const confidencePercent = (data.confidence * 100).toFixed(2);
    const isAnemic = data.result.toLowerCase() === "anemic";
    const severity = getSeverityLabel(data, isAnemic);
    const theme = getResultTheme(isAnemic, severity);
    const carePlan = buildCarePlan(data.result, severity, confidencePercent);

    resultText.innerText = data.result;
    confidenceText.innerText = confidencePercent + "%";

    if (diagnosisBadge) {
        diagnosisBadge.innerText = data.result;
        diagnosisBadge.className = theme.badgeClass;
    }

    if (riskLevel) {
        riskLevel.innerText = severity;
        riskLevel.className = theme.riskClass;
    }

    confidenceFill.style.width = confidencePercent + "%";
    confidenceFill.style.background = theme.gaugeColor;
    meterValue.innerText = confidencePercent + "%";

    resultIndicator.className = theme.indicatorClass;
    resultIndicator.textContent = theme.indicatorText;

    clinicalSummary.innerText = isAnemic
        ? `Possible ${severity.toLowerCase()} anemia pattern detected. Please consult a clinician.`
        : "No anemia pattern detected on this screening image.";

    const notesHtml = buildClinicalNotes(data.result, severity, confidencePercent);
    medicalNotes.innerHTML = notesHtml;
    if (riskInterpretation) riskInterpretation.innerHTML = carePlan.interpretation;
    if (suggestedTests) suggestedTests.innerHTML = carePlan.tests;
    if (symptomChecklist) symptomChecklist.innerHTML = carePlan.symptoms;
    if (dietGuidance) dietGuidance.innerHTML = carePlan.diet;

    latestResultSnapshot = {
        result: data.result,
        severity,
        confidencePercent,
        indicatorText: theme.indicatorText,
        clinicalSummary: clinicalSummary.innerText,
        carePlan,
        notesHtml
    };

    if (downloadSummaryBtn) {
        downloadSummaryBtn.disabled = false;
    }

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
