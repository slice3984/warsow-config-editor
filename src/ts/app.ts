import { ConfigParser } from './config-parser'
import { WarsowConfig } from './warsow-config';

document.getElementById('open-config').addEventListener('change', () => {
    ConfigParser.parse().then((cfg: WarsowConfig) => {
        const config = cfg;
    });
});
