
var gDiv = document.getElementById('grandparent');
var pDiv = document.getElementById('parent');
var cDiv = document.getElementById('child');

gDiv.addEventListener('click', function () {
    console.log("grandparent! ");
}, true);

pDiv.addEventListener('click', function (e) {
    console.log("parent! ");
    e.stopPropagation();
}, true);

cDiv.addEventListener('click', function (e) {
    e.stopPropagation();
    console.log("child! ");
}, true);



// var oDiv = document.getElementsByTagName('div')[0];
//
// oDiv.onclick = function(e){//这个e是浏览器传给这个function的event参数;
//     console.log(e);
//     console.log(e.target);
// }
//
// oDiv.addEventListener('mouseover', function(e){
//     console.log(e);
//     console.log(e.target);
// }, false)



// var oList = document.getElementsByTagName('li');
// var sum = 0;
// for(var i = 0; i < oList.length; i++){
//     var obj = oList[i].dataset;
//     sum += +obj.price;
// }
// console.log(sum);
//
//
// var option = {
//     maximumAge: 1000
// };
//
// function successCb(position){
//     var crd = position.coords;
//
//     console.log('Your current position is:');
//     console.log(`Latitude : ${crd.latitude}`);
//     console.log(`Longitude: ${crd.longitude}`);
// }
//
// function errCb(err) {
//     console.warn(`ERROR(${err.code}): ${err.message}`);
// }
//
// if(navigator.geolocation){
//     navigator.geolocation.getCurrentPosition(successCb, errCb, option)
// }
// var arr = ['apple', 'pear', 'berry'];
//
// var oUl = document.getElementById('box');
//
// for(var i = 0; i < arr.length; i++){
//     var oLi = document.createElement('li');
//     oLi.className = 'item';
//     oLi.id = arr[i];
//     oLi.innerHTML = arr[i];
//     oUl.append(oLi);
// }
