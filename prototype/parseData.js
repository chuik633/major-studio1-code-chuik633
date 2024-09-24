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
    if(fishesAtDepthData.length == 0){
        return false
    }
    let lengths = []
    for(const fishData of fishesAtDepthData){
        if(fishData.fish_length_val){ //only add it if it successfully parsed
            lengths.push(fishData.fish_length_val) 
        }
    }

    let min_val = Math.min(...lengths)
    let max_val = Math.max(...lengths)

    let lengths_sum = (lengths.reduce((a, b) => a + b, 0))
    let avg_val = lengths_sum/lengths.length


    return {
        avg_val: avg_val,
        min_val: min_val,
        max_val: max_val
    }
}

/**
 * Gets the arrays of all: min depths, max depths, and fish lengths
 * @param allFishData - an array of all the fish data
 * @returns min_depths, max_depths - arrays of the min + max depths across all of the data
 */
function allDepthValues(allFishData){
    let depths = []
    for(const fishData of allFishData){
        depths.push(fishData.min_depth)
        depths.push(fishData.max_depth)
    }
    depths.sort((a, b) => a - b)
    let unique_depths = [...new Set(depths)];
    return unique_depths
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

        if(depthData == false){//check that there are fish at that depth if not don't add a data point
            continue
        }else{
            //save the depth data
            allFishAtDepthData.push({
                depth: depth,
                data : depthData
            })
        }

        
    }
    allFishAtDepthData.sort((a, b) => a.depth - b.depth);
    return allFishAtDepthData
}

