import { IDisposable } from '@idlebox/common';
import { DefineCustomElements } from '../common/custom-elements';
import { DOMGetterSetter, GetterSetter } from '../common/dom-getset';
import { __defineTabId, __getTabId } from '../common/helper';
import { IMainRenderFunction, ITabConfig } from '../common/type';
import { IRenderEventData, TabView } from './view';

@DefineCustomElements()
export class TabBody extends HTMLElement {
	private $last?: Element;
	private readonly observer = new MutationObserver(this.updateChildStatus.bind(this));
	private childs: Record<number, TabView> = {};

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

	private _update() {
		const v = this.show;
		// console.log('_update:', v);
		const $next = v === 0 ? undefined : this.childs[v];
		// console.log('$next =', $next);

		if ($next === this.$last) {
			// console.log('    same');
			return;
		}

		if (this.$last) {
			// console.log('    remove last open', this.$last);
			this.$last.removeAttribute('open');
		}
		if ($next) {
			// console.log('    add next open', $next);
			$next.setAttribute('open', '');
			this.$last = $next;
		} else if (v !== 0) {
			console.warn('select invalid tab index: %s (valid is: %s)', v, Object.keys(this.childs));
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
		// console.log('updateChildStatus:%s', childs.length);
	}

	disconnectedCallback() {
		// console.log('disconnectedCallback:%s', this.isConnected);
		for (const tab of Object.values<TabView>(this.childs)) {
			tab.removeRender();
		}
		this.observer.disconnect();
	}

	connectedCallback() {
		this.observer.observe(this, { childList: true });
	}

	addTab(tabId: number, { render, ...options }: ITabConfig) {
		const newView = new TabView();

		let dis: IDisposable;
		let renderFn: IMainRenderFunction;
		if (typeof render === 'string') {
			renderFn = require(render).render;
		} else {
			renderFn = render;
		}

		__defineTabId(newView, tabId);
		newView.addEventListener('render', (e: any) => {
			const { root } = (e as CustomEvent).detail as IRenderEventData;

			dis = renderFn(tabId, root, options, (e.target as HTMLElement).dataset);

			if (!dis || !dis.dispose) {
				throw new Error('render function not return disposable object');
			}
			e.preventDefault();
			e.stopPropagation();
		});
		newView.addEventListener('dispose', () => {
			console.log('dispose call!');
			dis.dispose();
		});

		this.append(newView);
		return newView;
	}

	deleteTab(tabId: number) {
		this.childs[tabId].remove();
	}

	@GetterSetter(DOMGetterSetter.interger(0)) public declare show: number;
}
