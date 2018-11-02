# Angular 6 / Socket.IO - Go game

[![GitHub issues](https://img.shields.io/github/issues/smarlhens/ng6-go.svg)](https://github.com/smarlhens/ng6-go/issues)
[![GitHub forks](https://img.shields.io/github/forks/smarlhens/ng6-go.svg)](https://github.com/smarlhens/ng6-go/network)
[![GitHub stars](https://img.shields.io/github/stars/smarlhens/ng6-go.svg)](https://github.com/smarlhens/ng6-go/stargazers)
[![GitHub license](https://img.shields.io/github/license/smarlhens/ng6-go.svg)](https://github.com/smarlhens/ng6-go/blob/master/LICENSE)

This project is an online Go game using NodeJS / Socket.IO on the server side and Angular for the client side.

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
- [x] Challenge a player
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

* [NodeJS / NPM](https://nodejs.org)
* [Angular CLI](https://cli.angular.io/)

### Installing

A step by step series of examples that tell you how to get a development env running

##### Clone the git repository
```
git clone https://github.com/smarlhens/ng6-go.git
```

##### Go into the project directory
```
cd /ng6-go
```
#### Building the server
##### Go into the server directory
```
cd /server
```
##### Run the command to install dependencies
```
npm install
```
##### Launch the server
```
npm start
```
#### Building the client
##### Go into the client directory
```
cd client
```
##### Install the dependencies
```
npm install
```
##### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

##### Build for production

English version :
```
ng build --prod --configuration=en --delete-output-path
```

French version :
```
ng build --prod --configuration=fr --delete-output-path
```

## Deployment

Add additional notes about how to deploy this on a live system.

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

## License [![GitHub license](https://img.shields.io/github/license/smarlhens/ng6-go.svg)](https://github.com/smarlhens/ng6-go/blob/master/LICENSE)

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