var temp = [];
var options = [];

var opt = document.getElementsByClassName('opt');
var votes = document.getElementsByClassName('votes');


for(var i=0;i<opt.length;i++){
    temp = [];
    temp.push(opt[i].innerHTML);
    temp.push(parseInt(votes[i].innerHTML));
    console.log('temp',temp);
    options[i]=(temp);
}

//document.getElementById('res').innerHTML = options;
console.log(options);

       google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      // Define the chart to be drawn.
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Element');
      data.addColumn('number', 'Percentage');
      data.addRows(options);

      // Instantiate and draw the chart.
      var chart = new google.visualization.PieChart(document.getElementById('res'));
      chart.draw(data, null);
    }    /*
    [
          ['Mushrooms', 3],
          ['Onions', 1],
          ['Olives', 1],
          ['Zucchini', 1],
          ['Pepperoni', 2]
        ]*/