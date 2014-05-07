<?php

    include "bd.php";


    

    $date = new DateTime();
    $minutosantes =  $date->format("U")-(3*60); 

    $consultaSQL = "SELECT 
                    DISTINCT(course) as curso
            FROM mdl_log
            WHERE course != 1
            AND time > ".$minutosantes; 

   
    $accesos = array();
    
    $resultadosSQL = mysql_query ($consultaSQL, $enlace); // realizamos la consulta

    if ($resultadosSQL != NULL)
    {

            echo "[";
            $cont = 1;
            while ($fila = mysql_fetch_assoc($resultadosSQL))
                    {
                        if ($cont != 1) echo  ",";
                        else $cont = 0;
                        error_log('Actividad en curso :'.$fila['curso']);
                        echo  '{"curso": "'.$fila['curso'].'"}'."\n";
                    }
            
                echo "]";
            

    }

    mysql_close($enlace);

?>