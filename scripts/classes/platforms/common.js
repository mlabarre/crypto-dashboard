/*
 * Common tools functions.
 */

/**
 * Returns current timestamp.
 * @returns {number}
 */
exports.getCurrentTimestamp = () => {
    return (new Date()).getTime();
}

/**
 * Return timestamp of the supplied date.
 * @param date String as YYYY-MM-DD
 * @returns {number}
 */
exports.getTimestampFromDateString = (date) => {
    return (new Date(date)).getTime();
}

/**
 * Returns timestamp + n days.
 * @param timestamp
 * @param days
 * @returns {*}
 */
exports.getTimestampPast = (timestamp, days) => {
    let incr = days * 24 * 3600 * 1000;
    return timestamp + incr;
}

exports.isFieldValid = (f) => {
    return f !== undefined && f !== null && f !== '';
}