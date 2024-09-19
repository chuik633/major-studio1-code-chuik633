// put your API key here;
const apiKey = "PU7ZkKg9HqWBxYS6q43M2e1fLhe03LLcuCTRSaPf";  

// Access to terms by term category (I.e. online_media_type > Images)
const termBaseURL = "https://api.si.edu/openaccess/api/v1.0/terms/";

// search base URL
const searchBaseURL = "https://api.si.edu/openaccess/api/v1.0/search";

// array that we will write into
let myArray = [];

// string that will hold the stringified JSON data
let jsonString = '';

// search: fetches an array of terms based on term category
function fetchSearchData(searchTerm) {
    let url = searchBaseURL + "?api_key=" + apiKey + "&q=" + searchTerm;
    // console.log(url);
    window
    .fetch(url)
    .then(res => res.json())
    .then(data => {
    //   console.log("ALL DATAL", data)
      
      // constructing search queries to get all the rows of data
      // you can change the page size
      let pageSize = 1000;
      let numberOfQueries = Math.ceil(data.response.rowCount / pageSize);
    //   console.log("NUM QUERIES:", numberOfQueries)
      for(let i = 0; i < numberOfQueries; i++) {
        // making sure that our last query calls for the exact number of rows
        if (i == (numberOfQueries - 1)) {
          searchAllURL = url + `&start=${i * pageSize}&rows=${data.response.rowCount - (i * pageSize)}`;
        } else {
          searchAllURL = url + `&start=${i * pageSize}&rows=${pageSize}`;
        }
        // console.log("SEARCH ALL URL", searchAllURL)
        fetchAllData(searchAllURL);
      
      }
    })
    .catch(error => {
      console.log(error);
    })
}
let i = 1

function fetchAllData(url) {
    // console.log(jsonString)
    window
    .fetch(url)
    .then(res => res.json())
    .then(data => {
      data.response.rows.forEach(function(n) {
        addObject(n);
      });
      jsonString += JSON.stringify(myArray);  
    })
    .catch(error => {
      console.log(error)
    })
    console.log("JSON STRING 2")
  }

  // create your own array with just the data you need
function addObject(objectData) {  
    let currentPlace = "";
    if(objectData.content.indexedStructured.place) {
      currentPlace = objectData.content.indexedStructured.place[0];
    }

    let depth_val = ''
    let len_string = ''
    let physicalDescription = objectData.content.freetext.physicalDescription
    if(physicalDescription){
        //now check if it has depth
        for(const entry of physicalDescription){
            if(entry['label']=="Depth (m)"){
                depth_val = entry['content']
            }
            if(entry['label'] == 'Sl - Length'){
                len_string = entry['content']

            }
        }

    }
    if(len_string != '' && depth_val !=''){
        //parse the depth value, length value
        let [min_depth, max_depth] = depth_val.split(" - ")
        let [fish_len_val, fish_length_unit] = parseFloat(len_string.split(' ')[0]) //since lengths come in the form 3 mm

        myArray.push({
            id: objectData.id,
            title: objectData.title,
            date:objectData.content.indexedStructured.date,
            name: objectData.content.indexedStructured.name,
            place: currentPlace,
            min_depth : parseFloat(min_depth),
            max_depth: parseFloat(max_depth),
            fish_length_unit: fish_length_unit,
            fish_length_val : fish_len_val,
        })
    }
  }
  



// do the search for the fishes
const unitCode = "NMNHFISHES"
const object_type = "Taxonomic+type+specimens"
const online_media_type = "Images"
const search =  `
            Fishes 
            AND unit_code:"${unitCode}" 
            AND object_type:"${object_type}" 
            AND online_media_type:"${online_media_type}"
            `;
fetchSearchData(search);
// console.log(myArray)
// displayData(myArray)