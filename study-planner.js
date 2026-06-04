const DIFFICULTY_LABELS = {
    light: "Ringan",
    normal: "Normal",
    intense: "Intensif"
};

function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function readNumber(formData, key, fallback, minimum, maximum) {
    const parsedValue = parseFloat(String(formData.get(key) || fallback).replace(",", "."));
    const value = Number.isNaN(parsedValue) ? fallback : parsedValue;
    return clamp(value, minimum, maximum);
}

function readInteger(formData, key, fallback, minimum, maximum) {
    return Math.round(readNumber(formData, key, fallback, minimum, maximum));
}

function readValues(form) {
    const formData = new FormData(form);
    const difficulty = String(formData.get("difficulty") || "normal");
    const prioritySubject = String(formData.get("priority_subject") || "Matematika").trim();

    return {
        currentAverage: readNumber(formData, "current_average", 78, 0, 100),
        targetAverage: readNumber(formData, "target_average", 85, 0, 100),
        daysLeft: readInteger(formData, "days_left", 30, 1, 180),
        studyHours: readNumber(formData, "study_hours", 1.5, 0.25, 8),
        prioritySubject: prioritySubject.slice(0, 48) || "Matematika",
        difficulty: Object.prototype.hasOwnProperty.call(DIFFICULTY_LABELS, difficulty) ? difficulty : "normal"
    };
}

function getPace(gap, daysLeft, difficulty) {
    if (gap <= 0) {
        return {
            label: "Maintenance",
            note: "Target sudah aman. Fokusnya sekarang menjaga konsistensi dan menghindari penurunan."
        };
    }

    const scoreGainPerWeek = gap / Math.max(daysLeft / 7, 1);

    if (difficulty === "intense" || scoreGainPerWeek > 4) {
        return {
            label: "Agresif",
            note: "Target ini cukup menantang. Kurangi jeda kosong dan cek progres lebih sering."
        };
    }

    if (scoreGainPerWeek > 2) {
        return {
            label: "Stabil",
            note: "Target masih realistis selama latihan dan review kesalahan dilakukan rutin."
        };
    }

    return {
        label: "Terkontrol",
        note: "Targetnya nyaman dikejar. Jadwal bisa dibuat konsisten tanpa belajar berlebihan."
    };
}

function buildCheckpoints(values, gap) {
    return [0.25, 0.5, 0.75, 1].map((ratio) => {
        const day = Math.max(1, Math.min(values.daysLeft, Math.ceil(values.daysLeft * ratio)));
        const score = gap <= 0 ? values.currentAverage : values.currentAverage + (gap * ratio);

        return {
            day,
            score: Math.min(score, values.targetAverage),
            note: "Cek rata-rata latihan dan catat tipe soal yang masih sering salah."
        };
    });
}

function buildPlan(values) {
    const gap = Math.max(values.targetAverage - values.currentAverage, 0);
    const dailyMinutes = Math.max(15, Math.round(values.studyHours * 60));
    let conceptMinutes;
    let practiceMinutes;

    if (gap <= 0) {
        conceptMinutes = Math.round(dailyMinutes * 0.3);
        practiceMinutes = Math.round(dailyMinutes * 0.4);
    } else if (values.difficulty === "light") {
        conceptMinutes = Math.round(dailyMinutes * 0.36);
        practiceMinutes = Math.round(dailyMinutes * 0.38);
    } else if (values.difficulty === "intense") {
        conceptMinutes = Math.round(dailyMinutes * 0.44);
        practiceMinutes = Math.round(dailyMinutes * 0.4);
    } else {
        conceptMinutes = Math.round(dailyMinutes * 0.4);
        practiceMinutes = Math.round(dailyMinutes * 0.38);
    }

    const reviewMinutes = Math.max(5, dailyMinutes - conceptMinutes - practiceMinutes);
    const pace = getPace(gap, values.daysLeft, values.difficulty);

    return {
        gap,
        dailyMinutes,
        totalHours: (dailyMinutes * values.daysLeft) / 60,
        pace: pace.label,
        paceNote: pace.note,
        dailyPlan: [
            {
                label: `Konsep ${values.prioritySubject}`,
                minutes: conceptMinutes,
                description: "Baca ulang materi inti, buat rangkuman pendek, lalu tandai bagian yang belum jelas."
            },
            {
                label: "Latihan soal",
                minutes: practiceMinutes,
                description: "Kerjakan soal dari level mudah ke sedang, lalu ulangi tipe soal yang salah."
            },
            {
                label: "Review cepat",
                minutes: reviewMinutes,
                description: "Tutup sesi dengan evaluasi kesalahan dan target kecil untuk sesi berikutnya."
            }
        ],
        checkpoints: buildCheckpoints(values, gap)
    };
}

function renderPlan(plan) {
    const dailyItems = plan.dailyPlan.map((item) => `
        <div class="plan-item">
            <span>${escapeHtml(item.label)}</span>
            <strong>${item.minutes} menit</strong>
            <p>${escapeHtml(item.description)}</p>
        </div>
    `).join("");

    const checkpointItems = plan.checkpoints.map((item) => `
        <div class="checkpoint-item">
            <span>Hari ${item.day}</span>
            <strong>Target latihan ${item.score.toFixed(1)}</strong>
            <p>${escapeHtml(item.note)}</p>
        </div>
    `).join("");

    return `
        <section class="planner-result">
            <div class="result-grid">
                <article class="metric-card">
                    <span>Gap Nilai</span>
                    <strong>${plan.gap.toFixed(1)}</strong>
                    <p>Selisih dari rata-rata sekarang ke target akhir.</p>
                </article>

                <article class="metric-card">
                    <span>Belajar Harian</span>
                    <strong>${plan.dailyMinutes}m</strong>
                    <p>Total sekitar ${plan.totalHours.toFixed(1)} jam sampai deadline.</p>
                </article>

                <article class="metric-card">
                    <span>Ritme</span>
                    <strong>${escapeHtml(plan.pace)}</strong>
                    <p>${escapeHtml(plan.paceNote)}</p>
                </article>
            </div>

            <div class="plan-layout">
                <article class="plan-panel">
                    <h2>Daily Split</h2>
                    <div class="plan-list">${dailyItems}</div>
                </article>

                <article class="plan-panel">
                    <h2>Checkpoint</h2>
                    <div class="checkpoint-list">${checkpointItems}</div>
                </article>
            </div>
        </section>
    `;
}

function handleSubmit(event) {
    event.preventDefault();

    const output = document.getElementById("planner-output");
    const values = readValues(event.currentTarget);
    output.innerHTML = renderPlan(buildPlan(values));
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("planner-form").addEventListener("submit", handleSubmit);
});
