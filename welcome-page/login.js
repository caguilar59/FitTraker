const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const loginData = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    message.textContent = data.message;

    if (response.ok) {
      setTimeout(() => {
        window.location.href = "/public/index.html";
      }, 1000);
    }

  } catch (error) {
    console.error(error);
    message.textContent = "Unable to login";
  }
});