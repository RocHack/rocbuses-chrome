/*
  Import/refactoring of RocBuses by Rochack
*/

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-44450228-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); 
  ga.type = 'text/javascript'; 
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; 
  s.parentNode.insertBefore(ga, s);
})();


function trackButton(e) {
  _gaq.push(['_trackEvent', e.target.id, 'clicked']);
}



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
    var renderColumns = 0;
    for (var timeIndex in timeArr) {
      
      var time = timeArr[timeIndex];
      if (time == null) continue;
      var timeCell = document.createElement('td');
      var hour = Math.floor(time/100);
      var minute = time%100;
      var nowHour = new Date().getHours();
      var nowMinute = new Date().getMinutes();


      // before 3AM, make sure that it's at 
      if (nowHour < 3) {
        nowHour += 24;
      }

      if (hour < 3) {
        hour += 24;
      }

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
        timeCell.appendChild((time >= 1300) ? document.createTextNode((hour%12) +":" + minute + "PM") : document.createTextNode(hour + ":" + minute + "PM"));
      } else {
        timeCell.appendChild(document.createTextNode((hour%12) + ":" + minute + "AM"));
      }
      if (renderColumns >= 6) {
        timeCell.className += ' hidden';
      } else {
        renderColumns++;
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

      // if there's an empty spot, after trying to render 6 columns. fill it up
      for (i = 0; i < tbodyDOM.childNodes.length; i++) {
        maxLength = (maxLength < tbodyDOM.childNodes[i].childNodes.length) ? tbodyDOM.childNodes[i].childNodes.length : maxLength;
        //create 5 columns
        while (tbodyDOM.childNodes[i].childNodes.length <= 6) {
          var tempColumn = document.createElement('td'); 
          tempColumn.appendChild(document.createTextNode("-"));
          tbodyDOM.childNodes[i].appendChild(tempColumn);
        }
      }

      // If there are more than 6 columns, and needs to be filled, then fill it up, and make it hidden
      for (i = 0; i < tbodyDOM.childNodes.length; i++) {
        while (tbodyDOM.childNodes[i].childNodes.length < maxLength) {
          var tempColumn = document.createElement('td');
          tempColumn.className += "hidden";
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
  $('.box').on('click', function() {

    var clickedTab = $(this);
    var clickedLine = clickedTab.attr('data-line');
    
    $('.box').removeClass('active');
    clickedTab.addClass('active');

    $('#lines div').removeClass('active');
    $('#lines div[data-line=' + clickedLine + ']').addClass('active');
    if (!$('#lines div[data-line='+clickedLine+'] h4.no_line_today').length) {
      $('#expand').css('display', 'block');
    } else {
      $('#expand').css('display', 'none');
    }
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

  // toggle showing entire future schedule or show only 5
  $("#expand").on('click', function() {
    if ($('.hidden').css('display') == 'table-cell') {
      $('.hidden').css('display', 'none');
    } else {
      $('.hidden').css('display', 'table-cell');
    }
    $(this).text($(this).text() == "<" ? ">" : "<");
  });


  var buttons = document.getElementsByClassName("box");
  for (i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', trackButton);
  }

});