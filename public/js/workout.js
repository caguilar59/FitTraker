// Display today's saved workout
function displayTodaysWorkout() {
    const todayWorkout = document.getElementById('todayWorkout');

    // Get today's date in YYYY-MM-DD format
    const today = [
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, '0'),
        String(new Date().getDate()).padStart(2, '0')
    ].join('-');

    // Load saved programs
    const programs = JSON.parse(
        localStorage.getItem('programs')
    ) || [];

    // Find today's program
    const todaysProgram = programs.find(program => {
        return program.date === today;
    });

    // Show a message if no workout is scheduled
    if (!todaysProgram) {
        todayWorkout.innerHTML = `
            <p class="text-muted">
                No workout scheduled for today.
            </p>
        `;
        return;
    }

    // Display today's workout
    todayWorkout.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-body">

                <h3 class="card-title">
                    ${escapeHTML(todaysProgram.category)} Day
                </h3>

                <p class="text-muted">
                    ${escapeHTML(todaysProgram.date)}
                </p>

                <div id="todaysSupersets"></div>

            </div>
        </div>
    `;

    // Create the superset blocks
    const supersetsContainer =
        document.getElementById('todaysSupersets');

    for (let i = 0; i < todaysProgram.supersetCount; i++) {
        supersetsContainer.innerHTML += `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">
                        Superset ${i + 1}
                    </h5>

                    <p class="text-muted mb-0">
                        No exercises added yet.
                    </p>
                </div>
            </div>
        `;
    }
}

// Escape text before displaying it in HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

// Run when the page loads
displayTodaysWorkout();