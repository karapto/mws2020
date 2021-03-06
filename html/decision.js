function getParam(name) {
	name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(window.location.href);
		// console.log("result =");
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function back() {
    window.history.back()
}

function go() {
    url = getParam('to');
    window.location.href = url;
}


document.querySelector('#back').addEventListener('click', () => {
    back();
})

document.querySelector('#go').addEventListener('click', () => {
    go();
})