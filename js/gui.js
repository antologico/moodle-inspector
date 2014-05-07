/*
-------------------------------------------------------------
Antonio Juan Sanchez Martín
anto@usal.es
Descripción del fichero:

    - Eventos del la GUI
-------------------------------------------------------------
*/

// ---------------------------------------
// Eventos de elementos estándar
// ---------------------------------------

$(".dialogo").append ('<div class="fondo_dialogo"></div>');

$(".fondo_dialogo").click(function() 
    { 
        var padre = $(this).parent();
        $("#"+padre.attr('id')+"_info").html("");
        padre.toggle( "fade" ); 
        
    });

$(".cerrar_menu").click (function()
    {
        var padre = $(this).parent();
        
        if (padre.height() == 10)
        {
            padre.animate({ height: padre.attr("height") }, 600);
            $(this).removeClass ("cerrado");
            
        }
        else
        {
            $(this).addClass ("cerrado");
            padre.attr("height", padre.height() );
            padre.animate({ height: 10 }, 600);
        }
    });


// ---------------------------------------
// Eventos de botones
// ---------------------------------------

$("#actividad").click( function()
    {
        if (!verActividad) 
        {
             verActividad = true;
             $(this).html ('<i class="icon-pause"></i> Parar actividad</a>');
             $(this).addClass ("btn-danger");
             verActividad = true;
             comprobarActivos ();
        }
        else
        {
            $(this).html ('<i class="icon-play-circle"></i> Mostrar actividad</a>');
            $(this).removeClass ("btn-danger");
            verActividad = false;
        }

    });

$("#comparar").click( function()
{
    var entrar = 0;
    for (var i=0; i<seleccionados.length; i++)
    {
        if (seleccionados[i] == 1) entrar ++;
        if (entrar > 1) break;
    }
    
	if (entrar > 1)
	{
        $("#diagrama_comparador").toggle( "fade" ); 
        dibujarComparador (seleccionados);
    }
    else
    {
    	bootbox.alert("Debe seleccionar los cursos para compararlos");
    }
});


var cambio = true;
$("#cambiar").click (function ()
{

    if (cambio) 
        {
            $(this).html ('<i class="icon-magnet"></i> Ver enlaces');
            manCursos ();
        }
    else 
        {
            $(this).html ('<i class="icon-th"></i> Organizar');
            conexCursos ();
        }

    cambio = !cambio;
});



$("#historico").click (function ()
{

    verHistorico ();
});


$("#recargar").click (function ()
{
    location.reload();
});