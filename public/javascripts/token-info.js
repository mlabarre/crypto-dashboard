includeHTML("<%= data.header %>").then(() => {
    handleDarkMode(document.getElementById('darkmode'));
});

let buildGraphs = (data, period) => {
    $('#graph').empty();
    if (period === 'H') {
        $('#graph-title').text(graphTitleHour);
    } else {
        $('#graph-title').text(graphTitleDay);
    }
    const chart = LightweightCharts.createChart(document.getElementById('graph'),
        {
            width: 800,
            height: 400,
            layout: {
                textColor: 'white',
                background: {type: 'solid', color: 'black'},
            },
            rightPriceScale: {
                borderVisible: false,
            },
            grid: {
                horzLines:  {
                    visible: false
                },
                vertLines: {
                    visible: false
                }
            },
            timeScale: {
                timeVisible: period === 'H'
            }
        }
    );
    const priceSeries = chart.addLineSeries(
        {
            color: '#2962FF',
            lineWidth: 1,
        }
    );
    priceSeries.priceScale().applyOptions(
        {
            scaleMargins: {
                // positioning the price scale for the area series
                top: 0.1,
                bottom: 0.4,
            },
        }
    );
    const volumeSeries = chart.addHistogramSeries(
        {
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '', // set as an overlay by setting a blank priceScaleId
            // set the positioning of the volume series
            scaleMargins: {
                top: 0.7, // highest point of the series will be 70% away from the top
                bottom: 0,
            },
        }
    );
    volumeSeries.priceScale().applyOptions(
        {
            scaleMargins: {
                top: 0.7, // highest point of the series will be 70% away from the top
                bottom: 0,
            },
        }
    );
    priceSeries.setData(data.prices);
    volumeSeries.setData(data.total_volumes);
    chart.timeScale().fitContent();
}

let showGraph = (period) => {
    $.ajax({
        method: 'GET',
        url: `/api/getTokenGraph?tokenId=${tokenId}&period=${period}`
    }).done((data) => {
        buildGraphs(data, period);
    }).fail((err) => {
        alert("Cannot display graph");
    })
}

let init = () => {
    $('#returnButton').on('click', () => {
        window.location = returnUrl;
    })
    $('#graphButtonHour').on('click', () => {
        showGraph('H');
    })
    $('#graphButtonDay').on('click', () => {
        showGraph('D');
    })
}