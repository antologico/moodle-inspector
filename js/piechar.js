function dibujarPie (id, nombre ,alumnos)
{

  $("#diagrama_curso_info_leyenda").html(nombre);
  
  var width = 400,
      height = 400,
      radius = Math.min(width, height) / 2;

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.accesos; });

  var svg = d3.select("#diagrama_curso_info").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  d3.json("services/"+servicios["curso"]+"?id="+id+"&h="+hora(), function(error, data) 
  {

          data.forEach(function(d) {
            d.accesos = +d.accesos;
          });

          var g = svg.selectAll(".arc")
              .data(pie(data))
            .enter().append("g")
              .attr("class", "arc");

          g.append("path")
              .attr("d", arc)
              .style("fill", function(d) { return color(d.data.actividad); });

          g.append("text")
              .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
              .attr("dy", ".35em")
              .style("text-anchor", "middle")
              .text(function(d) { return d.data.actividad; });

  });

  $("#diagrama_curso_info").append ("<div class='capa_num_alumnos'><div class='alumnos'>"+alumnos+"</div></div>")

}

function borrarPie ()
{
    $("#info_curso").html ("");
}