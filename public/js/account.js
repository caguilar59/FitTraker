const accountMessage = document.getElementById("accountMessage");
const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");

const profileButton = profileForm.querySelector('button[type="submit"]');
const passwordButton = passwordForm.querySelector('button[type="submit"]');

let busy = false;
let ready = false;

function updateButtons() {
    profileButton.disabled = busy || !ready;
    passwordButton.disabled = busy || !ready;
}

function showMessage(message, success = false) {
    accountMessage.textContent = message;
    accountMessage.className = success ? "text-success" : "text-danger";
}

async function requestAccount(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        cache: "no-store"
    });

    if (response.status === 401) {
        ready = false;
        updateButtons();
        window.location.replace("/welcome-page/login.html");
        throw new Error("Please log in again");
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

async function loadAccount() {
    updateButtons();

    try {
        const { user } = await requestAccount("/api/auth/me");

        document.getElementById("name").value = user.name;
        document.getElementById("email").value = user.email;

        ready = true;
    } catch (error) {
        showMessage(error.message || "Unable to load your account");
    } finally {
        updateButtons();
    }
}

profileForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (busy || !ready) return;

    busy = true;
    updateButtons();
    showMessage("");

    try {
        const data = await requestAccount("/api/auth/profile", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: document.getElementById("name").value,
                email: document.getElementById("email").value
            })
        });

        document.getElementById("name").value = data.user.name;
        document.getElementById("email").value = data.user.email;

        showMessage(data.message, true);
    } catch (error) {
        showMessage(error.message || "Unable to save your profile");
    } finally {
        busy = false;
        updateButtons();
    }
});

passwordForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (busy || !ready) return;

    const currentPassword =
        document.getElementById("currentPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        showMessage("New passwords do not match");
        return;
    }

    if (
        newPassword.length < 12 ||
        new TextEncoder().encode(newPassword).length > 72
    ) {
        showMessage("Use at least 12 characters and no more than 72 bytes");
        return;
    }

    busy = true;
    updateButtons();
    showMessage("");

    try {
        const data = await requestAccount("/api/auth/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword
            })
        });

        ready = false;
        passwordForm.reset();
        showMessage(data.message, true);

        setTimeout(() => {
            window.location.replace("/welcome-page/login.html");
        }, 1500);
    } catch (error) {
        showMessage(error.message || "Unable to change your password");
    } finally {
        busy = false;
        updateButtons();
    }
});

loadAccount();