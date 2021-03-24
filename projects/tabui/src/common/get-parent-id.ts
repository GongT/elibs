export function getParentContainerId(self: HTMLElement): string {
	for (let itr = self.parentElement; itr; itr = itr.parentElement) {
		if (itr.nodeName === 'TAB-CONTAINER') {
			return itr.id;
		}
	}
	return '';
}
