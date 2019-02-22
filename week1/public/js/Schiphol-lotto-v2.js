(function() {
    'use strict'

    const addTime = 25;
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



    //api request

    const api = {
      request: function(url) {
        return new Promise(function(resolve, reject) {
          const request = new XMLHttpRequest();
          request.open("GET", url, true);
          request.setRequestHeader("resourceversion", "v3")
          request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
              const data = JSON.parse(this.response);
              resolve(data)

            } else {
              reject(request.status);
            }
          }

          request.onerror = function() {
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

            const [last] = plane.publicFlightState.flightStates.reverse();
            const flightId = plane.id;

            const flightName = plane.flightName;
            const flight = plane.id;


            const mainOverview = document.querySelector('div')

            let flight = function(flight) {
                return plane.id;
              }

            }
          }

          template.mainpagetempalte(mainOverview, flight);



          // const section = document.createElement("section");
          // const h1 = document.createElement("h1");
          // const p1 = document.createElement("p");
          // const p2 = document.createElement("p");
          // const p3 = document.createElement("p");
          // const status = document.createElement("div");
          //
          //
          // status.setAttribute("data-status", last);
          // section.setAttribute("ID", flightId);
          //
          //
          // if (plane.scheduleTime <= h + ":" + m + ":" + "00") {
          //   p2.setAttribute("data-p2", "red");
          // } else {
          //   p2.setAttribute("data-p2", "green");
          // }
          //
          // h1.textContent = "Flight: " + plane.flightName;
          // p1.textContent = "Gate: " + plane.gate;
          // p2.textContent = plane.scheduleTime;
          // p3.textContent = "destinations: " + plane.route.destinations;
          // status.textContent = statusMap.get(last);
          //
          // container.appendChild(section);
          // section.appendChild(h1);
          // section.appendChild(p1);
          // section.appendChild(p3);
          // section.appendChild(p2);
          // section.appendChild(status);

          // section.addEventListener("click", function() {
          //   console.log(flightId);
          //   routie("flight/" + flightId);
          // })
        }
      },
      detail: function(data) {
        console.log(data);
        // const flightName = plane.flightName;
        // const flightId = plane.id;
        // const article = document.createElement('article')
        // let detialpagina = `
        //   <h3 class="flightId">flightid: </h3>
        //   <h2 class="flightName"></h2>
        // `
        //
        // container.appendChild(article)
        //
        // article.innerHTML = detialpagina
        //
        // Transparency.render(container, data, dataDir)


      },
  }


  const template = {
    mainpagetempalte: function(container, dataDirectives) {
      console.log(flight);
      const article = document.createElement('article')
      let mainpagetempalte =
        `
        <h3 class="flight">flight </h3>
        <h2 class="flightName"></h2>
      `

      container.appendChild(article)

      article.innerHTML = mainpagetempalte

      Transparency.render(container);
    },
    detailpagetempalate: function() {
      console.log(data);
    }

  }






  //router
  const router = {

    mainpage: function() {
      const request = api.request("https://api.schiphol.nl/public-flights/flights?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30&flightdirection=D&scheduletime=" + h + ":" + m)
        .then(function(data) {
          console.log(data);


          renderer.overview(data);
        });
    },

    detailpage: function(flightId) {
      const request = api.request("https://api.schiphol.nl/public-flights/flights/" + flightId + "?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30")
        .then(function(data) {
          console.log(data);


          renderer.detail(data);
        });
    }
  }

  //template enigne


  routie({
    '': function() {
      router.mainpage();

    },
    "flight/:flightId": function(flightId) {
      router.detailpage(flightId)

    }
  });
})();
