// @ts-nocheck
export class WarsowColors {
    static parseColors(str: string) {
        str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const results = str.match(/\^[0-9]/g);

        if (!results) {
            return str;
        }

        results.forEach((result, index) => {
            if (index === 0) {
                str = str.replace(result, `<span class="c${results[index][1]}">`);
                return;
            }

            const indexEndSpan = str.indexOf(result);
            str = str.substring(0, indexEndSpan) + '</span>' + str.substring(indexEndSpan, str.length);
            str = str.replace(result, `<span class="c${results[index][1]}">`);
        });

        str += '</span>';
        return str;
    }

    static generateColorPalatte(parentElClass: string, inputId: string) {
        const parent = document.querySelector(`.${parentElClass}`) as HTMLElement;
        const input = document.getElementById(inputId) as HTMLInputElement;

        // 10 colors 0-9
        for (let i = 0; i < 10; i++) {
            const colorDivEl = document.createElement('div') as HTMLDivElement;
            colorDivEl.className = `c${i}bg`;

            colorDivEl.addEventListener('mousedown', e => {
                const activeInput = document.activeElement as HTMLInputElement;

                e.target.lastActive = {
                    activeInput,
                    start: activeInput.selectionStart,
                    end: activeInput.selectionEnd
                };
            });

            colorDivEl.addEventListener('click', e => {
                const lastActive = e.target.lastActive;

                if (!(lastActive.activeInput instanceof HTMLInputElement)) {
                    return;
                }

                const value = lastActive.activeInput.value;
                lastActive.activeInput.value = value.substr(0, lastActive.start) + `^${i}` + value.substr(lastActive.end, value.length);
                lastActive.activeInput.focus();
                const pos = lastActive.end + `^${i}`.length;
                lastActive.activeInput.setSelectionRange(pos, pos);
            });

            parent.appendChild(colorDivEl);
        }
    }
}