
const showProgramForm = document.getElementById('showProgramForm');
const programForm = document.getElementById('programForm');
const createProgramForm = document.getElementById('createProgramForm');
const cancelProgram = document.getElementById('cancelProgram');
const programList = document.getElementById('programList');

// Load saved programs from the browser
let programs = JSON.parse(localStorage.getItem('programs')) || [];

// Show the create program form
showProgramForm.addEventListener('click', () => {
    programForm.hidden = false;
});

// Hide the form when Cancel is clicked
cancelProgram.addEventListener('click', () => {
    programForm.hidden = true;
    createProgramForm.reset();
});

// Display saved programs
function displayPrograms() {
    programList.innerHTML = '';

    // Show a message if no programs exist
    if (programs.length === 0) {
        programList.innerHTML = `
            <div class="col-12">
                <p class="text-muted">
                    You haven't created any programs yet.
                </p>
            </div>
        `;
        return;
    }

    // Create a card for each program
    programs.forEach((program, index) => {
        programList.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">

                        <h5 class="card-title">
                            ${escapeHTML(program.category)} Day
                        </h5>

                        <p class="card-text">
                            Date: ${escapeHTML(program.date)}
                        </p>

                        <p class="card-text">
                            Supersets: ${program.supersetCount}
                        </p>

                        <button
                            class="btn btn-outline-danger btn-sm"
                            data-delete-index="${index}">

                            <i class="bi bi-trash"></i> Delete
                        </button>

                    </div>
                </div>
            </div>
        `;
    });
}

// Escape user-entered text before displaying it as HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

// Handle the workout setup form
createProgramForm.addEventListener('submit', event => {
    event.preventDefault();

    // Get the values from the form
    const date = document.getElementById('programDate').value;
    const category = document.getElementById('programCategory').value;
    const supersetCount = Number(
        document.getElementById('supersetCount').value
    );

    // Validate the form
    if (
        !date ||
        !category ||
        !Number.isInteger(supersetCount) ||
        supersetCount < 0 ||
        supersetCount > 20
    ) {
        return;
    }

    // Create a new workout program
    const workoutSetup = {
        id: Date.now().toString(),
        date: date,
        category: category,
        supersetCount: supersetCount
    };

    // Add the program to the array
    programs.push(workoutSetup);

    // Save programs in browser storage
    localStorage.setItem('programs', JSON.stringify(programs));

    // Display the saved program in the console
    console.log('Workout setup:', workoutSetup);

    // Reset and hide the form
    createProgramForm.reset();
    programForm.hidden = true;

    // Refresh the program list
    displayPrograms();
});

// Handle program deletion
programList.addEventListener('click', event => {
    const deleteButton = event.target.closest('[data-delete-index]');

    if (deleteButton) {
        const index = Number(deleteButton.dataset.deleteIndex);

        // Remove the selected program
        programs.splice(index, 1);

        // Update browser storage
        localStorage.setItem('programs', JSON.stringify(programs));

        // Refresh the list
        displayPrograms();
    }
});

// Display saved programs when the page loads
displayPrograms();
