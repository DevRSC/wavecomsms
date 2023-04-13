const express = require("express");
const { SerialPort } = require("serialport");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

const serialPort = new SerialPort({
  path: "COM3",
  baudRate: 115200,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/send-sms", async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const message = req.body.message;

  try {
    await sendSMS(serialPort, phoneNumber, message);
    res.status(200).send("Message sent successfully");
  } catch (error) {
    res.status(500).send("Failed to send message");
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
  console.log(`Server is running on port ${port}`);
});
