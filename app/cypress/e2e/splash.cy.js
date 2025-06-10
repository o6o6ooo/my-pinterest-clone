describe('Splash Screen and Initial Navigation', () => {
  beforeEach(() => {
    // iPhone 15 Pro Maxのビューポート設定
    cy.viewport(430, 932);
    
    // 各テスト前にlocalStorageをクリア
    cy.clearLocalStorage();

    // Firebaseのモックを初期化
    cy.window().then((win) => {
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
      win.firebase = mockFirebase;
    });
  });

  context('初回アクセス時の招待コード画面表示', () => {
    it('スプラッシュ画面が表示された後、招待コード入力画面に遷移し、正しいコードを入力するとサインイン/サインアップ画面に遷移する', () => {
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

  context('すでに認証済みで未サインイン状態', () => {
    it('スプラッシュ画面が表示された後、サインイン画面に遷移する', () => {
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

  context('サインイン済み状態のリダイレクト', () => {
    it('スプラッシュ画面が表示された後、ホームフィードに遷移する', () => {
      // Given: ユーザーがサインイン済み
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true
      };

      // アプリを開く前に認証状態を設定
      cy.window().then((win) => {
        // localStorageの設定
        win.localStorage.setItem('user', JSON.stringify(mockUser));
        win.localStorage.setItem('invitationVerified', 'true');

        // Firebaseのモックを更新
        const authMock = {
          currentUser: mockUser,
          onAuthStateChanged: (callback) => {
            callback(mockUser);
            return () => {};
          },
          signInWithEmailAndPassword: () => Promise.resolve({ user: mockUser }),
          signOut: () => Promise.resolve()
        };

        // Firebaseのモックを完全に置き換え
        win.firebase = {
          auth: () => authMock,
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

        // グローバルなauthオブジェクトを設定
        win.auth = authMock;
      });

      // When: アプリを開く
      cy.visit('/', {
        onBeforeLoad: (win) => {
          // ページ読み込み前に認証状態を設定
          const authMock = {
            currentUser: mockUser,
            onAuthStateChanged: (callback) => {
              callback(mockUser);
              return () => {};
            },
            signInWithEmailAndPassword: () => Promise.resolve({ user: mockUser }),
            signOut: () => Promise.resolve()
          };

          win.firebase = {
            auth: () => authMock,
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

          // グローバルなauthオブジェクトを設定
          win.auth = authMock;

          // グローバルなgetAuth関数をモック
          win.getAuth = () => authMock;

          // グローバルなonAuthStateChanged関数をモック
          win.onAuthStateChanged = (callback) => {
            callback(mockUser);
            return () => {};
          };

          // グローバルなgetAuth関数をモック
          win.getAuth = () => ({
            currentUser: mockUser,
            onAuthStateChanged: (callback) => {
              callback(mockUser);
              return () => {};
            }
          });
        }
      });

      // Then: スプラッシュ画面が表示される
      cy.get('[data-testid="splash-screen"]').should('be.visible');

      // 2秒後にホームフィードに遷移することを確認
      cy.wait(2000);
      cy.url().should('include', '/home');
      cy.get('[data-testid="home-feed"]').should('be.visible');
    });
  });
}); 