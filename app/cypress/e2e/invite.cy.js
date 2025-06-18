describe('Invitation Code Authentication', () => {
  beforeEach(() => {
    cy.viewport(430, 932);
    cy.clearLocalStorage();
  });

  context('Successful invitation code authentication', () => {
    it('Navigates to sign-in screen after entering the correct invitation code', () => {
      // Given: 初めてアプリを開いた
      cy.visit('/invite');

      // When: 正しい招待コードを入力して送信する
      cy.get('[data-testid="invitation-code-screen"]').should('be.visible');
      cy.get('input[type="text"]').type('Helsinki');
      cy.get('button[type="submit"]').click();

      // Then: サインイン（またはサインアップ）画面に遷移する
      cy.url().should('include', '/auth');
      cy.get('[data-testid="auth-screen"]').should('be.visible');
    });
  });

  context('Failed invitation code authentication', () => {
    it('Displays an error message when entering an incorrect invitation code', () => {
      // Given: 初めてアプリを開いた
      cy.visit('/invite');

      // When: 間違った招待コードを入力して送信する
      cy.get('[data-testid="invitation-code-screen"]').should('be.visible');
      cy.get('input[type="text"]').type('WrongCode');
      cy.get('button[type="submit"]').click();

      // Then: 画面にとどまりエラーメッセージが表示される
      cy.get('[data-testid="invitation-code-screen"]').should('be.visible');
      cy.get('p.text-red-600').should('contain', 'The invitation code is incorrect.');
    });
  });
});