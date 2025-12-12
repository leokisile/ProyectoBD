DROP DATABASE IF EXISTS	feriaLibro;
CREATE DATABASE feriaLibro;
USE feriaLibro;

CREATE TABLE organizaciones(
	idOrganizacion int auto_increment primary key,
    nombre varchar(100) not null,
    tel varchar(20) not null,
    correo varchar(100) not null,
    pagina varchar(100) default null,
    pais varchar(30) not null,
    estado varchar(40) not null,
    ciudad varchar(30) default null
);

CREATE TABLE espacios(
	idEspacio int auto_increment primary key,
    tipoEspacio varchar(60)
);

CREATE TABLE sedes(
	idSede int auto_increment primary key,
    nombre varchar(40) not null,
    ubicacion varchar(100) not null,
    idEspacio int not null,
    FOREIGN KEY (idEspacio) REFERENCES espacios(idEspacio)
    ON DELETE CASCADE ON UPDATE CASCADE
); 

CREATE TABLE personas(
	idPersona int auto_increment primary key,
    nombre varchar(100) not null,
    biografia text default null,
    imagen text default null
);

CREATE TABLE redes(
	idRed int auto_increment primary key,
    red varchar(40) UNIQUE
);

CREATE TABLE redesPersonas(
	idPersona int not null,
    idRed int not null,
    enlace varchar(100) UNIQUE,
    PRIMARY KEY(idPersona, idRed),
    FOREIGN KEY (idPersona) REFERENCES personas(idPersona) 
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idRed) REFERENCES redes(idRed)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE tipoEventos(
	idTipoEvento int auto_increment primary key,
    tipoEvento varchar(60) UNIQUE
);

CREATE TABLE eventos(
	idEvento int auto_increment primary key,
    titulo varchar(30) not null,
    sinopsis varchar(200) not null,
    reqRegistro boolean default 0,
    participaPublico boolean default 0,
    descripcion text default null,
    infoAd text default null,
    imagen text default null,
    idSede int not null,
    idTipoEvento int not null,
    FOREIGN KEY (idSede) references sedes(idSede)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idTipoEvento) references tipoEventos(idTipoEvento)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE relEventoOrg(
	idEvento int not null,
    idOrganizacion int not null,
    PRIMARY KEY(idEvento, idOrganizacion),
    FOREIGN KEY (idEvento) REFERENCES eventos(idEvento)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idOrganizacion) REFERENCES organizaciones(idOrganizacion)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE eventoHorario(
	idHorario int auto_increment primary key,
    idEvento int not null,
    fechaInicio datetime not null,
    fechaFin datetime not null,
    FOREIGN KEY (idEvento) REFERENCES eventos(idEvento)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE roles(
	idRol int auto_increment primary key,
    rol varchar(50) UNIQUE
);

CREATE TABLE relPersonaEvento(
	idPersona int not null,
    idEvento int not null,
    idRol int not null,
    PRIMARY KEY (idPersona, idEvento, idRol),
    FOREIGN KEY (idPersona) REFERENCES personas(idPersona)
    ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (idEvento) REFERENCES eventos(idEvento)
    ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (idRol) REFERENCES roles(idRol)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE libros(
	idLibro int auto_increment primary key,
    titulo varchar(40),
    sinopsis varchar(200),
    imagen text default null,
    idAutor int not null,
    idEditorial int not null,
    FOREIGN KEY (idAutor) REFERENCES personas(idPersona)
    ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (idEditorial) REFERENCES organizaciones(idOrganizacion)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE presEditorial(
	idPresEditorial int primary key,
    FOREIGN KEY (idPresEditorial) REFERENCES eventos(idEvento)
);

CREATE TABLE relLibroPres(
	idLibro int not null,
    idPresEditorial int not null,
    PRIMARY KEY(idLibro, idPresEditorial),
    FOREIGN KEY (idLibro) REFERENCES libros(idLibro)
    ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (idPresEditorial) REFERENCES presEditorial(idPresEditorial)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE eventoMusical(
	idMusical int primary key,
    setlist text not null,
    FOREIGN KEY (idMusical) REFERENCES eventos(idEvento)
);

CREATE TABLE taller(
	idTaller int primary key,
    materiales text not null,
    rangoEdad varchar(10),
    FOREIGN KEY (idTaller) REFERENCES eventos(idEvento)
);

CREATE TABLE premiacion(
	idPremiacion int primary key,
    premio varchar(60) not null,
    FOREIGN KEY (idPremiacion) REFERENCES eventos(idEvento)
);