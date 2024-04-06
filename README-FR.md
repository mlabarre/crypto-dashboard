# crypto-dashboard

Ce projet me sert à gérer un peu plus efficacement mes transactions en crypto-monnaies.

Je l'ai développé en moins d'une semaine pour mes besoins personnels et le code s'en ressent certainement :)

C'est vraiment un outil sans prétention mais s'il peut aider autrui....

En plus de ce projet, mon autre projet crypto-updater sera nécessaire pour obtenir les derniers cours des cryptos en utilisant les API de coingecko.Se sont les seuls accès à internet.

De plus aucune donnée comme l'adrese de vos portefeuilles n'est saisie.

Associé au projet crypto-updater, il permet :
* de gérer les plateformes/portefeuilles à utiliser,
* de saisir les transactions au fur et à mesure, de les consulter, de les supprimer ou de les modifier,
* de disposer d'un portefolio multi plateformes/portefeuilles,
* de voir l'évolution des cryptos.

Pour l'utiliser, il suffit d'une machine disposant d'un docker installé.

## Installation

### Pré-requis

#### Docker

##### MacOS

Pour l'installer se rendre sur https://www.docker.com/products/docker-desktop/ et choisir la version pour macOS.
Cliquer sur le fichier .dmg pour installer Docker.

##### Linux

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

### crypto-dasboard

Les commandes *docker* et *docker-compose* devraient maintenant être disponibles.

Effectuer les commandes suivantes dans le shell (ou l'application Utilitaires/Terminal pour MacOS) pour récupérer les deux projets crypto-dashboard et crypto-updater à partir des repo Github.
Créer un répertoire pour recevoir les archives. Par exemple */Users/moi/crypto* pour MacOS ou */home/me/crypto* pour Linux. Dans la suite on fait référence à ce répertoire par <CRYPTO_HOME>.

```
mkdir <CRYPTO_HOME>
cd <CRYPTO_HOME>
git clone https://github.com/.../crypto-dashboard
git clone https://github.com/.../crypto-updater
```

Vous devriez maintenant voir deux répertores *crypto-dashboard* et *crypto-updater*
Il convient maintenant de modifier deux fichiers de config:


Editer le fichier <CRYPTO_HOME>/crypto-dashboard/config/default.json et le modifier selon votre environnement

```
{
"language": "fr",
"fiat_currency" : "EUR",
"fiat_symbol": "€",
"mongodb_uri" : "mongodb://mongo:27017/?serverSelectionTimeoutMS=3000&directConnection=true",
"mongodb_database": "crypto",
"server_port" : 8080,
"refresh_in_seconds" : 300
}
```

| variable           | Description                                                                                                       |
|:-------------------|:------------------------------------------------------------------------------------------------------------------|
| language           | Langue utilisée : _**fr**_ (français) ou _**en**_ (anglais) uniquement.                                           |
| fiat_currency      | Il s'agit de la monnaie Fiat (ici EUR) avec laquelle vous achetez vos cryptos. Cela peut être EUR, USD, GBP, etc. |
| fiat_symbol        | Symbole relatif à la monnaie ci-dessus. Cela peut être €, $, £, etc...                                            |
| mongodb_uri        | C'est l'URL de connexion au serveur mongodb. Ne rien changer.                                                     |
| mongodb_database   | Nom que vous voulez donner à la database mongo. Ici c'est _**crypto**_.                                           |
| server_port        | Port d'écoute du serveur node. Ici 8080                                                                           |
| refresh_in_seconds | Les vues portfolio et dashboard sont affichées avec un rafraichissement. Ici ce dernier sera toutes les 5mn       |

Editer le fichier <CRYPTO_HOME>/crypto-updater/config/default.json et le modifier selon votre environnement

```
{
  "fiat_currency" : "EUR",
  "coingecko_currency" : "eur",
  "mongodb_uri" : "mongodb://mongo:27017/?serverSelectionTimeoutMS=3000&directConnection=true",
  "mongodb_database": "crypto",
  "coingecko_coins_uri": "https://api.coingecko.com/api/v3/coins/list",
  "coingecko_quotation_uri": "https://api.coingecko.com/api/v3/simple/price"
}
```

| variable                | Description                                                                                                       |
|:------------------------|:------------------------------------------------------------------------------------------------------------------|
| fiat_currency           | Il s'agit de la monnaie Fiat (ici EUR) avec laquelle vous achetez vos cryptos. Cela peut être EUR, USD, GBP, etc. |
| coingecko_currency      | Monnaie relative à la variable précédente. Elle doit être reconnue de coingecko : eur, usd, gbp, etc.             |
| mongodb_uri             | C'est l'URL de connexion au serveur mongodb. Ne rien changer.                                                     |
| mongodb_database        | Nom que vous avez donné dans le fichier default.json de crypto-dashboard ci-dessus.                               |
| coingecko_coins_uri     | API pour obtenir la liste de toutes les cryptos (appelée 1 fois par jour)                                         |
| coingecko_quotation_uri | API pour obtenir les quotations des cryptos utilisées (appelée 1 fois toutes les 5mn)                             |


Vous devez maintenant spécifier où doit se trouvera la base de données MongoDB nommée dans les deux fichiers précédents.

On pourrait concevoir par exemple *<CRYPTO_HOME>/mongodb* pour mettre la base de données dans le répertoire que vous avez créé plus haut.

```
mkdir <CRYPTO_HOME>/mongodb
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
  updater:
    image: crypto-updater
    build: ../crypto-updater
    depends_on:
      - mongo
  mongo:
    image: mongo
    volumes:
      - /datas/mongodb:/data/db
    ports:
      - "27017:27017"
```

Vous devez remplacer :
```
    volumes:
      - /datas/mongodb:/data/db
```
par 
```
    volumes:
      - <CRYPTO_HOME>/mongodb:/data/db
```
en replaçant toujours <CRYPTO_HOME> par le chemin choisi, bien entendu.

## Lancement du docker 

Docker va construire les images pour crypto-dashboard et crypto-updater.
Il va de plus récupérer l'image de mongoDB (j'ai mis ic la version 4.4 car la version 5 peut poser des problèmes avec certains processeurs).

```
cd <CRYPTO_HOME>/crypto-dashboard
sudo docker-compose up -d
```

## Screenshots

![Demo Onglet Portfolio](demo/portfolio.png?raw=true)
![Demo Onglet Evolution](demo/evolution.png?raw=true)
![Demo Onglet Cryptos](demo/cryptos.png?raw=true)
![Demo Onglet Wallets](demo/wallets.png?raw=true)
![Demo Onglet Ajout de transaction](demo/addTransaction.png?raw=true)
![Demo Onglet Transactions](demo/transactions.png?raw=true)












