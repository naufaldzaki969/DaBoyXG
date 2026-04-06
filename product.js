const MAX_SEMESTERS = 5;
const MAX_HISTORY_ITEMS = 8;
const SCORE_MIN = 0;
const SCORE_MAX = 100;
const WEIGHTS = {
    tugas: 0.3,
    uts: 0.3,
    uas: 0.4
};

let semesterCount = 0;

function clampNumber(value, min = SCORE_MIN, max = SCORE_MAX) {
    return Math.min(Math.max(value, min), max);
}

function clampScore(input) {
    const value = parseFloat(input.value);
    input.value = Number.isNaN(value) ? "" : clampNumber(value);
}

function createInputField(className, labelText) {
    const fieldGroup = document.createElement("div");
    fieldGroup.className = "field-group";

    const label = document.createElement("label");
    label.textContent = labelText;

    const input = document.createElement("input");
    input.type = "number";
    input.className = className;
    input.placeholder = labelText;
    input.min = SCORE_MIN;
    input.max = SCORE_MAX;
    input.addEventListener("input", () => clampScore(input));

    fieldGroup.append(label, input);
    return fieldGroup;
}

function createSemesterElement(semesterNumber) {
    const semesterBox = document.createElement("div");
    semesterBox.className = "semester-box";

    const header = document.createElement("div");
    header.className = "semester-header";

    const title = document.createElement("div");
    title.className = "semester-title";
    title.textContent = `Semester ${semesterNumber}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "semester-remove";
    removeButton.textContent = "Hapus";
    removeButton.addEventListener("click", () => removeSemester(semesterBox));

    const inputGrid = document.createElement("div");
    inputGrid.className = "input-grid";
    inputGrid.append(
        createInputField("tugas", "Nilai Tugas"),
        createInputField("uts", "Nilai UTS"),
        createInputField("uas", "Nilai UAS")
    );

    header.append(title, removeButton);
    semesterBox.append(header, inputGrid);

    return semesterBox;
}

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

function getSemesterInputs() {
    return getSemesterBoxes().map((semesterBox) => ({
        tugas: semesterBox.querySelector(".tugas"),
        uts: semesterBox.querySelector(".uts"),
        uas: semesterBox.querySelector(".uas")
    }));
}

function hasEmptyFields(semesterInputs) {
    return semesterInputs.some(({ tugas, uts, uas }) => (
        tugas.value.trim() === "" ||
        uts.value.trim() === "" ||
        uas.value.trim() === ""
    ));
}

function getInputValue(input) {
    return clampNumber(parseFloat(input.value) || 0);
}

function calculateSemesterScore({ tugas, uts, uas }) {
    return (tugas * WEIGHTS.tugas) + (uts * WEIGHTS.uts) + (uas * WEIGHTS.uas);
}

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

function getFocusText(avgTugas, avgUTS, avgUAS) {
    if (avgTugas <= avgUTS && avgTugas <= avgUAS) {
        return "Fokus utama: Tugas";
    }

    if (avgUTS <= avgTugas && avgUTS <= avgUAS) {
        return "Fokus utama: UTS";
    }

    return "Fokus utama: UAS";
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
                <h3>Target Per Komponen</h3>
                <div class="component-list">
                    <div class="component-row">
                        <span>Tugas</span>
                        <strong>${result.targetTugas.toFixed(1)}</strong>
                    </div>
                    <div class="component-row">
                        <span>UTS</span>
                        <strong>${result.targetUTS.toFixed(1)}</strong>
                    </div>
                    <div class="component-row">
                        <span>UAS</span>
                        <strong>${result.targetUAS.toFixed(1)}</strong>
                    </div>
                </div>
            </article>
        </div>
    `;
}

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
                    <span>Focus</span>
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
                Belum ada riwayat kalkulasi. Setelah kamu menekan "Hitung Sekarang", hasil terbaru akan muncul di sini dan juga di Quick Overview halaman home.
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

function buildCalculationResult(semesterInputs) {
    let totalSemesterScore = 0;
    let totalTugas = 0;
    let totalUTS = 0;
    let totalUAS = 0;
    const semesterValues = [];

    semesterInputs.forEach(({ tugas: tugasInput, uts: utsInput, uas: uasInput }) => {
        const tugas = getInputValue(tugasInput);
        const uts = getInputValue(utsInput);
        const uas = getInputValue(uasInput);
        const semesterScore = calculateSemesterScore({ tugas, uts, uas });

        totalTugas += tugas;
        totalUTS += uts;
        totalUAS += uas;
        totalSemesterScore += semesterScore;
        semesterValues.push(semesterScore);
    });

    const semesterTotal = semesterInputs.length;
    const avgTugas = totalTugas / semesterTotal;
    const avgUTS = totalUTS / semesterTotal;
    const avgUAS = totalUAS / semesterTotal;
    const lastValue = semesterValues[semesterValues.length - 1];

    return {
        semesterTotal,
        rataRata: totalSemesterScore / semesterTotal,
        trendText: getTrendText(semesterValues),
        targetNext: Math.max(80, Math.min(lastValue + 2, SCORE_MAX)),
        targetTugas: Math.max(75, Math.min(avgTugas + 2, SCORE_MAX)),
        targetUTS: Math.max(75, Math.min(avgUTS + 2, SCORE_MAX)),
        targetUAS: Math.max(75, Math.min(avgUAS + 2, SCORE_MAX)),
        focus: getFocusText(avgTugas, avgUTS, avgUAS)
    };
}

function calculate() {
    const semesterInputs = getSemesterInputs();

    if (semesterInputs.length === 0) {
        alert("Tambahkan minimal 1 semester.");
        return;
    }

    if (hasEmptyFields(semesterInputs)) {
        alert("Lengkapi semua nilai tugas, UTS, dan UAS terlebih dahulu.");
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

function clearStoredHistory() {
    if (gradeScopeHistory.read().length === 0) {
        return;
    }

    gradeScopeHistory.clear();
    document.getElementById("output").style.display = "none";
    renderHistory();
}

function initializePage() {
    document.getElementById("add-semester-btn").addEventListener("click", addSemester);
    document.getElementById("calculate-btn").addEventListener("click", calculate);
    document.getElementById("clear-history-btn").addEventListener("click", clearStoredHistory);

    addSemester();
    renderLatestStoredResult();
    renderHistory();
}

document.addEventListener("DOMContentLoaded", initializePage);
