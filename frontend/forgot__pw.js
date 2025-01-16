//form validation
function data(){
    var a = document.getElementById("n1").value;

    if(a == ""){
        alert("All Fields are Mandatory");
        return false;
    } else {
        true;
    }
}