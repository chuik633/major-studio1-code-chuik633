/**
 * Get all the fish at a certain depth
 * @param allFishData 
 * @param depth 
 * @returns a list of all fish within the given depth value
 */
function getFishesAtDepthData(allFishData, depth){
    let fishesAtDepthData = []
    for(const fishData of allFishData){
        if(fishData.min_depth <= depth && fishData.max_depth >=depth){
            fishesAtDepthData.push(fishData)
        }
    }
    return fishesAtDepthData
}


/**
 * Compute the box info given a specific depth's data
 * @param fishesAtDepthData - an array of fish data points where each fish is like the data object listed above
 * @returns an object for the box info of all fishes in fishesAtDepthData
 */
function computeBoxInfo(fishesAtDepthData){
    let lengths = []
    for(const fishData of fishesAtDepthData){
        if(fishData.fish_length_val){
            lengths.push(fishData.fish_length_val) //only add it if it successfully parsed
        }
    }

    let min_val = Math.min(...lengths)
    let max_val = Math.max(...lengths)
    let avg_val = (lengths.reduce((a, b) => a + b, 0))/lengths.length

    return ({
        avg_val: avg_val,
        min_val: min_val,
        max_val: max_val
    })
}

/**
 * Gets the arrays of all: min depths, max depths, and fish lengths
 * @param allFishData - an array of all the fish data
 * @returns min_depths, max_depths - arrays of the min + max depths across all of the data
 */
function allDepthValues(allFishData){
    let min_depths = []
    let max_depths = []
    for(const fishData of allFishData){
        min_depths.push(fishData.min_depth)
        max_depths.push(fishData.max_depth)
    }

    return min_depths, max_depths
}

/**
 * Creates an array of objects with info: 
 * {
 *  depth: the depth value
 *  data: {
 *      avg_val,
 *      min_val,
 *      max_val
 *  }
 * }
 * @param  allFishData - an array of all the fish data
 * @param  depthsList - a list of all depths to focus on
 */
function getAllFishAtDepthData(allFishData, depthsList){
    let allFishAtDepthData = []
    for(const depth of depthsList){
        let fishesAtDepthData = getFishesAtDepthData(allFishData, depth)
        let depthData = computeBoxInfo(fishesAtDepthData)

        //save the depth data
        allFishAtDepthData.push({
            depth: depth,
            data : depthData
        })
    }
    return allFishAtDepthData
}

///////////////// -------- TESTS -------- ///////////////////////////////
let test_fishesAtDepthData = [
    {
        "id":"ld1-1643412988961-1643413007514-1",
        "title":"Lepadichthys conwayi Fujiwara & Motomura",
        "date":["2010s"],
        "name":["Williams, J. T.","Delrieu-Trottin, E.","Sasal, P."],
        "place":"Pacific",
        "min_depth":3,
        "max_depth":5,
        "fish_length_unit":"mm",
        "fish_length_val":29.5
    },
    {
        "id":"ld1-1643412988961-1643412990940-0",
        "title":"Lepadichthys conwayi Fujiwara & Motomura",
        "date":["2010s"],
        "name":["Williams, J. T.","Planes, S.","Delrieu-Trottin, E.","Sasal, P."],
        "place":"Tuamotu-Gambier",
        "min_depth":10,
        "max_depth":25,
        "fish_length_unit":"mm",
        "fish_length_val":36.1
    }
]
console.log("DISPLAY TESTS")
console.log(computeBoxInfo(test_fishesAtDepthData))
console.log(getFishesAtDepthData(test_fishesAtDepthData, 4))

