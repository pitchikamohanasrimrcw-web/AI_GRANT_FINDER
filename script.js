function showResult(){

    let query = document.getElementById("query").value;

    let result = document.getElementById("result");

    if(query === ""){
        result.innerHTML = "Please enter startup domain.";
    }

    else{
        result.innerHTML =
        "AI Recommendation: Suitable funding opportunities found for " 
        + query + " startup.";
    }
}