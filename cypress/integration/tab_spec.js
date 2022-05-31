describe('Tab', () => {
    describe('初期化後の状態', () => {
        before(() => {
            cy.visit('http://localhost:3000/static/tab.html');
        })

        it('タブリストにrole属性が指定されていること', () => {
            cy.get('.entryListTab__tabList').should('have.attr', 'role', 'tablist');
        });

        it('タブリストの各項目にrole属性が指定されていること', () => {
            cy.get('.entryListTab__tabList button').should('have.attr', 'role', 'tab');
        });

        it('タブリストの各項目にaria-selected属性が指定されていること', () => {
            cy.get('.entryListTab__tabList button:first-child').should('have.attr', 'aria-selected', 'true');
            cy.get('.entryListTab__tabList button:not(:first-child)').should('have.attr', 'aria-selected', 'false');
        });

        it('タブリストの各項目にaria-control属性が指定されていること', () => {
            cy.document().then((doc) => {
                const tabPanels = doc.querySelectorAll('.entryListTab__tab');
                cy.get('.entryListTab__tabList button').each(($el, index) => {
                    cy.wrap($el).should('have.attr', 'aria-controls', tabPanels[index].id);
                });
            });
        });

        it('タブリストの各項目にtabindex属性が指定されていること', () => {
            cy.get('.entryListTab__tabList button:first-child').should('have.attr', 'tabindex', '0');
            cy.get('.entryListTab__tabList button:not(:first-child)').should('have.attr', 'tabindex', '-1');
        });

        it('タブパネルの各項目にrole属性が指定されていること', () => {
            cy.get('.entryListTab__tab').should('have.attr', 'role', 'tabpanel');
        });

        it('タブパネルの各項目にaria-labelledby属性が指定されていること', () => {
            cy.document().then((doc) => {
                const tabList = doc.querySelectorAll('.entryListTab__tabList button');
                cy.get('.entryListTab__tab').each(($el, index) => {
                    cy.wrap($el).should('have.attr', 'aria-labelledby', tabList[index].id);
                });
            });
        });

        it('タブパネルの各項目にaria-hidden属性が指定されていること', () => {
            cy.document().then((doc) => {
                cy.get('.entryListTab__tab').each(($el, index) => {
                    if (index) {
                        cy.wrap($el).should('have.attr', 'aria-hidden', 'true');
                    } else {
                        cy.wrap($el).should('have.attr', 'aria-hidden', 'false');
                    }
                });
            });
        });
    });

    describe('タブ「航空」を選択した時の状態', () => {
        before(() => {
            cy.visit('http://localhost:3000/static/tab.html');
            cy.get('.entryListTab__tabList button:nth-child(3)').type('{enter}');
        })

        it('タブリスト各項目のaria-selected属性が正しく設定されていること', () => {
            cy.get('.entryListTab__tabList button:nth-child(3)').should('have.attr', 'aria-selected', 'true');
            cy.get('.entryListTab__tabList button:not(:nth-child(3))').should('have.attr', 'aria-selected', 'false');
        });

        it('タブリスト各項目のtabindex属性が正しく設定されていること', () => {
            cy.get('.entryListTab__tabList button:nth-child(3)').should('have.attr', 'tabindex', '0');
            cy.get('.entryListTab__tabList button:not(:nth-child(3))').should('have.attr', 'tabindex', '-1');
        });

        it('タブパネルの各項目のaria-hidden属性が正しく設定されていること', () => {
            cy.document().then((doc) => {
                cy.get('.entryListTab__tab').each(($el, index) => {
                    if (index === 2) {
                        cy.wrap($el).should('have.attr', 'aria-hidden', 'false');
                    } else {
                        cy.wrap($el).should('have.attr', 'aria-hidden', 'true');
                    }
                });
            });
        });

        it('タブパネルにフォーカスが移動すること', () => {
            cy.get('.entryListTab__tabList button:nth-child(3)').tab().should('have.attr', 'id', 'aircraft');
        });
    });
});
