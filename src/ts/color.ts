export class WarsowColors {
    static parseColors(str: string) {
        const results = str.match(/\^[0-9]/g);

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
}