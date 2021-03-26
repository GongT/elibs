import { IDisposable } from '@idlebox/common';
import { IDragEvent, IDragHandler } from './dom-drag-global';

const draggingMySelf = Symbol('draggingMySelf');

export function handleDragAwayEvent(element: HTMLElement, away: IDragHandler, done: IDragHandler): IDisposable {
	function dragstart(e: DragEvent) {
		if (!e.dataTransfer) {
			debugger;
			return;
		}

		(element as any)[draggingMySelf] = true;
		e.dataTransfer.clearData();
		element.classList.add('drag');
		away.call(element, e as IDragEvent);
	}

	function dragend(e: DragEvent) {
		(element as any)[draggingMySelf] = false;
		element.classList.remove('drag');
		done.call(element, e as IDragEvent);
	}

	element.addEventListener('dragstart', dragstart, { capture: false });
	element.addEventListener('dragend', dragend, { capture: false });

	return {
		dispose() {
			element.removeEventListener('dragstart', dragstart, { capture: false });
			element.removeEventListener('dragend', dragend, { capture: false });
		},
	};
}

export function isElementDragAway(element: Element | null): boolean;
export function isElementDragAway(element: any) {
	return element?.[draggingMySelf];
}
