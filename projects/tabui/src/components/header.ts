import { camelCase } from '@idlebox/common';
import { DefineCustomElements } from '../common/custom-elements';
import { DOMEvent } from '../common/dom-event';
import { DOMGetterSetter, getCustomProperties, GetterSetter } from '../common/dom-getset';
import { DragSourceKind, setDndData } from '../common/drag-and-drop';
import { __defineTabId, __getTabId } from '../common/helper';
import { IPCID } from '../common/ipc.id';
import { rendererInvoke } from '../common/ipc.renderer';
import { ITabConfig, ITabConfigExchange } from '../common/type';
import { TabMenu } from './menu';
import { TabSwitch } from './switch';

@DefineCustomElements()
export class TabHeader extends HTMLElement {
	private readonly $scroller = document.createElement('div') as HTMLDivElement;
	private readonly $menu: TabMenu;
	private readonly childsChangeObserver = new MutationObserver(this.updateChildStatus.bind(this));
	private readonly spaceResizeObserver = new ResizeObserver(this.resizeHandler.bind(this));

	private childs: TabSwitch[] = [];
	private $last?: TabSwitch;
	private lastSelectIndex: number = 0;

	constructor() {
		super();

		this.$scroller.className = 'tabs';

		this.$menu = new TabMenu();

		this.innerHTML = '';
		this.append(this.$scroller, this.$menu);
	}

	@DOMEvent({ targetProperty: '$menu', eventName: 'dragstart', capture: true })
	onTitleBarDragStart({ target, dataTransfer, offsetX: x, offsetY: y }: DragEvent) {
		if (!dataTransfer || !target) {
			debugger;
			return;
		}

		const tabs = this.childs
			.filter((e) => e.movable && e.detachable)
			.map((e) => {
				return Object.assign(e.getState(), { renderFile: '' });
			});

		if (this.vertical) {
			y += (target as HTMLElement).offsetTop;
		} else {
			x += (target as HTMLElement).offsetLeft;
		}

		dataTransfer.setDragImage(this, x, y);
		dataTransfer.effectAllowed = 'move';
		dataTransfer.clearData();
		setDndData(
			dataTransfer,
			{
				tabs: tabs,
			},
			DragSourceKind.multi
		);

		this.classList.add('drag');
	}

	@DOMEvent({ eventName: 'switch' })
	protected onTabSwitch({ detail }: CustomEvent) {
		this.select = detail!;
	}

	@DOMEvent({ eventName: 'close' })
	protected onTabClose({ detail: tabId }: CustomEvent) {
		if (this.select === tabId) {
		}
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

	@DOMEvent({ targetProperty: '$scroller', eventName: 'wheel', preventDefault: true })
	protected onTabScrollByWheel(e: WheelEvent) {
		const dir = e.deltaX > 0 || e.deltaY > 0 ? '+' : '-';
		this.onTabScroll(new CustomEvent('scroll', { detail: dir }));
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
			this.$last.active = false;
		}
		this.$last = $next;
		this.lastSelectIndex = nextIndex;

		if ($next) {
			// console.log('    add next active [prev active=%s] [index=%s] %o ', $next.active, nextIndex, $next);
			$next.active = true;
		} else {
			// console.log('    no next active');
			this.select = 0;
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

		this.$menu.draggable = this.childs.filter((e) => e.detachable && e.movable).length !== 0;

		if (!this.select && childs.length === 1) {
			setTimeout(() => {
				this.childs[0].active = true;
			}, 0);
		}

		this._update();
		// console.log('updateChildStatus [childs: %s] [select: %s]', childs.length, this.select);
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

	moveTab(position: TabSwitch | null, ids: number[]) {
		const tabs: TabSwitch[] = [];
		for (const id of ids) {
			const tab = this.childs.find((tab) => tab.tabId === id);
			if (!tab) {
				console.warn('move not exists tab: %s', id);
				continue;
			}

			if (position === tab) position = null;

			tabs.push(tab);
		}

		for (const tab of tabs) {
			this.$scroller.insertBefore(tab, position);
		}
	}

	findTab(from: HTMLElement): TabSwitch | undefined | null {
		for (let itr = from; itr.parentElement; itr = itr.parentElement) {
			if (itr.tagName === 'TAB-BODY' || itr.tagName === 'TAB-MENU') {
				return null;
			} else if (itr.tagName === 'TAB-SWITCH') {
				return itr as TabSwitch;
			}
		}
		return undefined;
	}

	indexOf(tab: TabSwitch): number {
		return this.childs.indexOf(tab);
	}

	async addTab(options: ITabConfig & Partial<ITabConfigExchange>, position: number = -1) {
		const newTab = new TabSwitch();

		const tabId = options.tabId || (await rendererInvoke(IPCID.GetNextTabGuid));
		__defineTabId(newTab, tabId);

		for (const key of getCustomProperties(newTab)) {
			const cKey = camelCase(key);
			if (options.hasOwnProperty(cKey)) {
				// console.log('addTab:%s = %s', key, (options as any)[key]);
				newTab.setAttribute(key, (options as any)[cKey]);
			}
		}

		if (this.childs[position]) {
			this.$scroller.insertBefore(newTab, this.childs[position]);
		} else {
			this.$scroller.append(newTab);
		}
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
