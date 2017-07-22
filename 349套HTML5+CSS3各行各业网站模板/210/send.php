<?php
if (isset($_POST['name'])) {$name = $_POST['name'];}
if (isset($_POST['email'])) {$email = $_POST['email'];}
if (isset($_POST['message'])) {$message = $_POST['message'];}

$address = "test@test.ru"; // Your mail 

$sub = "Message from Website";

$mes = "Name: $name \nE-mail: $email \nMessage: \n$message";

$send = mail ($address,$sub,$mes,"Content-type:text/plain; charset = windows-1251\r\nFrom:$email");
if ($send == 'true')
{
echo "Message was sent!";
}
else 
{
echo "Message was NOT sent!";
}
?>