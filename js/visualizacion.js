/*
-------------------------------------------------------------
Antonio Juan Sanchez Martín
anto@usal.es
Descripción del fichero:

    - Creación del grafo central incial de fuerzas
    - Creación del grafo central de agrupación
    - Funciones de asociación entre el grafo centra y timeline
-------------------------------------------------------------
*/

    // Variables de intercambio
    // -------------------------


    var max_size = 1000;
    var width =  $( "#diagrama_grafo" ).width() < max_size ?  max_size: $( "#diagrama_grafo" ).width();
    var height = $( "#diagrama_grafo"  ).height() < max_size ?  max_size: $( "#diagrama_grafo" ).height();
    width += 100;
    var diameter = height -100;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(70)
        .size([width, height]);

    var grafo = d3.select("#diagrama_grafo").append("svg")
        .attr("width", width)
        .attr("id", "grafo")
        .attr("height", height)
        .append('svg:g')
        .attr("pointer-events", "all")
             .call(d3.behavior.zoom().on("zoom", redraw))
        .append('svg:g');

   
    var leyenda = d3.select("#diagrama_grafo").append("div")   
              .attr("class", "tooltip")               
              .style("opacity", 0);

    var bubble = d3.layout.pack()
            .sort(null)
            .size([diameter, diameter])
            .padding(1.5);        

    var fisheye = d3.fisheye.circular()
        .radius(200)
        .distortion(5);

    var datosIntercambio = null;


    function redraw() {

        grafo.attr("transform",
        "translate(" + d3.event.translate + ")"
        + " scale(" + d3.event.scale + ")");
    }

    function crearGrafoPrincipal ()
    {
        d3.json("services/"+servicios["cursos"]+"?g="+hora(), function(error, datos) 
        {
                $("#cargador").hide();
                
                datosIntercambio = datos;

                // Calculamos los centros y dejamos de momento al sistema inmovil
                force.nodes(datos.nodes).links(datos.links);

                var categorias =  new Array();

                var n = datos.nodes.length;
                datos.nodes.forEach(function(d, i) 
                    { 
                        if (d.alumnos > 0)
                        {
                            if (d.categoria_nombre == "" ) categorias[d.categoria] = "Sin categoria";
                            else categorias[d.categoria] = d.categoria_nombre;
                        }
                        // Calculamos el centro
                        d.x = d.y = width / n * i; 
                    });

               

                force.start();
                for (var i = n; i > 0; --i) force.tick();
                force.stop();

                var link = grafo.append("g")
                    .attr("class", "enlaces").selectAll(".link")
                    .data(datos.links)
                    .enter().append("line")
                    .attr("class", "link")
                    .attr("fecha_inicio", function(d) { return d.fecha_inicio; })
                    .style("stroke-width", function(d) { return Math.sqrt(d.value); })
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                var node = grafo.append("g").attr("class", "nodos")
                  .selectAll(".node")
                  .data(datos.nodes)
                  .enter().append("circle")
                    .attr("class", "node")
                    .attr("group", function(d)   { return d.categoria; })

                    .attr("fill", function(d) { 
                        // Solamente para recordar el color
                        return color(d.categoria); })
                    .attr("id",  function(d) { return "curso_nodo_"+d.curso_id; })
                    .attr("r", function(d)   { return 3*((d.alumnos/10)+1); })
                    .attr("cx", function(d)  { return d.x; })
                    .attr("cy", function(d)  { return d.y; })
                    .style("fill", function(d) { return color(d.categoria); })
                    .on("mouseover", function(d) 
                      { 
                        onNodeOver(d.curso_id,  d.curso_nombre, false);                       
                        })                  
                    .on("mouseout", function(d) {  

                       
                        onNodeOut(d.curso_id, false);
                    })
                    .on("dblclick", function(d) {  

                        mostrarInformacionCurso (d.curso_id, d.curso_nombre, d.alumnos);
                    })
                    .on("click", function(d) {  

                        seleccionarCurso (d.curso_id);
                    });

                

                force.on("tick", function() {

                                    link.attr("x1", function(d) { return d.source.x; })
                                        .attr("y1", function(d) { return d.source.y; })
                                        .attr("x2", function(d) { return d.target.x; })
                                        .attr("y2", function(d) { return d.target.y; });

                                    node.attr("cx", function(d) { return d.x; })
                                        .attr("cy", function(d) { return d.y; });
                                  });
                

                grafo.on("mousemove", function() {
                    fisheye.focus(d3.mouse(this));

                    node.each(function(d) { d.fisheye = fisheye(d); })
                        .attr("cx", function(d) { return d.fisheye.x; })
                        .attr("cy", function(d) { return d.fisheye.y; });

                    link.attr("x1", function(d) { return d.source.fisheye.x; })
                        .attr("y1", function(d) { return d.source.fisheye.y; })
                        .attr("x2", function(d) { return d.target.fisheye.x; })
                        .attr("y2", function(d) { return d.target.fisheye.y; });
                  })
                ;

                 $.each (categorias, function(index, value) 
                {
                    if (value != null)
                    $("#contenido_leyenda").append ('<div class="categoria_item" ref="'+index+'" ><div class="categoria_color" style="background:'+color(index)+'"></div>'+value+'</div>');
                });


                $(".categoria_item").click( function()
                    {
                        var grupo = $(this).attr("ref");
                        
                        grafo.selectAll("circle[group='"+grupo+"']").each(function(d) 
                        {
                            seleccionarCurso (d["curso_id"]);
                        });
                    });

                crearTimeLine ();
            });
        }

        function onNodeOver (id, titulo, timeline)
        {
                var nodo = $("#curso_nodo_"+id);     
                
                leyenda.transition().duration(200).style("opacity", .7);    

                var xposicion = parseInt((nodo.attr("cx") > (width / 2)) ? (nodo.attr("cx")-100) : nodo.attr("cx")); 
                var yposicion = parseInt(nodo.attr("cy"));

                leyenda.html("<div class=\"title\">"+titulo+"<div>")
                                    .style("left", xposicion + "px")     
                                    .style("top", yposicion-30 + "px") ;    

                marcarCurso (id, timeline);
        }

        function onNodeOut (id, timeline)
        {
                leyenda.transition().duration(500).style("opacity", 0);   
                marcarCurso (id, timeline);
        }

        function mostrarInformacionCurso (id, nombre ,alumnos)
        {
            $("#diagrama_curso").toggle( "fade" );
            dibujarPie (id, nombre ,alumnos);
        }

        function classes(root) 
        {
            
            var nodos = [];
            
            $.each (root.nodes, function(index, value) 
            {
                nodos.push({packageName: value.categoria_nombre, 
                    curso_nombre: value.curso_nombre,
                    curso_nombre: value.curso_nombre,
                    curso_id: value.curso_id,
                    className: value.curso_nombre_corto, 
                    value: value.alumnos});
            });

            return {children: nodos};
        }

        function manCursos ()
        {
            var link = grafo.selectAll(".link").style("opacity", "0");  
            var node = grafo.selectAll(".node")
                      .data(bubble
                            .nodes(classes(datosIntercambio))
                            .filter(function(d) 
                            {  
                                return !d.children; 
                            })
                            )
                      .transition()
                              .duration(2000)
                              .attr("r", function(d) { 
                                return d.r; })
                              .attr("cx", function(d) { 
                                return d.x; })
                              .attr("cy", function(d) { 
                                return d.y; });
                              

            grafo.on("mousemove", null); // Desactivamos el OJO de pez

           
        }


        function conexCursos ()
        {

            var link = grafo.selectAll(".link");  
            

            var node = grafo.selectAll(".node")
                        .data(datosIntercambio.nodes)
                        .transition()
                            .duration(1000)
                            .attr("r", function(d) {  return 2*((d.alumnos/7)); })
                            .attr("cx", function(d) { return d.x; })
                            .attr("cy", function(d) { return d.y; })
                        .each("end", function() { 

            link.style("opacity", "1");  

            link.attr("x1", function(d) { return d.source.x; })
                                     .attr("y1", function(d) { return d.source.y; })
                                    .attr("x2", function(d) { return d.target.x; })
                                    .attr("y2", function(d) { return d.target.y; });
                            
            // Reactivamos el OJO de pez
            grafo.on("mousemove", function() 
                                    {
                                        fisheye.focus(d3.mouse(this));
                                        node = grafo.selectAll(".node");
                                        node.each(function(d) { d.fisheye = fisheye(d); })
                                            .attr("cx", function(d) { return d.fisheye.x; })
                                            .attr("cy", function(d) { return d.fisheye.y; });

                                        link.attr("x1", function(d) { return d.source.fisheye.x; })
                                            .attr("y1", function(d) { return d.source.fisheye.y; })
                                            .attr("x2", function(d) { return d.target.fisheye.x; })
                                            .attr("y2", function(d) { return d.target.fisheye.y; });
                                      });

                        } );


        }

        var seleccionados = new Array ();

        var marcado = null;

        function marcarCurso (id, timeline)
        {
            
            
            if (marcado != null)
            {
                var nodo = timeliner.select("#timeline_curso_"+marcado);
                var clase = grafo.select("#curso_nodo_"+marcado).attr ("class");
                nodo.attr ("class", clase.replace(" marcado", ""));
                clase = grafo.select("#curso_nodo_"+marcado).attr ("class");
                nodo = grafo.select("#curso_nodo_"+marcado);
                nodo.attr ("class", clase.replace(" marcado", ""));
                marcado = null;
            }
            else
            {
                marcado = id;
                var nodo = timeliner.select("#timeline_curso_"+id);
                nodo.attr ("class", nodo.attr ("class")+" marcado");
                nodo = grafo.select("#curso_nodo_"+id);
                nodo.attr ("class", nodo.attr ("class")+" marcado");
            }
            

        }

        var cursos_actividad            = [];
        var cursos_actividad_actuales   = [];

        var verActividad = false;
        var mostrandoActivos = false;

        function recolorearNodos ()
        {
                 $(cursos_actividad_actuales).each(function(nodo, v)
                {
                    if (v)
                    {
                        var n = grafo.select("#curso_nodo_"+nodo);
                        if (n!= null)
                        {
                            var clase= n.attr("class");
                            n.attr("class", clase.replace(" nparpadeo", ""));
                        }
                    }
                });

        }

        function colorearNodos ()
        {
                cursos_actividad_actuales = cursos_actividad;
                
                $(cursos_actividad_actuales).each(function(nodo, v)
                {
                    if (v)
                    {
                        var n = grafo.select("#curso_nodo_"+nodo);
                        if (n!= null)
                            n.attr("class", n.attr("class")+" nparpadeo");
                    }
                });

        }

        function verActivos ()
        {
            
            if(verActividad)
            {

                mostrandoActivos = true;
                colorearNodos();
                setTimeout(recolorearNodos, 500);
                setTimeout(verActivos, 1500);
            }
            else mostrandoActivos = false;
            
        }

        function comprobarActivos ()
        {
            if(verActividad)
            {
                $.getJSON("services/"+servicios["activos"], function( data ) 
                {
                    var items = [];
                    cursos_actividad = [];
                    $.each( data, function( clave, valor ) 
                    {
                        cursos_actividad[valor.curso] = valor.curso;
                    });
                    
                    if (!mostrandoActivos) verActivos();
                    setTimeout(comprobarActivos (), 30000); // Cada 30 segundos
                });
            }
        }



        function seleccionarCurso (id)
        {
            var clase = grafo.select("#curso_nodo_"+id).attr ("class");
            if (seleccionados[""+id])
            {
                delete seleccionados[id];
                timeliner.select("#timeline_curso_"+id).attr ("class", clase.replace(" seleccionado", ""));
                grafo.select("#curso_nodo_"+id).attr ("class", clase.replace(" seleccionado", ""));
            }
            else
            {
                seleccionados[id] = 1;
                timeliner.select("#timeline_curso_"+id).attr ("class", clase+" seleccionado");
                grafo.select("#curso_nodo_"+id).attr ("class", clase+" seleccionado");
            }

        }

    crearGrafoPrincipal ();
