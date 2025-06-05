Le fichier ./SERVER_account_key.json, contient les accès aux services Firebase pour le projet (rdv institutadios com).
Le projet n'utilise plus de fonctions Cloud 'Cloud Functions', mais uniquement la base de donnée 'Cloud Firestore', les fonctions étant remplacées des fonctions introduites dans le fichier 'index.js' à la racine du projet.

Cette base de données étant fermée. Il est donc nécéssaire de fournir les accès au serveur 'index.js' à la racine du projet,
pour qu'il puisse se connecter à la base de données, récupérer les données et en écrire de nouvelles (réservations pour acuity, etc...)
à l'aide du Firebase Admin SDK (https://firebase.google.com/docs/admin/setup?hl=fr). 
Qui est un SDK pour Node.js et donc une dépendance du projet.