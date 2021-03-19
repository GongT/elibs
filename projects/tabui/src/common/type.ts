export interface ITabConfig {
	title?: string;
	iconClass?: string;
	iconUrl?: string;
	closable?: boolean;
	detachable?: boolean;
	movable?: boolean;
}

export enum ViewDirection {
	left = 'left',
	right = 'right',
	top = 'top',
	bottom = 'bottom',
}
