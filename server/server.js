import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload'; // ファイル受け取り用
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Cloudinary設定
cloudinary.v2.config({
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
        const file = req.files.image;
        console.log('Received file:', file);
        console.log('Temp file path:', file.tempFilePath);
        console.log('My API key:', process.env.CLOUDINARY_API_KEY) 
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: 'my-pinterest-clone'
        });

        console.log('Upload result:', result);

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// サーバー起動
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});