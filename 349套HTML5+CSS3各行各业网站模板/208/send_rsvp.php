<?php
    //we need to get our variables first
    
	$email_to =   'yourownemail@mymail.com'; //the address to which the email will be sent
	$name     =   $_POST['rsvp-name'];  
	$email    =   $_POST['rsvp-email'];
	$extra    =   $_POST['rsvp-extra'];
    $message  =   $_POST['rsvp-message'];
    $event = $_POST['event'];
    $events_string = implode(",", $event);

    
    /*the $header variable is for the additional headers in the mail function,
     we are asigning 2 values, first one is FROM and the second one is REPLY-TO.
     That way when we want to reply the email gmail(or yahoo or hotmail...) will know 
     who are we replying to. */
    $headers  = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";

    $subject = "Mr/Mrs ".$name." sent you an RSVP message";

    $finalmessage = "Mr/Mrs $name sent you the following message: \n 
                    -------------------------------------------------------\n 
                    $message \n 
                    -------------------------------------------------------\n
                    Events Attending:\n 
                    -------------------------------------------------------\n 
                    $events_string
                    -------------------------------------------------------\n
                    Also, this person has specified the following EXTRA REQUIREMENTS:\n 
                    -------------------------------------------------------\n 
                    $extra\n 
                    -------------------------------------------------------\n ";

    
    if(mail($email_to, $subject, $finalmessage, $headers)){
        echo 'sent'; // we are sending this text to the ajax request telling it that the mail is sent..      
    }else{
        echo 'failed';// ... or this one to tell it that it wasn't sent    
    }
?>