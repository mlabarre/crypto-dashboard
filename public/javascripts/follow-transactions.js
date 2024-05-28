let sortDirection = "D";

const fill = (data) => {
    $.each(data, (line) => {
        let row = `<tr><td style="display:none">${data[line].id}</td><td>${data[line].msg}</td>`;
        if (data[line].chainUrl !== null) {
            row += `<td><i onclick="showTransaction('${data[line].chainUrl}')" class="fa-solid fa-chart-line green clickable" title="${titleFill3}"></i></td>`
        } else {
            row += "<td></td>";
        }
        row += `<td><i onclick="deleteTransaction('${data[line].id}')" class="fa-regular fa-trash-can red clickable" title="${titleFill1}"></i></td>`
        row += `<td><i onclick="editTransaction('${data[line].id}')" class="fas fa-edit green clickable" title="${titleFill2}"></i></td>`
        row += '</tr>';
        $('#transactions').append(row);
    })
}

const showTransaction = (url) => {
    window.open(url, '_blank');
}

const getMessageFromRow = (id) => {
    let t = document.getElementById('transactions');
    let n = t.rows.length;
    let i, s = null, tr, td;
    for (i = 0; i < n; i++) {
        tr = t.rows[i];
        if (tr.cells.length > 2) {
            td = tr.cells[0];
            if (td.innerText === id) {
                return tr.cells[1].innerText
            }
        }
    }
    return '';
}

const deleteTransaction = (id) => {
    if (window.confirm(`${delTranMsg}: ${getMessageFromRow(id)}`)) {
        $.ajax(
            {
                type: "DELETE",
                url: `/api/delete-transaction?id=${id}`,
                contentType: "application/json; charset=utf-8"
            })
            .done((data) => {
                getDatas();
            })
            .fail((error) => {
                window.alert(error);
            })
    }
}

const editTransaction = (id) => {
    document.location.href = `/updateTransaction?id=${id}&lang=fr&sortDirection=${sortDirection}&token=${document.getElementById("token").value}` +
        `&wallet=${document.getElementById("wallet").value}`;
}

const getDatas = () => {
    $('#transactions').find('tbody tr').remove()
    $.ajax(
        {
            type: "GET",
            url: `/api/follow-token-on-wallet?lang=fr&sortDirection=${sortDirection}` +
                `&token=${document.getElementById("token").value}` +
                `&wallet=${document.getElementById("wallet").value}` +
                `&action=${document.getElementById("action").value}`,
            contentType: "application/json; charset=utf-8"
        })
        .done((data) => {
            $('#headerCol').text(`${data.length} transactions`);
            fill(data);
        })
        .fail((error) => {
            $('#message').text('error');
        })
}

const fillCombo = (id, data) => {
    let select = document.querySelector('#' + id);
    for (let i = 0; i < data.length; i++) {
        let option = document.createElement("option");
        option.text = data[i];
        option.value = data[i];
        select.add(option)
    }
}

const fillComboSymbols = (symbols) => {
    fillCombo("token", symbols);
}

const setSymbols = () => {
    $.ajax(
        {
            type: "GET",
            url: "/api/get-all-symbols",
            contentType: "application/json; charset=utf-8"
        })
        .done((data) => {
            fillComboSymbols(data);
        })
        .fail((error) => {
            $('#message').text('error');
        })
}

const fillComboWallets = (wallets) => {
    fillCombo("wallet", wallets);
}

const setWallets = () => {
    $.ajax(
        {
            type: "GET",
            url: "/api/get-all-wallets",
            contentType: "application/json; charset=utf-8"
        })
        .done((data) => {
            fillComboWallets(data);
        })
        .fail((error) => {
            $('#message').text('error');
        })
}

const init = () => {
    $('#headerCol').on('click', () => {
        sortDirection = (sortDirection === "A" ? "D" : "A");
        getDatas();
    })
    $('#reset').on('click', () => {
        $('#token').val('');
        $('#wallet').val('');
        $('#action').val('');
        getDatas();
    });
    $('#downloadCsv').on('click', () => {
        let token = $('#token').val();
        let wallet = $('#wallet').val();
        window.open(`/api/get-transactions-as-csv?wallet=${wallet}&token=${token}`);
    });
    $('#downloadJson').on('click', () => {
        let token = $('#token').val();
        let wallet = $('#wallet').val();
        window.open(`/api/get-transactions-as-json?wallet=${wallet}&token=${token}`);
    });
    $('#token').on('change', () => {
            getDatas();
        }
    )
    $('#wallet').on('change', () => {
            getDatas();
        }
    )
    $('#action').on('change', () => {
            getDatas();
        }
    )
    if (returnedSortDirection !== "") {
        sortDirection = returnedSortDirection;
        $('#token').val(returnedToken);
        $('#wallet').val(returnedWallet);
    }
    getDatas();
    setSymbols();
    setWallets();
}

includeHTML("h-follow").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});
