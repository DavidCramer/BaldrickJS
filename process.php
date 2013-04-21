<?php
session_start();

if(empty($_SESSION['count'])){
	$_SESSION['count'] = 0;
}
if(!empty($_POST['clock'])){

	echo date('H:i:s');
	die;
}
if(!empty($_POST['break'])){
	echo '<br />';
	die;
}
unset($_SESSION['count']);
if(isset($_POST['text'])){
	if(!empty($_POST['text'])){
		echo '<p>'.$_POST['text'].'</p>';
	}
	die;
}
echo '<pre>';
if(!empty($_FILES)){
	print_r($_FILES['file']['name']);
}else{
	print_r($_POST);
}
echo '</pre>';
?>