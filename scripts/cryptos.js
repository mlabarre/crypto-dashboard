const config = require('config')
const MongoHelper = require('./classes/mongo-helper');

const getMyCryptos = async (ico) => {
    return await new MongoHelper().findAllMyCryptos(ico);
}

const getAvailableCryptos = async () => {
    return await new MongoHelper().findAllAvailableCryptos();
}

const addToMyCrypto = async (crypto) => {
    return await new MongoHelper().addToMyCryptos(crypto);
}

const removeFromMyCrypto = async (crypto) => {
    return await new MongoHelper().findAndRemoveFromMyCryptos(crypto);
}

const getNetworksFromGeckoterminal = async () => {
    let page = 1;
    let networks = [];
    while (true) {
        let response = await fetch(`${config.get('geckoterminal_networks_url')}${page}`);
        let datas = await response.json();
        for (let i = 0; i < datas.data.length; i++) {
            let network = datas.data[i];
            if (network.type === 'network') {
                networks.push({id: network.id, name: network.attributes.name})
            }
        }
        page++;
        if (datas.links.next === null) break;
    }
    networks.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    return {
        networks: networks
    };
}

exports.getMyCryptos = getMyCryptos
exports.getAvailableCryptos = getAvailableCryptos
exports.addToMyCrypto = addToMyCrypto
exports.removeFromMyCrypto = removeFromMyCrypto
exports.getNetworksFromGeckoterminal = getNetworksFromGeckoterminal