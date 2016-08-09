var cities = 'http://192.168.1.18:8983/solr/collection1/select?q=*%3A*&wt=json&group=true&group.field=city&group.main=true&rows=500' //distintas cidades
var typeRestaurants = 'http://192.168.1.18:8983/solr/collection1/select?q=*%3A*&wt=json&group=true&group.field=typeRest&group.main=true&rows=500' //distintos tipos de restaurante
var solrAPI = "http://192.168.1.18:8983/solr/collection1/select?q=";

var filterTypeRest = new Array();
var city = 'All';

function GetURLParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam){
            return sParameterName[1];
        }
    }
}

function parseItems(allDishes){
  allDishes = allDishes.substring(1, allDishes.length -1);
  var dishesTemp;
  dishesTemp=allDishes.split(",");
  var dishes = new Array();
  for (var i = 0; i < dishesTemp.length; i++)
    dishes[i] = dishesTemp[i].trim();
  return dishes;
}

function parseRestaurants(restaurants){
  var rests = new Array();
  for (var i = 0; i<restaurants.length; i++){
    if (restaurants[i].name != null ){
     var r = {
       name: restaurants[i].name,
       typeRes: restaurants[i].typeRest,
       address: restaurants[i].address,
       city: restaurants[i].city,
       imgUrl: restaurants[i].imgUrl,
       url: restaurants[i].url,
       dishes: parseItems(restaurants[i].dishes),
       prizes: parseItems(restaurants[i].prizes)
     }
     if (rests.indexOf(r.name)<0){
       rests.push(r);
     }
   }
  }
  return rests;
}


function printRow(i){
  $('<div>', {class: 'row', id: i}).appendTo("#inner");
}

function printRestaurant(restaurant, row, i){
  $('<div>', {class: 'col-md-4'}).append(
    $('<div>', {class: 'restaurant'}).append(
      $('<div>', {class: 'card'}).append(
        $('<div>', {class: 'card-block'}).append(
          $('<h4 class="card-title" id="name">'+restaurant.name+'</h4>'),
          $('<h6 class="card-subtitle text-muted" id="Tipo">'+restaurant.typeRes+'</h6>')
        )
      ).append(
        $('<img src='+restaurant.imgUrl+' alt="Card image">'),
        $('<div>', {class: 'card-block'}).append(
          $('<p  id="address" target">'+restaurant.address+' '+restaurant.city+'</p>'),
          $('<a href="'+restaurant.url+'" class="btn btn-default card-link" target="_blank" role="button">Visitar en Just Eat</a>'),
          $('<button type="button" class="btn btn-info" id="myBtn'+i+'">Ver Menú</button>')
        )
      ),

      $('<div class="modal fade" id="myModal'+i+'" role="dialog">').append(
        $('<div>', { class:'modal-dialog' }).append(
          $('<div>', { class: 'modal-content'}). append(
            $('<div>', {class: 'modal-header'}).append(
              $('<button type="button" class="close" data-dismiss="modal">&times;</button>'),
              $('<h4 class="modal-title">Menú de '+restaurant.name+'</h4>')
            ),

            $('<div>', {class: 'modal-body', id: 'modal-body'+i}).append(
              $('<table class="table"><thead><th>Plato</th><th>Precio</th></thead>').append(
                $('<tbody id="dishes'+i+'"></tbody>')
              )
            ),

            $('<div>', {class: 'modal-footer'}).append(
              $('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')
            )
          )
        )
      )
    )
  ).appendTo("#"+row);

  $('<script> $(document).ready(function(){ $("#myBtn'+i+'").click(function(){ $("#myModal'+i+'").modal(); }); }); </script>').appendTo('body');

  for (var j = 0; j<restaurant.dishes.length; j++){
      $('<tr><td>'+restaurant.dishes[j]+'</td><td>'+restaurant.prizes[j]+'</td>').appendTo('#dishes'+i);
  }
}

function printRestaurants(restaurants){
  var length = restaurants.length;
  var row = 0;
  for (var i = 0; i<length; i++){

    if (i%3==0){
      row++;
      printRow(row);
    }

    printRestaurant(restaurants[i], row, i);
  }

}

function parseElements(elementVector){
  var cities=new Array();
  for (var i=0; i<elementVector.length; i++){
      if (elementVector[i].city != null){
        cities.push(elementVector[i].city);
      }
  }


  return cities;
}

function parseTypeElements(elementVector){
  var types=new Array();
  for (var i=0; i<elementVector.length; i++){
    if (elementVector[i].typeRest != null){
      types.push(elementVector[i].typeRest);
    }
  }

  return types;
}

function filterCity(cb){
    var dish = GetURLParameter('inputDish');

    if (cb.value.indexOf("Coruña")>-1){
      city="Coruña";
    } else {
      if (cb.value.indexOf("Todas")>-1){
        city='';
      }
      city=cb.value;
    }
    connectSolr(dish);
}

function filterType(cb){
  var dish = GetURLParameter('inputDish');

  if (cb.checked){
    if (filterTypeRest.indexOf(cb.value)<0){
      filterTypeRest.push(cb.value);
    }
  } else {
    var index=filterTypeRest.indexOf(cb.value);
    if (index > -1){
      filterTypeRest.splice(index, 1);
    }
  }
  connectSolr(dish)
}

function printMenus(){
  //Getting the diferent cities of the restaurants in Solr

  $.getJSON(cities, function(json){ //Connecting to Solr and getting data

  }).done(function(json){
    $('#loadingDivC').hide();
    var cities = parseElements(json.response.docs); //We transform items for usability
    $('<label class="checkbox"><input class="box" type="radio" name="city" value="All" onclick="filterCity(this);" checked="checked">Todas</label>').appendTo('#cityCheckboxes');
    for (var i=0; i<cities.length; i++){
      $('<label class="checkbox"><input class="box" type="radio" name="city" value="'+cities[i]+'" onclick="filterCity(this);">'+cities[i]+'</label>').appendTo('#cityCheckboxes');
    }
  });

  //Getting the diferent types of the restaurants in Solr
  $.getJSON(typeRestaurants, function(json){

  }).done(function(json){
    $('#loadingDivT').hide();
    var types = parseTypeElements(json.response.docs);

    for (var i=0; i<types.length; i++){
      $('<label class="checkbox-inline"><input type="checkbox" onclick="filterType(this);" value="'+types[i]+'">'+types[i]+'</label>').appendTo('#typeCheckboxes');
    }
  });
}

function connectSolr(dish){ //Connecting the Solr endpoints
  var connect =solrAPI+dish+"&wt=json&indent=true&rows=50"

  if (city != null){ //City Filter
    if (city.length > 0){
      if (city != "All"){
        connect = connect+"&fq=city%3A*"+city;
      }
    }
  } else {
  }

  if (filterTypeRest.length>0){ //Type Restaurant Filter
    for (var i=0; i<filterTypeRest.length; i++){
      var filterRest;
      var res = filterTypeRest[i].split(" ");
      for (var j=0; j<res.length; j++){
        if (j==0){
          filterRest=res[j];
        } else {
          filterRest=filterRest+"+"+res[j];
        }
      }

      if (i==0){
        connect = connect+"&fq=typeRest%3A%22"+filterRest+"%22";
      } else {
        connect = connect+"+OR+typeRest%3A%22"+filterRest+"%22";
      }
    }
  }

  $('#inner').empty();  //Clear previous results

  $.getJSON( connect, function(json){  //Getting new data
      //console.log(json);
  })
    .done(function(json){
      $('#loadingDiv').hide();

      //Parsing restaurants to show the result in the page
      console.log(json.response.docs)
      var restaurants = parseRestaurants(json.response.docs);
      if (restaurants.length > 0){
        printRestaurants(restaurants);
      }else{
        $('<div class="alert alert-warning" role="alert"><center><strong>¡Lo sentimos!</strong> No disponemos de restaurantes que cumplan el criterio de búsqueda :( </center></div>').appendTo('#inner');
      }
    })
    .fail(function (){
       $('#loadingDiv').hide();
       $('<div class="alert alert-warning" role="alert"><center><strong>¡Lo sentimos!</strong> Se ha perdido la conexión con Solr </center></div>').appendTo('#inner');
    });
}

$(document).ready(function(){
  var dish = GetURLParameter('inputDish');
  var checkCities = new Array();

  $('#inputDish').attr("value", dish);  //write in the textbox-search the dish you are looking for


  if (city != null){
    //console.log("city distinto de null");
    if (city.length > 0){
      //console.log("city seleccionada");
      $('#cityCheckboxes :input[value='+city+']').prop('checked', true);
    }
  }
  connectSolr(dish);
  printMenus();

});
