/*Sources:
http://syntagmatic.github.io/parallel-coordinates/

**Used for selecting all columns in parallel coordinates**
**Used in zcolor and zscore functions**
https://underscorejs.org/
https://www.npmjs.com/package/underscore-math

**Used to create data grid and hover tool**
**Used in csv load**
**Modified to fit screen and data**
http://bl.ocks.org/eesur/1a2514440351ec22f176
*/


var pz;

//color scale
var zcolorscale = d3.scale.linear()
    .domain([0,0.3,0.6,1])
    .range(["#000299", "#008699", "#00994d", "#00990a"])
    //.domain([0,82])                         //min, max
    //.range(["#DD0000", "#00ff22"])          //color range [Low number color, high color number]
    .interpolate(d3.interpolateLab);


// load csv file and create the chart
d3.csv('Video_Games_Sales_Edited_9.csv', function(data) {
    pv = d3.parcoords()("#example")
        .data(data)
        .alpha(0.4)
        .hideAxis(["Name", "Platform"]) //removes name
        .composite("darken")
        .mode("queue")
        .render()
        .brushMode("1D-axes")
        .reorderable()
        .interactive();

    // create data table, row hover highlighting
    var grid = d3.divgrid();
    d3.select("#grid")
        .datum(data.slice(0,200))
        .call(grid)
        .selectAll(".row")
        .on({
            "mouseover": function(d) { pv.highlight([d]) },
            "mouseout": pv.unhighlight
        });

    // update data table on brush event
    pv.on("brush", function(d) {
        d3.select("#grid")
            .datum(d.slice(0,200))
            .call(grid)
            .selectAll(".row")
            .on({
                "mouseover": function(d) { pv.highlight([d]) },
                "mouseout": pv.unhighlight
            });
    });

    change_color("Global Sales (Million)");


    //click label to change color
    //I'm also using this to set the size of the labels
    pv.svg.selectAll(".dimension")
        .on("click", change_color)
        .selectAll(".label")
        .style("font-size", "12px")
        .attr("y", -5);

    ////I'm using this to set the size of the tick labels
    pv.svg.selectAll(".dimension")
        .selectAll(".tick")
        .style("font-size", "12px");


    /*
    Yanzhao's Part
    *//*
    var explore_count = 0;
    var exploring = {};
    var explore_start = false;
    pv.svg
        .selectAll(".dimension")
        .style("cursor", "pointer")
        .on("click", function(d) {
            exploring[d] = d in exploring ? false : true;
            event.preventDefault();
            if (exploring[d]) d3.timer(explore(d,explore_count));
        });

    function explore(dimension,count) {
        if (!explore_start) {
            explore_start = true;
            d3.timer(pv.brush);
        }
        var speed = (Math.round(Math.random()) ? 1 : -1) * (Math.random()+0.5);
        return function(t) {
            if (!exploring[dimension]) return true;
            var domain = pv.yscale[dimension].domain();
            var width = (domain[1] - domain[0])/4;

            var center = width*1.5*(1+Math.sin(speed*t/1200)) + domain[0];

            pv.yscale[dimension].brush.extent([
                d3.max([center-width*0.01, domain[0]-width/400]),
                d3.min([center+width*1.01, domain[1]+width/100])
            ])(pv.g()
                .filter(function(d) {
                    return d == dimension;
                })
            );
        };
    };*/

});

function change_color(dimension){
    pv.svg.selectAll(".dimension")
        .style("font-weight", "normal")
        .filter(function(d) { return d == dimension; })
        .style("font-weight", "bold");

    pv.color(zcolor(pv.data(),dimension)).render();
}

function zcolor(col, dimension){
    var z = zscore(_(col).pluck(dimension).map(parseFloat));  //pluck retrieves the names of the dimension
    return function(d) { return zcolorscale(z(d[dimension])) }
}

// color by zscore
function zscore(col) {
    var n = col.length,
        mean = _(col).mean(),
        sigma = _(col).stdDeviation();
    return function(d) {
        return (d-mean)/sigma;
    };
};