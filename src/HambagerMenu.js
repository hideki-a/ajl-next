import loopFocus from './snippets/loopfocus';

export default class HambagerMenu {
    constructor(options) {
        /* eslint-disable no-multi-spaces,key-spacing */
        this.defaults = {
            menuElemId        : 'globalnav',
            buttonElemSelector: '#toggle_gnav',
            loopFocusContainer(parent) {
                return parent.closest('nav');
            },
            openCallback() {
                // Void
            },
            closeCallback() {
                // Void
            },
        };
        /* eslint-enable no-multi-spaces,key-spacing */
        this.settings = Object.assign(this.defaults, options);

        this.elem = document.getElementById(this.settings.menuElemId);
        this.menuId = this.settings.menuElemId;
        this.buttonElem = document.querySelector(this.settings.buttonElemSelector);
        this.isMenuOpen = false;
        this.removeLoopFocus = null;
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.elem.hidden = true;
            this.isMenuOpen = false;
            this.elem.setAttribute('aria-hidden', !this.isMenuOpen);
            this.buttonElem.setAttribute('aria-expanded', this.isMenuOpen);
            this.settings.closeCallback();
            this.removeLoopFocus();
        } else {
            this.elem.hidden = false;
            this.isMenuOpen = true;
            this.settings.openCallback();
            this.elem.setAttribute('aria-hidden', !this.isMenuOpen);
            this.buttonElem.setAttribute('aria-expanded', this.isMenuOpen);
            this.removeLoopFocus = loopFocus({
                el: this.settings.loopFocusContainer(this.elem),
            });
        }
    }

    enableHambagerMode() {
        this.elem.hidden = true;
        this.elem.setAttribute('aria-hidden', !this.isMenuOpen);
        this.buttonElem.hidden = false;
        this.buttonElem.setAttribute('aria-expanded', this.isMenuOpen);
        this.buttonElem.setAttribute('aria-controls', this.menuId);
    }

    disablehambagerMode() {
        this.elem.hidden = false;
        this.elem.removeAttribute('aria-hidden');
        this.buttonElem.hidden = true;
    }

    init() {
        this.buttonElem.addEventListener('click', () => {
            this.toggleMenu();
        });
    }
}
