import { IDisposable } from '@idlebox/common';
import { DefineCustomElements } from '../common/custom-elements';
import { DOMInit } from '../common/custom-lifecycle';
import { handleDragOverEvent } from '../common/dom-drag-over';
import { DOMEvent } from '../common/dom-event';
import { DOMGetterSetter, GetterSetter } from '../common/dom-getset';
import { IPanelMenuRequest, IPCID } from '../common/ipc.id';
import { rendererInvoke } from '../common/ipc.renderer';
import { TabDropZone } from './dropzone';

const svgMenu = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
	<path d="M0 0h48v48h-48z" fill="none"/>
	<path d="M6 36h36v-4h-36v4zm0-10h36v-4h-36v4zm0-14v4h36v-4h-36z"/>
</svg>`;

const svgLeftArrow = `<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>`;
const svgRightArrow = `<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>`;

@DefineCustomElements()
export class TabMenu extends HTMLElement {
	private readonly $spacer = document.createElement('span') as HTMLSpanElement;
	private readonly $button = document.createElement('button') as HTMLButtonElement;
	private readonly $scrollLeft = document.createElement('button') as HTMLButtonElement;
	private readonly $scrollRight = document.createElement('button') as HTMLButtonElement;

	constructor() {
		super();

		this.$spacer.className = 'spacer';

		this.$scrollLeft.innerHTML = svgLeftArrow;
		this.$scrollRight.innerHTML = svgRightArrow;
		this.$button.innerHTML = svgMenu;

		this.$scrollLeft.className = 'left';
		this.$scrollRight.className = 'right';

		const $vparent = document.createElement('div');
		$vparent.className = 'vparent';

		const $vchild = document.createElement('div');
		$vchild.className = 'vchild';

		$vchild.append(this.$scrollLeft, this.$scrollRight, this.$button);
		$vparent.append($vchild);
		this.append(this.$spacer, $vparent);
	}

	@DOMInit()
	protected onMounted(): IDisposable {
		return handleDragOverEvent(this, this.handleDragEnter, this.handleDragLeave);
	}

	private handleDragEnter() {
		TabDropZone.get().attachElement(this);
	}

	@DOMEvent({ eventName: 'drop', capture: true })
	private handleDragLeave() {
		TabDropZone.get().detachElement(this);
	}

	@DOMEvent({ targetProperty: '$spacer', preventDefault: true })
	protected contextmenu({ x, y }: MouseEvent) {
		rendererInvoke(IPCID.PanelMenu, { id: this.id, x, y } as IPanelMenuRequest);
	}

	@DOMEvent({ stopPropagation: true, eventName: 'click', targetProperty: '$button' })
	onButtonClick({ x, y }: MouseEvent) {
		rendererInvoke(IPCID.PanelMenu, { id: this.id, x, y } as IPanelMenuRequest);
	}

	@DOMEvent({ stopPropagation: true, eventName: 'click', targetProperty: '$scrollLeft' })
	onLeftClick() {
		const eve = new CustomEvent('scroll', { detail: '-' });
		this.dispatchEvent(eve);
	}

	@DOMEvent({ stopPropagation: true, eventName: 'click', targetProperty: '$scrollRight' })
	onRightClick() {
		const eve = new CustomEvent('scroll', { detail: '+' });
		this.dispatchEvent(eve);
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
		// console.log('[%s] %s : %s => %s', this.constructor.name, name, _oldValue, newValue);
		if (name === 'scroll-visible') {
			const bVal = DOMGetterSetter.boolean.get(newValue);
			if (bVal) {
				this.$scrollLeft.classList.remove('hide');
				this.$scrollRight.classList.remove('hide');
			} else {
				this.$scrollLeft.classList.add('hide');
				this.$scrollRight.classList.add('hide');
			}
		} else {
			console.warn('Unknown change key: %s', name);
		}
	}

	@GetterSetter(DOMGetterSetter.boolean) public declare scrollVisible: boolean;
}
