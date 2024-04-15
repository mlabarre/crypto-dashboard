![Demo Onglet Evolution](demo/evolution-dark.png?raw=true)

# crypto-dashboard

This project helps me manage my cryptocurrency transactions a little more efficiently.

I developed it in less than a week for my personal needs and the code certainly shows :)

It's really an unpretentious tool but if it can help others....

In addition to this project, my other crypto-updater project will be necessary to obtain the latest crypto prices using the coingecko APIs. These are the only internet access.

In addition, no data such as the address of your wallets is entered.

Associated with the crypto-updater project, it allows:
* manage the platforms/wallets to use,
* enter transactions as they occur, view them, delete or modify them,
* to have a multi-platform/portfolio,
* to see the evolution of cryptos,
* define alerts.

To use it, all you need is a machine with docker installed.

## Installation

### Pré-requisites

#### Docker

##### MacOS

To install it, go to https://www.docker.com/products/docker-desktop/ and choose the version for macOS.
Click on the .dmg file to install Docker.

##### Linux

Refer to the official guide. Here for Ubuntu, run the following commands in a shell:

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

The *docker* and *docker-compose* commands should now be available.

Perform the following commands in the shell (or the Utilities/Terminal app for MacOS) to retrieve both crypto-dashboard and crypto-updater projects from Github repositories.
Create a directory to receive the archives. For example */Users/me/crypto* for MacOS and */home/me/crypto* for Linux. In the following we refer to this directory by <CRYPTO_HOME>.

```
mkdir <CRYPTO_HOME>
cd <CRYPTO_HOME>
git clone https://github.com/.../crypto-dashboard
git clone https://github.com/.../crypto-updater
```

You should now see two directories *crypto-dashboard* and *crypto-updater*
It is now necessary to modify two config files:


Edit the <CRYPTO_HOME>/crypto-dashboard/config/default.json file and modify it according to your environment
```
{
"language": "en",
"fiat_currency" : "GBP",
"fiat_symbol": "£",
"mongodb_uri" : "mongodb://mongo:27017/?serverSelectionTimeoutMS=3000&directConnection=true",
"mongodb_database": "crypto",
"server_port" : 8080,
"refresh_in_seconds" : 300
}
```

| variable           | Description                                                                                              |
|:-------------------|:---------------------------------------------------------------------------------------------------------|
| language           | Language used: _**fr**_ (French) or _**en**_ (English) only.                                             |
| fiat_currency      | This is the Fiat currency (here EUR) with which you buy your cryptos. This can be EUR, USD, GBP, etc.    |
| fiat_symbol        | Currency of symbol above. This can be €, $, £, etc...                                                    |
| mongodb_uri        | This is the connection URL to the mongodb server. Don't change anything.                                 |
| mongodb_database   | Name you want to give to the mongo database. Here it is _**crypto**_.                                    |
| server_port        | Node server listening port. Here 8080.                                                                   |
| refresh_in_seconds | The portfolio and dashboard views are displayed with a refresh. Here the latter will be every 5 minutes  |

Edit the <CRYPTO_HOME>/crypto-updater/config/default.json file and modify it according to your environment

```
{
  "language": "en",
  "fiat_currency" : "GBP",
  "coingecko_currency" : "gbp",
  "mongodb_uri" : "mongodb://mongo:27017/?serverSelectionTimeoutMS=3000&directConnection=true",
  "mongodb_database": "crypto",
  "coingecko_coins_uri": "https://api.coingecko.com/api/v3/coins/list",
  "coingecko_quotation_uri": "https://api.coingecko.com/api/v3/simple/price",
  "notification_ntfy_url": "https://ntfy.sh",
  "notification_ntfy_topic": "KdiLd90OOODO"
}
```

| variable                | Description                                                                                           |
|:------------------------|:------------------------------------------------------------------------------------------------------|
| language                | Language used: _**fr**_ (French) or _**en**_ (English) only.                                          |
| fiat_currency           | This is the Fiat currency (here EUR) with which you buy your cryptos. This can be EUR, USD, GBP, etc. |
| coingecko_currency      | Currency relative to the previous variable. It must be recognized by coingecko: eur, usd, gbp, etc.   |
| mongodb_uri             | This is the connection URL to the mongodb server. Don't change anything.                              |
| mongodb_database        | Name you gave in the crypto-dashboard default.json file above.                                        |
| coingecko_coins_uri     | API to get the list of all cryptos (called once a day)                                                |
| coingecko_quotation_uri | API to obtain the quotations of the cryptos used (called once every 5 minutes)                        |
| notification_ntfy_url   | ntfy.sh URL for notifications. Don't change anything.                                                 |
| notification_ntfy_topic | Key/topic that you declared in the NTFY application                                                   |

### Wallets icons

You need to specify where wallets icons reside.

You must create the local directory where cons will be stored.

```
mkdir <CRYPTO_HOME>/icons
```

You then need to edit the docker-compose.yml file. It should look like this:

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
    image: mongo:4.4
    volumes:
      - /datas/mongodb:/data/db
    ports:
      - "27017:27017"
```

You must replace:
```
     volumes:
       - /datas/dashboard/icons:/home/node/app/public/images/icons
```
by
```
     volumes:
       - <CRYPTO_HOME>/icons:/home/node/app/public/images/icons
```

always replacing <CRYPTO_HOME> by the chosen path, of course.

### mongodb

You now need to specify where the MongoDB database named in the previous two files should be located.

For example, we could design *<CRYPTO_HOME>/mongodb* to put the database in the directory you created above.

```
mkdir <CRYPTO_HOME>/mongodb
```

You then need to edit the docker-compose.yml file. It should look like this:
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
       - /datas/mongodb:/data/db
     ports:
       - "27017:27017"
```

You must replace:
```
     volumes:
       - /datas/mongodb:/data/db
```
by
```
     volumes:
       - <CRYPTO_HOME>/mongodb:/data/db
```
always replacing <CRYPTO_HOME> by the chosen path.


## Lancement du docker 

Docker will build the images for crypto-dashboard and crypto-updater.
It will also download the mongoDB image (I put version 4.4 here because version 5 can cause problems with certain processors).
```
cd <CRYPTO_HOME>/crypto-dashboard
sudo docker-compose up -d
```

## Alertes

It is possible to define alerts on the *Evolution* view.

Notifications are sent to any device where the application open-source [ntfy](https://ntfy.sh) is installed (Android, IOS, desktop).
The necessary settings were discussed above, in the default.json configuration file of crypto-updater.

## Screenshots (french version)

The screens below in clear mode. A dark mode is selectable.

![Demo Onglet Portfolio](demo/portfolio.png?raw=true)
![Demo Onglet Evolution](demo/evolution.png?raw=true)
![Demo Onglet Cryptos](demo/cryptos.png?raw=true)
![Demo Onglet Wallets](demo/wallets.png?raw=true)
![Demo Onglet Ajout de transaction](demo/addtransaction.png?raw=true)
![Demo Onglet Transactions](demo/transactions.png?raw=true)













