import { ConfigParser } from './config-parser'
import { WarsowConfig } from './warsow-config';
import { EditorState } from './editor-state';
import { VirtualInput } from './virtual-input';
import { BindList } from './bind-list';
import { WarsowColors } from './color';

WarsowColors.parseColors('vsay thanks ^6F A G S ! ! ! ^7(in memories of ^5bounce^7)');

document.getElementById('open-config').addEventListener('change', () => {
    ConfigParser.parse().then((cfg: WarsowConfig) => {
        const editor = new EditorState(cfg);
        const input = new VirtualInput(editor);
        const bindList = new BindList(editor);

        cfg.registerObserver(input);
        input.renderInput();

        const pane1 = document.querySelector('.pane-1');
        const pane2 = document.querySelector('.pane-2');

        const linkPane1 = document.getElementById('link-pane-1');
        const linkPane2 = document.getElementById('link-pane-2');

        let selected = 0;

        linkPane1.addEventListener('click', () => {
            if (selected !== 0) {
                linkPane1.classList.toggle('selected');
                linkPane2.classList.remove('selected');
                pane1.classList.remove('hidden')
                pane2.classList.add('hidden');
                selected = 0;
            }
        });

        linkPane2.addEventListener('click', () => {
            if (selected !== 1) {
                linkPane2.classList.add('selected');
                linkPane1.classList.remove('selected');
                pane2.classList.remove('hidden')
                pane1.classList.add('hidden');
                selected = 1;
            }
        });
    });
});
