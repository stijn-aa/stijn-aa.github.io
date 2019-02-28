(function() {
  'use strict'



  // 	"app_id": "0427139b",
  // 	"app_key": "a549c3417098166fc5a707cc9def2a30"





  const utils = {
    statusFilterLet: undefined,
    self: this,
    statusFilter: function(plane) {

      if (self.statusFilterLet != undefined) {

        return plane.publicFlightState.flightStates.includes(self.statusFilterLet);

      } else {
        return true;
      }
    }


  }

  //app object?
  var app = {
    init: function() {
      storage.setMap();
      router.init();

    }
  }

  // data object?
  var storage = {
    statusMap: new Map(),
    setMap: function() {
      storage.statusMap.set("SCH", "Flight Scheduled");
      storage.statusMap.set("DEL", "Delayed");
      storage.statusMap.set("WIL", "Wait in lounge");
      storage.statusMap.set("GTO", "Gate Open");
      storage.statusMap.set("BRD", "Boarding");
      storage.statusMap.set("GCL", "Gate Closing");
      storage.statusMap.set("GTD", "Gate Closed");
      storage.statusMap.set("DEP", "Departed");
      storage.statusMap.set("CNX", "Cancelled");
      storage.statusMap.set("GCH", "Gate Change");
      storage.statusMap.set("TOM", "Tomorrow");
      storage.statusMap.set("EXP", "Landing");
    },
    addTime: "0",
    time: function(newDate) {
      return new Date(newDate.getTime() + this.addTime * 60000);

    },
    getCurrentHours: function() {
      return this.time(new Date).getHours()
    },
    getCurrentMinutes: function() {
      return this.time(new Date).getMinutes()
    },
  }

  //api request "https://api.schiphol.nl/public-flights/flights/" + flightId + "?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30")
  const api = {
    url: '',

    urlcontent: {
      endpoint: 'https://api.schiphol.nl/public-flights/flights',
      apiKey: '?&app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30',
      direction: '&flightdirection=d',
      hour: "&scheduletime=" + storage.getCurrentHours() + ":",
      minutes: storage.getCurrentMinutes(),

    },
    self: this,
    // url fixen
    request: function(flightId) {

      if (flightId === undefined) {
        api.url = Object.values(this.urlcontent).join("");
      } else {
        api.url = self.urlcontent.endpoint + "/" + flightId + self.urlcontent.apikey;
      }


      return new Promise(function(resolve, reject) {
        const request = new XMLHttpRequest();
        request.open("GET", api.url, true);
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

    },


  }



  //render
  const renderer = {
    overview: function(data) {

      template.filter(data);
      const filter_array = data.flights.filter(utils.statusFilter);

      for (const plane of filter_array) {

        const flightName = plane.flightName;
        const flightId = plane.id;
        const scheduleTime = plane.scheduleTime;
        const [statuslast] = plane.publicFlightState.flightStates.reverse();

        const status = storage.statusMap.get(statuslast);




        template.element(flightId, flightName, scheduleTime, status, statuslast);


      }


    },

    detail: function(data) {

      const flightName = data.flightName;
      const flightId = data.id;
      const gate = data.gate;
      const scheduleTime = data.scheduleTime;
      const destinations = data.route.destinations;
      const [statuslast] = data.publicFlightState.flightStates.reverse();
      const status = statusMap.get(statuslast);



      template.detailPage(flightName, flightId, gate, scheduleTime, destinations, status, statuslast);
    },

  }

  //template enigne
  const template = {
    element: function(flightId, flightName, scheduleTime, status, statuslast) {


      const article = document.createElement('article')
      const section = document.createElement("section");
      const container = document.querySelector("[data-container]");
      let elementTempalte =
        `
        <h1 class="flightName">Flight: ${flightName} </h1>
        <p class="id${flightId}">${flightId}</p>
        <p class="scheduleTime">${scheduleTime}</p>
        <div data-status="${statuslast}">${status}</div>

      `

      article.innerHTML = elementTempalte
      container.appendChild(section);
      section.appendChild(article);


      section.addEventListener("click", function() {

        routie("flight/" + flightId);

      })

      Transparency.render(container);
    },


    detailPage: function(flightName, flightId, gate, scheduleTime, destinations, status, statuslast) {

      const article = document.createElement('article')
      const section = document.createElement("section");
      const container = document.querySelector("[data-container]");

      let detailpagetempalte =
        `
        <h1 class="flightName">Flight: ${flightName} </h1>
        <p class="gate">Gate: ${gate}</p>
        <p class="scheduleTime">ScaduleTime of depature: ${scheduleTime}</p>
        <p class="destinations">Destination tag: ${destinations}</p>
        <div data-status="${statuslast}">${status}</div>
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
    },

    filter: function(data) {
      console.log(utils.statusFilterLet);

      const header = document.createElement('header')
      const filterdiv = document.createElement("div");
      const boarding = document.createElement('p')
      const gateClosed = document.createElement('p')
      const gateClosing = document.createElement('p')
      const reset = document.createElement('p')
      const app = document.querySelector(".root");
      const container = document.querySelector("[data-container]");

      app.appendChild(filterdiv);
      filterdiv.appendChild(header);
      header.appendChild(boarding);
      header.appendChild(gateClosed);
      header.appendChild(gateClosing);
      header.appendChild(reset);

      boarding.setAttribute('data-button', 'filter');
      gateClosed.setAttribute('data-button', 'filter');
      gateClosing.setAttribute('data-button', 'filter');
      reset.setAttribute('data-button', 'filter');

      boarding.textContent = "Boarding";
      gateClosed.textContent = "Gate Closed";
      gateClosing.textContent = 'Gate Closing';
      reset.textContent = "all";


      boarding.addEventListener("click", function() {
        utils.statusFilterLet = "BRD";
        console.log(utils.statusFilterLet);
        app.innerHTML = '';
        filterdiv.innerHTML = '';
        renderer.overview(data);
      })

      gateClosed.addEventListener("click", function() {
        utils.statusFilterLet = "GTD";
        console.log(utils.statusFilterLet);
        app.innerHTML = '';
        filterdiv.innerHTML = '';
        renderer.overview(data);
      })
      gateClosing.addEventListener("click", function() {
        utils.statusFilterLet = "GCL";
        console.log(utils.statusFilterLet);
        app.innerHTML = '';
        filterdiv.innerHTML = '';
        renderer.overview(data);
      })
      reset.addEventListener("click", function() {
        utils.statusFilterLet = undefined;
        console.log(utils.statusFilterLet);
        app.innerHTML = '';
        filterdiv.innerHTML = '';
        renderer.overview(data);
      })



    }

  }

  //router
  const router = {
    init: function() {
      routie({
        '': function() {
          router.mainpage();

        },
        "flight/:flightId": function(flightId) {
          router.detailpage(flightId)

        }
      });
    },

    mainpage: function() {
      //const request = api.request("https://api.schiphol.nl/public-flights/flights?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30&flightdirection=D&scheduletime=" + h + ":" + m)
      const request = api.request()
        .then(function(data) {
          console.log(data);

          renderer.overview(data);
        });
    },

    detailpage: function(flightId) {
      //const request = api.request("https://api.schiphol.nl/public-flights/flights/" + flightId + "?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30", flightId)
      const request = api.request(flightId)
        .then(function(data) {
          console.log(data);


          renderer.detail(data);
        });
    }
  }

  // start application
  app.init();
})();
