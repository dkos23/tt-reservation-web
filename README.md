# Table Tennis Court Reservation System

**Dieses Projekt befindet sich noch in der Entwicklung.**

*React SPA, PostgreSQL*

*License: AGPL*

Modern, open source tennis court reservation system that works on any cheap web-hosting plan. *GDPR compliant*

## Languages / Sprachen

* [x] German / Deutsch
* [ ] English (planned)

&nbsp;

---
---

## Features

* GDPR compliant
* // todo

## System requirements

* express-Server
* PostgreSQL Database

&nbsp;

# Developer Notes

## notes

* Keine reservation reminder, Reservierungsbestätigungen sind ausreichend
* Keine Reservierungsbestätigungen an admins (unnötig)
* Storniert: wenn selbst storniert und wenn durch admin storniert
* loading indicator ggf mit antd message ersetzen

## todos

* [ ] Analytics
  * [ ] backend: create fingerprint by header + ip, change daily
  * [x] mark user count as predicted
  * [ ] count users
  * [x] configurable time view
  * [x] stats
    * [x] New reservation count
    * [x] reservation count
    * [x] views by page
    * [x] unique users / page views
    * [x] referrer
    * [x] browser
    * [x] os
    * [x] device
* [ ] .htaccess for client side routing
* [ ] password recovery
* [ ] test mail template button
* [x] bestehende reservierungen bei platzsperre stornieren (hinweis)
  * [ ] implementation
* [ ] datenschutz buttons unter mein benutzerkonto implementieren
* [ ] activity table backend
* [ ] trainer type
* [ ] bug: DST where day has two hours, reservation is not visible
* [ ] automatische Anzeigenamen generieren (z.B. GastXXX)
* [ ] Anzeigename/Guthaben in Navigationsleiste anzeigen (personaisieren) 
* [ ] Dynamic page Title (React helmet? or SSR)

### tables

reservations
{
  id auto_inc unique primary,
  from,
  to,
  groupId foreign_key(reservation_group.groupId),
  created,
}

reservation_group
{
  groupId auto_inc unique primary,
  courtId,
  userId,
  text,
  type,
}
