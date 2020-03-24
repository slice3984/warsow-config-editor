import { EditorState } from "./editor-state";
import { WarsowColors } from "./color";
import { WarsowConfig } from "./warsow-config";

interface Weapon {
    id: number;
    name: string;
}

interface ChatPart {
    channel: 'team' | 'global';
    isVsay: boolean;
    message?: string;
    vsay?: string;
}

export class BindEditor {
    private state: EditorState;
    private previewEl = document.getElementById('editor-preview') as HTMLDivElement;
    private input = document.getElementById('editor-input') as HTMLInputElement;
    private alreadyDisplayed = false;
    private currEditedKey = '';

    // Bind options
    private selectedWeapon;
    private chatParts: ChatPart[] = [];
    private isWweaponGroupActive;
    private isChatGroupActive;
    private isCmdGroupActive;

    // Dom refs
    private keyIndicatorDivEl = document.querySelector('.bind-editor__heading') as HTMLDivElement;
    private weaponGroupInputEl = document.getElementById('enable-weapon-binds') as HTMLInputElement;
    private chatBindSelectEl = document.getElementById('chat-bind-selection') as HTMLSelectElement;
    private chatAddInputEl = document.getElementById('add-chat-bind') as HTMLDivElement;
    private globalChatRadioEl = document.getElementById('global') as HTMLInputElement;
    private teamChatRadioEl = document.getElementById('team') as HTMLInputElement;
    private vsaySelectEl = document.getElementById('vsay') as HTMLSelectElement;
    private chatBindInputEl = document.getElementById('editor-input') as HTMLInputElement;
    private chatGroupInputEl = document.getElementById('enable-chat-binds') as HTMLInputElement;
    private customCmdSelectEl = document.getElementById('command-bind-selection') as HTMLSelectElement;
    private cmdAddInputEl = document.getElementById('add-cmd-bind') as HTMLDivElement;
    private cmdBindInputEl = document.getElementById('command') as HTMLInputElement;
    private cmdGroupInputEl = document.getElementById('enable-commands') as HTMLInputElement;

    constructor(state: EditorState) {
        this.state = state;
        this.init();
    }

    private init() {
        WarsowColors.generateColorPalatte('chat-options__colors', 'editor-input');

        this.input.addEventListener('input', () => {
            if (this.input.value === '') {
                this.previewEl.innerHTML = 'Type something..';
                return;
            }

            this.previewEl.innerHTML = WarsowColors.parseColors(this.input.value);
        });

        this.setEventListeners();
    }

    private setEventListeners() {
        // 9 Weapons
        for (let i = 0; i < 9; i++) {
            document.getElementById(`weapon-${i + 1}`).addEventListener('click', e => {
                this.selectedWeapon = this.getWeaponInfo(i);
            });
        }
    }

    private getWeaponInfo(id: number | string): Weapon {
        const weapons = ['gunblade', 'machinegun', 'riotgun', 'grenade launcher', 'rocket launcher',
        'plasmagun', 'lasergun', 'electrobolt', 'instagun'];

        if (typeof id === 'string') {
            return {
                id: weapons.findIndex(str => str.toLowerCase() === id.toLowerCase()),
                name: id
            }
        } else {
            return {
                id,
                name: weapons[id]
            }
        }
    } 

    editBind(key: string) {
        if (!this.alreadyDisplayed) {
            document.querySelector('.keyboard-info').classList.add('hidden');
            document.querySelector('.bind-editor').classList.remove('hidden');
            this.alreadyDisplayed = true;
        }

        if (this.currEditedKey === key) {
            return;
        }
        this.currEditedKey = key;
        this.keyIndicatorDivEl.textContent = this.currEditedKey.toUpperCase();

        let bind = this.state.getConfig().getBind(this.currEditedKey);

        if (!bind) {
            return;
        }

        const bindParts = WarsowConfig.getBindContent(bind);
        
        if (bindParts.weapon) {
            const info = this.getWeaponInfo(bindParts.weapon);
            (document.getElementById(`weapon-${info.id + 1}`) as HTMLInputElement).checked = true;
            this.selectedWeapon = info;
        }

        // Chat
        bindParts.says.forEach(say => {
            this.chatParts.push({
                channel: 'global',
                isVsay: false,
                message: say
            });
        });

        bindParts.saysTeam.forEach(say => {
            this.chatParts.push({
                channel: 'team',
                isVsay: false,
                message: say
            });
        });

        bindParts.vsays.forEach(vsay => {
            this.chatParts.push({
                channel: 'global',
                isVsay: true,
                vsay: vsay[1] || ''
            });
        });

        bindParts.vsaysTeam.forEach(vsay => {
            this.chatParts.push({
                channel: 'team',
                isVsay: true,
                vsay: vsay[1] || ''
            });
        });
    }

    private generateBind() {
        let bind = this.state.getConfig().getBind(this.currEditedKey);

    }
}