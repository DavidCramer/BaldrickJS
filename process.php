<pre><?php
if(!empty($_FILES)){
	print_r($_FILES['file']['name']);
}else{
	print_r($_POST);
}

?></pre>