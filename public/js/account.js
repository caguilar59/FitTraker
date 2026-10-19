const accountMessage = document.getElementById("accountMessage");

async function loadAccount() {
  try {
    const response = await fetch("/api/auth/me", {
      cache: "no-store"
    });

    if (response.status === 401) {
      window.location.replace("/welcome-page/login.html");
      return;
    }

    if (!response.ok) {
      throw new Error("Unable to load account");
    }

    const { user } = await response.json();

    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;
  } catch (error) {
    accountMessage.textContent =
      "Unable to load your account. Please refresh and try again.";
    accountMessage.className = "text-danger";
  }
}

loadAccount();