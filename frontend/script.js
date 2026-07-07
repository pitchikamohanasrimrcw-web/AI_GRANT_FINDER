// Point this to wherever the backend server is running.
// Local development default: http://localhost:3000
const API_BASE_URL = "http://localhost:3000";

async function showResult() {
    const queryInput = document.getElementById("query");
    const result = document.getElementById("result");
    const query = queryInput.value.trim();

    if (query === "") {
        result.innerHTML = "Please enter a startup domain.";
        return;
    }

    result.innerHTML = "AI Agent is searching funding opportunities for: <b>" + query + "</b>...";

    try {
        const response = await fetch(`${API_BASE_URL}/api/find-funding`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        // Preserve line breaks from the model's response
        const formatted = data.insights.replace(/\n/g, "<br>");

        result.innerHTML =
            "<b>Funding opportunities for " + query + ":</b><br><br>" + formatted;
    } catch (err) {
        result.innerHTML =
            "Sorry, something went wrong while fetching funding opportunities. " +
            "(" + err.message + ")";
    }
}
