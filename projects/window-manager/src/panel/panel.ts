import { Disposable } from '@idlebox/common';

import { IPanel } from './panelRegistry';

export class Panel extends Disposable {
	constructor(private readonly info: IPanel) {
		super();
	}
}
