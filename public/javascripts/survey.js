//
// ALERTS
//
let globalAlert = false;
let globalAlertValue;
let allAlerts = [];
let tokenAlert = "";

let showAllTokenAlertTitle = () => {
    $('.all_token').show();
    $('.one_token').hide();
}

let showOneTokenAlertTitle = () => {
    $('.all_token').hide();
    $('.one_token').show();
}

let initAlertsVariables = () => {
    $('#alert_gt_5mn').val('');
    $('#alert_lt_5mn').val('');
    $('#alert_gt_1h').val('');
    $('#alert_lt_1h').val('');
    $('#alert_gt_24h').val('');
    $('#alert_lt_24h').val('');
    $('#alert_gt_1w').val('');
    $('#alert_lt_1w').val('');
}

let setAlertsVariables = (alertToken) => {
    $('#alert_gt_5mn').val(alertToken.gt5mn < 0 ? '' : alertToken.gt5mn);
    $('#alert_lt_5mn').val(alertToken.lt5mn < 0 ? '' : alertToken.lt5mn);
    $('#alert_gt_1h').val(alertToken.gt1h < 0 ? '' : alertToken.gt1h);
    $('#alert_lt_1h').val(alertToken.lt1h < 0 ? '' : alertToken.lt1h);
    $('#alert_gt_24h').val(alertToken.gt24h < 0 ? '' : alertToken.gt24h);
    $('#alert_lt_24h').val(alertToken.lt24h < 0 ? '' : alertToken.lt24h);
    $('#alert_gt_1w').val(alertToken.gt1w < 0 ? '' : alertToken.gt1w);
    $('#alert_lt_1w').val(alertToken.lt1w < 0 ? '' : alertToken.lt1w);
}

let showAlertPanel = () => {
    $('.alerts').show();
    $('.evolution').hide();
    $('.cryptos').hide();
}

let initAlerts = () => {
    showEvolutionPanel();
    tokenAlert = "";
    globalAlert = false;
    globalAlertValue = undefined;
    allAlerts = [];
}

// Called by icon click.
let handleAlertPanel = (token) => {
    tokenAlert = token;
    showAlertPanel();
    $('#alertDel').hide();
    if (token === '_all_tokens_') {
        showAllTokenAlertTitle();
    } else {
        showOneTokenAlertTitle();
        $('#alert_token').text(token);
    }
    let alertToken = findAlertInArray(token);
    if (alertToken !== undefined) {
        setAlertsVariables(alertToken);
        if (token === '_all_tokens_') {
            $('#alertDel').hide();
        } else {
            $('#alertDel').show();
        }
    } else {
        initAlertsVariables();
        $('#alertDel').hide();
        if (allAlerts.length === 0) {
            $('#alertCancel').hide();
        }
    }
}

let findAlertInArray = (token) => {
    for (let i = 0; i < allAlerts.length; i++) {
        if (allAlerts[i].token === token) {
            return allAlerts[i];
        }
    }
}

let setAlerts = (alerts) => {
    allAlerts = alerts;
    globalAlertValue = findAlertInArray('_all_tokens_');
    globalAlert = globalAlertValue !== undefined;
}

let delAlert = () => {
    $.ajax(
        {
            url: `/api/alert-survey?token=${tokenAlert}`,
            method: "DELETE",
            dataType: "json",
            success: (data) => {
                getDatas();
                showEvolutionPanel();
            },
            error: (xhr, status, error) => {
                console.log(error)
            }
        }
    )
}

let cancelAlert = () => {
    showEvolutionPanel();
}

let addOrUpdateAlert = () => {
    let json = {
        token: tokenAlert,
        gt5mn: $('#alert_gt_5mn').val() === '' ? -1.0 : parseFloat($('#alert_gt_5mn').val()),
        lt5mn: $('#alert_lt_5mn').val() === '' ? -1.0 : parseFloat($('#alert_lt_5mn').val()),
        gt1h: $('#alert_gt_1h').val() === '' ? -1.0 : parseFloat($('#alert_gt_1h').val()),
        lt1h: $('#alert_lt_1h').val() === '' ? -1.0 : parseFloat($('#alert_lt_1h').val()),
        gt24h: $('#alert_gt_24h').val() === '' ? -1.0 : parseFloat($('#alert_gt_24h').val()),
        lt24h: $('#alert_lt_24h').val() === '' ? -1.0 : parseFloat($('#alert_lt_24h').val()),
        gt1w: $('#alert_gt_1w').val() === '' ? -1.0 : parseFloat($('#alert_gt_1w').val()),
        lt1w: $('#alert_lt_1w').val() === '' ? -1.0 : parseFloat($('#alert_lt_1w').val())
    }
    console.log(JSON.stringify(json))
    $.ajax(
        {
            url: "/api/alert-survey",
            method: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(json),
            success: (data) => {
                getDatas();
                showEvolutionPanel();
            },
            error: (xhr, status, error) => {
                console.log(error)
            }
        }
    )
}

let setGeneralAlertIconHtml = () => {
    let html = `<i class="fa-solid fa-bell alert clickable bell orange" onclick="handleAlertPanel('_all_tokens_')" ` +
        `title=${titleGenAlert}></i>`;
    $('.generalAlert').html(html);
    return html;
}

let buildAlertIconHtml = (token) => {
    let html;
    if (findAlertInArray(token) !== undefined) {
        html = `<i class="fa-solid fa-bell alert clickable bell orange" onclick="handleAlertPanel('${token}')" ` +
            `title="${titleBuildAlert1} ${token}"></i>`;
    } else {
        html = `<i class="fa-solid fa-bell-slash alert clickable bell" onclick="handleAlertPanel('${token}')" ` +
            `title="${titleBuildAlert2} ${token}"></i>`;
    }
    return html;
}

//
// EVOLUTION
//

let lastSortField = "variation";
let lastSortDirection = "D";

let showEvolutionPanel = () => {
    $('.alerts').hide();
    $('.evolution').show();
    $('.cryptos').hide();
}

let signRate = (rate) => {
    if (rate.indexOf("-") >= 0) {
        return '<span class="down">&searr;&nbsp;' + rate.substring(1).replace(".", ds) + ' %' + '</span>';
    } else {
        return '<span class="up">&nearr;&nbsp;' + rate.replace(".", ds) + ' %' + '</span>';
    }
}

let fill = (data) => {
    $('.alerts').hide();
    setAlerts(data.result.alerts);
    surveyCryptosList = data.result.tokens;
    if (allAlerts.length === 0) {
        // Require a global alert before working
        showAlertPanel();
        handleAlertPanel('_all_tokens_');
        return;
    }
    showEvolutionPanel();
    setGeneralAlertIconHtml();
    let tokens = data.result.tokens;
    $.each(tokens, (no) => {
        let coin = tokens[no];
        let infoHtml = getInfoIconHtml(coin);
        let html = `<tr><td>${infoHtml} ${coin.id}</td>` +
            `<td class="rate">${coin.symbol.toUpperCase()}</td><td>${coin.name}</td>`;
        if (coin.quotation !== undefined && coin.quotation !== '') {
            html += `<td class="num">${formatDelim(((coin.quotation * 100) / 100).toFixed(8), ds)}</td>` +
                `<td class="num">${formatDelim(((coin.quotation_usdt * 100) / 100).toFixed(8), ds)}</td>` +
                `<td class="rate">${signRate(((coin.variation_on_five_minutes * 100) / 100).toFixed(2), ds)}</td>` +
                `<td class="rate">${signRate(((coin.variation_on_one_hour * 100) / 100).toFixed(2), ds)}</td>` +
                `<td class="rate">${signRate(((coin.variation_on_one_day * 100) / 100).toFixed(2), ds)}</td>` +
                `<td class="rate">${signRate(((coin.variation_on_one_week * 100) / 100).toFixed(2), ds)}</td>`;
        } else {
            html += `<td colspan="6">${msgFill}</td>`
        }
        html += `<td class="rate">${buildAlertIconHtml(coin.symbol.toUpperCase())}</td>` +
            `<td class="action indic-moins"><span onclick="delCrypto('${coin.id}')" title="${titleFill}">-` +
            `</span></td></tr>`
        $('#cryptos').append(html);
    })
}

let showInfo = (coinId) => {
    window.location = `/showTokenInfo?id=${coinId}&returnUrl=/survey&header=h-survey`;
}

let sortTable = (sortField) => {
    if (sortField === lastSortField) {
        lastSortDirection = lastSortDirection === "A" ? "D" : "A";
    }
    lastSortField = sortField;
    getDatas();
}

let getDatas = () => {
    $('#cryptos').find('tbody tr').remove();
    initAlerts();
    $.ajax(
        {
            url: "/api/evolution-survey?sortField=" + lastSortField + "&sortDirection=" + lastSortDirection,
            method: "GET",
            dataType: "json",
            success: (data) => {
                fill(data);
            },
            error: (xhr, status, error) => {
                console.log(error)
            }
        }
    )
}

//
// CRYPTOS
//

let availableCryptoShown = false;
let surveyCryptosList = null;
let availableCryptosList = null;

let showMessage = () => {
    $('.message').css('color', 'white');
}

let hideMessage = () => {
    $('.message').css('color', 'black');
}

let showCryptosPanel = () => {
    $('.alerts').hide();
    $('.evolution').hide();
    $('.cryptos').show();
}

let addAvailableCryptosRow = async (row) => {
    let r = `<tr><td id="id">${row.id}</td><td id="symbol">${row.symbol}</td><td id="name">${row.name}</td>` +
        `<td class="action" onclick="addSurveyCrypto(this)">` +
        `<span class="indic-plus" title="${msgAddAvailable}">+</span></td></tr>`
    $('#availableCryptosTable').append(r);
}

let removeSurveyCryptosFromAvailableCryptos = async () => {
    for (let i = 0; i < surveyCryptosList.length; i++) {
        let index = getIndexInArray(availableCryptosList, surveyCryptosList[i]);
        availableCryptosList.splice(index, 1);
    }
    return availableCryptosList;
}

let buildAvailableCryptos = async () => {
    showMessage();
    $('#availableCryptosTable').find('tbody tr').remove();
    availableCryptosList = await getAvailableCryptos();
    await removeSurveyCryptosFromAvailableCryptos();
    for (let i = 0; i < availableCryptosList.length; i++) {
        await addAvailableCryptosRow(availableCryptosList[i]);
    }
    if ($('#criteria').val() !== "") {
        doFilter();
    }
    hideMessage();
}

let closeCryptos = () => {
    stopRefresh();
    getDatas();
}

let addSurveyCrypto = (o) => {
    let tr = o.closest("tr");
    let children = tr.children;
    let crypto = {"id": children[0].innerText, "symbol": children[1].innerText, "name": children[2].innerText}
    addToCollection(JSON.stringify(crypto)).then((data) => {
        tr.hidden = true;
        alert(`Crypto ${crypto.name} ${wordSurvey}`)
    })

}

let addToCollection = (crypto) => {
    return $.ajax({
        type: "POST",
        url: "/api/add-to-cryptos-survey",
        contentType: "application/json; charset=utf-8",
        data: crypto
    })
}

let getAvailableCryptos = async () => {
    return $.ajax({
        type: "GET",
        url: "/api/get-available-cryptos",
        contentType: "application/json; charset=utf-8"
    })
}

let addCrypto = () => {
    showCryptosPanel();
    stopRefresh();
    buildAvailableCryptos().then(() => {
        hideMessage();
    })
}

let delCrypto = (id) => {
    $.ajax({
        type: "DELETE",
        url: `/api/delete-crypto-survey?id=${id}`,
        contentType: "application/json; charset=utf-8"
    }).then((res) => {
        getDatas();
    })
}

let findInFields = (criteria, child) => {
    let from = `${child[0].textContent} ${child[1].textContent} ${child[2].textContent}`;
    return from.toLowerCase().indexOf(criteria.toLowerCase()) < 0;
}

let doFilter = (type) => {
    let criteria = $('#criteria').val();
    $('#availableCryptosTable').find('tbody').find('tr').each((r, raw) => {
        if (type === "all") {
            raw.hidden = findInFields(criteria, raw.children) === true;
        } else {
            raw.hidden = raw.children[1].textContent.toLowerCase().indexOf(criteria.toLowerCase()) < 0;
        }
    })
}

let resetFilter = () => {
    $('#availableCryptosTable').find('tbody').find('tr').each((r, raw) => {
        raw.hidden = false;
    })
    $('#criteria').val("");
}

//
// GLOBAL
//

let reload = () => {
    getDatas();
    setDate();
}

let intervalId = null;

let startRefresh = () => {
    intervalId = setInterval(reload, parseInt(refresh) * 1000);
}

let stopRefresh = () => {
    clearInterval(intervalId);
    intervalId = null;
}

let init = () => {
    reload();
    startRefresh();
    return 1;
}

includeHTML("h-survey").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});
