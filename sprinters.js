const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');

// Create an Express app
const app = express();

// Set up Multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString('DefaultEndpointsProtocol=https;AccountName=sprinterappstorage;AccountKey=cMGeIF09/yxf+a0QWcK84tE2dgcwthq62O7oobeUNizu/7NqSZxgQS1w7rmm7vZSWQylzdA/qq6R+AStWjZmeQ==;EndpointSuffix=core.windows.net');

// Define a route to handle file uploads
app.post('/upload', upload.single('file'), async (req, res, next) => {
  const file = req.file;

  if (!file) {
    const error = new Error('Please upload a file');
    error.status = 400;
    return next(error);
  }

  // Upload the file to Blob Storage
  const containerName = 'videos';
  const blobName = Date.now() + '-' + file.originalname;
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const uploadResult = await blockBlobClient.upload(file.buffer, file.buffer.length);

  // Send response
  res.send('File uploaded successfully');
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
