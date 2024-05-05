let availableCryptoShown = false;

let myCryptosList = null;

let availableCryptosList = null;

let getTokenIconHtml = (row) => {
    if (row.hasOwnProperty('info') && row.info.hasOwnProperty('image')) {
        return `<img class="icon" title="${row.name}" ` +
            ` src="${row.info.image}" alt="${row.name}">`;
    } else return '';
}

let showInfo = (coinId) => {
    window.location = `/showTokenInfo?id=${coinId}&returnUrl=/cryptos&header=h-cryptos`;
}

let buildMyCryptos = () => {
    $('#myCryptosTable').find('tbody tr').remove();
    myCryptosList.sort(sortArrayOnSymbol)
    for (let i = 0; i < myCryptosList.length; i++) {
        addMyCryptosRow(myCryptosList[i]);
    }
}

let getMyCryptos = async () => {
    return $.ajax({
        type: "GET",
        url: "/api/get-my-cryptos?ico=yes",
        contentType: "application/json; charset=utf-8"
    })
}

let findInFields = (criteria, child) => {
    let from = `${child[1].textContent} ${child[2].textContent} ${child[3].textContent}`;
    return from.toLowerCase().indexOf(criteria.toLowerCase()) < 0;
}

let doFilter = (type) => {
    let criteria = $('#criteria').val();
    $('#availableCryptosTable').find('tbody').find('tr').each((r, raw) => {
        if (type === "all") {
            raw.hidden = findInFields(criteria, raw.children) === true;
        } else {
            raw.hidden = raw.children[2].textContent.toLowerCase().indexOf(criteria.toLowerCase()) < 0;
        }
    })
}

let resetFilter = () => {
    $('#availableCryptosTable').find('tbody').find('tr').each((r, raw) => {
        raw.hidden = false;
    })
    $('#criteria').val("");
}

let removeMyCryptosFromAvailableCryptos = async () => {
    for (let i = 0; i < myCryptosList.length; i++) {
        let index = getIndexInArray(availableCryptosList, myCryptosList[i]);
        availableCryptosList.splice(index, 1);
    }
    return availableCryptosList;
}

let showMessage = () => {
    $('.message').css('color', 'white');
}

let hideMessage = () => {
    $('.message').css('color', 'black');
}

let buildAvailableCryptos = async () => {
    showMessage();
    availableCryptosList = await getAvailableCryptos();
    $('#availableCryptosTable').find('tbody tr').remove();
    await removeMyCryptosFromAvailableCryptos();
    for (let i = 0; i < availableCryptosList.length; i++) {
        await addAvailableCryptosRow(availableCryptosList[i]);
    }
    if ($('#criteria').val() !== "") {
        doFilter();
    }
    hideMessage();
}

let getAvailableCryptos = async () => {
    return $.ajax({
        type: "GET",
        url: "/api/get-available-cryptos",
        contentType: "application/json; charset=utf-8"
    })
}

let addToCollection = (crypto) => {
    return $.ajax({
        type: "POST",
        url: "/api/add-to-my-cryptos",
        contentType: "application/json; charset=utf-8",
        data: crypto
    })
}

let removeFromCollection = (crypto) => {
    return $.ajax({
        type: "DELETE",
        url: `/api/delete-from-my-cryptos?id=${crypto.id}&symbol=${crypto.symbol}&name=${crypto.name}`,
        contentType: "application/json; charset=utf-8"
    })
}

let addMyCryptosRow = (row) => {
    let infoHtml = getInfoIconHtml(row);
    let r = `<tr><td>${infoHtml}</td><td>${getTokenIconHtml(row)}</td><td>${row.id}</td><td>${row.symbol}</td><td>${row.name}</td><td class="action" ` +
        `onclick="suppressMyCrypto(this)"><span class="indic-moins" title="${titleMinusAdd}">-</span></td></tr>`
    $('#myCryptosTable').append(r);
}

let addAvailableCryptosRow = async (row) => {
    let r = `<tr><td class="action" onclick="addMyCrypto(this)"><span class="indic-plus" ` +
        `title="${titleAvailableAdd}">+</span></td><td id="id">${row.id}</td><td id="symbol">${row.symbol}</td>` +
        `<td id="name">${row.name}</td></tr>`
    $('#availableCryptosTable').append(r);
}

let changeButtonList = (o) => {
    if (availableCryptoShown === true) {
        o.value = titleButtonShow;
        availableCryptoShown = false;
        $('.available-cryptos-container').hide();
    } else {
        buildAvailableCryptos(true).then(() => {
            o.value = titleButtonHide;
            availableCryptoShown = true;
            $('.available-cryptos-container').show();
        })
    }
}

let addMyCrypto = (o) => {
    let children = o.closest("tr").children;
    let crypto = {"id": children[1].innerText, "symbol": children[2].innerText, "name": children[3].innerText}
    let index = getIndexInArray(availableCryptosList, crypto);
    if (index >= 0) {
        availableCryptosList.splice(index, 1);
        myCryptosList.push(crypto);
        addToCollection(JSON.stringify(crypto)).then((data) => {
            buildAvailableCryptos(false).then(() => {
                buildMyCryptos();
                alert(`Crypto ${crypto.name} ${wordAdd}`)
            })
        }).fail((error) => {
            console.log(error)
        });
    } else {
        alert(errorAdd)
    }
}

let suppressMyCrypto = (o) => {
    let children = o.closest("tr").children;
    let crypto = {"id": children[2].innerText, "symbol": children[3].innerText, "name": children[4].innerText}
    if (crypto.id !== 'N/A') {
        let indexAvailable = getIndexInArray(availableCryptosList, crypto);
        let indexMy = getIndexInArray(myCryptosList, crypto);
        if (indexAvailable >= 0 && availableCryptoShown === true) {
            alert(`${errorDel} : ` + JSON.stringify(availableCryptosList[indexAvailable]));
        } else {
            myCryptosList.splice(indexMy, 1);
            removeFromCollection(crypto).then((data) => {
                buildAvailableCryptos(true).then(() => {
                    alert(`Crypto ${crypto.name} ${wordDel}`)
                    buildMyCryptos();
                })
            }).fail((error) => {
                console.log(error)
            });
        }
    } else {
        let indexMy = getIndexInArray(myCryptosList, crypto);
        myCryptosList.splice(indexMy, 1);
        removeFromCollection(crypto).then((data) => {
            alert(`Crypto ${crypto.name} ${wordDel}`)
            buildMyCryptos();
        }).fail((error) => {
            console.log(error)
        });
    }
}

let showNotListed = () => {
    $('.ico-crypto-container').show();
    $('#buttonList').hide();
    $('#buttonNotListed').hide();
    $('.available-cryptos-container').hide();
}

let cancelIco = () => {
    $('.ico-crypto-container').hide();
    $('#buttonList').show();
    $('#buttonNotListed').show();
}

let addNotListed = () => {
    if ($('#symbol').val() === '' || $('#name').val() === '') {
        alert(msgFieldsRequired);
        return;
    }
    let crypto = {
        id: 'N/A',
        symbol: $('#symbol').val().toLowerCase(),
        name: $('#name').val(),
        ico_network: $('#network').val(),
        ico_address: $('#address').val()
    }
    addToCollection(JSON.stringify(crypto)).then((data) => {
        myCryptosList.push(crypto);
        buildMyCryptos();
        alert(`Crypto ${crypto.name} ${wordAdd}`)
    }).fail((error) => {
        console.log(error)
    });
}

includeHTML("h-cryptos").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});

let init = () => {
    $('.available-cryptos-container').hide();
    $('.ico-crypto-container').hide();
    getMyCryptos().then((data) => {
        myCryptosList = data;
        buildMyCryptos();
    });
    getAvailableCryptos().then((data) => {
        availableCryptosList = data;
    });
    return 1;
}





