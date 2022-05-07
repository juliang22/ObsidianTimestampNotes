import * as React from "react";
import { useState } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';


export interface YTContainerProps {
	url: string;
	setupPlayer: (yt: YouTubePlayer) => void;
	start: number
}

export const YTContainer = ({ url, setupPlayer, start }: YTContainerProps): JSX.Element => {

	const [options] = useState<YouTubeProps['opts']>({
		height: '410',
		width: '100%',
		playerVars: {
			// https://developers.google.com/youtube/player_parameters
			autoplay: 1,
			start: start,
		}
	});

	const onPlayerReady: YouTubeProps['onReady'] = (event) => {
		// access to player in all event handlers via event.target
		setupPlayer(event.target);
	}

	return (
		// @ts-ignore
		<YouTube
			videoId={url}
			opts={options}
			onReady={onPlayerReady}
		/>


	)
};
