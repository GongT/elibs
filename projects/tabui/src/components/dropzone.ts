import { DefineCustomElements } from '../common/custom-elements';
import { ViewDirection } from '../common/type';
import { TabContainer } from './container';

let weakRef: WeakRef<TabDropZone>;

@DefineCustomElements()
export class TabDropZone extends HTMLElement {
	private currentTarget?: HTMLElement;

	static get() {
		if (weakRef) {
			const exists = weakRef.deref();
			if (exists) {
				return exists;
			}
		}

		const ele = new TabDropZone();
		ele.id = 'tabui-drop-zone';
		weakRef = new WeakRef(ele);
		return ele;
	}

	detachElement(anotherElement: HTMLElement) {
		if (this.isConnected && this.currentTarget === anotherElement) this.remove();
	}

	attachElement(anotherElement: HTMLElement) {
		// console.log('attachElement %O', anotherElement);
		this.currentTarget = anotherElement;
		for (let itr = anotherElement.parentElement; itr; itr = itr!.parentElement) {
			if (itr.tagName === 'TAB-CONTAINER') {
				const dir = (itr as TabContainer).direction;
				const isVertical = dir === ViewDirection.left || dir === ViewDirection.right;

				const base = document.querySelector('html')!.getBoundingClientRect();
				const location = anotherElement.getBoundingClientRect();

				return this._applyPosition(
					isVertical,
					new DOMRect(location.x - base.x, location.y - base.y, location.width, location.height)
				);
			}
		}
		throw new Error('failed find <tab-container />');
	}

	private _applyPosition(isVertical: boolean, position: DOMRect) {
		this.style.left = position.x - 2 + 'px';
		this.style.top = position.y - 2 + 'px';
		if (isVertical) {
			this.style.width = position.width + 4 + 'px';
			this.style.height = '0';
			this.classList.add('top');
			this.classList.remove('left');
		} else {
			this.style.height = position.height + 4 + 'px';
			this.style.width = '0';
			this.classList.add('left');
			this.classList.remove('top');
		}
		if (!this.isConnected) document.body.append(this);
	}
}
