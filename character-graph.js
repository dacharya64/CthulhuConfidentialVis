mermaid.initialize({
  startOnLoad: true,
  securityLevel: 'loose',
});


var characterJSON; 
var currentCharacterName;
var graphJSON;

function reset() {
  localStorage.clear();
  loadCharacterGraph();
}

window.onload = function () {
  loadCharacterGraph();
}

function loadCharacterGraph() {
  if (localStorage.getItem("currentCharacter") === null) {
    loadCharacter("margaret_deaken");
  } else {
    loadCharacter(localStorage.getItem("currentCharacter"));
  }
  loadGraph();
}

// serve up the appropriate scene by either pulling it from local storage or fetching from the appropriate URL
var loadCharacter = function(character_name) {
  currentCharacterName = character_name.toLowerCase();
  // When pulling scene, first check to see if it is local storage. If not, pull from the .json file
  if (localStorage.getItem("characterInfo") === null) {
    var url = "https://www.devi-a.com/CthulhuConfidentialVis/data/character-info.json";
    // use AJAX to fetch the appropriate JSON data
    $.ajax({
      url: url,
      dataType: 'json',
      error: function(){
        console.log('JSON FAILED for data');
      },
      success:function(results){
        characterJSON = results; // record the results of the json query and save that to a variable
        parseCharacter(results, character_name);
      } 
    }) 
 } else {
  characterJSON = JSON.parse(localStorage.getItem("characterInfo"));
  parseCharacter(characterJSON, character_name);
}
}

// takes the character you're trying to load and renders it 
function parseCharacter(result, name) {
  //save the scene name to local storage
  localStorage.setItem("currentCharacter", name);
  /* now go through the JSON and serve up the appropriate webpage based on that */
  var characterInfo = document.getElementById("characterInfo");
  // clear the current thing in the div
  $('#characterInfo').empty();
  // print out the title scene and type
  result.forEach(function(character) {
    if (character.id == name) {
      characterInfo.insertAdjacentHTML( 'beforeend', "<h1>" + character.name + " </h1>");
      characterInfo.insertAdjacentHTML( 'beforeend', "<p>" + character.title + " </p>");
      if (character.known == "Not known") {
         characterInfo.insertAdjacentHTML( 'beforeend', "<select name='known' onchange='setKnown(this.value, name)'><option value='Not known' selected>Not known</option><option value='Known'>Known</option><option value='Met'>Met</option></select>");
      } else if (character.known == "Known") {
        characterInfo.insertAdjacentHTML( 'beforeend', "<select name='known' onchange='setKnown(this.value, name)'><option value='Not known'>Not known</option><option value='Known' selected>Known</option><option value='Met'>Met</option></select>");
      } else { // If character has been met 
        characterInfo.insertAdjacentHTML( 'beforeend', "<select name='known' onchange='setKnown(this.value, name)'><option value='Not known'>Not known</option><option value='Known'>Known</option><option value='Met' selected>Met</option></select>");
      }
      characterInfo.insertAdjacentHTML( 'beforeend', "<p>" + character.description + "</p>");
    }
  });
}

// on changing the dropdown, update the value in the graph and the JSON
function setKnown(value, name) {
  console.log(characterJSON);
  characterJSON.forEach(function(character) {
    if (character.id == name) {
      character.known = value;
    }
  });
  console.log(characterJSON);
  localStorage.setItem("characterInfo", characterJSON);

}

// When you click the checkbox for known, have this update the graph and the JSON
$(document).on("click", "input[name='known']", function () {
  console.log("clicked");
  // update the scene JSON to reflect that location has been visited
  var checked = $(this).prop('checked');
  characterJSON.known = checked; 
  // after this is done, should update the JSON file
  localStorage.setItem("currentCharacter", currentCharacterName);

  // update the graph JSON to indicate that the character is now known
  if (checked) {
    graphJSON.graph.push("class " + currentCharacterName + " known;");
    // otherwise go through and remove the indication that the scene has been completed
  } else {
    var tag = "class " + currentCharacterName + " known;";
    graphJSON.graph.forEach(function(element, index) {
      if (element == tag) { // if checked, do a check to add that element, otherwise do a check to remove that element
        graphJSON.graph.splice(index, 1);
      } 
    }); 
  }
  //save the current graph data then redisplay graph
  localStorage.setItem("graphData", JSON.stringify(graphJSON));
  loadGraph();
});

// When you click the checkbox for known, have this update the graph and the JSON
$(document).on("click", "input[name='met']", function () {
  // update the scene JSON to reflect that location has been visited
  var checked = $(this).prop('checked');
  characterJSON.known = checked; 
  // after this is done, should update the JSON file
  localStorage.setItem("currentCharacter", currentCharacterName);

  // update the graph JSON to indicate that the character is now known
  if (checked) {
    graphJSON.graph.push("class " + currentCharacterName + " met;");
    // otherwise go through and remove the indication that the scene has been completed
  } else {
    var tag = "class " + currentCharacterName + " met;";
    graphJSON.graph.forEach(function(element, index) {
      if (element == tag) { // if checked, do a check to add that element, otherwise do a check to remove that element
        graphJSON.graph.splice(index, 1);
      } 
    }); 
  }
  //save the current graph data then redisplay graph
  localStorage.setItem("graphData", JSON.stringify(graphJSON));
  loadGraph();
});


function loadGraph() {
  // When pulling scene, first check to see if it is local storage. If not, pull from the .json file
  if (localStorage.getItem("graphData") === null) {
    var url = "https://www.devi-a.com/CthulhuConfidentialVis/data/character-graph.json";
  // use AJAX to fetch the appropriate JSON data
    $.ajax({
      url: url,
      dataType: 'json',
      error: function(){
        console.log('JSON FAILED for data');
      },
      success:function(results){
        graphJSON = results; // record the results of the json query and save that to a variable
        var graphDefinition = "";
        results.graph.forEach(function(element) {
          graphDefinition = graphDefinition + element + "\n"; 
        }); 
        parseGraph(graphDefinition);
      }
  });
  } else {
    graphJSON = JSON.parse(localStorage.getItem("graphData"));
    var graphDefinition = "";
    graphJSON.graph.forEach(function(element) {
      graphDefinition = graphDefinition + element + "\n"; 
    });
    parseGraph(graphDefinition);
  }
}


function parseGraph(graphDefinition) {
  $('#graphInfo').empty();
  var element = document.querySelector("#graphInfo");

  var insertSvg = function(svgCode, bindFunctions){
    element.innerHTML = svgCode;
  };
  mermaid.mermaidAPI.render('graphInfo', graphDefinition, insertSvg);
}

// When you click the node, load the appropriate page
$(document).on("click", "g[class='nodes'] g[class='node']", function () {
  var id = $(this).attr('id');
  var text = $(this).find('foreignObject div').html();
  loadCharacter(id); 
});


// When you click the node, load the appropriate page
$(document).on("click", "g[class='nodes'] g[class='node met']", function () {
  var id = $(this).attr('id');
  var text = $(this).find('foreignObject div').html();
  loadCharacter(id); 
});

// When you click the node, load the appropriate page
$(document).on("click", "g[class='nodes'] g[class='node known']", function () {
  var id = $(this).attr('id');
  var text = $(this).find('foreignObject div').html();
  loadCharacter(id); 
});