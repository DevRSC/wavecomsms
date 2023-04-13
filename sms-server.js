const express = require("express");
const { SerialPort } = require("serialport");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const serialPort = new SerialPort({
  path: "COM3",
  baudRate: 115200,
});

app.get("/send-sms", async (req, res) => {
  const phoneNumber = req.query.phoneNumber;
  const message = req.query.message;

  try {
    await sendSMS(serialPort, phoneNumber, message);
    res
      .status(200)
      .json({ status: "success", message: "Message sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to send message" });
  }
});

function sendSMS(port, phoneNumber, message) {
  return new Promise((resolve, reject) => {
    port.write(`AT+CMGF=1\r`, () => {
      port.write(`AT+CMGS="${phoneNumber}"\r`, () => {
        port.write(message + "\x1A", (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  });
}

app.listen(port, () => {
  console.log(`SMS API is running on port ${port}`);
});
