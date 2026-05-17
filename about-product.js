function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function loadQuickOverview() {
    if (typeof gradeScopeHistory === "undefined") {
        return;
    }

    const latestHistory = gradeScopeHistory.getLatest();

    if (!latestHistory) {
        return;
    }

    setText("overview-status", "Synced");
    setText("overview-score", latestHistory.rataRata.toFixed(2));
    setText("overview-caption", `Target berikutnya ${latestHistory.targetNext.toFixed(2)} dari ${latestHistory.semesterTotal} semester terakhir.`);
    setText("overview-trend", gradeScopeHistory.simplifyTrend(latestHistory.trendText));
    setText("overview-focus", gradeScopeHistory.simplifyFocus(latestHistory.focus));
    setText("overview-updated", gradeScopeHistory.formatDateTime(latestHistory.createdAt));
}

document.addEventListener("DOMContentLoaded", loadQuickOverview);
