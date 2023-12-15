const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utils/utils');

const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', ({ nombre, sala }, callback) => {

        if ( !nombre || !sala ) {
            return callback({
                error: true,
                message: 'El nombre y sala son necesarios'
            });
        }

        client.join(sala);
        
        usuarios.agregarPersona(client.id, nombre, sala);
        const personaEnSala = usuarios.getPersonasPorSala(sala);
        client.broadcast.to(sala).emit('listaPersona', personaEnSala );
        client.broadcast.to(sala).emit('crearMensaje', crearMensaje('Administrador', `${ nombre } se unió`));

        callback(personaEnSala);
    });

    client.on('crearMensaje', (data, callback) => {
        const persona = usuarios.getPersona(client.id);
        const mensaje = crearMensaje( persona.nombre, data.mensaje );
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

        callback(mensaje);
    })

    client.on('disconnect', () => { 
        const { sala, nombre } = usuarios.borrarPersona( client.id );

        client.broadcast.to(sala).emit('crearMensaje', crearMensaje('Administrador', `${ nombre } abandonó el chat`));
        client.broadcast.to(sala).emit('listaPersona', usuarios.getPersonasPorSala(sala) );
    });

    client.on('mensajePrivado', data => {
        const persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('crearMensaje', crearMensaje( persona.nombre, data.mensaje ));
    });

});