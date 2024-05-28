
const showAllTokenAlertTitle = () => {
    $('.all_token').show();
    $('.one_token').hide();
}

const showOneTokenAlertTitle = () => {
    $('.all_token').hide();
    $('.one_token').show();
}

const initAlertsVariables = () => {
    $('#alert_gt_5mn').val('');
    $('#alert_lt_5mn').val('');
    $('#alert_gt_1h').val('');
    $('#alert_lt_1h').val('');
    $('#alert_gt_24h').val('');
    $('#alert_lt_24h').val('');
    $('#alert_gt_1w').val('');
    $('#alert_lt_1w').val('');
}

const setAlertsVariables = (alertToken) => {
    $('#alert_gt_5mn').val(alertToken.gt5mn < 0 ? '' : alertToken.gt5mn);
    $('#alert_lt_5mn').val(alertToken.lt5mn < 0 ? '' : alertToken.lt5mn);
    $('#alert_gt_1h').val(alertToken.gt1h < 0 ? '' : alertToken.gt1h);
    $('#alert_lt_1h').val(alertToken.lt1h < 0 ? '' : alertToken.lt1h);
    $('#alert_gt_24h').val(alertToken.gt24h < 0 ? '' : alertToken.gt24h);
    $('#alert_lt_24h').val(alertToken.lt24h < 0 ? '' : alertToken.lt24h);
    $('#alert_gt_1w').val(alertToken.gt1w < 0 ? '' : alertToken.gt1w);
    $('#alert_lt_1w').val(alertToken.lt1w < 0 ? '' : alertToken.lt1w);
}

const findAlertInArray = (token) => {
    for (let i = 0; i < allAlerts.length; i++) {
        if (allAlerts[i].token === token) {
            return allAlerts[i];
        }
    }
}

const setAlerts = (alerts) => {
    allAlerts = alerts;
    globalAlertValue = findAlertInArray('_all_tokens_');
    globalAlert = globalAlertValue !== undefined;
}
