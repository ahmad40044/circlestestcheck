const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware to parse JSON data
app.use(cors());

const db = new sqlite3.Database('circle_clicker.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS points (id INTEGER PRIMARY KEY AUTOINCREMENT, points INTEGER)");
});

// Endpoint to store points in the database
app.post('/storePoints/:points', (req, res) => {
  const points = req.params.points;

  db.run('INSERT INTO points (points) VALUES (?)', [points], function(err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send('Points stored successfully!');
    }
  });
});

// Endpoint to fetch all stored points from the database
app.get('/getPoints', (req, res) => {
  db.all('SELECT * FROM points', [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).json(rows);
    }
  });
});

// Endpoint to reset the database
app.post('/resetDatabase', (req, res) => {
  db.run('DELETE FROM points', function(err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send('Database reset successful!');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
