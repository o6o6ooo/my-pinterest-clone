const mockUser = window.__TEST_USER__ || null;

window.firebase = {
    auth: () => ({
        currentUser: mockUser,
        onAuthStateChanged: (callback) => {
            callback(mockUser);
            return () => { };
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
        signOut: () => Promise.resolve()
    }),
    firestore: () => ({
        collection: () => ({
            doc: () => ({
                get: () => Promise.resolve({ exists: true, data: () => ({}) }),
                set: () => Promise.resolve()
            })
        })
    })
};