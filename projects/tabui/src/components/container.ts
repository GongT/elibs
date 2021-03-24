import { DefineCustomElements } from '../common/custom-elements';
import { DOMEvent } from '../common/dom-event';
import { DOMGetterSetter, DOMSetBooleanAttribute, GetterSetter } from '../common/dom-getset';
import {
	attachMoreDndData,
	checkPanelId,
	DragSourceKind,
	getDndKind,
	hasDndData,
	markPanelId,
	parseDndData,
} from '../common/drag-and-drop';
import { __getTabId } from '../common/helper';
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
		attachMoreDndData(e.dataTransfer, { panelId: this.getAttribute('id')! });
		markPanelId(e.dataTransfer, this.getAttribute('id'));
	}

	@DOMEvent({ eventName: 'dragenter', capture: true })
	protected onDragEnter(e: DragEvent) {
		if (this.denyThisDrag(e)) return;
	}

	@DOMEvent({ capture: true })
	protected drop(e: DragEvent) {
		console.log('drop event:', e);
		if (this.denyThisDrag(e)) return;

		const tabs = parseDndData(e.dataTransfer)!.tabs;

		e.stopPropagation();
		this.insertDropTabs(e.target as any, tabs);
	}

	private insertDropTabs(from: HTMLElement, tabs: ReadonlyArray<Partial<ITabConfig>>) {
		for (let itr = from; itr.parentElement; itr = itr.parentElement) {
			if (itr.tagName === 'TAB-BODY' || itr.tagName === 'TAB-MENU') {
				tabs.forEach((options: any) => this.addTab(options));
				return;
			} else if (itr.tagName === 'TAB-SWITCH') {
				const index = this.$header.indexOf(itr);
				tabs.forEach((options: any) => this.addTab(options, index));
				return;
			}
		}

		throw new Error('DOM structure wrong.');
	}

	private denyThisDrag(e: DragEvent) {
		// console.log('ContainerDragEnter: kind=%s', getDndKind(e.dataTransfer));
		if (!hasDndData(e.dataTransfer)) {
			e.stopImmediatePropagation();
			return true;
		}
		if (
			getDndKind(e.dataTransfer) === DragSourceKind.multi &&
			checkPanelId(e.dataTransfer, this.getAttribute('id'))
		) {
			// console.log('deny drop to self');
			e.stopImmediatePropagation();
			return true;
		}
		e.preventDefault();
		return false;
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
