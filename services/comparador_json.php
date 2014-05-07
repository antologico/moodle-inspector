<?php

    include "bd.php";


    $misCursos = array();

    $grupos_inicales = 1;

    foreach ($_GET["cursos"] as $valor)
    {
        $misCursos [] = $valor;
    }

    $misCursos = array_unique ($misCursos);

    echo "[";
    
    $cont = 0;

    foreach ($misCursos as $id) 
    {
            if ($cont != 0) echo ",";
            $cont = 1;
            echo "{";
                
                    $consultaSQL = "SELECT 
                    c.fullname as curso_nombre,
                    (SELECT COUNT(DISTINCT(u.id)) 
                                FROM mdl_user u, mdl_context ct, mdl_role_assignments ra, mdl_role r 
                                WHERE r.id = 5
                                AND c.id = ct.instanceid
                                AND ct.id = ra.contextid
                                AND ra.userid = u.id
                                AND r.id = ra.roleid
                                AND r.id = 5) as alumnos
                    FROM mdl_course c
                    WHERE c.id=".$id."
                    HAVING alumnos > 0;"; 

                    $resultadosSQL = mysql_query ($consultaSQL, $enlace); // realizamos la consulta
                    if ($fila = mysql_fetch_assoc($resultadosSQL))
                    {
                        $nombre = $fila["curso_nombre"];
                        if (strlen($nombre) >  30)
                            $nombre = substr($fila["curso_nombre"], 0, 30)."...";

                        echo '  "Curso" : "'.utf8_encode($nombre).'" ,'."\n";
                        echo '  "Alumnos" : "'.$fila["alumnos"].'" ,'."\n";
                    }

                    $resul = mensajes ($id, "page");
                    echo '  "Mensajes" : "'.$resul.'" ,'."\n";
                    $resul = resultados ($id, "lesson");
                    echo '  "Acc. lecciones" : "'.$resul.'",'."\n";
                    $resul = resultados ($id, "page");
                    echo '  "Acc. recursos" : "'.$resul.'",'."\n";
                    $resul = resultados ($id, "quiz");
                    echo '  "Acc. actividades" : "'.$resul.'"'."\n";
                       
            echo "}";

    }

    echo "]";

    mysql_close($enlace);

?>