import { App, PluginSettingTab, Setting } from 'obsidian';
import TimestampPlugin from './main';

export interface TimestampPluginSettings {
	noteTitle: string;
	urlStartTimeMap: Map<string, number>;
	urlColor: string;
	timestampColor: string;
	urlTextColor: string;
	timestampTextColor: string;
	forwardSeek: string;
	backwardsSeek: string;
	port: number;
}

export const DEFAULT_SETTINGS: TimestampPluginSettings = {
	noteTitle: "",
	urlStartTimeMap: new Map<string, number>(),
	urlColor: 'blue',
	timestampColor: 'green',
	urlTextColor: 'white',
	timestampTextColor: 'white',
	forwardSeek: '10',
	backwardsSeek: '10',
	port: 12345,
}

const COLORS = { 'blue': 'blue', 'red': 'red', 'green': 'green', 'yellow': 'yellow', 'orange': 'orange', 'purple': 'purple', 'pink': 'pink', 'grey': 'grey', 'black': 'black', 'white': 'white' };

const TIMES = { '5': '5', '10': '10', '15': '15', '20': '20', '25': '25', '30': '30', '35': '35', '40': '40', '45': '45', '50': '50', '55': '55', '60': '60', '65': '65', '70': '70', '75': '75', '80': '80', '85': '85', '90': '90', '95': '95', '100': '100', '105': '105', '110': '110', '115': '115', '120': '120' }

export class TimestampPluginSettingTab extends PluginSettingTab {
	plugin: TimestampPlugin;

	constructor(app: App, plugin: TimestampPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Timestamp Notes Plugin' });

		// Customize title
		new Setting(containerEl)
			.setName('Title')
			.setDesc('This title will be printed after opening a video with the hotkey. Use <br> for new lines.')
			.addText(text => text
				.setPlaceholder('Enter title template.')
				.setValue(this.plugin.settings.noteTitle)
				.onChange(async (value) => {
					this.plugin.settings.noteTitle = value;
					await this.plugin.saveSettings();
				}));

		// Customize  url button color
		new Setting(containerEl)
			.setName('URL Button Color')
			.setDesc('Pick a color for the url button.')
			.addDropdown(dropdown => dropdown
				.addOptions(COLORS)
				.setValue(this.plugin.settings.urlColor)
				.onChange(async (value) => {
					this.plugin.settings.urlColor = value;
					await this.plugin.saveSettings();
				}
				));

		// Customize url text color
		new Setting(containerEl)
			.setName('URL Text Color')
			.setDesc('Pick a color for the URL text button.')
			.addDropdown(dropdown => dropdown
				.addOptions(COLORS)
				.setValue(this.plugin.settings.urlTextColor)
				.onChange(async (value) => {
					this.plugin.settings.urlTextColor = value;
					await this.plugin.saveSettings();
				}
				));

		// Customize timestamp button color
		new Setting(containerEl)
			.setName('Timestamp Button Color')
			.setDesc('Pick a color for the timestamp button.')
			.addDropdown(dropdown => dropdown
				.addOptions(COLORS)
				.setValue(this.plugin.settings.timestampColor)
				.onChange(async (value) => {
					this.plugin.settings.timestampColor = value;
					await this.plugin.saveSettings();
				}
				));

		// Customize timestamp text color
		new Setting(containerEl)
			.setName('Timestamp Text Color')
			.setDesc('Pick a color for the timestamp text.')
			.addDropdown(dropdown => dropdown
				.addOptions(COLORS)
				.setValue(this.plugin.settings.timestampTextColor)
				.onChange(async (value) => {
					this.plugin.settings.timestampTextColor = value;
					await this.plugin.saveSettings();
				}
				));

		// Customize forward seek time
		new Setting(containerEl)
			.setName('Foward time seek')
			.setDesc('This is the amount of seconds the video will seek forward when pressing the seek forward command.')
			.addDropdown(dropdown => dropdown
				.addOptions(TIMES)
				.setValue(this.plugin.settings.forwardSeek)
				.onChange(async (value) => {
					this.plugin.settings.forwardSeek = value;
					await this.plugin.saveSettings();
				}
				));

		// Customize backwards seek time
		new Setting(containerEl)
			.setName('Backwards time seek')
			.setDesc('This is the amount of seconds the video will seek backwards when pressing the seek backwards command.')
			.addDropdown(dropdown => dropdown
				.addOptions(TIMES)
				.setValue(this.plugin.settings.backwardsSeek)
				.onChange(async (value) => {
					this.plugin.settings.backwardsSeek = value;
					await this.plugin.saveSettings();
				}
				));

		// Customize local server port
		new Setting(containerEl)
			.setName('Server Port')
			.setDesc('Select a custom port for the local server where local videos will be streamed (will be assigned randomly if left empty)')
			.addText(number => number
				.setPlaceholder('Enter a port number')
				.setValue(this.plugin.settings.port.toString())
				.onChange(async (value) => {
					if (!isNaN(Number(value)) && Number(value) < 65500) {						
						this.plugin.settings.port = Number(value);
						await this.plugin.saveSettings();
					}
				}));

	}
}