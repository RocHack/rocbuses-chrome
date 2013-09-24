/*
  Import/refactoring of RocBuses by Rochack
*/

var formatInfo = {

  dayName : {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    R: "Thursday",
    F: "Friday",
    S: "Saturday",
    U: "Sunday"
  },

  formatLineName : function(line, days) {
    return line[0].toUpperCase() + line.substr(1) + " Line";
  }


};

var scheduleRender = {
    
    renderRoutes : function(name, line, lineDOM) {
      for (var route in line.routes) {
        var lineName = formatInfo.formatLineName(name, route.days);
        var h3 = document.createElement("h3");
        h3.setAttribute('class', "line_name");
        h3.appendChild(document.createTextNode(lineName));
        lineDOM.appendChild(h3);
        var routeTable = document.createElement('table');
      }
    },

    renderLines : function(schedule, scheduleDOM) {
      for (var line in schedule) {
        var lineDOM = document.createElement('div');
        lineDOM.setAttribute('id', line);
        lineDOM.setAttribute('class', 'schedule');
        this.renderRoutes(line, schedule[line], lineDOM);
        scheduleDOM.appendChild(lineDOM);
      }
    },


    getSchedule : function() {
      var curObj = this;
      $.getJSON("core/schedules.json", function(json) {
        var schedules = document.createElement('div');
        curObj.renderLines(json, schedules);
        document.body.appendChild(schedules);
      });
    },
};



document.addEventListener('DOMContentLoaded', function () {
  scheduleRender.getSchedule();
});