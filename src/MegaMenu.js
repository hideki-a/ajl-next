/*
 * メガメニューの制御
 *
 * 参考:
 * https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/
 * https://www.w3.org/WAI/ARIA/apg/patterns/menu/
 */
import slidefunc from './snippets/slidefunc';

export default class MegaMenu {
    constructor(options) {
        /* eslint-disable no-multi-spaces,key-spacing */
        this.defaults = {
            rootSelector       : '.globalNav',
            menuItemSelector   : '.globalNav__item > a',
            childMenuSelector  : '.globalNav__childContainer',
            closeButtonSelector: '.globalNav__childClose',
            closeMenuDelay     : 500,
        };
        /* eslint-enable no-multi-spaces,key-spacing */
        this.settings = Object.assign(this.defaults, options);

        this.rootElem = document.querySelector(this.settings.rootSelector);
        this.menuItem = document.querySelectorAll(this.settings.menuItemSelector);
        this.openedElem = null;
        this.openedElemLinks = null;
        this.closeTimerId = null;

        this.openMenuHandler = null;
        this.closeMenuHandler = null;
        this.keepOpenMenuHandler = null;
        this.closeByButtonHandler = null;
        this.keyboardControlHandler = null;
        this.closeByFocusoutHandler = null;
        this.childMenukeyboardControlHandler = null;
    }

    async openMenu(e, keydown = false) {
        const childElem = e.target.nextElementSibling;
        if (this.openedElem && this.openedElem !== childElem) {
            if (this.closeTimerId) {
                window.clearTimeout(this.closeTimerId); // NOTE: サブメニューを持つ要素間をマウスで移動した時を考慮
            }
            await this.closeMenu(null, true);
        } else if (this.openedElem === childElem) {
            if (this.closeTimerId) {
                window.clearTimeout(this.closeTimerId);
            }

            return;
        }

        if (childElem) {
            this.openedElem = childElem;
            childElem.hidden = false;
            slidefunc.slideDown(childElem);
            e.target.setAttribute('aria-expanded', 'true');
            childElem.setAttribute('aria-hidden', 'false');
            this.openedElemLinks = childElem.getElementsByTagName('a');
            if (keydown) {
                // childElem.querySelector('a').focus();
            }
        }
    }

    closeMenu(_, immediately = false) {
        const promise = new Promise((resolve) => {
            if (this.openedElem) {
                this.closeTimerId = window.setTimeout(async () => {
                    if (this.openedElem) {
                        this.openedElem.hidden = true;
                        this.openedElem.setAttribute('aria-hidden', 'true');
                        this.openedElem.previousElementSibling.setAttribute('aria-expanded', 'false');
                        await slidefunc.slideUp(this.openedElem);
                        this.openedElem = null;
                        this.openedElemLinks = null;
                    }
                    resolve();
                }, immediately ? 0 : this.settings.closeMenuDelay);
            }
        });

        return promise;
    }

    keepOpenMenu() {
        window.clearTimeout(this.closeTimerId);
    }

    keyboardControl(e) {
        if (e.keyCode === 32 || e.keyCode === 13) {
            // Spacebar or Enter
            e.preventDefault();
            if (this.openedElem === e.target.nextElementSibling) {
                this.closeMenu(null, true);
            } else {
                this.openMenu(e, true);
            }
        } else if (e.keyCode === 37) {
            // Left
            const index = Array.prototype.indexOf.call(this.menuItem, e.target);
            if (index - 1 > -1) {
                e.preventDefault();
                this.menuItem[index - 1].focus();
            }
        } else if (e.keyCode === 39) {
            // Right
            const index = Array.prototype.indexOf.call(this.menuItem, e.target);
            if (index + 1 < this.menuItem.length) {
                e.preventDefault();
                this.menuItem[index + 1].focus();
            }
        } else if (e.keyCode === 40) {
            // Down
            if (this.openedElemLinks) {
                e.preventDefault();
                this.openedElemLinks[0].focus();
            }
        }
    }

    childMenukeyboardControl(e) {
        if (e.target.tagName.toLowerCase() === 'a') {
            if (e.keyCode === 40) {
                // Down
                e.preventDefault();
                const index = Array.prototype.indexOf.call(this.openedElemLinks, e.target);
                if (index + 1 < this.openedElemLinks.length) {
                    this.openedElemLinks[index + 1].focus();
                } else {
                    this.openedElemLinks[0].focus();
                }
            } else if (e.keyCode === 38) {
                // Up
                e.preventDefault();
                const index = Array.prototype.indexOf.call(this.openedElemLinks, e.target);
                if (index - 1 > -1) {
                    this.openedElemLinks[index - 1].focus();
                } else {
                    this.openedElemLinks[this.openedElemLinks.length - 1].focus();
                }
            } else if (e.keyCode === 27) {
                // Esc
                this.closeByButton(e);
            }
        }
    }

    closeByButton(e) {
        e.target.closest(this.settings.childMenuSelector).previousElementSibling.focus();
        this.closeMenu(null, true);
    }

    closeByFocusout(e) {
        if (!e.relatedTarget) {
            this.closeMenu();
        }
    }

    destroy() {
        this.rootElem.classList.remove(`${this.settings.rootSelector.replace('.', '')}--enableMegaMenu`);
        this.rootElem.removeEventListener('focusout', this.closeByFocusoutHandler);

        this.menuItem.forEach((elem) => {
            elem.removeEventListener('keydown', this.keyboardControlHandler);
            elem.removeEventListener('click', this.openMenuHandler);
            elem.removeEventListener('mouseenter', this.openMenuHandler);
            elem.removeEventListener('mouseleave', this.closeMenuHandler);

            const childMenu = elem.parentNode.querySelector(this.settings.childMenuSelector);
            if (childMenu) {
                elem.setAttribute('href', elem.dataset.href);
                elem.removeAttribute('tabIndex');
                elem.removeAttribute('role');
                elem.removeAttribute('aria-controls');
                elem.removeAttribute('aria-expanded');
                elem.removeAttribute('aria-haspopup');
                childMenu.removeEventListener('mouseenter', this.keepOpenMenuHandler);
                childMenu.removeEventListener('mouseleave', this.closeMenuHandler);
                childMenu.removeEventListener('keydown', this.keyboardControlHandler);
                childMenu.removeAttribute('aria-hidden');

                const closeButton = childMenu.querySelector(this.settings.closeButtonSelector);
                closeButton.removeEventListener('click', this.closeByButtonHandler);
            }
        });
    }

    init() {
        this.openMenuHandler = this.openMenu.bind(this);
        this.closeMenuHandler = this.closeMenu.bind(this);
        this.keepOpenMenuHandler = this.keepOpenMenu.bind(this);
        this.closeByButtonHandler = this.closeByButton.bind(this);
        this.keyboardControlHandler = this.keyboardControl.bind(this);
        this.closeByFocusoutHandler = this.closeByFocusout.bind(this);
        this.childMenukeyboardControlHandler = this.childMenukeyboardControl.bind(this);

        this.rootElem.classList.add(`${this.settings.rootSelector.replace('.', '')}--enableMegaMenu`);
        this.rootElem.addEventListener('focusout', this.closeByFocusoutHandler);
        this.menuItem.forEach((elem) => {
            elem.addEventListener('keydown', this.keyboardControlHandler);
            elem.addEventListener('click', this.openMenuHandler); // NOTE: For Screen Reader(ex. VoiceOverのCtrl + Option + Space)
            elem.addEventListener('mouseenter', this.openMenuHandler);
            elem.addEventListener('mouseleave', this.closeMenuHandler);

            const childMenu = elem.parentNode.querySelector(this.settings.childMenuSelector);
            if (childMenu) {
                elem.dataset.href = elem.getAttribute('href');
                elem.removeAttribute('href');
                elem.tabIndex = 0;
                elem.setAttribute('role', 'button');
                elem.setAttribute('aria-controls', childMenu.id);
                elem.setAttribute('aria-expanded', 'false');
                elem.setAttribute('aria-haspopup', 'true');
                childMenu.addEventListener('mouseenter', this.keepOpenMenuHandler);
                childMenu.addEventListener('mouseleave', this.closeMenuHandler);
                childMenu.addEventListener('keydown', this.childMenukeyboardControlHandler);
                childMenu.setAttribute('aria-hidden', 'true');

                const closeButton = childMenu.querySelector(this.settings.closeButtonSelector);
                closeButton.addEventListener('click', this.closeByButtonHandler);
            }
        });
    }
}
