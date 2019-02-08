'use strict'

const request = new XMLHttpRequest();
const baseUrl = 'https://api.schiphol.nl/public-flights/flights?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30&flightdirection=D&scheduletime='
const d = new Date();
const h = d.getHours();
const m = d.getMinutes();


// 	"app_id": "0427139b",
// 	"app_key": "a549c3417098166fc5a707cc9def2a30"

const app = document.querySelector('.root'); //link niewe variabele app aan class root
const container = document.createElement('div'); //maak container variabele met div html element
container.setAttribute('data-container', 'container'); //zet custom class data-container = container aan container variabele
app.appendChild(container); //maak container html element chiled van app


request.open('GET', baseUrl + h + ":" + (m - 3), true) //get request van url met variabele van uur en Minutes
request.setRequestHeader("resourceversion", "v3") //set version in header van request


request.onload = function() { //onload van de url do
  const data = JSON.parse(this.response);
  console.log(data);

  if (request.status >= 200 && request.status < 400) {
    data.flights.forEach(planes => {

      console.log(planes.flightName);
      console.log(planes.gate);
      console.log(planes.scheduleTime);
      console.log(planes.route.destinations);


const section = document.createElement('section');
      const h1 = document.createElement('h1');
      const p1 = document.createElement('p');
      const p2 = document.createElement('p');
      const p3 = document.createElement('p');

      if (planes.scheduleTime <= h + ":" + m + ":" + "00") {
        p2.setAttribute('data-p2', 'red');
      } else {
        p2.setAttribute('data-p2', 'green');
      }

      h1.textContent = "Flight: " + planes.flightName;
      p1.textContent = "Gate: " + planes.gate;
      p2.textContent = planes.scheduleTime;
      p3.textContent = "destinations: " + planes.route.destinations;

      container.appendChild(section);
      section.appendChild(h1);
      section.appendChild(p1);
      section.appendChild(p3);
      section.appendChild(p2);

    })
  } else {
    console.log("did not reach")
  }

}

request.send();
