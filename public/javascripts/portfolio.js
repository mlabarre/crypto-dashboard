let lastSortField = "token";
let lastSortDirection = "A";
let dontShowLower = false;

const signRate = (rate) => {
    if (rate) {
        if (rate >= 0) {
            return '<span class="plus">&nearr;&nbsp;' +
                Math.abs(rate).toFixed(2).replace(".", ds) + ' %' + '</span>';
        } else {
            return '<span class="minus">&searr;&nbsp;' +
                Math.abs(rate).toFixed(2).replace(".", ds) + ' %' + '</span>';
        }
    } else {
        return "";
    }
}

const buildRowPerWallet = (crypto, first) => {
    let row;
    if (crypto.token === "") { // Total
        row = `<tr><td></td><td></td><td class="num total">Total</td>` +
            `<td class="num total">${formatDelim(((crypto.value * 100) / 100).toFixed(2), ds)}</td></tr>`;
    } else {
        let wallet = first ? getIconsHtml(crypto.wallet) + '&nbsp;&nbsp;<span>' + crypto.wallet : '';
        let value = (crypto.value === "N/A") ? "N/A" : formatDelim(((crypto.value * 100) / 100).toFixed(2), ds);
        row = `<tr><td>${wallet}</span></td><td>${crypto.token}</td>` +
            `<td class="num">${formatDelim(((crypto.nb * 10000) / 10000).toFixed(4), ds)}</td>` +
            `<td class="num">${value}</td></tr>`;
    }
    $('#cryptosPerWallet').append(row);
}

const getTokenIconHtml = (crypto) => {
    if (crypto.image !== undefined && crypto.image !== "") {
        return `<img class="icon clickable" src="${crypto.image}" onclick="showInfo('${crypto.id}')">`;
    } else {
        return "";
    }
}

const buildRoiHtml = (roi) => {
    if (roi === null) {
        return "<td></td>"
    } else {
        if (roi < 0) {
            return `<td class="num minus">${roi.toFixed(2)}</td>`;
        } else {
            return `<td class="num plus">+${roi.toFixed(2)}</td>`;
        }
    }
}

const buildRowPerToken = (crypto) => {
    let wallets = crypto.wallets.split(",");
    let images = "";
    for (let i = 0; i < wallets.length; i++) {
        images += getIconsHtml(wallets[i]);
    }
    let value = (crypto.value === "N/A") ? "N/A" : formatDelim(((crypto.value * 100) / 100).toFixed(2), ds);
    let row = `<tr><td>${getTokenIconHtml(crypto)}</td>` +
        `</td><td><span>${crypto.token}</span></td><td>${images}</td>` +
        `<td class="num">${formatDelim(((crypto.nb * 10000) / 10000).toFixed(4), ds)}</td>` +
        `<td class="num">${value}</td>` +
        `<td class="num">${formatDelim(((crypto.invest * 100)/100).toFixed(2), ds)}</td>` +
        `${buildRoiHtml(crypto.roi)}` +
        `<td>${signRate(crypto.price24Percent)}</td>` +
        `</tr>`
    $('#cryptosPerToken').append(row);
}

const showInfo = (coinId) => {
    window.location = `/showTokenInfo?id=${coinId}&returnUrl=/portfolio&header=h-portfolio`;
}

const display = (jsonData) => {
    $('#cryptosPerWallet').find('tbody tr').remove()
    $('#cryptosPerToken').find('tbody tr').remove()
    let currentWallet = "";
    $('#balance').text(formatDelim(((jsonData.total * 100) / 100).toFixed(2), ds));
    for (let i = 0; i < jsonData.perWallet.length; i++) {
        let crypto = jsonData.perWallet[i];
        if (currentWallet !== crypto.wallet) {
            currentWallet = crypto.wallet;
            buildRowPerWallet(crypto, true);
        } else {
            buildRowPerWallet(crypto, false);
        }
    }
    for (let i = 0; i < jsonData.perToken.length; i++) {
        let crypto = jsonData.perToken[i];
        buildRowPerToken(crypto);
    }
}

const sortTable = (sortField) => {
    if (sortField === lastSortField) {
        lastSortDirection = lastSortDirection === "A" ? "D" : "A";
    }
    lastSortField = sortField;
    getTokens();
}

const getTokens = () => {
    $.ajax(
        {
            type: "GET",
            url: `/api/portfolio?dontShowLower=${dontShowLower}&sortField=${lastSortField}&sortDirection=${lastSortDirection}`,
            contentType: "application/json; charset=utf-8",
            accept: "application/json; charset=utf-8"
        })
        .done((data) => {
            display(data);
        })
        .fail((error) => {
            alert(error);
        })
}

const reload = () => {
    getTokens();
    setDate();
}

const init = () => {
    document.querySelector("#dontShowlower").addEventListener("change", (e) => {
        dontShowLower = document.querySelector('#dontShowlower').checked;
        console.log(dontShowLower)
        reload();
    });
    reload();
    setInterval(reload, parseInt(refresh) * 1000);
}

includeHTML("h-portfolio").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});
