const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const app = express();

const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();

app.use(cors({
    origin: 'http://localhost:3000'
}));

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Connect to bucket
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
});

const storage = multer.memoryStorage(); // Store files in memory temporarily
const upload = multer({ storage: storage });

// Connect mongodb
const mongodbURI = process.env.MONGODB_URI;
const client = new MongoClient(mongodbURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
});

async function connectMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        await client.db(process.env.DB_NAME).command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

connectMongoDB();

app.post('/api/audio', upload.single('audioFile'), async (req, res) => {
    const file = req.file;
    const contentType = req.body.contentType;
    const songTitle = req.body.songTitle;
    const artist = req.body.artist;

    // Build externalLinks object
    const externalLinks = {
        spotify: req.body.spotifyLink || "",
        tiktok: req.body.tiktokLink || "",
        youtube: req.body.youtubeLink || "",
    };

    if (!file) {
        return res.status(400).send("No file uploaded.");
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const uploadParams = {
        Bucket: bucketName,
        Key: fileName, // File name in S3
        Body: file.buffer, // The file data
        ContentType: file.mimetype // Set content type based on file
    };

    try {
        const command = new PutObjectCommand(uploadParams);
        const response = await s3.send(command);
        console.log("Audio file uploaded successfully", response);
        res.status(200).send("File uploaded successfully.");

        // Upload file data to mongodb metadata collection
        await connectMongoDB();
        const db = client.db(process.env.DB_NAME);
        const collection = db.collection("songs");
        return collection.insertOne({
            name: fileName,
            songTitle: songTitle,
            artist: artist,
            contentType: contentType,
            externalLinks: externalLinks,
            uploadedAt: Date.now(),
        });

    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).send("Error uploading file.");
    }
});

app.get('/api/audio', async(req, res) => {
    await connectMongoDB();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("songs");
    const audioFiles = await collection.find().sort({ uploadedAt: 1 }).toArray();

    for (const audioFile of audioFiles) {
        const getObjectParams = {
            Bucket: bucketName,
            Key: audioFile.name,
        }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        audioFile.url = url;

        console.log(audioFile);
    }

    res.send(audioFiles);
});

app.get('/', (req, res) => {
    res.send('Hello World');
});
