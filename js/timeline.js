/*
-------------------------------------------------------------
Antonio Juan Sanchez Martín
anto@usal.es
Descripción del fichero:

    - Generación de la barra de tiempo
-------------------------------------------------------------
*/
var timeliner;
var fechas = [];

function crearTimeLine ()
{
    
    var ancho = $("#diagrama_timeline").width();
    var alto  = $ ("#diagrama_timeline").height()-10;

    var timesT = [];
    var fin    = 0;
    datosIntercambio.nodes.forEach(function(d, i) {

            timesT.push({   "id": d.curso_id,
                            "curso_nombre": d.curso_nombre,
                            "starting_time": d.fecha_inicio*1000,
                            "categoria": d.categoria,
                            "alumnos": d.alumnos,
                            "ending_time": d.fecha_inicio*1000,
                        });
            fechas.push ({ "id": d.curso_id, "fecha": d.fecha_inicio*1000 });

        });

    // fechas ordenadas
    fechas.sort(function(a,b){return a.fecha - b.fecha});

   
    testData = [ {label: "timeline", times: timesT } ];

    var chart = d3.timeline()
          .tickFormat( // 
            {
                format: d3.time.format("%m/%Y"), 
                tickTime: d3.time.mount, 
                tickNumber: 30, 
                tickSize: 10}
            )
          .display("circle")
          .width(width*2)
          ;

    timeliner = d3.select("#diagrama_timeline").append("svg")
            .attr("width", "100%")
            .attr("height", alto)
            .datum(testData).call(chart)
            ;



    var puntos = timeliner.selectAll("circle")
                  .attr ("class", "nodo_timeline")
                  .attr ("r", function(d) { return  4+(d.alumnos/15); })
                  .attr ("cy", "30" )
                  .attr ("curso", function(d) { return  d.curso_nombre; })
                  .attr ("ref", function(d)      { return d.id; } )
                  .attr ("id", function(d)       { return "timeline_curso_"+d.id; })
                  .attr ("fill", function(d)    { return color(d.categoria); })
                  .style("fill", function(d)    { return color(d.categoria); })
                  .on("mouseover", function(d) 
                      { 
                        onNodeOver ($(this).attr("ref"), $(this).attr("curso"), true);
                      })
                  .on("mouseout", function(d) 
                      { 
                         onNodeOut($(this).attr("ref"), true);
                      })
                  .on("dbclick", function(d) {  

                        mostrarInformacionCurso ($(this).attr("ref"));
                    })
                  .on("click", function(d) {  

                        seleccionarCurso ($(this).attr("ref"));
                    });
  }


  function mostrarNodoHistorico (fecha)
  {
      var color_n  = (parseInt((fecha.fecha - fecha_min) * 100 / (fecha_max-fecha_min) * 2.5)).toString(16);
      grafo.select("#curso_nodo_"+fecha.id).style("opacity", "1"); 
      grafo.select("#curso_nodo_"+fecha.id).style("fill", "#"+color_n+"0000");
  
      timeliner.select("#timeline_curso_"+fecha.id).style("opacity", "1"); 
      timeliner.select("#timeline_curso_"+fecha.id).style("fill", "#"+color_n+"0000");

  }

  function finalizarHistorico ()
  {
      // Por si queda alguno perdido ....
      // Añadimos aristas
      grafo.selectAll(".node").style("opacity", "1"); 
      grafo.selectAll(".link").style("opacity", "1"); 
      
      timeliner.selectAll(".nodo_timeline").style("opacity", "1"); 

      historico_activo = false;
      $("#historico").removeClass ("btn-danger");
      $("#historico").addClass ("btn-success");
      $("#historico").html ('<i class="icon-film"></i> Quitar histórico</a>');

  }

  function quitarHistorico ()
  {
      
      grafo.selectAll(".node").style("fill", function (d) { return d.fill;});
      timeliner.selectAll(".nodo_timeline").style("fill", function (d) { return d.fill;});
      
      $("#historico").html ('<i class="icon-film"></i> Histórico</a>');
      finHistorico = true;
      $("#historico").removeClass ("btn-success");
  }

  var velocidad_animacion_historico = 100;
  var fecha_max         = 0;
  var fecha_min         = 0;
  var historico_activo  = false;
  var finHistorico      = true;


  function verHistorico ()
  {
      if (!historico_activo)
      {
  
        if (finHistorico)
        {
          finHistorico = false;
          historico_activo = true;

          $("#historico").addClass ("btn-danger");
          historico_activo = true;
          console.log ("Inicio animación historica");

          grafo.selectAll(".link").style("opacity", "0"); 
          grafo.selectAll(".node").style("opacity", "0"); 
          timeliner.selectAll(".nodo_timeline").style("opacity", "0"); 


          var i =0;
          fecha_max = fechas[fechas.length-1].fecha;
          fecha_min = fechas[0].fecha;


          for (i =0; i<fechas.length; i++)
          {
            var fecha  = fechas[i];
            var id = fecha.id;
            setTimeout(mostrarNodoHistorico, i*velocidad_animacion_historico, { "id": fecha.id, "fecha": fecha.fecha } );
          }   

          // Esperamos un segundo después de acabar
          setTimeout(finalizarHistorico, (i+1)*velocidad_animacion_historico);
        }
        else
        {
            setTimeout(quitarHistorico, 100);
        }

      }
  }


