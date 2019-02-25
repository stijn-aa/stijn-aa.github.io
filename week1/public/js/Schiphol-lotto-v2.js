(function() {
  'use strict'

  const addTime = 0;
  const time = function(dt, minutes) {
    return new Date(dt.getTime() + minutes * 60000);
  }
  const h = time(new Date, addTime).getHours();
  const m = time(new Date, addTime).getMinutes();

  // 	"app_id": "0427139b",
  // 	"app_key": "a549c3417098166fc5a707cc9def2a30"

  const app = document.querySelector(".root"); //link niewe variabele app aan class root
  const container = document.createElement("div"); //maak container variabele met div html element
  container.setAttribute("data-container", "container"); //zet custom class data-container = container aan container variabele
  app.appendChild(container); //maak container html element chiled van app

  const utils = {

    statusFilter: function(plane) {

      return plane //.publicFlightState.flightStates.includes("BRD");
    }


  }
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
  statusMap.set("EXP", "Landing");



  //api request

  const api = {
    request: function(url, flightId) {
      return new Promise(function(resolve, reject) {
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.setRequestHeader("resourceversion", "v3");

        request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
            const data = JSON.parse(this.response);
            resolve(data)

          } else {
            template.error404(flightId);
            reject(request.status);
          }
        }

        request.onerror = function() {
          template.error404(flightId);
          reject(request.status);
        }
        request.send();
      })
    }
  }



  //render
  const renderer = {
    overview: function(data) {
      const filter_array = data.flights.filter(utils.statusFilter);

      for (const plane of filter_array) {


        const flightName = plane.flightName;
        const flightId = plane.id;
        const scheduleTime = plane.scheduleTime;


        const mainOverview = document.querySelector("[data-container]");


        template.mainpagetemplate(mainOverview, flightId, flightName, scheduleTime);

      }

    },

    detail: function(data) {

      const flightName = data.flightName;
      const flightId = data.id;
      const gate = data.gate;
      const scheduleTime = data.scheduleTime;
      const destinations = data.route.destinations;
      const [last] = data.publicFlightState.flightStates.reverse();
      const status = statusMap.get(last);
      console.log(last);





      const detailOverview = document.querySelector("[data-container]");

      template.detailpagetemplate(detailOverview, flightName, flightId, gate, scheduleTime, destinations, status, last);
    }

  }



  //template enigne
  const template = {
    mainpagetemplate: function(container, flightId, flightName, scheduleTime) {

      console.log(flightId);
      const article = document.createElement('article')
      const section = document.createElement("section");
      let mainpagetempalte =
        `
        <h1 class="flightName">Flight: ${flightName} </h1>
        <p class="id${flightId}">${flightId}</p>
        <p class="scheduleTime">${scheduleTime}</p>

      `

      article.innerHTML = mainpagetempalte
      container.appendChild(section);
      section.appendChild(article);


      section.addEventListener("click", function() {
        console.log(flightId);
        routie("flight/" + flightId);

      })

      Transparency.render(container);
    },

    detailpagetemplate: function(detailOverview, flightName, flightId, gate, scheduleTime, destinations, status, last) {
      console.log(last);
      const article = document.createElement('article')
      const section = document.createElement("section");

      let detailpagetempalte =
        `
        <h1 class="flightName">Flight: ${flightName} </h1>
        <p class="gate">Gate: ${gate}</p>
        <p class="scheduleTime">ScaduleTime of depature: ${scheduleTime}</p>
        <p class="destinations">Destination tag: ${destinations}</p>
        <div data-status="${last}">${status}</div>
      `

      article.innerHTML = detailpagetempalte;
      container.appendChild(section);
      section.appendChild(article);


      section.addEventListener("click", function() {
        routie('');
      })

      Transparency.render(container);
    },

    error404: function(flightId) {


      const error = document.querySelector(`.id${flightId}`);
      error.setAttribute("data-fail", "nope");


      Transparency.render(error);
      error.textContent = flightId;
    }

  }




  //router
  const router = {

    mainpage: function() {
      const request = api.request("https://api.schiphol.nl/public-flights/flights?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30&flightdirection=D&scheduletime=" + h + ":" + m)
        .then(function(data) {
          console.log(data);

          container.innerHTML = '';
          renderer.overview(data);
        });
    },

    detailpage: function(flightId) {
      const request = api.request("https://api.schiphol.nl/public-flights/flights/" + flightId + "?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30", flightId)
        .then(function(data) {
          console.log(data);

          container.innerHTML = '';
          renderer.detail(data);
        });
    }
  }




  routie({
    '': function() {
      router.mainpage();

    },
    "flight/:flightId": function(flightId) {
      router.detailpage(flightId)

    }
  });
})();
