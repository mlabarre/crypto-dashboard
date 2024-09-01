
const showAllTokenAlertTitle = () => {
    $('.all_token').show();
    $('.one_token').hide();
}

const showOneTokenAlertTitle = () => {
    $('.all_token').hide();
    $('.one_token').show();
}

const setAlertValue = (field, value) => {
    $('#alert_' + field).val(value);
}

const getAlertValue = (field) => {
    return $('#alert_' + field).val();
}

const initAlertsVariables = () => {
    setAlertValue('gt_5mn', '');
    setAlertValue('lt_5mn', '');
    setAlertValue('gt_1h', '');
    setAlertValue('lt_1h', '');
    setAlertValue('gt_24h', '');
    setAlertValue('lt_24h', '');
    setAlertValue('gt_1w', '');
    setAlertValue('lt_1w', '');
}

const setAlertsVariables = (tokenAlert) => {
    setAlertValue('gt_5mn', tokenAlert.gt5mn < 0 ? '' : tokenAlert.gt5mn);
    setAlertValue('lt_5mn', tokenAlert.lt5mn < 0 ? '' : tokenAlert.lt5mn);
    setAlertValue('gt_1h', tokenAlert.gt1h < 0 ? '' : tokenAlert.gt1h);
    setAlertValue('lt_1h', tokenAlert.lt1h < 0 ? '' : tokenAlert.lt1h);
    setAlertValue('gt_24h', tokenAlert.gt24h < 0 ? '' : tokenAlert.gt24h);
    setAlertValue('lt_24h', tokenAlert.lt24h < 0 ? '' : tokenAlert.lt24h);
    setAlertValue('gt_1w', tokenAlert.gt1w < 0 ? '' : tokenAlert.gt1w);
    setAlertValue('lt_1w', tokenAlert.lt1w < 0 ? '' : tokenAlert.lt1w);
}

const getAlertJson = () => {
    return {
        token: tokenAlert,
        dontFollow: document.querySelector('#dontFollow').checked,
        gt5mn: getAlertValue('gt_5mn') === '' ? -1.0 : parseFloat(getAlertValue('gt_5mn')),
        lt5mn: getAlertValue('lt_5mn') === '' ? -1.0 : parseFloat(getAlertValue('lt_5mn')),
        gt1h:  getAlertValue('gt_1h') === '' ? -1.0 : parseFloat(getAlertValue('gt_1h')),
        lt1h:  getAlertValue('lt_1h') === '' ? -1.0 : parseFloat(getAlertValue('lt_1h')),
        gt24h: getAlertValue('gt_24h') === '' ? -1.0 : parseFloat(getAlertValue('gt_24h')),
        lt24h: getAlertValue('lt_24h') === '' ? -1.0 : parseFloat(getAlertValue('lt_24h')),
        gt1w:  getAlertValue('gt_1w') === '' ? -1.0 : parseFloat(getAlertValue('gt_1w')),
        lt1w:  getAlertValue('lt_1w') === '' ? -1.0 : parseFloat(getAlertValue('lt_1w'))
    }
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
