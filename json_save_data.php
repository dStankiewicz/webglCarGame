<?php
   $json = $_POST['json'];
   $fileName = $_POST['file'];
    echo('asdads');

   if (json_decode($json) != null) { /* sanity check */
     $file = fopen($fileName,'w+');
     fwrite($file, $json);
     fclose($file);
   } else {
     // handle error 
   }
?>