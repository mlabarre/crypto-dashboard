
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

let validateTokenId = (prefix) => {
    let msg = '';
    let res = false;
    if (prefix === "purchase" || prefix === "sale" || prefix === "send") {
        let tid = $('#' + prefix + 'TokenId').val();
        let tidico = $('#' + prefix + 'TokenIdIco').val();
        res = !((tid === '' && tidico === '') || (tid !== '' && tidico !== ''));
    } else {
        let outputtid = $('#' + prefix + 'OutputTokenId').val();
        let outputtidico = $('#' + prefix + 'OutputTokenIdIco').val();
        let inputtid = $('#' + prefix + 'InputTokenId').val();
        let inputtidico = $('#' + prefix + 'InputTokenIdIco').val();
        res = !((outputtid === '' && outputtidico === '') || (outputtid !== '' && outputtidico !== '') ||
            (inputtid === '' && inputtidico === '') || (inputtid !== '' && inputtidico !== ''));
    }
    if (!res) {
        msg = validateMsg;
    }
    return msg;
}

let coherenceControl = () => {
    let msg = "";
    // SWAP : tokens must differ
    if ($('#type').val() === "swap") {
        let input = $('#swapInputTokenIdIco').val();
        if (input === '') {
            input = $('#swapInputTokenId option:selected').val();
        }
        let output = $('#swapOutputTokenIdIco').val();
        if (output === '') {
            output = $('#swapOutputTokenId option:selected').val();
        }
        if (input.toUpperCase() === output.toUpperCase()) {
            msg = coherenceMsg1;
        }
    }
    // SEND : wallet must differ
    if ($('#type').val() === "send") {
        if ($('#sendWallet option:selected').val() === $('#receiveWallet option:selected').val()) {
            msg = coherenceMsg2;
        }
    }
    return msg;
}

let validateFields = (prefix) => {
    let formData = document.querySelector(('form'));
    for (let i = 0; i < formData.length; i++) {
        if (formData[i].name.startsWith(prefix) && !formData[i].name.endsWith('Opt')) {
            if (formData[i].value === '' && formData[i].name.indexOf('TokenId') < 0) {
                return validateFieldsMsg;
            }
        }
    }
    return validateTokenId(prefix);
}

let init = () => {
    document.querySelector('#type').addEventListener("change", (e) => {
        hideAll();
        let selectionType = document.querySelector('#type').value;
        if (selectionType === "purchase") {
            $('#purchaseContainer').show();
        } else if (selectionType === "sale") {
            $('#saleContainer').show();
        } else if (selectionType === "swap") {
            $('#swapContainer').show();
        } else if (selectionType === "send") {
            $('#sendContainer').show();
        }
    });
    if (trid === '') {
        $('#cancel').hide();
    }
    $('#cancel').on('click', () => {
        history.back();
    });
    $('#validation').on('click', () => {
        let type = document.getElementById('type');
        let msg = validateFields(type.value);
        let msg2 = coherenceControl();
        if (msg !== '' || msg2 !== '') {
            $('#message').text(msg+msg2);
        } else {
            $('#message').text('');
            let formData = document.querySelector(('form'));
            let fields = {};
            for (let i = 0; i < formData.length; i++) {
                fields[formData[i].name] = formData[i].value;
            }
            let json = JSON.stringify(fields);
            if (trid === "") {
                $.ajax(
                    {
                        type: "POST",
                        url: "/api/add-transaction",
                        contentType: "application/json; charset=utf-8",
                        data: json
                    })
                    .done((data) => {
                        alert(data);
                    })
                    .fail((error) => {
                        $('#message').text(error);
                    })
            } else {
                $.ajax(
                    {
                        type: "PUT",
                        url: `/api/update-transaction?id=${trid}`,
                        contentType: "application/json; charset=utf-8",
                        data: json
                    })
                    .done((data) => {
                        // Updated : returns to transactions list
                        document.location.href = `/followTransactions?lang=fr&sortDirection=${sortDirection}&token=${token}` +
                            `&wallet=${wallet}`;
                    })
                    .fail((error) => {
                        $('#message').text(error);
                    })
            }
        }
    });
    getWalletsName();
    getMySymbols();
    selectType();
}