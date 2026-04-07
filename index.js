// Quick Overview Helpers
function setText(id, value) {
    document.getElementById(id).textContent = value;
}

// Home Hero Overview
function loadQuickOverview() {
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

// Page Init
document.addEventListener("DOMContentLoaded", loadQuickOverview);
