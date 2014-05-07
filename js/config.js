/*
-------------------------------------------------------------
Antonio Juan Sanchez Martín
anto@usal.es
Descripción del fichero:

    - Definición de los servicios web utilizados
-------------------------------------------------------------
*/

   
    var servicios = 
    {
        "activos"   : "activos_json.php",
        "comparador": "comparador_json.php",
        "cursos"    : "cursos_json.php",
        "curso"     : "datos_curso_json.php"
    };
    
    // Ejecución local

    function hora ()
    {
         return Date.UTC();
    }