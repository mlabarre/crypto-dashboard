//
// ALERTS
//
let globalAlert = false;
let globalAlertValue;
let allAlerts = [];
let tokenAlert = "";

const showAlertPanel = () => {
    $('.alerts').show();
    $('.evolution').hide();
    $('.cryptos').hide();
}

const initAlerts = () => {
    showEvolutionPanel();
    tokenAlert = "";
    globalAlert = false;
    globalAlertValue = undefined;
    allAlerts = [];
}

// Called by icon click.
const handleAlertPanel = (token) => {
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


const delAlert = () => {
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

const cancelAlert = () => {
    showEvolutionPanel();
}


const addOrUpdateAlert = () => {
    $.ajax(
        {
            url: "/api/alert-survey",
            method: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(getAlertJson(false)),
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

const setGeneralAlertIconHtml = () => {
    let html = `<i class="fa-solid fa-bell alert clickable bell orange" onclick="handleAlertPanel('_all_tokens_')" ` +
        `title=${titleGenAlert}></i>`;
    $('.generalAlert').html(html);
    return html;
}

const buildAlertIconHtml = (token) => {
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

const showEvolutionPanel = () => {
    $('.alerts').hide();
    $('.evolution').show();
    $('.cryptos').hide();
}

const signRate = (rate) => {
    if (rate.indexOf("-") >= 0) {
        return '<span class="down">&searr;&nbsp;' + rate.substring(1).replace(".", ds) + ' %' + '</span>';
    } else {
        return '<span class="up">&nearr;&nbsp;' + rate.replace(".", ds) + ' %' + '</span>';
    }
}

const fill = (data) => {
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

const showInfo = (coinId) => {
    window.location = `/showTokenInfo?id=${coinId}&returnUrl=/survey&header=h-survey`;
}

const sortTable = (sortField) => {
    if (sortField === lastSortField) {
        lastSortDirection = lastSortDirection === "A" ? "D" : "A";
    }
    lastSortField = sortField;
    getDatas();
}

const getDatas = () => {
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

const showMessage = () => {
    $('.message').css('color', 'white');
}

const hideMessage = () => {
    $('.message').css('color', 'black');
}

const showCryptosPanel = () => {
    $('.alerts').hide();
    $('.evolution').hide();
    $('.cryptos').show();
}

const addAvailableCryptosRow = async (row) => {
    let r = `<tr><td id="id">${row.id}</td><td id="symbol">${row.symbol}</td>` +
        `<td id="name">${row.name}</td>` +
        `<td class="action" onclick="addSurveyCrypto(this)">` +
        `<span class="indic-plus" title="${msgAddAvailable}">+</span></td></tr>`
    $('#availableCryptosTable').append(r);
}

const removeSurveyCryptosFromAvailableCryptos = async () => {
    for (let i = 0; i < surveyCryptosList.length; i++) {
        let index = getIndexInArray(availableCryptosList, surveyCryptosList[i]);
        availableCryptosList.splice(index, 1);
    }
    return availableCryptosList;
}

const buildAvailableCryptos = async () => {
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

const closeCryptos = () => {
    stopRefresh();
    getDatas();
}

const addSurveyCrypto = (o) => {
    let tr = o.closest("tr");
    let children = tr.children;
    let crypto = {"id": children[0].innerText, "symbol": children[1].innerText, "name": children[2].innerText}
    addToCollection(JSON.stringify(crypto)).then((data) => {
        tr.hidden = true;
        alert(`Crypto ${crypto.name} ${wordSurvey}`)
    })

}

const addToCollection = (crypto) => {
    return $.ajax({
        type: "POST",
        url: "/api/add-to-cryptos-survey",
        contentType: "application/json; charset=utf-8",
        data: crypto
    })
}

const getAvailableCryptos = async () => {
    return $.ajax({
        type: "GET",
        url: "/api/get-available-cryptos",
        contentType: "application/json; charset=utf-8"
    })
}

const addCrypto = () => {
    showCryptosPanel();
    stopRefresh();
    buildAvailableCryptos().then(() => {
        hideMessage();
    })
}

const delCrypto = (id) => {
    $.ajax({
        type: "DELETE",
        url: `/api/delete-crypto-survey?id=${id}`,
        contentType: "application/json; charset=utf-8"
    }).then((res) => {
        getDatas();
    })
}

const findInFields = (criteria, child) => {
    let from = `${child[0].textContent} ${child[1].textContent} ${child[2].textContent}`;
    return from.toLowerCase().indexOf(criteria.toLowerCase()) < 0;
}

const doFilter = (type) => {
    let criteria = $('#criteria').val();
    $('#availableCryptosTable').find('tbody').find('tr').each((r, raw) => {
        if (type === "all") {
            raw.hidden = findInFields(criteria, raw.children) === true;
        } else {
            raw.hidden = raw.children[1].textContent.toLowerCase().indexOf(criteria.toLowerCase()) < 0;
        }
    })
}

const resetFilter = () => {
    $('#availableCryptosTable').find('tbody').find('tr').each((r, raw) => {
        raw.hidden = false;
    })
    $('#criteria').val("");
}

//
// GLOBAL
//

const reload = () => {
    getDatas();
    setDate();
}

let intervalId = null;

const startRefresh = () => {
    intervalId = setInterval(reload, parseInt(refresh) * 1000);
}

const stopRefresh = () => {
    clearInterval(intervalId);
    intervalId = null;
}

const init = () => {
    reload();
    startRefresh();
    return 1;
}

includeHTML("h-survey").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});
