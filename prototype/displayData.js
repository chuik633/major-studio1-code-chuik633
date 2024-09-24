
const paddingTop = 200
//helper function for initializing the SVG
const createsvg = (g, width, height) => g
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .style("border", "none");



/**
 * data is an array of the objects of the form
 * {
 *  depth: the depth value
 *  data: {
 *      avg_val,
 *      min_val,
 *      max_val
 *  }
 * }
 * @param  data 
 */
function sidebar(allData, screenRange, mouseRange){
    // console.log("ALL DAATA:", allData)
    //set the plot height and width (flipped cuz plot will be flipped)
    const width =(window.innerWidth)/10
    const height = window.innerHeight


    //1. create the x and y scales
    //y axis -depth
    const minDepth = d3.min(allData, d => d.depth)
    const maxDepth = d3.max(allData, d => d.depth)
    console.log(minDepth, maxDepth)

    
    const yScale = d3.scaleLinear() 
            .domain([minDepth, maxDepth])
            .range([0,height])
    //x axis -length
    const minLength = d3.min(allData, d => d.data.min_val)
    const maxLength = d3.max(allData, d => d.data.max_val)
    const xScale = d3.scaleLinear()
                    .domain([minLength, maxLength]) 
                    .range([0,width])

    const sidebar = d3.select("#sidebar")
    sidebar.selectAll("*").remove()
    const svg = createsvg(sidebar, width, height)

    //2.shade in the area
    const shadeArea = d3.area()
        .y(d => yScale(d.depth))
        .x0(d => xScale(d.data.min_val))
        .x1(d => xScale(d.data.max_val));

    svg.append("path")
        .datum(allData)
        .attr("class", "area")
        .attr("d", shadeArea);
    

    //3.draw the lines
    const draw_line = (g, fieldName) => {
        let linePlot = d3.line()
        // .curve(d3.curveMonotoneX)
        .y(d => yScale(d.depth)) 
        .x(d => xScale(d.data[fieldName]));
        g.append('path')
            .datum(allData)
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('d', linePlot);
    }
    draw_line(svg, "avg_val")
    draw_line(svg, "min_val")
    draw_line(svg, "max_val")

    //4. highlight the screen range
    function highlightRange(depthRange, className){
        let [topDepth, bottomDepth] = depthRange
        svg.append('clipPath')
            .attr("id", `highlight-${className}`)
            .append('rect')
                .attr("x", 0)
                .attr("y", yScale(topDepth))  
                .attr("width", 200)   
                .attr("height", yScale(bottomDepth-topDepth))  
        svg.append("path")
            .datum(allData)
            .attr("class", className)
            .attr("d", shadeArea)
            .attr("clip-path", `url(#highlight-${className})`); 


    }
    highlightRange(screenRange,  "area-highlighted")
    highlightRange(mouseRange,  "area2-highlighted")


    return highlightRange

}



/**
 * Displays an info card of the fish with the fish image
 * @param fishData - the data of the fish to display
 * @param x pixels from the left of the window
 * @param y pixels from the left of the window
 */
function fishCard(fishData, x, y){
    const card = d3.create('div').attr('class', 'card').attr('style', `top:${y}px; left:${x}px`)
            
    card.style('top', y)
    card.style('left', x)


    // const card = d3.select("#tooltip svg")
    const image = d3.create("img")
                .attr("src", `${fishData.link}`)

    // const image  = allImages[fishData.link]
    function textLabel(label_val, text_val){
        const label = d3.create('h2')
        label.text(label_val)

        const val = d3.create('h3')
        val.text(text_val)

        const container  = d3.create('div').attr('class', 'label-container')
        container.append(()=>label.node())
        container.append(()=>val.node())

        return container
    }

    //title of the fish
    const name = d3.create('h1')
    name.text(fishData.title)

    //create the text sections
    const date = textLabel("Date", fishData.date[0])
    const length = textLabel("Length", fishData.fish_length_val + " " + fishData.fish_length_unit)
    const location = textLabel("Location", fishData.place)

    //add all the info to the card
    card.append(() =>name.node())
    card.append(() =>image.node())
    card.append(() =>date.node())
    card.append(() =>length.node())
    card.append(() =>location.node())
    
    d3.select("#tooltip").selectAll("*").remove()
    d3.select("#tooltip").append(()=>card.node())
}


/**
 * Draws the lines for the fish range of lengths 
 * @param allData - data of the form
 * {
 *  depth: the depth value
 *  data: {
 *      avg_val,
 *      min_val,
 *      max_val
 *  }
 * }
 */
function boxPlot(allData, allLengths, logScale){
    // let logScale = true
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };

    //inner plot sizing
    const num_depths = allData.length
    const spacing = 500

    //plot sizing
    const width = window.innerWidth - (window.innerWidth)/10 - 50 - margin.left - margin.right;
    const height = num_depths*spacing - margin.top - margin.bottom

    //0. create the svg
    const svg_container = d3.select("#plot")
    svg_container.selectAll("*").remove()
    const svg = createsvg(svg_container, width+ margin.left + margin.right, height+ margin.top + margin.bottom)
    svg.attr("transform", `translate(${margin.left},${margin.top})`)
    // svg.attr("transform", `translate(0,${paddingTop})`)

    //1. create the x and y scales
    const minDepth = d3.min(allData, d => d.depth)
    const maxDepth = d3.max(allData, d => d.depth)
    const yScale = d3.scaleLinear() 
                    .domain([-1, maxDepth])
                    .range([0,height])

    const minLength = d3.min(allData, d => d.data.min_val)
    const maxLength = d3.max(allData, d => d.data.max_val)
    let xScale,  xScaleExtended;
    if(logScale){
         xScale = d3.scaleLog()
        .domain([minLength, maxLength]) 
        .range([0,width])

         xScaleExtended = d3.scaleLog()
            .domain([xScale.invert(0), xScale.invert(window.innerWidth)]) 
            .range([0,window.innerWidth])
    }else{
        xScale = d3.scaleLinear()
                    .domain([minLength, maxLength]) 
                    .range([0,width])

          xScaleExtended = d3.scaleLinear()
                    .domain([xScale.invert(0), xScale.invert(window.innerWidth)]) 
                    .range([0,window.innerWidth])

    }
    //checking that they are consisten
    // console.log(xScale(10), "==", xScaleExtended(10))
                    
    //2. draw the x and y axes
    const draw_xaxis = (g) => {g
                    .append("g")
                    .call(d3.axisBottom(xScaleExtended)
                            .tickValues(allLengths)
                            // .tickValues(allDepths)
                            .tickSize(40)
                        )

                    g.selectAll(".tick text")
                        .attr("font-size", "10px")

                    g.selectAll(".tick")
                        // .attr("transform", "translate(0,1px)")
                        // .attr('dy', "- 100px")
                        // .attr("dy", "-10px");
                
                };
                
    // const depthCoordValues = allData.map(d => yScale(d.depth));
    const draw_yaxis = (g) => {g
                    .append("g")
                    .attr("transform", `translate(20, 0)`)
                    .call(d3.axisLeft(yScale)
                            // .ticks(1000)
                            .tickValues(allData.map(d => d.depth))
                            .tickSize(5))
                            // .tickFormat(d3.format(".0f"))
    }
    const x_axis_container = d3.select("#x-axis")
    //clear things
    x_axis_container.selectAll("*").remove()

    const x_axis_svg = createsvg(x_axis_container,window.innerWidth, 30)
    svg.call(draw_yaxis)

    
    x_axis_svg.call(draw_xaxis)
 


    //3. create the plot lines

    allData.forEach(d => {
        const boxHeight = 1;  
        const y = yScale(d.depth);
        const minX = xScale(d.data.min_val);
        const maxX = xScale(d.data.max_val);
        const avgX = xScale(d.data.avg_val);
    

        // min max "box or line"
        svg.append("rect")
            .attr("x", minX)
            .attr("y", y - boxHeight / 2)
            .attr("width", maxX - minX)
            .attr("height", boxHeight)
            .attr("fill", "none")
            .attr("rx", "5px")
            .attr("stroke", "white")
            .attr("stroke-width", .5);

        //average val line
        svg.append("line")
            .attr("x1", avgX)
            .attr("x2", avgX)
            .attr("y1", y - 10 / 2)
            .attr("y2", y + 10 / 2)
            .attr("stroke-width", 3)
            .attr("stroke", "white");
    })

    return [xScale, yScale]

}


function fishSVG(x,y,fishWidth, fishHeight, centerY){
    if(fishHeight > 100){

        fishHeight = 100
        y += centerY - fishHeight/2
        centerY -= (centerY - fishHeight/2)
    }
    if(fishHeight*2 > fishWidth){
        // console.log("RATIO", fishWidth/fishHeight)
        fishHeight = fishWidth/2
        // fishWidth/fishHeight = 2
    }

    
    const svgContainer = d3.select("#fishSVG")
    svgContainer.selectAll("*").remove()
    svgContainer.attr('style', `position: absolute; top:${y}px; left:${x}px`);
    const svg = svgContainer.append("svg")
        .attr("viewBox", [0,0,fishWidth, fishHeight])
        // .attr("viewBox", [x-fishHeight/2, y-fishHeight/2, x+fishWidth, y+fishHeight])
        .attr("width", fishWidth)
        .attr("height", fishHeight)
        .attr("transform", `translate(0,${paddingTop})`)
        .style("border", "none");

    //helper function to turn points in a list into string
    function pointsList_to_String(pointsList){
        pointsString = ""
        for(const [x,y] of pointsList){
            pointsString += `${x},${y} `

        }
        return pointsString

    }

   

    // let background = [
    //     [0,0],
    //     [fishWidth, 0],
    //     [fishWidth,fishHeight],
    //     [0,  fishHeight],
        
    // ]
    // svg.append("polygon")
    //     .attr("points", pointsList_to_String(background))
    //     .attr("fill", "pink")

    //determine the body points
    const bodyStart = fishWidth/5
    let bumpX = (fishWidth)*2/3
    if(fishWidth - bumpX > 100){
        bumpX = fishWidth -100
    }

    const bodyPoints = [
        [bodyStart,centerY],
        [bumpX, 0],
        [fishWidth,centerY],
        [bumpX,  fishHeight]
    ]

    //body
    svg.append("polygon")
        .attr("points", pointsList_to_String(bodyPoints))
        .attr("fill", "none").attr("stroke", "white")

    //tail
    const tailPoints = [
        [0, 0],
        [bodyStart, centerY],
        [0, fishHeight],
        [fishWidth/12, centerY]
    ]
    svg.append("polygon")
        .attr("points", pointsList_to_String(tailPoints))
        .attr("fill", "none").attr("stroke", "white")

    //fin
    const finPoints = [
        [bodyStart + fishWidth/6, centerY],
        [bumpX - fishHeight/3, centerY],
        [bodyStart + (bumpX - bodyStart)/2, centerY + fishHeight/6],

    ]
    svg.append("polygon")
        .attr("points", pointsList_to_String(finPoints))
        .attr("fill", "none").attr("stroke", "white")


    //eye
    svg.append("circle")
        .attr("fill", "none").attr("stroke", "white")
        .attr("cx", bumpX)
        .attr("cy", centerY)
        .attr("r", fishHeight/6)

    svg.append("circle")
        .attr("fill", "white").attr("stroke", "white")
        .attr("cx", bumpX)
        .attr("cy", centerY)
        .attr("r", fishHeight/8)


}

// fishSVG(100,100,200,100)