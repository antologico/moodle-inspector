<?php

	include "bd.php";

    echo "[";
    if (isset($_GET["id"]))
    {
       
        $id = $_GET["id"];       
        
            $resul = resultados ($id, "page");
            echo '  { "actividad":"Acc. recursos", "accesos":"'.$resul.'" },';
            $resul = resultados ($id, "lesson");
            echo '  { "actividad":"Acc. lecciones", "accesos":"'.$resul.'" },';
            $resul = resultados ($id, "quiz");
            echo '  { "actividad":"Acc. actividades", "accesos":"'.$resul.'" },';
            $resul = mensajes ($id, "page");
            echo '  { "actividad":"Mensajes", "accesos":"'.$resul.'" } ]';            
    }
    else 
        echo "]";

    mysql_close($enlace);
?>
