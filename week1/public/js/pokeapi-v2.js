'use strict'

var request = new XMLHttpRequest();
var request2 = new XMLHttpRequest();
console.log(request2)

let baseUrl = 'https://pokeapi.co/api/v2/pokemon/'


request.open('GET', (baseUrl+1), true);


const app = document.querySelector('.root');
const container = document.createElement('div');
container.setAttribute('class', 'container');
app.appendChild(container);


request.onload = function (){
//onload do
        console.log(this.response)
 var data = JSON.parse(this.response);
   if (request.status >= 200 && request.status < 400) {
       const h1 = document.createElement('h1');
       const p = document.createElement('p');
       h1.textContent = data.name;
       p.textContent = data.weight;
        container.appendChild(h1);
        container.appendChild(p);

}else {
     console.log('error');
   };

}
request.send();
