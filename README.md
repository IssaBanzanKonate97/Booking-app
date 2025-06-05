# Installation
Après avoir cloner le projet, des installations sont nécessaires avant d'apporter des modifications au projet.

## 1. Installer les dépendances (Backend & Frontend)

À la racine du projet, où se trouve "index.js", on lance les commandes pour installer des dépendances back.

```bash
  npm install
```
à la fin de l'installation. Déplacez-vous dans le répertoire "client", qui contient la partie Frontend du projet. Puis exécutez la même commande.

```bash
  cd ./client
  npm install
```
Toutes les dépendances sont maintenant été installées et le projet prêt à être lancé.

## 2. Démarrer le serveur de développement (Backend)

Toujours dans le dossier racine où se trouve index.js, exécutez la commande suivante.

```bash
  npm run dev
```

Cette commande lancera automatiquement le serveur de développement sur le port 8080 (défini dans le code). Utile pour tester les fonctions du serveur avant la mise en production.
Note : Lancer cette commande servira les fichiers statiques présent dans le répertoire "./client/build" (Build du projet React).

## 3.  Démarrer le serveur de développement (Frontend)

Déplacez-vous dans le dossier "client", où se trouve le code React, et exécutez la commande suivante.

```bash
  npm run dev
```
Cette commande servira le projet React sur le port 3000. Cela permet d'avoir l'environnement de développement React avec le serveur de développement et le live reload.

#### Capture : les 2 serveurs de développement sont lancées.
![image](https://firebasestorage.googleapis.com/v0/b/sacred-vault-314109.appspot.com/o/terminal_gsp.png?alt=media&token=61e92ae1-ce11-48ff-b3da-aed18b8d5ca0)

## 4.  Préparer le projet pour la production

Une fois toutes les modifications terminées, il faudra mettre à jour les fichiers statiques de production. Pour cela, exécutez les commandes suivantes.

```bash
  cd ./client
  npm run build
```

Cette commande créera un dossier "build" à la racine du projet React. Ce dossier contient les fichiers statiques qui seront servis par le serveur Node.js lors de la mise en production sur CleverCloud.

## 5. Tester les mises à jour en local

Vous pouvez tester les mises à jour en local à l'aide de la commande suivante, à la racine du projet, où se trouve "./index.js"

```bash
  npm run start
```

Cette commande servira les fichiers statiques contenus dans le dossier "build" à la racine du projet React et démarrera le serveur Node.js sur le port 8080 (Comme expliqué précèdement).

# Déploiement
## 1. Configuration des clés SSH

[Voir la documentation CleverCloud pour les clés SSH](https://www.clever-cloud.com/doc/getting-started/ssh-keys)

## 2. Ajouter un URL de déploiement

Les points d'entrées étant déjà défini (dans le fichier package.json),  il ne reste plus qu'à ajouter l'URL de déploiement du projet. En tapant la commande suivante :
```bash
git remote add clever git+ssh://git@push-n2-par-clevercloud-customers.services.clever-cloud.com/app_a694a95a-be69-4f96-9e79-4afb8a3ad355.git
```
Note : Cette commande ne doit être éxecuté qu'une seule fois ! Vous pouvez vérifier si l'URL de déploiement est déjà défini dans le ".git" du projet en tapant la commande 
```bash
git remote -v
```
Le résultat escompté doit être quelque-chose du style :
```
clever  git+ssh://git@push-n2-par-clevercloud-customers.services.clever-cloud.com/app_a694a95a-be69-4f96-9e79-4afb8a3ad355.git (fetch)
clever  git+ssh://git@push-n2-par-clevercloud-customers.services.clever-cloud.com/app_a694a95a-be69-4f96-9e79-4afb8a3ad355.git (push)
origin  git@bitbucket.org:bilidjo/reactbooking.git (fetch)
origin  git@bitbucket.org:bilidjo/reactbooking.git (push)
```
Si c'est le cas, alors inutile de refaire cette étape. 

## 3. Déployer le projet en ligne

Une fois les étapes précédentes réalisées, on peut lancer le déploiement du projet. Pour cela, on lance la commande suivante à la racine du projet.

```bash
git push clever master
```
et au passage pousser toutes les modifications sur la repo Bitbucket, en exécutant la commande :
```bash
git push origin master
```

Note : Une fois le déploiement lancé, le projet sera accessible sur Internet.

# Synchronisation du code

## Synchroniser le code source

Si vous êtes plusieurs à travailler sur le projet, il est préférable de synchroniser le code source. Pour cela, exécutez la commande suivante à la racine du projet.

```bash
  git pull
```
Cette commande téléchargera les modifications faites par les autres collaborateurs.

## Synchroniser les nouvelles dépendances
Il est possible qu'un collaborateur ait ajouté des dépendances qu'il faudrait installer pour avoir le même environnement de développement. Pour cela, exécutez les commandes de l'étape 0 : "Installation".

# Variables d'environnement
Les variables du serveur, ne sont pas définies explicitement dans le code, ni dans le fichier .env.
Elles sont définies dans le dashboard de Clever Cloud, disponible ici : [Variables d'environnement - rdv.institutadios.com](https://console.clever-cloud.com/users/me/applications/app_a694a95a-be69-4f96-9e79-4afb8a3ad355/variables)

# Cloud Firestore (Base de données)
Toutes les réservations prises sont enregistrées sur le  Cloud Firestore. Pour consulter les réservations, il faut : [Se connecter à la console Firebase, de rdv institut adios](https://console.firebase.google.com/u/0/project/sacred-vault-314109/overview), avec le compte Google : support@institutadios.com, puis naviger vers "Firebase Database".
En effet, pour se projet Firebase est utilisé exclusivement utilisé pour enregistrer les réservations.

##  Écrit par
- [Ousmane](https://ousmanedev.fr)
- OpenAI 
salah

