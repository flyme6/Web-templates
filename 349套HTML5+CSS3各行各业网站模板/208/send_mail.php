<?php
    //we need to get our variables first
    
	$email_to =   'yourownemail@mymail.com'; //the address to which the email will be sent
	$contact_name     =   $_POST['contactname'];  
	$contact_email    =   $_POST['contactemail'];
    $contact_message  =   $_POST['contactmessage'];

    
    /*the $header variable is for the additional headers in the mail function,
     we are asigning 2 values, first one is FROM and the second one is REPLY-TO.
     That way when we want to reply the email gmail(or yahoo or hotmail...) will know 
     who are we replying to. */
    $headers  = "From: $contact_email\r\n";
    $headers .= "Reply-To: $contact_email\r\n";

    $subject = "Mr/Mrs ".$contact_name." sent you a message:";

    $finalmessage = "Mr/Mrs $name sent you this message: \n 
                    -------------------------------------------------------\n 
                    $contact_message \n 
                    -------------------------------------------------------\n";

    
    if(mail($email_to, $subject, $finalmessage, $headers)){
        echo 'sent'; // we are sending this text to the ajax request telling it that the mail is sent..      
    }else{
        echo 'failed';// ... or this one to tell it that it wasn't sent    
    }
?>