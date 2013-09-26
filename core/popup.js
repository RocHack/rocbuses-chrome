/*
  Import/refactoring of RocBuses by Rochack
*/

var formatInfo = {

  dayChars : "UMTWRFSU",
  dayName : {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    R: "Thursday",
    F: "Friday",
    S: "Saturday",
    U: "Sunday"
  },

  formatLineName : function(line) {
    return line[0].toUpperCase() + line.substr(1) + " Line";
  },

  insertTime : function(row, timeArr) {
    for (var timeIndex in timeArr) {
      var time = timeArr[timeIndex];
      var timeCell = document.createElement('td');
      var hour = Math.floor(time/100);
      var minute = time%100;
      hour = (hour == 0 ? "0" : hour);
      minute = (minute < 10 ? "0"+minute : minute);

      if (time > 1300) {
        timeCell.setAttribute('class', 'pm');
        timeCell.appendChild(document.createTextNode((hour - 12) +":" + minute));
      } else if (time == null) {
        timeCell.appendChild(document.createTextNode("-"));
      } else {
        timeCell.appendChild(document.createTextNode(hour + ":" + minute));
      }
      row.appendChild(timeCell);
    }

  },

  isDayInString : function(date, dayStr) {
    var dayChange = new Date(date - 3 * 3600000);
    return dayStr.indexOf(this.dayChars[dayChange.getDay()]) != -1;
  }

};

var scheduleRender = {
    
    renderStops : function(stops, tbodyDOM) {
      for (var index in stops) {
        var row = document.createElement('tr');
        var stop = stops[index];
        if (stop.place) {
          var place = document.createElement('th');
          place.style.minWidth = 194 + "px";
          place.appendChild(document.createTextNode(stop.place));
          row.appendChild(place);
        }
        formatInfo.insertTime(row, stop.times);
        tbodyDOM.appendChild(row);
      }


    },
    
    renderDirections : function(directions, routeDOM) {
      var now = new Date();
      var table = document.createElement('table');
      for (var index in directions) {
        var direction = directions[index];
        if (direction.title) {
          var header = document.createElement('thead');
          var headRow = document.createElement('tr');
          var head = document.createElement('th');
          head.setAttribute("colspan", "100%");
          head.appendChild(document.createTextNode(direction.title));
          headRow.appendChild(head);
          header.appendChild(headRow);
          table.appendChild(header);
        }

        var body = document.createElement('tbody');
        this.renderStops(direction.stops, body);
        table.appendChild(body);


      }
      routeDOM.appendChild(table);
    },

    renderRoutes : function(name, line, lineDOM) {
      var now = new Date();
      for (var index in line.routes) {
        var route = line.routes[index];
        if (formatInfo.isDayInString(now, route.days)) {

          var title = document.createElement("p");
          title.setAttribute('class', "line_title");
          title.appendChild(document.createTextNode(route.title));
          
          var routeContainer = document.createElement("div");
          routeContainer.setAttribute('class', 'route');

          this.renderDirections(route.directions, routeContainer);
          lineDOM.appendChild(title);
          lineDOM.appendChild(routeContainer);
        }
      }

      if (!lineDOM.firstChild) {
        var noLine = document.createElement("h4");
        noLine.appendChild(document.createTextNode("no routes running to day"));
        lineDOM.appendChild(noLine);
      }
    },

    renderLines : function(schedule, scheduleDOM) {
      for (var line in schedule) {
        var lineDOM = document.createElement('div');
        lineDOM.setAttribute('id', line);
        lineDOM.setAttribute('data-line', line);
        lineDOM.setAttribute('class', 'schedule');
        this.renderRoutes(line, schedule[line], lineDOM);
        scheduleDOM.appendChild(lineDOM);
      }
    },


    getSchedule : function() {
      var curObj = this;
      $.getJSON("core/schedules.json", function(json) {
        var schedules = document.createElement('div');
        schedules.setAttribute('id', 'lines');
        curObj.renderLines(json, schedules);
        document.body.appendChild(schedules);
      });
    },
};



document.addEventListener('DOMContentLoaded', function () {
  scheduleRender.getSchedule();
  
  // Thanks to Joe Brunner
  $('#selector a').on('click', function() {
    var clickedTab = $(this);
    var clickedLine = clickedTab.attr('data-line');
    console.log(clickedLine);
  

    $('#selector a').removeClass('active');
    clickedTab.addClass('active');

    $('#lines div').removeClass('active');
    $('#lines div[data-line=' + clickedLine + ']').addClass('active');
  });
});