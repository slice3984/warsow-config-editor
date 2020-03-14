import { ConfigParser } from './config-parser'

document.getElementById('open-config').addEventListener('change', () => {
    ConfigParser.parse();
});
