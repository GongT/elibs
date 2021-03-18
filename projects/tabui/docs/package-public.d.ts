/// <reference lib="dom" />
import { EventRegister } from '@idlebox/common';
import { IDisposable } from '@idlebox/common';
import type { MenuItemConstructorOptions } from 'electron';

export declare const defauleValueMetaKey = "propertyDefault";

export declare function DefineCustomElements(options?: ElementDefinitionOptions): <T extends {
    new (): HTMLElement;
    prototype: HTMLElement;
}>(elementConstructor: T) => void;

export declare function DOMEvent({ eventName, preventDefault, stopPropagation, targetProperty, targetSelector, target: $target, }?: Partial<IEventRegisterOptions>): <T extends HTMLElement>(target: T, propertyKey: string) => void;

export declare const domEventInitMetaKey: unique symbol;

export declare namespace DOMGetterSetter {
    const interger: Required<Pick<IGetterSetter<any, number>, "get" | "set">> & WithDefaultCreator<number>;
    const boolean: Required<Pick<IGetterSetter<any, boolean>, "get" | "set">> & WithDefaultCreator<boolean>;
    const string: Required<Pick<IGetterSetter<any, string>, "get" | "set">> & WithDefaultCreator<string>;
    export function enumerate<K extends string>(list: Record<K, string>, defaultValue: K): {
        get(value: K | null): string;
        set(value: K): Record<K, string>[K] | null;
        init(): Record<K, string>[K];
    };
}

export declare function DOMSetAttribute(dom: HTMLElement, qualifiedName: string, value: string | null): void;

export declare function getCustomProperties<T>(instance: T): keyof T;

export declare function GetterSetter<ELE extends HTMLElement, T>({ get, set, init }?: IGetterSetter<ELE, T>): (target: ELE, propertyKey: string | symbol) => void;

export declare const getterSetterMetaKey = "gettersetter";

declare interface IEventRegisterOptions {
    eventName: string;
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

export declare interface IPanelMenuRequest {
    id: string;
    x: number;
    y: number;
}

export declare enum IPCID {
    GetApplicationId = "get.app.id",
    GetNextTabGuid = "get.tab.guid",
    PanelMenu = "show.panel.menu",
    TabMenu = "show.tab.menu"
}

declare interface IRenderFunction {
    (root: ShadowRoot): IDisposable;
}

export declare interface ITabConfig {
    title: string;
    iconClass?: string;
    iconUrl?: string;
    closable: boolean;
    detachable: boolean;
    movable: boolean;
}

export declare interface ITabMenuRequest {
    guid: number;
    menu: MenuItemConstructorOptions[];
    x: number;
    y: number;
}

export declare function loadStyle(): void;

export declare function rendererInvoke(action: IPCID, ...param: any[]): Promise<any>;

export declare class TabBody extends HTMLElement {
    private readonly $spacer;
    private $last?;
    private readonly observer;
    private childs;
    constructor();
    onTitleBarDragStart({ dataTransfer, offsetX: x, offsetY: y }: DragEvent): void;
    protected contextmenu({ x, y }: MouseEvent): void;
    addTab(options: ITabConfig): TabSwitch;
    attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void;
    private _update;
    private updateChildStatus;
    disconnectedCallback(): void;
    connectedCallback(): void;
    value: number;
}

export declare class TabContainer extends HTMLElement {
    direction: ViewDirection;
    constructor();
    addTab(): void;
}

export declare class TabHeader extends HTMLElement {
    private readonly $spacer;
    private $last?;
    private readonly observer;
    private childs;
    constructor();
    onTitleBarDragStart({ dataTransfer, offsetX: x, offsetY: y }: DragEvent): void;
    protected contextmenu({ x, y }: MouseEvent): void;
    addTab(options: ITabConfig): TabSwitch;
    attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void;
    private _update;
    private updateChildStatus;
    disconnectedCallback(): void;
    connectedCallback(): void;
    value: number;
}

export declare class TabMenu extends HTMLElement {
    private $button;
    constructor();
    onButtonClick({ x, y }: MouseEvent): void;
}

export declare class TabSwitch extends HTMLElement {
    readonly panelId: number;
    private readonly $iconImg;
    private readonly $title;
    private readonly $closeButton;
    private readonly dispoables;
    private readonly _onDragStart;
    readonly onDragStart: EventRegister<string>;
    private fixedMenu;
    private options;
    private mouseDownEnabled;
    constructor();
    protected dragstart({ preventDefault, dataTransfer, offsetX: x, offsetY: y }: DragEvent): void;
    protected contextmenu({ x, y }: MouseEvent): void;
    protected onCloseButtonClick(): void;
    protected mousedown(e: MouseEvent): void;
    private mouseup;
    connectedCallback(): void;
    disconnectedCallback(): void;
    dispose(): void;
    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void;
    closable: boolean;
    detachable: boolean;
    movable: boolean;
    active: boolean;
    width: string;
    iconUrl: string;
    iconClass: string;
    title: string;
}

export declare class TabUI {
    constructor();
}

export declare class TabView extends HTMLElement {
    private firstRender;
    private disposeRender?;
    render?: IRenderFunction;
    constructor();
    private _render;
    dispose(): void;
    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void;
    open: boolean;
}

declare enum ViewDirection {
    left = "left",
    right = "right",
    top = "top",
    bottom = "bottom"
}

declare interface WithDefaultCreator<T> {
    (defVal: T): Required<IGetterSetter<any, T>>;
}

export { }
