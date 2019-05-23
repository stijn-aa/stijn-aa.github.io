(function () {
  'use strict'

  const utils = {
    statusFilter: function (plane) {
      console.log(storage.statusFilterLet);
      if (storage.statusFilterLet != undefined) {
        return plane.publicFlightState.flightStates.includes(storage.statusFilterLet);
      } else {
        return true;
      }
    }
  }

  //app object
  const application = {
    intervalSetup: null,
    init: function () {
      storage.setMap();
      router.init();
    },

    reloadTimer: function () {
      this.intervalSetup = setInterval(function () {
        router.mainpage()
      }, 30000)
    }
  }

  // data object?
  const storage = {
    statusMap: new Map(),
    setMap: function () { // map 3 letters to meaningfull description
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
    time: function (newDate) {
      return new Date(newDate.getTime() + this.addTime * 60000);
    },

    getCurrentHours: function () {
      return this.time(new Date).getHours()
    },

    getCurrentMinutes: function () {
      return this.time(new Date).getMinutes()
    },
  }

  const urlHandler = { 
    urlcontent: {
      endpoint: 'https://cors-anywhere.herokuapp.com/https://api.schiphol.nl/public-flights/flights',
      date: "?scheduleDate=2019-05-24",
      hour: "&scheduleTime=11:45",
      //hour: "&scheduleTime=" + storage.getCurrentHours() + "%3A",
      //minutes: storage.getCurrentMinutes(),
      direction: '&flightDirection=D',
      end: "&page=0&sort=%2BscheduleTime"
    },
    storeFlightName: undefined,
  }

  const api = { // xmlt http request to shiphol api
    url: '',
    self: this,
    request: function (flightId) {
      console.log(flightId)
      if (flightId === undefined) {
        api.url = Object.values(urlHandler.urlcontent).join("");
      } else {
        api.url = urlHandler.urlcontent.endpoint + "/" + flightId;
      }
      return new Promise(function (resolve, reject) {
        const request = new XMLHttpRequest();
        const url = api.url
        request.open("GET", url, true);
        request.setRequestHeader("Accept", "application/json")
        request.setRequestHeader("ResourceVersion", "v4");
        request.setRequestHeader("app_id", "5d8d80e2");
        request.setRequestHeader("app_key", "38163d6c5e1e9ee4fc48aa01edd3ed3b");
        request.onload = function () {
          if (request.status >= 200 && request.status < 400) {
            const data = JSON.parse(this.response);
            resolve(data)
          } else {
            reject(request.status);
          }
        }
        request.onerror = function () {
          reject(request.status);
        }
        request.send();
      })
    }
  }

  //Render module
  const render = {
    loader: function () {
      template.loader();
    },

    removeLoader: function () {
      template.empty();
    },

    overview: function (data) {
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

    detail: function (data) {
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
    containers: function () {
      const container = document.createElement('div')
      const app = document.querySelector(".root");
      container.setAttribute("data-container", "container");
      app.appendChild(container);
    },

    loader: function(){
      const container = document.querySelector(".root");
      const article = document.createElement('article')
      let loader =
        `
        <div class='loader'>
        <h2>Loading</h2>
        <img src='./public/img/loading.svg'>
        </div>
        `
      article.innerHTML = loader
      container.appendChild(article);
    },

    empty: function () {
      const root = document.querySelector(".root");
      root.innerHTML = '';
    },

    element: function (flightId, flightName, scheduleTime, status, statuslast) {
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
      section.addEventListener("click", function () {
        storage.storeFlightName = flightName;
        routie("flight/" + flightId);
      })
    },

    detailPage: function (flightName, flightId, gate, scheduleTime, destinations, status, statuslast) {
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
      section.addEventListener("click", function () {
        routie('');
      })
    },

    error404: function (flightId) {
      const error = document.querySelector(`.id${flightId}`);
      error.setAttribute("data-fail", "nope");
      error.textContent = flightId;
    },

    filterSet: function (data) {
      const header = document.createElement('header')
      const filterdiv = document.createElement("div");
      const boarding = document.createElement('p')
      const gateClosed = document.createElement('p')
      const gateClosing = document.createElement('p')
      const reset = document.createElement('p')
      const app = document.querySelector(".root");

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

      boarding.addEventListener("click", function () {
        storage.statusFilterLet = "BRD";
        render.overview(data);
      })

      gateClosed.addEventListener("click", function () {
        storage.statusFilterLet = "GTD";
        render.overview(data);
      })

      gateClosing.addEventListener("click", function () {
        storage.statusFilterLet = "GCL";
        render.overview(data);
      })

      reset.addEventListener("click", function () {
        storage.statusFilterLet = undefined;
        render.overview(data);
      })
    }
  }

  //router
  const router = {
    init: function () {
      routie({
        '': function () {
          router.mainpage();
          application.reloadTimer();
        },
        "flight/:flightId": function (flightId) {
          router.detailpage(flightId)
        }
      });
    },

    mainpage: function () {
      const request = api.request()
      render.removeLoader();
      render.loader();
      request.then(function (data) {
        render.removeLoader();
        render.overview(data);
      });
    },

    detailpage: function (flightId) {
      const request = api.request(flightId)
      render.removeLoader();
      render.loader();
      request.then(function (data) {
        render.removeLoader();
        render.detail(data);
      });
      request.catch(function (flightId) {
        template.error404(flightId);
      });
    }
  }
  // start application
  application.init();
})();