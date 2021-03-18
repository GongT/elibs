import { MenuItemConstructorOptions } from 'electron';
import { DefineCustomElements } from '../common/custom-elements';
import { DOMEvent } from '../common/dom-event';
import { DOMGetterSetter, GetterSetter } from '../common/dom-getset';
import { IPCID, ITabMenuRequest } from '../common/ipc.id';
import { rendererInvoke } from '../common/ipc.renderer';

interface ITabSwitchOptions {
	onMenu(): ReadonlyArray<MenuItemConstructorOptions>;
}

@DefineCustomElements()
export class TabSwitch extends HTMLElement {
	public declare readonly tabId: number;

	private readonly $iconImg = document.createElement('img');
	private readonly $title = document.createElement('span');
	private readonly $closeButton = document.createElement('a');

	private fixedMenu: MenuItemConstructorOptions[] = [];

	private options: Partial<ITabSwitchOptions> = {};
	private mouseDownEnabled = false;

	constructor() {
		super();

		this.mouseup = this.mouseup.bind(this);

		this.setAttribute('draggable', 'true');

		const $vparent = document.createElement('div');
		$vparent.className = 'vparent';

		this.$title.className = 'icon';
		$vparent.appendChild(this.$iconImg);

		this.$title.className = 'title';
		$vparent.appendChild(this.$title);

		this.$closeButton.className = 'close';
		$vparent.appendChild(this.$closeButton);

		this.appendChild($vparent);
	}

	@DOMEvent({})
	protected dragstart({ preventDefault, dataTransfer, offsetX: x, offsetY: y }: DragEvent) {
		this.mouseup();
		if (!dataTransfer) {
			debugger;
			return;
		}
		if (!this.detachable) {
			return preventDefault();
		}

		dataTransfer.effectAllowed = 'move';
		this.classList.add('drag');
		dataTransfer.setDragImage(this, x, y);
		setTimeout(() => {
			this.classList.remove('drag');
		}, 50);
		dataTransfer.clearData();
		dataTransfer.setData('tabui-panel', [this.tabId].join(','));
	}

	@DOMEvent({ preventDefault: true })
	protected contextmenu({ x, y }: MouseEvent) {
		this.mouseup();

		let menu: MenuItemConstructorOptions[];
		if (this.options.onMenu) {
			menu = [...this.options.onMenu(), ...this.fixedMenu];
		} else {
			menu = this.fixedMenu;
		}

		rendererInvoke(IPCID.TabMenu, { guid: this.tabId, x, y, menu } as ITabMenuRequest);
	}

	@DOMEvent({ eventName: 'click', stopPropagation: true, targetProperty: '$closeButton' })
	protected onCloseButtonClick() {
		this.dispose();
	}

	protected dispose() {
		this.active = false;
		const event = new CustomEvent('close', { detail: this.tabId, bubbles: true });
		if (this.dispatchEvent(event)) {
			this.remove();
		}
	}

	@DOMEvent({ eventName: 'click', stopPropagation: true })
	protected onClick() {
		this.active = true;
	}

	@DOMEvent()
	protected mousedown(e: MouseEvent) {
		if (this.mouseDownEnabled || e.button !== 0) {
			return;
		}
		this.classList.add('click-down');
		this.mouseDownEnabled = true;
		window.addEventListener('mouseup', this.mouseup);
	}

	private mouseup() {
		if (this.mouseDownEnabled) {
			this.mouseDownEnabled = false;
			this.classList.remove('click-down');
			window.removeEventListener('mouseup', this.mouseup);
		}
	}

	connectedCallback() {
		// console.log('connectedCallback:%s', this.isConnected);

		if (!this.hasAttribute('tabId')) {
			console.log('%cNo tabId is set for TabSwitch, did you initTabUIMainProcess()?', 'color:red');
			const err = document.createElement('h1');
			err.innerText = 'Critical error';
			this.replaceWith(err);
		}
	}

	disconnectedCallback() {
		this.dispose();
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
		// console.log('[%s] %s(%s) : %s => %s', this.constructor.name, this.tabId, name, _oldValue, newValue);
		if (name === 'icon-class') {
			if (newValue) {
				this.iconUrl = '';
				this.$iconImg.className = 'icon ' + newValue;
			} else {
				if (this.iconUrl) {
					this.$iconImg.className = 'icon';
				} else {
					this.$iconImg.className = 'icon hide';
				}
			}
		} else if (name === 'icon-url') {
			if (newValue) {
				this.$iconImg.src = newValue;
				this.iconClass = '';
			} else {
				this.$iconImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
			}
		} else if (name === 'closable') {
			const v = DOMGetterSetter.boolean.get(newValue);
			if (v) {
				this.$closeButton.classList.remove('hide');
				this.fixedMenu.pop();
			} else {
				this.$closeButton.classList.add('hide');
				this.fixedMenu.push({ label: 'Close' });
			}
		} else if (name === 'movable') {
			const v = DOMGetterSetter.boolean.get(newValue);
			if (v) {
			} else {
				this.classList.remove('movable');
				this.detachable = false;
			}
		} else if (name === 'detachable') {
		} else if (name === 'title') {
			this.$title.innerText = newValue || '';
		} else if (name === 'width') {
			this.$title.style.width = newValue || '';
		} else if (name === 'active') {
			const bVal = DOMGetterSetter.boolean.get(newValue);
			if (bVal) {
				console.log('active', this.tabId);
				const event = new CustomEvent('switch', { detail: this.tabId, bubbles: true });
				this.dispatchEvent(event);
			}
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	@GetterSetter(DOMGetterSetter.boolean(true)) public declare closable: boolean;
	@GetterSetter(DOMGetterSetter.boolean(true)) public declare detachable: boolean;
	@GetterSetter(DOMGetterSetter.boolean(true)) public declare movable: boolean;
	@GetterSetter(DOMGetterSetter.boolean) public declare active: boolean;
	@GetterSetter(DOMGetterSetter.string) public declare width: string;
	@GetterSetter(DOMGetterSetter.string) public declare iconUrl: string;
	@GetterSetter(DOMGetterSetter.string) public declare iconClass: string;
	@GetterSetter(DOMGetterSetter.string) public declare title: string;
}
