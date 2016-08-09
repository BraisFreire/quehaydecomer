function validateForm(){

  var inputSearch = document.forms["searchForm"]["inputDish"].value;

  if (!inputSearch.trim()){
    console.log("vacío");
    return false;
  } else {
    console.log("Envío de datos para buscar "+inputSearch);
    return true;
  }

}
