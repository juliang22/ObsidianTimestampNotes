import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { ExampleView, VIEW_TYPE_EXAMPLE } from './view/ExampleView';

// TODO: Remember to rename these classes and interfaces!
interface MyPluginSettings {
	mySetting: string;
	leaf: WorkspaceLeaf;
	time: { obj: number, button: HTMLButtonElement };
	timestampObj: { ts: number };
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	leaf: null,
	time: { obj: undefined, button: undefined },
	timestampObj: { ts: undefined },
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		this.registerView(
			VIEW_TYPE_EXAMPLE,
			(leaf) => new ExampleView(leaf)
		);

		// this.addRibbonIcon("dice", "Activate view", () => {
		// 	this.activateView();
		// });


		this.registerMarkdownCodeBlockProcessor("yt", (source, el, ctx) => {
			const regExp = /\d+:\d+:\d+|\[\d+:\d+\]/g;
			const rows = source.split("\n").filter((row) => row.length > 0);
			rows.forEach((row) => {
				const match = row.match(regExp);
				if (match) {
					const div = el.createEl("div");
					const button = div.createEl("button");

					button.innerText = match[0];
					button.addEventListener("click", () => {
						const hhmmss = match[0].replace(/\[|\]/g, "");
						//convert hhmmss format to seconds where there might not be hh
						const timeArr = hhmmss.split(":").map((v) => parseInt(v));
						const [hh, mm, ss] = timeArr.length === 2 ? [0, ...timeArr] : timeArr;
						const seconds = (hh || 0) * 3600 + (mm || 0) * 60 + (ss || 0);
						//console.log(seconds, hh, mm, ss)
						this.settings.time.obj = seconds;
						this.settings.time.button = button;

						console.log("FUCK", this.settings.timestampObj.ts);
						//this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0].getViewState()
						//this.settings.leaf.setEphemeralState(this.settings.mySetting);
					});
					div.appendChild(button);
					const text = div.createEl("span")
					text.innerText = row.replace(regExp, "");
					div.appendChild(text);
				} else {
					const text = el.createEl("div");
					text.innerHTML = row;
				}
			})
		});





		// Default stuff below
		await this.loadSettings();
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// Gets youtube link and sends it to view which passes it to React component
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// Get selected text and match against youtube url to convert link to youtube video id
				const uri = editor.getSelection().trim();
				const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
				const match = uri.match(regExp);
				if (match && match[7].length == 11) {
					// Activate the view with the valid link
					console.log("video id = ", match[7]);
					this.activateView(match[7].toString().trim());

					// Paste code blocks and move cursor
					editor.replaceSelection(editor.getSelection() + "\n```yt\n \n```")
					editor.setCursor(editor.getCursor().line - 1)
				} else {
					editor.replaceSelection(editor.getSelection() + "\n The above link is not a valid youtube url. Please try again with a valid link.\n")
				}
			}
		});

		// This command inserts the timestamp of the playing video into the editor
		this.addCommand({
			id: 'Timestamp-Insert',
			name: 'Insert timestamp of based on videos current play time',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log('Inserting Timestamp')
				// change seconds float into timestamp in the format hh:mm:ss
				const totalSeconds = this.settings.timestampObj.ts;
				const hours = Math.floor(totalSeconds / 3600);
				const minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
				const seconds = totalSeconds - (hours * 3600) - (minutes * 60);
				const time = (hours > 0 ? hours.toFixed(0) + ":" : "") + minutes.toFixed(0) + ":" + seconds.toFixed(0);
				editor.replaceSelection(`[${time}] - `)
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
	}

	async activateView(uri: string) {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_EXAMPLE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
		);


		this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE).forEach(async (leaf) => {
			if (leaf.view instanceof ExampleView) {
				const insertTimestamp = (ytTime: number) => {
					this.settings.timestampObj.ts = ytTime
				}
				leaf.setEphemeralState({ uri, time: this.settings.time, insertTimestamp });
				this.settings.mySetting = uri;
				this.settings.leaf = leaf
				await this.saveSettings();
			}
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}


	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}


}
