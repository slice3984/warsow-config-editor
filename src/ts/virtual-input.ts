import { EditorState } from './editor-state';
import { Observer } from './observer';
import Keyboard from 'simple-keyboard';
import { configProperty } from './warsow-config';
import 'simple-keyboard/build/css/index.css';

export class VirtualInput implements Observer {
    private keyboard;
    private state: EditorState;

    constructor(state: EditorState) {
        this.state = state;
    }

    update(key: string) {
        const bind = this.state.getConfig().getBind(key);
        this.rerenderKey(bind);
    }

    private rerenderKey(bind: configProperty) {
        const key = bind.property;
        const commandType = bind.value.split(' ')[0].toLowerCase();

        // Remove old stylings
        this.keyboard.removeButtonTheme(key, 'key-1 key-2 key-3');

        switch (commandType) {
            case 'say':
                this.keyboard.addButtonTheme(key, 'key-1');
                break;
            case 'vsay':
                this.keyboard.addButtonTheme(key, 'key-2');
                break;
            default:
                this.keyboard.addButtonTheme(key, 'key-3');
        }
    }

    renderInput() {
        this.keyboard = new Keyboard({
            onChange: input => console.log(input),
            layout: {
                default: [
                    "LMB RMB MWHEELUP MWHEELDOWN",
                    "ESC F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12",
                    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                    "{tab} q w e r t y u i o p [ ] \\",
                    "{lock} a s d f g h j k l ; ' {enter}",
                    "{shift} z x c v b n m , . / {shift}",
                    "ctrl lalt {space} ralt"
                ]
            },

        });

        this.keyboard.setOptions({
            layoutName: 'default'
        });

        const binds = this.state.getConfig().getBinds();

        binds.forEach(bind => {
            this.rerenderKey(bind);
        });
    }
}