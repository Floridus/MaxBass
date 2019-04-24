# README #

**MaxBass**

Author: Weiss & Kulmer

### Projektbeschreibung ###

* Online-Videos zum Lernen von Musikinstrumenten
* Registrierung (Email-Versand zum Double Opt-In)
* Login
* Video-Upload

### Vorbereitung ###

* Starten sie zuerst den redis Datenbank-Server.
* Starten sie die server.js Datei mit folgendem Befehl (Port optional):
    node server.js [-PORT]
* Optional kann ein eigener Port verwendet werden.

### ToDo Tasks ###

* Aktivierung des Users
* Upload
* Seiten mit Inhalt befüllen (Impressum, Weekly Challenge, Tour Dates, usw.)

### Database Structure ###
**Sets**

+ users
    * user:1
    * user:2
    * ...
+ videos
    * video:1
    * video:2
    * ...

**Hashes**

+ user:1
    * id
    * name
    * email
	* password
    * ...
+ video:1
    * id
    * title
    * owner
    * ...
+ video:2
    * ...