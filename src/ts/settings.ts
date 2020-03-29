import { EditorState } from "./editor-state";
import { WarsowColors } from "./color";

enum SettingType { number, text, boolean }

interface SettingOption {
    cmd: string[]
    desc: string;
    type: SettingType;
    default: number | string | boolean;
}

export class Settings {
    private state: EditorState;
    private settings: SettingOption[];

    // Dom refs
    private namePreviewEl = document.getElementById('name-preview') as HTMLHeadingElement;
    private clanPreviewEl = document.getElementById('clan-preview') as HTMLHeadingElement;
    private nameInputEl = document.getElementById('name-input') as HTMLInputElement;
    private clanInputEl = document.getElementById('clan-input') as HTMLInputElement;

    constructor(state: EditorState) {
        this.state = state;
        WarsowColors.generateColorPalatte('colors-name', 'name-input');
        WarsowColors.generateColorPalatte('colors-clan', 'clan-input');

        const name = this.state.getConfig().getSetau('name');
        const clan = this.state.getConfig().getSetau('clan');

        this.namePreviewEl.innerHTML = WarsowColors.parseColors(name.value || 'Type something..');
        this.nameInputEl.value = name.value || '';

        this.clanPreviewEl.innerHTML = WarsowColors.parseColors(clan.value || 'Type something..');
        this.clanInputEl.value = clan.value || '';

        this.nameInputEl.addEventListener('input', () => {
            if (this.nameInputEl.value === '') {
                this.namePreviewEl.innerHTML = 'Type something..';
                return;
            }

            this.state.getConfig().setSetau('name', this.nameInputEl.value);
            this.namePreviewEl.innerHTML = WarsowColors.parseColors(this.nameInputEl.value);
        });

        this.clanInputEl.addEventListener('input', () => {
            if (this.clanInputEl.value === '') {
                this.clanPreviewEl.innerHTML = 'Type something..';
                return;
            }

            this.state.getConfig().setSetau('clan', this.clanInputEl.value);
            this.clanPreviewEl.innerHTML = WarsowColors.parseColors(this.clanInputEl.value);
        });

        // Settings
        this.settings = [
            {
                cmd: ['sensitivity'],
                desc: 'Sensitivity',
                type: SettingType.number,
                default: 1
            },
            {
                cmd: ['fov'],
                desc: 'FOV',
                type: SettingType.number,
                default: 100
            },
            {
                cmd: ['cl_maxfps', 'r_maxfps'],
                desc: 'MAX FPS',
                type: SettingType.number,
                default: 250
            },
            {
                cmd: ['cg_showFPS'],
                desc: 'Show FPS Counter',
                type: SettingType.boolean,
                default: false
            },
            {
                cmd: ['cg_showHUD'],
                desc: 'Show HUD',
                type: SettingType.boolean,
                default: true
            },
            {
                cmd: ['netgraph'],
                desc: 'Show Netgraph',
                type: SettingType.boolean,
                default: false
            },
            {
                cmd: ['cg_showpressedkeys'],
                desc: 'Show Pressed Keys',
                type: SettingType.boolean,
                default: false
            },
            {
                cmd: ['cg_showSpeed'],
                desc: 'Show Speed Meter',
                type: SettingType.boolean,
                default: true
            },
            {
                cmd: ['cg_showMiniMap'],
                desc: 'Show Minimap',
                type: SettingType.boolean,
                default: false
            },
            {
                cmd: ['m_raw'],
                desc: 'Raw Mouse Input',
                type: SettingType.boolean,
                default: true
            },
            {
                cmd: ['cg_voiceChats'],
                desc: 'Enable Vsay Sound',
                type: SettingType.boolean,
                default: true
            },
            {
                cmd: ['cl_extrapolate'],
                desc: 'Enable Extrapolation',
                type: SettingType.boolean,
                default: true
            }
        ];

        this.renderSettings();
    }

    private renderSettings() {
        const splitAt = Math.round(this.settings.length / 2);
        let currSide = document.querySelector('.settings__left') as HTMLDivElement;

        this.settings.forEach((setting, index) => {
            const seta = this.state.getConfig().getSeta(setting.cmd[0]);

            if (index === splitAt) {
                currSide = document.querySelector('.settings__right') as HTMLDivElement;
            }

            const groupDivEl = document.createElement('div') as HTMLDivElement;
            groupDivEl.className = 'settings__group';

            const labelEl = document.createElement('label') as HTMLLabelElement;
            labelEl.setAttribute('for', `s${index}`);
            labelEl.textContent = setting.desc;

            const inputEl = document.createElement('input');
            inputEl.id = `s${index}`;

            const checkboxDivWrapperEl = document.createElement('div') as HTMLDivElement;

            switch (setting.type) {
                case SettingType.text:
                    inputEl.setAttribute('type', 'text');
                    inputEl.value = seta.value || setting.default.toString();
                    break;
                case SettingType.number:
                    inputEl.setAttribute('type', 'number');
                    inputEl.value = seta.value || setting.default.toString();
                    break;
                case SettingType.boolean:
                    checkboxDivWrapperEl.className = 'custom-checkbox';

                    inputEl.setAttribute('type', 'checkbox');
                    inputEl.className = 'custom-checkbox__box';
                    checkboxDivWrapperEl.appendChild(inputEl);

                    const checkboxLabelEl = document.createElement('label');
                    checkboxLabelEl.setAttribute('for', `s${index}`);
                    checkboxDivWrapperEl.appendChild(checkboxLabelEl);

                    inputEl.checked = seta ? seta.value === '1'
                        ? true : false : setting.default ? true : false;
            }

            // Event listeners
            switch (setting.type) {
                case SettingType.text:
                case SettingType.number:
                    inputEl.addEventListener('input', () => {
                        if (setting.cmd.length === 1) {
                            this.state.getConfig().setSeta(setting.cmd[0], inputEl.value);
                        } else {
                            setting.cmd.forEach(cmd => {
                                this.state.getConfig().setSeta(cmd, inputEl.value);
                            });
                        }
                        console.log(this.state.getConfig().generateConfig());
                    });

                    break;
                case SettingType.boolean:
                    inputEl.addEventListener('click', () => {
                        this.state.getConfig().setSeta(setting.cmd[0], inputEl.checked ? '1' : '0');
                    });
            }

            groupDivEl.appendChild(labelEl);
            if (setting.type === SettingType.boolean) {
                groupDivEl.appendChild(checkboxDivWrapperEl);
            } else {
                groupDivEl.appendChild(inputEl);
            }
            currSide.appendChild(groupDivEl);
        });
    }
}