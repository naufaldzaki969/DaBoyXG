let semesterCount = 0;

function addSemester() {

    if (semesterCount >= 5) {
        alert("Maksimal 5 semester.");
        return;
    }

    semesterCount++;

    const container = document.getElementById("semester-container");

    const div = document.createElement("div");
    div.className = "semester-box";

    div.innerHTML = `
        <div class="semester-title">Semester ${semesterCount}</div>
        <input type="number" placeholder="Nilai Tugas" class="tugas">
        <input type="number" placeholder="Nilai UTS" class="uts">
        <input type="number" placeholder="Nilai UAS" class="uas">
    `;

    container.appendChild(div);
}

function calculate() {

    let tugasList = document.querySelectorAll(".tugas");
    let utsList = document.querySelectorAll(".uts");
    let uasList = document.querySelectorAll(".uas");

    let count = tugasList.length;

    if (count === 0) {
        alert("Tambahkan minimal 1 semester.");
        return;
    }

    let total = 0;
    let semesterValues = [];

    let totalTugas = 0;
    let totalUTS = 0;
    let totalUAS = 0;

    for (let i = 0; i < count; i++) {

        let tugas = parseFloat(tugasList[i].value) || 0;
        let uts = parseFloat(utsList[i].value) || 0;
        let uas = parseFloat(uasList[i].value) || 0;

        totalTugas += tugas;
        totalUTS += uts;
        totalUAS += uas;

        let nilaiSemester =
            (tugas * 0.3) +
            (uts * 0.3) +
            (uas * 0.4);

        semesterValues.push(nilaiSemester);
        total += nilaiSemester;
    }

    let rataRata = total / count;

    let avgTugas = totalTugas / count;
    let avgUTS = totalUTS / count;
    let avgUAS = totalUAS / count;

    // TREND
    let trendText = "Belum cukup data untuk trend.";

    if (count >= 2) {
        let last = semesterValues[count - 1];
        let prev = semesterValues[count - 2];

        if (last > prev) {
            trendText = "Trend nilai meningkat.";
        } else if (last < prev) {
            trendText = "Trend nilai menurun.";
        } else {
            trendText = "Nilai stagnan.";
        }
    }

    // TARGET NEXT
    let lastValue = semesterValues[count - 1];
    let targetNext = Math.min(lastValue + 2, 100);

    // TARGET PER KOMPONEN
    let targetTugas = Math.min(avgTugas + 3, 100);
    let targetUTS = Math.min(avgUTS + 3, 100);
    let targetUAS = Math.min(avgUAS + 3, 100);

    // FOCUS
    let focus = "";

    if (avgTugas <= avgUTS && avgTugas <= avgUAS) {
        focus = "Fokus utama: Tugas";
    } else if (avgUTS <= avgTugas && avgUTS <= avgUAS) {
        focus = "Fokus utama: UTS";
    } else {
        focus = "Fokus utama: UAS";
    }

    // OUTPUT
    let output = document.getElementById("output");
    output.style.display = "block";

    output.innerHTML = `
        <h3>Rata-rata Nilai</h3>
        <p><strong>${rataRata.toFixed(2)}</strong></p>

        <h3>Trend</h3>
        <p>${trendText}</p>

        <h3>Target Semester Berikutnya</h3>
        <p><strong>${targetNext.toFixed(2)}</strong></p>

        <h3>Target Per Komponen</h3>
        <p>Tugas: ${targetTugas.toFixed(1)}</p>
        <p>UTS: ${targetUTS.toFixed(1)}</p>
        <p>UAS: ${targetUAS.toFixed(1)}</p>

        <h3>Strategi</h3>
        <p>${focus}</p>
    `;
}