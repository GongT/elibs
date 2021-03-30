import { IDisposable } from '@idlebox/common';
import { onDragDropFinished } from './dom-drag-global';

export function handleDragOverEvent(
	element: HTMLElement,
	enter: (ev: DragEvent) => void,
	leave: (ev: DragEvent) => void
): IDisposable {
	let dragHoverCount = 0;

	function dragenter(e: DragEvent) {
		// e.stopPropagation();

		dragHoverCount++;
		// console.log('drag enter', dragHoverCount);

		if (dragHoverCount === 1) {
			// console.log('drag enter', (e.target as any).tagName);
			element.classList.add('drop');
			enter.call(element, e);
		}
	}

	function dragleave(e: DragEvent) {
		// e.stopPropagation();

		dragHoverCount--;
		// console.log('drag leave', dragHoverCount, (e.target as any).tagName);

		if (dragHoverCount === 0) {
			reset(e);
		}
	}

	function reset(e: DragEvent) {
		element.classList.remove('drop');
		leave.call(element, e);
		dragHoverCount = 0;
	}

	const d = onDragDropFinished(reset);
	element.addEventListener('dragenter', dragenter, { capture: false });
	element.addEventListener('dragleave', dragleave, { capture: false });

	return {
		dispose() {
			element.removeEventListener('dragenter', dragenter, { capture: false });
			element.removeEventListener('dragleave', dragleave, { capture: false });
			d.dispose();
		},
	};
}
