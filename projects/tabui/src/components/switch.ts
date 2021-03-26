import { IDisposable } from '@idlebox/common';
import { MenuItemConstructorOptions } from 'electron';
import { DefineCustomElements, initState } from '../common/custom-elements';
import { disposeOnDetach, DOMInit } from '../common/custom-lifecycle';
import { handleDragAwayEvent, isElementDragAway } from '../common/dom-drag-away';
import { handleDragOverEvent } from '../common/dom-drag-over';
import { DOMEvent } from '../common/dom-event';
import { DOMEventTrigger } from '../common/dom-event-trigger';
import { DOMGetterSetter, GetterSetter } from '../common/dom-getset';
import { DragSourceKind, setDndData } from '../common/drag-and-drop';
import { IPCID, ITabMenuRequest } from '../common/ipc.id';
import { rendererInvoke } from '../common/ipc.renderer';
import { ITabHeaderConfig } from '../common/type';
import { TabDropZone } from './dropzone';

interface ITabSwitchOptions {
	onMenu(): ReadonlyArray<MenuItemConstructorOptions>;
}

const closeSvg = `<svg class="normal" viewBox="0 0 24 24">
	<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
</svg>
<svg class="hover" viewBox="0 0 24 24">
	<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path>
</svg>`;

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

		const $vparent = document.createElement('div');
		$vparent.className = 'vparent';

		this.$title.className = 'icon';
		$vparent.appendChild(this.$iconImg);

		this.$title.className = 'title';
		$vparent.appendChild(this.$title);

		this.$closeButton.className = 'close';
		this.$closeButton.innerHTML = closeSvg;
		$vparent.appendChild(this.$closeButton);

		this.appendChild($vparent);
	}

	@DOMInit()
	protected initDragAway() {
		disposeOnDetach(
			this,
			handleDragAwayEvent(
				this,
				({ dataTransfer, offsetX: x, offsetY: y }) => {
					this.mouseup();

					dataTransfer.effectAllowed = 'copyMove';
					dataTransfer.setDragImage(this, x, y);

					const data = { ...this.getState(), renderFile: '' };
					setDndData(dataTransfer, { tabs: [data] }, DragSourceKind.single);
				},
				(e) => {
					if (e.dataTransfer.dropEffect === 'move') {
						this.remove();
					}
				}
			)
		);
	}

	public remove() {
		// console.log('tab remove called');
		this.onTabWillClose(this.tabId);
		super.remove();
	}

	getState(): ITabHeaderConfig & { tabId: number } {
		return {
			tabId: this.tabId,
			title: this.title,
			iconClass: this.iconClass,
			iconUrl: this.iconUrl,
			closable: this.closable,
			detachable: this.detachable,
			movable: this.movable,
		};
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
		if (this.onTabWillClose(this.tabId)) {
			super.remove();
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

	@DOMInit()
	protected onMounted(): IDisposable {
		// console.log('connectedCallback:%s', this.isConnected);

		if (!this.hasAttribute('tabId')) {
			console.log('%cNo tabId is set for TabSwitch, did you initTabUIMainProcess()?', 'color:red');
			const err = document.createElement('h1');
			err.innerText = 'Critical error';
			this.replaceWith(err);
		}

		return handleDragOverEvent(this, this.handleDragEnter, this.handleDragLeave);
	}

	private isValidDropStatus() {
		if (isElementDragAway(this) || isElementDragAway(this.previousElementSibling)) {
			return false;
		}
		return true;
	}

	private handleDragEnter() {
		if (!this.isValidDropStatus()) {
			return;
		}
		TabDropZone.get().attachElement(this);
	}

	@DOMEvent({ eventName: 'drop', capture: true })
	private handleDragLeave() {
		TabDropZone.get().detachElement(this);
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		// console.log('[%s] %s(%s) : %s => %s', this.constructor.name, this.tabId, name, oldValue, newValue);
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
				if (oldValue !== initState) this.iconClass = '';
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
				this.setAttribute('draggable', 'true');
			} else {
				this.removeAttribute('draggable');
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
				// console.log('active', this.tabId);
				this.onTabBeSelect(this.tabId);
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

	@DOMEventTrigger({ eventName: 'close', bubbles: true, cancelable: true })
	private declare onTabWillClose: DOMEventTrigger<number>;

	@DOMEventTrigger({ eventName: 'switch', bubbles: true })
	private declare onTabBeSelect: DOMEventTrigger<number>;
}
