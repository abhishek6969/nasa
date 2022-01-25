
const http = require('http');
const app = require('./app');
require('dotenv').config();

const {mongoConnect} = require("./services/mongo");

//const mongoose = require('mongoose');

const {loadPlanetsData} = require('./models/planets.model');
const {loadLaunchData} = require('./models/launches.model');
const { start } = require('repl');

const PORT = process.env.PORT || 8000;

const MONGO_URL = "mongodb+srv://NASA-PROJECT:abhishek%4014@nasa-project.ptmsz.mongodb.net/nasa?retryWrites=true&w=majority";

const server = http.createServer(app);



async function startServer(){
    await mongoConnect() ;
    await loadPlanetsData();
    await loadLaunchData();
    server.listen(PORT,()=>{
        console.log(`PORT : ${PORT}`);
    });
}
startServer();
