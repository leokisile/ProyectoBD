-- =============================================================================
--                     EJEMPLOS DE USO DE PROCEDIMIENTOS
-- =============================================================================

-- Seleccionar todos los eventos de una categoría y fecha especifica
CALL eventoCategoria(1, "2025-04-20");  -- Entrada: idTipoEvento y fecha (YYYY-MM-DD) deseado (passar en el llamado en web)
CALL eventoCategoria(1, null);

CALL eventoIndv(2); -- Información de un solo evento mediante su idEvento

SELECT sedeOcupada(3, "2025-04-20 10:01:00", "2025-04-20 10:59:00");-- 1: Hay un evento que inicia a las 10 y termina a las 11
SELECT sedeOcupada(3, "2025-04-20 9:59:00", "2025-04-20 10:00:00"); -- 0: El otro evento inicia a las 10, así que ese minuto está desocupado
SELECT sedeOcupada(3, "2025-04-20 9:59:00", "2025-04-20 10:01:00"); -- 0: El otro evento inicia a las 10, así que está ocupado

SELECT horPersonaTraslape(3, "2025-04-20 10:00:00"); -- 1: La persona 3 ya tiene un evento que inicia a las 10
SELECT horPersonaTraslape(3, "2025-04-20 10:05:00"); -- 0: La persona 3 podría participar en otro evento a las 10:05

CALL crearSede('Auditorio Principal','Av. Reforma #123, CDMX', 2, @msg); SELECT @msg; -- Nombre, dir, idEspacio, msg
CALL crearSede('Sala Alterna','Centro de Convenciones, Monterrey',999, @msg); SELECT @msg; -- Error (El espacio no existe)

CALL modificarSede(5,'Sala de Conferencias Norte','Blvd. Universidad 45, Puebla',3,@msg); SELECT @msg; -- idSede, Nombre, Direccion, idEspacio, msg
CALL modificarSede(5,'Sala Renovada','',1,@msg); SELECT @msg; -- Error

CALL crearPersona('María Gómez', 'Autora mexicana de literatura infantil', @msg); SELECT @msg; 
-- Orden: (nombre, biografia, OUT mensaje)
CALL modificarPersona(12, 'María Gómez Ruiz', 'Escritora y conferencista internacional', @msg); SELECT @msg;
-- Orden: (idPersona, nombre, biografia, OUT mensaje)

CALL crearRed('Instagram', @msg); SELECT @msg;
-- Orden: (red, OUT mensaje)

CALL modificarRed(3, 'TikTok', @msg); SELECT @msg;
-- Orden: (idRed, red, OUT mensaje)

CALL crearRedPersona(12, 3, 'autor12_ig', @msg); SELECT @msg;
-- Orden: (idPersona, idRed, enlace, OUT mensaje)

CALL modificarRedPersona(12, 3, 12, 5, 'autor12_tiktok', @msg); SELECT @msg;
-- Orden: (oldIdPersona, oldIdRed, newIdPersona, newIdRed, enlace, OUT mensaje)

CALL crearTipoEvento('Conferencia', @msg); SELECT @msg;
-- Tipo evento, msg

CALL modificarTipoEvento(5, 'Mesa Redonda Internacional', @msg); SELECT @msg;
-- idTipoEvento, tipoEvento, msg

CALL crearEvento('Charla IA', 'Introducción a IA', 1, 0, 'Descripción larga', 'Info extra', 3, 5, @msg); SELECT @msg;
-- (titulo, sinopsis, reqRegistro, participaPublico, descripcion, infoAd, idSede, idTipoEvento, xMsg OUT)

CALL modificarEvento(12, 'Charla IA Actualizada', 'Nueva sinopsis', 0, 1, 'Nueva desc', 'Nueva info', 4, 2, @msg); SELECT @msg;
-- (idEvento, titulo, sinopsis, reqRegistro, participaPublico, descripcion, infoAd, idSede, idTipoEvento, xMsg OUT)

CALL crearRelEventoOrg(5, 3, @msg); SELECT @msg;
-- (idEvento, idOrganizacion, xMsg)

CALL modificarRelEventoOrg(5, 3, 5, 7, @msg); SELECT @msg;
-- (oldEvento, oldOrg, newEvento, newOrg, xMsg)

CALL crearEventoHorario(8, '2025-02-10 10:00', '2025-02-10 12:00', @msg); SELECT @msg;
-- (idEvento, fechaInicio, fechaFin, xMsg)

CALL modificarEventoHorario(4, 8, '2025-02-11 15:00', '2025-02-11 17:00', @msg); SELECT @msg;
-- (idHorario, idEvento, fechaInicio, fechaFin, xMsg)

CALL crearRol('Conferencista', @msg); SELECT @msg;  -- (rol)

CALL modificarRol(2, 'Moderador', @msg); SELECT @msg;  -- (idRol, rol)

CALL crearRelPersonaEvento(1, 3, 2, @msg); SELECT @msg;
-- (idPersona, idEvento, idRol)

CALL modificarRelPersonaEvento(1, 3, 2, 1, 3, 4, @msg); SELECT @msg;
-- (idPersona, idEvento, idRol, nuevoIdPersona, nuevoIdEvento, nuevoIdRol)

CALL crearLibros('Título ejemplo', 'Sinopsis ejemplo', 1, 1, @mensaje); SELECT @mensaje;
CALL modificarLibros(1, 'Nuevo título', 'Nueva sinopsis', 1, 1, @mensaje); SELECT @mensaje;

CALL crearPresEditorial(1, @mensaje); SELECT @mensaje;
CALL modificarPresEditorial(1, 2, @mensaje); SELECT @mensaje;

CALL crearRelLibroPres(1, 1, @mensaje); SELECT @mensaje;
CALL modificarRelLibroPres(1, 1, 2, 2, @mensaje); SELECT @mensaje;

CALL crearEventoMusical(1, 'Canción1, Canción2', @mensaje); SELECT @mensaje;
CALL modificarEventoMusical(1, 'Nuevo setlist', @mensaje); SELECT @mensaje;

CALL crearTaller(1, 'Papel, Pegamento', '8-12', @mensaje); SELECT @mensaje;
CALL modificarTaller(1, 'Materiales actualizados', '10-14', @mensaje); SELECT @mensaje;

CALL crearPremiacion(1, 'Premio al Mejor Autor', @mensaje); SELECT @mensaje;
CALL modificarPremiacion(1, 'Premio actualizado', @mensaje); SELECT @mensaje;
-- ==============================================
--              CONSULTAS GENERALES
-- ==============================================

select * from organizaciones;
select * from espacios;
select * from sedes;
select * from personas;
select * from redes;
select * from redesPersonas;
select * from tipoEventos;
select * from eventos;
select * from relEventoOrg;
select * from eventoHorario;
select * from roles; -- 3 Presentador
select * from relPersonaEvento;
select * from libros;
select * from presEditorial;
select * from relLibroPres;
select * from eventoMusical;
select * from taller;
select * from premiacion;