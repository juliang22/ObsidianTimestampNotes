import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { YTContainer } from "../YTContainer"

export const VIEW_TYPE_EXAMPLE = "example-view";
export class ExampleView extends ItemView {
	component: ReactDOM.Renderer
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example view";
	}

	setEphemeralState({ uri, time, insertTimestamp }: { uri: string, time: { obj: number; button: HTMLButtonElement }, insertTimestamp: (ytTime: number) => void }) {
		console.log('hhh', insertTimestamp)
		ReactDOM.render(
			// @ts-ignore
			// <AppContext.Provider value={this.app}>
			<YTContainer uri={uri} time={time} insertTimestamp={insertTimestamp} />,
			// </AppContext.Provider>,
			this.containerEl.children[1]
		);
		console.log('object', this.containerEl.children[1]);
	}

	async onOpen() {

	}

	async onClose() {
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
	}
}

/* 
PLAN:
- User highlights link string and activates via command
- call activateView method to open view in right leaf and call setter method to send link to view 
- From view,


Need a way to get timestamps to view (user clicks on [0:25] and it sends it to view)
Need a way for view to send back timestamps to md file (user presses command and it pastes[0:25] into md file)

- 

*/