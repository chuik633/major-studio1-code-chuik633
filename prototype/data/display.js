/**
 * Display the data Array as a table
 * @param {} dataArray 
 */
function displayTable(dataArray){
    const table = d3.select("#data-container")
        .append("table")
        .attr("border", 1)
        .attr("width", "100%");

    //make a header for the table with each of the sections
    let tableHeader = table.append("thead");
    let headerRow = tableHeader.append("tr");
        headerRow.append("th").text("Title");
        headerRow.append("th").text("Date");
        headerRow.append("th").text("Place");
        headerRow.append("th").text("Depth Min");
        headerRow.append("th").text("Depth Max");
        headerRow.append("th").text("Length");

    //make table body with the data
    let tableBody = table.append("tbody");
    let rows = tableBody.selectAll("tr")
                        .data(dataArray)
                        .enter()
                        .append("tr");
        rows.append("td").text(d => d.title);
        rows.append("td").text(d => d.date);
        rows.append("td").text(d => d.place);
        rows.append("td").text(d => d.min_depth);
        rows.append("td").text(d => d.max_depth);
        rows.append("td").text(d => d.fish_length_val);
    
}
