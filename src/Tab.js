export default class Tab {
    constructor(options) {
        /* eslint-disable no-multi-spaces,key-spacing */
        this.defaults = {
            rootSelector:           '.tab',
            tabEnabledClassName:    '.tab-enabled',
            tabListClassName:       '.tablist',
            tabPanelsRootClassName: '.tabs',
            tabListButtonsCollector(parent) {
                return parent.getElementsByTagName('button');
            },
        };
        /* eslint-enable no-multi-spaces,key-spacing */
        this.settings = Object.assign(this.defaults, options);

        this.elem = document.querySelector(this.settings.rootSelector);
        this.tabPanelsRoot = null;
        this.tabPanels = null;
        this.tabListRoot = null;
        this.tabListItem = null;
        this.tabList = null;
        this.tabPanelsIds = [];
        this.activeTabNumber = null;
        this.nTabPanels = null;
        this.methodStack = {};
    }

    _getTabIndex(tabId) {
        for (let i = 0; i < this.nTabPanels; i += 1) {
            if (this.tabPanels[i].id === tabId) {
                return i;
            }
        }

        return null;
    }

    hide(tabNumber) {
        this.tabPanels[tabNumber].setAttribute('tabindex', -1);
        this.tabPanels[tabNumber].setAttribute('aria-hidden', 'true');
        this.tabList[tabNumber].setAttribute('tabindex', -1);
        this.tabList[tabNumber].setAttribute('aria-selected', 'false');
    }

    active(tab) {
        let tabNumber;

        if (this.activeTabNumber !== null) {
            this.hide(this.activeTabNumber);
        }

        if (typeof (tab) !== 'number') {
            tabNumber = this._getTabIndex(tab.replace('#', ''));
        } else {
            tabNumber = tab;
        }

        this.tabPanels[tabNumber].setAttribute('tabindex', 0);
        this.tabPanels[tabNumber].setAttribute('aria-hidden', 'false');
        this.tabList[tabNumber].setAttribute('tabindex', 0);
        this.tabList[tabNumber].setAttribute('aria-selected', 'true');
        this.activeTabNumber = tabNumber;

        if (this.elem.id) {
            const hash = typeof (tab) === 'number' ? `#${this.tabPanels[tabNumber].id}` : tab;
            window.sessionStorage.setItem(
                `ajlnext_tab_${this.elem.id}_active_tab`,
                hash,
            );
        }
    }

    activeHandler(e) {
        const targetId = e.target.getAttribute('aria-controls');

        e.preventDefault();
        this.active(targetId);
    }

    keydownHandler(e) {
        let tabNumber = null;

        /* eslint-disable default-case, indent */
        switch (e.keyCode) {
            case 37:
            case 38:
                // Left, Up
                e.preventDefault();

                if (this.activeTabNumber - 1 > -1) {
                    tabNumber = this.activeTabNumber - 1;
                } else {
                    tabNumber = this.nTabPanels - 1;
                }

                break;

            case 39:
            case 40:
                // Right, Down
                e.preventDefault();

                if (this.activeTabNumber + 1 < this.nTabPanels) {
                    tabNumber = this.activeTabNumber + 1;
                } else {
                    tabNumber = 0;
                }

                break;
        }
        /* eslint-enable default-case */

        if (typeof (tabNumber) === 'number') {
            this.active(tabNumber);
            this.tabList[tabNumber].focus();
        }
    }

    collectElem() {
        const tabListRoot = this.elem.querySelectorAll(this.settings.tabListClassName);

        if (tabListRoot.length > 1) {
            throw new Error('タブリストが2つ以上あります。');
        }

        // eslint-disable-next-line prefer-destructuring
        this.tabListRoot = tabListRoot[0];
        this.tabListItem = this.tabListRoot.getElementsByTagName('li');
        this.tabList = this.settings.tabListButtonsCollector(this.tabListRoot);
        this.tabPanelsRoot = this.elem.querySelector(this.settings.tabPanelsRootClassName);
        this.tabPanels = this.tabPanelsRoot.children;

        const nTabList = this.tabList.length;
        this.nTabPanels = this.tabPanels.length;

        if (this.nTabPanels !== nTabList) {
            throw new Error('タブの数とタブリストの数が一致しません。');
        }
    }

    destroy() {
        this.elem.classList.remove(this.settings.tabEnabledClassName.replace('.', ''));

        // ul要素にrole='tablist'を付与
        this.tabListRoot.removeAttribute('role');

        // タブを包含する要素にrole='presentation'を付与
        this.tabPanelsRoot.removeAttribute('role');

        // li要素にrole='presentation'を付与
        for (let i = 0; i < this.nTabPanels; i += 1) {
            this.tabListItem[i].removeAttribute('role');
        }

        for (let i = 0; i < this.nTabPanels; i += 1) {
            const tab = this.tabPanels[i];
            tab.removeAttribute('tabindex');
            tab.removeAttribute('role');
            tab.removeAttribute('aria-hidden');

            this.tabList[i].removeAttribute('role');
            this.tabList[i].removeAttribute('tabindex');
            this.tabList[i].removeAttribute('aria-controls');
            this.tabList[i].removeAttribute('aria-selected');

            this.tabList[i].removeEvent('click', this.methodStack.activeHandler);
            this.tabList[i].removeEvent('keydown', this.methodStack.keydownHandler);
        }
    }

    init() {
        const { hash } = location;

        this.methodStack.activeHandler = this.activeHandler.bind(this);
        this.methodStack.keydownHandler = this.keydownHandler.bind(this);

        // 要素収集
        this.collectElem();

        this.elem.classList.add(this.settings.tabEnabledClassName.replace('.', ''));

        // ul要素にrole='tablist'を付与
        this.tabListRoot.setAttribute('role', 'tablist');

        // タブを包含する要素にrole='presentation'を付与
        this.tabPanelsRoot.setAttribute('role', 'presentation');

        for (let i = 0; i < this.nTabPanels; i += 1) {
            const tab = this.tabPanels[i];
            this.tabPanelsIds.push(tab.id);
            tab.setAttribute('tabindex', -1);
            tab.setAttribute('role', 'tabpanel');
            tab.setAttribute('aria-hidden', 'true');
            tab.setAttribute('aria-labelledby', this.tabList[i].id);

            this.tabList[i].setAttribute('role', 'tab');
            this.tabList[i].setAttribute('tabindex', -1);
            this.tabList[i].setAttribute('aria-controls', tab.id);
            this.tabList[i].setAttribute('aria-selected', 'false');

            this.tabList[i].addEventListener('click', this.methodStack.activeHandler);
            this.tabList[i].addEventListener('keydown', this.methodStack.keydownHandler);
        }

        if (hash && this.tabPanelsIds.indexOf(hash.replace(/^#/u, '')) > -1) {
            this.active(hash);

            return;
        }

        const savedHash = window.sessionStorage.getItem(`ajlnext_tab_${this.elem.id}_active_tab`);
        if (savedHash && this.elem.id) {
            this.active(savedHash);

            return;
        }

        this.active(0);
    }
}
