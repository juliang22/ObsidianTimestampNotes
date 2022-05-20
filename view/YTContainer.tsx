import * as React from "react";
import { useRef, useState } from 'react';

import ReactPlayer from 'react-player/lazy'


export interface YTContainerProps {
	url: string;
	start: number
	setupPlayer: (player: ReactPlayer) => void;
	setupError: () => void;
}

export const YTContainer = ({ url, setupPlayer, start, setupError }: YTContainerProps): JSX.Element => {
	// Reference to player passed back to the setupPlayer prop
	const playerRef = useRef<ReactPlayer>();

	const [playing, setPlaying] = useState(true)

	const onReady = () => {
		// Starts player at last played time if the video has been played before
		if (start) playerRef.current.seekTo(start);

		// Sets up video player to be accessed in main.ts
		if (playerRef) setupPlayer(playerRef.current);
	}

	return (
		<ReactPlayer
			ref={playerRef}
			url={url}
			playing={playing}
			togglePlaying={() => setPlaying(!playing)}
			controls={true}
			width='100%'
			height='40%'
			onReady={onReady}
			onError={setupError} // Error handling for invalid URLs
		/>
	)
};
