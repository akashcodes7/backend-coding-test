const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const swaggerUi = require('swagger-ui-express');
const reqStats = require("./log/requestLogger");

const app = express();
const port = 8010;

const jsonParser = bodyParser.json();
app.use(jsonParser);

const db = new sqlite3.Database(':memory:');

// Import Schemas
const buildSchemas = require('./src/schemas');
const swaggerSpec = require('./swagger');
const appModule = require('./src/app')(db);
app.use(reqStats());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/logs/:date?", (req, res) => {
  // Today's  Date of Server based on location of server
  const date = new Date();
  // Convert to IST date
  const intlDateObj = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const istTime = intlDateObj.format(date);
  // Eg. output : Fri Jul 23 2021 23:41:50 GMT-0800 (Alaska Daylight Time)
  // now try to format the converted date
  const newDate = new Date(istTime);
  const year = newDate.getFullYear();
  const month = newDate.getMonth() + 1;
  const day = newDate.getDate();
  if (month.toString().length < 2) month = "0" + month;
  if (day.toString().length < 2) day = "0" + day;
  const today = year + "-" + month + "-" + day;
  const filePath = req.params.date !== undefined ? path.join(process.cwd(), `logs/app-${req.params.date}.log`) : path.join(process.cwd(), `logs/app-${today}.log`);
  if (fs.existsSync(filePath)) {
    // handle if requested for downalod log.
    const { d } = req.query;
    if (d !== undefined && d === "true") {
      const data = fs.readFileSync(filePath);
      return res.send(data);
    }
    res.sendFile(filePath, function (err) {
      if (err) {
        res.send("Invalid log file. Or No logs found.");
      }
    });
    return;
  }
  return res.send("No logs found.");
});

// Initialize and start the server
db.serialize(() => {
  buildSchemas(db);
  app.use('/', appModule);

  app.listen(port, () => console.log(`App started and listening on port ${port}`));
});
