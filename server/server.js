import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload'; // ファイル受け取り用
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary'; 
import admin from 'firebase-admin';
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

const serviceAccount = JSON.parse(
    fs.readFileSync('./kuusi-f06ab-firebase-adminsdk-fbsvc-c6e372e5cc.json', 'utf8')
  );

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Cloudinary設定
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// テストルート
app.get('/', (req, res) => {
    res.send('Hello from Server!');
});

// 画像アップロードエンドポイント
app.post('/api/upload', async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (!idToken) {
            return res.status(401).json({ error: 'Missing ID token' });
        }

        // Firebaseトークン検証
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log('Verified Firebase UID:', uid);

        const file = req.files.image;
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'my-pinterest-clone'
        });

        res.json({ url: result.secure_url });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// サーバー起動
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});