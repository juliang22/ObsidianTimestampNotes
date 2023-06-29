import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot, Root } from 'react-dom/client';

import { VideoContainer, VideoContainerProps } from "./VideoContainer"

export interface VideoViewProps extends VideoContainerProps {
	saveTimeOnUnload: () => void;
}

export const VIDEO_VIEW = "video-view";
export class VideoView extends ItemView {
	component: ReactDOM.Renderer
	saveTimeOnUnload: () => void
	root: Root
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.saveTimeOnUnload = () => { };
		this.root = createRoot(this.containerEl.children[1])
	}

	getViewType() {
		return VIDEO_VIEW;
	}

	getDisplayText() {
		return "Timestamp Video";
	}

	getIcon(): string {
		return "video";
	}

	setEphemeralState({ url, main_url, setupPlayer, setupError, saveTimeOnUnload, start , subtitles }: VideoViewProps) {

		// Allows view to save the playback time in the setting state when the view is closed 
		this.saveTimeOnUnload = saveTimeOnUnload;

		// Create a root element for the view to render into
		this.root.render(
			<VideoContainer
				url={url}
				main_url={main_url}
				start={start}
				setupPlayer={setupPlayer}
				setupError={setupError}
				subtitles={subtitles}
			/>
		);
	}

	async onClose() {
		if (this.saveTimeOnUnload) await this.saveTimeOnUnload();
		this.root.unmount()
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
	}
}
