 <?php

    header('Content-Type: application/json; charset=UTF-8');

    include_once ('../../config.php');

    $BD = new stdClass();

    $BD->dbhost    = $CFG->dbhost;
    $BD->dbname    = $CFG->dbname;
    $BD->dbuser    = $CFG->dbuser;
    $BD->dbpass    = $CFG->dbpass;

    $enlace = null;
    
    mysql_query("SET character_set_results = 'utf8_general', character_set_client = 'utf8', character_set_connection = 'utf8', character_set_database = 'utf8', character_set_server = 'utf8'", $enlace);
   
    $context = get_context_instance (CONTEXT_SYSTEM);
    $roles = get_user_roles($context, $USER->id, false);
    $role = key($roles);
    $roleid = $roles[$role]->roleid;
                            

    if (isset($USER->id))
        if ($USER->id)
            if ($roleid == 1)
                $enlace = mysql_connect ($BD->dbhost,  $BD->dbuser, $BD->dbpass);

    if  ($enlace == null) 
    {
        die('{ "error" : "No hay permisos de conexion usuario: '.$USER->id.'"}');
    }
    if (!enlace)
    {
        die('{ "error" : "' .htmlentities(mysql_error()).'"}');
    }

    mysql_select_db($BD->dbname);


    function resultados ($id, $module)
    {
        global $enlace;

        $consultaSQL = "select COUNT(DISTINCT(id)) as contados FROM mdl_log WHERE course = '".$id."' AND module ='".$module."'; "; 
        $res = array();
        $resultadosSQL = mysql_query ($consultaSQL, $enlace); // realizamos la consulta
        if ($fila = mysql_fetch_assoc($resultadosSQL))
        {
            return $fila["contados"];
        }
        return 0;
    }


    function mensajes ($id)
    {
        global $enlace;

        $consultaSQL = "Select COUNT(DISTINCT(mdl_forum_posts.id)) as contados 
                FROM mdl_forum_posts, mdl_forum_discussions, mdl_forum 
                WHERE   mdl_forum.course = '".$id."'
                        AND mdl_forum.id = mdl_forum_discussions.forum
                        AND mdl_forum_posts.discussion = mdl_forum_discussions.id ;"; 
        $res = array();
        $resultadosSQL = mysql_query ($consultaSQL, $enlace); // realizamos la consulta
        if ($fila = mysql_fetch_assoc($resultadosSQL))
        {
            return $fila["contados"];
        }
        return 0;
    }


 ?>