import { EventRegister } from '@idlebox/common';
import { IDisposable } from '@idlebox/common';

export declare const defauleValueMetaKey = "propertyDefault";

/**
 * 注册CustomElement
 * @public
 */
export declare function DefineCustomElements(options?: ElementDefinitionOptions): (elementConstructor: typeof HTMLElement) => void;

/**
 * 把动态取消挂载过程注册到CustomElement对象上
 * @public
 */
export declare function disposeOnDomDetach(target: HTMLElement, d: IDisposable): void;

export declare namespace domConvert {
    const interger: Required<Pick<IGetterSetter<any, number>, "get" | "set">> & WithDefaultCreator<number>;
    const boolean: Required<Pick<IGetterSetter<any, boolean>, "get" | "set">> & WithDefaultCreator<boolean>;
    const string: Required<Pick<IGetterSetter<any, string>, "get" | "set">> & WithDefaultCreator<string>;
    export function enumerate<K extends string>(list: Record<K, string>, defaultValue: K): {
        get(value: K | null): string;
        set(value: K): Record<K, string>[K] | null;
        init(): Record<K, string>[K];
    };
}

export declare function DOMEvent({ eventName, preventDefault, stopPropagation, capture, once, passive, targetProperty, targetSelector, target: $target, }?: Partial<IEventRegisterOptions>): <T extends HTMLElement>(target: T, propertyKey: string) => void;

export declare function DOMEventTrigger<T>(eventInit?: ICustomEventInit): (self: HTMLElement, propKey: string) => void;

export declare interface DOMEventTrigger<T> {
    (e: T): boolean;
}

export declare function DOMGetSet<ELE extends HTMLElement, T>({ get, set, init }?: IGetterSetter<ELE, T>): (target: ELE, propertyKey: string | symbol) => void;

/**
 * 修饰方法，挂载时执行，返回IDisposable，取消挂载时销毁
 * @public
 */
export declare function DOMOnAttach(singleTime?: boolean): (target: HTMLElement, propKey: string) => void;

export declare function domSetAttribute(dom: HTMLElement, qualifiedName: string, value: string | null): void;

export declare function domSetBooleanAttribute(dom: HTMLElement, qualifiedName: string, value: boolean): void;

export declare function getCustomPropertyKeys<T>(instance: T): keyof T;

export declare const getterSetterMetaKey = "gettersetter";

export declare function handleDragAwayEvent(element: HTMLElement, away: IDragHandler, done: IDragHandler): IDisposable;

export declare function handleDragOverEvent(element: HTMLElement, enter: (ev: DragEvent) => void, leave: (ev: DragEvent) => void): IDisposable;

export declare interface ICustomEventInit extends EventInit {
    eventName?: string;
    targetProperty?: string;
    targetSelector?: string;
    target?: Window | HTMLElement;
}

export declare interface IDragEvent extends MouseEvent {
    dataTransfer: DataTransfer;
}

export declare type IDragHandler = (ev: IDragEvent) => void;

declare interface IEventRegisterOptions {
    capture: boolean;
    once: boolean;
    passive: boolean;
    eventName: string | string[];
    stopPropagation: boolean;
    preventDefault: boolean;
    targetProperty: string;
    targetSelector: string;
    target: Window | HTMLElement;
}

declare interface IGetterSetter<TSelf, TType> {
    get?(this: TSelf, value: string | null): TType;
    set?(value: TType): string | null;
    init?(): string | null;
}

export declare function isElementDragAway(element: Element | null): boolean;

/**
 * 判断CustomElement是否是第一次挂载到dom
 * @public
 */
export declare function isFirstMount(ele: HTMLElement): boolean;

export declare const onDragDropFinished: EventRegister<IDragEvent>;

/**
 * 把静态取消挂载过程注册到CustomElement的prototype上
 * @public
 */
export declare function registerLifecycle(targetPrototype: HTMLElement, callback: () => IDisposable | void): void;

declare interface WithDefaultCreator<T> {
    (defVal: T): Required<IGetterSetter<any, T>>;
}

export { }
