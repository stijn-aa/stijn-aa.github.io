'use strict'

let baseUrl = 'https://pokeapi.co/api/v2/pokemon/'


const app = document.querySelector('#root');
const container = document.createElement('div');
container.setAttribute('class', 'container');

app.appendChild(container);

function httpGetAsync(theUrl)
{
    var request = new XMLHttpRequest();
    request.open("GET", theUrl, true); // true for asynchronous

    request.onload = function (){
    var data = JSON.parse(this.response);

          const h1 = document.createElement('h1');
          const p = document.createElement('p');
          h1.textContent = data.name;
          p.textContent = data.weight;
           container.appendChild(h1);
           container.appendChild(p);
           request.send();
}}



var i;
for (i = 0; i < 20; i++) {
httpGetAsync();
httpGetAsync.theUrl = baseUrl+i;



         //console.log(this.response)

}
