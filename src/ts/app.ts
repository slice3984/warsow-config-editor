import { ConfigParser } from './config-parser'
import { WarsowConfig } from './warsow-config';
import { EditorState } from './editor-state';
import { VirtualInput } from './virtual-input';

document.getElementById('open-config').addEventListener('change', () => {
    ConfigParser.parse().then((cfg: WarsowConfig) => {
        const editor = new EditorState(cfg);
        const input = new VirtualInput(editor);
        input.renderInput();
    });
});
