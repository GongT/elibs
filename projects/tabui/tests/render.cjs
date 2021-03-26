const React = require('react');
const { render, unmountComponentAtNode } = require('react-dom');
const { humanDate } = require('@idlebox/common');

exports.render = function renderTab(com) {
	console.log('render call: [%s] %o', com.tabId, com.dataset);

	if (com.dataset.timer) {
		render(React.createElement(TimerComponent, {}), com.rootElement);
	} else {
		render(React.createElement(TestComponent, { message: com.tabId.toString() }), com.rootElement);
	}

	return {
		dispose() {
			unmountComponentAtNode(com.rootElement);
		},
	};
};

class TestComponent extends React.PureComponent {
	render() {
		return React.createElement('div', { style: { padding: '3px' } }, [
			React.createElement('span', { key: 1 }, 'Hello, this render by react, '),
			React.createElement('span', { key: 2, style: { background: 'white' } }, this.props.message),
		]);
	}
}

class TimerComponent extends React.PureComponent {
	state = { s: 0 };

	componentWillUnmount() {
		clearInterval(this.tmr);
	}

	componentDidMount() {
		this.tmr = setInterval(() => {
			this.setState({ s: Date.now() });
		}, 1000);
	}

	render() {
		return React.createElement('div', { style: { padding: '3px' } }, humanDate.datetime(this.state.s));
	}
}
