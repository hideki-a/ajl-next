describe('HamburgerMenu', () => {
    describe('初期化後の状態', () => {
        before(() => {
            cy.visit('http://localhost:3000/static/hamburgermenu.html');
        })

        it('メニューボタンにaria-controls属性が指定されていること', () => {
            cy.get('#toggle_gnav').should('have.attr', 'aria-controls', 'globalnav');
        });

        it('メニューボタンにaria-expanded属性が指定されていること', () => {
            cy.get('#toggle_gnav').should('have.attr', 'aria-expanded', 'false');
        });

        it('メニューにaria-hidden属性が指定されていること', () => {
            cy.get('#globalnav').should('have.attr', 'aria-hidden', 'true');
        });
    });

    describe('クリックした時の状態', () => {
        before(() => {
            cy.visit('http://localhost:3000/static/hamburgermenu.html');
            cy.get('#toggle_gnav').click();
        })

        it('メニューボタンのaria-expanded属性が正しく設定されていること', () => {
            cy.get('#toggle_gnav').should('have.attr', 'aria-expanded', 'true');
        });

        it('メニューボタンのテキストが正しく設定されていること', () => {
            cy.get('.toggleMenu__text').should('have.text', '閉じる');
        });

        it('メニューのaria-hidden属性が正しく設定されていること', () => {
            cy.get('#globalnav').should('have.attr', 'aria-hidden', 'false');
        });

        it('メニューのhidden属性が削除されていること', () => {
            cy.get('#globalnav').should('not.have.attr', 'hidden');
        });
    });
});
