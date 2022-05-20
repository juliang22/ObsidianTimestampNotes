import { App, PluginSettingTab, Setting } from 'obsidian';
import TimestampPlugin from './main';

export interface TimestampPluginSettings {
	noteTitle: string;
	urlStartTimeMap: Map<string, number>;
	urlColor: string;
	timestampColor: string;
	urlTextColor: string;
	timestampTextColor: string;
}

export const DEFAULT_SETTINGS: TimestampPluginSettings = {
	noteTitle: "",
	urlStartTimeMap: new Map<string, number>(),
	urlColor: 'blue',
	timestampColor: 'green',
	urlTextColor: 'white',
	timestampTextColor: 'white'
}

const COLORS = { 'blue': 'blue', 'red': 'red', 'green': 'green', 'yellow': 'yellow', 'orange': 'orange', 'purple': 'purple', 'pink': 'pink', 'grey': 'grey', 'black': 'black' }

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
	}
}