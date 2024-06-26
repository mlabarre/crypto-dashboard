![Demo Onglet Evolution](demo/evolution-dark.png?raw=true)

# crypto-dashboard

Ce projet me sert à gérer un peu plus efficacement mes transactions en crypto-monnaies.

C'est vraiment un outil sans prétention, mais s'il peut aider autrui....

Après avoir saisi mon historique depuis 2017 (quel travail !), je peux désormais saisir mes transactions au fur et à mesure
ce qui simplifie grandement le suivi.

En plus de ce projet, mon autre projet crypto-updater sera nécessaire pour obtenir les derniers cours des cryptos en utilisant les API de coingecko.
Ce sont les seuls accès à internet.

De plus aucune donnée comme l'adresse de vos portefeuilles n'est saisie. Par contre vous avez la possibilité lors de la création d'une transaction 
de fournir l'identifiant de transaction et ainsi avoir la possibilité d'y accéder via la blockchain adéquate.

Associé au projet crypto-updater, crypto-dashboard permet :
* de gérer les plateformes/portefeuilles à utiliser,
* de saisir les transactions au fur et à mesure, de les consulter, de les supprimer ou de les modifier,
* de disposer d'un portefolio multi plateformes/portefeuilles,
* de voir l'évolution des cryptos (à 5mn, 1h, 24h et 1 semaine),
* de définir des alertes,
* de surveiller des cryptos que l'on n'a pas encore acheté.
* d'accéder aux graphiques des tokens et éventuellement aux explorers.

J'ai commencé à regarder l'alimentation automatique via les APIs des principales plateformes mais ce n'est pas gagné :
* Coinbase est la plus "ouverte" et toutes les transactions peuvent y être retrouvées mais pas de swagger. On trouve couramment des transactions de réception de crypto avec le type 'send'. Cela ne fait pas très sérieux. Coinbase indique qu'ils ont revu tout cela mais dans les faits on ne s'y retrouve pas.
* Binance fourni un jeu d'API aussi impressionnant que Coinbase à la différence près que l'API publique pour les trades (swap en particulier) n'est pas mise à disposition
* Bitpanda après divers "bricolages" s'avère utilisable
* Coinhouse / eToro et toute la clique du genre s'abrite derrière leur image grand public et n'offre que des APIs dérisoires (quand elles existent).Encore faudrait-il qu'ils commencent par fournir le hash des transactions !

Mais en tant que jeune retraité après 46 ans dans l'informatique dont 20 ans d'IT, il faut bien que je m'occupe :)

Etant utilisateur en autres de la plateforme Binance, j'ai implémenté la possibilité de saisir de manière quasi automatique tous les trades effectués avec les paires *USDT et *BNB.

Pour l'utiliser, il suffit d'une machine disposant d'un docker installé.

Le projet utilise
* les API coingecko
* les API geckoterminal
* la bibliothèque de graphes de TradingView

## Installation

### Pré-requis

#### Docker

###### MacOS

Pour l'installer se rendre sur https://www.docker.com/products/docker-desktop/ et choisir la version pour macOS.
Cliquer sur le fichier .dmg pour installer Docker.

###### Linux

Se reporter au guide officiel. Ici pour Ubuntu, lancer les commandes suivantes dans un shell :

```
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-compose
```
### Installation simple à partir de Docker Hub

C'est l'installation la plus simple.

La documentation est dans l'overview de l'image docker [labarrem/crypto-dashboard-ui](https://hub.docker.com/r/labarrem/crypto-dashboard-ui)

La première chose à faire est de choisir le répertoire de base pour l'installation. Appelons-le *CRYPTO_HOME*.

Dans un terminal, passer les commandes suivantes:
```
CRYPTO_HOME=<répertoire qui a été choisi>
mkdir -p $CRYPTO_HOME/dashboard
mkdir -p $CRYPTO_HOME/dashboard/icons
mkdir -p $CRYPTO_HOME/dashboard/mongodb
mkdir -p $CRYPTO_HOME/dashboard/config
```

Dans <CRYPTO_HOME>/dashboard/config créer un fichier nommé *default.json* avec le contenu suivant (contenu visible dans ce projet dans demo/default.json):
```
{
    "language": "fr",
    "timezone": "Europe/Paris",
    "fiat_currency" : "EUR",
    "fiat_symbol": "€",
    "decimal_separator": ",",
    "coingecko_currency" : "eur",
    "mongodb_uri" : "mongodb://mongo:27017/?serverSelectionTimeoutMS=3000&directConnection=true",
    "mongodb_database": "crypto",
    "server_port" : 8080,
    "refresh_in_seconds" : 120,
    "coingecko_coins_url": "https://api.coingecko.com/api/v3/coins/list",
    "coingecko_quotation_url": "https://api.coingecko.com/api/v3/simple/price",
    "coingecko_chart_api": "https://api.coingecko.com/api/v3/coins/TOKEN/market_chart?vs_currency=CURRENCY&days=DAYS",
    "geckoterminal_networks_url": "https://api.geckoterminal.com/api/v2/networks?page=",
    "geckoterminal_quotation_url": "https://api.geckoterminal.com/api/v2/simple/networks/NETWORK/token_price/",
    "notification_ntfy_url": "https://ntfy.sh",
    "notification_ntfy_topic": ".......",
    "chain_explorers": [
    {
      "name": "Binance BSC",
      "url": "https://bscscan.com/tx/"
    },
    {
      "name": "Bitcoin",
      "url": "https://blockstream.info/tx/"
    },
    {
      "name": "Cosmos",
      "url": "https://www.mintscan.io/cosmos/tx/"
    },
    {
      "name": "Ethereum",
      "url": "https://etherscan.io/tx/"
    },
    {
      "name": "Optimism",
      "url": "https://optimistic.etherscan.io/tx/"
    },
    {
      "name": "Polygon",
      "url": "https://polygonscan.com/tx/"
    },
    {
      "name": "Solana",
      "url": "https://solscan.io/tx/"
    },
    {
      "name": "XRP",
      "url": "https://bithomp.com/explorer/"
    }
  ],
  "platforms_api": {
    "binance": {
      "api_key": "<BINANCE_API-KEY>",
      "secret_key": "<BINANCE_SECRET-KEY>",
      "withdraw_list_url": "https://api.binance.com/sapi/v1/capital/withdraw/history",
      "payments_list_url": "https://api.binance.com/sapi/v1/fiat/payments",
      "convert_url": "https://api.binance.com/sapi/v1/convert/tradeFlow",
      "trades_histo_url": "https://api.binance.com/api/v3/myTrades"
    },
    "coinbase": {
      "api_key": "<COINBASE_API_KEY>",
      "secret_key": "<COINBASE_PRIVATE_KEY",
      "host": "api.coinbase.com",
      "accounts_path": "/v2/accounts"
    },
    "bitpanda": {
      "api_key": "<BITPANDA_API_KEY>",
      "base_url": "https://api.bitpanda.com/v1"
    }
  }
}
```
Se référer à la description des valeurs dans le chapitre *Installation manuelle* ci-dessous pour dashboard et updater.

Ici les configurations sont communes.

Vous créer (ou copier à partir de ce projet Github) le fichier docker-compose-images.yml :
```
services:
  dashboard:
    image: labarrem/crypto-dashboard-ui:stable
    ports:
      - "8080:8080"
    depends_on:
      - mongo
    volumes:
      - /datas/dashboard/icons:/home/node/app/public/images/icons
      - /datas/dashboard/config:/home/node/app/config
    restart: unless-stopped
  updater:
    image: labarrem/crypto-dashboard-data:stable
    depends_on:
      - mongo
    volumes:
      - /datas/dashboard/config:/home/node/app/config
    restart: unless-stopped
  mongo:
    image: mongo:4.4
    volumes:
      - /datas/dashboard/mongodb:/data/db
    ports:
      - "27017:27017"
    restart: unless-stopped
```
en remplaçant toutes les chaines '/datas/dashboard' par le répertoire choisi (valeur de CRYPTO_HOME) ci-dessus.

Note: le port d'écoute du service dashboard dépend des informations codées dans ce fichier *docker-compose-images.yml* mais
aussi dans le fichier de configuration *default.json*.
Le port indiqué dans *docker-compose-images.yml* est 8080:8080. Cela indique que vous pourrez vous connecter
sur le serveur par le port 8080 (premier 8080 avant ':') en http://localhost:8080. Le second 8080 (après le ':')
doit correspondre au port indiqué dans le fichier *default.json*. Vous ne pouvez changer que le numéro de port
avant le caractère ':'.

Pour le lancement, passer la commande et accéder au dashboard par http://localhost:8080
```
  docker compose -f ./docker-compose-images.yml up -d
```
 
### Installation manuelle à partir de Git Hub

#### crypto-dashboard

Les commandes *docker* et *docker-compose* devraient maintenant être disponibles.

Effectuer les commandes suivantes dans le shell (ou l'application Utilitaires/Terminal pour MacOS) pour récupérer les deux projets crypto-dashboard et crypto-updater à partir des repo Github.
Créer un répertoire pour recevoir les archives. Par exemple */Users/moi/crypto* pour MacOS ou */home/me/crypto* pour Linux. Dans la suite on fait référence à ce répertoire par <CRYPTO_HOME>.

```
mkdir <CRYPTO_HOME>
cd <CRYPTO_HOME>
git clone https://github.com/mlabarre/crypto-dashboard.git
git clone https://github.com/mlabarre/crypto-updater.git
```

Vous devriez maintenant voir deux répertoires *crypto-dashboard* et *crypto-updater*
Il convient maintenant de modifier deux fichiers de config:


Editer le fichier <CRYPTO_HOME>/crypto-dashboard/config/default.json et le modifier selon votre environnement

```
{
    "language": "fr",
    "timezone": "Europe/Paris",
    "fiat_currency" : "EUR",
    "fiat_symbol": "€",
    "decimal_separator": ",",
    "mongodb_uri" : "mongodb://mongo:27017/?serverSelectionTimeoutMS=3000&directConnection=true",
    "mongodb_database": "crypto",
    "server_port" : 8080,
    "refresh_in_seconds" : 300,
    "coingecko_chart_api": "https://api.coingecko.com/api/v3/coins/TOKEN/market_chart?vs_currency=CURRENCY&days=DAYS",
    "geckoterminal_networks_url": "https://api.geckoterminal.com/api/v2/networks?page=",
    "chain_explorers": [
    {
      "name": "Binance BSC",
      "url": "https://bscscan.com/tx/"
    },
    {
      "name": "Bitcoin",
      "url": "https://blockstream.info/tx/"
    },
    {
      "name": "Cosmos",
      "url": "https://www.mintscan.io/cosmos/tx/"
    },
    {
      "name": "Ethereum",
      "url": "https://etherscan.io/tx/"
    },
    {
      "name": "Optimism",
      "url": "https://optimistic.etherscan.io/tx/"
    },
    {
      "name": "Polygon",
      "url": "https://polygonscan.com/tx/"
    },
    {
      "name": "Solana",
      "url": "https://solscan.io/tx/"
    },
    {
      "name": "XRP",
      "url": "https://bithomp.com/explorer/"
    }
  ],
  "platforms_api": {
    "binance": {
      "api_key": "<BINANCE_API-KEY>",
      "secret_key": "<BINANCE_SECRET-KEY>",
      "withdraw_list_url": "https://api.binance.com/sapi/v1/capital/withdraw/history",
      "payments_list_url": "https://api.binance.com/sapi/v1/fiat/payments",
      "convert_url": "https://api.binance.com/sapi/v1/convert/tradeFlow",
      "trades_histo_url": "https://api.binance.com/api/v3/myTrades"
    },
    "coinbase": {
      "api_key": "<COINBASE_API_KEY>",
      "secret_key": "<COINBASE_PRIVATE_KEY",
      "host": "api.coinbase.com",
      "accounts_path": "/v2/accounts"
    },
    "bitpanda": {
      "api_key": "<BITPANDA_API_KEY>",
      "base_url": "https://api.bitpanda.com/v1"
    }
  }
}
```

| variable                   | Description                                                                                                                               |
|:---------------------------|:------------------------------------------------------------------------------------------------------------------------------------------|
| language                   | Langue utilisée : _**fr**_ (français) ou _**en**_ (anglais) uniquement.                                                                   |
| timezone                   | Time zone (ex Europe/Paris)                                                                                                               |
| fiat_currency              | Il s'agit de la monnaie Fiat (ici EUR) avec laquelle vous achetez vos cryptos. Cela peut être EUR, USD, GBP, etc.                         |
| fiat_symbol                | Symbole relatif à la monnaie ci-dessus. Cela peut être €, $, £, etc...                                                                    |
| decimal_separator          | Caractère séparateur de décimales.                                                                                                        |
| mongodb_uri                | C'est l'URL de connexion au serveur mongodb. Ne rien changer.                                                                             |
| mongodb_database           | Nom que vous voulez donner à la database mongo. Ici c'est _**crypto**_.                                                                   |
| server_port                | Port d'écoute du serveur node. Ici 8080                                                                                                   |
| refresh_in_seconds         | Les vues portfolio et dashboard sont affichées avec un rafraichissement. Ici ce dernier sera toutes les 5mn                               |
| coingecko_chart_api        | API coingecko pour les graphiques. Ne pas modifier.                                                                                       |
| geckoterminal_networks_url | URL pour la liste des réseaux sur geckoterminal. Ne rien changer.                                                                         |
| chain_explorers            | URL des principaux explorateurs de blockchain. Vous pouvez en ajouter.                                                                    |
 | platforms_api              | Pour expérimentation. Pour utiliser la saisie automatique des trades sur Binance, le bloc "binance" est requis avec des valeurs correctes |

Editer le fichier <CRYPTO_HOME>/crypto-updater/config/default.json et le modifier selon votre environnement

```
{
    "language": "fr",
    "fiat_currency" : "EUR",
    "coingecko_currency" : "eur",
    "mongodb_uri" : "mongodb://mongo:27017/?serverSelectionTimeoutMS=3000&directConnection=true",
    "mongodb_database": "crypto",
    "coingecko_coins_url": "https://api.coingecko.com/api/v3/coins/list",
    "coingecko_quotation_url": "https://api.coingecko.com/api/v3/simple/price",
    "geckoterminal_quotation_url": "https://api.geckoterminal.com/api/v2/simple/networks/NETWORK/token_price/",
    "notification_ntfy_url": "https://ntfy.sh",
    "notification_ntfy_topic": "KdiLd90OOODO"
}
```

| variable                    | Description                                                                                                       |
|:----------------------------|:------------------------------------------------------------------------------------------------------------------|
| language                    | Langue utilisée : _**fr**_ (français) ou _**en**_ (anglais) uniquement.                                           |
| fiat_currency               | Il s'agit de la monnaie Fiat (ici EUR) avec laquelle vous achetez vos cryptos. Cela peut être EUR, USD, GBP, etc. |
| coingecko_currency          | Monnaie relative à la variable précédente. Elle doit être reconnue de coingecko : eur, usd, gbp, etc.             |
| mongodb_uri                 | C'est l'URL de connexion au serveur mongodb. Ne rien changer.                                                     |
| mongodb_database            | Nom que vous avez donné dans le fichier default.json de crypto-dashboard ci-dessus.                               |
| coingecko_coins_url         | API pour obtenir la liste de toutes les cryptos (appelée 1 fois par jour)                                         |
| coingecko_quotation_url     | API pour obtenir les quotations des cryptos utilisées (appelée 1 fois toutes les 5mn)                             |
 | geckoterminal_quotation_url | URL pour les cours des cryptos sur geckoterminal. Ne rien changer.                                                | 
| notification_ntfy_url       | URL de ntfy.sh pour les notifications. Ne rien changer.                                                           |
| notification_ntfy_topic     | Clef/topic que vous avez déclaré dans l'application NTFY. (voir le paragraphe *Alertes* ci-dessous)               |


###### Wallets icons

Vous devez indiquer un répertoire où seront stockées les icônes des wallets.

Créer ce répertoire

```
mkdir <CRYPTO_HOME>/dashboard/icons
```

Vous devez ensuite éditer le fichier docker-compose.yml. Il doit ressembler à cela:

```
version: "3"
services:
  dashboard:
    image: crypto-dashboard
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mongo
    volumes:
      - /datas/dashboard/icons:/home/node/app/public/images/icons
  updater:
    image: crypto-updater
    build: ../crypto-updater
    depends_on:
      - mongo
  mongo:
    image: mongo
    volumes:
      - /datas/dashboard/mongodb:/data/db
    ports:
      - "27017:27017"
```
Vous devez remplacer :
```
     volumes:
       - /datas/dashboard/icons:/home/node/app/public/images/icons
```
par
```
     volumes:
       - <CRYPTO_HOME>/dashboard/icons:/home/node/app/public/images/icons
```

en remplaçant toujours <CRYPTO_HOME> par le chemin choisi.

Pour initialiser le répertoire avec les icônes fournies dans le projet *crypto-dashboard* effectuer la commande suivante :

```
cp <CRYPTO_HOME>/crypto-dashboard/public/images/icons/* <CRYPTO_HOME>/dashboard/icons
```
en remplaçant toujours <CRYPTO_HOME> par le chemin choisi.

###### mongodb

Vous devez maintenant spécifier où doit se trouvera la base de données MongoDB nommée dans les deux fichiers précédents.

On pourrait concevoir par exemple *<CRYPTO_HOME>/mongodb* pour mettre la base de données dans le répertoire que vous avez créé plus haut.

```
mkdir <CRYPTO_HOME>/dashboard/mongodb
```

Vous devez ensuite éditer le fichier docker-compose.yml. Il doit ressembler à cela:
```
version: "3"
services:
  dashboard:
    image: crypto-dashboard
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - mongo
    volumes:
      - /datas/dashboard/icons:/home/node/app/public/images/icons
  updater:
    image: crypto-updater
    build: ../crypto-updater
    depends_on:
      - mongo
  mongo:
    image: mongo
    volumes:
      - /datas/dashboard/mongodb:/data/db
    ports:
      - "27017:27017"
```

Vous devez remplacer :
```
    volumes:
      - /datas/dashboard/mongodb:/data/db
```
par 
```
    volumes:
      - <CRYPTO_HOME>/dashboard/mongodb:/data/db
```
en remplaçant toujours <CRYPTO_HOME> par le chemin choisi, bien entendu.

Note: le port d'écoute du service dashboard dépend des informations codées dans ce fichier *docker-compose.yml* mais 
aussi dans le fichier de configuration *default.json*.
Le port indiqué dans *docker-compose.yml* est 8080:8080. Cela indique que vous pourrez vous connecter
sur le serveur par le port 8080 (premier 8080 avant ':') en http://localhost:8080. Le second 8080 (après le ':') 
doit correspondre au port indiqué dans le fichier *default.json*. Vous ne pouvez changer que le numéro de port 
avant le caractère ':'.
                                                               

### Lancement du docker 

Docker va construire les images pour crypto-dashboard et crypto-updater.
Il va de plus récupérer l'image de mongoDB (j'ai mis ici la version 4.4 car la version 5 peut poser des problèmes avec certains processeurs).

```
cd <CRYPTO_HOME>/crypto-dashboard
sudo docker compose up -d
```

Sur MACOS, si la commande docker compose se plante, essayer sans le *sudo*.

## Alertes

Il est possible de définir des alertes sur les vues *Evolution* et *Surveillance*.

Les notifications sont envoyées sur tout équipement où l'application 
open-source [ntfy](https://ntfy.sh) est installée (Android, IOS, desktop).
Les paramètres nécessaires ont été abordés plus haut, dans le fichier de configuration default.json
de crypto-updater.


## Accès

Si la machine installée est *myhost*, le dashboard est accessible à partir de l'URL : http://myhost:8080

## Pour commencer

Commencer par ajouter les *wallets* manquants s'il y a lieu en utilisant l'onglet *wallets*. Ensuite, au moyen de l'onglet *Cryptos* sélectionner les cryptos dont vous disposer.
Ensuite, il ne vous reste qu'à saisir vos transactions passées.

## Support

Si vous rencontrez quelques soucis ou des questions vous pouvez m'envoyer un petit mail à [michel.labarre@gmail.com](mailto:michel.labarre@gmail.com).
Je ferai mon possible pour vous répondre.

## Screenshots

Les écrans ci-dessous en mode clair. Un mode dark est sélectionnable.

![Demo Onglet Portfolio](demo/portfolio.png?raw=true)
![Demo Onglet Evolution](demo/evolution.png?raw=true)
![Demo Onglet Cryptos](demo/cryptos.png?raw=true)
![Demo Onglet Wallets](demo/wallets.png?raw=true)
![Demo Onglet Ajout de transaction](demo/addtransaction.png?raw=true)
![Demo Onglet Transactions](demo/transactions.png?raw=true)












