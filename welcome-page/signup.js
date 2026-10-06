const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value
  };

  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    message.textContent = data.message;

    if (response.ok) {
      signupForm.reset();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    }

  } catch (error) {
    console.error(error);
    message.textContent = "Unable to create account";
  }
});