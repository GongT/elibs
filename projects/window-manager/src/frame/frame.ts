import { SimpleTypes } from '../global';
import { Cursor } from 'baobab';
import { IPanelData } from '../panel/panelRegistry';

export class FrameTree {
	constructor(private readonly store: Cursor) {}
}

interface IFrameContainerNode {
	children: (IFrameLeafNode | IFrameContainerNode)[];
	direction: 'row' | 'col';
	size: number[];
}
interface IFrameLeafNode {
	panelList: IPanelData[];
	current: number;
}
