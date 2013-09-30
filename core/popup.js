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
      var nowHour = new Date().getHours();
      var nowMinute = new Date().getMinutes();

      if (nowHour > hour) {
        continue;
      } else if (nowHour == hour) {
        if (nowMinute > minute) {
          continue;
        }
      }



      hour = (hour == 0 ? "0" : hour);
      minute = (minute < 10 ? "0"+minute : minute);

      if (time >= 1200) {
        timeCell.setAttribute('class', 'pm');
        timeCell.appendChild((time > 1300) ? document.createTextNode((hour-12) +":" + minute + "PM") : document.createTextNode(hour + ":" + minute + "PM"));
      } else if (time == null) {
        timeCell.appendChild(document.createTextNode("-"));
      } else {
        timeCell.appendChild(document.createTextNode(hour + ":" + minute + "AM"));
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
      var maxLength = -1;
      for (i = 0; i < tbodyDOM.childNodes.length; i++) { 
        if (tbodyDOM.childNodes[i].childNodes.length > maxLength) {
          maxLength = tbodyDOM.childNodes[i].childNodes.length;
        }
      }

      for (i = 0; i < tbodyDOM.childNodes.length; i++) {
        if (tbodyDOM.childNodes[i].childNodes.length < maxLength) {
          var tempColumn = document.createElement('td'); 
          tempColumn.appendChild(document.createTextNode("-"));
          tbodyDOM.childNodes[i].appendChild(tempColumn);
        }
      }

      return maxLength-1;

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
        var moreRuns = this.renderStops(direction.stops, body);
        if (moreRuns) {
          table.appendChild(body);
        } else {
          var notice = document.createElement('td');
          var noticeText = document.createElement('h6');
          noticeText.appendChild(document.createTextNode('No more runs on this direction!'))
          notice.appendChild(noticeText);
          table.appendChild(notice);
        }
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
        noLine.setAttribute('class', 'no_line_today')
        noLine.appendChild(document.createTextNode("No " + (name.charAt(0).toUpperCase() + name.slice(1)) + " Line runs today =("));
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
        var schedules = document.getElementById("lines");
        curObj.renderLines(json, schedules);
      });
    },
};



document.addEventListener('DOMContentLoaded', function () {
  scheduleRender.getSchedule();

  // Thanks to Joe Brunner
  $('#selector a').on('click', function() {
    var clickedTab = $(this);
    var clickedLine = clickedTab.attr('data-line');
    
    $('#selector a').removeClass('active');
    clickedTab.addClass('active');

    $('#lines div').removeClass('active');
    $('#lines div[data-line=' + clickedLine + ']').addClass('active');
  });

  $("#rocbuses").on('click', function() {
    chrome.tabs.create({url: "http://rochack.org/rocbuses"});
  });
  $("#github").on('click', function() {
    chrome.tabs.create({url: "https://github.com/RocHack/rocbuses-chrome"});
  });
  $("#rochack").on('click', function() {
    chrome.tabs.create({url: "http://rochack.org"});
  });

});