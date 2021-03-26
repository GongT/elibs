import { DefineCustomElements } from '../common/custom-elements';
import { DOMGetterSetter, GetterSetter } from '../common/dom-getset';
import { __getTabId } from '../common/helper';
import { ITabBodyConfig } from '../common/type';
import { TabView } from './view';

@DefineCustomElements()
export class TabBody extends HTMLElement {
	private $last?: TabView;
	private readonly observer = new MutationObserver(this.updateChildStatus.bind(this));
	private childs: Record<number, TabView> = {};
	private cache: Record<number, ITabBodyConfig> = {};

	private _update() {
		const tabId = this.show;
		// console.log('_update:', v);
		let $next = tabId === 0 ? undefined : this.childs[tabId];
		if (!$next && this.cache[tabId]) {
			$next = this.realCreateInstance(tabId);
		}
		// console.log('$next =', $next);

		if ($next === this.$last) {
			// console.log('    same');
			return;
		}

		if (this.$last) {
			// console.log('    remove last open', this.$last);
			this.$last.open = false;
		}

		if ($next) {
			// console.log('    add next open [prev active=%s] %O', $next.open, $next);
			$next.open = true;
			this.$last = $next;
		} else {
			// console.log('    no next active');
			this.show = 0;
		}
	}

	private updateChildStatus() {
		const childs: Record<number, TabView> = {};
		for (let n = 0; n < this.children.length; n++) {
			const node = this.children.item(n)!;
			if (node.tagName === 'TAB-VIEW') {
				const id = __getTabId(node);
				childs[id] = node as TabView;
			}
		}
		this.childs = childs;
		// console.log('updateChildStatus:%s', Object.keys(childs).length);

		this._update();
	}

	disconnectedCallback() {
		// console.log('disconnectedCallback:%s', this.isConnected);
		for (const tab of Object.values<TabView>(this.childs)) {
			tab.disconnectedCallback();
		}
		this.observer.disconnect();
	}

	connectedCallback() {
		this.observer.observe(this, { childList: true });
	}

	addTab(tabId: number, config: ITabBodyConfig) {
		this.cache[tabId] = config;
	}

	getTabConfig(tabId: number): ITabBodyConfig | undefined {
		if (this.cache[tabId]) return this.cache[tabId];
		if (this.childs[tabId]) return this.childs[tabId].getState();
		return undefined;
	}

	private realCreateInstance(tabId: number) {
		const { renderFile, styleFile, dataset } = this.cache[tabId];
		delete this.cache[tabId];

		const newView = new TabView();

		newView.tabId = tabId;
		newView.renderFile = renderFile;
		if (styleFile) {
			newView.styleFile = styleFile;
		}
		if (dataset) {
			Object.assign(newView.dataset, dataset);
		}

		this.append(newView);
		return newView;
	}

	deleteTab(tabId: number) {
		if (this.cache[tabId]) {
			delete this.cache[tabId];
			return;
		}
		if (!this.childs[tabId]) {
			console.warn('remove not exists tab body: %s', tabId);
			return;
		}
		this.childs[tabId].remove();
	}

	attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null) {
		// console.log('[%s] %s : %s => %s', this.constructor.name, name, _oldValue, _newValue);
		if (name === 'show') {
			if (this.isConnected) {
				this._update();
			}
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	@GetterSetter(DOMGetterSetter.interger(0)) public declare show: number;
}
