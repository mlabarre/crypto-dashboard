const buildGraphs = (data, period) => {
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
            rightPriceScale: {borderVisible: false},
            grid: {
                horzLines: {visible: false},
                vertLines: {visible: false}
            },
            timeScale: {timeVisible: period === 'H'}
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
                top: 0.1,
                bottom: 0.4,
            },
        }
    );
    priceSeries.applyOptions(
        {
            priceFormat: {
                type: 'price',
                precision: data.precision,
                minMove: data.minMove,
            }
        }
    )
    const volumeSeries = chart.addHistogramSeries(
        {
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.7,
                bottom: 0,
            },
        }
    );
    volumeSeries.priceScale().applyOptions(
        {
            scaleMargins: {
                top: 0.7,
                bottom: 0,
            },
        }
    );
    priceSeries.setData(data.prices);
    volumeSeries.setData(data.total_volumes);
    chart.timeScale().fitContent();
}

const showGraph = (period) => {
    $.ajax({
        method: 'GET',
        url: `/api/get-token-graph?tokenId=${tokenId}&period=${period}`
    }).done((data) => {
        buildGraphs(data, period);
    }).fail((err) => {
        alert(errorGraph);
    })
}

const init = () => {
    $('#returnButton').on('click', () => {
        window.location = returnUrl;
    });
    $('#graphButtonHour').on('click', () => {
        showGraph('H');
    });
    $('#graphButtonDay').on('click', () => {
        showGraph('D');
    });
    includeHTML(header).then(() => {
        handleDarkMode(document.getElementById('darkmode'));
    });
}

