// Firebaseのモック
const mockFirebase = {
  auth: () => ({
    currentUser: null,
    onAuthStateChanged: (callback) => {
      // 初期状態では未認証
      callback(null);
      return () => {}; // クリーンアップ関数
    },
    signInWithEmailAndPassword: (email, password) => {
      return Promise.resolve({
        user: {
          uid: 'test-uid',
          email: email,
          displayName: 'Test User'
        }
      });
    },
    signOut: () => {
      return Promise.resolve();
    }
  }),
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({
          exists: true,
          data: () => ({})
        }),
        set: () => Promise.resolve()
      })
    })
  })
};

// グローバルオブジェクトにFirebaseモックを追加
window.firebase = mockFirebase; 