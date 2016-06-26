var plotThefts = function(graphicalData){
  var margin  = {
      top       : 20,
      right     : 20,
      bottom    : 30,
      left      : 40
    },
    width     = 480 - margin.left - margin.right,
    height    = $('div.jsonTable').height() - margin.top - margin.bottom,
    x         = d3.scale.ordinal().rangeRoundBands([0, width], .1),
    y         = d3.scale.linear().rangeRound([height, 0]),
    color     = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6"]),
    xAxis     = d3.svg.axis().scale(x).orient("bottom"),
    yAxis     = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));
    d3.select(".stacked-bar-chart").selectAll("*").remove();
    svg       =   d3.select(".stacked-bar-chart")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate("+margin.left+","+margin.top+")");
    plotPoints =$.extend(true,[],graphicalData);

    console.log(JSON.stringify(plotPoints));

  // d3.json("../json/theft.json", function(err,plotPoints){
  //   if(err) throw err;

    color.domain(d3.keys(plotPoints[0]).filter(function(key){return key !== 'YEAR';}));

    plotPoints.forEach(function(d){
      var y0 = 0;
      d.thefts = color.domain().map(function (name){
        return {
                name: name,
                y0: y0,
                y1: y0 += +d[name]
              };
      });
      d.total = d.thefts[d.thefts.length - 1].y1;
    });

    x.domain(plotPoints.map(function(d){ return d["YEAR"]; }));
    y.domain([0, d3.max(plotPoints, function(d) {return d.total; })]);

    svg.append("g")
        .attr("class","x axis")
        .attr("transform","translate(0," + height +")")
        .call(xAxis);

    svg.append("g")
        .attr("class","y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y",6)
        .attr("dy",".35em")
        .style("text-anchor", "end")
        .text("Theft");

    svg.selectAll(".year")
                      .data(plotPoints)
                      .exit();

    var year = svg.selectAll(".year")
                  .data(plotPoints)
                  .enter().append("g")
                  .attr("class", "g")
                  .attr("transform", function(d){ return "translate("+ x(d['YEAR']) +" ,0 )"; });

    var bars = year.selectAll("rect")
        .data(function(d) {return d.thefts;});

        bars.exit();

        bars.enter()
        .append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d){ return y(d.y1); })
        .attr("height",  function(d){ return  y(d.y0)- y(d.y1); })
        .style("fill", function(d) {return color(d.name); });

    var legend = svg.selectAll(".legend")
                    .data(color.domain().slice().reverse())
                    .enter().append('g')
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
          .attr("x",width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

    legend.append("text")
          .attr("x", width -24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) {return d;});

//  });
//  });

  updateGraph = function(data){
    plotPoints =$.extend(true,[],graphicalData);

    plotPoints.forEach(function(d){
      var y0 = 0;
      d.thefts = color.domain().map(function (name){
        return {
                name: name,
                y0: y0,
                y1: y0 += +d[name]
              };
      });
      d.total = d.thefts[d.thefts.length - 1].y1;
    });

    x.domain(plotPoints.map(function(d){ return d["YEAR"]; }));
    y.domain([0, d3.max(plotPoints, function(d) {return d.total; })]);

  svg.selectAll(".year").data(plotPoints)
                      .exit().remove();

    var year = svg.selectAll(".year")
                  .data(plotPoints)
                  .enter().append("g")
                  .attr("class", "g")
                  .attr("transform", function(d){ return "translate("+ x(d['YEAR']) +" ,0 )"; });

    var bars = year.selectAll("rect")
        .data(function(d) {return d.thefts;});

        bars.exit().remove();

        bars.enter()
        .append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d){ return y(d.y1); })
        .attr("height",  function(d){ return  y(d.y0)- y(d.y1); })
        .style("fill", function(d) {return color(d.name); });

  }
};

var plotAssaults = function(){
  var margin  = {
    top     : 20,
    right   : 80,
    bottom  : 30,
    left    : 50
  },
  width       = 480 - margin.left - margin.right,
  height      = 500 - margin.top - margin.bottom,
  parseYear   = d3.time.format("%Y").parse,
  x           = d3.time.scale().range([0,width]),
  y           = d3.scale.linear().range([height, 0]);
  color       = d3.scale.category10();
  xAxis       = d3.svg.axis().scale(x).orient("bottom"),
  yAxis       = d3.svg.axis().scale(y).orient("left"),
  line        = d3.svg.line()
                  .interpolate("basis")
                  .x(function(d){
                      return x(d.year);
                    })
                  .y(function(d){
                      return y(d.count);
                    }),
  svg         = d3.select(".multiline-series")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate("+ margin.left + "," + margin.top +")");

  d3.json("../json/assault.json",function(err, plotPoints){

    if(err) throw err;

    color.domain(d3.keys(plotPoints[0]).filter(function(key){
      return key !== "YEAR";
    }));

    plotPoints.forEach(function(d){
      d.year = parseYear(d["YEAR"].toString());
    });

    var colors = color.domain().map(function(name){
      return {
        name: name,
        values: plotPoints.map(function(d){
          return {
            year: d.year, count: +d[name]
          };
        })
      };
    });


    x.domain(d3.extent(plotPoints, function(d){
      return d.year;
    }));

    y.domain([
      d3.min(colors, function(c){
        return d3.min(c.values, function(v){
          return v.count;
        });
      }),
      d3.max(colors, function(c){
        return d3.max(c.values, function(v){
          return v.count;
        });
      })
    ]);

    svg.append("g")
        .attr("class","x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y",6)
        .attr("dy", ".5em")
        .style("text-anchor", "end")
        .text("Counts");

    var count = svg.selectAll(".count")
                    .data(colors)
                    .enter().append("g")
                    .attr("class", "count");

    count.append("path")
          .attr("class", "line")
          .attr("d", function(d){
            return line(d.values);
          })
          .style("stroke", function(d){
            return color(d.name);
          });

    count.append("text")
          .datum(function(d){
            return {
              name : d.name,
              value: d.values[d.values.length - 1]
            };
          })
          .attr("transform", function(d){
            return "translate(" + x(d.value.year) + "," + y(d.value.count) + ")";
          })
          .attr("x", 1)
          .attr("dy", ".25em")
          .text(function(d){
            return d.name;
          });

  });


};


//plotThefts();
plotAssaults();

$(function(){

  var divTable = {
    container : $("section.active").children().filter("div.jsonTable"),
    tableData : [],
    init      : function(){

    var   file     = this.container.data("file");
          console.log("divTable ",divTable);
          console.log("file",file);
          $.getJSON(file, function(data){
              divTable.tableData = data;
              divTable.createTable.call(divTable.container,divTable.tableData);
              plotThefts(divTable.tableData);
          });
    },
    createTable : function(data){
      console.log(JSON.stringify(data));

      var keys = Object.keys(data[0]),
          tRow;
      console.log(keys);


      if (this.find("table").length) return;
      var table = $('<table class="table table-hover    "></table').prependTo(this);

      keys.forEach(function(header){
        table.prepend($("<th></th>")
            .text(header));
          });
          table.append($("<th></th>")
              .text("ACTION"));
      data.forEach(function(ob){
        tRow = $('<tr></tr>');
        keys.forEach(function(field){
          tRow.prepend($("<td></td>").text(ob[field]));
        });
          tRow.append($("<td></td>").append($("<button type = 'button' class = 'btn btn-xs btn-danger remove' ></button>").append($("<span></span>").attr("class","glyphicon glyphicon-remove"))))  ;
        table.append(tRow);
      });
      tRow = $('<tr></tr>');
      var idf = 'identifier'
      keys.forEach(function(d){
        tRow.prepend($('<td></td>').append($('<input></input>').attr({
            id: d,
            placeholder: d,
            class : 'form-control'
        })));
      });
      tRow.append($("<td></td>").append($("<button type = 'button' class = 'btn btn-xs btn-success' id = 'add' ></button>").attr('disabled','disabled').append($("<span></span>").attr("class","glyphicon glyphicon-ok")))) ;
      table.append(tRow);
    }


  };
  divTable.init();

  $('div.jsonTable').on('click','button.remove',function(e){
    // find the index of the object and remove it from the array.
    var caller = $(this),
        index      = $("button.remove").index(caller),
        count      = 1,
        data       = divTable.tableData;

    // console.log(caller);
    console.log("Index - ",index);
    console.log(count);
    data.splice(index,count);
    caller.closest("tr").remove();
    console.log(JSON.stringify(data));
    // Now update the data-index attributes of the remaining rows.

    plotThefts(data);


  });

  $('div.jsonTable').on('click','button#add',function(e){
    var caller    = $(this),
        obNewData = {},
        inputs    = $('div.jsonTable input'),
        data      = divTable.tableData,
        tRow      = $('<tr></tr>');


        inputs.each(function(input){
          obNewData[$(this).attr('id')] = $(this).val();
          $(this).val('');
        });
        console.log(obNewData);
        data.push(obNewData);
        console.log(JSON.stringify(data));

        Object.keys(obNewData).reverse().forEach(function(field){
          tRow.prepend($("<td></td>").text(obNewData[field]));
        });
          tRow.append($("<td></td>").append($("<button type = 'button' class = 'btn btn-xs btn-danger remove' ></button>").append($("<span></span>").attr("class","glyphicon glyphicon-remove"))))  ;
          caller.closest('tr').before(tRow);
          caller.attr('disabled','disabled');
        plotThefts(data);


  });

  $('div.jsonTable').on("keyup",'input',function() {
    var empty = false;
    $('input').each(function(){
        if ($(this).val() == '') {
            empty = true;
        }
    });
    (empty)?$('button#add').attr('disabled','disabled'): $('button#add').removeAttr('disabled');
  });

  $('div.jsonTable').on('keydown', 'input', function(e){-1!==$.inArray(e.keyCode,[46,8,9,27,13,110,190])||/65|67|86|88/.test(e.keyCode)&&(!0===e.ctrlKey||!0===e.metaKey)||35<=e.keyCode&&40>=e.keyCode||(e.shiftKey||48>e.keyCode||57<e.keyCode)&&(96>e.keyCode||105<e.keyCode)&&e.preventDefault()});



});
