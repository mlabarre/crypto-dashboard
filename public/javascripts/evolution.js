let globalAlert = false;
let globalAlertValue;
let allAlerts = [];
let tokenAlert = "";
let intervalId;
let dontShowLower = false;

//
// ALERTS
//

const hideAlertPanel = () => {
    $('.alerts').hide();
    $('.non-alerts').show();
    setRefreshOn();
}

const initAlerts = () => {
    hideAlertPanel();
    tokenAlert = "";
    globalAlert = false;
    globalAlertValue = undefined;
    allAlerts = [];
}

// Called by icon click.
const showAlertPanel = (token) => {
    tokenAlert = token;
    let alertDel = $('#alertDel');
    $('.alerts').show();
    $('.non-alerts').hide();
    alertDel.hide();
    setRefreshOff();
    if (token === '_all_tokens_') {
        showAllTokenAlertTitle();
    } else {
        showOneTokenAlertTitle();
        $('#alert_token').text(token);
    }
    let alertToken = findAlertInArray(token);
    if (alertToken !== undefined) {
        setAlertsVariables(alertToken);
        alertDel.show();
    } else {
        initAlertsVariables();
        alertDel.hide();
    }
}

const delAlert = () => {
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

const cancelAlert = () => {
    hideAlertPanel();
}

const addOrUpdateAlert = () => {
    $.ajax(
        {
            url: "/api/alert",
            method: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(getAlertJson()),
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

const setGeneralAlertIconHtml = () => {
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

const buildAlertIconHtml = (token) => {
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

const signRate = (rate) => {
    if (rate.indexOf("-") >= 0) {
        return `<span class="down">&searr;&nbsp;${rate.substring(1).replace(".", ds)} % </span>`;
    } else {
        return `<span class="up">&nearr;&nbsp;${rate.replace(".", ds)} %</span>`;
    }
}

const setBalance = (balance) => {
    $('#amount').text(formatDelim(balance.amount.toFixed(2), ds));
    $('#variation').html(signRate(balance.variation.toFixed(2)));
}

const fill = (data) => {
    $('.alerts').hide();
    setAlerts(data.result.alerts);
    setGeneralAlertIconHtml();
    let tokens = data.result.tokens;
    $.each(tokens, (no) => {
        let coin = tokens[no];
        if (dontShowlower === false || coin.tokens * coin.quotation >= 1) {
            if (coin.id !== "N/A" || coin.ico === true) {
                $('#cryptos').append(`<tr><td>${coin.name}</td>` +
                    `<td class="rate">${coin.symbol.toUpperCase()}</td>` +
                    `<td class="num">${formatDelim(((coin.start_price * 100) / 100).toFixed(8), ds)}</td>` +
                    `<td class="num">${formatDelim(((coin.start_price_usdt * 100) / 100).toFixed(8), ds)}</td>` +
                    `<td class="num">${formatDelim(((coin.quotation * 100) / 100).toFixed(8), ds)}</td>` +
                    `<td class="num">${formatDelim(((coin.quotation_usdt * 100) / 100).toFixed(8), ds)}</td>` +
                    `<td class="num">${formatDelim(((coin.tokens * 10000) / 10000).toFixed(4), ds)}</td>` +
                    `<td class="num">${formatDelim((((coin.tokens * coin.quotation) * 100) / 100).toFixed(2), ds)}</td>` +
                    `<td class="rate">${signRate(((coin.variation * 100) / 100).toFixed(2), ds)}</td>` +
                    `<td class="rate">${signRate(((coin.variation_on_five_minutes * 100) / 100).toFixed(2), ds)}</td>` +
                    `<td class="rate">${signRate(((coin.variation_on_one_hour * 100) / 100).toFixed(2), ds)}</td>` +
                    `<td class="rate">${signRate(((coin.variation_on_one_day * 100) / 100).toFixed(2), ds)}</td>` +
                    `<td class="rate">${signRate(((coin.variation_on_one_week * 100) / 100).toFixed(2), ds)}</td>` +
                    `<td class="rate">${getIconsHtml(coin.wallet)}</td>` +
                    `<td class="rate">${buildAlertIconHtml(coin.symbol.toUpperCase())}</td>` +
                    `<td class="rate">${getInfoIconHtml(coin)}</td>` +
                    `</tr>`);
            } else {
                $('#cryptos').append(`<tr><td></td><td class="rate">${coin.symbol.toUpperCase()}</td>` +
                    `<td colspan="11">` +
                    `${infoICO} : ` +
                    `${formatDelim(((coin.tokens * 10000) / 10000).toFixed(4), ds)} tokens à ` +
                    `${formatDelim(((coin.start_price * 100) / 100).toFixed(8), ds)}` +
                    ` ${coin.currency}</td>` +
                    `<td class="rate">${getIconsHtml(coin.wallet)}</td><td></td><td></td></tr>`)
            }
        }
    })
    setBalance(data.result.balance)
    changeBellSize();
}

const sortTable = (sortField) => {
    if (sortField === lastSortField) {
        lastSortDirection = lastSortDirection === "A" ? "D" : "A";
    }
    lastSortField = sortField;
    getDatas();
}

const showInfo = (coinId) => {
    window.location = `/showTokenInfo?id=${coinId}&returnUrl=/evolution&header=h-evolution`;
}

const getDatas = () => {
    $('#cryptos').find('tbody tr').remove();
    initAlerts();
    $.ajax(
        {
            url: `/api/evolution?sortField=${lastSortField}&sortDirection=${lastSortDirection}`,
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

const changeBellSize = () => {
    const bells = document.querySelectorAll('.bell');
    bells.forEach(bell => {
        bell.style.fontSize = '16px';
    });
}

const changeTableFontSize = () => {
    document.getElementsByClassName("styled-table")[0].style["font-size"] = fontSize + "px";
}

const changeFontSize = (direction) => {
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

const reload = () => {
    getDatas();
    setDate();
}

const setRefreshOn = () => {
    if (!intervalId) {
        intervalId = setInterval(reload, parseInt(refresh) * 1000);
    }
}

const setRefreshOff = () => {
    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = null;
}

const init = () => {
    reload();
    fontSize = getEvolutionFontSize();
    changeTableFontSize();

    document.querySelector("#dontShowlower").addEventListener("change", (e) => {
        dontShowLower = document.querySelector('#dontShowlower').checked;
        console.log(dontShowLower)
        reload();
    });

    setRefreshOn();

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
