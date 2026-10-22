const showProgramForm = document.getElementById('showProgramForm');
const programForm = document.getElementById('programForm');
const createProgramForm = document.getElementById('createProgramForm');
const cancelProgram = document.getElementById('cancelProgram');
const programList = document.getElementById('programList');

// Programs belong to the signed-in account and are stored by the server.
let programs = [];
let busy = false;
const statusMessage = document.createElement('p');
statusMessage.setAttribute('role', 'status');
programList.before(statusMessage);
async function programRequest(path = '', options = {}) {
    const response = await fetch('/api/programs' + path, {
        cache: 'no-store', ...options,
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 401) {
        window.location.replace('/welcome-page/login.html');
        throw new Error('Please log in again.');
    }
    if (!response.ok) throw new Error('Unable to update programs. Please refresh and try again.');
    return response.status === 204 ? null : response.json();
}
async function loadPrograms() {
    try {
        const data = await programRequest();
        programs = data.programs;
        displayPrograms();
        statusMessage.textContent = '';

    } catch (error) { statusMessage.textContent = error.message; }
}

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
                            Supersets: ${escapeHTML(program.supersetCount)}
                        </p>

                        <div class="superset-container mt-3">
                            ${Array.from(
                                { length: program.supersetCount },
                                (_, index) => `
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <h6 class="card-title">
                                                Superset ${index + 1}
                                            </h6>

                                            <div class="exercise-list">
                                                <p class="text-muted mb-0">
                                                    No exercises added yet.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                class="btn btn-outline-primary btn-sm mt-2"
                                                data-superset-index="${index}"
                                                data-program-id="${escapeHTML(program.id)}"
                                            >
                                                <i class="bi bi-plus-lg"></i>
                                                Add Exercise
                                            </button>
                                        </div>
                                    </div>
                                `
                            ).join('')}
                        </div>

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

// Save first; only update the page after the server confirms success.
createProgramForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    const submit = createProgramForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
        const { program } = await programRequest('', {
            method: 'POST', body: JSON.stringify({
                date: document.getElementById('programDate').value,
                category: document.getElementById('programCategory').value,
                supersetCount: Number(document.getElementById('supersetCount').value)
            })
        });
        programs.push(program);
        createProgramForm.reset();
        programForm.hidden = true;
        statusMessage.textContent = 'Program saved to your account.';
        displayPrograms();
    } catch (error) { statusMessage.textContent = error.message; }
    finally { busy = false; submit.disabled = false; }
});

programList.addEventListener('click', async event => {
    const button = event.target.closest('[data-delete-index]');
    if (!button || busy) return;
    const program = programs[Number(button.dataset.deleteIndex)];
    if (!program || !window.confirm('Delete this program from your account on all devices?')) return;
    busy = true;
    button.disabled = true;
    try {
        await programRequest('/' + encodeURIComponent(program._id), { method: 'DELETE' });
        programs = programs.filter(item => item._id !== program._id);
        statusMessage.textContent = 'Program deleted.';
        displayPrograms();
    } catch (error) { statusMessage.textContent = error.message; button.disabled = false; }
    finally { busy = false; }
});
loadPrograms();
