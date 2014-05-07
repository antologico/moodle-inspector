<?php

    error_reporting(E_ERROR | E_PARSE);

    include "bd.php";

    

    $ficheroCache = 'cursos.json';

    $fecha = 0;
    
    if (file_exists($ficheroCache))
        $fecha = filemtime ( $ficheroCache );

    $undiaantes  = date ("U") - 60*60*24;

    if (($fecha <  $undiaantes ) || (isset($_GET["force"])))
    {

            $fp = fopen('cursos.php', 'w');

            $consultaSQL = "SELECT 
                            c.id as curso_id,
                            c.fullname as curso_nombre,
                            c.shortname as curso_nombre_corto,
                            c.startdate as fecha_inicio,
                            cc.name as categoria_nombre,
                            cc.id as categoria,
                            (SELECT COUNT(DISTINCT(u.id)) 
                                FROM mdl_user u, mdl_context ct, mdl_role_assignments ra, mdl_role r 
                                WHERE r.id = 5
                                AND c.id = ct.instanceid
                                AND ct.id = ra.contextid
                                AND ra.userid = u.id
                                AND r.id = ra.roleid
                                AND r.id = 5) as alumnos
                    FROM mdl_course c, mdl_course_categories cc
                    WHERE cc.id = c.category
                    HAVING alumnos > 0
                    "; 


            $resultadosSQL = mysql_query ($consultaSQL, $enlace); // realizamos la consulta

            if ($resultadosSQL != NULL)
            {

                $cursosJSON = "";

                        // imprimimos los datos
                        // array para la ordenación de cursos
                        $cursos = array ();

                    // -----------------------------------------------------
                            $cursosJSON .= '{ "nodes":[ '."\n";
                            $cont = 0;
                            while ($fila = mysql_fetch_assoc($resultadosSQL))
                            {
                                    foreach ($fila as $key => $value) 
                                    {
                                        $fila[$key] =
                                        utf8_encode($value);
                                    }

                                    if ($cont != 0) $cursosJSON .= ","; 
                                    $cont ++;
                                    $cursosJSON .= print_r(json_encode($fila), true)."\n";
                                    $cursos[0+$fila["curso_id"]] = $cont-1; 
                                    
                            
                            }

                    // -----------------------------------------------------
                    
                            $cursosJSON .= ' ], "links":[ '."\n";
                    
                    // -----------------------------------------------------

                            
                            $consultaSQL = "
                                SELECT c1.id as source, c2.id as target, (SELECT COUNT(DISTINCT(u.id))
                                        FROM mdl_user u, 
                                            mdl_context ct1, mdl_context ct2, 
                                            mdl_role_assignments ra1, mdl_role_assignments ra2, 
                                            mdl_role r
                                        WHERE
                                            c1.id = ct1.instanceid
                                        AND c2.id = ct2.instanceid
                                        AND ct1.id = ra1.contextid
                                        AND ct2.id = ra2.contextid
                                        AND ra1.userid = u.id
                                        AND ra2.userid = u.id
                                        AND r.id = ra1.roleid 
                                        AND r.id = ra2.roleid
                                        AND r.id = 5 ) as alumnos
                             FROM 
                                mdl_course c2, mdl_course c1
                            WHERE
                                c1.id != c2.id 
                                AND c1.id < c2.id                   
                            HAVING
                                alumnos > 0 
                                                    
                            "; 

                            // error_log("Rastreando curso: ".$i." / ".$lA." ".$consultaSQL);

                            $resultadosSQL = mysql_query ($consultaSQL, $enlace); // realizamos la consulta

                            $cont = 0;
                            while ($fila = mysql_fetch_assoc($resultadosSQL))
                            {
                                if ($cont != 0) $cursosJSON .= ","; 
                                    $cont ++;
                                $cursosJSON .= '{"source":'.$cursos[0+$fila['source']].
                                        ',"target":'.$cursos[0+$fila['target']].
                                        ', "value":'.$fila["alumnos"].'}'."\n";
                            }
                    

                     // -----------------------------------------------------   

                        $cursosJSON .= ' ] } ';

            }

            mysql_close($enlace);

            $fp = fopen($ficheroCache, 'w');
            fwrite($fp, $cursosJSON);

            print $cursosJSON;
        }
        else
        {
            include $ficheroCache;
        }

  
?>
