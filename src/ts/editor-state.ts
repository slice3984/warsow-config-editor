import { WarsowConfig } from './warsow-config';

export class EditorState {
    private config: WarsowConfig;

    constructor(config: WarsowConfig) {
        this.config = config;
    }

    getConfig(): WarsowConfig {
        return this.config;
    }
}