import { definePublicConstant, linux_case_hyphen } from '@idlebox/common';
import { customElementInitStateSymbol } from '@gongt/symbols/lib';
import { defauleValueMetaKey, domSetAttribute, getterSetterMetaKey } from '../dom/dom-getset';
import { callLifecycleCallbacks, disposeLifecycle, registerLifecycle } from './custom-lifecycle';

const firstMountSymbol = Symbol('custom-element-first-connect');

/**
 * 判断CustomElement是否是第一次挂载到dom
 * @public
 */
export function isFirstMount(ele: HTMLElement) {
	return (ele as any)[firstMountSymbol] === undefined;
}

/**
 * 注册CustomElement
 * @public
 */
export function DefineCustomElements(options?: ElementDefinitionOptions) {
	return function DefineCustomElementsDecorator(elementConstructor: typeof HTMLElement) {
		const anyCtor = elementConstructor as any;
		const proto = elementConstructor.prototype;
		const anyProto = proto as any;
		const name = linux_case_hyphen(elementConstructor.name);
		// console.log('define:%s', name, options);

		///[*] changing native behavior
		if (anyProto.attributeChangedCallback) {
			const orignal = anyProto.attributeChangedCallback;
			anyProto.attributeChangedCallback = function wrappedAttributeChangedCallback(
				name: string,
				ov: any,
				nv: any
			) {
				// console.log('[%s] %s : %s{%s} => %s{%s}', elementConstructor.name, name, ov, typeof ov, nv, typeof nv);
				if (ov !== nv) {
					orignal.call(this, name, ov, nv);
				}
			};
		}

		///[*] CustomKeys - from dom-getset
		const customValueKeys: string[] | undefined = Reflect.getMetadata(getterSetterMetaKey, proto);
		const originalCustomValueKeys = anyCtor.observedAttributes || [];
		Object.defineProperty(elementConstructor, 'observedAttributes', {
			configurable: false,
			enumerable: true,
			writable: false,
			value: originalCustomValueKeys.concat(customValueKeys || []),
		});
		// console.log(anyCtor.observedAttributes);

		///[*] CustomKeys (default value) - from dom-getset
		const customValueDefaults: Record<string, Function> | undefined = Reflect.getMetadata(
			defauleValueMetaKey,
			proto
		);
		if (customValueKeys && (customValueDefaults || anyProto.attributeChangedCallback)) {
			registerLifecycle(proto, function (this: HTMLElement) {
				if (!isFirstMount(this)) return;

				for (const key of customValueKeys) {
					if (!this.hasAttribute(key)) {
						if (customValueDefaults && customValueDefaults[key]) {
							domSetAttribute(this, key, customValueDefaults[key].call(this));
						} else if ((this as any).attributeChangedCallback) {
							(this as any).attributeChangedCallback.call(this, key, customElementInitStateSymbol, null);
						}
					}
				}
			});
		}

		///[*] Connect Callback - from custom-lifecycle
		const originalConnectedCallback: () => undefined = anyProto.connectedCallback;
		if (originalConnectedCallback) {
			registerLifecycle(proto, originalConnectedCallback);
			delete anyProto.connectedCallback;
		}
		definePublicConstant(proto, 'connectedCallback', function connectedCallback(this: HTMLElement) {
			const anyThis = this as any;
			if (!this.isConnected) {
				anyThis.disconnectedCallback();
				return;
			}

			callLifecycleCallbacks(this);

			anyThis[firstMountSymbol] = false;
		});

		///[*] Disconnect Callback - from custom-lifecycle
		const originalDisconnectedCallback: Function = (proto as any).disconnectedCallback;
		definePublicConstant(proto, 'disconnectedCallback', function disconnectedCallback(this: HTMLElement) {
			if (originalDisconnectedCallback) originalDisconnectedCallback.call(this);
			disposeLifecycle(this);
		});

		///[*] Final register to window - must last line
		customElements.define(name, elementConstructor, options);
	};
}
