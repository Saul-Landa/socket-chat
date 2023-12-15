const params = new URLSearchParams(window.location.search);

const nombre = params.get('nombre');
const sala = params.get('sala');

const divUsuarios = $('#divUsuarios');
const formEnviar = $('#formEnviar');
const txtMensaje = $('#txtMensaje');
const divChatbox = $('#divChatbox');

const renderizarUsuarios = ( personas = [] ) => {
    console.log(personas);
    let html = `<li>
                    <a href="javascript:void(0)" class="active"> Chat de <span> ${ sala }</span></a>
                </li>`;

    personas.map( persona => {
        html += `<li>
                    <a data-id="${ persona.id }" href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle"> <span>${ persona.nombre } <small class="text-success">online</small></span></a>
                </li>`
    });

    divUsuarios.html(html);
}

const renderizarMensajes = ( {mensaje, nombre, fecha}, yo = false ) => {
    const date = new Date(fecha);
    const hour = date.getHours() + ' ' + date.getMinutes(); 
    const isAdmin = nombre === 'Administrador';
    const adminClass =  isAdmin ? 'danger' : 'info';
    const html = yo 
                ? `<li class="reverse">
                        <div class="chat-content">
                            <h5>${ nombre }</h5>
                            <div class="box bg-light-inverse">${ mensaje }</div>
                        </div>
                        <div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" /></div>
                        <div class="chat-time">${ hour }</div>
                    </li>`
                : `<li class="animated fadeIn">
                        ${ isAdmin ? '' : '<div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" /></div>' }
                        <div class="chat-content">
                            <h5>${ nombre }</h5>
                            <div class="box bg-light-${ adminClass }">${ mensaje }</div>
                        </div>
                        <div class="chat-time">${ hour }</div>
                    </li>`;

    divChatbox.append(html);
}

const scrollBottom = () => {

    // selectors
    var newMessage = divChatbox.children('li:last-child');

    // heights
    var clientHeight = divChatbox.prop('clientHeight');
    var scrollTop = divChatbox.prop('scrollTop');
    var scrollHeight = divChatbox.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        divChatbox.scrollTop(scrollHeight);
    }
}

// Listener
divUsuarios.on('click', 'a', function() {
    const id = $(this).data('id');
    if ( !id ) return;

    console.log(id);
});

formEnviar.on('submit', function(e) {
    e.preventDefault();

    const mensaje = txtMensaje.val();

    if (mensaje.trim().length === 0) return;

    socket.emit('crearMensaje', {
        nombre,
        mensaje
    }, function(mensaje) {
        txtMensaje.val('').focus();
        renderizarMensajes(mensaje, true);
        scrollBottom();
    });
});