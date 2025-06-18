describe('Splash Screen and Initial Navigation', () => {
  beforeEach(() => {
    cy.viewport(430, 932);
    cy.clearLocalStorage();

    cy.window().then((win) => {
      // Firebaseのモック
      const mockFirebase = {
        auth: () => ({
          currentUser: null,
          onAuthStateChanged: (callback) => {
            // 初期状態では未認証
            callback(null);
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
      win.firebase = mockFirebase;
    });
  });

  context('Display invitation page when accessing for the first time ', () => {
    it('Display splash, goes to invitation page, put correct code and then goes to sign in/up.', () => {
      // Given: まだアプリを使ったことがない（localStorageが空の状態）
      cy.clearLocalStorage();

      // When: アプリを開く
      cy.visit('/');

      // Then: スプラッシュ画面が表示される
      cy.get('[data-testid="splash-screen"]').should('be.visible');

      // 2秒後に招待コード画面に遷移することを確認
      cy.wait(2000);
      cy.url().should('include', '/invite');
      cy.get('[data-testid="invitation-code-screen"]').should('be.visible');

      // 正しい招待コードを入力
      cy.get('input[type="text"]').type('Helsinki');
      cy.get('button').contains('Verify').click();

      // サインイン/サインアップ画面に遷移することを確認
      cy.url().should('include', '/auth');
      cy.get('[data-testid="auth-screen"]').should('be.visible');
    });
  });

  context('Display sign in/up when verified invitation and signed out', () => {
    it('Display splash and then goes to sign in/up', () => {
      // Given: 招待コード認証は済んでいるがサインアウトしている
      cy.window().then((win) => {
        win.localStorage.setItem('invitationVerified', 'true');
      });

      // When: アプリを開く
      cy.visit('/');

      // Then: スプラッシュ画面が表示される
      cy.get('[data-testid="splash-screen"]').should('be.visible');

      // 2秒後にサインイン画面に遷移することを確認
      cy.wait(2000);
      cy.url().should('include', '/auth');
      cy.get('[data-testid="auth-screen"]').should('be.visible');
    });
  });
});