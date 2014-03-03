// BALDRICK JS 3
var users_list_trigger = {
	"triggers":	{
		".view-user"		:	{
			request			:	"/get-user",
			template		:	"#user-profile",
			event			:	"click",
			LoadElement		:	"#load-status",
			modal			:	"user-profile",
			modalTitle		:	"User: {{full_name}}"
		},
		".update-user"		:	{
			request			:	"/update-user",
			method			:	"POST",
			template		:	"#user-profile",
			event			:	"click",
			LoadElement		:	"#load-status",
			modal			:	"user-profile",
			block			:	this.modal
		}
	}
};