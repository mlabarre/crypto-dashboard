![Demo Onglet Evolution](demo/evolution-dark.png?raw=true)

# crypto-dashboard

This project helps me manage my cryptocurrency transactions a little more efficiently.

I developed it in less than a week for my personal needs and the code certainly shows :)

It's really an unpretentious tool but if it can help others....

In addition to this project, my other crypto-updater project will be necessary to obtain the latest crypto prices using the coingecko APIs. These are the only internet access.

In addition, no data such as the address of your wallets is entered.

Associated with the crypto-updater project, crypto-dashboard allows:

* manage the platforms/wallets to use,
* enter transactions as they occur, view them, delete or modify them,
* to have a multi-platform/portfolio,
* to see the evolution of cryptos (at 5mn, 1h, 1 day et 1 week),
* define alerts,
* to monitor cryptos that you have not yet purchased.

To use it, all you need is a machine with docker installed.

## Installation

### Pré-requisites

#### Docker

###### MacOS

To install it, go to https://www.docker.com/products/docker-desktop/ and choose the version for macOS.
Click on the .dmg file to install Docker.

###### Linux

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

### Simplest installation from Docker Hub

This is the simplest installation.

The first thing to do is to choose the base directory for the installation. Let's call it *CRYPTO_HOME*.

In a terminal, enter the following commands:
```
CRYPTO_HOME=<directory that was chosen>
mkdir -p $CRYPTO_HOME/dashboard
mkdir -p $CRYPTO_HOME/dashboard/icons
mkdir -p $CRYPTO_HOME/dashboard/mongodb
mkdir -p $CRYPTO_HOME/dashboard/config
```

In <CRYPTO_HOME>/config create a file named *default.json* with the following content (content visible in this project in demo/default.json):
```
{
    "language": "fr",
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
    "notification_ntfy_url": "https://ntfy.sh",
    "notification_ntfy_topic": "......."
}
```
Refer to the description of the values in the *Manual installation* chapter below for dashboard and updater.

Here the configurations are common.

You create (or copy from this Github project) the docker-compose-images.yml file:
```
services:
  dashboard:
    image: labarrem/crypto-dashboard-ui:latest
    ports:
      - "8080:8080"
    depends_on:
      - mongo
    volumes:
      - /datas/dashboard/icons:/home/node/app/public/images/icons
      - /datas/dashboard/config:/home/node/app/config
    restart: unless-stopped
  updater:
    image: labarrem/crypto-dashboard-data:latest
    depends_on:
      - mongo
    volumes:
      - /datas/dashboard/config:/home/node/app/config
    restart: unless-stopped
  mongo:
    image: mongo:4.4
    volumes:
      - /datas/mongodb:/data/db
    ports:
      - "27017:27017"
    restart: unless-stopped
```
by replacing all the strings '/datas/dashboard' with the chosen directory (<CRYPTO_HOME>) above.

Note: the dashboard service listen port depends on the information coded in this *docker-compose-images.yml* file but
also in the *default.json* configuration file.
The port indicated in *docker-compose-images.yml* is 8080:8080. This indicates that you will be able to connect
on the server via port 8080 (first 8080 before ':') at http://localhost:8080. The second 8080 (after the ':')
must match the port specified in the *default.json* file. You can only change the port number
before the ':' character.

To launch, submit the following command and access the dashboard by http://localhost:8080
```
  docker compose -f ./docker-compose-images.yml up -d
```

### Manual installation from Git Hub

#### crypto-dashboard

The *docker* and *docker-compose* commands should now be available.

Perform the following commands in the shell (or the Utilities/Terminal app for MacOS) to retrieve both crypto-dashboard and crypto-updater projects from Github repositories.
Create a directory to receive the archives. For example */Users/me/crypto* for MacOS and */home/me/crypto* for Linux. In the following we refer to this directory by <CRYPTO_HOME>.

```
mkdir <CRYPTO_HOME>
cd <CRYPTO_HOME>
git clone https://github.com/mlabarre/crypto-dashboard.git
git clone https://github.com/mlabarre/crypto-updater.git
```

You should now see two directories *crypto-dashboard* and *crypto-updater*
It is now necessary to modify two config files:


Edit the <CRYPTO_HOME>/crypto-dashboard/config/default.json file and modify it according to your environment
```
{
    "language": "fr",
    "fiat_currency" : "EUR",
    "fiat_symbol": "€",
    "decimal_separator": ",",
    "mongodb_uri" : "mongodb://mongo:27017/?serverSelectionTimeoutMS=3000&directConnection=true",
    "mongodb_database": "crypto",
    "server_port" : 8080,
    "refresh_in_seconds" : 300
}
```

| variable           | Description                                                                                             |
|:-------------------|:--------------------------------------------------------------------------------------------------------|
| language           | Language used: _**fr**_ (French) or _**en**_ (English) only.                                            |
| fiat_currency      | This is the Fiat currency (here EUR) with which you buy your cryptos. This can be EUR, USD, GBP, etc.   |
| fiat_symbol        | Currency of symbol above. This can be €, $, £, etc...                                                   |
| decimal_separator  | Decimal separator charcater                                                                             |
| mongodb_uri        | This is the connection URL to the mongodb server. Don't change anything.                                |
| mongodb_database   | Name you want to give to the mongo database. Here it is _**crypto**_.                                   |
| server_port        | Node server listening port. Here 8080.                                                                  |
| refresh_in_seconds | The portfolio and dashboard views are displayed with a refresh. Here the latter will be every 5 minutes |

Edit the <CRYPTO_HOME>/crypto-updater/config/default.json file and modify it according to your environment

```
{
    "language": "fr",
    "fiat_currency" : "EUR",
    "coingecko_currency" : "eur",
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

###### Wallets icons

You need to specify where wallets icons reside.

You must create the local directory where icons will be stored.

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

Note: the dashboard service listen port depends on the information coded in this *docker-compose.yml* file but
also in the *default.json* configuration file.
The port indicated in *docker-compose.yml* is 8080:8080. This indicates that you will be able to connect
on the server via port 8080 (first 8080 before ':') at http://localhost:8080. The second 8080 (after the ':')
must match the port specified in the *default.json* file. You can only change the port number
before the ':' character.

To initialize the folder with the icons supplied in project *crypto-dashboard* enter the following command :

```
cp <CRYPTO_HOME>/crypto-dashboard/public/images/icons/* <CRYPTO_HOME>/icons
```

replacing <CRYPTO_HOME> by the chosen path.

###### mongodb

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


### Lancement du docker 

Docker will build the images for crypto-dashboard and crypto-updater.
It will also download the mongoDB image (I put version 4.4 here because version 5 can cause problems with some processors).
```
cd <CRYPTO_HOME>/crypto-dashboard
sudo docker compose up -d
```

With MACOS, if the docker compose command fails, try without *sudo*.

## Alertes

It is possible to define alerts on the *Evolution* view.

Notifications are sent to any device where the application open-source [ntfy](https://ntfy.sh) is installed (Android, IOS, desktop).
The necessary settings were discussed above, in the default.json configuration file of crypto-updater.

## Access

If your installed host is *myhost*, the dashboard is accessible from the URL : http://myhost:8080

## To start

Start by adding the missing *wallets* if necessary using the *wallets* tab. Then, using the *Cryptos* tab, select the cryptos you have.
Then all you have to do is enter your past transactions.

## Support

If you encounter any problems you can send me a quick email to [michel.labarre@gmail.com](mailto:michel.labarre@gmail.com).
I will do my best to answer you.

## Screenshots (french version)

The screens below in clear mode. A dark mode is selectable.

![Demo Onglet Portfolio](demo/portfolio.png?raw=true)
![Demo Onglet Evolution](demo/evolution.png?raw=true)
![Demo Onglet Cryptos](demo/cryptos.png?raw=true)
![Demo Onglet Wallets](demo/wallets.png?raw=true)
![Demo Onglet Ajout de transaction](demo/addtransaction.png?raw=true)
![Demo Onglet Transactions](demo/transactions.png?raw=true)













