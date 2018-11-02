# Angular 6 / Socket.IO - Go game

[![GitHub issues](https://img.shields.io/github/issues/smarlhens/ng6-go.svg)](https://github.com/smarlhens/ng6-go/issues)
[![GitHub forks](https://img.shields.io/github/forks/smarlhens/ng6-go.svg)](https://github.com/smarlhens/ng6-go/network)
[![GitHub stars](https://img.shields.io/github/stars/smarlhens/ng6-go.svg)](https://github.com/smarlhens/ng6-go/stargazers)
[![GitHub license](https://img.shields.io/github/license/smarlhens/ng6-go.svg)](https://github.com/smarlhens/ng6-go/blob/master/LICENSE)

This project is an online Go game using NodeJS / Socket.IO on the server side and Angular for the client side.

* Demo (EN) : [click here](https://ng6-go.marlhens.com)
* Demo (FR) : [click here](https://ng6-go.marlhens.fr)

> If you want to test playing against yourself, you should know that the game uses **localStorage**. 
> Here are two solutions:
> * Launch the game from two different browsers.
> * Launch one game in normal mode and the other in private browsing mode.

## Table of Contents 

- [Functionalities](#functionalities)
  - [Homepage](#homepage)
  - [In game](#in-game)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
- [Deployment](#deployment)
- [Built With](#built-with)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [Code of Conduct](#code-of-conduct)
- [Authors](#authors)
- [License](#license)
- [TODO / IDEAS](#todo--ideas-)

---

## Functionalities

##### Homepage
- [x] List of pending games
- [x] Search a player
- [ ] Challenge a player (partially)
- [x] Chat with other players
- [x] Create and join a game
- [x] Username auto generated
- [x] Custom username
- [x] Translation : EN/FR
- [ ] Custom game settings (dimension, handicaps)
- [ ] Auto kick AFK players

##### In game
- [x] Each game has an URL
- [x] Chat with your opponent
- [ ] Spectator mode
- [ ] Go game
  - [x] Game start when both players are ready
  - [x] Board and stones
  - [x] Skip your turn
  - [ ] Rules implementation (partially)
  - [ ] Scores display

Check the [todo list](#todo--ideas-) at the end of the page for more informations.

---

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

* [Git](https://git-scm.com/)
* [NodeJS / NPM](https://nodejs.org)
* [Angular CLI](https://cli.angular.io/)

### Installing

A step by step series of examples that tell you how to get a development env running

##### Clone the git repository
```bash
git clone https://github.com/smarlhens/ng6-go.git
```

##### Go into the project directory
```bash
cd ng6-go
```
#### Building the server
##### Go into the server directory
```bash
cd server
```
##### Run the command to install dependencies
```bash
npm install
```
##### Launch the server
```bash
npm start
```
#### Building the client
##### Go into the client directory
```bash
cd client
```
##### Install the dependencies
```bash
npm install
```
##### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

##### Build for production

English version :
```bash
ng build --prod --configuration=en --delete-output-path
```

French version :
```bash
ng build --prod --configuration=fr --delete-output-path
```

## Deployment

### Debian 9 with Apache 2.4

* First you need to install the project (see [Getting started](#getting-started))

#### Host NodeJS server as a background service

> Source : [stackoverflow](https://stackoverflow.com/questions/4018154/how-do-i-run-a-node-js-app-as-a-background-service#answer-29042953)

* Then you need to create a system service to launch you server in background mode
```bash
touch ng6-go.service
```
* Here is the content of the file
```
[Unit]
Description=ng6 Go Game

[Service]
ExecStart=/path/to/project/ng6-go/server/dist/index.js
Restart=always
User=nobody
# Note Debian/Ubuntu uses 'nogroup', RHEL/Fedora uses 'nobody'
Group=nogroup
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/path/to/project/ng6-go/server

[Install]
WantedBy=multi-user.target
```
* Copy the file into the systemd folder
```bash
cp ng6-go.service /etc/systemd/system
```
* To start the service
```bash
systemctl start ng6-go.service
```
* To stop the service
```bash
systemctl stop ng6-go.service
```

#### Create VirtualHost

> Source (FR) : [click here](http://blog.nicolasc.eu/node-js-derriere-un-proxy-apache/)

* Go to Apache sites directory
```bash
cd /etc/apache2/sites-available/
```

> I think there is a simpler method than doing two VirtualHost.

* Then create a VirtualHost for the server :
```
<VirtualHost ng6-go-server.domain.tld:80>
   ServerName ng6-go-server.domain.tld
   RedirectPermanent / https://ng6-go-server.domain.tld
   ProxyRequests off
   <Proxy *>
      Order deny,allow
      Allow from all
   </Proxy>
   <Location />
      ProxyPass http://127.0.0.1:1337/
      ProxyPassReverse http://127.0.0.1:1337/
   </Location>
   LogLevel warn
   ErrorLog /var/log/apache2/ng6-go-server-domain-tld_error.log
   CustomLog /var/log/apache2/ng6-go-server-_access.log combined
</VirtualHost>
```
* Do the same for the client :
```
<VirtualHost ng6-go.domain.tld:80>
    ServerName ng6-go.domain.tld
    Redirect permanent / https://ng6-go.domain.tld
    DocumentRoot /path/to/project/ng6-go/client/dist/ng6-go-en
    <Directory /path/to/project/ng6-go/client/dist/ng6-go-en>
        Options -Indexes
        AllowOverride All
        Require all granted
        Options FollowSymlinks
        Allow from All
        Order Allow,Deny
    </Directory>
    LogLevel warn
    ErrorLog /var/log/apache2/ng6-go-domain-tld_error.log
    CustomLog /var/log/apache2/ng6-go-domain-tld_access.log combined
</VirtualHost>
```

> NB : I also have VirtualHost for HTTPS.

* Enable both sites and reload Apache
```bash
a2ensite ng6-go-client.conf
a2ensite ng6-go-server.conf
service apache2 reload
```

## Built With

* [NPM](https://www.npmjs.com/) - Package manager for Node.js packages
* [Socket.IO](https://socket.io/) - Real-time engine
* [Angular](https://angular.io/) - The frontend framework used
* [Angular Material](https://v6.material.angular.io/) - Material Design components for Angular
* [Angular MDC](https://github.com/material-components/material-components-web) - Modular and customizable Material Design UI components

## Contributing

Feel free to submit your suggestions for improvements to help this project evolve.

## Versioning

We use [git - github](https://github.com/) for versioning. For the versions available, see the [tags on this repository](https://github.com/smarlhens/ng6-go/tags). 

## Code of Conduct

See [CODE_OF_CONDUCT.md](https://github.com/smarlhens/ng6-go/blob/master/CODE_OF_CONDUCT.md).

## Authors
Name of the contributor authors :
* [Samuel Marlhens](https://samuel.marlhens.fr)

## License
 
This project is licensed under the [Apache License Version 2.0](https://github.com/smarlhens/ng6-go/blob/master/LICENSE).

## TODO / IDEAS :
* footer : Add a footer
* footer : Add conditions of uses
* footer : Add number of online players
* game : If the player leaves the namespace, declare the victory of the remaining player
* game : Custom game settings (dimension, handicaps)
* game : Add a spectator mode on game
* game : On game end, destroy game component
* games : List only the games not started/empty
* overview : display the number of points (score)
* overview : history of movements
* server : Auto leave for AFK socket
* server : get event on refresh page / leave page to disconnect socket