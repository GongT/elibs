import { DefineCustomElements } from '../common/custom-elements';
import { DOMEvent } from '../common/dom-event';
import { DOMGetterSetter, getCustomProperties, GetterSetter } from '../common/dom-getset';
import { __defineTabId, __getTabId } from '../common/helper';
import { IPanelMenuRequest, IPCID } from '../common/ipc.id';
import { DND_TYPE_ID, rendererInvoke } from '../common/ipc.renderer';
import { ITabConfig } from '../common/type';
import { TabMenu } from './menu';
import { TabSwitch } from './switch';

@DefineCustomElements()
export class TabHeader extends HTMLElement {
	private readonly $spacer = document.createElement('span') as HTMLSpanElement;
	private readonly $scroller = document.createElement('div') as HTMLDivElement;
	private readonly $menu: TabMenu;
	private readonly childsChangeObserver = new MutationObserver(this.updateChildStatus.bind(this));
	private readonly spaceResizeObserver = new ResizeObserver(this.resizeHandler.bind(this));

	private childs: TabSwitch[] = [];
	private $last?: Element;
	private lastSelectIndex: number = 0;

	constructor() {
		super();
		this.$spacer.className = 'spacer';
		this.$spacer.draggable = true;

		this.$scroller.className = 'tabs';

		this.$menu = new TabMenu();

		this.innerHTML = '';
		this.append(this.$scroller, this.$spacer, this.$menu);
	}

	@DOMEvent({ targetProperty: '$spacer', eventName: 'dragstart' })
	onMenuButtonDragStart(e: DragEvent) {
		return this.onTitleBarDragStart(e);
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
		dataTransfer.setData(DND_TYPE_ID, this.childs.map(__getTabId).join(','));
	}

	@DOMEvent({ targetProperty: '$spacer', preventDefault: true })
	protected contextmenu({ x, y }: MouseEvent) {
		rendererInvoke(IPCID.PanelMenu, { id: this.id, x, y } as IPanelMenuRequest);
	}

	@DOMEvent({ eventName: 'switch' })
	protected onTabSwitch({ detail }: CustomEvent) {
		this.select = detail!;
	}

	private declare lastOverflow: boolean;
	private resizeHandler() {
		const overflow = this.vertical
			? this.$scroller.scrollHeight > this.$scroller.offsetHeight
			: this.$scroller.scrollWidth > this.$scroller.offsetWidth;
		if (overflow === this.lastOverflow) return;
		this.lastOverflow = overflow;

		if (overflow) {
			this.$menu.setAttribute('scroll-visible', '');
		} else {
			this.$menu.removeAttribute('scroll-visible');
		}
	}

	@DOMEvent({ targetProperty: '$menu', eventName: 'scroll' })
	protected onTabScroll({ detail: direction }: CustomEvent) {
		if (this.childs.length === 0) return;

		const current = this.vertical ? this.$scroller.scrollTop : this.$scroller.scrollLeft;
		const selfSize = this.vertical ? this.$scroller.offsetHeight : this.$scroller.offsetWidth;
		// console.log('current=%s   selfSize=%s   vertical=%s', current, selfSize, this.vertical);

		if (direction === '+') {
			const last = this.childs[this.childs.length - 1];
			const end = offsetEndPosition(this.vertical, last) - selfSize;

			for (const item of this.childs) {
				const pos = this.vertical ? item.offsetTop : item.offsetLeft;
				// console.log('   [%s] %s,%s = %s', this.childs.indexOf(item), item.offsetTop, item.offsetLeft, pos);
				if (pos > current) {
					// console.log('found item!');
					return this.setScroll(Math.min(pos, end));
				}
			}
		} else {
			const currentPlus = current + selfSize;
			for (let i = this.childs.length - 1; i >= 0; i--) {
				const pos = offsetEndPosition(this.vertical, this.childs[i]);
				// console.log('   [%s] %s', i, pos);
				if (pos < currentPlus) {
					// console.log('found item!');
					return this.setScroll(Math.max(pos - selfSize, 0));
				}
			}
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
		for (let n = 0; n < this.$scroller.children.length; n++) {
			const node = this.$scroller.children.item(n)!;
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
		this.childsChangeObserver.disconnect();
		this.spaceResizeObserver.disconnect();
	}

	connectedCallback() {
		this.childsChangeObserver.observe(this.$scroller, { childList: true });
		this.spaceResizeObserver.observe(this.$scroller);
	}

	async addTab(options: ITabConfig) {
		const newTab = new TabSwitch();

		const tabId = await rendererInvoke(IPCID.GetNextTabGuid);
		__defineTabId(newTab, tabId);

		for (const key of getCustomProperties(newTab)) {
			if (options.hasOwnProperty(key)) {
				// console.log('addTab:%s = %s', key, (options as any)[key]);
				newTab.setAttribute(key, (options as any)[key]);
			}
		}

		this.$scroller.append(newTab);
		return newTab;
	}

	public setScroll(pos: number) {
		if (this.vertical) {
			this.$scroller.scrollTo(0, pos);
		} else {
			this.$scroller.scrollTo(pos, 0);
		}
	}

	attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null) {
		// console.log('[%s] %s : %s => %s', this.constructor.name, name, _oldValue, _newValue);
		if (name === 'select') {
			if (this.isConnected) {
				this._update();
			}
		} else if (name === 'vertical') {
			this.scrollTo({ top: 0, left: 0 });
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	@GetterSetter(DOMGetterSetter.interger(0)) public declare select: number;
	@GetterSetter(DOMGetterSetter.boolean) public declare vertical: boolean;
}

function offsetEndPosition(vertical: boolean, item: HTMLElement) {
	return vertical ? item.offsetTop + item.offsetHeight : item.offsetLeft + item.offsetWidth;
}
