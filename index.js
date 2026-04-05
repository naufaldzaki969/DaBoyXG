const STORAGE_KEY = "gradescope-calculation-history";

function getStoredHistory() {
    try {
        const rawHistory = localStorage.getItem(STORAGE_KEY);
        const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];
        return Array.isArray(parsedHistory) ? parsedHistory : [];
    } catch (error) {
        return [];
    }
}

function formatDateTime(isoString) {
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(isoString));
}

function simplifyFocusText(focusText) {
    return focusText.replace("Fokus utama: ", "");
}

function loadQuickOverview() {
    const latestHistory = getStoredHistory()[0];

    if (!latestHistory) {
        return;
    }

    document.getElementById("overview-status").textContent = "Synced";
    document.getElementById("overview-score").textContent = latestHistory.rataRata.toFixed(2);
    document.getElementById("overview-caption").textContent = `Target berikutnya ${latestHistory.targetNext.toFixed(2)} dari ${latestHistory.semesterTotal} semester terakhir.`;
    document.getElementById("overview-trend").textContent = latestHistory.trendText.replace("Trend nilai ", "").replace(".", "");
    document.getElementById("overview-focus").textContent = simplifyFocusText(latestHistory.focus);
    document.getElementById("overview-updated").textContent = formatDateTime(latestHistory.createdAt);
}

document.addEventListener("DOMContentLoaded", loadQuickOverview);
