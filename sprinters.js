const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const { BlobServiceClient } = require('@azure/storage-blob');

const app = express();
const port = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'sprinters',
  password: 'Ddjsddjs1!',
  database: 'Sprinters'
});

const blobServiceClient = BlobServiceClient.fromConnectionString('DefaultEndpointsProtocol=https;AccountName=sprinterappstorage;AccountKey=cMGeIF09/yxf+a0QWcK84tE2dgcwthq62O7oobeUNizu/7NqSZxgQS1w7rmm7vZSWQylzdA/qq6R+AStWjZmeQ==;EndpointSuffix=core.windows.net');

app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res, next) => {
  const file = req.file;

  if (!file) {
    const error = new Error('Please upload a file');
    error.status = 400;
    return next(error);
  }

  const containerName = 'videos';
  const blobName = Date.now() + '-' + file.originalname;
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    const uploadResult = await blockBlobClient.upload(file.buffer, file.buffer.length);
    res.send('File uploaded successfully');
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).send({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
