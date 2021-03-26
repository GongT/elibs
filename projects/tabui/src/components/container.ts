import { DefineCustomElements } from '../common/custom-elements';
import { DOMEvent } from '../common/dom-event';
import { DOMGetterSetter, DOMSetBooleanAttribute, GetterSetter } from '../common/dom-getset';
import {
	attachMoreDndData,
	checkAllTabsUndetachable,
	checkPanelId,
	DragSourceKind,
	getDndKind,
	hasDndData,
	markAllTabsUndetachable,
	markPanelId,
	parseDndData,
} from '../common/drag-and-drop';
import { __getTabId } from '../common/helper';
import { closeTabInOtherWindow, WindowId } from '../common/ipc.renderer';
import { ITabConfig, ViewDirection } from '../common/type';
import { TabBody } from './body';
import { TabHeader } from './header';

@DefineCustomElements()
export class TabContainer extends HTMLElement {
	private readonly $header = new TabHeader();
	private readonly $body = new TabBody();

	constructor() {
		super();

		this.append(this.$header, this.$body);
	}

	async addTab(options: ITabConfig, position: number = -1) {
		const $newTab = await this.$header.addTab(options, position);
		const newTabId = __getTabId($newTab);

		this.$body.addTab(newTabId, options);
	}

	@DOMEvent({ eventName: 'switch', targetProperty: '$header', capture: true })
	protected onTabSwitch({ detail }: CustomEvent) {
		// console.log('--------switch', detail);
		this.$body.show = detail!;
	}

	@DOMEvent({ eventName: 'close', targetProperty: '$header', capture: true })
	protected onTabClose({ detail }: CustomEvent) {
		// console.log('--------close', detail);
		this.$body.deleteTab(detail);
	}

	@DOMEvent({})
	protected dragstart(e: DragEvent) {
		const data = attachMoreDndData(e.dataTransfer, { panelId: this.getAttribute('id')!, windowId: WindowId });
		if (!data) throw new Error('fatal, invalid program state!');

		if (data.tabs.every((e) => !e.detachable)) {
			markAllTabsUndetachable(e.dataTransfer);
		}
		for (const tab of data.tabs) {
			Object.assign(tab, this.$body.getTabConfig(tab.tabId));
		}
		attachMoreDndData(e.dataTransfer, { tabs: data.tabs });

		markPanelId(e.dataTransfer, this.getAttribute('id'));
	}

	@DOMEvent({})
	protected drop(e: DragEvent) {
		const data = parseDndData(e.dataTransfer)!;
		const targetTab = this.$header.findTab(e.target as HTMLElement);
		if (targetTab === undefined) {
			console.log('not drop to valid area (eg. border)');
			e.preventDefault();
			return;
		}

		if (data.panelId === this.getAttribute('id')) {
			if (checkPanelId(e.dataTransfer, this.getAttribute('id'))) {
				const isDropIntoHeader = e.composedPath().find((ele) => (ele as HTMLElement).tagName === 'TAB-HEADER');
				if (!isDropIntoHeader) {
					return;
				}
			}

			this.$header.moveTab(
				targetTab,
				data.tabs.map((tab) => tab.tabId)
			);
		} else {
			const index = targetTab ? this.$header.indexOf(targetTab) : -1;

			if (data.windowId !== WindowId) {
				closeTabInOtherWindow(
					data.windowId!,
					data.tabs.map((tab) => tab.tabId)
				);
			}

			data.tabs.forEach((options: any) => {
				this.addTab(options, index);
			});
		}
	}

	@DOMEvent({ eventName: ['dragenter', 'dragleave', 'dragover'], capture: true })
	protected filterThisDragDrop(e: DragEvent) {
		// console.log('denyThisDrag: kind=%s', getDndKind(e.dataTransfer));
		if (!hasDndData(e.dataTransfer)) {
			// console.log('[%s] deny unknown drop', e.type);
			e.stopPropagation();
			return false;
		}
		if (checkPanelId(e.dataTransfer, this.getAttribute('id'))) {
			// drop from self to self
			if (getDndKind(e.dataTransfer) === DragSourceKind.multi) {
				// console.log('[%s] deny multi drop to self', e.type);
				e.stopPropagation();
				return false;
			}
			e.dataTransfer!.dropEffect = 'copy';
		} else {
			if (checkAllTabsUndetachable(e.dataTransfer)) {
				// console.log('[%s] deny drop all undetachable tabs', e.type);
				e.stopPropagation();
				return false;
			}
			e.dataTransfer!.dropEffect = 'move';
		}
		e.preventDefault();
		return true;
		// console.log('allow drop: %s', e.target);
	}

	connectedCallback() {
		if (!this.hasAttribute('id')) {
			this.setAttribute('id', '_panel' + (Math.random() * 10000).toFixed(0));
		}
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
		// console.log('[%s] %s : %s => %s', this.constructor.name, name, _oldValue, _newValue);
		if (name === 'collapse') {
		} else if (name === 'direction') {
			DOMSetBooleanAttribute(this.$header, 'vertical', newValue === 'left' || newValue === 'right');
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	@GetterSetter(DOMGetterSetter.boolean) public declare collapse: boolean;
	@GetterSetter(DOMGetterSetter.enumerate(ViewDirection, ViewDirection.bottom))
	public declare direction: ViewDirection;
}
