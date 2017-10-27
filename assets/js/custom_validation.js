// validation rules array
var rulesArr = [
	{source:1,target:2,errMsg:"Dish Antenna can\'t connect to Battery"},
	{source:4,target:5,errMsg:"Diamond can\'t connect to 3d Box"},
	{source:6,target:5,errMsg:"cloud can\'t connect to 3d Box"},
];

// function to validate source & target to be connect
function validateEdge(source, target){
	//debugger;
	for(var i=0;i<rulesArr.length;i++){
		if((rulesArr[i].source == source && rulesArr[i].target == target) || (rulesArr[i].target == source && rulesArr[i].source == target)){
			return rulesArr[i].errMsg;
		}
	}
	return "";
}

// toaster to show message
function showToaster(err, message){
	toastr.clear();
	toastr.options.timeOut = 4000;
	toastr.options.closeButton = true;

	if(err == 1)
		toastr.success(message);
	else if(err == 2)
		toastr.warning(message);
	else if(err == 3)
		toastr.error(message);
};