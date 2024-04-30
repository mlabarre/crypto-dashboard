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
    myCryptosList.sort(sortArray)
    for (let i = 0; i < myCryptosList.length; i++) {
        addMyCryptosRow(myCryptosList[i]);
    }
}

let getMyCryptos = async () => {
    return $.ajax({
        type: "GET",
        url: "/api/get-my-cryptos",
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


let init = () => {
    $('.cond').hide();
    getMyCryptos().then((data) => {
        myCryptosList = data;
        buildMyCryptos();
    });
    getAvailableCryptos().then((data) => {
        availableCryptosList = data;
    });
    return 1;
}

includeHTML("h-cryptos").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});


