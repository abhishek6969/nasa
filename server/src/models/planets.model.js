const { Console } = require('console');
const path = require('path');
const { parse } = require('csv-parse');
const fs = require('fs');


const planets = require("./planets.mongo");

function isHabitable(data){
    return (data['koi_disposition'] === 'CONFIRMED'
    && data['koi_insol'] > 0.36 && data['koi_insol'] < 1.11 &&
    data['koi_prad'] < 1.6)
}
function loadPlanetsData(){
    return new Promise((resolve,reject) =>{
        fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
        .pipe(parse({
        comment :'#',
        columns : true,
        }))
        .on('data',async (data)=>{
            //TODO : replace create with upsert//done
            if (isHabitable(data)){
                savePlanet(data);
            }
        })
        .on('error',(error)=>{
            console.log(error);
            reject();
        })
        .on('end',async () =>{
            const countplanets = (await getEVERYplanet()).length;
            console.log(`${countplanets} habitable planets found`);
            resolve();
        })
    });
}

async function getEVERYplanet(){
    return await planets.find({},{
        '__v' : 0,'_id' : 0
    });
}

async function savePlanet(planet){
    try{
        await planets.updateOne({
            keplerName : planet.kepler_name
        },{
            keplerName : planet.kepler_name
        },{
            upsert : true,
        });
    }catch(err){
        console.error(`Could not save planet ${err}`)
    }
}

  module.exports = {
      loadPlanetsData,
      getEVERYplanet,
  }