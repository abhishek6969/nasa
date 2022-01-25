const launchesDatabase = require("./launches.mongo");

const planets = require("./planets.mongo");

const axios = require("axios");

const defaultFlightNumber = 100;

queryForSpaceX = {
    query : {},
    options : {
        pagination : false,
        populate : [
            {
                path : "rocket",
                select : {
                    name : 1
                }
            },
            {
                path : "payloads",
                select : {
                    customers : 1
                }
            }
        ]
    }
}

let latestFlightNumber = 100;

const SPACEX_URL = "https://api.spacexdata.com/v4/launches/query";

const launch = {
    flightNumber : 100,//flight_Number
    mission : 'Mission X',//name
    rocket  : 'explore 1', //rocket_Name
    launchDate : new Date('December 17,2050'),//date_local
    target : 'Kepler-1652 b',//NA
    customer : ['nasa','abhi'],//payload.custoers for each payload
    upcoming : true,//upcoming
    success : true, //success
}
saveLaunch(launch);

async function populateLaunches(){
    console.log("Downloading SpaceX data");
    const response = await axios.post(SPACEX_URL,queryForSpaceX);
    if (response.status!=200){
        console.log("Problem downloading data");
        throw new Error("Problem downloading data"); 
    }
    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs){

        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap(()=>{
            return payloads["customers"]
        });
        
        const launch = {
            flightNumber : launchDoc['flight_number'],
            mission : launchDoc['name'],
            rocket : launchDoc['rocket']['name'],
            launchDate : launchDoc['date_local'],
            success : launchDoc['success'],
            upcoming : launchDoc['upcoming'],
            customers : customers,
        };
    
        console.log(`${launch.flightNumber} and ${launch.mission    }`)
        await saveLaunch(launch);
    }
}



async function loadLaunchData(){
    const firstLaunch = await findLaunchInDatabase({
        flightNumber : 1,
        rocket : "Falcon 1",
        mission : "FalconSat"
    })
    if (firstLaunch){
        console.log("Data already available");
    }else{
        await populateLaunches();
    }
        
}

async function findLaunchInDatabase(filter){
    return await launchesDatabase.findOne(filter);
}

async function getEVERYlaunch(skip,limit){
    return await launchesDatabase
      .find({},{
        '__v' : 0,'_id' : 0
    })
    .sort({flightNumber : 1})
    .skip(skip)
    .limit(limit);
}

async function getLatestFlightumber(){
    const latestLaunch = await launchesDatabase
      .findOne()
      .sort("-flightNumber");
    if (!latestLaunch){
        return defaultFlightNumber;
    }
    return latestLaunch.flightNumber;
}

async function saveLaunch(launch){  
    await launchesDatabase.findOneAndUpdate({
        flightNumber : launch.flightNumber
    },launch,{
        upsert : true,
    })
}

async function scheduleNewLaunch(launch){
    const planet = await planets.findOne({
        keplerName : launch.target,
    });
    if (!planet){
        throw new Error("No matching planet found");
    }
    const newFlightNumber = await getLatestFlightumber() + 1;

    const newLaunch = Object.assign(launch,{
        success : true,
        upcoming : true,
        customer : ['SpaceX','NASA'],
        flightNumber : newFlightNumber,
    });
    await saveLaunch(newLaunch);

}

/* function addNewLaunch(launch){
    latestFlightNumber+=1;
    launches.set(latestFlightNumber,Object.assign(launch,{
        flightNumber : latestFlightNumber,
        customer : ['SpaceX','NASA'],
        upcoming : true,
        success : true,
    }));
    
} */
async function hasLaunchID(launchID){
    return await findLaunchInDatabase({
        flightNumber : launchID
    });
}
async function abortLaunchByID(launchID){
    const aborted = await launchesDatabase.updateOne({
        flightNumber : launchID
    },{
        success : false,
        upcoming : false,
    });
    return aborted.modifiedCount === 1;

/*     const aborted = launches.get(launchID);
    aborted.upcoming = false;
    aborted.success = false;
    return aborted; */
}

module.exports = {
    getEVERYlaunch,
    //addNewLaunch,
    loadLaunchData,
    hasLaunchID,
    abortLaunchByID,
    scheduleNewLaunch,
}