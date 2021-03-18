import { DefineCustomElements } from '../common/custom-elements';
import { DOMEvent } from '../common/dom-event';
import { DOMGetterSetter, getCustomProperties, GetterSetter } from '../common/dom-getset';
import { __defineTabId, __getTabId } from '../common/helper';
import { IPanelMenuRequest, IPCID } from '../common/ipc.id';
import { rendererInvoke } from '../common/ipc.renderer';
import { ITabConfig } from '../common/type';
import { TabSwitch } from './switch';

@DefineCustomElements()
export class TabHeader extends HTMLElement {
	private readonly $spacer = document.createElement('span') as HTMLSpanElement;
	private readonly observer = new MutationObserver(this.updateChildStatus.bind(this));

	private childs: TabSwitch[] = [];
	private $last?: Element;
	private lastSelectIndex: number = 0;

	constructor() {
		super();
		this.$spacer.className = 'spacer';
		this.$spacer.draggable = true;
		// console.log('constructor: value=%s', this.getAttribute('value'));
	}

	@DOMEvent({ targetProperty: '$spacer', eventName: 'dragstart' })
	onTitleBarDragStart({ dataTransfer, offsetX: x, offsetY: y }: DragEvent) {
		if (!dataTransfer) {
			debugger;
			return;
		}
		dataTransfer.effectAllowed = 'move';
		this.classList.add('drag');
		dataTransfer.setDragImage(this, x + this.$spacer.offsetLeft, y);
		setTimeout(() => {
			this.classList.remove('drag');
		}, 50);
		dataTransfer.clearData();
		dataTransfer.setData('tabui-panel', this.childs.map(__getTabId).join(','));
	}

	@DOMEvent({ targetProperty: '$spacer', preventDefault: true })
	protected contextmenu({ x, y }: MouseEvent) {
		rendererInvoke(IPCID.PanelMenu, { id: this.id, x, y } as IPanelMenuRequest);
	}

	@DOMEvent({ eventName: 'switch' })
	protected onTabSwitch({ detail }: CustomEvent) {
		this.select = detail!;
	}

	attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null) {
		// console.log('[%s] %s : %s => %s', this.constructor.name, name, _oldValue, _newValue);
		if (name === 'select') {
			if (this.isConnected) {
				this._update();
			}
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	private _update() {
		// console.log('_update:', this.select);
		const v = this.select;
		let nextIndex = this.childs.findIndex((e) => __getTabId(e) === v);

		if (nextIndex === -1 && v !== 0) {
			// select did not exists any more

			if (this.childs[this.lastSelectIndex]) {
				nextIndex = this.lastSelectIndex;
			} else {
				nextIndex = this.childs.length - 1;
			}
		}
		const $next = this.childs[nextIndex];

		if ($next === this.$last) {
			// console.log('    same');
			this.lastSelectIndex = nextIndex;
			return;
		}

		if (this.$last) {
			// console.log('    remove last active', this.$last);
			this.$last.removeAttribute('active');
		}
		this.$last = $next;
		this.lastSelectIndex = nextIndex;

		if ($next) {
			// console.log('    add next active', $next);
			$next.setAttribute('active', '');
		}
	}

	private updateChildStatus() {
		const childs = [];
		for (let n = 0; n < this.children.length; n++) {
			const node = this.children.item(n)!;
			if (node.tagName === 'TAB-SWITCH') {
				childs.push(node as TabSwitch);
			}
		}
		this.childs = childs;
		this._update();
		// console.log('updateChildStatus:%s', childs.length);
	}

	disconnectedCallback() {
		// console.log('disconnectedCallback:%s', this.isConnected);
		this.observer.disconnect();
	}

	connectedCallback() {
		this.observer.observe(this, { childList: true });

		// console.log('connectedCallback:%s', this.isConnected);
		const $menu = this.querySelector('tab-menu');
		if ($menu) {
			this.insertBefore(this.$spacer, $menu);
		} else {
			this.append(this.$spacer);
		}
	}

	async addTab(options: ITabConfig) {
		const newTab = new TabSwitch();

		const tabId = await rendererInvoke(IPCID.GetNextTabGuid);
		__defineTabId(newTab, tabId);

		for (const key of getCustomProperties(newTab)) {
			if (options.hasOwnProperty(key)) {
				(newTab as any)[key] = (options as any)[key];
			}
		}

		this.insertBefore(newTab, this.$spacer);
		return newTab;
	}

	@GetterSetter(DOMGetterSetter.interger(0)) public declare select: number;
}
