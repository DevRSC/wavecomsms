document.getElementById("sms-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const phoneNumber = document.getElementById("phoneNumber").value;
  const message = document.getElementById("smsMessage").value;

  try {
    const response = await fetch("/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber, message }),
    });

    if (response.ok) {
      alert("SMS sent successfully!");

      document.getElementById("phoneNumber").value = "";
      document.getElementById("smsMessage").value = "";
    } else {
      alert("Failed to send SMS.");
    }
  } catch (error) {
    alert("Failed to send SMS.");
  }
});
