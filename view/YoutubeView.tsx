import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot, Root } from 'react-dom/client';

import { YTContainer, YTContainerProps } from "../YTContainer"

export interface YTViewProps extends YTContainerProps {
	saveTimeOnUnload: () => void;
}

export const YOUTUBE_VIEW = "example-view";
export class YoutubeView extends ItemView {
	component: ReactDOM.Renderer
	saveTimeOnUnload: () => void
	root: Root
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.saveTimeOnUnload = () => { };
		this.root = createRoot(this.containerEl.children[1])
	}

	getViewType() {
		return YOUTUBE_VIEW;
	}

	getDisplayText() {
		return "Example view";
	}

	setEphemeralState({ url, setupPlayer, saveTimeOnUnload, start }: YTViewProps) {

		// Allows view to save the playback time in the setting state when the view is closed 
		this.saveTimeOnUnload = saveTimeOnUnload;

		// Create a root element for the view to render into
		this.root.render(<YTContainer url={url} setupPlayer={setupPlayer} start={start} />);
	}

	async onOpen() {

	}

	async onClose() {
		if (this.saveTimeOnUnload) await this.saveTimeOnUnload();
		this.root.unmount()
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