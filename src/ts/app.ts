import { ConfigParser } from './config-parser'
import { WarsowConfig } from './warsow-config';
import { EditorState } from './editor-state';
import { VirtualInput } from './virtual-input';
import { BindList } from './bind-list';
import { Settings } from './settings';

document.getElementById('open-config').addEventListener('change', () => {
    ConfigParser.parse().then((cfg: WarsowConfig) => {
        const editor = new EditorState(cfg);
        const input = new VirtualInput(editor);
        const bindList = new BindList(editor);
        const settingsEditor = new Settings(editor);

        cfg.registerObserver(input);
        cfg.registerObserver(bindList);

        input.renderInput();
        PaneControl.initEventListeners();

        document.querySelector('.main').classList.toggle('hidden');
    });
});

export class PaneControl {
    private static selected = 0;
    private static pane1 = document.querySelector('.pane-1');
    private static pane2 = document.querySelector('.pane-2');

    private static linkPane1 = document.getElementById('link-pane-1');
    private static linkPane2 = document.getElementById('link-pane-2');

    static switchToFirst() {
        if (this.selected !== 0) {
            this.linkPane1.classList.toggle('selected');
            this.linkPane2.classList.remove('selected');
            this.pane1.classList.remove('hidden')
            this.pane2.classList.add('hidden');
            this.selected = 0;
        }
    }

    static switchToSecond() {
        if (this.selected !== 1) {
            this.linkPane2.classList.add('selected');
            this.linkPane1.classList.remove('selected');
            this.pane2.classList.remove('hidden')
            this.pane1.classList.add('hidden');
            this.selected = 1;
        }
    }

    static initEventListeners() {
        this.linkPane1.addEventListener('click', () => {
            if (this.selected !== 0) {
                this.linkPane1.classList.toggle('selected');
                this.linkPane2.classList.remove('selected');
                this.pane1.classList.remove('hidden')
                this.pane2.classList.add('hidden');
                this.selected = 0;
            }
        });

        this.linkPane2.addEventListener('click', () => {
            if (this.selected !== 1) {
                this.linkPane2.classList.add('selected');
                this.linkPane1.classList.remove('selected');
                this.pane2.classList.remove('hidden')
                this.pane1.classList.add('hidden');
                this.selected = 1;
            }
        });
    }
}