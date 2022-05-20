import { App, Modal, Setting } from 'obsidian';

export class SetupVideoModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, onSubmit: (result: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Insert video url " });

		new Setting(contentEl)
			.setName("Link")
			.addText((text) =>
				text.onChange((value) => {
					this.result = value
				}))

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Submit")
					.setCta()
					.onClick(async () => {
						await this.onSubmit(this.result);
						this.close();
					}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
