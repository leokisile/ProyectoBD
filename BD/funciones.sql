-- =============================================================
--                         VISTAS ALMACENADAS
-- =============================================================
DROP VIEW IF EXISTS programaGeneral;
CREATE VIEW programaGeneral AS
SELECT 
	e.idEvento,
	te.tipoEvento,
	e.titulo,
	GROUP_CONCAT(o.nombre SEPARATOR ', ') AS organizaciones,
	DATE(fechaInicio) AS fechaInicio,
	time(fechaInicio) AS horaInicio,
	DATE(fechaFin) AS fechaFin,
	time(fechaFin) as horaFin 
FROM eventos e
	INNER JOIN tipoEventos te ON te.idTipoEvento = e.idTipoEvento
	INNER JOIN eventoHorario eh ON eh.idEvento = e.idEvento
	INNER JOIN relEventoOrg eo ON eo.idEvento = e.idEvento
	INNER JOIN organizaciones o ON o.idOrganizacion = eo.idOrganizacion
GROUP BY e.idEvento, eh.fechaInicio, eh.fechaFin
ORDER BY fechaInicio, fechaFin;

DROP VIEW IF EXISTS dias;
CREATE VIEW dias AS
	SELECT DISTINCT DATE(fechaInicio) FROM eventoHorario
    ORDER BY DATE(fechaInicio);

DROP VIEW IF EXISTS programaEditorial;
CREATE VIEW programaEditorial AS
	SELECT * FROM tipoEventos WHERE idTipoEvento IN (1,2,3,4,9,14,15,16,17,20,23,24,25,26,27,29,30);
    
DROP VIEW IF EXISTS talleres;
CREATE VIEW talleres AS
	SELECT * FROM tipoEventos WHERE idTipoEvento IN (5,6);

DROP VIEW IF EXISTS programaCultural;
CREATE VIEW programaCultural AS
	SELECT * FROM tipoEventos WHERE idTipoEvento IN(7,8,10,11,12,13,18,19,21,22,28);

SELECT * FROM programaGeneral; -- Tabla con todos los eventos y sus horarios y participantes
SELECT * FROM dias; -- Fechas en formato (YYYY-MM-DD) de los días de la feria
SELECT * FROM programaEditorial; -- Lista de id y nombre del programa Editorial
SELECT * FROM talleres; -- Lista de id y nombre de los talleres
SELECT * FROM programaCultural; -- Lista de id y nombre del programa Cultural

-- ===============================================================================
--                      PROCEDIMIENTOS ALMACENADOS Y TRIGGERS
-- ===============================================================================
DROP PROCEDURE IF EXISTS eventoCategoria;
DROP PROCEDURE IF EXISTS eventoIndv;

DROP PROCEDURE IF EXISTS librosPres;
DROP PROCEDURE IF EXISTS setlist; 
DROP PROCEDURE IF EXISTS datosTaller;
DROP PROCEDURE IF EXISTS premio;

DROP FUNCTION IF EXISTS sedeOcupada;
DROP FUNCTION IF EXISTS horPersonaTraslape;
DROP TRIGGER IF EXISTS trg_horSedeTraslape;
DROP TRIGGER IF EXISTS trg_horSedeTraslape_upd;
DROP TRIGGER IF EXISTS trg_horPersonaTraslape;
DROP TRIGGER IF EXISTS trg_horPersonaTraslape_upd;
DROP PROCEDURE IF EXISTS crearOrganizacion;
DROP PROCEDURE IF EXISTS modificarOrganizacion;
DROP PROCEDURE IF EXISTS eliminarOrganizacion;
DROP PROCEDURE IF EXISTS eliminarEspacio;
DROP PROCEDURE IF EXISTS eliminarSede;
DROP PROCEDURE IF EXISTS eliminarPersona;
DROP PROCEDURE IF EXISTS eliminarRed;
DROP PROCEDURE IF EXISTS eliminarRedPersona;
DROP PROCEDURE IF EXISTS eliminarTipoEvento;
DROP PROCEDURE IF EXISTS eliminarEvento;
DROP PROCEDURE IF EXISTS eliminarRelEventoOrg;
DROP PROCEDURE IF EXISTS eliminarHorarioEvento;
DROP PROCEDURE IF EXISTS eliminarRol;
DROP PROCEDURE IF EXISTS eliminarRelPersonaEvento;
DROP PROCEDURE IF EXISTS eliminarLibro;
DROP PROCEDURE IF EXISTS eliminarPresEditorial;
DROP PROCEDURE IF EXISTS eliminarRelLibroPres;
DROP PROCEDURE IF EXISTS eliminarEventoMusical;
DROP PROCEDURE IF EXISTS eliminarTaller;
DROP PROCEDURE IF EXISTS eliminarPremiacion;
DROP PROCEDURE IF EXISTS crearEspacio;
DROP PROCEDURE IF EXISTS modificarEspacio;
DROP PROCEDURE IF EXISTS crearSede;
DROP PROCEDURE IF EXISTS modificarSede;
DROP PROCEDURE IF EXISTS crearPersona;
DROP PROCEDURE IF EXISTS modificarPersona;
DROP PROCEDURE IF EXISTS crearRed;
DROP PROCEDURE IF EXISTS modificarRed;
DROP PROCEDURE IF EXISTS crearRedPersona;
DROP PROCEDURE IF EXISTS modificarRedPersona;
DROP PROCEDURE IF EXISTS crearTipoEvento;
DROP PROCEDURE IF EXISTS modificarTipoEvento;
DROP PROCEDURE IF EXISTS crearEvento;
DROP PROCEDURE IF EXISTS modificarEvento;
DROP PROCEDURE IF EXISTS crearRelEventoOrg;
DROP PROCEDURE IF EXISTS modificarRelEventoOrg;
DROP PROCEDURE IF EXISTS crearEventoHorario;
DROP PROCEDURE IF EXISTS modificarEventoHorario;
DROP PROCEDURE IF EXISTS crearRol;
DROP PROCEDURE IF EXISTS modificarRol;
DROP PROCEDURE IF EXISTS crearRelPersonaEvento;
DROP PROCEDURE IF EXISTS modificarRelPersonaEvento;
DROP PROCEDURE IF EXISTS crearLibros;
DROP PROCEDURE IF EXISTS modificarLibros;
DROP PROCEDURE IF EXISTS crearPresEditorial;
DROP PROCEDURE IF EXISTS modificarPresEditorial;
DROP PROCEDURE IF EXISTS crearRelLibroPres;
DROP PROCEDURE IF EXISTS modificarRelLibroPres;
DROP PROCEDURE IF EXISTS crearEventoMusical;
DROP PROCEDURE IF EXISTS modificarEventoMusical;
DROP PROCEDURE IF EXISTS crearTaller;
DROP PROCEDURE IF EXISTS modificarTaller;
DROP PROCEDURE IF EXISTS crearPremiacion;
DROP PROCEDURE IF EXISTS modificarPremiacion;



DELIMITER //
CREATE PROCEDURE eventoCategoria (
    IN xidTipoEvento INT, 
    IN xfechaInicio DATETIME
)
BEGIN
    IF xfechaInicio IS NULL THEN

        SELECT 
			e.idEvento,
            e.titulo,
            GROUP_CONCAT(
                CASE WHEN pe.idRol != 3 THEN p.nombre END
                SEPARATOR ', '
            ) AS participantes,

            /* Presentadores o, si no hay, organizaciones */
            COALESCE(
                NULLIF(
                    GROUP_CONCAT(
                        CASE WHEN pe.idRol = 3 THEN p.nombre END
                        SEPARATOR ', '
                    ),
                    ''
                ),
                (SELECT GROUP_CONCAT(o.nombre SEPARATOR ', ')
                 FROM relEventoOrg reo
                 INNER JOIN organizaciones o ON o.idOrganizacion = reo.idOrganizacion
                 WHERE reo.idEvento = e.idEvento)
            ) AS presentadores,

            s.nombre AS sede,
            e.descripcion

        FROM eventos e
            INNER JOIN relPersonaEvento pe ON pe.idEvento = e.idEvento
            INNER JOIN personas p ON p.idPersona = pe.idPersona
            INNER JOIN sedes s ON s.idSede = e.idSede
            INNER JOIN eventoHorario eh ON eh.idEvento = e.idEvento
        WHERE e.idTipoEvento = xidTipoEvento
        GROUP BY e.idEvento, s.nombre, e.descripcion, eh.fechaInicio, eh.fechaFin
        ORDER BY fechaInicio, fechaFin;

    ELSE 

        SELECT 
            e.titulo,
            GROUP_CONCAT(
                CASE WHEN pe.idRol != 3 THEN p.nombre END
                SEPARATOR '\n '
            ) AS participantes,

            /* Presentadores o, si no hay, organizaciones */
            COALESCE(
                NULLIF(
                    GROUP_CONCAT(
                        CASE WHEN pe.idRol = 3 THEN p.nombre END
                        SEPARATOR '\n '
                    ),
                    ''
                ),
                (SELECT GROUP_CONCAT(o.nombre SEPARATOR '\n ')
                 FROM relEventoOrg reo
                 INNER JOIN organizaciones o ON o.idOrganizacion = reo.idOrganizacion
                 WHERE reo.idEvento = e.idEvento)
            ) AS presentadores,

            s.nombre AS sede,
            e.descripcion

        FROM eventos e
            INNER JOIN relPersonaEvento pe ON pe.idEvento = e.idEvento
            INNER JOIN personas p ON p.idPersona = pe.idPersona
            INNER JOIN sedes s ON s.idSede = e.idSede
            INNER JOIN eventoHorario eh ON eh.idEvento = e.idEvento
        WHERE e.idTipoEvento = xidTipoEvento 
          AND DATE(eh.fechaInicio) = DATE(xfechaInicio)
        GROUP BY e.idEvento, s.nombre, e.descripcion, eh.fechaInicio, eh.fechaFin
        ORDER BY fechaInicio, fechaFin;

    END IF;
END//

CREATE PROCEDURE eventoIndv (IN xidEvento INT)
BEGIN
	SELECT 
		te.tipoEvento,
		e.titulo,

		GROUP_CONCAT(
			CASE WHEN pe.idRol != 3 THEN CONCAT(p.nombre, ": ", p.biografia) END
			SEPARATOR '\n '
		) AS participantes,

		/* Presentadores o, si no hay, organizaciones */
		COALESCE(
			NULLIF(
				GROUP_CONCAT(
					CASE WHEN pe.idRol = 3 THEN p.nombre END
					SEPARATOR '\n '
				),
				''
			),
			(SELECT GROUP_CONCAT(o.nombre SEPARATOR '\n ')
			 FROM relEventoOrg reo
			 INNER JOIN organizaciones o ON o.idOrganizacion = reo.idOrganizacion
			 WHERE reo.idEvento = e.idEvento)
		) AS presentadores,

		s.nombre AS sede,
		e.sinopsis,
		e.descripcion,
		e.infoAd,
		e.reqRegistro,
		e.participaPublico,
        m.idMusical IS NOT NULL AS esMusical,
		ta.idTaller IS NOT NULL AS esTaller,
        pr.idPremiacion IS NOT NULL AS esPremiacion,
        pre.idPresEditorial IS NOT NULL AS esPresEditorial

	FROM eventos e
		INNER JOIN relPersonaEvento pe ON pe.idEvento = e.idEvento
		INNER JOIN personas p ON p.idPersona = pe.idPersona
		INNER JOIN sedes s ON s.idSede = e.idSede
        INNER JOIN tipoEventos te ON te.idTipoEvento = e.idTipoEvento
		INNER JOIN eventoHorario eh ON eh.idEvento = e.idEvento
        LEFT JOIN eventoMusical m ON e.idEvento = m.idMusical
		LEFT JOIN taller ta ON e.idEvento = ta.idTaller
		LEFT JOIN premiacion pr ON e.idEvento = pr.idPremiacion
		LEFT JOIN presEditorial pre ON e.idEvento = pre.idPresEditorial
	WHERE e.idEvento = xidEvento
	GROUP BY e.idEvento, s.nombre, e.descripcion, eh.fechaInicio, eh.fechaFin
	ORDER BY fechaInicio, fechaFin;
END //

CREATE PROCEDURE librosPres (IN xidEvento INT)
BEGIN
	SELECT 
		l.titulo, l.imagen, l.sinopsis, p.nombre AS autor
	FROM presEditorial pe
    INNER JOIN relLibroPres rlp ON pe.idPresEditorial = rlp.idPresEditorial
    INNER JOIN libros l ON rlp.idLibro = l.idLibro
    INNER JOIN personas p ON l.idAutor = p.idPersona
    WHERE pe.idPresEditorial = xidEvento;
END //
-- setlist datosTaller premio

CREATE PROCEDURE setlist (IN xidEvento INT)
BEGIN
	SELECT 
		setlist
	FROM eventoMusical
    WHERE idMusical = xidEvento;
END //

CREATE PROCEDURE datosTaller (IN xidEvento INT)
BEGIN
	SELECT 
		materiales, rangoEdad
	FROM taller
    WHERE idTaller = xidEvento;
END //

CREATE PROCEDURE premio (IN xidEvento INT)
BEGIN
	SELECT 
		premio
	FROM premiacion
    WHERE idPremiacion = xidEvento;
END //

CREATE FUNCTION sedeOcupada(
    xidSede INT,
    xfechaInicio DATETIME,
    xfechaFin DATETIME
)
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE resultado BOOLEAN;

    SELECT EXISTS(
        SELECT 1
        FROM eventos e
        INNER JOIN eventoHorario eh ON eh.idEvento = e.idEvento
        WHERE e.idSede = xidSede
        AND (eh.fechaInicio < xfechaFin AND eh.fechaFin > xfechaInicio)
    ) INTO resultado;
    RETURN resultado;
END //

CREATE FUNCTION horPersonaTraslape (
    xidPersona INT, 
    xfechaInicio DATETIME
)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE xRes BOOLEAN;

    SELECT EXISTS(
        SELECT 1
        FROM eventos e
        INNER JOIN eventoHorario eh ON eh.idEvento = e.idEvento
        INNER JOIN relPersonaEvento pe ON pe.idEvento = e.idEvento
        WHERE pe.idPersona = xidPersona
          AND eh.fechaInicio = xfechaInicio
    ) INTO xRes;
    RETURN xRes;
END//

CREATE TRIGGER trg_horSedeTraslape
BEFORE INSERT ON eventoHorario
FOR EACH ROW
BEGIN
	DECLARE sede INT;
    SELECT idSede INTO sede FROm eventos WHERE idEvento = NEW.idEvento;
	
    IF sedeOcupada(sede, NEW.fechaInicio, NEW.fechaFin) THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'ERROR: El horario se emplama con otro evento de la misma sede';
	END IF;
END//

CREATE TRIGGER trg_horSedeTraslape_upd
BEFORE UPDATE ON eventoHorario
FOR EACH ROW
BEGIN
	DECLARE sede INT;
    SELECT idSede INTO sede FROm eventos WHERE idEvento = NEW.idEvento;
	
    IF (NEW.fechaInicio <> OLD.fechaInicio OR NEW.fechaFin <> OLD.fechaFin) THEN
		IF sedeOcupada(sede, NEW.fechaInicio, NEW.fechaFin) THEN
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'ERROR: El horario se emplama con otro evento de la misma sede';
		END IF;
	END IF;
END//

CREATE TRIGGER trg_horPersonaTraslape
BEFORE INSERT ON relPersonaEvento
FOR EACH ROW
BEGIN
	IF EXISTS(
    SELECT 1
    FROM eventoHorario eh
    WHERE eh.idEvento = NEW.idEvento
    AND horPersonaTraslape(NEW.idPersona, eh.fechaInicio)
	) THEN
		SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'ERROR: La persona ya tiene un evento a esa hora';
	END IF;
END //

CREATE TRIGGER trg_horPersonaTraslape_upd
BEFORE UPDATE ON relPersonaEvento
FOR EACH ROW
BEGIN
	IF(NEW.idPersona <> OLD.idPersona OR NEW.idEvento <> OLD.idEvento) THEN
		IF EXISTS(
		SELECT 1
		FROM eventoHorario eh
		WHERE eh.idEvento = NEW.idEvento
		AND horPersonaTraslape(NEW.idPersona, eh.fechaInicio)
		) THEN
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'ERROR: La persona ya tiene un evento a esa hora';
		END IF;
	END IF;
END //

CREATE PROCEDURE crearOrganizacion(
    IN xnombre VARCHAR(100),
    IN xtel VARCHAR(20),
    IN xcorreo VARCHAR(100),
    IN xpagina VARCHAR(100),
    IN xpais VARCHAR(30),
    IN xestado VARCHAR(40),
    IN xciudad VARCHAR(30),
    OUT xMsg VARCHAR(200)
)
prod: BEGIN
    -- Validaciones simples
    IF xnombre IS NULL OR xnombre = '' THEN
        SET xMsg = 'ERROR: El nombre no puede estar vacío';
        LEAVE prod;
    END IF;

    IF xcorreo IS NULL OR xcorreo = '' THEN
        SET xMsg = 'ERROR: El correo no puede estar vacío';
        LEAVE prod;
    END IF;

    INSERT INTO organizaciones(nombre, tel, correo, pagina, pais, estado, ciudad)
    VALUES (xnombre, xtel, xcorreo, xpagina, xpais, xestado, xciudad);

    SET xMsg = 'ÉXITO: Organización creada correctamente';
END prod//

CREATE PROCEDURE modificarOrganizacion(
    IN xidOrganizacion INT,
    IN xnombre VARCHAR(100),
    IN xtel VARCHAR(20),
    IN xcorreo VARCHAR(100),
    IN xpagina VARCHAR(100),
    IN xpais VARCHAR(30),
    IN xestado VARCHAR(40),
    IN xciudad VARCHAR(30),
    OUT xMsg VARCHAR(200)
)
modi: BEGIN
    IF xidOrganizacion IS NULL OR xidOrganizacion <= 0 THEN
        SET xMsg = 'ERROR: El idOrganizacion no es válido';
        LEAVE modi;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM organizaciones WHERE idOrganizacion = xidOrganizacion) THEN
        SET xMsg = 'ERROR: La organización no existe';
        LEAVE modi;
    END IF;

    IF xnombre IS NULL OR xnombre = '' THEN
        SET xMsg = 'ERROR: El nombre no puede estar vacío';
        LEAVE modi;
    END IF;

    IF xcorreo IS NULL OR xcorreo = '' THEN
        SET xMsg = 'ERROR: El correo no puede estar vacío';
        LEAVE modi;
    END IF;

    UPDATE organizaciones
    SET nombre = xnombre,
        tel = xtel,
        correo = xcorreo,
        pagina = xpagina,
        pais = xpais,
        estado = xestado,
        ciudad = xciudad
    WHERE idOrganizacion = xidOrganizacion;

    SET xMsg = 'ÉXITO: Organización modificada correctamente';
END modi//

CREATE PROCEDURE eliminarOrganizacion(
    IN xidOrganizacion INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidOrganizacion IS NULL OR xidOrganizacion <= 0 THEN
        SET xMsg = 'ERROR: El idOrganizacion no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM organizaciones WHERE idOrganizacion = xidOrganizacion) THEN
        SET xMsg = 'ERROR: La organización no existe';
        LEAVE del;
    END IF;

    DELETE FROM organizaciones WHERE idOrganizacion = xidOrganizacion;

    SET xMsg = 'ÉXITO: Organización eliminada';
END del//


CREATE PROCEDURE crearEspacio(
    IN xtipoEspacio VARCHAR(60),
    OUT xMsg VARCHAR(200)
)
crea: BEGIN
    -- Validación
    IF xtipoEspacio IS NULL OR xtipoEspacio = '' THEN
        SET xMsg = 'ERROR: El tipo de espacio no puede estar vacío';
        LEAVE crea;
    END IF;

    -- Inserción
    INSERT INTO espacios(tipoEspacio)
    VALUES (xtipoEspacio);

    SET xMsg = 'ÉXITO: Espacio creado correctamente';
END crea//

CREATE PROCEDURE modificarEspacio(
    IN xidEspacio INT,
    IN xtipoEspacio VARCHAR(60),
    OUT xMsg VARCHAR(200)
)
modi: BEGIN
    -- Validar ID
    IF xidEspacio IS NULL OR xidEspacio <= 0 THEN
        SET xMsg = 'ERROR: El idEspacio no es válido';
        LEAVE modi;
    END IF;

    -- Verificar que exista
    IF NOT EXISTS(SELECT 1 FROM espacios WHERE idEspacio = xidEspacio) THEN
        SET xMsg = 'ERROR: El espacio no existe';
        LEAVE modi;
    END IF;

    -- Validación
    IF xtipoEspacio IS NULL OR xtipoEspacio = '' THEN
        SET xMsg = 'ERROR: El tipo de espacio no puede estar vacío';
        LEAVE modi;
    END IF;

    -- Actualización
    UPDATE espacios
    SET tipoEspacio = xtipoEspacio
    WHERE idEspacio = xidEspacio;

    SET xMsg = 'ÉXITO: Espacio modificado correctamente';
END modi//

CREATE PROCEDURE eliminarEspacio(
    IN xidEspacio INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidEspacio IS NULL OR xidEspacio <= 0 THEN
        SET xMsg = 'ERROR: El idEspacio no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM espacios WHERE idEspacio = xidEspacio) THEN
        SET xMsg = 'ERROR: El espacio no existe';
        LEAVE del;
    END IF;

    DELETE FROM espacios WHERE idEspacio = xidEspacio;

    SET xMsg = 'ÉXITO: Espacio eliminado';
END del;


CREATE PROCEDURE crearSede(
    IN xnombre VARCHAR(40),
    IN xubicacion VARCHAR(100),
    IN xidEspacio INT,
    OUT xMsg VARCHAR(200)
)
crea: BEGIN
    -- Validaciones
    IF xnombre IS NULL OR xnombre = '' THEN
        SET xMsg = 'ERROR: El nombre no puede estar vacío';
        LEAVE crea;
    END IF;

    IF xubicacion IS NULL OR xubicacion = '' THEN
        SET xMsg = 'ERROR: La ubicación no puede estar vacía';
        LEAVE crea;
    END IF;

    IF xidEspacio IS NULL OR xidEspacio <= 0 THEN
        SET xMsg = 'ERROR: El idEspacio no es válido';
        LEAVE crea;
    END IF;

    -- Verificar que el espacio exista
    IF NOT EXISTS(SELECT 1 FROM espacios WHERE idEspacio = xidEspacio) THEN
        SET xMsg = 'ERROR: El espacio indicado no existe';
        LEAVE crea;
    END IF;

    -- Inserción
    INSERT INTO sedes(nombre, ubicacion, idEspacio)
    VALUES (xnombre, xubicacion, xidEspacio);

    SET xMsg = 'ÉXITO: Sede creada correctamente';
END crea//

CREATE PROCEDURE modificarSede(
    IN xidSede INT,
    IN xnombre VARCHAR(40),
    IN xubicacion VARCHAR(100),
    IN xidEspacio INT,
    OUT xMsg VARCHAR(200)
)
modi: BEGIN
    -- Validación básica del ID
    IF xidSede IS NULL OR xidSede <= 0 THEN
        SET xMsg = 'ERROR: El idSede no es válido';
        LEAVE modi;
    END IF;

    -- Verificar que la sede exista
    IF NOT EXISTS(SELECT 1 FROM sedes WHERE idSede = xidSede) THEN
        SET xMsg = 'ERROR: La sede indicada no existe';
        LEAVE modi;
    END IF;

    -- Validaciones de campos
    IF xnombre IS NULL OR xnombre = '' THEN
        SET xMsg = 'ERROR: El nombre no puede estar vacío';
        LEAVE modi;
    END IF;

    IF xubicacion IS NULL OR xubicacion = '' THEN
        SET xMsg = 'ERROR: La ubicación no puede estar vacía';
        LEAVE modi;
    END IF;

    IF xidEspacio IS NULL OR xidEspacio <= 0 THEN
        SET xMsg = 'ERROR: El idEspacio no es válido';
        LEAVE modi;
    END IF;

    -- Validar que el espacio exista
    IF NOT EXISTS(SELECT 1 FROM espacios WHERE idEspacio = xidEspacio) THEN
        SET xMsg = 'ERROR: El espacio indicado no existe';
        LEAVE modi;
    END IF;

    -- Actualización
    UPDATE sedes
    SET nombre = xnombre,
        ubicacion = xubicacion,
        idEspacio = xidEspacio
    WHERE idSede = xidSede;

    SET xMsg = 'ÉXITO: Sede modificada correctamente';
END modi//

CREATE PROCEDURE eliminarSede(
    IN xidSede INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidSede IS NULL OR xidSede <= 0 THEN
        SET xMsg = 'ERROR: El idSede no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM sedes WHERE idSede = xidSede) THEN
        SET xMsg = 'ERROR: La sede no existe';
        LEAVE del;
    END IF;

    DELETE FROM sedes WHERE idSede = xidSede;

    SET xMsg = 'ÉXITO: Sede eliminada';
END del;

CREATE PROCEDURE crearPersona(
    IN xnombre VARCHAR(100),
    IN xbio TEXT,
    IN ximg TEXT,
    OUT xMsg VARCHAR(200)
)
crea: BEGIN
    -- Validación
    IF xnombre IS NULL OR xnombre = '' THEN
        SET xMsg = 'ERROR: El nombre no puede estar vacío';
        LEAVE crea;
    END IF;

    INSERT INTO personas(nombre, biografia, imagen)
    VALUES (xnombre, xbio, ximg);

    SET xMsg = 'ÉXITO: Persona creada correctamente';
END crea//

CREATE PROCEDURE modificarPersona(
    IN xidPersona INT,
    IN xnombre VARCHAR(100),
    IN xbio TEXT,
    IN ximg TEXT,
    OUT xMsg VARCHAR(200)
)
modi: BEGIN
    -- Validar que exista
    IF NOT EXISTS (SELECT 1 FROM personas WHERE idPersona = xidPersona) THEN
        SET xMsg = 'ERROR: La persona no existe';
        LEAVE modi;
    END IF;

    -- Validación de nombre
    IF xnombre IS NULL OR xnombre = '' THEN
        SET xMsg = 'ERROR: El nombre no puede estar vacío';
        LEAVE modi;
    END IF;

    UPDATE personas
    SET nombre = xnombre,
        biografia = xbio, imagen = ximg
    WHERE idPersona = xidPersona;

    SET xMsg = 'ÉXITO: Persona modificada correctamente';
END modi//

CREATE PROCEDURE eliminarPersona(
    IN xidPersona INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidPersona IS NULL OR xidPersona <= 0 THEN
        SET xMsg = 'ERROR: El idPersona no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM personas WHERE idPersona = xidPersona) THEN
        SET xMsg = 'ERROR: La persona no existe';
        LEAVE del;
    END IF;

    DELETE FROM personas WHERE idPersona = xidPersona;

    SET xMsg = 'ÉXITO: Persona eliminada';
END del;

CREATE PROCEDURE crearRed(
    IN xred VARCHAR(40),
    OUT xMsg VARCHAR(200)
)
crea: BEGIN
    -- Validación: no vacío
    IF xred IS NULL OR xred = '' THEN
        SET xMsg = 'ERROR: El nombre de la red no puede estar vacío';
        LEAVE crea;
    END IF;

    -- Validación: nombre ya existe
    IF EXISTS (SELECT 1 FROM redes WHERE red = xred) THEN
        SET xMsg = 'ERROR: Ya existe una red con ese nombre';
        LEAVE crea;
    END IF;

    INSERT INTO redes(red)
    VALUES (xred);

    SET xMsg = 'ÉXITO: Red creada correctamente';
END crea//

CREATE PROCEDURE modificarRed(
    IN xidRed INT,
    IN xred VARCHAR(40),
    OUT xMsg VARCHAR(200)
)
modi: BEGIN
    -- Validación: existe el ID
    IF NOT EXISTS (SELECT 1 FROM redes WHERE idRed = xidRed) THEN
        SET xMsg = 'ERROR: La red no existe';
        LEAVE modi;
    END IF;

    -- Validación: nombre no vacío
    IF xred IS NULL OR xred = '' THEN
        SET xMsg = 'ERROR: El nombre de la red no puede estar vacío';
        LEAVE modi;
    END IF;

    -- Validación: nombre duplicado en otro ID
    IF EXISTS (
        SELECT 1 FROM redes 
        WHERE red = xred AND idRed <> xidRed
    ) THEN
        SET xMsg = 'ERROR: Ya existe otra red con ese nombre';
        LEAVE modi;
    END IF;

    UPDATE redes
    SET red = xred
    WHERE idRed = xidRed;

    SET xMsg = 'ÉXITO: Red actualizada correctamente';
END modi//

CREATE PROCEDURE eliminarRed(
    IN xidRed INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidRed IS NULL OR xidRed <= 0 THEN
        SET xMsg = 'ERROR: El idRed no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM redes WHERE idRed = xidRed) THEN
        SET xMsg = 'ERROR: La red no existe';
        LEAVE del;
    END IF;

    DELETE FROM redes WHERE idRed = xidRed;

    SET xMsg = 'ÉXITO: Red eliminada';
END del;

CREATE PROCEDURE crearRedPersona(
    IN xidPersona INT,
    IN xidRed INT,
    IN xenlace VARCHAR(100),
    OUT xMsg VARCHAR(200)
)
crea: BEGIN
    -- Validación: persona existe
    IF NOT EXISTS (SELECT 1 FROM personas WHERE idPersona = xidPersona) THEN
        SET xMsg = 'ERROR: La persona no existe';
        LEAVE crea;
    END IF;

    -- Validación: red existe
    IF NOT EXISTS (SELECT 1 FROM redes WHERE idRed = xidRed) THEN
        SET xMsg = 'ERROR: La red no existe';
        LEAVE crea;
    END IF;

    -- Validación: par (persona, red) ya registrado
    IF EXISTS (
        SELECT 1 
        FROM redesPersonas 
        WHERE idPersona = xidPersona AND idRed = xidRed
    ) THEN
        SET xMsg = 'ERROR: Ya existe esa relación persona-red';
        LEAVE crea;
    END IF;

    -- Validación: enlace único
    IF xenlace IS NOT NULL AND EXISTS (
        SELECT 1 FROM redesPersonas WHERE enlace = xenlace
    ) THEN
        SET xMsg = 'ERROR: El enlace ya está registrado por otra persona';
        LEAVE crea;
    END IF;

    INSERT INTO redesPersonas(idPersona, idRed, enlace)
    VALUES (xidPersona, xidRed, xenlace);

    SET xMsg = 'ÉXITO: Relación persona-red creada correctamente';
END crea//

CREATE PROCEDURE modificarRedPersona(
    IN xoldPersona INT,
    IN xoldRed INT,
    IN xidPersona INT,
    IN xidRed INT,
    IN xenlace VARCHAR(100),
    OUT xMsg VARCHAR(200)
)
modi: BEGIN
    -- Validación: registro original existe
    IF NOT EXISTS (
        SELECT 1 
        FROM redesPersonas 
        WHERE idPersona = xoldPersona AND idRed = xoldRed
    ) THEN
        SET xMsg = 'ERROR: La relación original persona-red no existe';
        LEAVE modi;
    END IF;

    -- Validación: persona nueva existe
    IF NOT EXISTS (SELECT 1 FROM personas WHERE idPersona = xidPersona) THEN
        SET xMsg = 'ERROR: La persona especificada no existe';
        LEAVE modi;
    END IF;

    -- Validación: red nueva existe
    IF NOT EXISTS (SELECT 1 FROM redes WHERE idRed = xidRed) THEN
        SET xMsg = 'ERROR: La red especificada no existe';
        LEAVE modi;
    END IF;

    -- Validación: nueva PK no esté ocupada por otro registro
    IF EXISTS (
        SELECT 1 
        FROM redesPersonas
        WHERE idPersona = xidPersona 
          AND idRed = xidRed
          AND NOT (idPersona = xoldPersona AND idRed = xoldRed)
    ) THEN
        SET xMsg = 'ERROR: Ya existe una relación con esos valores';
        LEAVE modi;
    END IF;

    -- Validación: enlace único
    IF xenlace IS NOT NULL AND EXISTS (
        SELECT 1 
        FROM redesPersonas 
        WHERE enlace = xenlace
        AND NOT (idPersona = xoldPersona AND idRed = xoldRed)
    ) THEN
        SET xMsg = 'ERROR: Ese enlace ya pertenece a otra persona';
        LEAVE modi;
    END IF;

    UPDATE redesPersonas
    SET idPersona = xidPersona,
        idRed     = xidRed,
        enlace    = xenlace
    WHERE idPersona = xoldPersona AND idRed = xoldRed;

    SET xMsg = 'ÉXITO: Relación persona-red modificada correctamente';
END modi //

CREATE PROCEDURE eliminarRedPersona(
    IN xidPersona INT,
    IN xidRed INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidPersona IS NULL OR xidPersona <= 0 THEN
        SET xMsg = 'ERROR: idPersona inválido';
        LEAVE del;
    END IF;

    IF xidRed IS NULL OR xidRed <= 0 THEN
        SET xMsg = 'ERROR: idRed inválido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(
        SELECT 1 FROM redesPersonas
        WHERE idPersona = xidPersona AND idRed = xidRed
    ) THEN
        SET xMsg = 'ERROR: La relación persona-red no existe';
        LEAVE del;
    END IF;

    DELETE FROM redesPersonas
    WHERE idPersona = xidPersona AND idRed = xidRed;

    SET xMsg = 'ÉXITO: Relación persona-red eliminada';
END del;

CREATE PROCEDURE crearTipoEvento(
    IN xtipoEvento VARCHAR(60),
    OUT xMsg VARCHAR(200)
)
crea: BEGIN
    
    -- Validación manual
    IF xtipoEvento IS NULL OR TRIM(xtipoEvento) = '' THEN
        SET xMsg = 'ERROR: El tipo de evento no puede estar vacío';
        LEAVE crea;
    END IF;

    -- Intento de inserción (si falla, MySQL lanzará error)
    INSERT INTO tipoEventos(tipoEvento)
    VALUES(xtipoEvento);

    SET xMsg = 'Éxito: Tipo de evento creado correctamente';

END crea //

CREATE PROCEDURE modificarTipoEvento(
    IN xidTipoEvento INT,
    IN xtipoEvento VARCHAR(60),
    OUT xMsg VARCHAR(200)
)
modi: BEGIN

    -- Validación: ID válido
    IF xidTipoEvento IS NULL OR xidTipoEvento <= 0 THEN
        SET xMsg = 'ERROR: El ID del tipo de evento no es válido';
        LEAVE modi;
    END IF;

    -- Validación del nombre
    IF xtipoEvento IS NULL OR TRIM(xtipoEvento) = '' THEN
        SET xMsg = 'ERROR: El tipo de evento no puede estar vacío';
        LEAVE modi;
    END IF;

    -- Validación: existe el registro
    IF NOT EXISTS(SELECT 1 FROM tipoEventos WHERE idTipoEvento = xidTipoEvento) THEN
        SET xMsg = 'ERROR: No existe un tipo de evento con ese ID';
        LEAVE modi;
    END IF;

    -- Actualización
    UPDATE tipoEventos
    SET tipoEvento = xtipoEvento
    WHERE idTipoEvento = xidTipoEvento;

    SET xMsg = 'Éxito: Tipo de evento modificado correctamente';

END modi //

CREATE PROCEDURE eliminarTipoEvento(
    IN xidTipoEvento INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidTipoEvento IS NULL OR xidTipoEvento <= 0 THEN
        SET xMsg = 'ERROR: El idTipoEvento no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM tipoEventos WHERE idTipoEvento = xidTipoEvento) THEN
        SET xMsg = 'ERROR: El tipo de evento no existe';
        LEAVE del;
    END IF;

    DELETE FROM tipoEventos WHERE idTipoEvento = xidTipoEvento;

    SET xMsg = 'ÉXITO: Tipo de evento eliminado';
END del;

CREATE PROCEDURE crearEvento(
    IN xtitulo VARCHAR(30),
    IN xsinopsis VARCHAR(200),
    IN xreqRegistro BOOLEAN,
    IN xparticipaPublico BOOLEAN,
    IN xdescripcion TEXT,
    IN xinfoAd TEXT,
    IN ximg TEXT,
    IN xidSede INT,
    IN xidTipoEvento INT,
    OUT xMsg VARCHAR(200)
)
crea: BEGIN

    -- Validación de título
    IF xtitulo IS NULL OR TRIM(xtitulo) = '' THEN
        SET xMsg = 'ERROR: El título no puede estar vacío';
        LEAVE crea;
    END IF;

    -- Validación de sinopsis
    IF xsinopsis IS NULL OR TRIM(xsinopsis) = '' THEN
        SET xMsg = 'ERROR: La sinopsis no puede estar vacía';
        LEAVE crea;
    END IF;

    -- Validación de sede
    IF xidSede IS NULL OR xidSede <= 0 THEN
        SET xMsg = 'ERROR: El ID de sede no es válido';
        LEAVE crea;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM sedes WHERE idSede = xidSede) THEN
        SET xMsg = 'ERROR: La sede indicada no existe';
        LEAVE crea;
    END IF;

    -- Validación de tipo de evento
    IF xidTipoEvento IS NULL OR xidTipoEvento <= 0 THEN
        SET xMsg = 'ERROR: El ID del tipo de evento no es válido';
        LEAVE crea;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM tipoEventos WHERE idTipoEvento = xidTipoEvento) THEN
        SET xMsg = 'ERROR: El tipo de evento indicado no existe';
        LEAVE crea;
    END IF;

    -- Inserción
    INSERT INTO eventos(
        titulo, sinopsis, reqRegistro, participaPublico,
        descripcion, infoAd, imagen, idSede, idTipoEvento
    )
    VALUES (
        xtitulo, xsinopsis, xreqRegistro, xparticipaPublico,
        xdescripcion, xinfoAd, ximg, xidSede, xidTipoEvento
    );

    SET xMsg = 'Éxito: Evento creado correctamente';

END crea //

CREATE PROCEDURE modificarEvento(
    IN xidEvento INT,
    IN xtitulo VARCHAR(30),
    IN xsinopsis VARCHAR(200),
    IN xreqRegistro BOOLEAN,
    IN xparticipaPublico BOOLEAN,
    IN xdescripcion TEXT,
    IN xinfoAd TEXT,
    IN ximg TEXT,
    IN xidSede INT,
    IN xidTipoEvento INT,
    OUT xMsg VARCHAR(200)
)
modi: BEGIN

    -- Validación ID evento
    IF xidEvento IS NULL OR xidEvento <= 0 THEN
        SET xMsg = 'ERROR: ID de evento no válido';
        LEAVE modi;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xidEvento) THEN
        SET xMsg = 'ERROR: No existe un evento con ese ID';
        LEAVE modi;
    END IF;

    -- Validación de título
    IF xtitulo IS NULL OR TRIM(xtitulo) = '' THEN
        SET xMsg = 'ERROR: El título no puede estar vacío';
        LEAVE modi;
    END IF;

    -- Validación de sinopsis
    IF xsinopsis IS NULL OR TRIM(xsinopsis) = '' THEN
        SET xMsg = 'ERROR: La sinopsis no puede estar vacía';
        LEAVE modi;
    END IF;

    -- Validación de sede
    IF NOT EXISTS(SELECT 1 FROM sedes WHERE idSede = xidSede) THEN
        SET xMsg = 'ERROR: La sede indicada no existe';
        LEAVE modi;
    END IF;

    -- Validación tipo de evento
    IF NOT EXISTS(SELECT 1 FROM tipoEventos WHERE idTipoEvento = xidTipoEvento) THEN
        SET xMsg = 'ERROR: El tipo de evento indicado no existe';
        LEAVE modi;
    END IF;

    -- Actualización
    UPDATE eventos
    SET 
        titulo = xtitulo,
        sinopsis = xsinopsis,
        reqRegistro = xreqRegistro,
        participaPublico = xparticipaPublico,
        descripcion = xdescripcion,
        infoAd = xinfoAd,
        imagen = ximg.
        idSede = xidSede,
        idTipoEvento = xidTipoEvento
    WHERE idEvento = xidEvento;

    SET xMsg = 'Éxito: Evento modificado correctamente';

END modi //

CREATE PROCEDURE eliminarEvento(
    IN xidEvento INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidEvento IS NULL OR xidEvento <= 0 THEN
        SET xMsg = 'ERROR: El idEvento no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xidEvento) THEN
        SET xMsg = 'ERROR: El evento no existe';
        LEAVE del;
    END IF;

    DELETE FROM eventos WHERE idEvento = xidEvento;

    SET xMsg = 'ÉXITO: Evento eliminado';
END del;

CREATE PROCEDURE crearRelEventoOrg(
    IN xidEvento INT,
    IN xidOrganizacion INT,
    OUT xMsg VARCHAR(200)
)
crea: BEGIN

    -- Validar evento
    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xidEvento) THEN
        SET xMsg = 'ERROR: El evento no existe';
        LEAVE crea;
    END IF;

    -- Validar organización
    IF NOT EXISTS(SELECT 1 FROM organizaciones WHERE idOrganizacion = xidOrganizacion) THEN
        SET xMsg = 'ERROR: La organización no existe';
        LEAVE crea;
    END IF;

    -- Verificar duplicado
    IF EXISTS(SELECT 1 FROM relEventoOrg 
              WHERE idEvento = xidEvento AND idOrganizacion = xidOrganizacion) THEN
        SET xMsg = 'ERROR: Esa relación ya existe';
        LEAVE crea;
    END IF;

    INSERT INTO relEventoOrg(idEvento, idOrganizacion)
    VALUES(xidEvento, xidOrganizacion);

    SET xMsg = 'Éxito: Relación evento-organización creada correctamente';

END crea //

CREATE PROCEDURE modificarRelEventoOrg(
    IN xOldEvento INT,
    IN xOldOrg INT,
    IN xNewEvento INT,
    IN xNewOrg INT,
    OUT xMsg VARCHAR(200)
)
modi: BEGIN

    -- Validar existencia de la relación actual
    IF NOT EXISTS(
        SELECT 1 FROM relEventoOrg 
        WHERE idEvento = xOldEvento AND idOrganizacion = xOldOrg
    ) THEN
        SET xMsg = 'ERROR: La relación original no existe';
        LEAVE modi;
    END IF;

    -- Validar nuevo evento
    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xNewEvento) THEN
        SET xMsg = 'ERROR: El nuevo evento no existe';
        LEAVE modi;
    END IF;

    -- Validar nueva organización
    IF NOT EXISTS(SELECT 1 FROM organizaciones WHERE idOrganizacion = xNewOrg) THEN
        SET xMsg = 'ERROR: La nueva organización no existe';
        LEAVE modi;
    END IF;

    -- Evitar duplicado
    IF EXISTS(
        SELECT 1 FROM relEventoOrg
        WHERE idEvento = xNewEvento AND idOrganizacion = xNewOrg
    ) THEN
        SET xMsg = 'ERROR: La nueva relación ya existe';
        LEAVE modi;
    END IF;

    UPDATE relEventoOrg
    SET idEvento = xNewEvento,
        idOrganizacion = xNewOrg
    WHERE idEvento = xOldEvento AND idOrganizacion = xOldOrg;

    SET xMsg = 'Éxito: Relación modificada correctamente';

END modi //

CREATE PROCEDURE eliminarRelEventoOrg(
    IN xidEvento INT,
    IN xidOrganizacion INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidEvento IS NULL OR xidEvento <= 0 THEN
        SET xMsg = 'ERROR: idEvento inválido';
        LEAVE del;
    END IF;

    IF xidOrganizacion IS NULL OR xidOrganizacion <= 0 THEN
        SET xMsg = 'ERROR: idOrganizacion inválido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(
        SELECT 1 FROM relEventoOrg
        WHERE idEvento = xidEvento AND idOrganizacion = xidOrganizacion
    ) THEN
        SET xMsg = 'ERROR: La relación evento-organización no existe';
        LEAVE del;
    END IF;

    DELETE FROM relEventoOrg
    WHERE idEvento = xidEvento AND idOrganizacion = xidOrganizacion;

    SET xMsg = 'ÉXITO: Relación evento-organización eliminada';
END del;

CREATE PROCEDURE crearEventoHorario(
    IN xidEvento INT,
    IN xfechaInicio DATETIME,
    IN xfechaFin DATETIME,
    OUT xMsg VARCHAR(200)
)
crea: BEGIN

    -- Validar evento
    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xidEvento) THEN
        SET xMsg = 'ERROR: El evento no existe';
        LEAVE crea;
    END IF;

    -- Validar fechas
    IF xfechaInicio >= xfechaFin THEN
        SET xMsg = 'ERROR: La fecha de inicio debe ser menor que la fecha de fin';
        LEAVE crea;
    END IF;

    INSERT INTO eventoHorario(idEvento, fechaInicio, fechaFin)
    VALUES(xidEvento, xfechaInicio, xfechaFin);

    SET xMsg = 'Éxito: Horario creado correctamente';

END crea //

CREATE PROCEDURE modificarEventoHorario(
    IN xidHorario INT,
    IN xidEvento INT,
    IN xfechaInicio DATETIME,
    IN xfechaFin DATETIME,
    OUT xMsg VARCHAR(200)
)
modi: BEGIN

    -- Validar horario existente
    IF NOT EXISTS(SELECT 1 FROM eventoHorario WHERE idHorario = xidHorario) THEN
        SET xMsg = 'ERROR: El horario no existe';
        LEAVE modi;
    END IF;

    -- Validar evento
    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xidEvento) THEN
        SET xMsg = 'ERROR: El evento no existe';
        LEAVE modi;
    END IF;

    -- Validar fechas
    IF xfechaInicio >= xfechaFin THEN
        SET xMsg = 'ERROR: La fecha de inicio debe ser menor que la fecha fin';
        LEAVE modi;
    END IF;

    UPDATE eventoHorario
    SET idEvento = xidEvento,
        fechaInicio = xfechaInicio,
        fechaFin = xfechaFin
    WHERE idHorario = xidHorario;

    SET xMsg = 'Éxito: Horario modificado correctamente';

END modi //

CREATE PROCEDURE eliminarHorarioEvento(
    IN xidHorario INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidHorario IS NULL OR xidHorario <= 0 THEN
        SET xMsg = 'ERROR: El idHorario no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM eventoHorario WHERE idHorario = xidHorario) THEN
        SET xMsg = 'ERROR: El horario no existe';
        LEAVE del;
    END IF;

    DELETE FROM eventoHorario WHERE idHorario = xidHorario;

    SET xMsg = 'ÉXITO: Horario eliminado';
END del;

CREATE PROCEDURE crearRol(
    IN xrol VARCHAR(50),
    OUT xMsg VARCHAR(200)
)
crea:BEGIN
    IF xrol IS NULL OR xrol = '' THEN
        SET xMsg = 'ERROR: El nombre del rol no puede estar vacío';
        LEAVE crea;
    END IF;

    -- Validar UNIQUE
    IF EXISTS(SELECT 1 FROM roles WHERE rol = xrol) THEN
        SET xMsg = 'ERROR: Ya existe un rol con ese nombre';
        LEAVE crea;
    END IF;

    INSERT INTO roles(rol)
    VALUES (xrol);

    SET xMsg = 'ÉXITO: Rol creado correctamente';
END crea//

CREATE PROCEDURE modificarRol(
    IN xidRol INT,
    IN xrol VARCHAR(50),
    OUT xMsg VARCHAR(200)
)
modi:BEGIN
    IF xidRol IS NULL OR xidRol <= 0 THEN
        SET xMsg = 'ERROR: idRol inválido';
        LEAVE modi;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM roles WHERE idRol = xidRol) THEN
        SET xMsg = 'ERROR: No existe un rol con ese idRol';
        LEAVE modi;
    END IF;

    IF xrol IS NULL OR xrol = '' THEN
        SET xMsg = 'ERROR: El nombre del rol no puede estar vacío';
        LEAVE modi;
    END IF;

    -- Validar UNIQUE al modificar (exceptuando el mismo rol)
    IF EXISTS(
        SELECT 1 FROM roles
        WHERE rol = xrol AND idRol <> xidRol
    ) THEN
        SET xMsg = 'ERROR: Ya existe otro rol con ese nombre';
        LEAVE modi;
    END IF;

    UPDATE roles
    SET rol = xrol
    WHERE idRol = xidRol;

    SET xMsg = 'ÉXITO: Rol modificado correctamente';
END modi//

CREATE PROCEDURE eliminarRol(
    IN xidRol INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidRol IS NULL OR xidRol <= 0 THEN
        SET xMsg = 'ERROR: El idRol no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM roles WHERE idRol = xidRol) THEN
        SET xMsg = 'ERROR: El rol no existe';
        LEAVE del;
    END IF;

    DELETE FROM roles WHERE idRol = xidRol;

    SET xMsg = 'ÉXITO: Rol eliminado';
END del;

CREATE PROCEDURE crearRelPersonaEvento(
    IN xidPersona INT,
    IN xidEvento INT,
    IN xidRol INT,
    OUT xMsg VARCHAR(200)
)
crea:BEGIN
    IF xidPersona IS NULL OR xidPersona <= 0 THEN
        SET xMsg = 'ERROR: idPersona inválido';
        LEAVE crea;
    END IF;

    IF xidEvento IS NULL OR xidEvento <= 0 THEN
        SET xMsg = 'ERROR: idEvento inválido';
        LEAVE crea;
    END IF;

    IF xidRol IS NULL OR xidRol <= 0 THEN
        SET xMsg = 'ERROR: idRol inválido';
        LEAVE crea;
    END IF;

    IF EXISTS(
        SELECT 1 FROM relPersonaEvento
        WHERE idPersona = xidPersona
          AND idEvento = xidEvento
          AND idRol = xidRol
    ) THEN
        SET xMsg = 'ERROR: Ya existe esa relación persona-evento-rol';
        LEAVE crea;
    END IF;

    INSERT INTO relPersonaEvento(idPersona, idEvento, idRol)
    VALUES (xidPersona, xidEvento, xidRol);

    SET xMsg = 'ÉXITO: Relación creada correctamente';
END crea//

CREATE PROCEDURE modificarRelPersonaEvento(
    IN xidPersona INT,
    IN xidEvento INT,
    IN xidRol INT,
    IN xNuevoIdPersona INT,
    IN xNuevoIdEvento INT,
    IN xNuevoIdRol INT,
    OUT xMsg VARCHAR(200)
)
modi:BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM relPersonaEvento
        WHERE idPersona = xidPersona
          AND idEvento = xidEvento
          AND idRol = xidRol
    ) THEN
        SET xMsg = 'ERROR: La relación original no existe';
        LEAVE modi;
    END IF;

    UPDATE relPersonaEvento
    SET idPersona = xNuevoIdPersona,
        idEvento = xNuevoIdEvento,
        idRol = xNuevoIdRol
    WHERE idPersona = xidPersona
      AND idEvento = xidEvento
      AND idRol = xidRol;

    SET xMsg = 'ÉXITO: Relación modificada correctamente';
END modi//

CREATE PROCEDURE eliminarRelPersonaEvento(
    IN xidPersona INT,
    IN xidEvento INT,
    IN xidRol INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM relPersonaEvento
        WHERE idPersona = xidPersona AND idEvento = xidEvento AND idRol = xidRol
    ) THEN
        SET xMsg = 'ERROR: La relación persona-evento-rol no existe';
        LEAVE del;
    END IF;

    DELETE FROM relPersonaEvento
    WHERE idPersona = xidPersona AND idEvento = xidEvento AND idRol = xidRol;

    SET xMsg = 'ÉXITO: Relación persona-evento-rol eliminada';
END del;

CREATE PROCEDURE crearLibros(
    IN xtitulo VARCHAR(40),
    IN xsinopsis VARCHAR(200),
    IN ximg TEXT,
    IN xidAutor INT,
    IN xidEditorial INT,
    OUT xMsg VARCHAR(200)
)
crea:BEGIN
    -- Validaciones básicas
    IF xtitulo IS NULL OR xtitulo = '' THEN
        SET xMsg = 'ERROR: El título no puede estar vacío';
        LEAVE crea;
    END IF;

    IF xidAutor IS NULL OR xidAutor <= 0 THEN
        SET xMsg = 'ERROR: idAutor inválido';
        LEAVE crea;
    END IF;

    IF xidEditorial IS NULL OR xidEditorial <= 0 THEN
        SET xMsg = 'ERROR: idEditorial inválido';
        LEAVE crea;
    END IF;

    -- Validar existencia de autor y editorial
    IF NOT EXISTS(SELECT 1 FROM personas WHERE idPersona = xidAutor) THEN
        SET xMsg = 'ERROR: No existe el autor';
        LEAVE crea;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM organizaciones WHERE idOrganizacion = xidEditorial) THEN
        SET xMsg = 'ERROR: No existe la editorial';
        LEAVE crea;
    END IF;

    INSERT INTO libros(titulo, sinopsis, imagen, idAutor, idEditorial)
    VALUES (xtitulo, xsinopsis, ximg, xidAutor, xidEditorial);

    SET xMsg = 'ÉXITO: Libro creado correctamente';
END crea//

CREATE PROCEDURE modificarLibros(
    IN xidLibro INT,
    IN xtitulo VARCHAR(40),
    IN xsinopsis VARCHAR(200),
    IN ximg TEXT,
    IN xidAutor INT,
    IN xidEditorial INT,
    OUT xMsg VARCHAR(200)
)
modi:BEGIN
    IF xidLibro IS NULL OR xidLibro <= 0 THEN
        SET xMsg = 'ERROR: idLibro inválido';
        LEAVE modi;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM libros WHERE idLibro = xidLibro) THEN
        SET xMsg = 'ERROR: No existe el libro';
        LEAVE modi;
    END IF;

    IF xtitulo IS NULL OR xtitulo = '' THEN
        SET xMsg = 'ERROR: El título no puede estar vacío';
        LEAVE modi;
    END IF;

    UPDATE libros
    SET titulo = xtitulo,
        sinopsis = xsinopsis,
        imagen = ximg,
        idAutor = xidAutor,
        idEditorial = xidEditorial
    WHERE idLibro = xidLibro;

    SET xMsg = 'ÉXITO: Libro modificado correctamente';
END modi//

CREATE PROCEDURE eliminarLibro(
    IN xidLibro INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidLibro IS NULL OR xidLibro <= 0 THEN
        SET xMsg = 'ERROR: El idLibro no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM libros WHERE idLibro = xidLibro) THEN
        SET xMsg = 'ERROR: El libro no existe';
        LEAVE del;
    END IF;

    DELETE FROM libros WHERE idLibro = xidLibro;

    SET xMsg = 'ÉXITO: Libro eliminado';
END del;

CREATE PROCEDURE crearPresEditorial(
    IN xidPresEditorial INT,
    OUT xMsg VARCHAR(200)
)
crea:BEGIN
    IF xidPresEditorial IS NULL OR xidPresEditorial <= 0 THEN
        SET xMsg = 'ERROR: idPresEditorial inválido';
        LEAVE crea;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xidPresEditorial) THEN
        SET xMsg = 'ERROR: No existe el evento';
        LEAVE crea;
    END IF;

    IF EXISTS(SELECT 1 FROM presEditorial WHERE idPresEditorial = xidPresEditorial) THEN
        SET xMsg = 'ERROR: Ya existe esta presEditorial';
        LEAVE crea;
    END IF;

    INSERT INTO presEditorial(idPresEditorial)
    VALUES (xidPresEditorial);

    SET xMsg = 'ÉXITO: presEditorial creada correctamente';
END crea//

CREATE PROCEDURE modificarPresEditorial(
    IN xidPresEditorial INT,
    IN xNuevoIdPresEditorial INT,
    OUT xMsg VARCHAR(200)
)
modi:BEGIN
    IF NOT EXISTS(SELECT 1 FROM presEditorial WHERE idPresEditorial = xidPresEditorial) THEN
        SET xMsg = 'ERROR: La presEditorial original no existe';
        LEAVE modi;
    END IF;

    IF xNuevoIdPresEditorial IS NULL OR xNuevoIdPresEditorial <= 0 THEN
        SET xMsg = 'ERROR: Nuevo idPresEditorial inválido';
        LEAVE modi;
    END IF;
    
    IF EXISTS(SELECT 1 FROM presEditorial WHERE idPresEditorial = xNuevoIdPresEditorial) THEN
        SET xMsg = 'ERROR: Ya existe esta presEditorial';
        LEAVE modi;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xNuevoIdPresEditorial) THEN
        SET xMsg = 'ERROR: No existe el evento nuevo';
        LEAVE modi;
    END IF;

    UPDATE presEditorial
    SET idPresEditorial = xNuevoIdPresEditorial
    WHERE idPresEditorial = xidPresEditorial;

    SET xMsg = 'ÉXITO: presEditorial modificada correctamente';
END modi//

CREATE PROCEDURE eliminarPresEditorial(
    IN xidPresEditorial INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidPresEditorial IS NULL OR xidPresEditorial <= 0 THEN
        SET xMsg = 'ERROR: El idPresEditorial no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM presEditorial WHERE idPresEditorial = xidPresEditorial) THEN
        SET xMsg = 'ERROR: La presEditorial no existe';
        LEAVE del;
    END IF;

    DELETE FROM presEditorial WHERE idPresEditorial = xidPresEditorial;

    SET xMsg = 'ÉXITO: presEditorial eliminada';
END del;

CREATE PROCEDURE crearRelLibroPres(
    IN xidLibro INT,
    IN xidPresEditorial INT,
    OUT xMsg VARCHAR(200)
)
crea:BEGIN
    -- Validaciones básicas
    IF xidLibro IS NULL OR xidLibro <= 0 THEN
        SET xMsg = 'ERROR: idLibro inválido';
        LEAVE crea;
    END IF;

    IF xidPresEditorial IS NULL OR xidPresEditorial <= 0 THEN
        SET xMsg = 'ERROR: idPresEditorial inválido';
        LEAVE crea;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM libros WHERE idLibro = xidLibro) THEN
        SET xMsg = 'ERROR: No existe el libro';
        LEAVE crea;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM presEditorial WHERE idPresEditorial = xidPresEditorial) THEN
        SET xMsg = 'ERROR: No existe la presEditorial';
        LEAVE crea;
    END IF;

    -- Validación: un libro no puede estar en dos presEditoriales del mismo evento
    IF EXISTS(
        SELECT 1
        FROM relLibroPres r
        JOIN presEditorial p ON r.idPresEditorial = p.idPresEditorial
        WHERE r.idLibro = xidLibro
          AND p.idPresEditorial IN (
              SELECT idPresEditorial
              FROM presEditorial
              WHERE idPresEditorial = xidPresEditorial
          )
    ) THEN
        SET xMsg = 'ERROR: El libro ya está vinculado a otra presEditorial del mismo evento';
        LEAVE crea;
    END IF;

    -- Validar que no exista la relación exacta
    IF EXISTS(SELECT 1 FROM relLibroPres WHERE idLibro = xidLibro AND idPresEditorial = xidPresEditorial) THEN
        SET xMsg = 'ERROR: Ya existe esta relación libro-presEditorial';
        LEAVE crea;
    END IF;

    INSERT INTO relLibroPres(idLibro, idPresEditorial)
    VALUES (xidLibro, xidPresEditorial);

    SET xMsg = 'ÉXITO: Relación libro-presEditorial creada correctamente';
END crea//

-- PROCEDIMIENTO PARA MODIFICAR RELLIBROPRES CON LA MISMA VALIDACIÓN
CREATE PROCEDURE modificarRelLibroPres(
    IN xidLibro INT,
    IN xidPresEditorial INT,
    IN xNuevoIdLibro INT,
    IN xNuevoIdPresEditorial INT,
    OUT xMsg VARCHAR(200)
)
modi:BEGIN
    -- Validar existencia de la relación original
    IF NOT EXISTS(SELECT 1 FROM relLibroPres WHERE idLibro = xidLibro AND idPresEditorial = xidPresEditorial) THEN
        SET xMsg = 'ERROR: La relación original no existe';
        LEAVE modi;
    END IF;

    -- Validación: un libro no puede estar en dos presEditoriales del mismo evento
    IF EXISTS(
        SELECT 1
        FROM relLibroPres r
        JOIN presEditorial p ON r.idPresEditorial = p.idPresEditorial
        WHERE r.idLibro = xNuevoIdLibro
          AND p.idPresEditorial IN (
              SELECT idPresEditorial
              FROM presEditorial
              WHERE idPresEditorial = xNuevoIdPresEditorial
          )
          AND NOT (r.idLibro = xidLibro AND r.idPresEditorial = xidPresEditorial)
    ) THEN
        SET xMsg = 'ERROR: El libro ya está vinculado a otra presEditorial del mismo evento';
        LEAVE modi;
    END IF;

    UPDATE relLibroPres
    SET idLibro = xNuevoIdLibro,
        idPresEditorial = xNuevoIdPresEditorial
    WHERE idLibro = xidLibro AND idPresEditorial = xidPresEditorial;

    SET xMsg = 'ÉXITO: Relación libro-presEditorial modificada correctamente';
END modi//

CREATE PROCEDURE eliminarRelLibroPres(
    IN xidLibro INT,
    IN xidPresEditorial INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF NOT EXISTS(
        SELECT 1 FROM relLibroPres
        WHERE idLibro = xidLibro AND idPresEditorial = xidPresEditorial
    ) THEN
        SET xMsg = 'ERROR: La relación libro-presEditorial no existe';
        LEAVE del;
    END IF;

    DELETE FROM relLibroPres
    WHERE idLibro = xidLibro AND idPresEditorial = xidPresEditorial;

    SET xMsg = 'ÉXITO: Relación libro-presEditorial eliminada';
END del;

CREATE PROCEDURE crearEventoMusical(
    IN xidMusical INT,
    IN xsetlist TEXT,
    OUT xMsg VARCHAR(200)
)
crea:BEGIN
    IF xidMusical IS NULL OR xidMusical <= 0 THEN
        SET xMsg = 'ERROR: idMusical inválido';
        LEAVE crea;
    END IF;

    IF xsetlist IS NULL OR xsetlist = '' THEN
        SET xMsg = 'ERROR: El setlist no puede estar vacío';
        LEAVE crea;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xidMusical) THEN
        SET xMsg = 'ERROR: No existe el evento';
        LEAVE crea;
    END IF;

    INSERT INTO eventoMusical(idMusical, setlist)
    VALUES (xidMusical, xsetlist);

    SET xMsg = 'ÉXITO: Evento musical creado correctamente';
END crea//

CREATE PROCEDURE modificarEventoMusical(
    IN xidMusical INT,
    IN xsetlist TEXT,
    OUT xMsg VARCHAR(200)
)
modi:BEGIN
    IF NOT EXISTS(SELECT 1 FROM eventoMusical WHERE idMusical = xidMusical) THEN
        SET xMsg = 'ERROR: No existe el evento musical';
        LEAVE modi;
    END IF;

    IF xsetlist IS NULL OR xsetlist = '' THEN
        SET xMsg = 'ERROR: El setlist no puede estar vacío';
        LEAVE modi;
    END IF;

    UPDATE eventoMusical
    SET setlist = xsetlist
    WHERE idMusical = xidMusical;

    SET xMsg = 'ÉXITO: Evento musical modificado correctamente';
END modi//

CREATE PROCEDURE eliminarEventoMusical(
    IN xidMusical INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidMusical IS NULL OR xidMusical <= 0 THEN
        SET xMsg = 'ERROR: El idMusical no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM eventoMusical WHERE idMusical = xidMusical) THEN
        SET xMsg = 'ERROR: El evento musical no existe';
        LEAVE del;
    END IF;

    DELETE FROM eventoMusical WHERE idMusical = xidMusical;

    SET xMsg = 'ÉXITO: Evento musical eliminado';
END del;

CREATE PROCEDURE crearTaller(
    IN xidTaller INT,
    IN xmateriales TEXT,
    IN xrangoEdad VARCHAR(10),
    OUT xMsg VARCHAR(200)
)
crea:BEGIN
    IF xidTaller IS NULL OR xidTaller <= 0 THEN
        SET xMsg = 'ERROR: idTaller inválido';
        LEAVE crea;
    END IF;

    IF xmateriales IS NULL OR xmateriales = '' THEN
        SET xMsg = 'ERROR: Los materiales no pueden estar vacíos';
        LEAVE crea;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xidTaller) THEN
        SET xMsg = 'ERROR: No existe el evento';
        LEAVE crea;
    END IF;

    INSERT INTO taller(idTaller, materiales, rangoEdad)
    VALUES (xidTaller, xmateriales, xrangoEdad);

    SET xMsg = 'ÉXITO: Taller creado correctamente';
END crea//

CREATE PROCEDURE modificarTaller(
    IN xidTaller INT,
    IN xmateriales TEXT,
    IN xrangoEdad VARCHAR(10),
    OUT xMsg VARCHAR(200)
)
modi:BEGIN
    IF NOT EXISTS(SELECT 1 FROM taller WHERE idTaller = xidTaller) THEN
        SET xMsg = 'ERROR: No existe el taller';
        LEAVE modi;
    END IF;

    IF xmateriales IS NULL OR xmateriales = '' THEN
        SET xMsg = 'ERROR: Los materiales no pueden estar vacíos';
        LEAVE modi;
    END IF;

    UPDATE taller
    SET materiales = xmateriales,
        rangoEdad = xrangoEdad
    WHERE idTaller = xidTaller;

    SET xMsg = 'ÉXITO: Taller modificado correctamente';
END modi//

CREATE PROCEDURE eliminarTaller(
    IN xidTaller INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidTaller IS NULL OR xidTaller <= 0 THEN
        SET xMsg = 'ERROR: El idTaller no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM taller WHERE idTaller = xidTaller) THEN
        SET xMsg = 'ERROR: El taller no existe';
        LEAVE del;
    END IF;

    DELETE FROM taller WHERE idTaller = xidTaller;

    SET xMsg = 'ÉXITO: Taller eliminado';
END del;

CREATE PROCEDURE crearPremiacion(
    IN xidPremiacion INT,
    IN xpremio VARCHAR(60),
    OUT xMsg VARCHAR(200)
)
crea:BEGIN
    IF xidPremiacion IS NULL OR xidPremiacion <= 0 THEN
        SET xMsg = 'ERROR: idPremiacion inválido';
        LEAVE crea;
    END IF;

    IF xpremio IS NULL OR xpremio = '' THEN
        SET xMsg = 'ERROR: El premio no puede estar vacío';
        LEAVE crea;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM eventos WHERE idEvento = xidPremiacion) THEN
        SET xMsg = 'ERROR: No existe el evento';
        LEAVE crea;
    END IF;

    INSERT INTO premiacion(idPremiacion, premio)
    VALUES (xidPremiacion, xpremio);

    SET xMsg = 'ÉXITO: Premiación creada correctamente';
END crea//

CREATE PROCEDURE modificarPremiacion(
    IN xidPremiacion INT,
    IN xpremio VARCHAR(60),
    OUT xMsg VARCHAR(200)
)
modi:BEGIN
    IF NOT EXISTS(SELECT 1 FROM premiacion WHERE idPremiacion = xidPremiacion) THEN
        SET xMsg = 'ERROR: No existe la premiación';
        LEAVE modi;
    END IF;

    IF xpremio IS NULL OR xpremio = '' THEN
        SET xMsg = 'ERROR: El premio no puede estar vacío';
        LEAVE modi;
    END IF;

    UPDATE premiacion
    SET premio = xpremio
    WHERE idPremiacion = xidPremiacion;

    SET xMsg = 'ÉXITO: Premiación modificada correctamente';
END modi//

CREATE PROCEDURE eliminarPremiacion(
    IN xidPremiacion INT,
    OUT xMsg VARCHAR(200)
)
del: BEGIN
    IF xidPremiacion IS NULL OR xidPremiacion <= 0 THEN
        SET xMsg = 'ERROR: El idPremiacion no es válido';
        LEAVE del;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM premiacion WHERE idPremiacion = xidPremiacion) THEN
        SET xMsg = 'ERROR: La premiación no existe';
        LEAVE del;
    END IF;

    DELETE FROM premiacion WHERE idPremiacion = xidPremiacion;

    SET xMsg = 'ÉXITO: Premiación eliminada';
END del;

DELIMITER ;