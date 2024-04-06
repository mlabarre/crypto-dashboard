// Utils functions.

let formatDelim = (value) => {
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
    return chain.replace(".", ",")
}

// From W3schools.com
function includeHTML(classTag) {
    let z, i, element, file, xhttp;
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        element = z[i];
        file = element.getAttribute("w3-include-html");
        if (file) {
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        element.innerHTML = this.responseText.replace(classTag, "current")}
                    if (this.status === 404) {element.innerHTML = "Page not found.";}
                    element.removeAttribute("w3-include-html");
                    includeHTML(classTag);
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            return;
        }
    }
}

let getIconsHtml = (wallet) => {
    if (wallet) {
        let icons = wallet.split(",");
        let result = "";
        for (let i = 0; i < icons.length; i++) {
            result += '<img class="icon" title="' + icons[i] +
                '" src="images/icons/' + icons[i] + '.png" alt="' + icons[i] + '">';
        }
        return result;
    } else {
        return "";
    }
}

let getFormattedDate = () => {
    return new Date().toLocaleString('fr-FR', {
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
    if (o>9) { return o; } else { return "0"+o; }
}

const getDateFromDate = (d) => {
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

const getTimeFromDate = (d) => {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

