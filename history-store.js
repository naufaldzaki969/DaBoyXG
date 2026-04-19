// History Store
const gradeScopeHistory = (() => {
    const STORAGE_KEY = "gradescope-calculation-history";

    // Storage Access
    function read() {
        try {
            const rawHistory = localStorage.getItem(STORAGE_KEY);
            const parsedHistory = rawHistory ? JSON.parse(rawHistory) : [];
            return Array.isArray(parsedHistory) ? parsedHistory : [];
        } catch (error) {
            return [];
        }
    }

    function write(history) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    function clear() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function getLatest() {
        return read()[0] || null;
    }

    function add(entry, limit = 8) {
        const nextHistory = [entry, ...read()].slice(0, limit);
        write(nextHistory);
    }

    // Display Helpers
    function formatDateTime(isoString) {
        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(isoString));
    }

    function simplifyFocus(focusText = "") {
        return focusText.replace("Fokus utama: ", "");
    }

    function simplifyTrend(trendText = "") {
        return trendText.replace("Trend nilai ", "").replace(".", "");
    }

    // Public API
    return {
        add,
        clear,
        formatDateTime,
        getLatest,
        read,
        simplifyFocus,
        simplifyTrend
    };
})();
