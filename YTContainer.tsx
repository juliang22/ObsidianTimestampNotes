import * as React from "react";
import { useState, useContext, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

export const YTContainer = ({ uri, time, insertTimestamp }: { uri: string, time: { obj: number, button: HTMLButtonElement }, insertTimestamp: (ytTime: number) => void }): JSX.Element => {
	// @ts-ignore
	const [options, setOptions] = useState<YouTubeProps['opts']>({
		height: '410',
		width: '100%',
		playerVars: {
			// https://developers.google.com/youtube/player_parameters
			autoplay: 1,
		}
	});
	const [player, setPlayer] = useState(null)
	// @ts-ignore

	// const app = useContext(AppContext);
	// const [seek, setSeek] = useState(time.obj);

	// useEffect(() => {
	// 	console.log('use effected');
	// 	time.button != undefined && time.button.addEventListener('click', () => {
	// 		if (player != null && time.obj != undefined) {
	// 			player.seekTo(time.obj);
	// 			time.obj = undefined
	// 			time.button = undefined
	// 		}
	// 	})
	// }, [time.button]);


	const onPlayerReady: YouTubeProps['onReady'] = (event) => {
		// access to player in all event handlers via event.target
		event.target.pauseVideo();
		setPlayer(event.target)
	}

	return (
		<>
			<YouTube
				videoId={uri + '?t=' + String(time.obj)}
				opts={options}
				onReady={onPlayerReady}
			/>
			<button onClick={() => {
				insertTimestamp(player.getCurrentTime().toFixed(2))
			}}>Update Timestamp</button>
			<button onClick={() => {
				player.seekTo(time.obj);
			}}>Seek</button>
		</>

	)
};
