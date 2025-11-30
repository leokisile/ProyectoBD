-- =============================================================
--                         VISTAS Y CONSULTAS
-- =============================================================
DROP VIEW IF EXISTS programaGeneral;
CREATE VIEW programaGeneral AS
SELECT 
	te.tipoEvento,
	e.titulo,
	GROUP_CONCAT(o.nombre SEPARATOR ', ') AS organizaciones,
	DATE(fechaInicio),
	time(fechaInicio),
	DATE(fechaFin),
	time(fechaFin) 
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
--                           PROCEDIMIENTOS ALMACENADOS
-- ===============================================================================
DROP PROCEDURE IF EXISTS eventoCategoria;

DELIMITER //
CREATE PROCEDURE eventoCategoria (
    IN xidTipoEvento INT, 
    IN xfechaInicio DATETIME
)
BEGIN
    IF xfechaInicio IS NULL THEN
        SELECT -- Fecha no especificada
            e.titulo,
            GROUP_CONCAT(
                CASE WHEN pe.idRol != 3 THEN p.nombre END
                SEPARATOR ', '
            ) AS participantes,
            GROUP_CONCAT(
                CASE WHEN pe.idRol = 3 THEN p.nombre END
                SEPARATOR ', '
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

    ELSE -- Fecha especificada
        SELECT 
            e.titulo,
            GROUP_CONCAT(
                CASE WHEN pe.idRol != 3 THEN p.nombre END
                SEPARATOR ', '
            ) AS participantes,
            GROUP_CONCAT(
                CASE WHEN pe.idRol = 3 THEN p.nombre END
                SEPARATOR ', '
            ) AS presentadores,
            s.nombre AS sede,
            e.descripcion
        FROM eventos e
            INNER JOIN relPersonaEvento pe ON pe.idEvento = e.idEvento
            INNER JOIN personas p ON p.idPersona = pe.idPersona
            INNER JOIN sedes s ON s.idSede = e.idSede
            INNER JOIN eventoHorario eh ON eh.idEvento = e.idEvento
        WHERE e.idTipoEvento = xidTipoEvento AND DATE(eh.fechaInicio) = DATE(xfechaInicio)
        GROUP BY e.idEvento, s.nombre, e.descripcion, eh.fechaInicio, eh.fechaFin
        ORDER BY fechaInicio, fechaFin;

    END IF;
END//

CREATE PROCEDURE eventoIndv (IN xidEvento INT)
BEGIN
	SELECT 
		e.titulo,
		GROUP_CONCAT(
			CASE WHEN pe.idRol != 3 THEN CONCAT(p.nombre, ": ", p.biografia) END
			SEPARATOR '\n '
		) AS participantes,
		GROUP_CONCAT(
			CASE WHEN pe.idRol = 3 THEN p.nombre END
			SEPARATOR ', '
		) AS presentadores,
		s.nombre AS sede,
		e.sinopsis,
		e.descripcion,
		e.infoAd,
		e.reqRegistro,
		e.participaPublico
	FROM eventos e
		INNER JOIN relPersonaEvento pe ON pe.idEvento = e.idEvento
		INNER JOIN personas p ON p.idPersona = pe.idPersona
		INNER JOIN sedes s ON s.idSede = e.idSede
		INNER JOIN eventoHorario eh ON eh.idEvento = e.idEvento
	WHERE e.idEvento = xidEvento
        GROUP BY e.idEvento, s.nombre, e.descripcion, eh.fechaInicio, eh.fechaFin
        ORDER BY fechaInicio, fechaFin;
END //
DELIMITER ;

-- Seleccionar todos los eventos de una categoría y fecha especifica
CALL eventoCategoria(1, "2025-04-20");  -- Entrada: idTipoEvento y fecha (YYYY-MM-DD) deseado (passar en el llamado en web)
CALL eventoCategoria(1, null);

CALL eventoIndv(2); -- Información de un solo evento mediante su idEvento

select * from eventos;
select * from organizaciones;
select * from eventoHorario;
select * from personas;
select * from relEventoOrg;
select * from roles; -- 3 Presentador
select * from relPersonaEvento;
select * from sedes;
select * from tipoEventos;