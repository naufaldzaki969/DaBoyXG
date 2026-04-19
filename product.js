const MAX_SEMESTERS = 5;
const MAX_HISTORY_ITEMS = 8;
const SCORE_MIN = 0;
const SCORE_MAX = 100;

// Subject Configuration
const SUBJECTS = [
    { key: "matematika", label: "Matematika" },
    { key: "ipa", label: "IPA" },
    { key: "ips", label: "IPS" },
    { key: "informatika", label: "Informatika" },
    { key: "bahasaIndonesia", label: "Bahasa Indonesia" },
    { key: "bahasaInggris", label: "Bahasa Inggris" },
    { key: "pendidikanAgama", label: "Pendidikan Agama" }
];

let semesterCount = 0;
let fieldIdCounter = 0;

// Input Helpers
function clampNumber(value, min = SCORE_MIN, max = SCORE_MAX) {
    return Math.min(Math.max(value, min), max);
}

function clampScore(input) {
    const value = parseFloat(input.value);
    input.value = Number.isNaN(value) ? "" : clampNumber(value);
}

function createInputField(subject) {
    const fieldGroup = document.createElement("div");
    fieldGroup.className = "field-group";

    const label = document.createElement("label");
    label.textContent = subject.label;

    const input = document.createElement("input");
    const inputId = `subject-${subject.key}-${++fieldIdCounter}`;
    input.type = "number";
    input.id = inputId;
    input.name = inputId;
    input.className = `subject-input ${subject.key}`;
    input.placeholder = subject.label;
    input.min = SCORE_MIN;
    input.max = SCORE_MAX;
    input.step = "0.01";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.addEventListener("input", () => clampScore(input));
    label.htmlFor = inputId;

    fieldGroup.append(label, input);
    return fieldGroup;
}

// Semester Box Builder
function createSemesterElement(semesterNumber) {
    const semesterBox = document.createElement("div");
    semesterBox.className = "semester-box";

    const header = document.createElement("div");
    header.className = "semester-header";

    const title = document.createElement("div");
    title.className = "semester-title";
    title.textContent = `Semester ${semesterNumber}`;

    const actions = document.createElement("div");
    actions.className = "semester-actions";

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "semester-clear";
    clearButton.textContent = "Hapus Nilai";
    clearButton.addEventListener("click", () => clearSemesterInputs(semesterBox));

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "semester-remove";
    removeButton.textContent = "Hapus";
    removeButton.addEventListener("click", () => removeSemester(semesterBox));

    const inputGrid = document.createElement("div");
    inputGrid.className = "input-grid";
    inputGrid.append(...SUBJECTS.map((subject) => createInputField(subject)));

    actions.append(clearButton, removeButton);
    header.append(title, actions);
    semesterBox.append(header, inputGrid);

    return semesterBox;
}

// Semester State
function getSemesterBoxes() {
    return Array.from(document.querySelectorAll(".semester-box"));
}

function updateSemesterState() {
    const semesterBoxes = getSemesterBoxes();
    semesterCount = semesterBoxes.length;

    semesterBoxes.forEach((box, index) => {
        box.querySelector(".semester-title").textContent = `Semester ${index + 1}`;
    });

    document.getElementById("add-semester-btn").disabled = semesterCount >= MAX_SEMESTERS;
}

function addSemester() {
    if (semesterCount >= MAX_SEMESTERS) {
        alert("Maksimal 5 semester.");
        return;
    }

    document.getElementById("semester-container").appendChild(createSemesterElement(semesterCount + 1));
    updateSemesterState();
}

function removeSemester(semesterElement) {
    if (getSemesterBoxes().length === 1) {
        alert("Minimal harus ada 1 semester.");
        return;
    }

    semesterElement.remove();
    updateSemesterState();
}

function clearSemesterInputs(semesterElement) {
    semesterElement.querySelectorAll(".subject-input").forEach((input) => {
        input.value = "";
    });
}

// Data Collection
function getSemesterInputs() {
    return getSemesterBoxes().map((semesterBox) => (
        SUBJECTS.reduce((inputs, subject) => {
            inputs[subject.key] = semesterBox.querySelector(`.${subject.key}`);
            return inputs;
        }, {})
    ));
}

function hasEmptyFields(semesterInputs) {
    return semesterInputs.some((semester) => (
        SUBJECTS.some((subject) => semester[subject.key].value.trim() === "")
    ));
}

function getInputValue(input) {
    return clampNumber(parseFloat(input.value) || 0);
}

// Scoring and Target Logic
function calculateSemesterAverage(subjectScores) {
    const total = SUBJECTS.reduce((sum, subject) => sum + subjectScores[subject.key], 0);
    return total / SUBJECTS.length;
}

function getImprovementStep(score) {
    if (score < 60) {
        return 6;
    }

    if (score < 70) {
        return 5;
    }

    if (score < 80) {
        return 4;
    }

    if (score < 90) {
        return 2.5;
    }

    return 1;
}

function getTrendAdjustment(currentValue, previousValue) {
    if (typeof previousValue !== "number") {
        return currentValue < 75 ? 1 : 0;
    }

    if (currentValue < previousValue) {
        return 1.5;
    }

    if (currentValue > previousValue) {
        return 0;
    }

    return 0.5;
}

function buildAdaptiveTarget(score, previousScore) {
    const improvement = getImprovementStep(score) + getTrendAdjustment(score, previousScore);
    return Math.min(score + improvement, SCORE_MAX);
}

// Insight Text
function getTrendText(semesterValues) {
    if (semesterValues.length < 2) {
        return "Belum cukup data untuk trend.";
    }

    const lastValue = semesterValues[semesterValues.length - 1];
    const previousValue = semesterValues[semesterValues.length - 2];

    if (lastValue > previousValue) {
        return "Trend nilai meningkat.";
    }

    if (lastValue < previousValue) {
        return "Trend nilai menurun.";
    }

    return "Nilai stagnan.";
}

function getFocusText(subjectAverages) {
    const lowestSubject = SUBJECTS.reduce((lowest, subject) => (
        subjectAverages[subject.key] < subjectAverages[lowest.key] ? subject : lowest
    ), SUBJECTS[0]);

    return `Fokus utama: ${lowestSubject.label}`;
}

// Result Rendering
function getTargetSubjectEntries(result) {
    if (!result.targetSubjects || typeof result.targetSubjects !== "object") {
        return [];
    }

    return SUBJECTS
        .map((subject) => ({
            label: subject.label,
            value: result.targetSubjects[subject.key]
        }))
        .filter((subject) => typeof subject.value === "number");
}

function createTargetSubjectMarkup(result) {
    const targetSubjects = getTargetSubjectEntries(result);

    if (targetSubjects.length === 0) {
        return `
            <p>Hitung ulang dengan format mapel terbaru untuk melihat target tiap mata pelajaran.</p>
        `;
    }

    return `
        <div class="component-list">
            ${targetSubjects.map((subject) => `
                <div class="component-row">
                    <span>${subject.label}</span>
                    <strong>${subject.value.toFixed(1)}</strong>
                </div>
            `).join("")}
        </div>
    `;
}

function renderResult(result) {
    const output = document.getElementById("output");
    output.style.display = "block";
    output.innerHTML = `
        <div class="result-summary">
            <article class="result-card">
                <h3>Rata-rata Nilai</h3>
                <p class="result-value">${result.rataRata.toFixed(2)}</p>
            </article>

            <article class="result-card">
                <h3>Trend</h3>
                <p>${result.trendText}</p>
            </article>

            <article class="result-card">
                <h3>Target Semester Berikutnya</h3>
                <p class="result-value">${result.targetNext.toFixed(2)}</p>
            </article>

            <article class="result-card">
                <h3>Strategi</h3>
                <p>${result.focus}</p>
            </article>

            <article class="result-card">
                <h3>Target Per Mapel</h3>
                ${createTargetSubjectMarkup(result)}
            </article>
        </div>
    `;
}

// History Rendering
function createHistoryItem(item, index) {
    return `
        <article class="history-item">
            <div class="history-item-header">
                <div class="history-item-title">Kalkulasi ${index + 1}</div>
                <div class="history-item-time">${gradeScopeHistory.formatDateTime(item.createdAt)}</div>
            </div>

            <div class="history-item-grid">
                <div class="history-metric">
                    <span>Rata-rata</span>
                    <strong>${item.rataRata.toFixed(2)}</strong>
                </div>
                <div class="history-metric">
                    <span>Trend</span>
                    <strong>${item.trendText}</strong>
                </div>
                <div class="history-metric">
                    <span>Fokus</span>
                    <strong>${item.focus}</strong>
                </div>
                <div class="history-metric">
                    <span>Semester</span>
                    <strong>${item.semesterTotal}</strong>
                </div>
            </div>
        </article>
    `;
}

function renderHistory() {
    const history = gradeScopeHistory.read();
    const historyList = document.getElementById("history-list");
    document.getElementById("clear-history-btn").disabled = history.length === 0;

    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                Belum ada riwayat kalkulasi. Setelah kamu menekan "Hitung Sekarang", hasil terbaru akan muncul di sini agar bisa kamu cek lagi kapan pun dibutuhkan.
            </div>
        `;
        return;
    }

    historyList.innerHTML = history.map(createHistoryItem).join("");
}

function renderLatestStoredResult() {
    const latestHistory = gradeScopeHistory.getLatest();

    if (latestHistory) {
        renderResult(latestHistory);
    }
}

// Main Calculation
function buildCalculationResult(semesterInputs) {
    let totalSemesterScore = 0;
    const semesterValues = [];
    const subjectTotals = SUBJECTS.reduce((totals, subject) => {
        totals[subject.key] = 0;
        return totals;
    }, {});
    const subjectHistory = SUBJECTS.reduce((history, subject) => {
        history[subject.key] = [];
        return history;
    }, {});

    semesterInputs.forEach((semester) => {
        const subjectScores = SUBJECTS.reduce((scores, subject) => {
            const score = getInputValue(semester[subject.key]);
            scores[subject.key] = score;
            subjectTotals[subject.key] += score;
            subjectHistory[subject.key].push(score);
            return scores;
        }, {});
        const semesterAverage = calculateSemesterAverage(subjectScores);

        totalSemesterScore += semesterAverage;
        semesterValues.push(semesterAverage);
    });

    const semesterTotal = semesterInputs.length;
    const subjectAverages = SUBJECTS.reduce((averages, subject) => {
        averages[subject.key] = subjectTotals[subject.key] / semesterTotal;
        return averages;
    }, {});
    const targetSubjects = SUBJECTS.reduce((targets, subject) => {
        const subjectScores = subjectHistory[subject.key];
        const latestScore = subjectScores[subjectScores.length - 1];
        const previousScore = subjectScores[subjectScores.length - 2];
        targets[subject.key] = buildAdaptiveTarget(latestScore, previousScore);
        return targets;
    }, {});
    const lastValue = semesterValues[semesterValues.length - 1];
    const previousSemesterValue = semesterValues[semesterValues.length - 2];

    return {
        semesterTotal,
        rataRata: totalSemesterScore / semesterTotal,
        trendText: getTrendText(semesterValues),
        targetNext: buildAdaptiveTarget(lastValue, previousSemesterValue),
        targetSubjects,
        focus: getFocusText(subjectAverages)
    };
}

function calculate() {
    const semesterInputs = getSemesterInputs();

    if (semesterInputs.length === 0) {
        alert("Tambahkan minimal 1 semester.");
        return;
    }

    if (hasEmptyFields(semesterInputs)) {
        alert("Lengkapi semua nilai mapel di setiap semester terlebih dahulu.");
        return;
    }

    const result = buildCalculationResult(semesterInputs);
    renderResult(result);

    gradeScopeHistory.add({
        ...result,
        createdAt: new Date().toISOString()
    }, MAX_HISTORY_ITEMS);

    renderHistory();
}

// History Reset
function clearStoredHistory() {
    if (gradeScopeHistory.read().length === 0) {
        return;
    }

    gradeScopeHistory.clear();
    document.getElementById("output").style.display = "none";
    renderHistory();
}

// Page Init
function initializePage() {
    document.getElementById("add-semester-btn").addEventListener("click", addSemester);
    document.getElementById("calculate-btn").addEventListener("click", calculate);
    document.getElementById("clear-history-btn").addEventListener("click", clearStoredHistory);

    addSemester();
    renderLatestStoredResult();
    renderHistory();
}

document.addEventListener("DOMContentLoaded", initializePage);
