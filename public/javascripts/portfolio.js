
let buildRowPerWallet = (crypto, first) => {
    let row;
    if (crypto.token === "") {
        row = `<tr><td></td><td></td><td class="num total">Total</td>` +
            `<td class="num total">${formatDelim(((crypto.value * 100) / 100).toFixed(2), ds)}</td></tr>`;
    } else {
        let wallet = first ? getIconsHtml(crypto.wallet) + '&nbsp;&nbsp;<span>' + crypto.wallet : '';
        row = `<tr><td>${wallet}</span></td><td>${crypto.token}</td>` +
            `<td class="num">${formatDelim(((crypto.nb * 10000) / 10000).toFixed(4), ds)}</td>` +
            `<td class="num">${formatDelim(((crypto.value * 100) / 100).toFixed(2), ds)}</td></tr>`;
    }
    $('#cryptosPerWallet').append(row);
}

let buildRowPerToken = (crypto) => {
    let wallets = crypto.wallets.split(",");
    let images = "";
    for (let i = 0; i < wallets.length; i++) {
        images += getIconsHtml(wallets[i]);
    }
    let row = `<tr><td><span>${crypto.token}</span></td><td>${images}</td>` +
        `<td class="num">${formatDelim(((crypto.nb * 10000) / 10000).toFixed(4), ds)}</td>` +
        `<td class="num">${formatDelim(((crypto.value * 100) / 100).toFixed(2), ds)}</td></tr>`;
    $('#cryptosPerToken').append(row);
}

let display = (jsonData) => {
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
let getTokens = () => {
    $.ajax(
        {
            type: "GET",
            url: "/api/portfolio",
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

includeHTML("h-portfolio").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});

let reload = () => {
    getTokens();
    setDate();
}

let init = () => {
    reload();
    setInterval(reload, parseInt(refresh) * 1000);
}

