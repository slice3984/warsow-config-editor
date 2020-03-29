import { EditorState } from "./editor-state";
import { WarsowColors } from "./color";
import { WarsowConfig, ChatType } from "./warsow-config";
import { Observer } from "./observer";

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

export class BindEditor implements Observer {
    private state: EditorState;
    private previewEl = document.getElementById('editor-preview') as HTMLDivElement;
    private input = document.getElementById('editor-input') as HTMLInputElement;
    private alreadyDisplayed = false;
    private currEditedKey = '';

    // Bind options
    private selectedWeapon: Weapon;
    private chatParts: ChatPart[] = [];
    private cmds = [];
    private isWweaponGroupActive;
    private isChatGroupActive;
    private isCmdGroupActive;
    private currChatElem = 0;
    private currCmdElem = 0;

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

    public update(key: string) {
        // Catch bind delete using the bind list
        const bind = this.state.getConfig().getBind(key);
        if (bind.remove && bind.property === this.currEditedKey) {
            this.resetEditor();
        }
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
                if (!this.isWweaponGroupActive) {
                    this.weaponGroupInputEl.checked = true;
                    this.isWweaponGroupActive = true;
                }
                this.modifyBind();
            });
        }

        // Groups
        this.weaponGroupInputEl.addEventListener('click', () => {
            this.isWweaponGroupActive = this.weaponGroupInputEl.checked;
            this.modifyBind();
        });

        this.chatGroupInputEl.addEventListener('click', () => {
            this.isChatGroupActive = this.chatGroupInputEl.checked;
            this.modifyBind();
        });

        this.cmdGroupInputEl.addEventListener('click', () => {
            this.isCmdGroupActive = this.cmdGroupInputEl.checked;
            this.modifyBind();
        });

        // Chat
        this.globalChatRadioEl.addEventListener('click', () => {
            if (!this.chatParts[this.chatBindSelectEl.selectedIndex]) {
                return;
            }

            this.chatParts[this.chatBindSelectEl.selectedIndex].channel = 'global';
            this.modifyBind();
        });

        this.teamChatRadioEl.addEventListener('click', () => {
            if (!this.chatParts[this.chatBindSelectEl.selectedIndex]) {
                return;
            }

            this.chatParts[this.chatBindSelectEl.selectedIndex].channel = 'team';
            this.modifyBind();
        });

        this.chatBindInputEl.addEventListener('input', e => {
            if (!this.isChatGroupActive) {
                this.chatGroupInputEl.checked = true;
                this.isChatGroupActive = true;
            }

            const indexSelect = this.chatBindSelectEl.selectedIndex;

            const channel = this.globalChatRadioEl.checked ? 'global' : 'team';
            const isVsay = this.vsaySelectEl.selectedIndex === 0 ? false : true;
            const message = this.input.value.trim();
            const vsay = this.vsaySelectEl.options[this.vsaySelectEl.selectedIndex].value;

            this.chatParts[indexSelect] = {
                channel,
                isVsay,
                message,
                vsay
            };
            this.modifyBind();
        });

        this.vsaySelectEl.addEventListener('change', () => {
            if (!this.isChatGroupActive) {
                this.chatGroupInputEl.checked = true;
                this.isChatGroupActive = true;
            }

            const isVsay = this.vsaySelectEl.value !== 'none';
            const value = this.vsaySelectEl.value;
            let part: ChatPart;

            if (this.isChatGroupActive) {

                if (this.chatParts.length > 0) {
                    part = this.chatParts[this.chatBindSelectEl.selectedIndex];
                } else {
                    part = {
                        channel: 'global',
                        isVsay: true
                    }
                    this.chatParts.push(part);

                }

                if (isVsay) {
                    part.isVsay = true;
                    part.vsay = value;
                } else {
                    part.isVsay = false;
                    part.vsay = '';
                }

                this.modifyBind();
            }
        });

        // Commands
        this.cmdBindInputEl.addEventListener('input', e => {
            if (!this.isCmdGroupActive) {
                this.cmdGroupInputEl.checked = true;
                this.isCmdGroupActive = true;
            }

            const indexSelect = this.customCmdSelectEl.selectedIndex;
            this.cmds[indexSelect] = this.cmdBindInputEl.value.trim();
            this.modifyBind();
        });

        // Selects
        this.chatBindSelectEl.addEventListener('change', () => {
            this.currChatElem = this.chatBindSelectEl.selectedIndex;
            this.renderChat(this.chatBindSelectEl.selectedIndex);
        });

        this.customCmdSelectEl.addEventListener('change', () => {
            this.currCmdElem = this.customCmdSelectEl.selectedIndex;
            this.renderCommand(this.customCmdSelectEl.selectedIndex);
        });

        // Add buttons
        this.chatAddInputEl.addEventListener('click', () => {
            if (this.chatParts.length === 0) {
                return;
            }

            const optionEl = document.createElement('option');
            optionEl.textContent = `Chat #${this.chatParts.length + 1}`;
            optionEl.value = `chat${this.chatParts.length + 1}`;
            this.chatBindSelectEl.appendChild(optionEl);
            this.chatBindSelectEl.selectedIndex = this.chatBindSelectEl.options.length - 1;
            this.renderChat(this.chatBindSelectEl.options.length - 1);
        });

        this.cmdAddInputEl.addEventListener('click', () => {
            const optionEl = document.createElement('option');
            optionEl.textContent = `Command #${this.cmds.length + 1}`;
            optionEl.value = `command${this.cmds.length + 1}`;
            this.customCmdSelectEl.appendChild(optionEl);
            this.customCmdSelectEl.selectedIndex = this.customCmdSelectEl.options.length - 1;
            this.renderCommand(this.customCmdSelectEl.options.length);
        });
    }

    private resetEditor() {
        const weaponInputEls = document.querySelectorAll(
            '.bind-editor__weapons input[type="radio"]'
        );
        weaponInputEls.forEach((input: HTMLInputElement) => input.checked = false);

        this.weaponGroupInputEl.checked = false;
        this.chatGroupInputEl.checked = false;
        this.cmdGroupInputEl.checked = false;

        this.chatBindInputEl.value = '';
        this.cmdBindInputEl.value = '';

        this.selectedWeapon = null;
        this.chatParts = [];
        this.cmds = [];
        this.isWweaponGroupActive = null;
        this.isChatGroupActive = null;
        this.isCmdGroupActive = null;

        // Clear chat / command 
        this.chatBindSelectEl.innerHTML = '<option value="chat1">Chat #1</option>';
        this.chatBindInputEl.value = '';
        this.previewEl.innerHTML = WarsowColors.parseColors('Type something..');
        this.customCmdSelectEl.innerHTML = '<option value="command1">Command #1</option>';
        this.cmdBindInputEl.value = '';

        // Vsays
        this.vsaySelectEl.value = 'none';
    }

    private modifyBind() {

        this.setBind();
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

        this.resetEditor();
        this.currEditedKey = key;
        this.keyIndicatorDivEl.textContent = 'Key: ' + this.currEditedKey.toUpperCase();

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
        // Push by order
        let order = bindParts.orderChats;
        let saysIndex = 0;
        let saysTeamIndex = 0;
        let vsaysIndex = 0;
        let vsaysTeamIndex = 0;

        let continueLoop = true;

        order.forEach(type => {
            switch (type) {
                case ChatType.Say:
                    const say = bindParts.says[saysIndex];
                    this.chatParts.push({
                        channel: 'global',
                        isVsay: false,
                        message: say
                    });
                    saysIndex++;
                    break;
                case ChatType.SayTeam:
                    const sayTeam = bindParts.saysTeam[saysTeamIndex];
                    this.chatParts.push({
                        channel: 'team',
                        isVsay: false,
                        message: sayTeam
                    });
                    saysTeamIndex++;
                    break;
                case ChatType.Vsay:
                    const vsay = bindParts.vsays[vsaysIndex];
                    this.chatParts.push({
                        channel: 'global',
                        isVsay: true,
                        vsay: vsay[0],
                        message: vsay[1] || ''
                    });
                    vsaysIndex++;
                    break;
                case ChatType.VsayTeam:
                    const vsayTeam = bindParts.vsaysTeam[vsaysTeamIndex];
                    this.chatParts.push({
                        channel: 'team',
                        isVsay: true,
                        vsay: vsayTeam[0],
                        message: vsayTeam[1] || ''
                    });
                    vsaysTeamIndex++;
                    break;
            }
        });

        this.cmds = [...bindParts.misc];
        this.renderUi();
    }

    private renderUi() {
        // Bind selects
        if (this.chatParts.length > 1) {
            for (let i = 1; i < this.chatParts.length; i++) {
                const optionEl = document.createElement('option');
                optionEl.value = `chat${i + 1}`;
                optionEl.textContent = `Chat #${i + 1}`;
                this.chatBindSelectEl.appendChild(optionEl);
            }
        }

        if (this.cmds.length > 1) {
            for (let i = 1; i < this.cmds.length; i++) {
                const optionEl = document.createElement('option');
                optionEl.value = `command${i + 1}`;
                optionEl.textContent = `Command #${i + 1}`;
                this.customCmdSelectEl.appendChild(optionEl);
            }
        }

        this.renderChat(0);
        this.renderCommand(0);

        if (this.selectedWeapon) {
            const weaponInputEls = Array.from(document.querySelectorAll(
                '.bind-editor__weapons input[type="radio"]'
            ));
            const toHighlight = weaponInputEls.find(weapon => weapon.id === `weapon-${this.selectedWeapon.id + 1}`) as HTMLInputElement;
            toHighlight.checked = true;
        }

        if (this.selectedWeapon) {
            this.weaponGroupInputEl.checked = true;
            this.isWweaponGroupActive = true;
        }

        if (this.chatParts.length > 0) {
            this.chatGroupInputEl.checked = true;
            this.isChatGroupActive = true;
        }

        if (this.cmds.length > 0) {
            this.cmdGroupInputEl.checked = true;
            this.isCmdGroupActive = true;
        }
    }

    private renderChat(id: number) {
        if (this.chatParts.length > 0 && this.chatParts[id]) {
            if (this.chatParts[id].message) {
                this.chatBindInputEl.value = this.chatParts[id].message;
                this.previewEl.innerHTML = WarsowColors.parseColors(this.input.value);
            } else {
                this.chatBindInputEl.value = '';
                this.previewEl.innerHTML = WarsowColors.parseColors('Type something..');
            }

            if (this.chatParts[id].channel === 'global') {
                this.globalChatRadioEl.checked = true;
            } else {
                this.teamChatRadioEl.checked = true;
            }

            if (this.chatParts[id].isVsay) {
                this.vsaySelectEl.value = this.chatParts[id].vsay.toLowerCase();
            } else {
                this.vsaySelectEl.selectedIndex = 0;
            }
        } else {
            this.vsaySelectEl.selectedIndex = 0;
            this.chatBindInputEl.value = '';
            this.previewEl.textContent = 'Type something..';
        }
    }

    private renderCommand(id: number) {
        if (this.cmds.length > 0) {
            if (this.cmds[id]) {
                this.cmdBindInputEl.value = this.cmds[id];
            } else {
                this.cmdBindInputEl.value = '';
            }
        }
    }

    private setBind() {
        let bind = '';
        if (this.isWweaponGroupActive) {
            if (this.selectedWeapon) {
                bind += `use ${this.selectedWeapon.name};`
            }
        }

        if (this.isChatGroupActive) {
            this.chatParts.forEach(part => {
                const modifier = part.channel === 'global' ? 'say' : 'say_team';
                const modifierVsay = part.channel === 'global' ? 'vsay' : 'vsay_team';

                if (part.isVsay) {
                    bind += `${modifierVsay} ${part.vsay}`;
                    if (part.message && part.message.length > 0) {
                        bind += ` ${part.message}`;
                    }
                    bind += ';';
                } else {
                    if (part.message && part.message.length > 0) {
                        bind += `${modifier} ${part.message};`;
                    }
                }
            });
        }

        if (this.isCmdGroupActive) {
            this.cmds.forEach(cmd => {
                bind += `${cmd};`;
            });
        }

        if (bind.trim() === '') {
            this.state.getConfig().deleteBind(this.currEditedKey);
        } else {
            this.state.getConfig().setBind(this.currEditedKey, bind.trim());
        }
    }
}