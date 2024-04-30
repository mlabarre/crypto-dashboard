
let setCurrentDate = (type) => {
    let d = new Date();
    if (type === "purchase") {
        document.querySelector('#purchaseDate').value = getDateFromDate(d);
        document.querySelector('#purchaseTime').value = getTimeFromDate(d);
    } else if (type === "sale") {
        document.querySelector('#saleDate').value = getDateFromDate(d);
        document.querySelector('#saleTime').value = getTimeFromDate(d);
    } else if (type === "swap") {
        document.querySelector('#swapDate').value = getDateFromDate(d);
        document.querySelector('#swapTime').value = getTimeFromDate(d);
    } else if (type === "send") {
        document.querySelector('#sendDate').value = getDateFromDate(d);
        document.querySelector('#sendTime').value = getTimeFromDate(d);
    }
}

let buildSelectWallets = async (data) => {
    let options = "";
    $.each(data, (item) => {
        options += `<option value="${data[item].wallet}">${data[item].wallet}</option>`;
        wallets.push(data[item].wallet);
    });
    $('.selectWalletNode').append(options);
}

let buildSelectSymbols = async (data) => {
    let options = "";
    $.each(data, (item) => {
        options += `<option value="${data[item].symbol.toUpperCase()}">${data[item].symbol.toUpperCase()}</option>`;
        symbols.push(data[item].symbol.toUpperCase());
    });
    $('.selectSymbolNode').append(options);
}

let hideAll = () => {
    $('#purchaseContainer').hide();
    $('#saleContainer').hide();
    $('#swapContainer').hide();
    $('#sendContainer').hide();
}

includeHTML("h-input").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});

let getWalletsName = () => {
    $.ajax(
        {
            type: "GET",
            url: "/api/get-wallets-name",
            contentType: "application/json; charset=utf-8"
        })
        .done((data) => {
            buildSelectWallets(data).then(() => {
                initializeCombosWallet();
            });
        })
        .fail((error) => {
            $('#message').text('error');
        })
}

let getMySymbols = () => {
    $.ajax(
        {
            type: "GET",
            url: "/api/get-my-cryptos",
            contentType: "application/json; charset=utf-8"
        })
        .done((data) => {
            buildSelectSymbols(data).then(() => {
                initializeCombosToken();
            });
        })
        .fail((error) => {
            $('#message').text(error);
        })
}

let setSelectedInComboWallets = (selectId, value) => {
    let index = wallets.indexOf(value);
    try {
        if (index >= 0) {
            document.querySelector('#' + selectId).selectedIndex = index;
        }
    } catch (e) {
        console.log(document.querySelector('#sendWallet'))
        console.log("error wallet selectId", selectId)
        console.log("error wallet value", value)

    }
}

let setSelectedInComboSymbols = (selectId, value, alternateFieldId) => {
    let index = symbols.indexOf(value);
    try {
        if (index >= 0) {
            document.querySelector('#' + selectId).selectedIndex = index + 1;
        } else {
            document.querySelector('#' + alternateFieldId).value = value;
        }
    } catch (e) {
        console.log("error symbol selectId", selectId)
        console.log("error symbol value", value)
    }
}

let selectType = () => {
    document.querySelector('#type').value = typeTransaction;
    const element = document.querySelector('#type')
    element.dispatchEvent(new Event("change"));
}

let initializeCombosWallet = () => {
    if (typeTransaction === "purchase") {
        setSelectedInComboWallets("purchaseWallet", purchaseWallet);
    } else if (typeTransaction === "sale") {
        setSelectedInComboWallets("saleWallet", saleWallet);
    } else if (typeTransaction === "swap") {
        setSelectedInComboWallets("swapWallet", swapWallet);
    } else if (typeTransaction === "send") {
        setSelectedInComboWallets("sendWallet", sendWallet);
        setSelectedInComboWallets("receiveWallet", receiveWallet);
    }
}

let initializeCombosToken = () => {
    if (typeTransaction === "purchase") {
        setSelectedInComboSymbols("purchaseTokenId", purchaseTokenId, "purchaseTokenIdIco");
    } else if (typeTransaction === "sale") {
        setSelectedInComboSymbols("saleTokenId", saleTokenId, "saleTokenIdIco");
    } else if (typeTransaction === "swap") {
        setSelectedInComboSymbols("swapOutputTokenId", swapOutputTokenId, "swapOutputTokenIdIco");
        setSelectedInComboSymbols("swapInputTokenId", swapInputTokenId, "swapInputTokenIdIco");
    } else if (typeTransaction === "send") {
        setSelectedInComboSymbols("sendTokenId", sendTokenId, "sendTokenIdIco");
    }
}
