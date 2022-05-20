import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot, Root } from 'react-dom/client';

import { YTContainer, YTContainerProps } from "./YTContainer"

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
		return "YouTube view";
	}

	setEphemeralState({ url, setupPlayer, setupError, saveTimeOnUnload, start }: YTViewProps) {

		// Allows view to save the playback time in the setting state when the view is closed 
		this.saveTimeOnUnload = saveTimeOnUnload;

		// Create a root element for the view to render into
		this.root.render(
			<YTContainer
				url={url}
				start={start}
				setupPlayer={setupPlayer}
				setupError={setupError}
			/>
		);
	}

	async onClose() {
		if (this.saveTimeOnUnload) await this.saveTimeOnUnload();
		this.root.unmount()
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
	}
}
