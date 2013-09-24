var scheduleRender = {
    
    renderLine : function(data, lineDOM) {
      console.log(data);
    },

    renderSchedule : function(schedule, scheduleDOM) {
      for (var line in schedule) {
        var lineDOM = document.createElement('div');
        lineDOM.setAttribute('id', line);
        this.renderLine(schedule[line].routes, lineDOM);
        scheduleDOM.appendChild(lineDOM);
      }
    },


    getSchedule : function() {
      var curObj = this;
      $.getJSON("schedules.json", function(json) {
        var schedules = document.createElement('div');
        schedules.setAttribute('id', 'schedule');
        curObj.renderSchedule(json, schedules);
        document.body.appendChild(schedules);
      });
    },

};

document.addEventListener('DOMContentLoaded', function () {
  scheduleRender.getSchedule();
});



