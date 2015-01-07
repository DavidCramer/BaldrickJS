https://joshpress.slack.com/archives/david/s1419612612000011

https://joshpress.slack.com/archives/david/s1419614897000111


### How Baldrick AJAX Requests Are Routed
In a wp ajax call you send to admin-ajax.php with a field called action to indicate which ajax action to run. In the JavaScript you normally have `function( response ){ output here.. }`. In Baldrick, the same kind of thing is done like so: `<button  class="wp-baldrick" data-request="url/admin-ajax.php" data-action="my-ajax-action" data-target="#my_respose_wrapper">Click</button>`. That does an ajax post to the url on data-request and put the response in `$( data-target )`. 

By default data-request is already bound to admin-ajax. Therefor there is no need to add `data-request` to a trigger if it will be processed via admin-ajax. Therefore, `<button class="wp-baldrick" data-action="my-action">Click</button>` would be processed via admin-ajax.php using the action `wp_ajax_my-action`.

Whatever is returned from the wp ajax action is placed into the the data-target as HTML or the jQuery element it refers to. The data-request doesn't have to be a URL, it can be the name of a JavaScript function. The parameter `data-target`  can be a jQuery selector or a function. If it is a jQuery selector, the result is placed in that container, which should exist. If its a function it passes the trigger object as the first argument.


If `data-action=foo` and `data-target=#football` it routes the request to the action `wp_ajax_foo` and place the result in the container with the ID of "football". By default request are made via POST. To make a get request, use `data-method="GET"`


### Triggering Requests & Events
The default event is click. Other events are availble. For example to trigger on hover, use `data-event="hover"`. In addition a custom event can be called. For example, `data-event="my-event"` would allow you to use `$('#my-trigger').trigger('my-event');`. Additional, custom attributes can be passed, as long as they start with data. All data-* attributes are submitted as fields. So, if your wp_ajax action requires a variable called page, simply add data-page="443" to the trigger.


###Open A Modal
The most basic modal can be created with the HTML:
`<a class="wp-baldrick" data-modal="true" data-action="make-modal">Click</a>`

The modal's content will be whatever is returned by the WordPress action "wp_ajax_make-modal".

When creating modals, the following data-* attributes are available

* `data-modal-title="My Modal Title"`
* `data-modal-autoclose="modal_id"`
* `data-modal-height="300"` (height in px)
* `data-modal-width="450"` (width in px)
* `data-modal-buttons="button title|callback function"`

### Available data-* Attributes to Control Baldrick
* `data-target-insert="replace|append|prepend|html"`
* `data-type="json|html"`
* `data-template="#my-handlebars-template-id"`
* `data-cache="local|session"`
* `data-callback="callback_function"`
* `data-complete="js_function"`
* `data-poll="*"` Polls the trigger at *ms (e.g if its a button, it will "click" the button every 500ms)
* `data-autoload="true"` Triggers on load automatically 
