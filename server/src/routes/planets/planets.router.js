const express = require('express');

const planetsController = require('./planets.controller');

const planetsrouter = express.Router();

planetsrouter.get('/',planetsController.getAllPlanets);

module.exports = planetsrouter
