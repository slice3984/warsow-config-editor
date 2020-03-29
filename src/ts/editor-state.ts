import { WarsowConfig } from './warsow-config';
import { BindEditor } from './bind-editor';

export class EditorState {
    private config: WarsowConfig;
    private editor: BindEditor;

    constructor(config: WarsowConfig) {
        this.config = config;
        this.editor = new BindEditor(this);
    }

    getConfig(): WarsowConfig {
        return this.config;
    }

    getBindEditor(): BindEditor {
        return this.editor;
    }
}