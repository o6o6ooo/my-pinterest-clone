Cypress.on('window:before:load', (win) => {
    // モックの現在のユーザー（テストで差し替え可能）
    const mockUser = win.__TEST_USER__ || null;

    // モックの auth インスタンス（引数は無視してOK）
    const mockAuth = {};

    // Firebase Authのモック
    const authMock = {
        currentUser: mockUser,
        onAuthStateChanged: (callback) => {
            callback(mockUser);
            return () => { };
        },
        signInWithEmailAndPassword: (auth, email, password) => {
            console.log('✅ signInWithEmailAndPassword called:', email, password);
            return Promise.resolve({
                user: {
                    uid: 'test-uid',
                    email,
                    displayName: 'Test User',
                    emailVerified: mockUser?.emailVerified || false,
                },
            });
        },
        createUserWithEmailAndPassword: (auth, email, password) => {
            console.log('✅ createUserWithEmailAndPassword called:', email, password);
            return Promise.resolve({
                user: {
                    uid: 'test-uid',
                    email,
                    displayName: 'Test User',
                    emailVerified: false,
                    sendEmailVerification: () => Promise.resolve(),
                },
            });
        },
        signOut: () => Promise.resolve(),
    };

    // Firebase Firestoreの簡単なモック
    const firestoreMock = {
        collection: () => ({
            doc: () => ({
                get: () => Promise.resolve({ exists: true, data: () => ({}) }),
                set: () => Promise.resolve(),
            }),
        }),
    };

    // グローバルwindow.firebaseにモックをセット
    win.firebase = {
        auth: () => authMock,
        firestore: () => firestoreMock,
    };
});