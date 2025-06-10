import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
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

// Firebase Admin 初期化
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Cloudinary 設定
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// テストルート
app.get('/', (req, res) => {
    res.send('Hello from Server!');
});

// Firebase トークン検証ヘルパー
const verifyFirebaseToken = async (req) => {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!idToken) throw new Error('Missing ID token');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken.uid;
};

// アップロードエンドポイント
app.post('/api/cloudinary-signed-urls', async (req, res) => {
    try {
        const uid = await verifyFirebaseToken(req);
        const { publicIds } = req.body; // publicIds: string[]

        if (!Array.isArray(publicIds) || publicIds.length === 0) {
            return res.status(400).json({ error: 'No publicIds provided' });
        }

        const result = {};
        for (const publicId of publicIds) {
            result[publicId] = cloudinary.url(publicId, {
                type: 'authenticated',
                secure: true,
                sign_url: true,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Signed URLs error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/upload', async (req, res) => {
    try {
        const uid = await verifyFirebaseToken(req);

        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const file = req.files.image;

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'my-pinterest-clone',
            type: 'authenticated', // 非公開用に必須
        });

        const signedUrl = cloudinary.url(result.public_id, {
            type: 'authenticated',
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
        });
        res.json({ public_id: result.public_id, url: signedUrl });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 画像表示用エンドポイント
app.get('/api/image/:publicId', async (req, res) => {
    try {
        const uid = await verifyFirebaseToken(req);
        const { publicId } = req.params;

        const signedUrl = cloudinary.url(publicId, {
            type: 'authenticated',
            secure: true,
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600 // 1時間有効
        });

        res.json({ url: signedUrl });
    } catch (error) {
        console.error('Signed URL error:', error);
        res.status(500).json({ error: error.message });
    }
});

// サーバー起動
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});