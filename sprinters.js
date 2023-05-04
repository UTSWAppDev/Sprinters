const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const port = process.env.PORT || 3000

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: '56758',
  user: 'azure',
  password: '6#vWHD_$',
  database: 'Sprinters',
});

// Create an Express app
const app = express();

app.use(express.static('public'));

// Set up Multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Define a route to handle file uploads
app.post('/upload', upload.single('file'), (req, res, next) => {
  const file = req.file;

  if (!file) {
    const error = new Error('Please upload a file');
    error.status = 400;
    return next(error);
  }

  // Insert file details into the database
  const sql = 'INSERT INTO VIDEOS (name, location) VALUES (?, ?)';
  const values = [file.originalname, file.path];

  pool.query(sql, values, (err, result) => {
    if (err) {
      return next(err);
    }

    res.send('File uploaded successfully');
  });
});


// define a route for GET request at /listpics
app.get('/listpics', (req, res) => {
  // execute the SQL query
  pool.query('SELECT * FROM VIDEOS', (err, rows) => {
    if (err) throw err;

    // create an HTML table with the video names and links
    const tableRows = rows.map(row => {
      return `<tr><td>${row.originalname}</td><td><a href="${row.path}">Watch video</a></td></tr>`;
    }).join('');

    // return an HTML page with the table
    const html = `
      <html>
        <head>
          <title>List of Videos</title>
        </head>
        <body>
          <h1>List of Videos</h1>
          <table>
            <thead>
              <tr>
                <th>Video Name</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    res.send(html);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
