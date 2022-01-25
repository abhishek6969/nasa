const defaultPageNumber = 1;
const defaultPageLimit = 0;//mongo returns all if 0 is passed i.e no limi

function paginate(query){
    const limit = Math.abs(query.limit) || defaultPageLimit;
    const page = Math.abs(query.page) || defaultPageNumber;
    skip = (page-1)*limit
    return {
    skip,limit
    }

}
module.exports = {
    paginate
}