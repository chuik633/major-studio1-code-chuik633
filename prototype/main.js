d3.json("./data/data.json").then(data => {
    const paddingTop = 200
    //Parse the data
    let allDepths = allDepthValues(data) 
    let allLengths = data.map(d => d.fish_length_val)
    let allData = getAllFishAtDepthData(data, allDepths);
    let allURLS= data.map(d => d.link)
    var globalScrollPos = 0
    var globalScrollPosEnd = window.innerHeight

   
    let [xScale, yScale] = boxPlot(allData, allLengths, false)

    //save user configurations
    let cardShowing = false
    var snapToFish = false
    const checkbox = d3.select("#snap-to-fish-bool");
    checkbox.on("change", function() {
        snapToFish= d3.select(this).property("checked");
    });

    var logScale = false
    const logScaleCheckbox = d3.select("#log-scale-checkbox");
    logScaleCheckbox.on("change", function() {
        logScale = d3.select(this).property("checked");
        [xScale, yScale] = boxPlot(allData, allLengths, logScale)

    })

    //Display the Data
    let innerRange = [0,0]
    sidebar(allData, [0,10], innerRange)
    console.log("created the data things"); 
     //save the scales for mouse interactions


    function getNearestDepthBounds(y){
        const yDepth = yScale.invert(y)

        let closestDepthIdx = 0
        let closestDepthDifference = yDepth - allDepths[0]

        for(let i=0;i< allDepths.length; i++){
            const depthDifference = Math.abs(yDepth - allDepths[i])
            if(depthDifference < closestDepthDifference){
                closestDepthDifference = depthDifference
                closestDepthIdx = i
            }
        }
        if(closestDepthIdx == 0){
            return [0,
                yScale(allDepths[closestDepthIdx]),
                yScale(allDepths[closestDepthIdx+1])
            ]

        }else if(closestDepthIdx == allDepths.length-1){
            return [yScale(allDepths[closestDepthIdx-1]),
            yScale(allDepths[closestDepthIdx]),
            yScale(allDepths[closestDepthIdx])]

        }else{
            return [
                yScale(allDepths[closestDepthIdx-1]),
                yScale(allDepths[closestDepthIdx]),
                yScale(allDepths[closestDepthIdx+1])]

        }
        

    }

    function getNearestLength(x, depthPixel){
        const xLength = xScale.invert(x)
        let closestLength = xLength
        let closestFish = data[0]
        let closestDifference = 100000
        const depth = yScale.invert(depthPixel)
        
        for(const fish of data){
            // console.log(fish.min_depth, depth, fish.max_depth)
            if( fish.min_depth <= depth && depth <= fish.max_depth){
                // console.log(fish)
                const diff = Math.abs(xLength - fish.fish_length_val)
                // console.log("Difference", diff)
                if(diff < closestDifference){
                    // console.log('closer fish')
                    closestFish = fish
                    closestDifference = diff
                    closestLength = fish.fish_length_val
                }
            }
        }
        return [xScale(closestLength),closestFish]

    }


   
    addEventListener("mousemove", (event) => {
        mouseMoveHandler(event.pageX, event.pageY - paddingTop)
        
    });

  
    function mouseMoveHandler(mouseX, mouseY){
        // if(cardShowing){
        //     d3.select("#hover-dot").attr('style', `top:${mouseY - 5}px; left:calc(${mouseX}px - 5px)`).style("transform", `translate(0px, ${paddingTop}px)`);
            
        // }
        // if(mouseY < 0){
        //     return
        // }
        //the following returns the PIXEL values of the nearest depths on the plot
        const [prevPlotY, nearestPlotDepthY, nextPlotDepthY] = getNearestDepthBounds(mouseY) 
        const nearestPlotDepthVal = yScale.invert(nearestPlotDepthY)

        //get the nearest length
        closestLengthX = mouseX
        if(snapToFish){
            closestLengthX = getNearestLength(mouseX, mouseY)[0]
        }

        //this area covering ensures full coverage of the depth ranges
        const prevPadding = Math.abs(nearestPlotDepthY-prevPlotY)/2
        const nextPadding = Math.abs(nextPlotDepthY - nearestPlotDepthY)/2
        const areaHeight2 = Math.abs(nextPlotDepthY-prevPlotY)-nextPadding-prevPadding
        const areaTopY = prevPlotY + prevPadding
        d3.select("#hover-area").attr('style', `top:${areaTopY}px; height:${areaHeight2}px;`).style("transform", `translate(0px, ${paddingTop}px)`);
      
        //adjust the hover line, dot, and text
        d3.select("#hover-line").attr('style', `left:${closestLengthX}px`).style("transform", `translate(0px, ${paddingTop}px)`);
        d3.select("#hover-text")
                .attr('style', 
                    `top:${nearestPlotDepthY - 80}px; 
                    left:${closestLengthX - 50}px`).style("transform", `translate(0px, ${paddingTop}px)`);
        d3.select("#hover-text-depth").html(`↓ ${Math.round(nearestPlotDepthVal)} m`)
        d3.select("#hover-text-length").html(`${Math.round(xScale.invert(mouseX))} mm long`)

        d3.select("#hover-dot").attr('style', `top:${nearestPlotDepthY - 5}px; left:calc(${closestLengthX}px - 5px)`).style("transform", `translate(0px, ${paddingTop}px)`);

        //display the hover fish
        const midPoint = nearestPlotDepthY - areaTopY
        
        // if(closestLengthX > allData[nearestPlotDepthVal].data)
        fishSVG(0,areaTopY,closestLengthX, areaHeight2, midPoint)


        // highlightRange("100")
        // highlightRange([yScale.invert(areaTopY), yScale.invert(areaTopY + areaHeight2)],"area2-highlighted" )
        innerRange = [yScale.invert(areaTopY), yScale.invert(areaTopY + areaHeight2)]
        sidebar(allData,
            [yScale.invert(globalScrollPos),yScale.invert(globalScrollPos + window.innerHeight)], 
            innerRange)

        
        // highlightRange(innerRange, "area2-highlighted")
         
    }

  
    addEventListener('scroll', () =>{
        globalScrollPos = window.scrollY || document.documentElement.scrollTop; //save the scroll position to adjust the hover stuff
        globalScrollPosEnd = globalScrollPos + window.innerHeight
        console.log(globalScrollPos, globalScrollPosEnd)
        
        sidebar(allData,
            [yScale.invert(globalScrollPos),
            yScale.invert(globalScrollPosEnd)], 
            [0,0])

    })

    
    
    addEventListener("mousedown", (event) => {
        const mouseX = event.pageX;
        const mouseY = event.pageY - paddingTop;
        if(mouseY <0 ){
            return
        }

        if (cardShowing){
            d3.select("#tooltip").selectAll("*").remove()
            cardShowing = false
            return
        }

        const [prevDepth, nearestDepth, nextDepth] = getNearestDepthBounds(mouseY)
        const [nearestLength, closestFish] = getNearestLength(mouseX,nearestDepth)

        
        // console.log("CORESPONDING FISH", closestFish)
        if (closestFish != ""){
            fishCard(closestFish, nearestLength,nearestDepth)
            cardShowing = true
        }


    
    })

}).catch(error => {
    console.error('Error loading JSON data:', error);
});
