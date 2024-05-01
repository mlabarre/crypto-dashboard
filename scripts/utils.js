const path = require("path");
const fs = require("fs/promises");

let formatDelim = (value, decimalSeparator) => {
    let i, j, chain, c, deb, fin, mantissa;
    fin = value.indexOf(".");
    if (fin < 0) fin = value.length;
    else mantissa = value.substring(fin, value.length);
    fin--;
    deb = value.indexOf("-");
    deb++;
    chain = "";
    for (i = fin, j = 0; i >= deb; i--, j++) {
        c = value.charAt(i);
        if (j % 3 === 0 && j !== 0) chain = c + " " + chain;
        else chain = c + chain;
    }
    if (deb === 1) chain = "-" + chain;
    if (fin >= 0) chain = chain + mantissa;
    chain = chain.replace(".", decimalSeparator)
    return decimalSeparator === '.' ? chain.replaceAll(' ', ',') : chain;
}

const fieldSorter = (fields) => (a, b) => fields.map(o => {
    let dir = 1;
    if (o[0] === '-') {
        dir = -1;
        o = o.substring(1);
    }
    return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
}).reduce((p, n) => p ? p : n, 0);

const dateSorter = (a, b) => {
    return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
}

let pad = (o) => {
    if (o > 9) {
        return o;
    } else {
        return "0" + o;
    }
}

let getFormattedDate = (lang, dateAsString) => {
    if (lang === undefined || lang === '') lang = 'fr-FR';
    let date = (dateAsString === undefined) ? new Date() : new Date(dateAsString);
    return date.toLocaleString(lang, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
}

const getDateFromDate = (d) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const getTimeFromDate = (d) => {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const buildIconsDir = async () => {
    let srcIcons = path.join(__dirname, '../demo/icons/');
    let destIcons = path.join(__dirname, '../public/images/icons/');
    let files = await fs.readdir(destIcons);
    if (files.length === 0) {
        return await fs.cp(srcIcons, destIcons, {recursive: true}, (error) => {
            if (error) {
                console.log(`Unable to copy icons : ${error}`)
            }
        })
    }

}

exports.fieldSorter = fieldSorter
exports.dateSorter = dateSorter
exports.getDateFromDate = getDateFromDate
exports.getTimeFromDate = getTimeFromDate
exports.buildIconsDir = buildIconsDir
exports.getFormattedDate = getFormattedDate
exports.formatDelim = formatDelim