/**
 * @internal
 */
export function __defineTabId(sw: Element, value: number) {
	sw.setAttribute('tabId', value.toFixed(0));
	Object.defineProperty(sw, 'tabId', {
		configurable: false,
		writable: false,
		enumerable: true,
		value,
	});
}

/**
 * @internal
 */
export function __getTabId(sw: Element): number {
	const r = (sw as any).tabId;

	if (!r) {
		console.error('invalid state: no tabId on element', sw);
		throw new Error('invalid state: no tabId on element');
	}
	return r;
}

/**
 * @internal
 */
export function definePublicConstant(object: any, propertyKey: string | symbol, value: any) {
	delete object[propertyKey];
	Object.defineProperty(object, propertyKey, {
		configurable: false,
		enumerable: true,
		writable: false,
		value,
	});
}
