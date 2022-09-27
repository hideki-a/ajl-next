/**
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
            openOnHover: true,
        };
        /* eslint-enable no-multi-spaces,key-spacing */
        this.settings = Object.assign(this.defaults, options);

        this.rootElem = document.querySelector(this.settings.rootSelector);
        this.menuItem = document.querySelectorAll(this.settings.menuItemSelector);
        this.openedElem = null;
        this.openedElemLinks = null;
        this.openTimerId = null;
        this.slideDownTimerId = null;
        this.closeTimerId = null;
        this.isAnimated = false;

        this.openMenuHandler = null;
        this.closeMenuHandler = null;
        this.keepOpenMenuHandler = null;
        this.closeByButtonHandler = null;
        this.keyboardControlHandler = null;
        this.closeByFocusoutHandler = null;
        this.closeByAnotherAreaHandler = null;
        this.childMenuKeyboardControlHandler = null;
    }

    static generateId() {
        return `ajl_${Math.floor(Math.random() * 1000000)}`;
    }

    async openMenu(e, keydown = false) {
        if (this.slideDownTimerId) {
            clearTimeout(this.slideDownTimerId);
        }

        const menuItem = e.currentTarget;
        const childElem = e.currentTarget.nextElementSibling;

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
            this.slideDownTimerId = setTimeout(async () => {
                if (this.isAnimated) {
                    clearTimeout(this.openTimerId);
                    this.openTimerId = setTimeout(() => {
                        this.openMenu(e, keydown);
                    }, 100);

                    return;
                }

                childElem.hidden = false;
                menuItem.setAttribute('aria-expanded', 'true');
                childElem.setAttribute('aria-hidden', 'false');

                this.isAnimated = true;
                await slidefunc.slideDown(childElem, 500);
                this.isAnimated = false;

                this.openedElemLinks = childElem.getElementsByTagName('a');
                this.openedElemLinks = Array.from(this.openedElemLinks).filter((elem) => !elem.parentNode.classList.contains('u-pcNoneByNav'));
                if (keydown) {
                    // childElem.querySelector('a').focus();
                }
            }, keydown ? 0 : 500);
        }
    }

    closeMenu(e, immediately = false) {
        const promise = new Promise((resolve) => {
            if (this.openedElem) {
                let delay = this.settings.closeMenuDelay;
                if (immediately) {
                    delay = 0;
                } else if (e && e.type === 'click') {
                    delay = 50;
                }

                this.closeTimerId = window.setTimeout(async () => {
                    if (this.isAnimated) {
                        clearTimeout(this.closeTimerId);
                        this.closeTimerId = setTimeout(() => {
                            this.closeMenu(e, immediately);
                        }, 100);

                        return;
                    }

                    if (this.openedElem) {
                        this.isAnimated = true;
                        await slidefunc.slideUp(this.openedElem, immediately ? 0 : 500);
                        this.isAnimated = false;
                        this.openedElem.hidden = true;
                        this.openedElem.setAttribute('aria-hidden', 'true');
                        this.openedElem.previousElementSibling.setAttribute('aria-expanded', 'false');

                        this.openedElem = null;
                        this.openedElemLinks = null;
                    }
                    resolve();
                }, delay);
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

    childMenuKeyboardControl(e) {
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

    closeByAnotherArea(e) {
        let match = false;
        const paths = e.composedPath();
        paths.forEach((path) => {
            if (path.id === 'globalnav') {
                match = true;
            }
        });

        if (!match) {
            this.closeMenu(null, true);
        }
    }

    destroy() {
        this.rootElem.classList.remove(`${this.settings.rootSelector.replace('.', '')}--enableMegaMenu`);
        if (this.settings.openOnHover) {
            this.rootElem.removeEventListener('focusout', this.closeByFocusoutHandler);
        }

        this.menuItem.forEach((elem) => {
            elem.removeEventListener('keydown', this.keyboardControlHandler);
            elem.removeEventListener('click', this.openMenuHandler);
            if (this.settings.openOnHover) {
                elem.removeEventListener('mouseenter', this.openMenuHandler);
                elem.removeEventListener('mouseleave', this.closeMenuHandler);
            }

            const childMenu = elem.parentNode.querySelector(this.settings.childMenuSelector);
            if (childMenu) {
                if (elem.dataset.href) {
                    elem.setAttribute('href', elem.dataset.href);
                }
                elem.removeAttribute('tabIndex');
                elem.removeAttribute('role');
                elem.removeAttribute('aria-controls');
                elem.removeAttribute('aria-expanded');
                elem.removeAttribute('aria-haspopup');
                if (this.settings.openOnHover) {
                    childMenu.removeEventListener('mouseenter', this.keepOpenMenuHandler);
                    childMenu.removeEventListener('mouseleave', this.closeMenuHandler);
                }
                childMenu.removeEventListener('keydown', this.keyboardControlHandler);
                childMenu.removeAttribute('aria-hidden');
                childMenu.removeAttribute('style');
                childMenu.hidden = false;

                const closeButton = childMenu.querySelector(this.settings.closeButtonSelector);
                closeButton.removeEventListener('click', this.closeByButtonHandler);
            }
        });

        document.body.removeEventListener('click', this.closeByAnotherAreaHandler);
    }

    init() {
        if (this.settings.openOnHover) {
            this.openMenuHandler = this.openMenu.bind(this);
        } else {
            this.openMenuHandler = (e) => {
                if (this.openedElem === e.currentTarget.nextElementSibling) {
                    this.closeMenu(e, false);
                } else {
                    this.openMenu(e, true);
                }
            };
        }
        this.closeMenuHandler = this.closeMenu.bind(this);
        this.keepOpenMenuHandler = this.keepOpenMenu.bind(this);
        this.closeByButtonHandler = this.closeByButton.bind(this);
        this.keyboardControlHandler = this.keyboardControl.bind(this);
        this.closeByFocusoutHandler = this.closeByFocusout.bind(this);
        this.closeByAnotherAreaHandler = this.closeByAnotherArea.bind(this);
        this.childMenuKeyboardControlHandler = this.childMenuKeyboardControl.bind(this);

        this.rootElem.classList.add(`${this.settings.rootSelector.replace('.', '')}--enableMegaMenu`);
        if (this.settings.openOnHover) {
            this.rootElem.addEventListener('focusout', this.closeByFocusoutHandler);
        }
        this.menuItem.forEach((elem) => {
            elem.addEventListener('keydown', this.keyboardControlHandler);
            elem.addEventListener('click', this.openMenuHandler); // NOTE: For Screen Reader(ex. VoiceOverのCtrl + Option + Space)
            if (this.settings.openOnHover) {
                elem.addEventListener('mouseenter', this.openMenuHandler);
                elem.addEventListener('mouseleave', this.closeMenuHandler);
            }

            const childMenu = elem.parentNode.querySelector(this.settings.childMenuSelector);
            if (childMenu) {
                let { id } = childMenu;
                if (!id) {
                    id = MegaMenu.generateId();
                    childMenu.id = id;
                }
                elem.dataset.href = elem.getAttribute('href');
                elem.removeAttribute('href');
                elem.tabIndex = 0;
                elem.setAttribute('role', 'button');
                elem.setAttribute('aria-controls', id);
                elem.setAttribute('aria-expanded', 'false');
                elem.setAttribute('aria-haspopup', 'true');
                if (this.settings.openOnHover) {
                    childMenu.addEventListener('mouseenter', this.keepOpenMenuHandler);
                    childMenu.addEventListener('mouseleave', this.closeMenuHandler);
                }
                childMenu.addEventListener('keydown', this.childMenuKeyboardControlHandler);
                childMenu.setAttribute('aria-hidden', 'true');

                const closeButton = childMenu.querySelector(this.settings.closeButtonSelector);
                closeButton.addEventListener('click', this.closeByButtonHandler);
            }
        });

        document.body.addEventListener('click', this.closeByAnotherAreaHandler);
    }
}
