/*
-------------------------------------------------------------
Antonio Juan Sanchez Martín
anto@usal.es
Descripción del fichero:

    - Generación del comparador con diagrama de coordenadas
      paralelas
-------------------------------------------------------------
*/

function dibujarComparador (comparados)
{
      var margin = {top: 40, right: 60, bottom: 20, left: 200},
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

      var dimensions = [
        {
          name: "Curso",
          scale: d3.scale.ordinal().rangePoints([10, height]),
          type: String
        },
        {
          name: "Alumnos",
          scale: d3.scale.linear().range([10, height]),
          type: Number
        },
        {
          name: "Mensajes",
          scale: d3.scale.linear().range([height, 10]),
          type: Number
        },
        {
          name: "Acc. recursos",
          scale: d3.scale.sqrt().range([height, 10]),
          type: Number
        },
        {
          name: "Acc. actividades",
          scale: d3.scale.linear().range([height, 10]),
          type: Number
        },
        {
          name: "Acc. lecciones",
          scale: d3.scale.linear().range([height, 10]),
          type: Number
        }
      ];

      var x = d3.scale.ordinal()
          .domain(dimensions.map(function(d) { return d.name; }))
          .rangePoints([0, width]);

      var line = d3.svg.line()
          .defined(function(d) { return !isNaN(d[1]); });

      var yAxis = d3.svg.axis()
          .orient("left");

      var comparador = d3.select("#diagrama_comparador_info").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dimension = comparador.selectAll(".dimension")
          .data(dimensions)
        .enter().append("g")
          .attr("class", "dimension")
          .attr("transform", function(d) { return "translate(" + x(d.name) + ")"; });

      var urls = [];

      for (key in comparados)
      {
            urls.push(key);
      }

      var urlGET = "services/"+servicios["comparador"]+"?h="+hora()+"&cursos[]="+urls.join("&cursos[]=");

      console.log (urlGET);

      d3.json(urlGET, function(data) 
      {

        dimensions.forEach(function(dimension) 
        {
          dimension.scale.domain(dimension.type === Number
              ? d3.extent(data, function(d) { return +d[dimension.name]; })
              : data.map(function(d) { return d[dimension.name]; }).sort());
        });

        comparador.append("g")
            .attr("class", "background")
          .selectAll("path")
            .data(data)
          .enter().append("path")
            .attr("d", draw)
            ;

        comparador.append("g")
            .attr("class", "foreground")
          .selectAll("path")
            .data(data)
          .enter().append("path")
            .attr("d", draw)
            .attr("stroke", function (d) { 
              return color (d.Curso)})
            .attr("fill", function (d) { 
              return color (d.Curso)});

        dimension.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(yAxis.scale(d.scale)); })
          .append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d.name; });

        comparador.select(".axis").selectAll("text:not(.title)")
            .attr("class", "label")
            .data(data, function(d) { return d.name || d; });

        var projection = comparador.selectAll(".axis text,.background path,.foreground path")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        function mouseover(d) {
          comparador.classed("active", true);
          projection.classed("inactive", function(p) { return p !== d; });
          projection.filter(function(p) { return p === d; }).each(moveToFront);
        }

        function mouseout(d) {
          comparador.classed("active", false);
          projection.classed("inactive", false);
        }

        function moveToFront() {
          this.parentNode.appendChild(this);
        }
      });

      function draw(d) 
      {
          return line(dimensions.map(function(dimension) 
          {
              return [x(dimension.name), dimension.scale(d[dimension.name])];
          }));
      }



}

function borrarComparador ()
{
    $("#info_comparador").html ("");
}
