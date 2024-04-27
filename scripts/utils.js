const path = require("path");
const fs = require("fs/promises");


const fieldSorter = (fields) => (a, b) => fields.map(o => {
    let dir = 1;
    if (o[0] === '-') { dir = -1; o=o.substring(1); }
    return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
}).reduce((p, n) => p ? p : n, 0);

const dateSorter = (a, b) => {
    return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
}

let pad = (o) => {
    if (o>9) {
        return o;
    } else {
        return "0"+o;
    }
}

const getDateFromDate = (d) => {
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

const getTimeFromDate = (d) => {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const buildIconsDir = async () => {
    let srcIcons = path.join(__dirname, '../demo/icons/');
    let destIcons = path.join(__dirname, '../public/images/icons/');
    let files = await fs.readdir(destIcons);
    if (files.length === 0) {
        return await fs.cp(srcIcons, destIcons, {recursive:true}, (error) => {
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