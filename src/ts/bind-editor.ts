import { EditorState } from "./editor-state";
import { WarsowColors } from "./color";

export class BindEditor {
    private state: EditorState;
    private previewEl = document.getElementById('editor-preview') as HTMLDivElement;
    private input = document.getElementById('editor-input') as HTMLInputElement;

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
    }

    editBind(key: string) {

    }
}