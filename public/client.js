// client-side js
// run by the browser each time your view template is loaded

var ctx = $("#features-chart");

function getFeatures(id) {
  let query = '/features?id=' + id;

  $.get(query, function(data) {
    let labels = [];
    let values = [];
    
    for (var feature in data) {
      if (data.hasOwnProperty(feature) && feature !== 'key' && feature !== 'mode') {
        if(data[feature] <= 1 && data[feature] >= 0) {
          labels.push(feature);
          values.push(data[feature]);
        }
      }
    }
  
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(30,215,96, 0.2)',
                    'rgba(245,115,160, 0.2)',
                    'rgba(80,155,245, 0.2)',
                    'rgba(255,100,55, 0.2)',
                    'rgba(180,155,200, 0.2)',
                    'rgba(250,230,45, 0.2)',
                    'rgba(0,100,80, 0.2)',
                    'rgba(175,40,150, 0.2)',
                    'rgba(30,50,100, 0.2)'
                ],
                borderColor: [
                    'rgba(30,215,96, 1)',
                    'rgba(245,115,160, 1)',
                    'rgba(80,155,245, 1)',
                    'rgba(255,100,55, 1)',
                    'rgba(180,155,200, 1)',
                    'rgba(250,230,45, 1)',
                    'rgba(0,100,80, 1)',
                    'rgba(175,40,150, 1)',
                    'rgba(30,50,100, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
              display: false
           },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        max: 1
                    }
                }]
            }
        }
    });
  });
}

$(function() {
  let trackID = '';
  let searchQuery = '';
  let resultIDs = [];
  
  $('form').submit(function(event) {
    event.preventDefault();
    searchQuery = '/search?query=' + $('input').val();
    
    $.get(searchQuery, function(data) {
      $('#results').empty();
    
      data.tracks.items.forEach(function(track, index) {
        resultIDs.push(track.id);
        let newEl = $('<li onClick="getFeatures(&apos;' + track.id + '&apos;)"></li>').text(track.name + '   |   ' + track.artists[0].name);
        $('#results').append(newEl);
      }); 
    });
  });
});