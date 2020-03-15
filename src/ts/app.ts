import { ConfigParser } from './config-parser'
import { WarsowConfig } from './warsow-config';

import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

let keyboard = new Keyboard({
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

keyboard.addButtonTheme('q', 'red');
keyboard.removeButtonTheme('q', 'red');

keyboard.setOptions({
    layoutName: 'default'
});

document.getElementById('open-config').addEventListener('change', () => {
    ConfigParser.parse().then((cfg: WarsowConfig) => {
        const config = cfg;
    });
});
