jQuery BaldrickJS
==========

A Simple, Tiny Ajax Framework.

The shortest possible way to do a complete ajax request, …without writing a single line of javascript.

Example of initialising BaldrickJS
```html
<script>
jQuery(document).ready(function($){
	jQuery('.trigger').baldrick({
		request  : ajaxurl,
		method: 'POST'
	});
});

</script>
```
Example of a complete ajax request.
```html
<button class="trigger" data-request="/users/list.html" data-target="#users">Get Users</button>
<div id="users"></div>
```
[Example & Demo](http://desertsnowman.github.io/BaldrickJS/)
