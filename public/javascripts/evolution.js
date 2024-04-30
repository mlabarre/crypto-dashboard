let globalAlert = false;
let globalAlertValue;
let allAlerts = [];
let tokenAlert = "";

//
// ALERTS
//
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

let hideAlertPanel = () => {
    $('.alerts').hide();
    $('.non-alerts').show();
}

let initAlerts = () => {
    hideAlertPanel();
    tokenAlert = "";
    globalAlert = false;
    globalAlertValue = undefined;
    allAlerts = [];
}

// Called by icon click.
let showAlertPanel = (token) => {
    tokenAlert = token;
    $('.alerts').show();
    $('.non-alerts').hide();
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
        $('#alertDel').show();
    } else {
        initAlertsVariables();
        $('#alertDel').hide();
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
            url: `/api/alert?token=${tokenAlert}`,
            method: "DELETE",
            dataType: "json",
            success: (data) => {
                getDatas();
                hideAlertPanel();
            },
            error: (xhr, status, error) => {
                console.log(error)
            }
        }
    )
}

let cancelAlert = () => {
    hideAlertPanel();
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
            url: "/api/alert",
            method: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(json),
            success: (data) => {
                getDatas();
                hideAlertPanel();
            },
            error: (xhr, status, error) => {
                console.log(error)
            }
        }
    )
}

let setGeneralAlertIconHtml = () => {
    let html;
    if (globalAlert === true) {
        html = `<i class="fa-solid fa-bell alert clickable bell orange" onclick="showAlertPanel('_all_tokens_')" ` +
            `title="${titleGenAlert1}"></i>`;
    } else {
        html = `<i class="fa-solid fa-bell-slash alert clickable bell" onclick="showAlertPanel('_all_tokens_')" ` +
            `title="${titleGenAlert2}"></i>`;
    }
    $('.generalAlert').html(html);
    return html;
}

let buildAlertIconHtml = (token) => {
    let html;
    if (findAlertInArray(token) !== undefined) {
        html = `<i class="fa-solid fa-bell alert clickable bell orange" onclick="showAlertPanel('${token}')" ` +
            `title="${titleBuildAlert1} ${token}"></i>`;
    } else {
        html = `<i class="fa-solid fa-bell-slash alert clickable bell" onclick="showAlertPanel('${token}')" ` +
            `title="${titleBuildAlert2} ${token}"></i>`;
    }
    return html;
}

//
// EVOLUTION
//

let lastSortField = "variation";
let lastSortDirection = "D";
let fontSize = 14;

let signRate = (rate) => {
    if (rate.indexOf("-") >= 0) {
        return '<span class="down">&searr;&nbsp;' + rate.substring(1).replace(".", ds) + ' %' + '</span>';
    } else {
        return '<span class="up">&nearr;&nbsp;' + rate.replace(".", ds) + ' %' + '</span>';
    }
}

let setBalance = (balance) => {
    $('#amount').text(formatDelim(balance.amount.toFixed(2), ds));
    $('#variation').html(signRate(balance.variation.toFixed(2)));
}

let fill = (data) => {
    $('.alerts').hide();
    setAlerts(data.result.alerts);
    setGeneralAlertIconHtml();
    let tokens = data.result.tokens;
    $.each(tokens, (no) => {
        let coin = tokens[no];
        if (coin.id !== "N/A") {
            $('#cryptos').append('<tr><td>' + coin.name + '</td>' +
                '<td class="rate">' + coin.symbol.toUpperCase() + '</td>' +
                '<td class="num">' + formatDelim(((coin.start_price * 100) / 100).toFixed(8), ds) + '</td>' +
                '<td class="num">' + formatDelim(((coin.start_price_usdt * 100) / 100).toFixed(8), ds) + '</td>' +
                '<td class="num">' + formatDelim(((coin.quotation * 100) / 100).toFixed(8), ds) + '</td>' +
                '<td class="num">' + formatDelim(((coin.quotation_usdt * 100) / 100).toFixed(8), ds) + '</td>' +
                '<td class="num">' + formatDelim(((coin.tokens * 10000) / 10000).toFixed(4), ds) + '</td>' +
                '<td class="num">' + formatDelim((((coin.tokens * coin.quotation) * 100) / 100).toFixed(2), ds) + '</td>' +
                '<td class="rate">' + signRate(((coin.variation * 100) / 100).toFixed(2), ds) + '</td>' +
                '<td class="rate">' + signRate(((coin.variation_on_five_minutes * 100) / 100).toFixed(2), ds) + '</td>' +
                '<td class="rate">' + signRate(((coin.variation_on_one_hour * 100) / 100).toFixed(2), ds) + '</td>' +
                '<td class="rate">' + signRate(((coin.variation_on_one_day * 100) / 100).toFixed(2), ds) + '</td>' +
                '<td class="rate">' + signRate(((coin.variation_on_one_week * 100) / 100).toFixed(2), ds) + '</td>' +
                '<td class="rate">' + getIconsHtml(coin.wallet) + '</td>' +
                '<td class="rate">' + buildAlertIconHtml(coin.symbol.toUpperCase()) + '</td>' +
                '<td class="rate">' + getInfoIconHtml(coin) + '</td>' +
                '</tr>');
        } else {
            $('#cryptos').append(`<tr><td></td><td class="rate">${coin.symbol.toUpperCase()}</td>` +
                `<td colspan="11">` +
                `${infoICO} : ` +
                `${formatDelim(((coin.tokens * 10000) / 10000).toFixed(4), ds)} tokens à ` +
                `${formatDelim(((coin.start_price * 100) / 100).toFixed(8), ds)}` +
                ` ${coin.currency}</td>` +
                `<td class="rate">${getIconsHtml(coin.wallet)}</td><td></td><td></td></tr>`)
        }
    })
    setBalance(data.result.balance)
    changeBellSize();
}

let sortTable = (sortField) => {
    if (sortField === lastSortField) {
        lastSortDirection = lastSortDirection === "A" ? "D" : "A";
    }
    lastSortField = sortField;
    getDatas();
}

let showInfo = (coinId) => {
    window.location = `/showTokenInfo?id=${coinId}&returnUrl=/evolution&header=h-evolution`;
}

let getDatas = () => {
    $('#cryptos').find('tbody tr').remove();
    initAlerts();
    $.ajax(
        {
            url: "/api/evolution?sortField=" + lastSortField + "&sortDirection=" + lastSortDirection,
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

let changeBellSize = () => {
    const bells = document.querySelectorAll('.bell');
    bells.forEach(bell => {
        bell.style.fontSize = '16px';
    });
}

let changeTableFontSize = () => {
    document.getElementsByClassName("styled-table")[0].style["font-size"] = fontSize + "px";
}

let changeFontSize = (direction) => {
    if (direction === "up") {
        fontSize += 1;
    } else {
        if (fontSize >= 6) {
            fontSize -= 1;
        }
    }
    setEvolutionFontSize(fontSize);
    changeTableFontSize();
    changeBellSize();
}

let reload = () => {
    getDatas();
    setDate();
}

let init = () => {
    reload();
    fontSize = getEvolutionFontSize();
    changeTableFontSize();
    setInterval(reload, parseInt(refresh) * 1000);
    $('#sizeup').on('click', () => {
        changeFontSize('up');
    });
    $('#sizedown').on('click', () => {
        changeFontSize('down');
    });
    return 1;
}

includeHTML("h-evolution").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});



