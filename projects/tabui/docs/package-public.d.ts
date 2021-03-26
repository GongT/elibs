/// <reference lib="dom" />
import { IDisposable } from '@idlebox/common';
import type { MenuItemConstructorOptions } from 'electron';

export declare let ApplicationId: string;

export declare function attachMoreDndData(dataTransfer: null | DataTransfer, moreData: Partial<IDndData>): void;

export declare function checkPanelId(dataTransfer: null | DataTransfer, id: string | null): boolean;

export declare const defauleValueMetaKey = "propertyDefault";

export declare function DefineCustomElements(options?: ElementDefinitionOptions): (elementConstructor: typeof HTMLElement) => void;

export declare function disposeLifecycle(target: HTMLElement): void;

export declare function disposeOnDetach(target: HTMLElement, d: IDisposable): void;

export declare let DND_TYPE_ID: string;

export declare const DND_TYPE_ID_BASE = "tabui-drag-tab";

export declare function DOMEvent({ eventName, preventDefault, stopPropagation, capture, once, passive, targetProperty, targetSelector, target: $target, }?: Partial<IEventRegisterOptions>): <T extends HTMLElement>(target: T, propertyKey: string) => void;

export declare function DOMEventTrigger<T>(eventInit?: ICustomEventInit): (self: HTMLElement, propKey: string) => void;

export declare interface DOMEventTrigger<T> {
    (e: T): boolean;
}

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

export declare function DOMInit(singleTime?: boolean): (target: HTMLElement, propKey: string) => void;

export declare function DOMSetAttribute(dom: HTMLElement, qualifiedName: string, value: string | null): void;

export declare function DOMSetBooleanAttribute(dom: HTMLElement, qualifiedName: string, value: boolean): void;

export declare enum DragSourceKind {
    single = "single",
    multi = "multi"
}

export declare function getCustomProperties<T>(instance: T): keyof T;

export declare function getDndKind(dataTransfer: null | DataTransfer): DragSourceKind | undefined;

export declare function getParentContainerId(self: HTMLElement): string;

export declare function GetterSetter<ELE extends HTMLElement, T>({ get, set, init }?: IGetterSetter<ELE, T>): (target: ELE, propertyKey: string | symbol) => void;

export declare const getterSetterMetaKey = "gettersetter";

export declare function handleDragOverEvent(element: HTMLElement, enter: (ev: DragEvent) => void, leave: (ev: DragEvent) => void): IDisposable;

export declare function hasDndData(dataTransfer: null | DataTransfer): boolean;

export declare interface ICustomEventInit extends EventInit {
    eventName?: string;
    targetProperty?: string;
    targetSelector?: string;
    target?: Window | HTMLElement;
}

export declare interface IDndData {
    applicationId?: string;
    panelId?: string;
    tabs: ReadonlyArray<Readonly<Partial<ITabConfig> & {
        tabId: number;
    }>>;
}

declare interface IEventRegisterOptions {
    capture: boolean;
    once: boolean;
    passive: boolean;
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

export declare interface IMainRenderFunction {
    (tabId: number, dom: ShadowRoot, options: ITabHeaderConfig, dataset: Readonly<DOMStringMap>): IDisposable;
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

export declare interface IRenderEventData {
    root: ShadowRoot;
}

export declare function isFirstMount(ele: HTMLElement): boolean;

export declare interface ITabConfig extends ITabHeaderConfig {
    render: string | IMainRenderFunction;
}

export declare interface ITabHeaderConfig {
    title?: string;
    iconClass?: string;
    iconUrl?: string;
    closable?: boolean;
    detachable?: boolean;
    movable?: boolean;
}

export declare interface ITabMenuRequest {
    guid: number;
    menu: MenuItemConstructorOptions[];
    x: number;
    y: number;
}

export declare function loadStyle(): void;

export declare function markPanelId(dataTransfer: null | DataTransfer, id: string | null): void;

export declare function parseDndData(dataTransfer: null | DataTransfer): IDndData | undefined;

export declare function registerLifecycle(targetPrototype: HTMLElement, callback: () => IDisposable | void): void;

export declare function rendererInvoke(action: IPCID, ...param: any[]): Promise<any>;

export declare function serializeRenderFunction(render: ITabConfig['render']): string;

export declare function setDndData(dataTransfer: null | DataTransfer, data: IDndData, kind: DragSourceKind): void;

export declare class TabBody extends HTMLElement {
    private $last?;
    private readonly observer;
    private childs;
    attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void;
    private _update;
    private updateChildStatus;
    disconnectedCallback(): void;
    connectedCallback(): void;
    addTab(tabId: number, { render, ...options }: ITabConfig): TabView;
    deleteTab(tabId: number): void;
    show: number;
}

export declare class TabContainer extends HTMLElement {
    private readonly $header;
    private readonly $body;
    constructor();
    addTab(options: ITabConfig, position?: number): Promise<void>;
    protected onTabSwitch({ detail }: CustomEvent): void;
    protected onTabClose({ detail }: CustomEvent): void;
    protected dragstart(e: DragEvent): void;
    protected onDragEnter(e: DragEvent): void;
    protected drop(e: DragEvent): void;
    private insertDropTabs;
    private denyThisDrag;
    connectedCallback(): void;
    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void;
    collapse: boolean;
    direction: ViewDirection;
}

export declare class TabDropZone extends HTMLElement {
    private currentTarget?;
    static get(): TabDropZone;
    detachElement(anotherElement: HTMLElement): void;
    attachElement(anotherElement: HTMLElement): void;
    private _applyPosition;
}

export declare class TabHeader extends HTMLElement {
    private readonly $scroller;
    private readonly $menu;
    private readonly childsChangeObserver;
    private readonly spaceResizeObserver;
    private childs;
    private $last?;
    private lastSelectIndex;
    constructor();
    onTitleBarDragStart({ target, dataTransfer, offsetX: x, offsetY: y }: DragEvent): void;
    protected onTabSwitch({ detail }: CustomEvent): void;
    private lastOverflow;
    private resizeHandler;
    protected onTabScrollByWheel(e: WheelEvent): void;
    protected onTabScroll({ detail: direction }: CustomEvent): void;
    private _update;
    private updateChildStatus;
    disconnectedCallback(): void;
    connectedCallback(): void;
    addTab(options: ITabConfig, position?: number): Promise<TabSwitch>;
    setScroll(pos: number): void;
    indexOf(itr: HTMLElement): number;
    attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void;
    select: number;
    vertical: boolean;
}

export declare class TabMenu extends HTMLElement {
    private readonly $spacer;
    private readonly $button;
    private readonly $scrollLeft;
    private readonly $scrollRight;
    constructor();
    protected onMounted(): IDisposable;
    private handleDragEnter;
    private handleDragLeave;
    protected contextmenu({ x, y }: MouseEvent): void;
    onButtonClick({ x, y }: MouseEvent): void;
    onLeftClick(): void;
    onRightClick(): void;
    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void;
    scrollVisible: boolean;
}

export declare class TabSwitch extends HTMLElement {
    readonly tabId: number;
    private readonly $iconImg;
    private readonly $title;
    private readonly $closeButton;
    private fixedMenu;
    private options;
    private mouseDownEnabled;
    private draggingMySelf;
    constructor();
    protected dragend(): void;
    protected dragstart(e: DragEvent): void;
    getState(): ITabHeaderConfig & {
        tabId: number;
        dataset: DOMStringMap;
    };
    protected contextmenu({ x, y }: MouseEvent): void;
    protected onCloseButtonClick(): void;
    protected onClick(): void;
    protected mousedown(e: MouseEvent): void;
    private mouseup;
    protected onMounted(): IDisposable;
    private handleDragEnter;
    private handleDragLeave;
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
    private _shadowRoot?;
    private renderState;
    constructor();
    private _render;
    disconnectedCallback(): void;
    removeRender(): void;
    private _removeRender;
    attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void;
    open: boolean;
    private renderEvent;
    private disposeEvent;
}

export declare enum ViewDirection {
    left = "left",
    right = "right",
    top = "top",
    bottom = "bottom"
}

declare interface WithDefaultCreator<T> {
    (defVal: T): Required<IGetterSetter<any, T>>;
}

export { }
