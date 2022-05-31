import loopFocus from './snippets/loopfocus';

export default class HamburgerMenu {
    constructor(options) {
        /* eslint-disable no-multi-spaces,key-spacing */
        this.defaults = {
            menuElemId        : 'globalnav',
            buttonElemSelector: '#toggle_gnav',
            inertTarget       : null,
            loopFocusContainer(parent) {
                return parent.closest('nav');
            },
            async openCallback() {
                // Void
            },
            async closeCallback() {
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

    async toggleMenu() {
        if (this.isMenuOpen) {
            this.elem.hidden = true;
            this.isMenuOpen = false;
            this.elem.setAttribute('aria-hidden', !this.isMenuOpen);
            this.buttonElem.setAttribute('aria-expanded', this.isMenuOpen);
            await this.settings.closeCallback();

            this.removeLoopFocus();
            if (this.settings.inertTarget) {
                this.settings.inertTarget.forEach((selector) => {
                    const target = document.querySelector(selector);
                    target.inert = false;
                });
            }
        } else {
            this.elem.hidden = false;
            this.isMenuOpen = true;
            await this.settings.openCallback();
            this.elem.setAttribute('aria-hidden', !this.isMenuOpen);
            this.buttonElem.setAttribute('aria-expanded', this.isMenuOpen);

            this.removeLoopFocus = loopFocus({
                el: this.settings.loopFocusContainer(this.elem),
            });
            if (this.settings.inertTarget) {
                this.settings.inertTarget.forEach((selector) => {
                    const target = document.querySelector(selector);
                    target.inert = true;
                });
            }
        }
    }

    enableHamburgerMode() {
        this.elem.hidden = true;
        this.elem.classList.add('--enableHamburger');
        this.elem.setAttribute('aria-hidden', !this.isMenuOpen);
        this.elem.addEventListener('keydown', this.closeByKeyHandler);
        this.buttonElem.hidden = false;
        this.buttonElem.setAttribute('aria-expanded', this.isMenuOpen);
        this.buttonElem.setAttribute('aria-controls', this.menuId);
        this.buttonElem.setAttribute('aria-haspopup', 'true');
    }

    disableHamburgerMode() {
        this.elem.hidden = false;
        this.elem.classList.remove('--enableHamburger');
        this.elem.removeAttribute('aria-hidden');
        this.elem.removeEventListener('keydown', this.closeByKeyHandler);
        this.buttonElem.hidden = true;
    }

    closeByKey(e) {
        if (e.keyCode === 27 && this.isMenuOpen) {
            // Esc
            this.toggleMenu();
            this.buttonElem.focus();
        }
    }

    init() {
        this.closeByKeyHandler = this.closeByKey.bind(this);
        this.buttonElem.addEventListener('click', () => {
            this.toggleMenu();
        });
    }
}
