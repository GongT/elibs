import { addDisposableEventListener, Emitter, EventRegister, registerGlobalLifecycle } from '@idlebox/common';

export interface IDragEvent extends MouseEvent {
	dataTransfer: DataTransfer;
}
export type IDragHandler = (ev: IDragEvent) => void;

/** @internal */
export const globalDragDropEndEvent = new Emitter<IDragEvent>();

registerGlobalLifecycle(globalDragDropEndEvent);

export const onDragDropFinished: EventRegister<IDragEvent> = globalDragDropEndEvent.register;

registerGlobalLifecycle(
	addDisposableEventListener(window, 'drop', { capture: false }, (e: IDragEvent) => {
		globalDragDropEndEvent.fire(e);
	})
);
