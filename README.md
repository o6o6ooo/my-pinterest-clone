
# 🌲 my-pinterest-clone app "Kuusi"
A littele Pinterest-look Progressive Web App built with React.

## 📸 Features
- sharing photos with your family, friends
- browser photos in Pinterest look homefeed

## 🏡 License
This project is currently for private use only and is not licensed for public use, modification, or redistribution.

## 🔐 Privacy & Security of Uploaded Photos
🇬🇧 All backend API endpoints require a valid Firebase ID token, and Firestore rules restrict access to authenticated users only.
This ensures that:
- Uploaded images cannot be accessed publicly.
- Only signed-in users can upload or view photos
- All Firestore data is protected from unauthorized access
- Cloudinary image URLs are only generated after login and expire after 1 hour

🇯🇵 本アプリでは、GoogleまたはAppleアカウントを使ったFirebase Authenticationによるユーザー認証を導入しています。
サーバーAPIではすべてのリクエストに対して Firebase IDトークンの検証を行い、Firestoreのアクセスも 認証済みユーザーのみに制限しています：
- 写真は一般公開されません
- 写真のアップロード・閲覧は ログイン中のユーザーのみ可能
- Firestore のすべてのデータは 未認証ユーザーから保護
- Cloudinaryの写真URLは ログイン後にのみ発行され、1時間で無効