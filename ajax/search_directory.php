<?php
    // get filename for today's menu from POST request
    $searchTerm = $_POST["searchTerm"];

    // generate API URL to get today's menu
    $url = "https://www.umbc.edu/search/directory/?search=" . $searchTerm;

    // put the contents of the file into a variable
    $html = file_get_contents($url); 

    echo $html;
?>