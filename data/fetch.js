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
let linkIDS = '';
let imageData = {}

//fetch the image info
fetch('imageLinks.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log(data); // Process the JSON data here
    imageData = data
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });


// search: fetches an array of terms based on term category
async function fetchSearchData(searchTerm) {
  
    let url = searchBaseURL + "?api_key=" + apiKey + "&q=" + searchTerm;
    // console.log(url);
    try{
      const res = await fetch(url);
      const data = await res.json();
      let pageSize = 1000;
      let numberOfQueries = Math.ceil(data.response.rowCount / pageSize);

      //use a list of promises to make sure you get all of the data
      let promises = [];

      for(let i = 0; i < numberOfQueries; i++) {
        // making sure that our last query calls for the exact number of rows
        if (i == (numberOfQueries - 1)) {
          searchAllURL = url + `&start=${i * pageSize}&rows=${data.response.rowCount - (i * pageSize)}`;
        } else {
          searchAllURL = url + `&start=${i * pageSize}&rows=${pageSize}`;
        }
        // console.log("SEARCH ALL URL", searchAllURL)
        promises.push(fetchAllData(searchAllURL)); 
      } 
      await Promise.all(promises);
      console.log("Collected the Data... Now saving", myArray.length)
      
      jsonString = JSON.stringify(myArray); 
     
      download("data.json", jsonString)
      //now save it

    }
    catch(error) {
      console.log(error);
    }
}



async function fetchAllData(url) {

    try{
      const res = await fetch(url);
      const data = await res.json();
      data.response.rows.forEach(addObject);
      console.log(myArray.length)

    }
    catch(error) {
      console.log(error);
    }
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
    let link = objectData.content.descriptiveNonRepeating.record_link ??'N/A'
    let imageLink;
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
    if(imageData != {}){
      try{
        imageLink = imageData[link]
      }catch(error){
        imageLink = "no image"
      }
    }

    
    if(len_string != '' && depth_val !=''){
      // console.log("link",link)
      // console.log("link",objectData)
      // objectData.url
        //parse the depth value, length value
        try{
          let [min_depth, max_depth] = depth_val.split(" - ")
          min_depth = parseFloat(min_depth)
          max_depth = parseFloat(max_depth)
          let [fish_len_val, fish_length_unit] = [parseFloat(len_string.split(' ')[0]),len_string.split(' ')[1]]  //since lengths come in the form 3 mm
          
            myArray.push({
              id: objectData.id,
              title: objectData.title,
              date:objectData.content.indexedStructured.date,
              place: currentPlace,
              min_depth : min_depth,
              max_depth: max_depth,
              fish_length_unit: fish_length_unit,
              fish_length_val : fish_len_val,
              link: imageLink
              
          })
          console.log(imageLink)
        

        }catch(error){
          console.log("parse error")
        }
        
       
    }
  }
  

  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
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
