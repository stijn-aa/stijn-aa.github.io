'use strict'

const addTime = 25;
const time = function(dt, minutes) {
  return new Date(dt.getTime() + minutes * 60000);
}
const h = time(new Date, addTime).getHours();
const m = time(new Date, addTime).getMinutes();



// 	"app_id": "0427139b",
// 	"app_key": "a549c3417098166fc5a707cc9def2a30"

const app = document.querySelector('.root'); //link niewe variabele app aan class root
const container = document.createElement('div'); //maak container variabele met div html element
container.setAttribute('data-container', 'container'); //zet custom class data-container = container aan container variabele
app.appendChild(container); //maak container html element chiled van app


const statusMap = new Map();
statusMap.set("SCH", "Flight Scheduled");
statusMap.set("DEL", "Delayed");
statusMap.set("WIL", "Wait in lounge");
statusMap.set("GTO", "Gate Open");
statusMap.set("BRD", "Boarding");
statusMap.set("GCL", "Gate Closing");
statusMap.set("GTD", "Gate Closed");
statusMap.set("DEP", "Departed");
statusMap.set("CNX", "Cancelled");
statusMap.set("GCH", "Gate Change");
statusMap.set("TOM", "Tomorrow");



function makeRequest() {
  return new Promise(function(resolve, reject) {
    const request = new XMLHttpRequest();
    const baseUrl = 'https://api.schiphol.nl/public-flights/flights?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30&flightdirection=D&scheduletime=';

    request.open('GET', baseUrl + h + ":" + m, true)
    request.setRequestHeader("resourceversion", "v3")
console.log(baseUrl + h + ":" + m);
    request.onload = function() { //onload van de url do
      const data = JSON.parse(this.response);
      console.log(data);

      if (request.status >= 200 && request.status < 400) {
        resolve(data.flights)

      }
      request.onerror = function() {
        reject("did not get data");
      }
    }
    request.send();
  });
}

function isBoarding(plane) {

  return plane.publicFlightState.flightStates.includes("GCL");
  console.log(string);
}


function createPlanes(planes) {
    var boarding_array = planes.filter(isBoarding);
  //console.log(planes);

  for (const boardingPlane of boarding_array) {


    // console.log(boarding_array);
    // console.log(h);
    // console.log(m);
    // console.log(boardingPlane.publicFlightState.flightStates);
    const [last] = boardingPlane.publicFlightState.flightStates.reverse()

    // console.log(boardingPlane.flightName);
    // console.log(boardingPlane.gate);
    // console.log(boardingPlane.scheduleTime);
    // console.log(boardingPlane.route.destinations);
    // console.log(last);
    // console.log(statusMap.get(last));

    const section = document.createElement('section');
    const h1 = document.createElement('h1');
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');
    const p3 = document.createElement('p');
    const status = document.createElement('div');

    status.setAttribute('data-status', last);

    if (boardingPlane.scheduleTime <= h + ":" + m + ":" + "00") {
      p2.setAttribute('data-p2', 'red');
    } else {
      p2.setAttribute('data-p2', 'green');
    }

    h1.textContent = "Flight: " + boardingPlane.flightName;
    p1.textContent = "Gate: " + boardingPlane.gate;
    p2.textContent = boardingPlane.scheduleTime;
    p3.textContent = "destinations: " + boardingPlane.route.destinations;
    status.textContent = statusMap.get(last);

    container.appendChild(section);
    section.appendChild(h1);
    section.appendChild(p1);
    section.appendChild(p3);
    section.appendChild(p2);
    section.appendChild(status);
  }

}

makeRequest().then(function(planes) {
  createPlanes(planes);
})
