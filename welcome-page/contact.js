const form = document.querySelector("form");
const messageText = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("supportMessage").value;

  try {
    const response = await fetch("/api/support", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message
      })
    });

    const data = await response.json();

    if (response.ok) {
      messageText.textContent = data.message;
      form.reset();
    } else {
      messageText.textContent = data.message;
    }

  } catch (error) {
    console.error(error);
    messageText.textContent = "Unable to send message";
  }
});
