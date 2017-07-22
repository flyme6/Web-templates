<?php
if (isset($_REQUEST['email']))  {
    //Email information
    $admin_email = "webdevelopment@atis.al";
    $name = $_REQUEST['first_name'];
    $email = $_REQUEST['email'];
    $message = $_REQUEST['message'];

    //send email
    if (mail($admin_email, $name, $message, "From:" . $email)) {
        echo 1;
    }
    else {
    	echo 0;
    }
}
?>