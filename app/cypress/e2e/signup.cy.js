describe('Signup flow', () => {

    // Test 1 - 招待コード認証済みのユーザーがサインアップ後にメール認証画面に遷移することを確認
    it('Navigates to verify email screen after signup', () => {

        // Given: アプリを開いてサインアップに遷移するのを待つ
        cy.visit('/', {
            onBeforeLoad(win) {
                win.localStorage.setItem('invitationVerified', 'true');
                win.__TEST_USER__ = null;
            }
        });
        cy.wait(3000);
        cy.get('button').contains('Sign Up').click();
        cy.get('[data-testid="auth-screen"]').should('exist');

        // When: メールとパスワードを入力してサインアップボタンを押す
        cy.get('input[id="name"]').type('Test User');
        cy.get('input[id="email"]').type('test@example.com');
        cy.get('input[id="password"]').type('password123');
        cy.get('input[id="confirmPassword"]').type('password123');
        cy.get('button[type="submit"]').click();

        // Then: メール認証画面に遷移する
        cy.url().should('include', '/verify-email');
        cy.get('[data-testid="verify-email"]').should('exist');
    });

    // Test 2 - 招待コード認証済み、かつメール認証済みのユーザーがサインイン後にホームフィードに遷移することを確認
    it('Navigates to home feed after successful email verification', () => {
        // Given: 招待コード認証済み、かつメール認証済みのユーザーがいる
        cy.visit('/', {
            onBeforeLoad(win) {
                win.localStorage.setItem('invitationVerified', 'true');
                win.__TEST_USER__ = {
                    uid: 'test-uid',
                    email: 'test@example.com',
                    emailVerified: true,
                };
            }
        });

        // When: アプリを開いてサインインに遷移するのを待つ、正しいメールとパスワードを入力してサインインする
        cy.wait(3000);
        cy.get('[data-testid="auth-screen"]').should('exist');
        cy.get('input[id="email"]').type('test@example.com');
        cy.get('input[id="password"]').type('password123');
        cy.get('button[type="submit"]').click();

        // Then: ホームフィード画面に遷移している
        cy.url().should('include', '/homefeed');
        cy.get('[data-testid="homefeed"]').should('exist');
    });

    // Test 3 - 招待コード認証済み、かつメール認証していないユーザーがサインイン後にメール認証画面に遷移することを確認
    it('Prevents sign-in without email verification and shows error', () => {
        // Given: 招待コード認証済み、かつメール認証していないユーザーがいる
        cy.visit('/', {
            onBeforeLoad(win) {
                win.localStorage.setItem('invitationVerified', 'true');
                win.__TEST_USER__ = {
                    uid: 'test-uid',
                    email: 'test@example.com',
                    emailVerified: false,
                };
            }
        });

        // When: アプリを開いてサインインに遷移するのを待つ、正しいメールとパスワードを入力してサインインする
        cy.wait(3000);
        cy.get('[data-testid="auth-screen"]').should('exist');
        cy.get('input[id="email"]').type('test@example.com');
        cy.get('input[id="password"]').type('password123');
        cy.get('button[type="submit"]').click();

        // Then: メール認証ページに遷移する
        cy.url().should('include', '/verify-email');
        cy.get('[data-testid="verify-email"]').should('exist');
    });
});