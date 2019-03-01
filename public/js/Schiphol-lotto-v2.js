(function() {
  'use strict'

  const utils = {
    statusFilter: function(plane) {
      console.log(storage.statusFilterLet);
      if (storage.statusFilterLet != undefined) {

        return plane.publicFlightState.flightStates.includes(storage.statusFilterLet);

      } else {
        return true;
      }
    }
  }

  //app object?
  var application = {
    intervalSetup: null,
    init: function() {
      storage.setMap();
      router.init();

    },
    reloadTimer: function() {
      this.intervalSetup = setInterval(function() {
        router.mainpage()
      }, 10000)
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
    statusFilterLet: undefined,
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

  const storageTwo = { //this.urlcontent.endpoint and storage.urlcontent.endpoint dont work within storage so made a second storage unit. Will be fixed when moving to modules
    urlcontent: {
      endpoint: 'https://api.schiphol.nl/public-flights/flights',
      apiKey: '?&app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30',
      direction: '&flightdirection=d',
      hour: "&scheduletime=" + storage.getCurrentHours() + ":",
      minutes: storage.getCurrentMinutes()
    },
    storeFlightName: undefined,
  }


  const api = {
    url: '',
    self: this,
    request: function(flightId) {
      console.log(flightId)
      if (flightId === undefined) {
        api.url = Object.values(storageTwo.urlcontent).join("");
      } else {
        api.url = storageTwo.urlcontent.endpoint + "/" + flightId + storageTwo.urlcontent.apiKey;
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
  const render = {
    overview: function(data) {
      template.empty();
      template.containers();
      template.filterSet(data);

      console.log(data);
      const filter_array = data.flights.filter(utils.statusFilter);
      console.log(filter_array);
      for (const plane of filter_array) {
        const flightName = plane.flightName;
        const flightId = plane.id;
        const scheduleTime = plane.scheduleTime;
        const [statuslast] = plane.publicFlightState.flightStates;
        const status = storage.statusMap.get(statuslast);




        template.element(flightId, flightName, scheduleTime, status, statuslast);


      }


    },

    detail: function(data) {
      clearInterval(application.intervalSetup);
      const flightName = data.flightName;
      const flightId = data.id;
      const gate = data.gate;
      const scheduleTime = data.scheduleTime;
      const destinations = data.route.destinations;
      const [statuslast] = data.publicFlightState.flightStates.reverse();
      const status = storage.statusMap.get(statuslast);

      template.empty();
      template.containers();


      template.detailPage(flightName, flightId, gate, scheduleTime, destinations, status, statuslast);
    },

  }

  //template enigne
  const template = {
    containers: function() {
      const container = document.createElement('div')
      const app = document.querySelector(".root");
      container.setAttribute("data-container", "container");
      app.appendChild(container);
    },

    empty: function() {
      const root = document.querySelector(".root");
      root.innerHTML = '';
    },

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


      container.appendChild(section);
      section.appendChild(article);
      article.innerHTML = elementTempalte

      section.addEventListener("click", function() {
        storage.storeFlightName = flightName;
        routie("flight/" + flightId);

      })


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

    },

    error404: function(flightId) {

      const error = document.querySelector(`.id${flightId}`);
      error.setAttribute("data-fail", "nope");

      error.textContent = flightId;
    },

    filterSet: function(data) {


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
        storage.statusFilterLet = "BRD";
        console.log(storage.statusFilterLet);

        render.overview(data);
      })

      gateClosed.addEventListener("click", function() {
        storage.statusFilterLet = "GTD";
        console.log(storage.statusFilterLet);

        render.overview(data);
      })
      gateClosing.addEventListener("click", function() {
        storage.statusFilterLet = "GCL";
        console.log(storage.statusFilterLet);

        render.overview(data);
      })
      reset.addEventListener("click", function() {
        storage.statusFilterLet = undefined;
        console.log(storage.statusFilterLet);

        render.overview(data);
      })



    }

  }

  //router
  const router = {
    init: function() {

      routie({
        '': function() {
          router.mainpage();
          application.reloadTimer();


        },
        "flight/:flightId": function(flightId) {
          console.log(flightId)
          router.detailpage(flightId)



        }
      });
    },

    mainpage: function() {
      //const request = api.request("https://api.schiphol.nl/public-flights/flights?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30&flightdirection=D&scheduletime=" + h + ":" + m)


      const request = api.request()
        .then(function(data) {


          render.overview(data);
        });
    },

    detailpage: function(flightId) {
      //const request = api.request("https://api.schiphol.nl/public-flights/flights/" + flightId + "?app_id=0427139b&app_key=a549c3417098166fc5a707cc9def2a30", flightId)

      const request = api.request(flightId)
        .then(function(data) {


          render.detail(data);
        });
    }
  }

  // start application
  application.init();

})();
