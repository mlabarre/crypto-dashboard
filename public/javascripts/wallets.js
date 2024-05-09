const fill = (data) => {
    $('#mywalletsTable').find('tbody tr').remove();
    for (let i = 0; i < data.length; i++) {
        let row = `<tr><td>${data[i].wallet}</td><td>${getIconsHtml(data[i].wallet)}</td></tr>`
        $('#mywalletsTable').append(row);
    }
}

const getWallets = () => {
    $.ajax(
        {
            type: "GET",
            url: "/api/get-wallets-name",
            contentType: "application/json; charset=utf-8"
        })
        .done((data) => {
            fill(data);
        })
        .fail((error) => {
            $('#message').text('error');
        })
}

const hideForm = () => {
    $('#newWallet').hide();
}

const showForm = () => {
    $('#newWallet').show();
}

const init = () => {
    hideForm();
    $('#buttonInput').on('click', () => {
        showForm();
    });
    $('#buttonAdd').on('click', () => {
        let uploadedFiles = document.querySelector('#walletIcon');
        let name = $('#walletName').val();
        if (uploadedFiles.files.length === 0 || name === "") {
            alert(msgAlert);
            return;
        }
        let file = uploadedFiles.files[0];
        let fdata = new FormData();
        fdata.append('walletIcon', file);
        fdata.append('walletName', name);
        let request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                getWallets();
                hideForm();
            } else {
                $('#message').val(`Error status : ${request.status}`)
            }
        }
        request.open('post', '/api/add-wallet');
        request.send(fdata);
    });
    getWallets();
    return 1;
}

includeHTML("h-wallet").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});
