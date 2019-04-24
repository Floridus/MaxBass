// Asynchronous Query -> Logged in?
//   -> yes -> "My Lessons" statt "Free"
//          -> "My Profile" und "Logout" statt "Login"
//          -> "Recommended for you"

$(window).on('load', function () {

    var $formError = $('#loginErrorMsg');
    var $formSuccess = $('#loginErrorMsg');

    $(document)
        .on('submit', '#loginForm', function(e) {
            e.preventDefault();

            var $form = $(this);

            $.ajax({
                url: $form.attr('action'),
                type: $form.attr('method'),
                dataType: 'json',
                data: $form.serialize(),
                success: function(data) {
                    if (data.login) {
                        window.location = 'video/all.html';
                    } else {
                        $('#loginErrorMsg')
                        // Errormeldung bei Anmeldung anzeigen
                            .removeClass('hide')
                        ;
                    }
                }
            });
        })
		.on('submit', '#registerForm', function(e) {
            e.preventDefault();

            var $form = $(this);

            $.ajax({
                url: $form.attr('action'),
                type: $form.attr('method'),
                dataType: 'json',
                data: $form.serialize(),
                success: function(data) {
                    if (data.register) {
						$('#registerSuccessMsg')
							.html(data.message)
                            .removeClass('hide')
                        ;
                    } else {
                        $('#registerErrorMsg')
							.html(data.message)
                            // Errormeldung bei Registrierung anzeigen
                            .removeClass('hide')
                        ;
                    }
                }
            });
        })
		.on('click', '#logout', function(e) {
            e.preventDefault();

            $.ajax({
                url: "../user/logout.json",
                dataType: 'json',
                success: function(data) {
                    if (data.logout) {
                        window.location = 'video/all.html';
                    } else {
                        alert("Logout Error")
                    }
                }
            });
        })
    ;
});