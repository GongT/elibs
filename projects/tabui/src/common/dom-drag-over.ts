import { IDisposable } from '@idlebox/common';

export function handleDragOverEvent(
	element: HTMLElement,
	enter: (ev: DragEvent) => void,
	leave: (ev: DragEvent) => void
): IDisposable {
	let dragHoverCount = 0;
	function dragenter(e: DragEvent) {
		e.stopPropagation();
		e.preventDefault();

		dragHoverCount++;

		if (dragHoverCount === 1) {
			element.classList.add('drop');
			enter.call(element, e);
		}
		// console.log('drag enter', this.dragHoverCount, (e.target as any).tagName);
	}

	function dragleave(e: DragEvent) {
		e.stopPropagation();

		dragHoverCount--;
		// console.log('drag leave', this.dragHoverCount, (e.target as any).tagName);

		if (dragHoverCount === 0) {
			element.classList.remove('drop');
			leave.call(element, e);
		}
	}

	element.addEventListener('dragenter', dragenter, { capture: false });
	element.addEventListener('dragleave', dragleave, { capture: false });

	return {
		dispose() {
			element.removeEventListener('dragenter', dragenter, { capture: false });
			element.removeEventListener('dragleave', dragleave, { capture: false });
		},
	};
}
