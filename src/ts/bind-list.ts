import { Observer } from './observer';
import { EditorState } from './editor-state';
import { WarsowColors } from './color';

export class BindList implements Observer {
    private bindlistEl = document.querySelector('.bindlist ul');
    private state: EditorState;

    constructor(state: EditorState) {
        this.state = state;
        this.render();
    }

    update(key: string) {

    }

    private render() {
        const binds = this.state.getConfig().getBinds();
        binds.forEach(bind => {
            const liEl = document.createElement('li') as HTMLLIElement;

            const bindEl = document.createElement('div') as HTMLDivElement;

            const infoContainerEl = document.createElement('div') as HTMLDivElement;
            infoContainerEl.className = 'bind__info'

            bindEl.appendChild(infoContainerEl);

            const keyInfoEl = document.createElement('div') as HTMLDivElement;
            keyInfoEl.textContent = bind.property.toUpperCase();
            keyInfoEl.className = 'bind__key';

            const value = bind.containsColors ? WarsowColors.parseColors(bind.value) : bind.value;
            const valueInfoEl = document.createElement('div') as HTMLDivElement;
            valueInfoEl.innerHTML = value;
            valueInfoEl.className = 'bind__value';

            infoContainerEl.appendChild(keyInfoEl);
            infoContainerEl.appendChild(valueInfoEl);

            const controlsContainerEl = document.createElement('div') as HTMLDivElement;
            controlsContainerEl.className = 'bind__controls';

            bindEl.appendChild(controlsContainerEl);

            const editControlEl = document.createElement('a') as HTMLAnchorElement;
            editControlEl.className = 'bind__edit';
            editControlEl.textContent = 'Edit';
            editControlEl.href = '#';
            editControlEl.title = 'Edit bind';

            const removeControlEl = document.createElement('a') as HTMLAnchorElement;
            removeControlEl.className = 'bind__remove';
            removeControlEl.textContent = 'X';
            removeControlEl.title = 'Remove bind';
            removeControlEl.href = '#';

            controlsContainerEl.appendChild(editControlEl);
            controlsContainerEl.appendChild(removeControlEl);

            liEl.append(bindEl);
            bindEl.className = 'bind';

            this.bindlistEl.appendChild(liEl);
        });
    }
}