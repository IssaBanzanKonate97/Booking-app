*  Ce fichier contient les informations des cabinets répertoriés par l'app, pour une zone géographique
*  Pour créer un nouveau cabinet, il suffit d'ajouter un OBJET ENTIER avec toutes les informations
*  nécessaires (laisser à null, si aucune valeur possible), avec les champs suivants :
*  {id, name, city, address, latitude, longitude, accessMethods, parkingAccess, othersInfos (pour Acuity) },

*  Il est important de bien accorder les propriétés "path", qui permet de définir la zone géographique du cabinet et de garantir un résolution correcte des données
* ex: /fr/institut-adios/nord-ouest > pour les cabinets du "Nord-Ouest" en France.
* ex: /ch/institut-adios/suisse > pour les cabinets en Suisse.

*  Idem pour la propriété "pathId", utilisée pour l'ordre d'affichage des cabinets dans la liste et le système de recherche de cabinet.
*  "latitude" et "longitude" permettent de définir la position du cabinet sur la carte.
*  "accessMethods" permet de définir les moyens d'accès au cabinet (ex: "Métro", "Bus", "Tramway", "Voiture", "Vélo", "A pied").
*  "parkingAccess" permet de définir si le cabinet dispose d'un parking ou non à proximité, et si oui, de le préciser. ex: "à 500m".
*  "othersInfos" permet de définir d'autres informations utiles au cabinet, comme par exemple, les horaires d'ouverture.
*  "geoZoneName" permettra de définir le nom d'une zone géographique, pour l'affichage dans la liste des cabinets.
*  "weekEndAvailability" permet de définir si le cabinet est ouvert le week-end.
*  "imageUri" permet de définir l'URL de l'image du cabinet (si elle existe elle sera affichée).
*  "advancedKeywords" permet de définir des mots clés avancés pour la recherche du cabinet (ex: "rennes", "35", "bretagne"), peut aider à la recherche.
*  "country" permet de définir le code ISO 3166-1 alpha-2 du pays (https://fr.wikipedia.org/wiki/ISO_3166-1_alpha-2)
*  "phone" (OBJECT) permet de définir le numéro de téléphone du cabinet, avec la propriété "number" (STRING), à utiliser avec le tableau "phones" ci-dessous.
*  "appointementTypeId" permet de définir le type de rendez-vous à prendre pour le cabinet, avec Acuity.
*  "calendarId" permet de définir le calendrier à utiliser.
*  "praticienCalendarId" permet de définir le calendrier du praticien à utiliser.
*  "praticienAppointmentTypeId" le champ ne pouvant être exclu, il doit contenir un type de rendez-vous pour lequel le calendrier du praticien est inclu.

* Pour chaque nouveau pays, il faut ajouter un objet dans le tableau "countriesDepthOfCoverage" avec les propriétés suivantes :
* { code, name, depthOfCoverage }
* Le code est le code ISO 3166-1 alpha-2 du pays (https://fr.wikipedia.org/wiki/ISO_3166-1_alpha-2)
* Le nom est le nom du pays
* La profondeur de couverture est un nombre entier qui définit le niveau de profondeur de couverture du pays
* 1 = le pays n'a pas de zones géographiques, donc l'app va récupérer le nom du pays en tant que titre
* 2 = le pays a des zones géographiques, donc l'app va récupérer le nom de la zone géographique en tant que titre