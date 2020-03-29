import { configProperty, WarsowConfig } from './warsow-config'

export class ConfigParser {
	private static importBtnEl = document.getElementById('open-config') as HTMLInputElement;

	private constructor() { }

	static parse() {
		return new Promise((res, rej) => {
			const config = this.importBtnEl.files[0];
			const reader = new FileReader();
			reader.readAsText(config, 'utf-8');
			reader.onload = e => {
				// Store as array and remove comments + empty lines + spacings
				const lines = (e.target.result as string)
					.split('\n')
					.filter(line => {
						return !line.trim().startsWith('//') &&
							!(line.trim() === '')
					})
					.map(line => line.trim());

				const binds: configProperty[] = [];
				const setas: configProperty[] = [];
				const setaus: configProperty[] = [];
				const misc: configProperty[] = [];

				lines.forEach(line => {
					const parts = line.split(' ');

					// unbindall, unaliasall
					if (parts.length <= 2) {
						return;
					}

					const type = parts[0];
					const property = parts[1];
					let value = parts.slice(2, parts.length).join(" ");
					value = value.replace(/^\"|\"$/g, "");

					const containsColors = /\^[0-9]/.test(value);

					switch (type) {
						case 'bind':
							binds.push({ type, property, value, containsColors });
							break;
						case 'seta':
							setas.push({ type, property, value, containsColors });
							break;
						case 'setau':
							setaus.push({ type, property, value, containsColors });

						default:
							misc.push({ type, property, value, containsColors });
					}
				});
				res(new WarsowConfig(binds, setas, setaus, misc));
			};
		})
	}
}
