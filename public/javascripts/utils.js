// Utils functions.

let formatDelim = (value, decimalSeparator) => {
    if (isNaN(value)) return 'N/A';
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

// From W3schools.com
let includeHTML = async (classTag) => {
    return new Promise((resolve) => {
        let z, i, element, file, xhttp;
        z = document.getElementsByTagName("*");
        for (i = 0; i < z.length; i++) {
            element = z[i];
            file = element.getAttribute("w3-include-html");
            if (file) {
                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        if (this.status === 200) {
                            element.innerHTML = this.responseText.replace(classTag, "current")
                        }
                        if (this.status === 404) {
                            element.innerHTML = "Page not found.";
                        }
                        element.removeAttribute("w3-include-html");
                        includeHTML(classTag).then(() => {
                            resolve('ok');
                        });
                    }
                }
                xhttp.open("GET", file, true);
                xhttp.send();
                return resolve;
            }
        }
        resolve('ok');
    });

}

let getIconsHtml = (wallet) => {
    if (wallet) {
        let icons = wallet.split(",");
        let result = "";
        for (let i = 0; i < icons.length; i++) {
            result += `<img class="icon" title="${icons[i]}" ` +
                ` src="images/icons/${icons[i]}.png" alt="${icons[i]}">`;
        }
        return result;
    } else {
        return "";
    }
}

let getInfoIconHtml = (coin) => {
    if (coin && coin.id !== 'N/A') {
        return `<img class="icon" title="Info ${coin.name}" ` +
            ` src="images/rond-info.png" alt="Info ${coin.name}" ` +
            `onclick="showInfo('${coin.id}')">`;
    } else {
        return "";
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

let pad = (o) => {
    if (o > 9) {
        return o;
    } else {
        return "0" + o;
    }
}

const getDateFromDate = (d) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const getTimeFromDate = (d) => {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const toggleDarkMode = (checked) => {
    const theme = document.querySelector("#theme");
    if (checked === true) {
        theme.href = "/stylesheets/style-dark.css";
    } else {
        theme.href = "/stylesheets/style.css";
    }
}
const handleDarkMode = (checkbox) => {
    let wls = window.localStorage;
    let mode = "false";
    if (wls && wls.getItem("darkmode")) {
        mode = wls.getItem("darkmode") === 'true';
        toggleDarkMode(mode);
        $('#darkmode').attr('checked', mode);
    }
    checkbox.addEventListener('click', () => {
        let checked = document.getElementById('darkmode').checked;
        toggleDarkMode(checked);
        if (wls) {
            wls.setItem('darkmode', checked);
        }
    });
}
const sortArray = (a, b) => {
    if (a.id < b.id) return -1;
    else if (a.id > b.id) return 1;
    else return 0;
}
const sortArrayOnSymbol = (a, b) => {
    if (a.symbol < b.symbol) return -1;
    else if (a.symbol > b.symbol) return 1;
    else return 0;
}
const getIndexInArray = (arr, o) => {
    return arr.findIndex(crypto => crypto.id === o.id && crypto.symbol === o.symbol && crypto.name === o.name);
}

const getEvolutionFontSize = () => {
    let wls = window.localStorage;
    return wls && wls.getItem("evolutionFontSize") ? parseInt(wls.getItem("evolutionFontSize")) : 14;
}

const setEvolutionFontSize = (fontSize) => {
    let wls = window.localStorage;
    if (wls) {
        wls.setItem('evolutionFontSize', fontSize);
    }
}





