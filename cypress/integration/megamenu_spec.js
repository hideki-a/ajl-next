describe('MegaMenu', () => {
    let menuSelector = '.globalNav__item:nth-child(2) > a';
    let subMenuSelector = '.globalNav__item:nth-child(2) > .globalNav__childContainer';

    describe('初期化後の状態', () => {
        before(() => {
            cy.visit('http://localhost:3000/static/megamenu.html');
        })

        it('メニュー項目にaria-haspopup属性が指定されていること', () => {
            cy.get(menuSelector).should('have.attr', 'aria-haspopup', 'true');
        });

        it('メニュー項目にaria-controls属性が指定されていること', () => {
            cy.get(menuSelector).should('have.attr', 'aria-controls', 'menu_company');
        });

        it('メニュー項目にaria-expanded属性が指定されていること', () => {
            cy.get(menuSelector).should('have.attr', 'aria-expanded', 'false');
        });

        it('サブメニューにaria-hidden属性が指定されていること', () => {
            cy.get(subMenuSelector).should('have.attr', 'aria-hidden', 'true');
        });
    });

    describe('フォーカスして開いた状態', () => {
        before(() => {
            cy.visit('http://localhost:3000/static/megamenu.html')
                .get(menuSelector)
                .trigger('click');
        });

        it('メニュー項目のaria-expanded属性がtrueになっていること', () => {
            cy.get(menuSelector).should('have.attr', 'aria-expanded', 'true');
        });

        it('サブメニューのhidden属性が削除されていること', () => {
            cy.get(menuSelector).should('not.have.attr', 'hidden');
        });
    });
});
