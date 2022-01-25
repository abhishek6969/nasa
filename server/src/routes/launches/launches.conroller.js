const launchesModel = require('../../models/launches.model');

const {paginate} = require("../../services/query");

async function getAllLaunches(req,res){
    const {skip,limit } = paginate(req.query);
    return res.status(200).json(await launchesModel.getEVERYlaunch(skip,limit));
}

async function addNewLaunch(req,res){
    const launch = req.body;
    if (!launch.mission || !launch.target ||
        !launch.launchDate || !launch.rocket ){
            return res.status(400).json({
                error : 'Missing required information'
            })
        }

    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)){
            return res.status(400).json({
                error : 'Please enter a valid date'
            })
    }


    await launchesModel.scheduleNewLaunch(launch);
    res.status(201).json(launch);
}
async function abortLaunch(req,res){
    const launchID = Number(req.params.id);
    const exists = await launchesModel.hasLaunchID(launchID)
    if (!exists){
        return res.status(400).json({
            error : "Invalid Flight Number",
        })
    }
    const aborted = await launchesModel.abortLaunchByID(launchID);
    if (!aborted){
        return res.status(400).json({
            error : "Launch not aborted",
        });
    }
    return res.status(200).json({
        ok : true
    });
}
module.exports = {
    getAllLaunches,
    addNewLaunch,
    abortLaunch,
}