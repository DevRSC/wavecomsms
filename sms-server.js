require("dotenv").config();
const express = require("express");
const { SerialPort } = require("serialport");
const bodyParser = require("body-parser");

const config = {
  port: process.env.PORT || 3000,
  serialPortPath: process.env.SERIAL_PORT_PATH,
  allowedIPs: process.env.ALLOWED_IPS.split(","),
  baudRate: 115200,
};

const app = express();
const port = config.port;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const serialPort = new SerialPort({
  path: config.serialPortPath,
  baudRate: config.baudRate,
});

app.get("/sendmessage", checkAllowedIP, async (req, res) => {
  const number = req.query.number;
  const text = req.query.text;

  try {
    await sendSMS(serialPort, number, text);
    res
      .status(200)
      .json({ status: "success", text: "message sent successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", text: "Failed to send text" });
  }
});

// Send SMS using AT commands
function sendSMS(port, number, text) {
  return new Promise((resolve, reject) => {
    port.write(`AT+CMGF=1\r`, () => {
      port.write(`AT+CMGS="${number}"\r`, () => {
        port.write(text + "\x1A", (err) => {
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

// Middleware to check if the client IP address is allowed
function checkAllowedIP(req, res, next) {
  let clientIP = req.connection.remoteAddress;
  const allowedIPs = config.allowedIPs;

  // Convert IPv6 format to IPv4 if applicable
  if (clientIP.startsWith("::ffff:")) {
    clientIP = clientIP.slice(7);
  }

  console.log("Client IP address:", clientIP); // Log the client IP address

  if (allowedIPs.includes(clientIP)) {
    next(); // Proceed to the next middleware or route handler
  } else {
    res
      .status(403)
      .send("Forbidden: Access restricted to the specified IP addresses");
  }
}

app.listen(port, () => {
  console.log(`SMS API is running on port ${port}`);
});
