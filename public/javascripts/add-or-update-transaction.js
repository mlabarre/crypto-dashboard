const setCurrentDate = (type) => {
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

const buildSelectWallets = async (data) => {
    let options = `<option value="">${choice}</option>`;
    $.each(data, (item) => {
        options += `<option value="${data[item].wallet}">${data[item].wallet}</option>`;
        wallets.push(data[item].wallet);
    });
    $('.selectWalletNode').append(options);
}

const buildSelectSymbols = async (data) => {
    let options = "";
    $.each(data, (item) => {
        options += `<option value="${data[item].symbol.toUpperCase()}">${data[item].symbol.toUpperCase()}</option>`;
        symbols.push(data[item].symbol.toUpperCase());
    });
    $('.selectSymbolNode').append(options);
}

const hideAll = () => {
    $('#purchaseContainer').hide();
    $('#saleContainer').hide();
    $('#swapContainer').hide();
    $('#sendContainer').hide();
}

const getWalletsName = () => {
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

const getMySymbols = () => {
    $.ajax(
        {
            type: "GET",
            url: "/api/get-my-cryptos?ico=yes",
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

const setSelectedInComboWallets = (selectId, value) => {
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

const setSelectedInComboSymbols = (selectId, value) => {
    let index = symbols.indexOf(value);
    try {
        if (index >= 0) {
            document.querySelector('#' + selectId).selectedIndex = index + 1;
        }
    } catch (e) {
        console.log("error symbol selectId", selectId)
        console.log("error symbol value", value)
    }
}

const selectType = () => {
    document.querySelector('#type').value = typeTransaction;
    const element = document.querySelector('#type')
    element.dispatchEvent(new Event("change"));
}

const initializeCombosWallet = () => {
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

const initializeCombosToken = () => {
    if (typeTransaction === "purchase") {
        setSelectedInComboSymbols("purchaseTokenId", purchaseTokenId);
    } else if (typeTransaction === "sale") {
        setSelectedInComboSymbols("saleTokenId", saleTokenId);
    } else if (typeTransaction === "swap") {
        setSelectedInComboSymbols("swapOutputTokenId", swapOutputTokenId);
        setSelectedInComboSymbols("swapInputTokenId", swapInputTokenId);
    } else if (typeTransaction === "send") {
        setSelectedInComboSymbols("sendTokenId", sendTokenId);
    }
}

const validateTokenId = (prefix) => {
    let msg = '';
    let res = false;
    if (prefix === "purchase" || prefix === "sale" || prefix === "send") {
        let tid = $('#' + prefix + 'TokenId').val();
        res = !(tid === '');
    } else {
        let outputtid = $('#' + prefix + 'OutputTokenId').val();
        let inputtid = $('#' + prefix + 'InputTokenId').val();
        res = !(outputtid === '' || inputtid === '');
    }
    if (!res) {
        msg = validateMsg;
    }
    return msg;
}

const coherenceControl = () => {
    let msg = "";
    // SWAP : tokens must differ
    if ($('#type').val() === "swap") {
        let input = $('#swapInputTokenId option:selected').val();
        let output = $('#swapOutputTokenId option:selected').val();
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
    // Transaction chain
    let hasChain = $('#chainExplorerOpt').val() !== "";
    let hasTxId = $('#txIdOpt').val() !== "";
    if ((hasChain && !hasTxId) || (!hasChain && hasTxId)) {
        msg = coherenceMsg3;
    }
    return msg;
}

const validateFields = (prefix) => {
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

const getNumberTokenForWallet = (wallet, symbol, id) => {
    $.ajax(
        {
            type: "GET",
            url: `/api/portfolio/number-token-for-wallet?wallet=${wallet}&symbol=${symbol}`,
            contentType: "application/json; charset=utf-8"
        })
        .done((data) => {
            $('#'+id).val(data.number);
        })
        .fail((error) => {
            // do nothing
        })
}

const handleWalletOrTokenChange = (wallet, tokenId, id) => {
    if (wallet !== "" && tokenId !== "") {
        getNumberTokenForWallet(wallet, tokenId, id);
    }
}
const setNumberTokenListeners = () => {
    document.querySelector('#saleWallet').addEventListener("change", (e) => {
        handleWalletOrTokenChange($('#saleWallet').val(), $('#saleTokenId').val(), "saleTokenNumber");
    });
    document.querySelector('#saleTokenId').addEventListener("change", (e) => {
        handleWalletOrTokenChange($('#saleWallet').val(), $('#saleTokenId').val(), "saleTokenNumber");
    });
    document.querySelector('#swapWallet').addEventListener("change", (e) => {
        handleWalletOrTokenChange($('#swapWallet').val(), $('#swapOutputTokenId').val(), "swapOutputTokenNumber");
    });
    document.querySelector('#swapOutputTokenId').addEventListener("change", (e) => {
        handleWalletOrTokenChange($('#swapWallet').val(), $('#swapOutputTokenId').val(), "swapOutputTokenNumber");
    });
    document.querySelector('#sendWallet').addEventListener("change", (e) => {
        handleWalletOrTokenChange($('#sendWallet').val(), $('#sendTokenId').val(), "sendTokenNumber");
    });
    document.querySelector('#sendTokenId').addEventListener("change", (e) => {
        handleWalletOrTokenChange($('#sendWallet').val(), $('#sendTokenId').val(), "sendTokenNumber");
    });
}
const init = () => {
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
    setNumberTokenListeners();
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
            $('#message').text(msg + msg2);
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

includeHTML("h-input").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});
