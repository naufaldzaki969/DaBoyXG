const MAX_SEMESTERS = 5;
const MAX_HISTORY_ITEMS = 8;
const SCORE_MIN = 0;
const SCORE_MAX = 100;
const IPAS_ELECTIVE_LIMIT = 4;

const EDUCATION_CONFIG = {
    "sd-smp": {
        label: "SD-SMP",
        subjects: [
            { key: "matematika", label: "Matematika" },
            { key: "ipa", label: "IPA" },
            { key: "ips", label: "IPS" },
            { key: "informatika", label: "Informatika" },
            { key: "bahasa-indonesia", label: "Bahasa Indonesia" },
            { key: "bahasa-inggris", label: "Bahasa Inggris" },
            { key: "pendidikan-agama", label: "Pendidikan Agama" },
            { key: "pendidikan-jasmani", label: "Pendidikan Jasmani" }
        ]
    },
    sma: {
        label: "SMA",
        majors: {
            ipa: {
                label: "IPA",
                subjects: [
                    { key: "matematika-wajib", label: "Matematika Wajib" },
                    { key: "matematika-lanjutan", label: "Matematika Tingkat Lanjut" },
                    { key: "fisika", label: "Fisika" },
                    { key: "kimia", label: "Kimia" },
                    { key: "biologi", label: "Biologi" },
                    { key: "sejarah", label: "Sejarah" },
                    { key: "bahasa-indonesia", label: "Bahasa Indonesia" },
                    { key: "bahasa-inggris", label: "Bahasa Inggris" }
                ]
            },
            ips: {
                label: "IPS",
                subjects: [
                    { key: "matematika-wajib", label: "Matematika Wajib" },
                    { key: "ekonomi", label: "Ekonomi" },
                    { key: "sosiologi", label: "Sosiologi" },
                    { key: "geografi", label: "Geografi" },
                    { key: "sejarah-wajib", label: "Sejarah Wajib" },
                    { key: "sejarah-lanjutan", label: "Sejarah Tingkat Lanjut" },
                    { key: "bahasa-indonesia", label: "Bahasa Indonesia" },
                    { key: "bahasa-inggris", label: "Bahasa Inggris" }
                ]
            },
            ipas: {
                label: "IPAS",
                baseSubjects: [
                    { key: "matematika-wajib", label: "Matematika Wajib" },
                    { key: "sejarah", label: "Sejarah" },
                    { key: "bahasa-indonesia", label: "Bahasa Indonesia" },
                    { key: "bahasa-inggris", label: "Bahasa Inggris" }
                ],
                electiveSubjects: [
                    { key: "ekonomi", label: "Ekonomi" },
                    { key: "sosiologi", label: "Sosiologi" },
                    { key: "geografi", label: "Geografi" },
                    { key: "sejarah-lanjutan", label: "Sejarah Tingkat Lanjut" },
                    { key: "matematika-lanjutan", label: "Matematika Tingkat Lanjut" },
                    { key: "fisika", label: "Fisika" },
                    { key: "kimia", label: "Kimia" },
                    { key: "biologi", label: "Biologi" }
                ]
            }
        }
    }
};

const FALLBACK_SUBJECT_LABELS = {
    matematika: "Matematika",
    ipa: "IPA",
    ips: "IPS",
    informatika: "Informatika",
    "bahasa-indonesia": "Bahasa Indonesia",
    "bahasa-inggris": "Bahasa Inggris",
    "pendidikan-agama": "Pendidikan Agama",
    "pendidikan-jasmani": "Pendidikan Jasmani",
    matematikaWajib: "Matematika Wajib",
    matematikaTingkatLanjut: "Matematika Tingkat Lanjut",
    sejarahWajib: "Sejarah Wajib",
    sejarahTingkatLanjut: "Sejarah Tingkat Lanjut",
    "matematika-wajib": "Matematika Wajib",
    "matematika-lanjutan": "Matematika Tingkat Lanjut",
    fisika: "Fisika",
    kimia: "Kimia",
    biologi: "Biologi",
    sejarah: "Sejarah",
    ekonomi: "Ekonomi",
    sosiologi: "Sosiologi",
    geografi: "Geografi",
    "sejarah-wajib": "Sejarah Wajib",
    "sejarah-lanjutan": "Sejarah Tingkat Lanjut"
};

let semesterCount = 0;
let fieldIdCounter = 0;
let activeConfiguration = null;

function clampNumber(value, min = SCORE_MIN, max = SCORE_MAX) {
    return Math.min(Math.max(value, min), max);
}

function clampScore(input) {
    const value = parseFloat(input.value);
    input.value = Number.isNaN(value) ? "" : clampNumber(value);
}

function cloneSubjects(subjects) {
    return subjects.map((subject) => ({ ...subject }));
}

function getActiveSubjects() {
    return activeConfiguration?.subjects || [];
}

function getSelectedElectiveKeys() {
    return Array.from(document.querySelectorAll('input[name="ipas-elective"]:checked'))
        .map((input) => input.value);
}

function getConfigurationSignature(subjects) {
    return subjects.map((subject) => `${subject.key}:${subject.label}`).join("|");
}

function buildSelectionState() {
    const level = document.getElementById("education-level").value;
    const major = document.getElementById("major-select").value;

    if (!level) {
        return {
            complete: false,
            helperText: "Pilih jenjang pendidikan untuk memulai pengisian data semester.",
            previewSubjects: []
        };
    }

    if (level === "sd-smp") {
        const subjects = cloneSubjects(EDUCATION_CONFIG["sd-smp"].subjects);
        return {
            complete: true,
            level,
            major: "",
            subjects,
            configurationLabel: EDUCATION_CONFIG["sd-smp"].label,
            helperText: "Konfigurasi SD-SMP siap digunakan. Kamu bisa langsung mengisi nilai per semester.",
            previewSubjects: subjects,
            signature: getConfigurationSignature(subjects)
        };
    }

    if (!major) {
        return {
            complete: false,
            level,
            major: "",
            helperText: "Pilih jurusan SMA agar daftar mata pelajaran dapat ditentukan.",
            previewSubjects: []
        };
    }

    if (major === "ipas") {
        const baseSubjects = cloneSubjects(EDUCATION_CONFIG.sma.majors.ipas.baseSubjects);
        const electiveSubjects = EDUCATION_CONFIG.sma.majors.ipas.electiveSubjects;
        const selectedElectives = getSelectedElectiveKeys();
        const previewSubjects = [
            ...baseSubjects,
            ...electiveSubjects.filter((subject) => selectedElectives.includes(subject.key))
        ];

        if (selectedElectives.length !== IPAS_ELECTIVE_LIMIT) {
            return {
                complete: false,
                level,
                major,
                helperText: "Pilih tepat 4 mata pelajaran pilihan untuk jurusan IPAS.",
                previewSubjects
            };
        }

        const subjects = [
            ...baseSubjects,
            ...cloneSubjects(electiveSubjects.filter((subject) => selectedElectives.includes(subject.key)))
        ];

        return {
            complete: true,
            level,
            major,
            subjects,
            configurationLabel: `SMA - ${EDUCATION_CONFIG.sma.majors.ipas.label}`,
            helperText: "Konfigurasi SMA jurusan IPAS siap digunakan. Kamu bisa langsung mengisi nilai per semester.",
            previewSubjects: subjects,
            signature: getConfigurationSignature(subjects)
        };
    }

    const subjects = cloneSubjects(EDUCATION_CONFIG.sma.majors[major].subjects);
    return {
        complete: true,
        level,
        major,
        subjects,
        configurationLabel: `SMA - ${EDUCATION_CONFIG.sma.majors[major].label}`,
        helperText: `Konfigurasi SMA jurusan ${EDUCATION_CONFIG.sma.majors[major].label} siap digunakan. Kamu bisa langsung mengisi nilai per semester.`,
        previewSubjects: subjects,
        signature: getConfigurationSignature(subjects)
    };
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

function createSemesterElement(semesterNumber) {
    const subjects = getActiveSubjects();
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
    inputGrid.append(...subjects.map((subject) => createInputField(subject)));

    actions.append(clearButton, removeButton);
    header.append(title, actions);
    semesterBox.append(header, inputGrid);

    return semesterBox;
}

function getSemesterBoxes() {
    return Array.from(document.querySelectorAll(".semester-box"));
}

function updateActionButtons() {
    const configurationReady = getActiveSubjects().length > 0;
    document.getElementById("add-semester-btn").disabled = !configurationReady || semesterCount >= MAX_SEMESTERS;
    document.getElementById("calculate-btn").disabled = !configurationReady || semesterCount === 0;
}

function updateSemesterState() {
    const semesterBoxes = getSemesterBoxes();
    semesterCount = semesterBoxes.length;

    semesterBoxes.forEach((box, index) => {
        box.querySelector(".semester-title").textContent = `Semester ${index + 1}`;
    });

    updateActionButtons();
}

function resetSemesterContainer() {
    document.getElementById("semester-container").innerHTML = "";
    semesterCount = 0;
    updateActionButtons();
}

function hideResult() {
    const output = document.getElementById("output");
    output.style.display = "none";
    output.innerHTML = "";
}

function addSemester() {
    if (!activeConfiguration) {
        alert("Pilih konfigurasi akademik terlebih dahulu.");
        return;
    }

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

function getSemesterInputs(subjects) {
    return getSemesterBoxes().map((semesterBox) => (
        subjects.reduce((inputs, subject) => {
            inputs[subject.key] = semesterBox.querySelector(`.${subject.key}`);
            return inputs;
        }, {})
    ));
}

function hasEmptyFields(semesterInputs, subjects) {
    return semesterInputs.some((semester) => (
        subjects.some((subject) => semester[subject.key].value.trim() === "")
    ));
}

function getInputValue(input) {
    return clampNumber(parseFloat(input.value) || 0);
}

function calculateSemesterAverage(subjectScores, subjects) {
    const total = subjects.reduce((sum, subject) => sum + subjectScores[subject.key], 0);
    return total / subjects.length;
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

function getFocusText(subjectAverages, subjects) {
    const lowestSubject = subjects.reduce((lowest, subject) => (
        subjectAverages[subject.key] < subjectAverages[lowest.key] ? subject : lowest
    ), subjects[0]);

    return `Fokus utama: ${lowestSubject.label}`;
}

function getResultSubjects(result) {
    if (Array.isArray(result.subjectDefinitions) && result.subjectDefinitions.length > 0) {
        return result.subjectDefinitions;
    }

    if (result.targetSubjects && typeof result.targetSubjects === "object") {
        return Object.keys(result.targetSubjects).map((key) => ({
            key,
            label: FALLBACK_SUBJECT_LABELS[key] || key
        }));
    }

    return getActiveSubjects();
}

function getTargetSubjectEntries(result) {
    const subjects = getResultSubjects(result);

    if (!result.targetSubjects || typeof result.targetSubjects !== "object" || subjects.length === 0) {
        return [];
    }

    return subjects
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
            <p>Hitung ulang dengan format mata pelajaran terbaru untuk melihat target tiap mata pelajaran.</p>
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
                <h3>Tren</h3>
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
                <h3>Konfigurasi</h3>
                <p>${result.configurationLabel || "-"}</p>
            </article>

            <article class="result-card">
                <h3>Target Per Mapel</h3>
                ${createTargetSubjectMarkup(result)}
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
                    <span>Tren</span>
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
                <div class="history-metric">
                    <span>Konfigurasi</span>
                    <strong>${item.configurationLabel || "-"}</strong>
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

function buildCalculationResult(semesterInputs, configuration) {
    const subjects = configuration.subjects;
    let totalSemesterScore = 0;
    const semesterValues = [];
    const subjectTotals = subjects.reduce((totals, subject) => {
        totals[subject.key] = 0;
        return totals;
    }, {});
    const subjectHistory = subjects.reduce((history, subject) => {
        history[subject.key] = [];
        return history;
    }, {});

    semesterInputs.forEach((semester) => {
        const subjectScores = subjects.reduce((scores, subject) => {
            const score = getInputValue(semester[subject.key]);
            scores[subject.key] = score;
            subjectTotals[subject.key] += score;
            subjectHistory[subject.key].push(score);
            return scores;
        }, {});

        const semesterAverage = calculateSemesterAverage(subjectScores, subjects);
        totalSemesterScore += semesterAverage;
        semesterValues.push(semesterAverage);
    });

    const semesterTotal = semesterInputs.length;
    const subjectAverages = subjects.reduce((averages, subject) => {
        averages[subject.key] = subjectTotals[subject.key] / semesterTotal;
        return averages;
    }, {});
    const targetSubjects = subjects.reduce((targets, subject) => {
        const subjectScores = subjectHistory[subject.key];
        const latestScore = subjectScores[subjectScores.length - 1];
        const previousScore = subjectScores[subjectScores.length - 2];
        targets[subject.key] = buildAdaptiveTarget(latestScore, previousScore);
        return targets;
    }, {});
    const lastValue = semesterValues[semesterValues.length - 1];
    const previousSemesterValue = semesterValues[semesterValues.length - 2];

    return {
        configurationLabel: configuration.configurationLabel,
        subjectDefinitions: cloneSubjects(subjects),
        semesterTotal,
        rataRata: totalSemesterScore / semesterTotal,
        trendText: getTrendText(semesterValues),
        targetNext: buildAdaptiveTarget(lastValue, previousSemesterValue),
        targetSubjects,
        focus: getFocusText(subjectAverages, subjects)
    };
}

function calculate() {
    if (!activeConfiguration) {
        alert("Lengkapi konfigurasi akademik terlebih dahulu.");
        return;
    }

    const subjects = getActiveSubjects();
    const semesterInputs = getSemesterInputs(subjects);

    if (semesterInputs.length === 0) {
        alert("Tambahkan minimal 1 semester.");
        return;
    }

    if (hasEmptyFields(semesterInputs, subjects)) {
        alert("Lengkapi semua nilai mata pelajaran di setiap semester terlebih dahulu.");
        return;
    }

    const result = buildCalculationResult(semesterInputs, activeConfiguration);
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
    hideResult();
    renderHistory();
}

function renderSubjectPreview(subjects) {
    const container = document.getElementById("subject-preview");

    if (!subjects || subjects.length === 0) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = subjects.map((subject) => `
        <span class="subject-chip">${subject.label}</span>
    `).join("");
}

function renderIpasElectiveOptions() {
    const container = document.getElementById("ipas-option-list");
    const options = EDUCATION_CONFIG.sma.majors.ipas.electiveSubjects;

    container.innerHTML = options.map((subject) => `
        <label class="choice-item">
            <input type="checkbox" name="ipas-elective" value="${subject.key}">
            <span>${subject.label}</span>
        </label>
    `).join("");
}

function updateIpasCounter() {
    const selectedCount = getSelectedElectiveKeys().length;
    document.getElementById("ipas-counter").textContent = `${selectedCount} / ${IPAS_ELECTIVE_LIMIT} dipilih`;

    document.querySelectorAll('input[name="ipas-elective"]').forEach((input) => {
        input.disabled = !input.checked && selectedCount >= IPAS_ELECTIVE_LIMIT;
    });
}

function getSemesterNote(state) {
    if (state.complete) {
        return `Minimal 1 semester, maksimal 5 semester. Isi seluruh mata pelajaran untuk konfigurasi ${state.configurationLabel}.`;
    }

    if (state.level === "sma" && state.major === "ipas") {
        return "Minimal 1 semester, maksimal 5 semester. Selesaikan pemilihan 4 mata pelajaran IPAS terlebih dahulu.";
    }

    if (state.level === "sma") {
        return "Minimal 1 semester, maksimal 5 semester. Pilih jurusan SMA terlebih dahulu agar mata pelajaran dapat ditampilkan.";
    }

    return "Minimal 1 semester, maksimal 5 semester. Daftar mata pelajaran akan menyesuaikan konfigurasi akademik yang dipilih.";
}

function renderConfigurationState(state) {
    document.getElementById("major-field").hidden = state.level !== "sma";
    document.getElementById("ipas-panel").hidden = state.major !== "ipas";
    document.getElementById("config-helper").textContent = state.helperText;
    document.getElementById("semester-note").textContent = getSemesterNote(state);
    renderSubjectPreview(state.previewSubjects);
    updateIpasCounter();
    updateActionButtons();
}

function applyConfigurationChange() {
    const nextState = buildSelectionState();
    const previousSignature = activeConfiguration?.signature || "";
    const nextSignature = nextState.complete ? nextState.signature : "";

    renderConfigurationState(nextState);

    if (previousSignature !== nextSignature) {
        activeConfiguration = nextState.complete ? nextState : null;
        resetSemesterContainer();
        hideResult();

        if (activeConfiguration) {
            addSemester();
        }
        return;
    }

    activeConfiguration = nextState.complete ? nextState : null;
    updateActionButtons();
}

function handleEducationLevelChange(event) {
    if (event.target.value !== "sma") {
        document.getElementById("major-select").value = "";
    }

    document.querySelectorAll('input[name="ipas-elective"]').forEach((input) => {
        input.checked = false;
    });

    applyConfigurationChange();
}

function handleMajorChange(event) {
    if (event.target.value !== "ipas") {
        document.querySelectorAll('input[name="ipas-elective"]').forEach((input) => {
            input.checked = false;
        });
    }

    applyConfigurationChange();
}

function handleIpasElectiveChange(event) {
    if (!event.target.matches('input[name="ipas-elective"]')) {
        return;
    }

    if (getSelectedElectiveKeys().length > IPAS_ELECTIVE_LIMIT) {
        event.target.checked = false;
        alert("Untuk jurusan IPAS, kamu hanya bisa memilih 4 mata pelajaran pilihan.");
    }

    applyConfigurationChange();
}

function initializePage() {
    document.getElementById("education-level").addEventListener("change", handleEducationLevelChange);
    document.getElementById("major-select").addEventListener("change", handleMajorChange);
    document.getElementById("ipas-option-list").addEventListener("change", handleIpasElectiveChange);
    document.getElementById("add-semester-btn").addEventListener("click", addSemester);
    document.getElementById("calculate-btn").addEventListener("click", calculate);
    document.getElementById("clear-history-btn").addEventListener("click", clearStoredHistory);

    renderIpasElectiveOptions();
    renderConfigurationState(buildSelectionState());
    renderLatestStoredResult();
    renderHistory();
}

document.addEventListener("DOMContentLoaded", initializePage);
