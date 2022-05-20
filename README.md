## Obsidian Timestamp Notes


### Use Case
Hello Obsidian users! Like all of you, I love using Obsidian for taking notes. My usual workflow is a video in my browser on one side of my screen while I jot down notes in Obsidian on the other side. While Obsidian itself is a great notetaking tool, I found this setup quite lacking. When reviewing my notes, it would often take me a long time to find the section of the video the note came from and I found it annoying constantly having to switch between my browser and Obsidian. 

## Solution
This plugin solves this issue by allowing you to:
- Open up a video player in Obsidian's sidebar
- Insert timestamps with a hotkey
- Select timestamps to navigate to that place in the video

## Usage
- Download and enable the plugin
- Set the hotkeys for opening the video Player and inserting timestamps (my default is cmnd-shift-y and cmnd-y, respectively)
- Highlight a video url and select either the Ribbon note icon or the 'Open Video Player' hotkey
- Jot down notes and anytime you want to insert a timestamp, press the registered hotkey
- Toggle pausing/playing the video by using hotkey (my default is option space)
- Open videos at the timestamp you left off on (this is reset if plugin is disabled)
- Close the player by right-clicking the icon above the video player and selecting close 

## Valid Video Players
This plugin should work with:
- youtube
- vimeo
- facebook
- soundcloud
- wistia	
- mixcloud
- dailymotion
- twitch

## Demo

https://user-images.githubusercontent.com/39292521/167230491-f5439a62-a3f7-445c-a208-839c804953d7.mov


## Known Issues
1. Inserting timestamps into a bulleted section does not work. Unfortunately, code-blocks cannot be in-line with text. Make sure to press enter/insert the timestamp on a new line.


## Other Authors
This plugin uses the react-player npm package: https://www.npmjs.com/package/react-player.

