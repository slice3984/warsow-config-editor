import { Observable, Observer } from './observer';

export interface configProperty {
    type: string;
    property: string;
    value: string;
    containsColors: boolean;
    remove?: boolean;
}

export enum ChatType { Say, SayTeam, Vsay, VsayTeam };

export interface bindParts {
    orderChats: ChatType[];
    says: string[];
    saysTeam: string[];
    vsays: string[];
    vsaysTeam: string[];
    weapon: string;
    misc: string[];
}

export class WarsowConfig implements Observable {
    private binds: configProperty[];
    private setas: configProperty[];
    private setaus: configProperty[];
    private misc: configProperty[];
    private observers: Observer[] = [];

    constructor(binds: configProperty[],
        setas: configProperty[],
        setaus: configProperty[]
        misc: configProperty[]) {
        this.binds = binds;
        this.setas = setas;
        this.setaus = setaus;
        this.misc = misc;
    }

    registerObserver(o: Observer) {
        this.observers.push(o);
    }

    removeObserver(o: Observer) {
        const index = this.observers.findIndex(obs => obs === o);

        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    notifyObservers(key: string) {
        this.observers.forEach(obs => {
            obs.update(key);
        });
    }

    private sortBinds() {
        this.binds = this.binds.sort((a: configProperty, b: configProperty) => {
            return a.property.localeCompare(b.property);
        });
    }

    getBinds() {
        this.sortBinds();
        return this.binds;
    }

    getSetas() {
        return this.setas;
    }

    getMisc() {
        return this.misc;
    }

    deleteBind(key: string) {
        const index = this.binds.findIndex(bind => bind.property.toLowerCase() === key.toLowerCase());
        if (index > -1) {
            this.binds[index].remove = true;
            this.notifyObservers(key);
            this.binds.splice(index, 1);
        }
    }

    setBind(key: string, value: string) {
        const property = this.binds.find(property => property.property === key);

        if (!property) {
            this.binds.push({
                type: 'bind',
                property: key,
                value,
                containsColors: /\^[0-9]/.test(value)
            });
        } else {
            property.property = key;
            property.value = value;
            property.containsColors = /\^[0-9]/.test(value);
        }

        this.notifyObservers(key);
    }

    getBind(key: string) {
        return this.binds.find(bind => bind.property.toLowerCase() === key.toLowerCase());
    }

    static getBindContent(bind: configProperty): bindParts {
        const regex = /(\S+) *(([\S]+)(.*))/gm;
        const value = bind.value;
        const parts = value.split(';');

        const says = [];
        const saysTeam = [];
        const vsays = [];
        const vsaysTeam = [];
        const misc = [];

        let orderChats: ChatType[] = [];
        let weapon;

        parts.forEach(part => {
            const matchParts = [];
            let match;

            while ((match = regex.exec(part)) !== null) {
                match.forEach((match: any, index) => {
                    matchParts.push(match);
                })
            }

            const cmd = matchParts[1];

            switch (cmd) {
                case 'say':
                    says.push(matchParts[2]);
                    orderChats.push(ChatType.Say);
                    break;
                case 'say_team':
                    saysTeam.push(matchParts[2]);
                    orderChats.push(ChatType.SayTeam);
                    break;
                case 'vsay':
                    vsays.push([matchParts[3], (matchParts[4] || '')]);
                    orderChats.push(ChatType.Vsay);
                    break;
                case 'vsay_team':
                    vsaysTeam.push([matchParts[3], (matchParts[4] || '')]);
                    orderChats.push(ChatType.VsayTeam);
                    break;
                case 'use':
                    weapon = matchParts[2];
                    break;
                default:
                    if (matchParts[0]) {
                        misc.push(matchParts[0]);
                    }
            }
        });
        return { says, saysTeam, vsays, vsaysTeam, misc, weapon, orderChats };
    }

    setSeta(cmd: string, value: string) {
        const property = this.setas.find(property => property.property.toLowerCase() === cmd.toLowerCase());

        if (!property) {
            this.setas.push({
                type: 'seta',
                property: cmd,
                value,
                containsColors: /\^[0-9]/.test(value)
            });
        } else {
            property.property = cmd;
            property.value = value;
            property.containsColors = /\^[0-9]/.test(value);
        }
    }

    getSeta(cmd: string) {
        return this.setas.find(seta => seta.property.toLowerCase() === cmd.toLowerCase());
    }

    setSetau(cmd: string, value: string) {
        const property = this.setaus.find(property => property.property.toLowerCase() === cmd.toLowerCase());

        if (!property) {
            this.setaus.push({
                type: 'setau',
                property: cmd,
                value,
                containsColors: /\^[0-9]/.test(value)
            });
        } else {
            property.property = cmd;
            property.value = value;
            property.containsColors = /\^[0-9]/.test(value);
        }
    }

    getSetau(cmd: string) {
        return this.setaus.find(setau => setau.property.toLowerCase() === cmd.toLowerCase());
    }

    generateConfig() {
        let config = '// Generated by slice warsow config editor\n\n';
        config += '// Key bindings\n';
        config += 'unbindall\n';

        this.binds.forEach(bind => {
            config += `${bind.type} ${bind.property} "${bind.value}"\n`;
        });

        config += '\n\n';
        config += '// Variables\n';

        this.setaus.forEach(setau => {
            config += `${setau.type} ${setau.property} "${setau.value}"\n`;
        });

        this.setas.forEach(seta => {
            config += `${seta.type} ${seta.property} "${seta.value}"\n`;
        });

        config += '\n\n';
        config += '// Misc & aliases\n';
        config += 'unaliasall\n';

        this.misc.forEach(misc => {
            config += `${misc.type} ${misc.property} "${misc.value}"\n`;
        });

        return config;
    }
}