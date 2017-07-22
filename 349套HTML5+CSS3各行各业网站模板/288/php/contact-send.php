<?php

if (isset($_REQUEST['action'])) {
    if ($_REQUEST['action'] == "contact_form_request") {

        $ourMail = "support@webtemplatemasters.com"; 

        $required_fields = array("name", "email", "message");
        $pre_messagebody_info = "";
        $errors = array();
        $data = array();
        parse_str($_REQUEST['values'], $data);
		
        //check for required and assemble message

        if (!empty($data)) {
            foreach ($data as $key => $value) {
                $name = strtolower(trim($key));
                if (in_array($name, $required_fields)) {
                    if (empty($value)) {
                        $errors[$name] = "Enter please " . $name . " right!";
                    }
                }

                if ($name == "email") {
                    if (!isValidEmail($value)) {
                        $errors[$name] = "Enter please " . $name . " right!";
                    }
                }
            }
        }

//***	
        session_start();
        $verify = $_SESSION['verify'];
        if ($verify != md5($data['verify'])) {
            $errors["verify"] = "Capcha";
        }

//***
        $result = array(
            "is_errors" => 0,
            "info" => ""
        );
        if (!empty($errors)) {
            $result['is_errors'] = 1;
            $result['info'] = $errors;
            echo json_encode($result);
            exit;
        }
		
		$pre_messagebody_info.="<strong>Name</strong>" . ": " . $data['name'] . "<br />";
        $pre_messagebody_info.="<strong>E-mail</strong>" . ": " . $data['email'] . "<br />";

        $headers = 'MIME-Version: 1.0' . "\r\n";
        $headers.= 'Content-type: text/html; charset=UTF-8' . "\r\n";
        $headers.= "From: ".$data['email']."\r\n";

        $after_message = "\r\n<br />--------------------------------------------------------------------------------------------------\r\n<br /> This mail was sent via contact form";

        if (mail($ourMail, "Email from contact form", $pre_messagebody_info .="<strong>Message</strong>" . ": " . nl2br($data['message']) .$after_message, $headers)) {
            $result["info"] = "success";
        } else {
            $result["info"] = "server_fail";
        }

        echo json_encode($result);
        exit;
    }
}

function isValidEmail($email){ 
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

?>

