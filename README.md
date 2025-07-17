
# 🌲 my-pinterest-clone app "Kuusi"
A little Pinterest-look Progressive Web App built with React.

## 📸 Features
- sharing photos with your family, friends
- browser photos in Pinterest look homefeed

## 🏡 License
This project is currently for private use only and is not licensed for public use, modification, or redistribution.

## 🔐 Privacy & Security
🇬🇧 All backend API endpoints require a valid Firebase ID token, and Firestore rules restrict access to authenticated users only.
This ensures that:
- Uploaded images cannot be accessed publicly.
- Only signed-in users can upload or view photos
- All Firestore data is protected from unauthorized access
- Cloudinary image URLs are only generated after login and expire after 1 hour

🇯🇵 このアプリでは、Firebase Authenticationによるユーザー認証を導入しています。
サーバーAPIではすべてのリクエストに対して Firebase IDトークンの検証を行い、Firestoreのアクセスも 認証済みユーザーのみに制限しています：
- 写真は一般公開されません
- 写真のアップロード・閲覧は ログイン中のユーザーのみ可能
- Firestore のすべてのデータは 未認証ユーザーから保護
- Cloudinaryの写真URLはログイン後にのみ発行され、1時間で無効

## 🎶 Updates
### 10 June 2025
- enabled private uploading

### 11 June 2025
- fixed photo preview
- enabled automatic sign out 3 mins after closing app
- improved upload overlay
- added an overlay showing group members
- added an overlay for privacy and security

### 13 June 2025
- added who posted on photo preview
- added animation
- added loading in home feed

### 15 June 2025
- added slide overs in user dashboard

### 18 June 2025
- enabled to upload multiple photos
- enabled to upload .heic photos
- enabled to compress photos up to 1MB

### 16 July 2025
- added "Brouwse by year" tab, you can now filter photos by year
- changed year to be required, you have to put year when posting