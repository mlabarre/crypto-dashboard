const path = require("path");
const fs = require("fs/promises");

const formatDelim = (value, decimalSeparator) => {
    let i, j, chain, c, deb, fin, mantissa = '';
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

const   fieldSorter = (fields) => (a, b) => fields.map(o => {
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

const pad = (o) => {
    if (o > 9) {
        return o;
    } else {
        return "0" + o;
    }
}

const getDateAsAAAAMMDD = (ts) => {
    let d = new Date(ts);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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

const formatAMPM = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) + ' ' + ampm;
}

const getDateTimeForenEN = (d) => {
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${formatAMPM(d)}`;
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

const storeUniqueInArray = (arr, item) => {
    if (!arr.includes(item)) {
        arr.push(item);
    }
}
exports.fieldSorter = fieldSorter
exports.dateSorter = dateSorter
exports.getDateFromDate = getDateFromDate
exports.getTimeFromDate = getTimeFromDate
exports.buildIconsDir = buildIconsDir
exports.getFormattedDate = getFormattedDate
exports.formatDelim = formatDelim
exports.storeUniqueInArray = storeUniqueInArray
exports.getDateAsAAAAMMDD = getDateAsAAAAMMDD
exports.getDateTimeForenEN = getDateTimeForenEN;