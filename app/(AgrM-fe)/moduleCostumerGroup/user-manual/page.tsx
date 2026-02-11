'use client';

import { useState } from 'react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';

function UserManualComponent() {
    const [activeIndex, setActiveIndex] = useState<number | number[] | null>(0);

    return (
        <div className="card">
            <div className="flex align-items-center gap-3 mb-4">
                <i className="pi pi-book text-4xl text-primary"></i>
                <div>
                    <h2 className="m-0 text-primary">Manuel d'Utilisation</h2>
                    <p className="m-0 text-500">Système AgrM - Gestion Clients, Groupes Solidaires et Produits Financiers</p>
                </div>
            </div>

            <Divider />

            {/* Overview Section */}
            <Card className="mb-4">
                <h4 className="text-primary mt-0">
                    <i className="pi pi-info-circle mr-2"></i>
                    Vue d'Ensemble du Système
                </h4>
                <p>
                    Le système AgrM est une plateforme complète de gestion pour les institutions de microfinance.
                    Il permet de gérer efficacement :
                </p>
                <ul className="line-height-3">
                    <li><strong>Les Clients Individuels :</strong> Personnes physiques avec leurs informations personnelles, documents d'identité et coordonnées.</li>
                    <li><strong>Les Clients Entreprises :</strong> Personnes morales avec leurs informations d'entreprise et documents légaux.</li>
                    <li><strong>Les Groupes Solidaires :</strong> Associations de clients pour le crédit solidaire avec gestion des membres et réunions.</li>
                    <li><strong>Les Produits Financiers :</strong> Configuration des produits de crédit, gestion des demandes, évaluation des risques et suivi des prêts actifs.</li>
                    <li><strong>Le Module Épargne :</strong> Gestion des livrets d'épargne, dépôts à terme, tontine et épargne obligatoire.</li>
                    <li><strong>Le Module Crédit :</strong> Cycle complet de gestion des demandes de crédit avec analyse financière, visites terrain, comité et décaissement.</li>
                    <li><strong>Les Données de Référence :</strong> Configuration des listes de valeurs utilisées dans le système.</li>
                </ul>
            </Card>

            {/* Main Documentation */}
            <Accordion activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                {/* Client Management */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-users"></i>
                            <span className="font-bold">1. Gestion des Clients</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">1.1 Création d'un Nouveau Client</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Étapes :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Clients" /> puis cliquer sur l'onglet <Tag value="Nouveau Client" severity="info" /></li>
                                <li>Sélectionner le type de client :
                                    <ul>
                                        <li><strong>Individuel :</strong> Pour les personnes physiques</li>
                                        <li><strong>Entreprise :</strong> Pour les personnes morales</li>
                                    </ul>
                                </li>
                                <li>Remplir les informations obligatoires (marquées par <span className="text-red-500">*</span>) :
                                    <ul>
                                        <li>Nom et Prénom (pour individuel) ou Nom de l'entreprise</li>
                                        <li>Téléphone principal</li>
                                        <li>Agence de rattachement</li>
                                        <li>Province et Commune de résidence</li>
                                    </ul>
                                </li>
                                <li>Compléter les informations optionnelles selon disponibilité</li>
                                <li>Cliquer sur <Tag value="Enregistrer" severity="success" /> pour sauvegarder</li>
                            </ol>
                        </div>

                        <h5 className="text-primary">1.2 Types de Clients</h5>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="text-blue-500 mt-0">
                                        <i className="pi pi-user mr-2"></i>
                                        Client Individuel
                                    </h6>
                                    <p>Informations requises :</p>
                                    <ul>
                                        <li>Nom, Prénom</li>
                                        <li>Date et lieu de naissance</li>
                                        <li>Genre, Nationalité</li>
                                        <li>Document d'identité</li>
                                        <li>État civil</li>
                                        <li>Profession et revenus</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="text-green-500 mt-0">
                                        <i className="pi pi-building mr-2"></i>
                                        Client Entreprise
                                    </h6>
                                    <p>Informations requises :</p>
                                    <ul>
                                        <li>Nom de l'entreprise</li>
                                        <li>Numéro RCCM</li>
                                        <li>Type d'entreprise</li>
                                        <li>Date de création</li>
                                        <li>Secteur d'activité</li>
                                        <li>Représentant légal</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary mt-4">1.3 Recherche et Consultation</h5>
                        <div className="surface-100 p-3 border-round">
                            <p>Dans l'onglet <Tag value="Liste des Clients" severity="info" />, vous pouvez :</p>
                            <ul className="line-height-3">
                                <li><strong>Rechercher :</strong> Utilisez la barre de recherche pour trouver un client par nom, numéro ou téléphone</li>
                                <li><strong>Consulter :</strong> Cliquez sur l'icone <i className="pi pi-eye text-blue-500"></i> pour voir les détails</li>
                                <li><strong>Modifier :</strong> Cliquez sur l'icone <i className="pi pi-pencil text-orange-500"></i> pour éditer</li>
                                <li><strong>Supprimer :</strong> Cliquez sur l'icone <i className="pi pi-trash text-red-500"></i> pour archiver</li>
                            </ul>
                        </div>

                        <h5 className="text-primary mt-4">1.4 Statuts des Clients</h5>
                        <div className="flex flex-wrap gap-2">
                            <Tag value="Prospect" severity="info" />
                            <Tag value="En attente" severity="warning" />
                            <Tag value="Actif" severity="success" />
                            <Tag value="Inactif" />
                            <Tag value="Liste noire" severity="danger" />
                        </div>
                        <p className="mt-2 text-sm">
                            Les statuts permettent de suivre le cycle de vie du client depuis sa prospection jusqu'à son activation ou désactivation.
                        </p>
                    </div>
                </AccordionTab>

                {/* Solidarity Group Management */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-sitemap"></i>
                            <span className="font-bold">2. Gestion des Groupes Solidaires</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">2.1 Création d'un Groupe</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Étapes :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Groupes Solidaires" /></li>
                                <li>Cliquer sur l'onglet <Tag value="Nouveau Groupe" severity="info" /></li>
                                <li>Remplir les informations du groupe :
                                    <ul>
                                        <li>Nom du groupe</li>
                                        <li>Type de groupe</li>
                                        <li>Date de formation</li>
                                        <li>Agence de rattachement</li>
                                        <li>Localisation (Province, Commune, Zone)</li>
                                    </ul>
                                </li>
                                <li>Configurer le calendrier des réunions :
                                    <ul>
                                        <li>Fréquence (Hebdomadaire, Bimensuel, Mensuel)</li>
                                        <li>Jour et heure de réunion</li>
                                        <li>Lieu de réunion</li>
                                    </ul>
                                </li>
                                <li>Définir les paramètres financiers :
                                    <ul>
                                        <li>Frais d'adhésion</li>
                                        <li>Objectif d'épargne</li>
                                        <li>Type et montant de garantie</li>
                                    </ul>
                                </li>
                                <li>Cliquer sur <Tag value="Enregistrer" severity="success" /></li>
                            </ol>
                        </div>

                        <h5 className="text-primary">2.2 Gestion des Membres</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Pour ajouter des membres :</strong></p>
                            <ol className="line-height-3">
                                <li>Dans la liste des groupes, cliquer sur l'icone <i className="pi pi-users text-purple-500"></i></li>
                                <li>Cliquer sur <Tag value="Ajouter un Membre" severity="info" /></li>
                                <li>Sélectionner le client dans la liste</li>
                                <li>Attribuer un rôle (Membre, Président, Secrétaire, Trésorier, etc.)</li>
                                <li>Définir la contribution aux parts</li>
                                <li>Valider l'ajout</li>
                            </ol>

                            <p className="mt-3"><strong>Rôles disponibles :</strong></p>
                            <ul>
                                <li><strong>Président :</strong> Dirige les réunions et représente le groupe</li>
                                <li><strong>Secrétaire :</strong> Tient les procès-verbaux et documents</li>
                                <li><strong>Trésorier :</strong> Gère les fonds et cotisations</li>
                                <li><strong>Membre :</strong> Participant standard</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">2.3 Cycle de Vie d'un Groupe</h5>
                        <div className="flex flex-wrap gap-2 align-items-center">
                            <Tag value="En Formation" severity="info" />
                            <i className="pi pi-arrow-right"></i>
                            <Tag value="En Attente" severity="warning" />
                            <i className="pi pi-arrow-right"></i>
                            <Tag value="Actif" severity="success" />
                            <i className="pi pi-arrow-right"></i>
                            <Tag value="Suspendu/Dissous" severity="danger" />
                        </div>
                        <div className="mt-3">
                            <ul className="line-height-3">
                                <li><strong>En Formation :</strong> Groupe en cours de constitution (recrutement des membres)</li>
                                <li><strong>En Attente :</strong> Groupe soumis pour approbation</li>
                                <li><strong>Actif :</strong> Groupe approuvé et opérationnel</li>
                                <li><strong>Suspendu :</strong> Groupe temporairement inactif</li>
                                <li><strong>Dissous :</strong> Groupe définitivement fermé</li>
                            </ul>
                        </div>

                        <h5 className="text-primary mt-4">2.4 Approbation d'un Groupe</h5>
                        <div className="surface-100 p-3 border-round">
                            <p>Pour approuver un groupe en attente :</p>
                            <ol>
                                <li>Vérifier que le groupe a le nombre minimum de membres requis</li>
                                <li>Vérifier les documents et informations</li>
                                <li>Cliquer sur l'icone <i className="pi pi-check text-green-500"></i> (Approuver)</li>
                                <li>Confirmer l'approbation</li>
                            </ol>
                        </div>
                    </div>
                </AccordionTab>

                {/* Reference Data */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-database"></i>
                            <span className="font-bold">3. Données de Référence</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">3.1 Catégories Disponibles</h5>
                        <div className="grid">
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-map mr-2"></i>Localisation</h6>
                                    <ul>
                                        <li>Provinces</li>
                                        <li>Communes</li>
                                        <li>Zones</li>
                                        <li>Collines</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-user mr-2"></i>Identification</h6>
                                    <ul>
                                        <li>Nationalités</li>
                                        <li>Types de documents</li>
                                        <li>États civils</li>
                                        <li>Niveaux d'études</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-briefcase mr-2"></i>Classification</h6>
                                    <ul>
                                        <li>Secteurs d'activité</li>
                                        <li>Catégories client</li>
                                        <li>Types d'habitation</li>
                                        <li>Types de garanties</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-sitemap mr-2"></i>Groupes</h6>
                                    <ul>
                                        <li>Types de groupes</li>
                                        <li>Rôles de groupe</li>
                                        <li>Types de relations</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-building mr-2"></i>Organisation</h6>
                                    <ul>
                                        <li>Agences</li>
                                        <li>Types documents KYC</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary mt-4">3.2 Gestion des Données de Référence</h5>
                        <div className="surface-100 p-3 border-round">
                            <p><strong>Pour ajouter une nouvelle valeur :</strong></p>
                            <ol className="line-height-3">
                                <li>Sélectionner la catégorie souhaitée</li>
                                <li>Cliquer sur <Tag value="Nouveau" severity="info" /></li>
                                <li>Remplir le code et le nom (obligatoires)</li>
                                <li>Ajouter une description si nécessaire</li>
                                <li>Définir le statut (Actif/Inactif)</li>
                                <li>Enregistrer</li>
                            </ol>

                            <p className="mt-3"><strong>Important :</strong></p>
                            <ul>
                                <li>Le code doit être unique pour chaque catégorie</li>
                                <li>Seules les valeurs actives apparaissent dans les listes déroulantes</li>
                                <li>Désactiver plutot que supprimer pour conserver l'historique</li>
                            </ul>
                        </div>
                    </div>
                </AccordionTab>

                {/* Tips and Best Practices */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-lightbulb"></i>
                            <span className="font-bold">4. Conseils et Bonnes Pratiques</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">4.1 Saisie des Données</h5>
                        <ul className="line-height-3">
                            <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier les informations avant enregistrement</li>
                            <li><i className="pi pi-check text-green-500 mr-2"></i>Utiliser les champs de recherche pour éviter les doublons</li>
                            <li><i className="pi pi-check text-green-500 mr-2"></i>Remplir tous les champs obligatoires</li>
                            <li><i className="pi pi-check text-green-500 mr-2"></i>Utiliser des numéros de téléphone valides</li>
                        </ul>

                        <h5 className="text-primary">4.2 Gestion des Groupes</h5>
                        <ul className="line-height-3">
                            <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier que tous les membres sont des clients enregistrés</li>
                            <li><i className="pi pi-check text-green-500 mr-2"></i>Attribuer les rôles exécutifs avant l'approbation</li>
                            <li><i className="pi pi-check text-green-500 mr-2"></i>Définir un calendrier de réunion réaliste</li>
                            <li><i className="pi pi-check text-green-500 mr-2"></i>Documenter les raisons de tout changement de statut</li>
                        </ul>

                        <h5 className="text-primary">4.3 Sécurité</h5>
                        <ul className="line-height-3">
                            <li><i className="pi pi-shield text-blue-500 mr-2"></i>Ne jamais partager vos identifiants</li>
                            <li><i className="pi pi-shield text-blue-500 mr-2"></i>Se déconnecter après chaque session</li>
                            <li><i className="pi pi-shield text-blue-500 mr-2"></i>Signaler toute activité suspecte</li>
                        </ul>
                    </div>
                </AccordionTab>

                {/* Glossary */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-book"></i>
                            <span className="font-bold">5. Glossaire</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <h6 className="text-primary">Termes Généraux</h6>
                                <ul className="line-height-3">
                                    <li><strong>Client :</strong> Personne physique ou morale utilisatrice des services</li>
                                    <li><strong>Groupe Solidaire :</strong> Association de clients pour le crédit mutuel</li>
                                    <li><strong>KYC :</strong> Know Your Customer - Connaitre son client</li>
                                    <li><strong>RCCM :</strong> Registre du Commerce et du Crédit Mobilier</li>
                                </ul>
                            </div>
                            <div className="col-12 md:col-6">
                                <h6 className="text-primary">Termes Techniques</h6>
                                <ul className="line-height-3">
                                    <li><strong>Agence :</strong> Point de service de l'institution</li>
                                    <li><strong>Officier de Crédit :</strong> Agent responsable du suivi des clients</li>
                                    <li><strong>Garantie Solidaire :</strong> Engagement mutuel des membres du groupe</li>
                                    <li><strong>Parts Sociales :</strong> Contributions au capital du groupe</li>
                                </ul>
                            </div>
                            <div className="col-12">
                                <h6 className="text-primary">Termes Produits Financiers</h6>
                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <ul className="line-height-3">
                                            <li><strong>Ratio Dette/Revenu (DTI) :</strong> Pourcentage du revenu consacré aux dettes</li>
                                            <li><strong>Méthode des 5C :</strong> Évaluation basée sur Caractère, Capacité, Capital, Garantie et Conditions</li>
                                            <li><strong>Intérêt Dégressif :</strong> Intérêt calculé sur le capital restant dû</li>
                                            <li><strong>Période de Grâce :</strong> Délai avant début des remboursements</li>
                                            <li><strong>Taux Annuel Effectif :</strong> Taux incluant tous les frais</li>
                                            <li><strong>Garantie Hypothécaire :</strong> Bien immobilier en garantie</li>
                                        </ul>
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <ul className="line-height-3">
                                            <li><strong>Capacité de Remboursement :</strong> Revenu disponible après dépenses essentielles</li>
                                            <li><strong>Comité de Crédit :</strong> Organe décisionnel pour approbation des prêts</li>
                                            <li><strong>Conditions de Décaissement :</strong> Exigences pré-décaissement du prêt</li>
                                            <li><strong>Score de Risque :</strong> Évaluation numérique du risque de crédit</li>
                                            <li><strong>Visite de Terrain :</strong> Inspection sur site du domicile/entreprise</li>
                                            <li><strong>Référence :</strong> Personne attestant du caractère de l'emprunteur</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AccordionTab>

                {/* Financial Products Module */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-money-bill"></i>
                            <span className="font-bold">6. Module Produits Financiers</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">6.1 Vue d'Ensemble</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                Le module de produits financiers permet de gérer l'ensemble du cycle de vie des produits de crédit,
                                depuis leur configuration jusqu'à la gestion des prêts actifs. Il comprend :
                            </p>
                            <ul className="line-height-3">
                                <li><strong>Données de Référence :</strong> Configuration des paramètres financiers (devises, taux, fréquences)</li>
                                <li><strong>Produits de Crédit :</strong> Configuration des produits de prêt avec leurs règles et conditions</li>
                                <li><strong>Demandes de Crédit :</strong> Gestion du workflow complet de la demande à l'approbation</li>
                                <li><strong>Prêts Actifs :</strong> Suivi des prêts décaissés, échéanciers et paiements</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">6.2 Données de Référence Financières</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-dollar mr-2"></i>Paramètres Financiers</h6>
                                    <ul>
                                        <li><strong>Devises :</strong> Configuration des monnaies (BIF, USD, EUR)</li>
                                        <li><strong>Méthodes de Calcul :</strong> Intérêts dégressifs, constants, etc.</li>
                                        <li><strong>Fréquences de Paiement :</strong> Journalier, Hebdomadaire, Mensuel</li>
                                        <li><strong>Fréquences de Capitalisation :</strong> Annuel, Semestriel, Mensuel</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-briefcase mr-2"></i>Configuration Produits</h6>
                                    <ul>
                                        <li><strong>Types de Produits :</strong> Crédit court terme, long terme, agricole</li>
                                        <li><strong>Types de Frais :</strong> Dossier, analyse, pénalités</li>
                                        <li><strong>Types de Garanties :</strong> Hypothèque, caution solidaire, gage</li>
                                        <li><strong>Niveaux d'Approbation :</strong> Hiérarchie de validation</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-chart-line mr-2"></i>Évaluation des Risques</h6>
                                    <ul>
                                        <li><strong>Niveaux de Risque :</strong> Faible, Modéré, Élevé</li>
                                        <li><strong>Facteurs de Score :</strong> Critères d'évaluation creditée</li>
                                        <li><strong>Types de Revenu :</strong> Salaire, Commerce, Agriculture</li>
                                        <li><strong>Types de Dépenses :</strong> Logement, Alimentation, Transport</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary">6.3 Liste des Produits de Crédit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Accès :</strong> Menu <Tag value="Produits Financiers" /> → <Tag value="Produits de Crédit" severity="info" /></p>

                            <h6 className="text-blue-600 mt-3">Informations Affichées dans la Liste</h6>
                            <ul className="line-height-3">
                                <li><strong>Code :</strong> Code unique du produit</li>
                                <li><strong>Nom :</strong> Nom du produit en français</li>
                                <li><strong>Type :</strong> Catégorie du produit (Court terme, Long terme, Agricole, etc.)</li>
                                <li><strong>Montant Min/Max :</strong> Plage de montants autorisés</li>
                                <li><strong>Taux :</strong> Taux d'intérêt par défaut</li>
                                <li><strong>Durée :</strong> Plage de durées en mois</li>
                                <li><strong>Statut :</strong> État du produit (Brouillon, Actif, Suspendu, Abandonné)</li>
                                <li><strong>Actions :</strong> Boutons pour modifier et gérer les éléments du produit</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Boutons d'Action Disponibles</h6>
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <ul className="line-height-3">
                                        <li><i className="pi pi-pencil text-orange-500 mr-2"></i><strong>Modifier :</strong> Éditer les informations du produit</li>
                                        <li><i className="pi pi-money-bill text-info mr-2"></i><strong>Gérer les Frais :</strong> Configurer les frais</li>
                                    </ul>
                                </div>
                                <div className="col-12 md:col-6">
                                    <ul className="line-height-3">
                                        <li><i className="pi pi-shield text-warning mr-2"></i><strong>Gérer les Garanties :</strong> Définir les garanties</li>
                                        <li><i className="pi pi-sitemap text-secondary mr-2"></i><strong>Gérer les Flux :</strong> Workflow d'approbation</li>
                                    </ul>
                                </div>
                            </div>

                            <h6 className="text-blue-600 mt-3">Statuts des Produits</h6>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="Brouillon" /> - Produit en cours de configuration
                                <Tag value="Actif" severity="success" /> - Produit disponible pour les demandes
                                <Tag value="Suspendu" severity="warning" /> - Produit temporairement indisponible
                                <Tag value="Abandonné" severity="danger" /> - Produit définitivement retiré
                            </div>
                        </div>

                        <h5 className="text-primary">6.4 Configuration d'un Produit de Crédit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Accès :</strong> Cliquer sur le bouton <Tag value="Nouveau" severity="info" /> pour ouvrir le formulaire de création.</p>
                            <p className="mt-2"><strong>Le formulaire est organisé en 4 onglets :</strong></p>

                            <h6 className="text-blue-600 mt-3"><i className="pi pi-info-circle mr-2"></i>Onglet 1 : Informations Générales</h6>
                            <div className="ml-3">
                                <p><strong>Identification du Produit :</strong></p>
                                <ul>
                                    <li><strong>Code Produit</strong> <span className="text-red-500">*</span> : Code unique en majuscules (ex: MICRO-001)</li>
                                    <li><strong>Type de Produit</strong> <span className="text-red-500">*</span> : Sélectionner dans la liste</li>
                                    <li><strong>Nom du Produit (EN)</strong> <span className="text-red-500">*</span> : Nom en anglais</li>
                                    <li><strong>Nom du Produit (FR)</strong> <span className="text-red-500">*</span> : Nom en français</li>
                                    <li><strong>Devise</strong> <span className="text-red-500">*</span> : BIF, USD, EUR...</li>
                                    <li><strong>Clientèle Cible</strong> : Individuel, Groupe ou Mixte</li>
                                    <li><strong>Statut</strong> : Brouillon, Actif, Suspendu, Abandonné</li>
                                </ul>
                                <p className="mt-2"><strong>Description :</strong></p>
                                <ul>
                                    <li>Description en anglais et en français (optionnel)</li>
                                </ul>
                            </div>

                            <h6 className="text-blue-600 mt-3"><i className="pi pi-calculator mr-2"></i>Onglet 2 : Montants & Durées</h6>
                            <div className="ml-3">
                                <p><strong>Limites de Montant :</strong></p>
                                <ul>
                                    <li><strong>Montant Minimum</strong> <span className="text-red-500">*</span> : Montant minimum du prêt (doit être inférieur au maximum)</li>
                                    <li><strong>Montant Maximum</strong> <span className="text-red-500">*</span> : Montant maximum du prêt</li>
                                    <li><strong>Montant par Défaut</strong> : Montant suggéré par défaut</li>
                                </ul>
                                <p className="mt-2"><strong>Durée du Prêt (en mois) :</strong></p>
                                <ul>
                                    <li><strong>Durée Minimum</strong> <span className="text-red-500">*</span> : Durée minimale (doit être inférieure à la maximum)</li>
                                    <li><strong>Durée Maximum</strong> <span className="text-red-500">*</span> : Durée maximale</li>
                                    <li><strong>Durée par Défaut</strong> : Durée suggérée par défaut</li>
                                </ul>
                            </div>

                            <h6 className="text-blue-600 mt-3"><i className="pi pi-percentage mr-2"></i>Onglet 3 : Intérêts & Paiements</h6>
                            <div className="ml-3">
                                <p><strong>Configuration des Intérêts :</strong></p>
                                <ul>
                                    <li><strong>Méthode de Calcul</strong> <span className="text-red-500">*</span> : Dégressif, Constant, Flat, etc.</li>
                                    <li><strong>Taux Minimum</strong> <span className="text-red-500">*</span> : Taux minimum (doit être inférieur au maximum)</li>
                                    <li><strong>Taux Maximum</strong> <span className="text-red-500">*</span> : Taux maximum autorisé</li>
                                    <li><strong>Taux par Défaut</strong> : Taux suggéré par défaut</li>
                                </ul>
                                <p className="mt-2"><strong>Paiements & Période de Grâce :</strong></p>
                                <ul>
                                    <li><strong>Fréquence de Paiement</strong> <span className="text-red-500">*</span> : Journalier, Hebdomadaire, Mensuel, etc.</li>
                                    <li><strong>Type de Période de Grâce</strong> : Aucun, Principal uniquement, Intérêt uniquement, Les deux</li>
                                    <li><strong>Période de Grâce Maximum</strong> : Nombre de jours maximum</li>
                                </ul>
                            </div>

                            <h6 className="text-blue-600 mt-3"><i className="pi pi-cog mr-2"></i>Onglet 4 : Options & Exigences</h6>
                            <div className="ml-3">
                                <p><strong>Remboursement Anticipé :</strong></p>
                                <ul>
                                    <li><strong>Autoriser le remboursement anticipé</strong> : Cocher si autorisé</li>
                                    <li><strong>Taux de Pénalité</strong> : Pourcentage de pénalité si applicable</li>
                                </ul>
                                <p className="mt-2"><strong>Exigences de Garantie :</strong></p>
                                <ul>
                                    <li><strong>Exiger des garants</strong> : Cocher si des cautions sont requises</li>
                                    <li><strong>Nombre Minimum de Garants</strong> : Si coché, indiquer le nombre minimum</li>
                                    <li><strong>Exiger des garanties matérielles</strong> : Cocher si des garanties (hypothèque, gage) sont requises</li>
                                </ul>
                            </div>

                            <h6 className="text-green-600 mt-3"><i className="pi pi-check-circle mr-2"></i>Validation et Enregistrement</h6>
                            <div className="ml-3">
                                <ul>
                                    <li>Cliquer sur <Tag value="Enregistrer" severity="success" /> pour sauvegarder</li>
                                    <li>Le système valide que le code et le nom français sont uniques</li>
                                    <li>Après création, le produit apparaît dans la liste avec les boutons d'action suivants :
                                        <ul>
                                            <li><i className="pi pi-pencil text-orange-500 mr-1"></i> <strong>Modifier :</strong> Éditer les informations du produit</li>
                                            <li><i className="pi pi-money-bill text-info mr-1"></i> <strong>Gérer les Frais :</strong> Configurer les frais applicables</li>
                                            <li><i className="pi pi-shield text-warning mr-1"></i> <strong>Gérer les Garanties :</strong> Définir les types de garanties acceptées</li>
                                            <li><i className="pi pi-sitemap text-secondary mr-1"></i> <strong>Gérer les Flux :</strong> Configurer le workflow d'approbation</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <h5 className="text-primary">6.3.1 Gestion des Frais du Produit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Après création du produit, configurer les frais en cliquant sur le bouton <Tag value="Gérer les Frais" severity="info" /> <i className="pi pi-money-bill text-info mr-1"></i> dans la liste des produits.</p>

                            <h6 className="text-blue-600 mt-3">Accès à la Gestion des Frais</h6>
                            <ol className="line-height-3">
                                <li>Dans la liste des produits de crédit, repérer le produit souhaité</li>
                                <li>Cliquer sur le bouton bleu <i className="pi pi-money-bill"></i> (Gérer les Frais)</li>
                                <li>Une fenêtre popup s'ouvre avec la liste des frais configurés pour ce produit</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Création d'un Nouveau Frais</h6>
                            <ol className="line-height-3">
                                <li>Dans la popup, cliquer sur <Tag value="Nouveau" severity="info" /> pour ouvrir le formulaire</li>
                                <li>Remplir les champs obligatoires et optionnels :
                                    <ul>
                                        <li><strong>Type de Frais</strong> <span className="text-red-500">*</span> : Sélectionner dans la liste (Frais de dossier, Commission, etc.)</li>
                                        <li><strong>Méthode de Calcul</strong> <span className="text-red-500">*</span> : Montant fixe, Pourcentage du capital, Pourcentage du montant décaissé</li>
                                        <li><strong>Montant Fixe</strong> : Saisir le montant en BIF si méthode = Montant fixe</li>
                                        <li><strong>Taux de Pourcentage</strong> : Saisir le pourcentage si méthode = Pourcentage</li>
                                        <li><strong>Montant Minimum</strong> : Montant minimum à facturer (optionnel)</li>
                                        <li><strong>Montant Maximum</strong> : Plafond du frais (optionnel)</li>
                                        <li><strong>Moment de Collecte</strong> : À la demande, À l'approbation, Au décaissement, Mensuel, À la clôture</li>
                                        <li><strong>Obligatoire</strong> : Cocher si ce frais est toujours appliqué</li>
                                        <li><strong>Remboursable</strong> : Cocher si le frais peut être remboursé</li>
                                        <li><strong>Actif</strong> : Cocher pour activer le frais</li>
                                    </ul>
                                </li>
                                <li>Cliquer sur <Tag value="Enregistrer" severity="success" /> pour sauvegarder</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Gestion des Frais Existants</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-pencil text-orange-500 mr-2"></i><strong>Modifier :</strong> Cliquer sur l'icône crayon pour éditer un frais</li>
                                <li><i className="pi pi-trash text-red-500 mr-2"></i><strong>Supprimer :</strong> Cliquer sur l'icône poubelle pour supprimer</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Types de Frais Disponibles</h6>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="Frais de Dossier" />
                                <Tag value="Commission d'Engagement" />
                                <Tag value="Frais de Déblocage" />
                                <Tag value="Commission de Gestion" />
                                <Tag value="Frais d'Assurance" />
                                <Tag value="Pénalité de Retard" />
                                <Tag value="Frais de Remboursement Anticipé" />
                            </div>

                            <div className="border-left-3 border-blue-500 pl-3 mt-3">
                                <p className="text-blue-600"><i className="pi pi-info-circle mr-2"></i><strong>Note :</strong> Le nom du frais est automatiquement rempli à partir du type de frais sélectionné.</p>
                            </div>
                        </div>

                        <h5 className="text-primary">6.3.2 Gestion des Garanties du Produit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Configurer les types de garanties acceptées en cliquant sur le bouton <Tag value="Gérer les Garanties" severity="warning" /> <i className="pi pi-shield text-warning mr-1"></i> dans la liste des produits.</p>

                            <h6 className="text-blue-600 mt-3">Accès à la Gestion des Garanties</h6>
                            <ol className="line-height-3">
                                <li>Dans la liste des produits de crédit, repérer le produit souhaité</li>
                                <li>Cliquer sur le bouton orange <i className="pi pi-shield"></i> (Gérer les Garanties)</li>
                                <li>Une fenêtre popup s'ouvre avec la liste des garanties configurées pour ce produit</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Création d'une Nouvelle Garantie</h6>
                            <ol className="line-height-3">
                                <li>Dans la popup, cliquer sur <Tag value="Nouveau" severity="info" /> pour ouvrir le formulaire</li>
                                <li>Remplir les champs :
                                    <ul>
                                        <li><strong>Type de Garantie</strong> <span className="text-red-500">*</span> : Sélectionner dans la liste (Hypothèque, Caution solidaire, Gage, Nantissement, etc.)</li>
                                        <li><strong>Pourcentage de Couverture Minimum</strong> : Pourcentage minimum de la valeur du prêt à couvrir (ex: 100%, 120%)</li>
                                        <li><strong>Obligatoire</strong> : Cocher si cette garantie est requise pour ce produit</li>
                                        <li><strong>Actif</strong> : Cocher pour activer cette garantie</li>
                                    </ul>
                                </li>
                                <li>Cliquer sur <Tag value="Enregistrer" severity="success" /> pour sauvegarder</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Types de Garanties Disponibles</h6>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="Hypothèque" />
                                <Tag value="Caution Solidaire" />
                                <Tag value="Gage" />
                                <Tag value="Nantissement" />
                                <Tag value="Épargne Bloquée" />
                                <Tag value="Garantie Personnelle" />
                            </div>

                            <h6 className="text-blue-600 mt-3">Gestion des Garanties Existantes</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-pencil text-orange-500 mr-2"></i><strong>Modifier :</strong> Cliquer sur l'icône crayon pour éditer une garantie</li>
                                <li><i className="pi pi-trash text-red-500 mr-2"></i><strong>Supprimer :</strong> Cliquer sur l'icône poubelle pour supprimer</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">6.3.3 Flux d'Approbation</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Configurer le workflow d'approbation en cliquant sur le bouton <Tag value="Gérer les Flux" severity="secondary" /> <i className="pi pi-sitemap text-secondary mr-1"></i> dans la liste des produits.</p>

                            <h6 className="text-blue-600 mt-3">Accès à la Gestion des Flux d'Approbation</h6>
                            <ol className="line-height-3">
                                <li>Dans la liste des produits de crédit, repérer le produit souhaité</li>
                                <li>Cliquer sur le bouton gris <i className="pi pi-sitemap"></i> (Gérer les Flux)</li>
                                <li>Une fenêtre popup s'ouvre avec la liste des niveaux d'approbation configurés</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Création d'un Niveau d'Approbation</h6>
                            <ol className="line-height-3">
                                <li>Dans la popup, cliquer sur <Tag value="Nouveau" severity="info" /> pour ouvrir le formulaire</li>
                                <li>Remplir les champs :
                                    <ul>
                                        <li><strong>Niveau d'Approbation</strong> <span className="text-red-500">*</span> : Sélectionner le niveau (Agent de Crédit, Superviseur, Chef d'Agence, Directeur, Comité de Crédit)</li>
                                        <li><strong>Ordre de Séquence</strong> : Numéro définissant l'ordre dans le workflow (1, 2, 3...)</li>
                                        <li><strong>Montant Minimum</strong> : Seuil minimum pour ce niveau d'approbation</li>
                                        <li><strong>Montant Maximum</strong> : Plafond pour ce niveau d'approbation</li>
                                        <li><strong>Requiert Comité</strong> : Cocher si une réunion de comité est nécessaire</li>
                                        <li><strong>Nombre Min. Membres Comité</strong> : Si comité requis, nombre minimum de membres</li>
                                        <li><strong>Approbation Auto si Risque Faible</strong> : Cocher pour permettre l'approbation automatique</li>
                                        <li><strong>Délai Max. de Traitement (jours)</strong> : Nombre de jours maximum pour traiter</li>
                                        <li><strong>Actif</strong> : Cocher pour activer ce niveau</li>
                                    </ul>
                                </li>
                                <li>Cliquer sur <Tag value="Enregistrer" severity="success" /> pour sauvegarder</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Niveaux d'Approbation Disponibles</h6>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="Agent de Crédit" severity="info" />
                                <Tag value="Superviseur" severity="info" />
                                <Tag value="Chef d'Agence" severity="warning" />
                                <Tag value="Directeur Régional" severity="warning" />
                                <Tag value="Directeur Général" severity="danger" />
                                <Tag value="Comité de Crédit" severity="danger" />
                            </div>

                            <h6 className="text-blue-600 mt-3">Exemple de Configuration</h6>
                            <div className="grid">
                                <div className="col-12">
                                    <Card>
                                        <ul className="text-sm line-height-3">
                                            <li><strong>Niveau 1 - Agent de Crédit :</strong> Montant 0 - 500 000 BIF</li>
                                            <li><strong>Niveau 2 - Superviseur :</strong> Montant 500 001 - 2 000 000 BIF</li>
                                            <li><strong>Niveau 3 - Chef d'Agence :</strong> Montant 2 000 001 - 5 000 000 BIF</li>
                                            <li><strong>Niveau 4 - Comité de Crédit :</strong> Montant supérieur à 5 000 000 BIF (3 membres minimum)</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>

                            <h6 className="text-blue-600 mt-3">Gestion des Niveaux Existants</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-pencil text-orange-500 mr-2"></i><strong>Modifier :</strong> Cliquer sur l'icône crayon pour éditer un niveau</li>
                                <li><i className="pi pi-trash text-red-500 mr-2"></i><strong>Supprimer :</strong> Cliquer sur l'icône poubelle pour supprimer</li>
                            </ul>

                            <div className="border-left-3 border-orange-500 pl-3 mt-3">
                                <p className="text-orange-600"><i className="pi pi-exclamation-triangle mr-2"></i><strong>Important :</strong> Les seuils de montant ne doivent pas se chevaucher entre les niveaux d'approbation.</p>
                            </div>
                        </div>

                        <h5 className="text-primary">6.3.4 Documents Requis</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Configurer les documents requis via <i className="pi pi-file text-help mr-1"></i></p>
                            <ul className="line-height-3">
                                <li><strong>Nom du Document</strong> : CNI, Attestation de revenu, Titre foncier, etc.</li>
                                <li><strong>Description</strong> : Instructions pour le client</li>
                                <li><strong>Est Obligatoire</strong> : Cocher si le document est requis</li>
                                <li><strong>Est Actif</strong> : Cocher pour activer la demande de ce document</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">6.4 Processus de Demande de Crédit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Workflow Complet :</strong></p>

                            <h6 className="text-blue-600">Étape 1 : Création de la Demande</h6>
                            <ol className="line-height-3">
                                <li>Accéder à <Tag value="Demandes de Crédit" /> → <Tag value="Nouvelle Demande" severity="info" /></li>
                                <li>Sélectionner le client (individuel) ou groupe solidaire</li>
                                <li>Choisir le produit de crédit</li>
                                <li>Saisir le montant demandé et la durée souhaitée</li>
                                <li>Indiquer l'objectif du crédit</li>
                                <li>Enregistrer comme <Tag value="EN ATTENTE" severity="warning" /></li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Étape 2 : Documents Justificatifs</h6>
                            <ul className="line-height-3">
                                <li>Télécharger les documents requis (CNI, attestation de revenu, etc.)</li>
                                <li>Vérifier chaque document : <i className="pi pi-check text-green-500"></i></li>
                                <li>Statut passe à <Tag value="SOUMISE" severity="info" /></li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Étape 3 : Analyse Financière</h6>
                            <ul className="line-height-3">
                                <li><strong>Analyse des Revenus :</strong>
                                    <ul>
                                        <li>Saisir tous les types de revenus (salaires, commerce, agriculture)</li>
                                        <li>Indiquer la fréquence (mensuel, hebdomadaire)</li>
                                        <li>Joindre les justificatifs</li>
                                        <li>Le système calcule le revenu mensuel total</li>
                                    </ul>
                                </li>
                                <li><strong>Analyse des Dépenses :</strong>
                                    <ul>
                                        <li>Saisir toutes les dépenses récurrentes</li>
                                        <li>Le système calcule le total mensuel</li>
                                    </ul>
                                </li>
                                <li><strong>Synthèse de Capacité :</strong>
                                    <ul>
                                        <li>Visualisation automatique du ratio dette/revenu (DTI)</li>
                                        <li>Revenu disponible calculé automatiquement</li>
                                        <li>Capacité de remboursement mensuelle</li>
                                    </ul>
                                </li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Étape 4 : Évaluation des Risques (Méthode 5C)</h6>
                            <div className="ml-3">
                                <p>Le système utilise la méthode des 5C pour évaluer le risque :</p>
                                <ul className="line-height-3">
                                    <li><strong>Caractère :</strong> Historique de crédit, réputation (0-100)</li>
                                    <li><strong>Capacité :</strong> Capacité de remboursement (0-100)</li>
                                    <li><strong>Capital :</strong> Actifs et épargne du client (0-100)</li>
                                    <li><strong>Garantie :</strong> Valeur des garanties (0-100)</li>
                                    <li><strong>Conditions :</strong> Conditions économiques et secteur (0-100)</li>
                                </ul>
                                <p className="mt-2">Le score total de risque (0-500) détermine le <Tag value="Niveau de Risque" severity="warning" /></p>
                                <p>Un graphique radar visualise les 5 dimensions.</p>
                            </div>

                            <h6 className="text-blue-600 mt-3">Étape 5 : Travail de Terrain</h6>
                            <ul className="line-height-3">
                                <li><strong>Visite de Terrain :</strong>
                                    <ul>
                                        <li>Type de visite (Domicile, Entreprise, Garantie)</li>
                                        <li>Observations détaillées</li>
                                        <li>Capture GPS automatique (coordonnées géographiques)</li>
                                        <li>Photos (avec prévisualisation)</li>
                                    </ul>
                                </li>
                                <li><strong>Vérification des Références :</strong>
                                    <ul>
                                        <li>Nom et contact de la référence</li>
                                        <li>Méthode de vérification (téléphone, visite, email)</li>
                                        <li>Évaluation de la relation et recommandation</li>
                                    </ul>
                                </li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Étape 6 : Revue par Comité de Crédit</h6>
                            <ol className="line-height-3">
                                <li><strong>Créer une Session :</strong>
                                    <ul>
                                        <li>Définir la date et l'heure</li>
                                        <li>Ajouter les membres du comité avec leurs rôles</li>
                                        <li>Démarrer la session : <Tag value="EN COURS" severity="warning" /></li>
                                    </ul>
                                </li>
                                <li><strong>Examiner la Demande :</strong>
                                    <ul>
                                        <li>Consulter tous les documents et analyses</li>
                                        <li>Discuter et voter</li>
                                        <li>Enregistrer la décision : <Tag value="APPROUVÉE" severity="success" /> ou <Tag value="REJETÉE" severity="danger" /></li>
                                        <li>Pour approbation, définir le montant et taux approuvés</li>
                                    </ul>
                                </li>
                                <li>Finaliser la session : <Tag value="TERMINÉE" severity="success" /></li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Étape 7 : Conditions de Décaissement</h6>
                            <ul className="line-height-3">
                                <li>Définir les conditions pré-décaissement requises</li>
                                <li>Client soumet les preuves : <Tag value="SOUMISE" severity="info" /></li>
                                <li>Agent vérifie : <Tag value="VÉRIFIÉE" severity="success" /></li>
                                <li>Toutes conditions vérifiées → Prêt prêt pour décaissement</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">6.5 Statuts des Demandes</h5>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Tag value="EN ATTENTE" severity="warning" />
                            <Tag value="SOUMISE" severity="info" />
                            <Tag value="EN RÉVISION" />
                            <Tag value="APPROUVÉE" severity="success" />
                            <Tag value="REJETÉE" severity="danger" />
                            <Tag value="DÉCAISSÉE" severity="success" />
                            <Tag value="RETIRÉE" />
                        </div>

                        <h5 className="text-primary">6.6 Conseils et Bonnes Pratiques</h5>
                        <div className="surface-100 p-3 border-round">
                            <h6 className="text-blue-600">Configuration Produits</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Toujours tester un produit en mode DRAFT avant de l'activer</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Définir des limites réalistes (montants, durées, taux)</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Configurer un workflow d'approbation approprié au montant</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Spécifier tous les documents requis dès la configuration</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Traitement des Demandes</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier tous les documents avant de soumettre</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Saisir toutes les sources de revenu (ne rien omettre)</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Effectuer systématiquement une visite de terrain</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Capturer les coordonnées GPS pendant la visite</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Prendre des photos claires et pertinentes</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Contacter au moins 2 références par demande</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Évaluation des Risques</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Ratio DTI recommandé : &lt; 40%</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Utiliser le graphique radar pour visualiser les points faibles</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Documenter toute exception aux politiques standards</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Score total &gt; 350/500 généralement requis pour approbation</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Comité de Crédit</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Assurer un quorum minimum avant de démarrer</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Examiner tous les dossiers préparés avant la session</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Documenter clairement les motifs de rejet</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Pour les approbations conditionnelles, définir des conditions vérifiables</li>
                            </ul>
                        </div>

                        <h5 className="text-primary mt-4">6.7 Indicateurs Clés de Performance</h5>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <Card>
                                    <h6 className="mt-0 text-blue-600"><i className="pi pi-chart-bar mr-2"></i>Qualité du Portefeuille</h6>
                                    <ul className="line-height-3">
                                        <li>Taux d'approbation : &gt; 60%</li>
                                        <li>Délai moyen de traitement : &lt; 7 jours</li>
                                        <li>Taux de décaissement : &gt; 90% des approuvés</li>
                                        <li>Score de risque moyen : 350-400/500</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card>
                                    <h6 className="mt-0 text-green-600"><i className="pi pi-shield mr-2"></i>Gestion des Risques</h6>
                                    <ul className="line-height-3">
                                        <li>Ratio DTI moyen : &lt; 35%</li>
                                        <li>Taux de couverture des garanties : &gt; 120%</li>
                                        <li>Visites terrain effectuées : 100%</li>
                                        <li>Références vérifiées : ≥ 2 par dossier</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>
                    </div>
                </AccordionTab>

                {/* Épargne Module */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-wallet"></i>
                            <span className="font-bold">7. Module Épargne</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">7.1 Vue d'Ensemble</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                Le module Épargne permet de gérer l'ensemble des produits et opérations d'épargne de l'institution.
                                Il offre une solution complète pour :
                            </p>
                            <ul className="line-height-3">
                                <li><strong>Épargne Libre :</strong> Comptes d'épargne à vue avec livret, dépôts et retraits flexibles</li>
                                <li><strong>Épargne à Terme (DAT) :</strong> Dépôts à terme avec taux d'intérêt bonifiés</li>
                                <li><strong>Épargne Obligatoire :</strong> Épargne liée aux crédits, bloquée pendant la durée du prêt</li>
                                <li><strong>Tontine Digitale :</strong> Gestion des groupes d'épargne rotative</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">7.2 Types de Comptes d'Épargne</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6 lg:col-3">
                                <Card className="h-full border-left-3 border-blue-500">
                                    <h6 className="mt-0 text-blue-500">
                                        <i className="pi pi-book mr-2"></i>
                                        Épargne Libre
                                    </h6>
                                    <ul className="text-sm line-height-3">
                                        <li>Dépôts et retraits libres</li>
                                        <li>Taux d'intérêt : 2-3% annuel</li>
                                        <li>Minimum d'ouverture : 5 000 FBU</li>
                                        <li>Livret physique fourni</li>
                                        <li>Pas de durée minimale</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <Card className="h-full border-left-3 border-green-500">
                                    <h6 className="mt-0 text-green-500">
                                        <i className="pi pi-lock mr-2"></i>
                                        Dépôt à Terme (DAT)
                                    </h6>
                                    <ul className="text-sm line-height-3">
                                        <li>Durées : 3, 6, 12, 24 mois</li>
                                        <li>Taux : 5% à 8% selon durée</li>
                                        <li>Minimum : 100 000 FBU</li>
                                        <li>Pénalité retrait anticipé</li>
                                        <li>Intérêts capitalisables</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <Card className="h-full border-left-3 border-orange-500">
                                    <h6 className="mt-0 text-orange-500">
                                        <i className="pi pi-link mr-2"></i>
                                        Épargne Obligatoire
                                    </h6>
                                    <ul className="text-sm line-height-3">
                                        <li>Liée à un crédit actif</li>
                                        <li>% du montant du prêt</li>
                                        <li>Bloquée pendant le prêt</li>
                                        <li>Libérée à la clôture</li>
                                        <li>Peut servir de garantie</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <Card className="h-full border-left-3 border-purple-500">
                                    <h6 className="mt-0 text-purple-500">
                                        <i className="pi pi-users mr-2"></i>
                                        Tontine Digitale
                                    </h6>
                                    <ul className="text-sm line-height-3">
                                        <li>Groupes de 10-30 membres</li>
                                        <li>Cotisations régulières</li>
                                        <li>Tour de paiement rotatif</li>
                                        <li>Pénalités automatiques</li>
                                        <li>Suivi en temps réel</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary">7.3 Gestion des Livrets d'Épargne</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Création d'un Livret :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Épargne" /> → <Tag value="Livret d'Épargne" severity="info" /></li>
                                <li>Cliquer sur l'onglet <Tag value="Nouveau Livret" severity="info" /></li>
                                <li>Sélectionner le client titulaire</li>
                                <li>Choisir le type de compte et l'agence</li>
                                <li>Effectuer le dépôt initial (minimum 500 FBU)</li>
                                <li>Le système génère automatiquement le numéro de compte et le numéro de livret</li>
                                <li>Cliquer sur <Tag value="Enregistrer" severity="success" /></li>
                            </ol>

                            <p className="mt-3"><strong>Gestion des Pertes et Remplacements :</strong></p>
                            <ul className="line-height-3">
                                <li><strong>Déclaration de perte :</strong> Cliquez sur <i className="pi pi-exclamation-triangle text-red-500"></i> pour déclarer un livret perdu</li>
                                <li><strong>Remplacement :</strong> Après vérification de l'identité, un nouveau livret est émis avec frais de remplacement</li>
                                <li><strong>Statuts :</strong> <Tag value="Actif" severity="success" /> → <Tag value="Perdu" severity="danger" /> → <Tag value="Remplacé" severity="warning" /></li>
                            </ul>
                        </div>

                        <h5 className="text-primary">7.4 Opérations de Dépôt</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Création d'un Bordereau de Dépôt :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder à <Tag value="Bordereaux de Dépôt" /></li>
                                <li>Sélectionner le client et le compte d'épargne</li>
                                <li><strong>Saisie des coupures :</strong> Le système propose un tableau de comptage par dénomination
                                    <ul>
                                        <li>10 000 FBU, 5 000 FBU, 2 000 FBU, 1 000 FBU, 500 FBU</li>
                                        <li>Pièces : 100 FBU, 50 FBU, 10 FBU, 5 FBU, 1 FBU</li>
                                    </ul>
                                </li>
                                <li>Le montant total est calculé automatiquement</li>
                                <li>Saisir la source des fonds si requise</li>
                                <li>Valider et imprimer le reçu</li>
                            </ol>

                            <p className="mt-3"><strong>Statuts des Bordereaux :</strong></p>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="En attente" severity="warning" />
                                <Tag value="Validé" severity="success" />
                                <Tag value="Annulé" severity="danger" />
                            </div>
                        </div>

                        <h5 className="text-primary">7.5 Demandes de Retrait</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Workflow de Retrait avec Contrôles de Sécurité :</strong></p>

                            <h6 className="text-blue-600">Niveaux d'Autorisation :</h6>
                            <div className="grid">
                                <div className="col-12 md:col-4">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-green-500">Niveau 1 : Standard</h6>
                                        <ul className="text-sm">
                                            <li>Montant : ≤ 100 000 FBU</li>
                                            <li>Vérification ID simple</li>
                                            <li>Délai : Immédiat</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-4">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-orange-500">Niveau 2 : Double Vérification</h6>
                                        <ul className="text-sm">
                                            <li>Montant : 100 001 - 500 000 FBU</li>
                                            <li>Vérification par 2 agents</li>
                                            <li>Délai : Quelques heures</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-4">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-red-500">Niveau 3 : Approbation Manager</h6>
                                        <ul className="text-sm">
                                            <li>Montant : &gt; 500 000 FBU</li>
                                            <li>Approbation du responsable</li>
                                            <li>Délai : 24-48h</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>

                            <p className="mt-3"><strong>Processus de Retrait :</strong></p>
                            <ol className="line-height-3">
                                <li>Créer la demande de retrait avec le montant souhaité</li>
                                <li>Le système détermine automatiquement le niveau d'autorisation requis</li>
                                <li>Vérification de l'identité du client</li>
                                <li>Pour les montants élevés :
                                    <ul>
                                        <li>Première vérification par agent 1</li>
                                        <li>Deuxième vérification par agent 2</li>
                                        <li>Approbation manager si &gt; 500 000 FBU</li>
                                    </ul>
                                </li>
                                <li>Décaissement une fois toutes les approbations obtenues</li>
                            </ol>

                            <p className="mt-3"><strong>Statuts des Demandes :</strong></p>
                            <div className="flex flex-wrap gap-2 align-items-center">
                                <Tag value="En attente" severity="warning" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="ID Vérifié" severity="info" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="1ère Vérification" severity="info" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="2ème Vérification" severity="info" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Approuvé" severity="success" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Décaissé" severity="success" />
                            </div>
                        </div>

                        <h5 className="text-primary">7.6 Dépôts à Terme (DAT)</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Création d'un Dépôt à Terme :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder à <Tag value="Dépôts à Terme" /></li>
                                <li>Sélectionner le client et le compte source</li>
                                <li>Choisir la durée du placement :
                                    <div className="grid mt-2">
                                        <div className="col-6 md:col-3"><Tag value="3 mois : 5%" severity="info" /></div>
                                        <div className="col-6 md:col-3"><Tag value="6 mois : 6%" severity="info" /></div>
                                        <div className="col-6 md:col-3"><Tag value="12 mois : 7%" severity="info" /></div>
                                        <div className="col-6 md:col-3"><Tag value="24 mois : 8%" severity="info" /></div>
                                    </div>
                                </li>
                                <li>Saisir le montant (minimum 100 000 FBU)</li>
                                <li>Définir l'instruction à l'échéance :
                                    <ul>
                                        <li><strong>Renouvellement automatique :</strong> Capital + intérêts réinvestis</li>
                                        <li><strong>Virement intérêts :</strong> Intérêts versés au compte épargne</li>
                                        <li><strong>Clôture :</strong> Tout est viré au compte épargne</li>
                                    </ul>
                                </li>
                                <li>Le système calcule les intérêts projetés et la date d'échéance</li>
                            </ol>

                            <p className="mt-3"><strong>Retrait Anticipé :</strong></p>
                            <div className="border-left-3 border-orange-500 pl-3">
                                <p className="text-orange-600"><i className="pi pi-exclamation-triangle mr-2"></i>Attention aux pénalités !</p>
                                <ul>
                                    <li>Pénalité standard : 50% des intérêts acquis</li>
                                    <li>Retrait avant 1 mois : perte totale des intérêts</li>
                                    <li>Le système calcule automatiquement le montant net</li>
                                </ul>
                            </div>

                            <p className="mt-3"><strong>Statuts des DAT :</strong></p>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="Actif" severity="success" />
                                <Tag value="Échu" severity="warning" />
                                <Tag value="Renouvelé" severity="info" />
                                <Tag value="Clôturé" />
                            </div>
                        </div>

                        <h5 className="text-primary">7.7 Tontine (Épargne Groupe)</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Création d'un Groupe de Tontine :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder à <Tag value="Tontine" /> → <Tag value="Groupes" severity="info" /></li>
                                <li>Créer le groupe avec les paramètres :
                                    <ul>
                                        <li>Nom et description du groupe</li>
                                        <li>Montant de cotisation (ex: 10 000 FBU)</li>
                                        <li>Fréquence : Hebdomadaire, Bimensuel ou Mensuel</li>
                                        <li>Nombre maximum de membres (10-30)</li>
                                        <li>Jour et lieu de réunion</li>
                                    </ul>
                                </li>
                                <li>Définir les règles et pénalités :
                                    <ul>
                                        <li>Pénalité retard : généralement 5%</li>
                                        <li>Pénalité absence : généralement 10%</li>
                                    </ul>
                                </li>
                            </ol>

                            <p className="mt-3"><strong>Gestion des Membres :</strong></p>
                            <ul className="line-height-3">
                                <li><strong>Inscription :</strong> Ajouter des clients comme membres avec un ordre de paiement</li>
                                <li><strong>Ordre de tour :</strong> Définir l'ordre dans lequel chaque membre recevra la cagnotte</li>
                                <li><strong>Suivi :</strong> Visualiser les cotisations payées, retards et pénalités par membre</li>
                            </ul>

                            <p className="mt-3"><strong>Gestion des Cycles :</strong></p>
                            <ul className="line-height-3">
                                <li>Un cycle = Un tour complet où chaque membre a reçu une fois</li>
                                <li>Chaque cycle contient N cotisations (N = nombre de membres)</li>
                                <li>À chaque échéance :
                                    <ol>
                                        <li>Collecter les cotisations de tous les membres</li>
                                        <li>Calculer les pénalités automatiquement</li>
                                        <li>Verser la cagnotte au bénéficiaire du tour</li>
                                    </ol>
                                </li>
                            </ul>

                            <p className="mt-3"><strong>Tableau de Bord Tontine :</strong></p>
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-blue-500"><i className="pi pi-chart-bar mr-2"></i>Indicateurs Groupe</h6>
                                        <ul className="text-sm">
                                            <li>Membres actifs / Maximum</li>
                                            <li>Cycle actuel / Total cycles</li>
                                            <li>Taux de recouvrement</li>
                                            <li>Pénalités collectées</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-green-500"><i className="pi pi-user mr-2"></i>Indicateurs Membre</h6>
                                        <ul className="text-sm">
                                            <li>Cotisations payées / Attendues</li>
                                            <li>Retards de paiement</li>
                                            <li>Pénalités payées</li>
                                            <li>Statut du tour (A reçu / En attente)</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">7.8 Épargne Obligatoire</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Fonctionnement :</strong></p>
                            <ul className="line-height-3">
                                <li>Liée automatiquement à un crédit lors du décaissement</li>
                                <li>Montant calculé selon le pourcentage défini (ex: 10% du montant du prêt)</li>
                                <li>Bloquée pendant toute la durée du crédit</li>
                                <li>Peut être utilisée en garantie partielle</li>
                                <li>Libérée automatiquement à la clôture du crédit</li>
                            </ul>

                            <p className="mt-3"><strong>Tableau de Bord :</strong></p>
                            <div className="grid">
                                <div className="col-6 md:col-3">
                                    <div className="surface-50 p-3 border-round text-center">
                                        <i className="pi pi-wallet text-3xl text-blue-500"></i>
                                        <p className="mt-2 mb-0 text-sm text-500">Total Bloqué</p>
                                        <p className="m-0 font-bold">Montant total épargne obligatoire</p>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-50 p-3 border-round text-center">
                                        <i className="pi pi-users text-3xl text-green-500"></i>
                                        <p className="mt-2 mb-0 text-sm text-500">Comptes Actifs</p>
                                        <p className="m-0 font-bold">Nombre de comptes liés</p>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-50 p-3 border-round text-center">
                                        <i className="pi pi-check-circle text-3xl text-purple-500"></i>
                                        <p className="mt-2 mb-0 text-sm text-500">Libérés ce Mois</p>
                                        <p className="m-0 font-bold">Montant libéré</p>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-50 p-3 border-round text-center">
                                        <i className="pi pi-percentage text-3xl text-orange-500"></i>
                                        <p className="mt-2 mb-0 text-sm text-500">Taux Moyen</p>
                                        <p className="m-0 font-bold">% épargne/crédit</p>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-3"><strong>Statuts :</strong></p>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="Actif" severity="warning" /> (Crédit en cours)
                                <Tag value="Libéré" severity="success" /> (Crédit remboursé)
                                <Tag value="Saisi" severity="danger" /> (Crédit en défaut)
                            </div>
                        </div>

                        <h5 className="text-primary">7.9 Données de Référence Épargne</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-cog mr-2"></i>Types et Statuts</h6>
                                    <ul className="text-sm">
                                        <li>Types d'opérations (Crédit/Débit)</li>
                                        <li>Statuts de livret</li>
                                        <li>Statuts de dépôt à terme</li>
                                        <li>Statuts de tontine</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-clock mr-2"></i>Durées et Taux</h6>
                                    <ul className="text-sm">
                                        <li>Durées de terme (3, 6, 12, 24 mois)</li>
                                        <li>Taux d'intérêt par durée</li>
                                        <li>Pénalités de retrait anticipé</li>
                                        <li>Fréquences de capitalisation</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-shield mr-2"></i>Sécurité</h6>
                                    <ul className="text-sm">
                                        <li>Niveaux d'autorisation retrait</li>
                                        <li>Seuils de montants</li>
                                        <li>Méthodes de calcul intérêts</li>
                                        <li>Instructions d'échéance</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary">7.10 Clôture Journalière Épargne</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                La clôture journalière du module Épargne permet de vérifier et valider toutes les opérations
                                d'épargne (dépôts et retraits) effectuées durant la journée avant leur comptabilisation.
                            </p>

                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Module Épargne" /> → <Tag value="Clôture Journalière" severity="info" /></li>
                                <li>Sélectionner la date de clôture avec le calendrier</li>
                                <li>Cliquer sur <Tag value="Charger" severity="success" /> pour afficher les opérations du jour</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Fonctionnalités</h6>
                            <ul className="line-height-3">
                                <li><strong>Aperçu des opérations :</strong> Affiche tous les dépôts et retraits de la date sélectionnée avec les détails (client, montant, compte, référence)</li>
                                <li><strong>Vérification individuelle :</strong> Chaque opération peut être vérifiée (<i className="pi pi-check text-green-500"></i>) ou annulée individuellement</li>
                                <li><strong>Vérification en masse :</strong> Boutons <Tag value="Vérifier Tout" severity="success" /> et <Tag value="Annuler Tout" severity="danger" /> pour traiter toutes les opérations en une fois</li>
                                <li><strong>Statuts :</strong> <Tag value="VERIFIED" severity="success" /> pour les opérations validées, <Tag value="PENDING" severity="warning" /> pour celles en attente</li>
                                <li><strong>Statistiques :</strong> Nombre total d'opérations, montant total, nombre vérifiées vs en attente</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Règles Importantes</h6>
                            <div className="border-left-3 border-orange-500 pl-3">
                                <ul className="line-height-3">
                                    <li><i className="pi pi-lock text-red-500 mr-2"></i>Si la clôture comptable est complétée pour cette date, l'annulation des vérifications est <strong>interdite</strong>. Un bandeau rouge s'affiche pour l'indiquer.</li>
                                    <li><i className="pi pi-info-circle text-blue-500 mr-2"></i>Les opérations doivent être vérifiées ici avant de pouvoir être comptabilisées dans le module Comptabilité</li>
                                    <li><i className="pi pi-exclamation-triangle text-orange-500 mr-2"></i>Vérifier les montants affichés avec les bordereaux physiques avant validation</li>
                                </ul>
                            </div>
                        </div>

                        <h5 className="text-primary">7.11 Conseils et Bonnes Pratiques</h5>
                        <div className="surface-100 p-3 border-round">
                            <h6 className="text-blue-600">Gestion des Livrets</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Toujours vérifier l'identité avant toute opération</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Mettre à jour le livret physique à chaque transaction</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Signaler immédiatement les livrets perdus</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Conserver les bordereaux de dépôt signés</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Opérations de Retrait</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Respecter les niveaux d'autorisation selon les montants</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Documenter toute exception aux procédures</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier le solde disponible avant validation</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Faire signer le client sur le bordereau</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Dépôts à Terme</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Expliquer clairement les pénalités de retrait anticipé</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Confirmer l'instruction à l'échéance avec le client</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Envoyer un rappel 7 jours avant l'échéance</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Documenter tout changement d'instruction</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Tontine</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Former un coordinateur par groupe</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Collecter les cotisations le jour prévu</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Appliquer les pénalités de manière équitable</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Tenir des réunions régulières avec le groupe</li>
                            </ul>
                        </div>
                    </div>
                </AccordionTab>

                {/* Module Crédit */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-briefcase"></i>
                            <span className="font-bold">8. Module Crédit</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">8.1 Vue d'Ensemble</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                Le module Crédit permet de gérer l'ensemble du cycle de vie d'une demande de crédit,
                                depuis la réception de la demande jusqu'au décaissement. Il comprend :
                            </p>
                            <ul className="line-height-3">
                                <li><strong>Demandes de Crédit :</strong> Enregistrement et suivi des demandes de prêt</li>
                                <li><strong>Analyses Financières :</strong> Évaluation des revenus, dépenses et capacité de remboursement</li>
                                <li><strong>Visites Terrain :</strong> Vérification du domicile, activité et garanties</li>
                                <li><strong>Comité de Crédit :</strong> Processus d'approbation et décisions</li>
                                <li><strong>Décaissement :</strong> Mise à disposition des fonds</li>
                                <li><strong>Suivi et Recouvrement :</strong> Gestion des impayés</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">8.2 Données de Référence Crédit</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-tags mr-2"></i>Statuts et Types</h6>
                                    <ul className="text-sm">
                                        <li><strong>Statuts de Demande :</strong> États du workflow (En attente, En analyse, Approuvé, etc.)</li>
                                        <li><strong>Objets de Crédit :</strong> Finalité du crédit (Commerce, Agriculture, Habitat, etc.)</li>
                                        <li><strong>Types de Documents :</strong> Pièces requises pour le dossier</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-chart-line mr-2"></i>Analyse Financière</h6>
                                    <ul className="text-sm">
                                        <li><strong>Types de Revenus :</strong> Sources de revenus (Salaire, Commerce, Agriculture)</li>
                                        <li><strong>Types de Dépenses :</strong> Charges mensuelles (Loyer, Alimentation, Transport)</li>
                                        <li><strong>Types d'Emploi :</strong> Catégories professionnelles</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-shield mr-2"></i>Garanties et Risques</h6>
                                    <ul className="text-sm">
                                        <li><strong>Types de Garanties :</strong> Hypothèque, Nantissement, Caution</li>
                                        <li><strong>Niveaux de Risque :</strong> Classification du risque client</li>
                                        <li><strong>Catégories de Scoring :</strong> Critères d'évaluation</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-map-marker mr-2"></i>Visites Terrain</h6>
                                    <ul className="text-sm">
                                        <li><strong>Lieux de Visite :</strong> Types de lieux (Domicile, Entreprise, Champ)</li>
                                        <li><strong>Statuts de Logement :</strong> Propriétaire, Locataire, etc.</li>
                                        <li><strong>Recommandations :</strong> Avis de l'agent après visite</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-users mr-2"></i>Décisions et Décaissement</h6>
                                    <ul className="text-sm">
                                        <li><strong>Décisions du Comité :</strong> Approuvé, Rejeté, Ajourné</li>
                                        <li><strong>Modes de Décaissement :</strong> Cash, Virement, Chèque</li>
                                        <li><strong>Règles d'Allocation :</strong> Priorité des paiements</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-exclamation-triangle mr-2"></i>Recouvrement</h6>
                                    <ul className="text-sm">
                                        <li><strong>Étapes de Recouvrement :</strong> Relance, Mise en demeure, Contentieux</li>
                                        <li><strong>Actions de Recouvrement :</strong> Appel, SMS, Visite, Saisie</li>
                                        <li><strong>Classifications de Prêt :</strong> Sain, Douteux, Litigieux</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary">8.3 Création d'une Demande de Crédit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Étapes de Création :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Module Crédit" /> → <Tag value="Demandes de Crédit" severity="info" /></li>
                                <li>Cliquer sur l'onglet <Tag value="Nouvelle Demande" severity="info" /></li>
                                <li><strong>Enregistrement Initial :</strong>
                                    <ul>
                                        <li>Le numéro de dossier est généré automatiquement</li>
                                        <li>Sélectionner la date de dépôt</li>
                                        <li>Choisir l'agence de traitement</li>
                                    </ul>
                                </li>
                                <li><strong>Client Demandeur :</strong>
                                    <ul>
                                        <li>Rechercher et sélectionner le client (par nom, numéro ou téléphone)</li>
                                        <li>Assigner l'agent de crédit responsable</li>
                                    </ul>
                                </li>
                                <li><strong>Détails du Crédit Sollicité :</strong>
                                    <ul>
                                        <li>Sélectionner le produit de crédit</li>
                                        <li>Saisir le montant demandé (en BIF)</li>
                                        <li>Définir la durée souhaitée (en mois)</li>
                                        <li>Choisir la fréquence de remboursement</li>
                                    </ul>
                                </li>
                                <li><strong>Objet du Crédit :</strong>
                                    <ul>
                                        <li>Sélectionner la catégorie principale (Commerce, Agriculture, etc.)</li>
                                        <li>Décrire l'utilisation prévue des fonds</li>
                                        <li>Expliquer le plan de remboursement du client</li>
                                    </ul>
                                </li>
                                <li>Cliquer sur <Tag value="Enregistrer" severity="success" /></li>
                            </ol>

                            <p className="mt-3"><strong>Fréquences de Remboursement Disponibles :</strong></p>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="Mensuel" severity="info" />
                                <Tag value="Bimensuel" severity="info" />
                                <Tag value="Trimestriel" severity="info" />
                                <Tag value="Semestriel" severity="info" />
                                <Tag value="Annuel" severity="info" />
                                <Tag value="In Fine" severity="warning" />
                            </div>
                        </div>

                        <h5 className="text-primary">8.4 Analyse Financière</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>L'analyse financière permet d'évaluer la capacité de remboursement du client.</p>

                            <h6 className="text-blue-600">Analyse des Revenus</h6>
                            <ul className="line-height-3">
                                <li>Accéder à l'analyse via le bouton <Tag value="Analyse" severity="info" /> sur la demande</li>
                                <li>Ajouter tous les revenus du client :
                                    <ul>
                                        <li><strong>Type de revenu :</strong> Salaire, Commerce, Agriculture, Pension, etc.</li>
                                        <li><strong>Description :</strong> Détails de la source</li>
                                        <li><strong>Montant mensuel :</strong> En BIF</li>
                                        <li><strong>Fréquence :</strong> Pour conversion en mensuel</li>
                                        <li><strong>Vérifiable :</strong> Cocher si un justificatif existe</li>
                                    </ul>
                                </li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Analyse des Dépenses</h6>
                            <ul className="line-height-3">
                                <li>Ajouter toutes les dépenses mensuelles :
                                    <ul>
                                        <li><strong>Type de dépense :</strong> Loyer, Alimentation, Éducation, Transport, Santé, etc.</li>
                                        <li><strong>Description :</strong> Détails de la charge</li>
                                        <li><strong>Montant mensuel :</strong> En BIF</li>
                                        <li><strong>Fixe/Variable :</strong> Nature de la dépense</li>
                                        <li><strong>Essentielle :</strong> Dépense incompressible</li>
                                    </ul>
                                </li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Synthèse de Capacité</h6>
                            <div className="grid mt-2">
                                <div className="col-12 md:col-6">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-green-500"><i className="pi pi-chart-bar mr-2"></i>Indicateurs Calculés</h6>
                                        <ul className="text-sm">
                                            <li><strong>Revenu Total Mensuel :</strong> Somme de tous les revenus</li>
                                            <li><strong>Dépenses Totales :</strong> Somme de toutes les dépenses</li>
                                            <li><strong>Revenu Disponible :</strong> Revenus - Dépenses</li>
                                            <li><strong>Mensualité Proposée :</strong> Calcul basé sur durée et taux</li>
                                            <li><strong>Ratio Dette/Revenu (DTI) :</strong> Mensualité / Revenus × 100</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-orange-500"><i className="pi pi-exclamation-triangle mr-2"></i>Seuils de Risque</h6>
                                        <ul className="text-sm">
                                            <li><strong>DTI &lt; 30% :</strong> <Tag value="Faible risque" severity="success" /></li>
                                            <li><strong>DTI 30-40% :</strong> <Tag value="Risque modéré" severity="warning" /></li>
                                            <li><strong>DTI &gt; 40% :</strong> <Tag value="Risque élevé" severity="danger" /></li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">8.5 Visites Terrain</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>La visite terrain permet de vérifier les informations du client sur place.</p>

                            <h6 className="text-blue-600">Planification de la Visite</h6>
                            <ol className="line-height-3">
                                <li>Accéder à la visite via le bouton <Tag value="Visite" severity="warning" /> sur la demande</li>
                                <li>Définir la date et l'heure prévues</li>
                                <li>Sélectionner le(s) type(s) de lieu à visiter :
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Tag value="Domicile" />
                                        <Tag value="Lieu de travail" />
                                        <Tag value="Activité commerciale" />
                                        <Tag value="Champ/Exploitation" />
                                        <Tag value="Garantie" />
                                    </div>
                                </li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Vérification du Domicile</h6>
                            <ul className="line-height-3">
                                <li><strong>Adresse complète :</strong> Province, Commune, Zone, Quartier</li>
                                <li><strong>Statut d'occupation :</strong> Propriétaire, Locataire, Hébergé</li>
                                <li><strong>Type d'habitation :</strong> Villa, Appartement, Maison traditionnelle</li>
                                <li><strong>État du logement :</strong> Bon, Acceptable, Dégradé</li>
                                <li><strong>Coordonnées GPS :</strong> Capture automatique de la position</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Vérification de l'Activité</h6>
                            <ul className="line-height-3">
                                <li><strong>Type d'activité :</strong> Commerce, Service, Production, Agriculture</li>
                                <li><strong>Ancienneté :</strong> Durée d'existence de l'activité</li>
                                <li><strong>Nombre d'employés :</strong> Taille de l'entreprise</li>
                                <li><strong>État du local/équipement :</strong> Évaluation des actifs</li>
                                <li><strong>Observations :</strong> Commentaires détaillés</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Vérification des Garanties</h6>
                            <ul className="line-height-3">
                                <li><strong>Type de garantie :</strong> Immobilière, Mobilière, Nantissement épargne</li>
                                <li><strong>Description détaillée :</strong> Nature et caractéristiques</li>
                                <li><strong>Valeur estimée :</strong> En BIF</li>
                                <li><strong>État de la garantie :</strong> Bon, Acceptable, Dégradé</li>
                                <li><strong>Documents vérifiés :</strong> Titre foncier, Contrat, etc.</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Entretien avec le Client</h6>
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-blue-500">Questions Évaluées</h6>
                                        <ul className="text-sm">
                                            <li>Connaissance du produit demandé</li>
                                            <li>Compréhension du plan de remboursement</li>
                                            <li>Attitude du client (Coopératif, Réservé, Hostile)</li>
                                            <li>Cohérence des informations</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-green-500">Recommandation Finale</h6>
                                        <ul className="text-sm">
                                            <li><Tag value="Favorable" severity="success" /> - Dossier à approuver</li>
                                            <li><Tag value="Favorable avec réserves" severity="warning" /> - Conditions à remplir</li>
                                            <li><Tag value="Défavorable" severity="danger" /> - Dossier à rejeter</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">8.6 Workflow de la Demande</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Cycle de Vie d'une Demande :</strong></p>
                            <div className="flex flex-wrap gap-2 align-items-center mb-3">
                                <Tag value="Brouillon" />
                                <i className="pi pi-arrow-right"></i>
                                <Tag value="Soumise" severity="info" />
                                <i className="pi pi-arrow-right"></i>
                                <Tag value="En Analyse" severity="warning" />
                                <i className="pi pi-arrow-right"></i>
                                <Tag value="En Visite" severity="warning" />
                                <i className="pi pi-arrow-right"></i>
                                <Tag value="En Comité" severity="info" />
                                <i className="pi pi-arrow-right"></i>
                                <Tag value="Approuvée" severity="success" />
                                <i className="pi pi-arrow-right"></i>
                                <Tag value="Décaissée" severity="success" />
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <h6 className="text-blue-600">Statuts Intermédiaires</h6>
                                    <ul className="line-height-3">
                                        <li><strong>Brouillon :</strong> Demande en cours de saisie</li>
                                        <li><strong>Soumise :</strong> Dossier complet, en attente de traitement</li>
                                        <li><strong>En Analyse :</strong> Évaluation financière en cours</li>
                                        <li><strong>En Visite :</strong> Visite terrain planifiée ou en cours</li>
                                        <li><strong>En Comité :</strong> Dossier présenté au comité de crédit</li>
                                    </ul>
                                </div>
                                <div className="col-12 md:col-6">
                                    <h6 className="text-green-600">Statuts Finaux</h6>
                                    <ul className="line-height-3">
                                        <li><strong>Approuvée :</strong> Comité a approuvé la demande</li>
                                        <li><strong>Rejetée :</strong> Demande refusée par le comité</li>
                                        <li><strong>Annulée :</strong> Demande retirée par le client</li>
                                        <li><strong>Décaissée :</strong> Fonds mis à disposition</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">8.7 Actions Disponibles par Statut</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <div className="grid">
                                <div className="col-12 md:col-6 lg:col-4">
                                    <Card className="h-full border-left-3 border-blue-500">
                                        <h6 className="mt-0">Demandes En Attente</h6>
                                        <ul className="text-sm">
                                            <li><i className="pi pi-chart-line text-blue-500 mr-2"></i>Lancer l'analyse financière</li>
                                            <li><i className="pi pi-pencil text-orange-500 mr-2"></i>Modifier la demande</li>
                                            <li><i className="pi pi-eye text-green-500 mr-2"></i>Consulter le dossier</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6 lg:col-4">
                                    <Card className="h-full border-left-3 border-orange-500">
                                        <h6 className="mt-0">Demandes En Analyse</h6>
                                        <ul className="text-sm">
                                            <li><i className="pi pi-map-marker text-purple-500 mr-2"></i>Planifier la visite terrain</li>
                                            <li><i className="pi pi-chart-bar text-blue-500 mr-2"></i>Compléter l'analyse</li>
                                            <li><i className="pi pi-file text-green-500 mr-2"></i>Joindre des documents</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6 lg:col-4">
                                    <Card className="h-full border-left-3 border-green-500">
                                        <h6 className="mt-0">Demandes En Visite</h6>
                                        <ul className="text-sm">
                                            <li><i className="pi pi-check text-green-500 mr-2"></i>Compléter la visite</li>
                                            <li><i className="pi pi-camera text-blue-500 mr-2"></i>Ajouter des photos</li>
                                            <li><i className="pi pi-send text-purple-500 mr-2"></i>Soumettre au comité</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">8.8 Rapports Crédit</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-file mr-2"></i>Rapport des Demandes</h6>
                                    <p className="text-sm">Liste des demandes par période, statut, agence ou agent. Export PDF et Excel.</p>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-chart-line mr-2"></i>Rapport des Analyses</h6>
                                    <p className="text-sm">Synthèse des analyses financières avec ratios DTI et capacité.</p>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-map mr-2"></i>Rapport des Visites</h6>
                                    <p className="text-sm">Suivi des visites terrain planifiées et effectuées.</p>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-users mr-2"></i>Rapport des Décisions</h6>
                                    <p className="text-sm">Historique des décisions du comité de crédit.</p>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-money-bill mr-2"></i>Rapport des Décaissements</h6>
                                    <p className="text-sm">Volume et montants des décaissements par période.</p>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-chart-pie mr-2"></i>Synthèse du Portefeuille</h6>
                                    <p className="text-sm">Vue globale du portefeuille crédit avec indicateurs clés.</p>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary">8.9 Gestion des Décaissements</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                Le module Décaissement permet de mettre les fonds à disposition des clients dont les demandes
                                ont été approuvées par le comité de crédit. Il comprend deux sous-modules principaux :
                            </p>

                            <div className="grid mt-3">
                                <div className="col-12 md:col-6">
                                    <Card className="h-full border-left-3 border-green-500">
                                        <h6 className="mt-0"><i className="pi pi-check-circle text-green-500 mr-2"></i>Demandes Approuvées</h6>
                                        <p className="text-sm">Liste des demandes de crédit approuvées en attente de décaissement.</p>
                                        <p className="text-sm"><strong>Accès :</strong> Menu <Tag value="Module Crédit" /> → <Tag value="Décaissements" severity="info" /> → <Tag value="Approuvés" severity="success" /></p>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="h-full border-left-3 border-blue-500">
                                        <h6 className="mt-0"><i className="pi pi-money-bill text-blue-500 mr-2"></i>Décaissements Effectués</h6>
                                        <p className="text-sm">Historique de tous les décaissements réalisés avec détails et statistiques.</p>
                                        <p className="text-sm"><strong>Accès :</strong> Menu <Tag value="Module Crédit" /> → <Tag value="Décaissements" severity="info" /> → <Tag value="Effectués" severity="info" /></p>
                                    </Card>
                                </div>
                            </div>

                            <h6 className="text-blue-600 mt-4">Effectuer un Décaissement</h6>
                            <ol className="line-height-3">
                                <li>Accéder à <Tag value="Décaissements" /> → <Tag value="Approuvés" severity="success" /></li>
                                <li>La liste affiche toutes les demandes avec statut :
                                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                        <Tag value="Approuvé" severity="success" />
                                        <Tag value="Approuvé sous réserve" severity="warning" />
                                        <Tag value="Prêt au décaissement" severity="info" />
                                    </div>
                                </li>
                                <li>Identifier la demande à décaisser - les colonnes affichent :
                                    <ul>
                                        <li><strong>N° Dossier :</strong> Numéro unique de la demande</li>
                                        <li><strong>Client :</strong> Nom complet du bénéficiaire</li>
                                        <li><strong>N° Compte :</strong> Numéro du compte d'épargne lié</li>
                                        <li><strong>Montant Approuvé :</strong> Montant validé par le comité</li>
                                        <li><strong>Durée :</strong> Durée du prêt en mois</li>
                                        <li><strong>Statut :</strong> État actuel de la demande</li>
                                    </ul>
                                </li>
                                <li>Cliquer sur le bouton <Tag value="Décaisser" severity="success" icon="pi pi-money-bill" /> (icône billet)</li>
                                <li>Dans la boîte de dialogue de décaissement :
                                    <ul>
                                        <li><strong>Vérifier les informations :</strong> N° Dossier, Client, Montant Approuvé</li>
                                        <li><strong>Date de Décaissement :</strong> Date effective (par défaut aujourd'hui)</li>
                                        <li><strong>Mode de Décaissement * :</strong> Sélectionner parmi :
                                            <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                                <Tag value="Espèces" severity="success" />
                                                <Tag value="Virement Bancaire" severity="info" />
                                                <Tag value="Chèque" severity="warning" />
                                                <Tag value="Mobile Money" />
                                            </div>
                                        </li>
                                        <li><strong>Référence de Paiement :</strong> N° chèque, référence virement, etc. (optionnel)</li>
                                        <li><strong>Notes :</strong> Observations complémentaires (optionnel)</li>
                                    </ul>
                                </li>
                                <li>Cliquer sur <Tag value="Décaisser" severity="success" /> pour confirmer</li>
                            </ol>

                            <h6 className="text-blue-600 mt-4">Suivi des Décaissements Effectués</h6>
                            <div className="surface-200 p-3 border-round">
                                <p><strong>Accès :</strong> Menu <Tag value="Décaissements" /> → <Tag value="Effectués" severity="info" /></p>
                                <p className="mt-2">Cette page affiche :</p>
                                <ul>
                                    <li><strong>Statistiques en haut de page :</strong>
                                        <ul>
                                            <li>Total Décaissé (montant cumulé)</li>
                                            <li>Nombre de Décaissements</li>
                                            <li>Montant Moyen par décaissement</li>
                                        </ul>
                                    </li>
                                    <li><strong>Tableau des décaissements :</strong>
                                        <ul>
                                            <li>N° Dossier - Référence de la demande originale</li>
                                            <li>Client - Nom du bénéficiaire</li>
                                            <li>N° Décaissement - Numéro unique généré</li>
                                            <li>Montant - Somme décaissée</li>
                                            <li>Date Décaissement - Date effective</li>
                                            <li>Mode - Type de paiement utilisé</li>
                                            <li>Référence - N° chèque/virement</li>
                                            <li>Effectué par - Agent ayant réalisé l'opération</li>
                                        </ul>
                                    </li>
                                </ul>
                                <p className="mt-2"><strong>Filtres disponibles :</strong></p>
                                <ul>
                                    <li>Période (plage de dates)</li>
                                    <li>Recherche globale (client, dossier, référence)</li>
                                </ul>
                            </div>

                            <h6 className="text-blue-600 mt-4">Points Importants</h6>
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-green-500"><i className="pi pi-check mr-2"></i>Après le Décaissement</h6>
                                        <ul className="text-sm">
                                            <li>Le statut de la demande passe automatiquement à <Tag value="Décaissé" severity="success" /></li>
                                            <li>Un numéro de décaissement unique est généré</li>
                                            <li>L'historique du workflow est mis à jour</li>
                                            <li>Le prêt devient actif dans le module Remboursement</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-orange-500"><i className="pi pi-exclamation-triangle mr-2"></i>Vérifications Préalables</h6>
                                        <ul className="text-sm">
                                            <li>Vérifier que le compte d'épargne est actif</li>
                                            <li>S'assurer que toutes les conditions sont remplies</li>
                                            <li>Confirmer l'identité du client</li>
                                            <li>Obtenir la signature du contrat de prêt</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">8.10 Clôture Journalière Crédit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                La clôture journalière du module Crédit permet de vérifier et valider tous les décaissements
                                de crédits effectués durant la journée avant leur comptabilisation.
                            </p>

                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Module Crédit" /> → <Tag value="Clôture Journalière" severity="info" /></li>
                                <li>Sélectionner la date de clôture avec le calendrier</li>
                                <li>Cliquer sur <Tag value="Charger" severity="success" /> pour afficher les décaissements du jour</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Fonctionnalités</h6>
                            <ul className="line-height-3">
                                <li><strong>Aperçu des décaissements :</strong> Affiche tous les décaissements approuvés pour la date sélectionnée avec les détails (client, montant, produit de crédit)</li>
                                <li><strong>Vérification individuelle :</strong> Chaque décaissement peut être vérifié (<i className="pi pi-check text-green-500"></i>) ou annulé</li>
                                <li><strong>Vérification en masse :</strong> Boutons <Tag value="Vérifier Tout" severity="success" /> et <Tag value="Annuler Tout" severity="danger" /> disponibles</li>
                                <li><strong>Statuts :</strong> <Tag value="VERIFIED" severity="success" /> pour les décaissements validés, <Tag value="PENDING" severity="warning" /> pour ceux en attente</li>
                                <li><strong>Statistiques :</strong> Nombre total de décaissements, montant total décaissé, progression de la vérification</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Règles Importantes</h6>
                            <div className="border-left-3 border-orange-500 pl-3">
                                <ul className="line-height-3">
                                    <li><i className="pi pi-lock text-red-500 mr-2"></i>Si la clôture comptable est complétée pour cette date, l'annulation des vérifications est <strong>interdite</strong>. Un bandeau rouge s'affiche pour l'indiquer.</li>
                                    <li><i className="pi pi-info-circle text-blue-500 mr-2"></i>Les décaissements doivent être vérifiés ici avant de pouvoir être comptabilisés</li>
                                    <li><i className="pi pi-exclamation-triangle text-orange-500 mr-2"></i>S'assurer que chaque décaissement correspond à un dossier de crédit approuvé</li>
                                </ul>
                            </div>
                        </div>

                        <h5 className="text-primary">8.11 Conseils et Bonnes Pratiques</h5>
                        <div className="surface-100 p-3 border-round">
                            <h6 className="text-blue-600">Enregistrement des Demandes</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier que le client est bien enregistré et actif</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>S'assurer que le produit de crédit correspond au besoin</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Collecter tous les documents requis dès le départ</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Bien expliquer les conditions au client</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Analyse Financière</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Saisir TOUS les revenus, même les plus petits</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Ne pas oublier les dépenses occasionnelles (santé, scolarité)</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Demander les justificatifs pour les revenus importants</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier la cohérence revenus/niveau de vie</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Visites Terrain</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Toujours capturer les coordonnées GPS</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Prendre des photos claires et pertinentes</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier les documents originaux sur place</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Interviewer le client ET les voisins si possible</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Être objectif dans la recommandation finale</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Suivi des Dossiers</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Traiter les demandes dans l'ordre d'arrivée</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Ne pas laisser un dossier en attente plus de 7 jours</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Documenter chaque décision et action</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Informer le client de l'avancement de sa demande</li>
                            </ul>
                        </div>
                    </div>
                </AccordionTab>

                {/* FAQ */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-question-circle"></i>
                            <span className="font-bold">9. Questions Fréquentes (FAQ)</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <Accordion>
                            <AccordionTab header="Comment modifier un client déjà enregistré ?">
                                <p>Dans la liste des clients, cliquez sur l'icone de modification (crayon orange) à coté du client concerné. Effectuez vos modifications et cliquez sur Enregistrer.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment ajouter un membre à un groupe existant ?">
                                <p>Dans la liste des groupes, cliquez sur l'icone des membres (utilisateurs violet). Dans la fenetre qui s'ouvre, cliquez sur "Ajouter un Membre" et sélectionnez le client.</p>
                            </AccordionTab>
                            <AccordionTab header="Pourquoi un client n'apparait-il pas dans la liste des membres potentiels ?">
                                <p>Vérifiez que le client est bien enregistré et actif dans le système. Seuls les clients avec le statut "Actif" peuvent etre ajoutés aux groupes.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment désactiver un groupe ?">
                                <p>Dans les détails du groupe, vous pouvez changer le statut vers "Suspendu" ou "Dissous". Assurez-vous de documenter la raison de ce changement.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment ajouter une nouvelle province ou commune ?">
                                <p>Accédez à la page Données de Référence, sélectionnez la catégorie "Provinces" ou "Communes", puis cliquez sur "Nouveau" pour ajouter une entrée.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment créer un nouveau produit de crédit ?">
                                <p>Accédez au menu "Produits de Crédit", cliquez sur "Nouveau Produit", remplissez tous les champs obligatoires (code, nom, type, montants, taux), configurez les frais et garanties, puis activez le produit en changeant le statut de BROUILLON à ACTIF.</p>
                            </AccordionTab>
                            <AccordionTab header="Pourquoi mon produit de crédit n'apparaît-il pas dans la liste lors de la création d'une demande ?">
                                <p>Vérifiez que le produit a le statut "ACTIF". Seuls les produits actifs sont disponibles pour les nouvelles demandes. Vérifiez également que la clientèle cible du produit correspond au type de client sélectionné.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment calculer le ratio dette/revenu (DTI) ?">
                                <p>Le système calcule automatiquement le DTI dans l'onglet "Synthèse de Capacité". Formule : (Total Dépenses Mensuelles / Total Revenus Mensuels) × 100. Un DTI inférieur à 40% est généralement recommandé.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment capturer les coordonnées GPS lors d'une visite de terrain ?">
                                <p>Dans le formulaire de visite de terrain, cliquez sur le bouton "Capturer GPS". Votre navigateur demandera la permission d'accéder à votre localisation. Acceptez, et les coordonnées seront automatiquement remplies.</p>
                            </AccordionTab>
                            <AccordionTab header="Quelle est la différence entre APPROUVÉE et DÉCAISSÉE ?">
                                <p>APPROUVÉE signifie que le comité de crédit a approuvé la demande, mais l'argent n'a pas encore été décaissé. DÉCAISSÉE signifie que le prêt a été effectivement décaissé et est devenu un prêt actif.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment effectuer un décaissement ?">
                                <p>Accédez à "Module Crédit" → "Décaissements" → "Approuvés". Localisez la demande approuvée, cliquez sur le bouton vert "Décaisser" (icône billet), sélectionnez le mode de décaissement (Espèces, Virement, Chèque ou Mobile Money), ajoutez une référence de paiement si nécessaire, puis confirmez. Le statut passera automatiquement à "Décaissé".</p>
                            </AccordionTab>
                            <AccordionTab header="Quels modes de décaissement sont disponibles ?">
                                <p>Quatre modes sont disponibles : <strong>Espèces</strong> (paiement en liquide au guichet), <strong>Virement Bancaire</strong> (transfert vers un compte bancaire), <strong>Chèque</strong> (émission d'un chèque au nom du client), et <strong>Mobile Money</strong> (transfert via service de paiement mobile). Le mode doit être sélectionné obligatoirement lors du décaissement.</p>
                            </AccordionTab>
                            <AccordionTab header="Où voir l'historique des décaissements effectués ?">
                                <p>Accédez à "Module Crédit" → "Décaissements" → "Effectués". Cette page affiche tous les décaissements réalisés avec les statistiques (total décaissé, nombre d'opérations, montant moyen). Vous pouvez filtrer par période et rechercher par client, dossier ou référence.</p>
                            </AccordionTab>
                            <AccordionTab header="Pourquoi le numéro de compte n'apparaît-il pas dans la liste des décaissements ?">
                                <p>Le numéro de compte est automatiquement récupéré depuis le compte d'épargne lié à la demande de crédit. Si le N° Compte affiche "-", vérifiez que la demande de crédit a bien un compte d'épargne associé lors de sa création. Le compte doit être actif dans le système.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment rejeter une demande de crédit ?">
                                <p>Dans la liste des demandes, sélectionnez la demande en question, cliquez sur le bouton "Rejeter", indiquez obligatoirement le motif du rejet dans le champ "Raison du Rejet", puis confirmez. Le statut passera à REJETÉE.</p>
                            </AccordionTab>
                            <AccordionTab header="Combien de photos puis-je télécharger pour une visite de terrain ?">
                                <p>Vous pouvez télécharger plusieurs photos (recommandé : 3-5 photos par visite). Les formats acceptés sont JPG, PNG. Taille maximale : 5MB par fichier.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment modifier le montant approuvé s'il diffère du montant demandé ?">
                                <p>Dans l'onglet "Revue par Comité", lors de l'approbation, vous pouvez saisir un "Montant Approuvé" différent du montant demandé. Le système enregistrera les deux montants pour traçabilité.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment ouvrir un nouveau livret d'épargne ?">
                                <p>Accédez au menu "Épargne" → "Livret d'Épargne", cliquez sur "Nouveau Livret", sélectionnez le client, choisissez le type de compte et l'agence, effectuez le dépôt initial (minimum 500 FBU), puis enregistrez. Le système génère automatiquement les numéros de compte et de livret.</p>
                            </AccordionTab>
                            <AccordionTab header="Quel est le montant minimum pour ouvrir un dépôt à terme (DAT) ?">
                                <p>Le montant minimum pour ouvrir un dépôt à terme est de 100 000 FBU. Les durées disponibles sont 3, 6, 12 et 24 mois avec des taux d'intérêt allant de 5% à 8% selon la durée choisie.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment déclarer un livret perdu ?">
                                <p>Dans la liste des livrets, cliquez sur l'icône d'alerte (triangle orange) à côté du livret concerné. Remplissez le formulaire de déclaration de perte, vérifiez l'identité du client, puis un nouveau livret sera émis avec les frais de remplacement applicables.</p>
                            </AccordionTab>
                            <AccordionTab header="Pourquoi mon retrait nécessite-t-il une double vérification ?">
                                <p>Les retraits supérieurs à 100 000 FBU nécessitent une double vérification pour des raisons de sécurité. Les retraits supérieurs à 500 000 FBU nécessitent en plus l'approbation d'un responsable. Ces contrôles protègent les clients contre les fraudes.</p>
                            </AccordionTab>
                            <AccordionTab header="Quelles sont les pénalités en cas de retrait anticipé d'un DAT ?">
                                <p>En cas de retrait anticipé d'un dépôt à terme, une pénalité de 50% des intérêts acquis est appliquée. Si le retrait intervient avant 1 mois, tous les intérêts sont perdus. Le système calcule automatiquement le montant net à verser.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment créer un groupe de tontine ?">
                                <p>Accédez à "Tontine" → "Groupes", cliquez sur "Nouveau Groupe", définissez les paramètres (nom, montant cotisation, fréquence, nombre de membres, jour de réunion), configurez les pénalités de retard et d'absence, puis ajoutez les membres avec leur ordre de tour.</p>
                            </AccordionTab>
                            <AccordionTab header="Quand l'épargne obligatoire est-elle libérée ?">
                                <p>L'épargne obligatoire est automatiquement libérée lorsque le crédit associé est entièrement remboursé. Le montant bloqué est alors viré sur le compte d'épargne libre du client. En cas de défaut de paiement, elle peut être saisie pour couvrir les arriérés.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment créer une nouvelle demande de crédit ?">
                                <p>Accédez au menu "Module Crédit" → "Demandes de Crédit", cliquez sur "Nouvelle Demande", sélectionnez le client, choisissez le produit de crédit, saisissez le montant et la durée, puis remplissez les informations sur l'objet du crédit. Le numéro de dossier est généré automatiquement.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment accéder à l'analyse financière d'une demande ?">
                                <p>Dans la liste des demandes, cliquez sur le bouton bleu "Analyse" à côté de la demande concernée. Vous accéderez à la page d'analyse où vous pourrez saisir les revenus, dépenses et calculer la capacité de remboursement.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment planifier une visite terrain ?">
                                <p>Dans la liste des demandes, cliquez sur le bouton orange "Visite" à côté de la demande. Définissez la date et l'heure prévues, sélectionnez les types de lieux à visiter, puis complétez les informations lors de la visite sur le terrain.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment capturer les coordonnées GPS lors d'une visite ?">
                                <p>Dans le formulaire de visite terrain, cliquez sur le bouton "Capturer GPS" dans la section de vérification du domicile. Votre navigateur demandera la permission d'accéder à votre localisation. Acceptez, et les coordonnées (latitude/longitude) seront automatiquement remplies.</p>
                            </AccordionTab>
                            <AccordionTab header="Qu'est-ce que le ratio DTI et comment l'interpréter ?">
                                <p>Le ratio DTI (Debt-To-Income ou Dette/Revenu) mesure la part des revenus consacrée aux remboursements. Il est calculé automatiquement : Mensualité / Revenus × 100. Un DTI inférieur à 30% indique un faible risque, entre 30-40% un risque modéré, et supérieur à 40% un risque élevé.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment faire passer une demande au comité de crédit ?">
                                <p>Une fois l'analyse financière et la visite terrain complétées, changez le statut de la demande vers "En Comité" dans l'onglet "Gestion des Demandes". La demande apparaîtra alors dans la liste des dossiers à examiner par le comité.</p>
                            </AccordionTab>
                        </Accordion>
                    </div>
                </AccordionTab>

                {/* Module Remboursement */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-replay"></i>
                            <span className="font-bold">9. Module Remboursement</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">9.1 Vue d'Ensemble</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                Le module Remboursement gère l'ensemble du cycle de remboursement des crédits,
                                depuis la génération des échéanciers jusqu'au recouvrement et contentieux.
                            </p>
                            <ul className="line-height-3">
                                <li><strong>Échéanciers :</strong> Génération et suivi des tableaux d'amortissement avec capital, intérêts, assurance et frais</li>
                                <li><strong>Paiements :</strong> Enregistrement multi-canaux (Espèces, Mobile Money, Virement, Prélèvement auto) avec allocation automatique (Pénalités → Intérêts → Assurance → Frais → Capital)</li>
                                <li><strong>Calcul Automatique des Pénalités :</strong> Planificateur configurable pour le calcul quotidien des pénalités de retard avec exécution manuelle ou automatique et historique complet</li>
                                <li><strong>Recouvrement :</strong> Gestion en 3 phases (Amiable, Relance, Contentieux) avec suivi d'actions et promesses de paiement</li>
                                <li><strong>Pénalités :</strong> Calcul automatique selon les jours de retard (0,5% à 2% par jour) avec possibilité d'exonération</li>
                                <li><strong>Remboursement Anticipé :</strong> Gestion des demandes de remboursement total ou partiel avec calcul automatique du montant de règlement</li>
                                <li><strong>Prélèvement Automatique :</strong> Traitement par lot des débits automatiques sur comptes épargne pour le paiement des échéances expirées</li>
                                <li><strong>Restructuration :</strong> Réaménagement des crédits en difficulté avec frais de 2% à 5% et extension maximale de 50%</li>
                                <li><strong>Contentieux :</strong> Gestion des dossiers juridiques avec workflow d'approbation DG et seuils contentieux configurables</li>
                                <li><strong>Rappels Automatiques :</strong> Système de notifications SMS/Email configurables avant et après échéance</li>
                                <li><strong>Collecte Mobile :</strong> Enregistrement de paiements à domicile avec géolocalisation de l'agent</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">9.2 Données de Référence</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-credit-card mr-2"></i>Modes de Remboursement</h6>
                                    <ul className="text-sm">
                                        <li><strong>Espèces (CASH) :</strong> Paiement en liquide au guichet avec reçu obligatoire</li>
                                        <li><strong>Virement Bancaire :</strong> Transfert depuis un compte bancaire (référence de transaction requise)</li>
                                        <li><strong>Mobile Money :</strong> Paiement via Lumicash, Ecocash, etc. (numéro mobile et référence requis)</li>
                                        <li><strong>Chèque :</strong> Paiement par chèque certifié (numéro de chèque et référence bancaire)</li>
                                        <li><strong>Prélèvement Automatique :</strong> Débit automatique du compte épargne du client</li>
                                        <li><strong>Collecte à Domicile :</strong> Paiement collecté par agent avec localisation GPS</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-sitemap mr-2"></i>Étapes de Recouvrement</h6>
                                    <ul className="text-sm">
                                        <li><strong>Phase Amiable (J+1 à J+30) :</strong> Rappels SMS et appels</li>
                                        <li><strong>Phase Relance (J+31 à J+90) :</strong> Lettres et visites</li>
                                        <li><strong>Phase Contentieux (J+90+) :</strong> Procédures judiciaires</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-exclamation-triangle mr-2"></i>Classifications de Retard</h6>
                                    <ul className="text-sm">
                                        <li><Tag value="Normal" severity="success" /> 1-30 jours</li>
                                        <li><Tag value="À surveiller" severity="info" /> 31-60 jours</li>
                                        <li><Tag value="Douteux" severity="warning" /> 61-90 jours</li>
                                        <li><Tag value="Contentieux" severity="danger" /> +90 jours</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-percentage mr-2"></i>Configurations Pénalités</h6>
                                    <ul className="text-sm">
                                        <li><strong>Taux journalier :</strong> 0,5% à 2%</li>
                                        <li><strong>Plafond maximum :</strong> 10% du capital dû</li>
                                        <li><strong>Période de grâce :</strong> Configurable (0-7 jours)</li>
                                        <li><strong>Base de calcul :</strong> Montant en retard ou capital restant</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-bell mr-2"></i>Règles de Rappel</h6>
                                    <ul className="text-sm">
                                        <li><strong>J+1 :</strong> SMS de rappel automatique</li>
                                        <li><strong>J+3 :</strong> Appel téléphonique</li>
                                        <li><strong>J+7 :</strong> Lettre de relance</li>
                                        <li><strong>J+15 :</strong> Visite à domicile</li>
                                        <li><strong>J+30 :</strong> Convocation</li>
                                        <li><strong>J+60 :</strong> Mise en demeure</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-refresh mr-2"></i>Configurations Restructuration</h6>
                                    <ul className="text-sm">
                                        <li><strong>Maximum :</strong> 1 restructuration par crédit</li>
                                        <li><strong>Frais :</strong> 2% à 5% du capital restant dû</li>
                                        <li><strong>Extension durée :</strong> Maximum 50% de la durée initiale</li>
                                        <li><strong>Condition :</strong> Minimum 30 jours de retard</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-shield mr-2"></i>Seuils Contentieux</h6>
                                    <ul className="text-sm">
                                        <li><strong>Montant minimum :</strong> Seuil d'impayé pour ouverture de contentieux</li>
                                        <li><strong>Jours minimum de retard :</strong> Nombre de jours avant éligibilité</li>
                                        <li><strong>Approbation DG :</strong> Requise au-delà d'un certain montant</li>
                                        <li><strong>Taux de provision :</strong> Pourcentage de provision comptable</li>
                                        <li><strong>Taux de recouvrement attendu :</strong> Estimation min/max de récupération</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary">9.3 Gestion des Échéanciers</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Consultation d'un Échéancier :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Module Remboursement" /> → <Tag value="Échéanciers" severity="info" /></li>
                                <li>Rechercher le crédit par numéro, client ou agence</li>
                                <li>Cliquer sur <i className="pi pi-eye text-blue-500"></i> pour afficher le tableau d'amortissement</li>
                            </ol>

                            <p className="mt-3"><strong>Informations de l'Échéancier :</strong></p>
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <ul className="text-sm">
                                        <li><strong>N° Échéance :</strong> Numéro séquentiel</li>
                                        <li><strong>Date Échéance :</strong> Date de paiement prévue</li>
                                        <li><strong>Capital :</strong> Part du capital à rembourser</li>
                                        <li><strong>Intérêts :</strong> Part des intérêts</li>
                                    </ul>
                                </div>
                                <div className="col-12 md:col-6">
                                    <ul className="text-sm">
                                        <li><strong>Mensualité :</strong> Total à payer (Capital + Intérêts)</li>
                                        <li><strong>Capital Restant :</strong> Solde après paiement</li>
                                        <li><strong>Statut :</strong> Payé, En cours, En retard, À venir</li>
                                    </ul>
                                </div>
                            </div>

                            <p className="mt-3"><strong>Statuts des Échéances :</strong></p>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="À venir" severity="secondary" />
                                <Tag value="En cours" severity="info" />
                                <Tag value="Payé" severity="success" />
                                <Tag value="Payé partiellement" severity="warning" />
                                <Tag value="En retard" severity="danger" />
                            </div>
                        </div>

                        <h5 className="text-primary">9.4 Saisie des Paiements</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Enregistrement d'un Paiement :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Paiements" /> → <Tag value="Saisie des Paiements" severity="info" /></li>
                                <li>Cliquer sur <Tag value="Nouveau Paiement" severity="success" /></li>
                                <li>Rechercher et sélectionner le crédit concerné</li>
                                <li>Le système affiche :
                                    <ul>
                                        <li>Solde total dû (capital + intérêts + pénalités)</li>
                                        <li>Prochaine échéance et son montant</li>
                                        <li>Montant des pénalités accumulées</li>
                                    </ul>
                                </li>
                                <li>Saisir le montant du paiement</li>
                                <li>Sélectionner le mode de paiement (Espèces, Mobile Money, etc.)</li>
                                <li>Saisir la référence de transaction si applicable</li>
                                <li>Cliquer sur <Tag value="Valider le Paiement" severity="success" /></li>
                            </ol>

                            <div className="border-left-3 border-blue-500 pl-3 mt-3">
                                <p className="text-blue-600 font-bold"><i className="pi pi-info-circle mr-2"></i>Allocation Automatique des Paiements</p>
                                <p>Le système applique automatiquement l'ordre d'allocation suivant :</p>
                                <ol>
                                    <li><strong>1. Pénalités de retard</strong> - Apurées en premier</li>
                                    <li><strong>2. Intérêts dus</strong> - Apurés en second</li>
                                    <li><strong>3. Capital</strong> - Remboursé en dernier</li>
                                </ol>
                                <p className="text-sm text-500">Cette règle garantit la couverture des frais avant le remboursement du principal.</p>
                            </div>
                        </div>

                        <h5 className="text-primary">9.5 Exonération de Pénalités</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Le système permet l'exonération totale ou partielle des pénalités de retard selon les politiques de l'institution.</p>

                            <p className="mt-3"><strong>Procédure d'Exonération :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au dossier de crédit concerné</li>
                                <li>Consulter le montant des pénalités accumulées</li>
                                <li>Cliquer sur <Tag value="Demander Exonération" severity="warning" /></li>
                                <li>Remplir le formulaire :
                                    <ul>
                                        <li><strong>Montant à exonérer :</strong> Total ou partiel des pénalités</li>
                                        <li><strong>Motif :</strong> Justification détaillée (force majeure, bon historique, etc.)</li>
                                        <li><strong>Documents justificatifs :</strong> Si nécessaire</li>
                                    </ul>
                                </li>
                                <li>Soumettre pour approbation hiérarchique</li>
                                <li>Une fois approuvée, l'exonération est appliquée et tracée dans l'historique</li>
                            </ol>

                            <div className="border-left-3 border-orange-500 pl-3 mt-3">
                                <p className="text-orange-600 font-bold"><i className="pi pi-info-circle mr-2"></i>Niveaux d'Autorisation</p>
                                <ul className="text-sm">
                                    <li><strong>Agent de crédit :</strong> Jusqu'à 10 000 FBU</li>
                                    <li><strong>Chef d'agence :</strong> Jusqu'à 50 000 FBU</li>
                                    <li><strong>Chef de crédit :</strong> Jusqu'à 200 000 FBU</li>
                                    <li><strong>Directeur Général :</strong> Au-delà de 200 000 FBU</li>
                                </ul>
                            </div>
                        </div>

                        <h5 className="text-primary">9.6 Calcul Automatique des Pénalités</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                Le module de Calcul Automatique des Pénalités permet de configurer et exécuter le calcul
                                des pénalités de retard sur les échéances impayées, soit manuellement, soit via un planificateur automatique.
                            </p>

                            <div className="grid mt-3">
                                <div className="col-12 md:col-6">
                                    <Card className="h-full border-left-3 border-blue-500">
                                        <h6 className="mt-0 text-blue-600">
                                            <i className="pi pi-cog mr-2"></i>
                                            Onglet Configuration
                                        </h6>
                                        <p className="text-sm">Paramétrage du calcul des pénalités :</p>
                                        <ul className="text-sm line-height-3">
                                            <li><strong>Taux journalier :</strong> Pourcentage appliqué par jour de retard</li>
                                            <li><strong>Plafond maximum :</strong> Pourcentage max du capital restant dû</li>
                                            <li><strong>Base de calcul :</strong> Capital impayé, intérêts impayés, ou les deux combinés</li>
                                            <li><strong>Activation du planificateur :</strong> Activer/désactiver le calcul automatique quotidien</li>
                                            <li><strong>Heure d'exécution :</strong> Configurer l'heure et la minute d'exécution automatique</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="h-full border-left-3 border-green-500">
                                        <h6 className="mt-0 text-green-600">
                                            <i className="pi pi-history mr-2"></i>
                                            Onglet Historique
                                        </h6>
                                        <p className="text-sm">Suivi des exécutions :</p>
                                        <ul className="text-sm line-height-3">
                                            <li><strong>Liste des exécutions :</strong> Date, statut, durée, échéances traitées</li>
                                            <li><strong>Montants calculés :</strong> Total des pénalités par exécution</li>
                                            <li><strong>Journal détaillé :</strong> Logs d'exécution avec messages de succès ou d'erreur</li>
                                            <li><strong>Performances :</strong> Durée d'exécution et nombre d'échéances traitées</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>

                            <div className="border-left-3 border-blue-500 pl-3 mt-3">
                                <p className="text-blue-600 font-bold"><i className="pi pi-calculator mr-2"></i>Formule de Calcul des Pénalités</p>
                                <p className="text-sm">
                                    <strong>Pénalité = (Capital impayé + Intérêts impayés + Pénalités non payées) × Taux Journalier</strong>
                                </p>
                                <p className="text-sm">
                                    Le plafond maximum empêche les pénalités de dépasser un pourcentage défini du capital restant dû,
                                    protégeant ainsi les emprunteurs contre des pénalités excessives.
                                </p>
                            </div>

                            <p className="mt-3"><strong>Procédure de Configuration :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Module Remboursement" /> → <Tag value="Calcul Pénalités" severity="info" /></li>
                                <li>Dans l'onglet <Tag value="Configuration" severity="info" />, définir :
                                    <ul>
                                        <li>Le taux journalier de pénalité (ex: 0,1%)</li>
                                        <li>Le plafond maximum (ex: 10% du capital restant)</li>
                                        <li>La base de calcul (montant en retard ou capital + intérêts)</li>
                                    </ul>
                                </li>
                                <li>Activer le planificateur automatique si souhaité</li>
                                <li>Configurer l'heure d'exécution automatique</li>
                                <li>Cliquer sur <Tag value="Enregistrer" severity="success" /></li>
                            </ol>

                            <p className="mt-3"><strong>Exécution Manuelle :</strong></p>
                            <ol className="line-height-3">
                                <li>Cliquer sur <Tag value="Exécuter Maintenant" severity="warning" /> pour lancer le calcul manuellement</li>
                                <li>Le système calcule les pénalités pour toutes les échéances en retard</li>
                                <li>Un résumé s'affiche avec le nombre d'échéances traitées et le montant total calculé</li>
                                <li>Consulter l'onglet <Tag value="Historique" severity="info" /> pour voir les détails</li>
                            </ol>

                            <p className="mt-3"><strong>Consultation des Échéances en Retard :</strong></p>
                            <p className="text-sm">
                                L'onglet <Tag value="Échéances en Retard" severity="warning" /> affiche la liste de toutes les échéances
                                actuellement en retard susceptibles d'être soumises au calcul de pénalités, avec les détails du crédit,
                                du client, des montants dus et du nombre de jours de retard.
                            </p>

                            <p className="mt-3"><strong>Statuts d'Exécution :</strong></p>
                            <div className="flex flex-wrap gap-2">
                                <Tag value="COMPLETED" severity="success" />
                                <Tag value="RUNNING" severity="info" />
                                <Tag value="FAILED" severity="danger" />
                                <Tag value="PENDING" severity="warning" />
                            </div>
                        </div>

                        <h5 className="text-primary">9.7 Remboursement Anticipé</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Procédure de Remboursement Anticipé :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Paiements" /> → <Tag value="Remboursement Anticipé" severity="info" /></li>
                                <li>Rechercher et sélectionner le crédit</li>
                                <li>Le système calcule automatiquement :
                                    <ul>
                                        <li><strong>Capital restant dû :</strong> Montant du principal non remboursé</li>
                                        <li><strong>Intérêts courus :</strong> Intérêts jusqu'à la date de remboursement</li>
                                        <li><strong>Pénalités :</strong> Si en retard</li>
                                        <li><strong>Indemnité de remboursement anticipé :</strong> Selon les conditions du produit (généralement 1-2%)</li>
                                        <li><strong>Total à payer :</strong> Somme de tous les éléments</li>
                                    </ul>
                                </li>
                                <li>Choisir entre :
                                    <ul>
                                        <li><strong>Remboursement total :</strong> Solde complet du crédit</li>
                                        <li><strong>Remboursement partiel :</strong> Réduction du capital avec recalcul des échéances</li>
                                    </ul>
                                </li>
                                <li>Valider le remboursement et imprimer le reçu de clôture</li>
                            </ol>
                        </div>

                        <h5 className="text-primary">9.8 Gestion du Recouvrement</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Les 3 Phases du Recouvrement :</strong></p>

                            <div className="grid mt-3">
                                <div className="col-12 md:col-4">
                                    <Card className="h-full border-left-3 border-green-500">
                                        <h6 className="mt-0 text-green-600">
                                            <i className="pi pi-comments mr-2"></i>
                                            Phase Amiable (J+1 à J+30)
                                        </h6>
                                        <p className="text-sm">Actions préventives et rappels courtois</p>
                                        <ul className="text-sm line-height-3">
                                            <li>SMS automatiques de rappel</li>
                                            <li>Appels téléphoniques de relance</li>
                                            <li>Négociation d'un plan de paiement</li>
                                            <li>Pas de frais supplémentaires significatifs</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-4">
                                    <Card className="h-full border-left-3 border-orange-500">
                                        <h6 className="mt-0 text-orange-600">
                                            <i className="pi pi-envelope mr-2"></i>
                                            Phase Relance (J+31 à J+90)
                                        </h6>
                                        <p className="text-sm">Intensification des actions de recouvrement</p>
                                        <ul className="text-sm line-height-3">
                                            <li>Lettres de relance officielles</li>
                                            <li>Visites à domicile</li>
                                            <li>Convocations à l'agence</li>
                                            <li>Contact des garants</li>
                                            <li>Pénalités de retard appliquées</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-4">
                                    <Card className="h-full border-left-3 border-red-500">
                                        <h6 className="mt-0 text-red-600">
                                            <i className="pi pi-briefcase mr-2"></i>
                                            Phase Contentieux (J+90+)
                                        </h6>
                                        <p className="text-sm">Procédures judiciaires et légales</p>
                                        <ul className="text-sm line-height-3">
                                            <li>Mise en demeure formelle</li>
                                            <li>Transmission au service juridique</li>
                                            <li>Saisie des garanties</li>
                                            <li>Action en justice</li>
                                            <li>Approbation DG requise si &gt; 500 000 FBU</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>

                            <p className="mt-3"><strong>Création d'un Dossier de Recouvrement :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Recouvrement" /> → <Tag value="Dossiers de Recouvrement" severity="info" /></li>
                                <li>Le système liste automatiquement tous les crédits en retard</li>
                                <li>Cliquer sur <Tag value="Ouvrir Dossier" severity="warning" /> pour créer un dossier de suivi</li>
                                <li>Définir la priorité du dossier :
                                    <ul>
                                        <li><Tag value="Faible" severity="success" /> : Retard mineur, client coopératif</li>
                                        <li><Tag value="Normale" severity="info" /> : Cas standard de recouvrement</li>
                                        <li><Tag value="Haute" severity="warning" /> : Montant élevé ou retard prolongé</li>
                                        <li><Tag value="Critique" severity="danger" /> : Risque de perte majeure, action urgente requise</li>
                                    </ul>
                                </li>
                                <li>Assigner un agent de recouvrement</li>
                                <li>Planifier les actions selon la phase</li>
                                <li>Documenter chaque action entreprise</li>
                            </ol>

                            <p className="mt-3"><strong>Suivi des Actions de Recouvrement :</strong></p>
                            <div className="grid mt-2">
                                <div className="col-12 md:col-6">
                                    <p className="font-semibold text-sm mb-2">Types d'Actions Disponibles :</p>
                                    <ul className="text-sm">
                                        <li><strong>Appel téléphonique :</strong> Contact direct avec le client</li>
                                        <li><strong>SMS envoyé :</strong> Rappel par message texte</li>
                                        <li><strong>Visite à domicile :</strong> Déplacement chez le client</li>
                                        <li><strong>Lettre de rappel :</strong> Correspondance officielle</li>
                                        <li><strong>Mise en demeure :</strong> Avertissement formel</li>
                                        <li><strong>Médiation :</strong> Recherche de solution amiable</li>
                                        <li><strong>Réunion en agence :</strong> Convocation du client</li>
                                        <li><strong>Contact caution :</strong> Sollicitation des garants</li>
                                    </ul>
                                </div>
                                <div className="col-12 md:col-6">
                                    <p className="font-semibold text-sm mb-2">Informations à Documenter :</p>
                                    <ul className="text-sm">
                                        <li>Date et heure de l'action</li>
                                        <li>Personne contactée (nom et téléphone)</li>
                                        <li>Résultat de l'action (Contacté, Injoignable, Refus, etc.)</li>
                                        <li>Promesse de paiement si applicable (date et montant)</li>
                                        <li>Prochaine action planifiée</li>
                                        <li>Notes et observations</li>
                                        <li>Documents générés (références)</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="border-left-3 border-blue-500 pl-3 mt-3">
                                <p className="text-blue-600 font-bold"><i className="pi pi-info-circle mr-2"></i>Suivi des Promesses de Paiement</p>
                                <p className="text-sm">Lorsqu'un client s'engage à payer à une date précise :</p>
                                <ol className="text-sm">
                                    <li>Enregistrer la <strong>date de promesse</strong> et le <strong>montant promis</strong> dans le dossier</li>
                                    <li>Le système génère automatiquement un rappel J-1 avant la date promise</li>
                                    <li>Si le paiement n'est pas honoré, le dossier est automatiquement escaladé en priorité</li>
                                    <li>L'historique des promesses non tenues est tracé pour évaluation du comportement client</li>
                                </ol>
                            </div>

                            <p className="mt-3"><strong>Escalade d'un Dossier :</strong></p>
                            <p className="text-sm">Un dossier peut être escaladé au niveau supérieur lorsque :</p>
                            <ul className="text-sm line-height-3">
                                <li>Les actions de recouvrement standard échouent</li>
                                <li>Le client devient injoignable ou refuse de coopérer</li>
                                <li>Le montant impayé dépasse un seuil critique (configurable)</li>
                                <li>Plusieurs promesses de paiement ne sont pas honorées</li>
                            </ul>
                            <p className="text-sm mt-2">L'escalade notifie automatiquement le superviseur ou chef de crédit qui reprend le dossier avec des actions plus fermes.</p>
                        </div>

                        <h5 className="text-primary">9.9 Gestion des Dossiers Contentieux</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <div className="border-left-3 border-red-500 pl-3 mb-3">
                                <p className="text-red-600 font-bold">
                                    <i className="pi pi-exclamation-triangle mr-2"></i>
                                    Règle Importante - Approbation du Directeur Général
                                </p>
                                <p>Tout dossier contentieux supérieur à <strong>500 000 FBU</strong> nécessite l'approbation du Directeur Général avant toute action judiciaire.</p>
                            </div>

                            <p><strong>Création d'un Dossier Contentieux :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Contentieux" /> → <Tag value="Dossiers Contentieux" severity="info" /></li>
                                <li>Cliquer sur <Tag value="Nouveau Dossier" severity="danger" /></li>
                                <li>Sélectionner le crédit en défaut (doit être en phase Contentieux)</li>
                                <li>Remplir les informations :
                                    <ul>
                                        <li><strong>Motif de la mise en contentieux :</strong> Justification détaillée de l'échec du recouvrement amiable</li>
                                        <li><strong>Montant litigieux :</strong> Montant total réclamé (capital + intérêts + pénalités)</li>
                                        <li><strong>Avocat assigné :</strong> Nom et coordonnées du conseiller juridique</li>
                                        <li><strong>Tribunal compétent :</strong> Nom et localisation du tribunal de ressort</li>
                                        <li><strong>Estimation des frais :</strong>
                                            <ul>
                                                <li>Frais d'avocat</li>
                                                <li>Frais d'huissier</li>
                                                <li>Autres frais juridiques</li>
                                            </ul>
                                        </li>
                                        <li><strong>Documents justificatifs :</strong> Contrat de prêt, échéancier, preuves de relance, etc.</li>
                                    </ul>
                                </li>
                                <li>Si le montant &gt; 500 000 FBU :
                                    <ul>
                                        <li>Le statut passe automatiquement à <Tag value="En attente Approbation DG" severity="warning" /></li>
                                        <li>Le DG reçoit une notification par email et dans son tableau de bord</li>
                                        <li>Aucune action judiciaire n'est possible avant approbation</li>
                                        <li>Le dossier reste bloqué avec un cadenas <i className="pi pi-lock"></i></li>
                                    </ul>
                                </li>
                                <li>Si le montant ≤ 500 000 FBU, le chef de crédit peut approuver directement</li>
                            </ol>

                            <p className="mt-3"><strong>Workflow d'Approbation DG :</strong></p>
                            <div className="grid mt-2">
                                <div className="col-12 md:col-6">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-blue-600">Côté Demandeur</h6>
                                        <ul className="text-sm">
                                            <li>Soumettre le dossier avec justifications complètes</li>
                                            <li>Attendre la notification de décision (généralement 24-48h)</li>
                                            <li>Consulter le statut dans le menu <Tag value="Mes Demandes" size="small" /></li>
                                            <li>Si approuvé : Poursuivre les actions judiciaires</li>
                                            <li>Si rejeté : Consulter le motif et reprendre le recouvrement amiable</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-green-600">Côté DG</h6>
                                        <ul className="text-sm">
                                            <li>Accéder au menu <Tag value="Approbations DG" size="small" severity="warning" /></li>
                                            <li>Examiner les dossiers en attente</li>
                                            <li>Consulter l'historique complet du dossier</li>
                                            <li>Valider l'estimation des frais juridiques</li>
                                            <li>Approuver ou rejeter avec commentaires</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>

                            <p className="mt-3"><strong>Suivi de la Procédure Judiciaire :</strong></p>
                            <ol className="line-height-3">
                                <li><strong>Dépôt du dossier :</strong> Enregistrer la date de dépôt et le numéro de dossier tribunal</li>
                                <li><strong>Convocation à l'audience :</strong> Saisir la date d'audience programmée</li>
                                <li><strong>Suivi des audiences :</strong> Documenter chaque comparution et décision intermédiaire</li>
                                <li><strong>Jugement :</strong> Enregistrer la date et le résultat :
                                    <ul>
                                        <li><Tag value="Favorable" severity="success" size="small" /> : Gain total</li>
                                        <li><Tag value="Partiellement favorable" severity="info" size="small" /> : Gain partiel</li>
                                        <li><Tag value="Défavorable" severity="danger" size="small" /> : Perte</li>
                                        <li><Tag value="Arrangement" severity="warning" size="small" /> : Accord à l'amiable</li>
                                    </ul>
                                </li>
                                <li><strong>Montant accordé :</strong> Saisir le montant alloué par le tribunal</li>
                                <li><strong>Phase d'exécution :</strong> Si jugement favorable, suivre la saisie et le recouvrement effectif</li>
                                <li><strong>Montant recouvré :</strong> Enregistrer les montants effectivement récupérés</li>
                                <li><strong>Clôture :</strong> Fermer le dossier avec le motif (Recouvré totalement, Partiellement, Irrécupérable, etc.)</li>
                            </ol>

                            <p className="mt-3"><strong>Statuts des Dossiers Contentieux :</strong></p>
                            <div className="flex flex-wrap gap-2 align-items-center">
                                <Tag value="En préparation" severity="secondary" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="En attente Approbation DG" severity="warning" icon="pi pi-lock" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Approuvé par DG" severity="success" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Déposé au tribunal" severity="info" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Audience programmée" severity="info" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="En attente jugement" severity="warning" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Jugement rendu" severity="info" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="En exécution" severity="warning" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Clôturé" severity="success" />
                            </div>

                            <div className="border-left-3 border-orange-500 pl-3 mt-3">
                                <p className="text-orange-600 font-bold"><i className="pi pi-info-circle mr-2"></i>Gestion des Frais Juridiques</p>
                                <p className="text-sm">Le système permet de suivre tous les frais engagés dans la procédure :</p>
                                <ul className="text-sm">
                                    <li><strong>Frais d'avocat :</strong> Honoraires du conseil juridique</li>
                                    <li><strong>Frais d'huissier :</strong> Coûts de signification et d'exécution</li>
                                    <li><strong>Autres frais :</strong> Timbres, déplacements, experts, etc.</li>
                                    <li><strong>Total des coûts :</strong> Calculé automatiquement pour évaluer la rentabilité de l'action</li>
                                </ul>
                                <p className="text-sm mt-2">Ces coûts sont comparés au montant recouvré pour déterminer le résultat net de l'action contentieuse.</p>
                            </div>
                        </div>

                        <h5 className="text-primary">9.10 Restructuration de Crédit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Conditions de Restructuration :</strong></p>
                            <ul className="line-height-3">
                                <li>Maximum <strong>1 restructuration</strong> par crédit</li>
                                <li>Minimum <strong>30 jours de retard</strong> pour être éligible</li>
                                <li>Frais de restructuration : <strong>2% à 5%</strong> du capital restant dû</li>
                                <li>Extension maximale de la durée : <strong>50%</strong> de la durée initiale</li>
                            </ul>

                            <p className="mt-3"><strong>Procédure de Restructuration :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Recouvrement" /> → <Tag value="Restructuration" severity="info" /></li>
                                <li>Sélectionner le crédit éligible</li>
                                <li>Proposer un nouveau plan :
                                    <ul>
                                        <li>Nouvelle durée (dans les limites autorisées)</li>
                                        <li>Nouvelle fréquence de remboursement</li>
                                        <li>Incorporation des arriérés et pénalités</li>
                                    </ul>
                                </li>
                                <li>Le système calcule :
                                    <ul>
                                        <li>Frais de restructuration</li>
                                        <li>Nouvelle mensualité</li>
                                        <li>Nouvel échéancier</li>
                                    </ul>
                                </li>
                                <li>Soumettre pour approbation (selon niveau d'autorisation)</li>
                                <li>Faire signer le nouveau contrat au client</li>
                                <li>Activer le nouvel échéancier</li>
                            </ol>
                        </div>

                        <h5 className="text-primary">9.11 Rapports du Module Remboursement</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Le module Remboursement offre une suite complète de rapports pour le suivi et l'analyse des performances de recouvrement.</p>

                            <p className="mt-3"><strong>Accès aux Rapports :</strong></p>
                            <ol className="text-sm line-height-3">
                                <li>Accéder au menu <Tag value="Module Remboursement" /> → <Tag value="Rapports" severity="info" /></li>
                                <li>Sélectionner le type de rapport souhaité</li>
                                <li>Définir les filtres (période, agence, agent, statut, etc.)</li>
                                <li>Cliquer sur <Tag value="Générer" severity="success" size="small" /></li>
                                <li>Visualiser les résultats à l'écran</li>
                                <li>Exporter en <Tag value="PDF" severity="danger" size="small" icon="pi pi-file-pdf" /> ou <Tag value="Excel" severity="success" size="small" icon="pi pi-file-excel" /></li>
                            </ol>
                        </div>

                        <div className="grid mb-3">
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-money-bill mr-2"></i>Rapport des Paiements</h6>
                                    <ul className="text-sm">
                                        <li>Liste détaillée des paiements par période</li>
                                        <li>Filtrage par mode de paiement (Espèces, Mobile Money, etc.)</li>
                                        <li>Totaux par catégorie (Capital, Intérêts, Pénalités, Assurance, Frais)</li>
                                        <li>Ventilation par agent de collecte</li>
                                        <li>Recherche par numéro de reçu ou référence</li>
                                        <li>Export Excel et PDF avec graphiques</li>
                                    </ul>
                                    <div className="mt-2 p-2 surface-100 border-round">
                                        <p className="text-xs font-semibold mb-1">Utilisation recommandée :</p>
                                        <p className="text-xs">Rapprochement de caisse quotidien, validation des encaissements, suivi des performances de collecte</p>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-exclamation-triangle mr-2"></i>Rapport des Retards</h6>
                                    <ul className="text-sm">
                                        <li>Liste complète des crédits en retard</li>
                                        <li>Classification par jours de retard (1-30, 31-60, 61-90, 90+)</li>
                                        <li>Montants impayés détaillés (capital, intérêts, pénalités)</li>
                                        <li>Coordonnées clients pour relance (téléphone, adresse)</li>
                                        <li>Historique des derniers contacts</li>
                                        <li>Taux de provisionnement recommandé</li>
                                    </ul>
                                    <div className="mt-2 p-2 surface-100 border-round">
                                        <p className="text-xs font-semibold mb-1">Utilisation recommandée :</p>
                                        <p className="text-xs">Planning quotidien des relances, distribution des dossiers aux agents de recouvrement, analyse du portefeuille à risque</p>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-users mr-2"></i>Rapport Recouvrement</h6>
                                    <ul className="text-sm">
                                        <li>Dossiers par phase de recouvrement (Amiable, Relance, Contentieux)</li>
                                        <li>Taux de recouvrement par agent</li>
                                        <li>Actions effectuées et résultats obtenus</li>
                                        <li>Promesses de paiement en attente</li>
                                        <li>Comparaison des performances entre agents</li>
                                        <li>Efficacité des différentes actions (appels, visites, lettres)</li>
                                    </ul>
                                    <div className="mt-2 p-2 surface-100 border-round">
                                        <p className="text-xs font-semibold mb-1">Utilisation recommandée :</p>
                                        <p className="text-xs">Évaluation des agents de recouvrement, optimisation des stratégies de relance, identification des meilleures pratiques</p>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-briefcase mr-2"></i>Rapport Contentieux</h6>
                                    <ul className="text-sm">
                                        <li>Dossiers par statut juridique</li>
                                        <li>Montants en contentieux par agence</li>
                                        <li>Dossiers en attente approbation DG avec montants</li>
                                        <li>Résultats des procédures (favorable, défavorable, arrangement)</li>
                                        <li>Frais juridiques engagés vs montants récupérés</li>
                                        <li>Rentabilité des actions contentieuses</li>
                                    </ul>
                                    <div className="mt-2 p-2 surface-100 border-round">
                                        <p className="text-xs font-semibold mb-1">Utilisation recommandée :</p>
                                        <p className="text-xs">Suivi des procédures judiciaires, analyse coût-bénéfice du contentieux, reporting à la direction générale</p>
                                    </div>
                                </Card>
                            </div>
                            <div className="col-12">
                                <Card>
                                    <h6 className="mt-0"><i className="pi pi-chart-pie mr-2"></i>Synthèse Remboursement</h6>
                                    <p className="text-sm">Tableau de bord complet avec indicateurs clés de performance (KPI) :</p>
                                    <div className="grid">
                                        <div className="col-12 md:col-3">
                                            <ul className="text-sm">
                                                <li><strong>Crédits Actifs :</strong> Nombre et encours total</li>
                                                <li><strong>Échéances du jour :</strong> Montant attendu</li>
                                            </ul>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <ul className="text-sm">
                                                <li><strong>Montant collecté :</strong> Aujourd'hui, mois, année</li>
                                                <li><strong>Taux de recouvrement :</strong> % des échéances honorées</li>
                                            </ul>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <ul className="text-sm">
                                                <li><strong>Crédits en retard :</strong> Par classification</li>
                                                <li><strong>Montant impayé :</strong> Total et par phase</li>
                                            </ul>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <ul className="text-sm">
                                                <li><strong>Graphiques de tendance :</strong> Évolution mensuelle</li>
                                                <li><strong>Top 10 impayés :</strong> Clients à risque critique</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 surface-100 border-round">
                                        <p className="text-sm font-semibold mb-2"><i className="pi pi-chart-bar mr-2"></i>Indicateurs Visuels :</p>
                                        <div className="grid">
                                            <div className="col-12 md:col-4">
                                                <p className="text-xs"><strong>Graphique à barres :</strong> Collecte mensuelle comparée aux objectifs</p>
                                            </div>
                                            <div className="col-12 md:col-4">
                                                <p className="text-xs"><strong>Graphique circulaire :</strong> Répartition des retards par classification</p>
                                            </div>
                                            <div className="col-12 md:col-4">
                                                <p className="text-xs"><strong>Courbe de tendance :</strong> Évolution du PAR (Portfolio At Risk) sur 12 mois</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="border-left-3 border-green-500 pl-3 mb-3">
                            <p className="text-green-600 font-bold"><i className="pi pi-file-pdf mr-2"></i>Export PDF des Rapports</p>
                            <p className="text-sm">Tous les rapports peuvent être exportés au format PDF avec :</p>
                            <ul className="text-sm">
                                <li>En-tête personnalisé avec logo de l'institution</li>
                                <li>Informations de génération (date, heure, utilisateur)</li>
                                <li>Filtres appliqués clairement indiqués</li>
                                <li>Tableaux de données formatés et lisibles</li>
                                <li>Graphiques et visualisations intégrés</li>
                                <li>Totaux et sous-totaux mis en évidence</li>
                                <li>Pied de page avec pagination et mentions légales</li>
                            </ul>
                            <p className="text-sm mt-2">Les exports PDF sont optimisés pour l'impression et l'archivage réglementaire.</p>
                        </div>

                        <h5 className="text-primary">9.12 Clôture Journalière Remboursement</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                La clôture journalière du module Remboursement permet de vérifier et valider tous les paiements
                                de remboursement et les remboursements anticipés effectués durant la journée.
                            </p>

                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Module Remboursement" /> → <Tag value="Clôture Journalière" severity="info" /></li>
                                <li>Sélectionner la date de clôture avec le calendrier</li>
                                <li>Cliquer sur <Tag value="Charger" severity="success" /> pour afficher les opérations du jour</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Fonctionnalités</h6>
                            <ul className="line-height-3">
                                <li><strong>Paiements de remboursement :</strong> Liste de tous les paiements d'échéances effectués pour la date (client, montant, échéance concernée)</li>
                                <li><strong>Remboursements anticipés :</strong> Liste séparée des remboursements anticipés avec le montant total et les pénalités éventuelles</li>
                                <li><strong>Vérification individuelle :</strong> Chaque paiement peut être vérifié ou annulé séparément</li>
                                <li><strong>Vérification en masse :</strong> Boutons <Tag value="Vérifier Tout" severity="success" /> et <Tag value="Annuler Tout" severity="danger" /> pour les deux types</li>
                                <li><strong>Statuts :</strong> <Tag value="VERIFIED" severity="success" /> / <Tag value="PENDING" severity="warning" /> pour chaque opération</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Règles Importantes</h6>
                            <div className="border-left-3 border-orange-500 pl-3">
                                <ul className="line-height-3">
                                    <li><i className="pi pi-lock text-red-500 mr-2"></i>Si la clôture comptable est complétée pour cette date, l'annulation des vérifications est <strong>interdite</strong>. Un bandeau rouge s'affiche pour l'indiquer.</li>
                                    <li><i className="pi pi-info-circle text-blue-500 mr-2"></i>Les paiements doivent être vérifiés ici avant la comptabilisation dans le module Comptabilité</li>
                                    <li><i className="pi pi-exclamation-triangle text-orange-500 mr-2"></i>Vérifier la concordance entre le montant enregistré et le montant effectivement reçu</li>
                                </ul>
                            </div>
                        </div>

                        <h5 className="text-primary">9.13 Meilleures Pratiques & Conseils</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p className="font-bold text-primary mb-2"><i className="pi pi-lightbulb mr-2"></i>Recommandations pour une Gestion Efficace du Remboursement</p>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-green-600"><i className="pi pi-check-circle mr-2"></i>À FAIRE</h6>
                                        <ul className="text-sm line-height-3">
                                            <li><strong>Enregistrer les paiements immédiatement :</strong> Ne pas attendre la fin de journée pour éviter les oublis</li>
                                            <li><strong>Vérifier systématiquement les références :</strong> Pour Mobile Money et virements, toujours saisir la référence de transaction</li>
                                            <li><strong>Documenter chaque action de recouvrement :</strong> Plus l'historique est détaillé, meilleure est la défense en contentieux</li>
                                            <li><strong>Prioriser les retards J+1 à J+7 :</strong> L'intervention précoce donne les meilleurs taux de récupération</li>
                                            <li><strong>Suivre les promesses de paiement :</strong> Rappeler les clients la veille de leur engagement</li>
                                            <li><strong>Consulter les rapports quotidiennement :</strong> Anticiper les problèmes avant qu'ils ne s'aggravent</li>
                                            <li><strong>Utiliser le prélèvement automatique :</strong> Encourager les clients à opter pour ce mode sécurisé</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-red-600"><i className="pi pi-times-circle mr-2"></i>À ÉVITER</h6>
                                        <ul className="text-sm line-height-3">
                                            <li><strong>Ne jamais annuler un paiement sans approbation :</strong> Toute modification doit être justifiée et tracée</li>
                                            <li><strong>Ne pas exonérer de pénalités sans motif valable :</strong> Respecter les niveaux d'autorisation</li>
                                            <li><strong>Éviter les promesses verbales non documentées :</strong> Tout engagement doit être enregistré dans le système</li>
                                            <li><strong>Ne pas retarder l'escalade des dossiers critiques :</strong> Passer au niveau supérieur dès que nécessaire</li>
                                            <li><strong>Ne pas négliger les petits montants :</strong> Les petits impayés cumulés deviennent des grosses pertes</li>
                                            <li><strong>Éviter les restructurations précipitées :</strong> Bien analyser la capacité réelle du client avant</li>
                                            <li><strong>Ne pas oublier de contacter les garants :</strong> C'est souvent la clé du recouvrement</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>

                            <div className="mt-3 p-3 border-left-3 border-blue-500">
                                <h6 className="text-blue-600 mt-0"><i className="pi pi-chart-line mr-2"></i>Indicateurs de Performance Clés (KPI) à Suivre</h6>
                                <div className="grid">
                                    <div className="col-12 md:col-4">
                                        <p className="text-sm font-semibold">Taux de Recouvrement</p>
                                        <p className="text-xs">Objectif : <strong>&gt; 95%</strong></p>
                                        <p className="text-xs">Montant collecté / Montant attendu × 100</p>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <p className="text-sm font-semibold">PAR 30 (Portfolio At Risk)</p>
                                        <p className="text-xs">Objectif : <strong>&lt; 5%</strong></p>
                                        <p className="text-xs">Encours avec retard &gt; 30 jours / Encours total</p>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <p className="text-sm font-semibold">Délai Moyen de Recouvrement</p>
                                        <p className="text-xs">Objectif : <strong>&lt; 15 jours</strong></p>
                                        <p className="text-xs">Temps moyen entre retard et paiement effectif</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 p-3 border-left-3 border-orange-500">
                                <h6 className="text-orange-600 mt-0"><i className="pi pi-calendar mr-2"></i>Routine Quotidienne Recommandée</h6>
                                <ol className="text-sm line-height-3">
                                    <li><strong>Matin (8h-9h) :</strong>
                                        <ul>
                                            <li>Consulter le rapport des échéances du jour</li>
                                            <li>Envoyer les SMS de rappel aux clients dont l'échéance est aujourd'hui</li>
                                            <li>Prioriser les dossiers de recouvrement à traiter</li>
                                        </ul>
                                    </li>
                                    <li><strong>Journée (9h-17h) :</strong>
                                        <ul>
                                            <li>Enregistrer les paiements reçus en temps réel</li>
                                            <li>Effectuer les appels de relance pour retards J+1 à J+7</li>
                                            <li>Documenter toutes les actions de recouvrement</li>
                                            <li>Suivre les promesses de paiement à échoir aujourd'hui</li>
                                        </ul>
                                    </li>
                                    <li><strong>Fin de journée (17h-18h) :</strong>
                                        <ul>
                                            <li>Vérifier le rapprochement caisse vs système</li>
                                            <li>Consulter le rapport de collecte du jour</li>
                                            <li>Planifier les visites terrain du lendemain</li>
                                            <li>Escalader les dossiers problématiques au superviseur</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>

                            <div className="mt-3 p-3 border-left-3 border-green-500">
                                <h6 className="text-green-600 mt-0"><i className="pi pi-trophy mr-2"></i>Stratégies Gagnantes de Recouvrement</h6>
                                <ul className="text-sm line-height-3">
                                    <li><strong>Personnalisation du contact :</strong> Adapter le ton et l'approche selon le profil du client (âge, éducation, historique)</li>
                                    <li><strong>Meilleur moment d'appel :</strong> Entre 9h-11h et 14h-16h, éviter l'heure du déjeuner et après 18h</li>
                                    <li><strong>Technique du rappel progressif :</strong> SMS J+1, Appel J+3, Visite J+7 - respecter cette escalade</li>
                                    <li><strong>Proposition de solution :</strong> Offrir des alternatives (paiement partiel, report d'échéance) plutôt que juste réclamer</li>
                                    <li><strong>Activation des garants tôt :</strong> Informer les cautions dès J+15, ne pas attendre J+30</li>
                                    <li><strong>Utilisation des groupes solidaires :</strong> Solliciter la pression positive du groupe pour inciter au paiement</li>
                                    <li><strong>Maintien du contact :</strong> Même sans paiement, garder le lien avec le client (visite sociale, appel courtois)</li>
                                </ul>
                            </div>
                        </div>

                        <h5 className="text-primary">9.13 Questions Fréquentes - Remboursement</h5>
                        <Accordion>
                            <AccordionTab header="Comment le système calcule-t-il les pénalités de retard ?">
                                <p>Les pénalités sont calculées selon la formule : <strong>Pénalité = Montant en retard × Taux journalier × Nombre de jours de retard</strong>. Le taux journalier est configuré dans les données de référence (généralement 0,5% à 2%). Un plafond maximum de 10% du capital restant dû est appliqué pour éviter des pénalités excessives.</p>
                            </AccordionTab>
                            <AccordionTab header="Pourquoi mon paiement n'a-t-il pas réduit le capital ?">
                                <p>Le système applique l'ordre d'allocation automatique : <strong>Pénalités → Intérêts → Assurance → Frais → Capital</strong>. Si le paiement n'a pas réduit le capital, c'est qu'il a d'abord servi à couvrir les pénalités, intérêts, assurance et frais dus. Consultez le détail de la ventilation dans le reçu de paiement pour voir exactement comment le montant a été alloué.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment enregistrer un paiement Mobile Money ?">
                                <p>Lors de la saisie du paiement, sélectionnez le mode "Mobile Money", puis remplissez les champs obligatoires : <strong>numéro de téléphone mobile</strong> du client (ex: +25779123456) et la <strong>référence de transaction</strong> fournie par l'opérateur (Lumicash, Ecocash, etc.). Le système validera la présence de ces informations avant d'enregistrer le paiement.</p>
                            </AccordionTab>
                            <AccordionTab header="Peut-on exonérer des pénalités de retard ?">
                                <p>Oui, le système permet l'exonération totale ou partielle des pénalités selon un workflow d'approbation. Les niveaux d'autorisation sont : Agent (jusqu'à 10 000 FBU), Chef d'agence (jusqu'à 50 000 FBU), Chef de crédit (jusqu'à 200 000 FBU), et DG (au-delà de 200 000 FBU). L'exonération doit être justifiée (force majeure, bon historique client, etc.) et reste tracée dans l'historique du crédit.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment fonctionne la collecte de paiement à domicile ?">
                                <p>Pour la collecte à domicile, sélectionnez le mode "Collecte à Domicile" lors de l'enregistrement du paiement. Vous devrez alors indiquer : l'<strong>agent collecteur</strong> (votre nom ou un collègue), le <strong>lieu de collecte</strong> (adresse), et idéalement capturer la <strong>localisation GPS</strong> via le bouton dédié. Ceci permet la traçabilité complète des collectes terrain et la vérification des déplacements des agents.</p>
                            </AccordionTab>
                            <AccordionTab header="Quand un crédit passe-t-il en contentieux ?">
                                <p>Un crédit passe automatiquement en phase Contentieux lorsque le retard dépasse 90 jours. À ce stade, les actions de recouvrement classiques ont échoué et des procédures juridiques peuvent être envisagées, sous réserve de l'approbation du DG pour les montants supérieurs à 500 000 FBU.</p>
                            </AccordionTab>
                            <AccordionTab header="Peut-on restructurer un crédit plusieurs fois ?">
                                <p>Non, la politique de l'institution limite à <strong>une seule restructuration par crédit</strong>. Cette règle vise à éviter les restructurations en cascade et à encourager une discipline de remboursement. En cas de difficulté persistante après restructuration, le dossier doit être orienté vers le contentieux.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment obtenir l'approbation du DG pour un dossier contentieux ?">
                                <p>Lorsque vous créez un dossier contentieux pour un montant supérieur à 500 000 FBU, le système envoie automatiquement une demande d'approbation au Directeur Général. Le DG reçoit une notification par email et dans son tableau de bord. Il peut consulter le dossier complet et approuver ou rejeter avec commentaires via le menu "Approbations DG". Vous serez notifié de la décision et pourrez alors poursuivre les actions si approuvé.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment effectuer un remboursement anticipé partiel ?">
                                <p>Dans le menu "Remboursement Anticipé", après avoir sélectionné le crédit, choisissez l'option "Remboursement Partiel". Saisissez le montant que le client souhaite rembourser en plus de l'échéance courante. Le système recalculera automatiquement les échéances futures avec le nouveau capital restant.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment suivre les promesses de paiement des clients ?">
                                <p>Lors d'une action de recouvrement (appel, visite, etc.), si le client promet de payer à une date précise, enregistrez la <strong>date de promesse</strong> et le <strong>montant promis</strong> dans le formulaire d'action. Le système génère automatiquement un rappel J-1 avant la date promise. Si le paiement n'est pas honoré, le dossier est automatiquement escaladé en priorité et l'historique des promesses non tenues est tracé pour évaluation du comportement client.</p>
                            </AccordionTab>
                            <AccordionTab header="Quelle est la différence entre Date de Paiement et Date de Valeur ?">
                                <p>La <strong>Date de Paiement</strong> est la date à laquelle le client remet physiquement l'argent (aujourd'hui généralement). La <strong>Date de Valeur</strong> est la date à laquelle le paiement est effectivement comptabilisé et appliqué au crédit. Elles sont souvent identiques, mais peuvent différer en cas de chèque (date de compensation) ou de transfert bancaire (date de réception effective des fonds).</p>
                            </AccordionTab>
                            <AccordionTab header="Comment prioriser les dossiers de recouvrement ?">
                                <p>Lors de l'ouverture d'un dossier de recouvrement, assignez une priorité selon ces critères : <strong>Faible</strong> (retard mineur, client coopératif), <strong>Normale</strong> (cas standard), <strong>Haute</strong> (montant élevé ou retard prolongé), <strong>Critique</strong> (risque de perte majeure, action urgente). Les dossiers prioritaires apparaissent en tête de liste et génèrent des alertes pour les superviseurs. Utilisez la priorité "Critique" avec parcimonie pour les situations vraiment urgentes.</p>
                            </AccordionTab>
                        </Accordion>

                        <h5 className="text-primary mt-4">9.14 Prélèvement Automatique</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                Le Prélèvement Automatique permet de débiter automatiquement les comptes épargne des clients
                                pour le paiement de leurs échéances de crédit. Ce module traite uniquement les échéances
                                <strong> expirées</strong> (dont la date d'échéance est passée) et utilise les montants exacts
                                définis dans l'échéancier.
                            </p>
                            <ul className="line-height-3">
                                <li><strong>Traitement par lot :</strong> Exécution groupée de tous les prélèvements pour une date donnée</li>
                                <li><strong>Prévisualisation :</strong> Aperçu des paiements avant exécution réelle</li>
                                <li><strong>Gestion des échéances multiples :</strong> Traite toutes les échéances impayées d'un crédit en une seule opération</li>
                                <li><strong>Historique complet :</strong> Traçabilité de tous les lots exécutés avec détails par client</li>
                                <li><strong>Recherche avancée :</strong> Filtrage par N° crédit, compte épargne, date et statut</li>
                            </ul>
                        </div>

                        <div className="grid mb-3">
                            <div className="col-12 md:col-6">
                                <Card className="h-full border-left-3 border-blue-500">
                                    <h6 className="mt-0 text-blue-600">
                                        <i className="pi pi-eye mr-2"></i>
                                        Onglet Exécution
                                    </h6>
                                    <p className="text-sm">Fonctionnalités principales :</p>
                                    <ul className="text-sm line-height-3">
                                        <li><strong>Sélection de date :</strong> Choisir la date de traitement (échéances expirées jusqu'à cette date)</li>
                                        <li><strong>Prévisualisation :</strong> Voir les crédits à traiter avec montants et soldes disponibles</li>
                                        <li><strong>Statistiques :</strong> Nombre de crédits, échéances, montant total, succès/échecs prévisionnels</li>
                                        <li><strong>Exécution :</strong> Lancement du traitement avec confirmation</li>
                                        <li><strong>Résultats détaillés :</strong> Affichage des paiements réussis, solde insuffisant et échecs</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card className="h-full border-left-3 border-green-500">
                                    <h6 className="mt-0 text-green-600">
                                        <i className="pi pi-history mr-2"></i>
                                        Onglet Historique
                                    </h6>
                                    <p className="text-sm">Consultation et recherche :</p>
                                    <ul className="text-sm line-height-3">
                                        <li><strong>Liste des lots :</strong> Tous les traitements exécutés avec N° batch, date, statut</li>
                                        <li><strong>Recherche multi-critères :</strong> N° batch, N° crédit, N° compte épargne, dates, statut</li>
                                        <li><strong>Détails par lot :</strong> Vue détaillée avec résumé et liste des paiements individuels</li>
                                        <li><strong>Traçabilité utilisateur :</strong> Identification de l'utilisateur ayant exécuté chaque lot</li>
                                        <li><strong>Statistiques par lot :</strong> Succès, solde insuffisant, échecs avec montants</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <p className="font-bold text-primary"><i className="pi pi-cog mr-2"></i>Procédure d'Exécution du Prélèvement Automatique</p>
                        <div className="surface-100 p-3 border-round mb-3">
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Module Remboursement" /> → <Tag value="Paiements" severity="info" /> → <Tag value="Prélèvement Automatique" severity="success" /></li>
                                <li>Dans l'onglet <Tag value="Exécution" severity="info" /> :
                                    <ul>
                                        <li>Sélectionner la <strong>date de traitement</strong> (le système traitera les échéances expirées jusqu'à cette date)</li>
                                        <li>Cliquer sur <Tag value="Prévisualiser" severity="secondary" /> pour voir l'aperçu</li>
                                    </ul>
                                </li>
                                <li>Analyser la prévisualisation :
                                    <ul>
                                        <li><strong>Statistiques générales :</strong> Nombre de crédits, échéances totales, montant à prélever</li>
                                        <li><strong>Liste des crédits :</strong> Détail par crédit avec client, échéances, montant et solde disponible</li>
                                        <li><strong>Code couleur :</strong>
                                            <ul>
                                                <li><Tag value="Suffisant" severity="success" /> - Solde suffisant pour le prélèvement complet</li>
                                                <li><Tag value="Insuffisant" severity="warning" /> - Solde partiel ou insuffisant</li>
                                                <li><Tag value="Pas de compte" severity="danger" /> - Client sans compte épargne lié</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                                <li>Si l'aperçu est satisfaisant, cliquer sur <Tag value="Exécuter le Prélèvement" severity="success" /></li>
                                <li>Confirmer l'opération dans la boîte de dialogue de confirmation</li>
                                <li>Consulter le résultat détaillé :
                                    <ul>
                                        <li><strong>Paiements réussis :</strong> Liste des prélèvements effectués avec N° paiement généré</li>
                                        <li><strong>Solde insuffisant :</strong> Crédits où le prélèvement n'a pas pu être effectué intégralement</li>
                                        <li><strong>Échecs :</strong> Erreurs techniques rencontrées</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>

                        <p className="font-bold text-primary"><i className="pi pi-search mr-2"></i>Consultation de l'Historique</p>
                        <div className="surface-100 p-3 border-round mb-3">
                            <ol className="line-height-3">
                                <li>Cliquer sur l'onglet <Tag value="Historique" severity="info" /></li>
                                <li>Utiliser les filtres de recherche :
                                    <ul>
                                        <li><strong>N° Batch :</strong> Recherche par numéro de lot</li>
                                        <li><strong>N° Crédit :</strong> Trouver les lots contenant un crédit spécifique</li>
                                        <li><strong>N° Compte Épargne :</strong> Filtrer par compte source</li>
                                        <li><strong>Date Début / Date Fin :</strong> Période de recherche</li>
                                        <li><strong>Statut :</strong> Complété, Partiel, Échec</li>
                                    </ul>
                                </li>
                                <li>Cliquer sur <Tag value="Rechercher" severity="primary" /> pour appliquer les filtres</li>
                                <li>Cliquer sur l'icone <i className="pi pi-eye text-blue-500"></i> pour voir les détails d'un lot</li>
                            </ol>

                            <p className="mt-3 font-semibold">Détails d'un Lot :</p>
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <ul className="text-sm">
                                        <li><strong>Résumé :</strong> Statut, date, montant traité, utilisateur</li>
                                        <li><strong>Compteurs :</strong> Succès, solde insuffisant, échecs</li>
                                    </ul>
                                </div>
                                <div className="col-12 md:col-6">
                                    <ul className="text-sm">
                                        <li><strong>Détails par paiement :</strong> Client, crédit, compte, montants</li>
                                        <li><strong>Filtres dans les détails :</strong> Recherche par N° crédit, N° paiement, compte, statut</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="border-left-3 border-green-500 pl-3">
                                    <p className="text-green-600 font-bold"><i className="pi pi-check-circle mr-2"></i>Bonnes Pratiques</p>
                                    <ul className="text-sm line-height-3">
                                        <li>Toujours prévisualiser avant d'exécuter</li>
                                        <li>Vérifier les soldes insuffisants et contacter les clients concernés</li>
                                        <li>Exécuter le prélèvement en début de journée pour les échéances du jour</li>
                                        <li>Consulter régulièrement l'historique pour détecter les patterns d'échecs</li>
                                        <li>Encourager les clients à maintenir un solde suffisant sur leur compte épargne</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="border-left-3 border-orange-500 pl-3">
                                    <p className="text-orange-600 font-bold"><i className="pi pi-exclamation-triangle mr-2"></i>Points d'Attention</p>
                                    <ul className="text-sm line-height-3">
                                        <li>Le prélèvement ne traite que les échéances <strong>expirées</strong> (date passée)</li>
                                        <li>Un crédit peut avoir plusieurs échéances traitées si plusieurs sont en retard</li>
                                        <li>Le solde insuffisant n'empêche pas le prélèvement partiel si la configuration le permet</li>
                                        <li>Chaque exécution génère un lot avec un numéro unique pour la traçabilité</li>
                                        <li>L'utilisateur connecté est automatiquement enregistré comme exécutant</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 p-3 surface-100 border-round">
                            <h6 className="mt-0"><i className="pi pi-info-circle mr-2 text-blue-500"></i>Statuts des Lots</h6>
                            <div className="flex flex-wrap gap-2">
                                <div><Tag value="COMPLETED" severity="success" /> Tous les prélèvements réussis</div>
                                <div><Tag value="PARTIAL" severity="warning" /> Certains prélèvements ont échoué (solde insuffisant)</div>
                                <div><Tag value="FAILED" severity="danger" /> Erreur majeure lors du traitement</div>
                            </div>
                        </div>
                    </div>
                </AccordionTab>

                {/* Module Comptabilité */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-calculator"></i>
                            <span className="font-bold">10. Module Comptabilité</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">10.1 Vue d'Ensemble</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                Le module Comptabilité gère l'ensemble de la comptabilité générale de l'institution selon le référentiel
                                <strong> SYSCOHADA</strong>. Il centralise les écritures comptables générées par les modules opérationnels
                                (Épargne, Crédit, Remboursement) et permet la production des états financiers réglementaires.
                            </p>
                            <div className="grid mt-3">
                                <div className="col-12 md:col-4">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-blue-600"><i className="pi pi-sitemap mr-2"></i>Paramétrage</h6>
                                        <ul className="text-sm">
                                            <li>Plan Comptable (Comptes)</li>
                                            <li>Journaux Comptables</li>
                                            <li>Exercices Comptables</li>
                                            <li>Taux de Change</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-4">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-green-600"><i className="pi pi-pencil mr-2"></i>Saisie & Traitement</h6>
                                        <ul className="text-sm">
                                            <li>Écritures Comptables</li>
                                            <li>Brouillards</li>
                                            <li>Clôture Journalière</li>
                                            <li>Contrôle Comptable</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-4">
                                    <Card className="h-full">
                                        <h6 className="mt-0 text-purple-600"><i className="pi pi-chart-bar mr-2"></i>États Financiers</h6>
                                        <ul className="text-sm">
                                            <li>Balance Générale</li>
                                            <li>Bilan</li>
                                            <li>Compte de Résultat</li>
                                            <li>Flux de Trésorerie</li>
                                            <li>Variation des Capitaux</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">10.2 Plan Comptable (Comptes)</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Le plan comptable définit la structure des comptes selon la norme SYSCOHADA.</p>
                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Comptabilité" /> → <Tag value="Plan Comptable" severity="info" /></li>
                            </ol>
                            <h6 className="text-blue-600 mt-3">Fonctionnalités</h6>
                            <ul className="line-height-3">
                                <li><strong>Liste des comptes :</strong> Tableau avec numéro de compte, libellé, classe, type (Actif/Passif/Charge/Produit)</li>
                                <li><strong>Création :</strong> Ajouter un nouveau compte avec numéro, libellé, classe et type</li>
                                <li><strong>Modification :</strong> Modifier le libellé et les propriétés d'un compte existant</li>
                                <li><strong>Recherche :</strong> Filtrer par numéro de compte, libellé ou classe</li>
                                <li><strong>Import/Export :</strong> Possibilité d'importer un plan comptable standard</li>
                            </ul>
                            <div className="border-left-3 border-blue-500 pl-3 mt-3">
                                <p className="text-sm"><i className="pi pi-info-circle text-blue-500 mr-2"></i>
                                    Les classes de comptes suivent le SYSCOHADA : Classe 1 (Capitaux), Classe 2 (Immobilisations),
                                    Classe 3 (Stocks), Classe 4 (Tiers), Classe 5 (Trésorerie), Classe 6 (Charges), Classe 7 (Produits).
                                </p>
                            </div>
                        </div>

                        <h5 className="text-primary">10.3 Journaux Comptables</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Les journaux comptables organisent les écritures par nature d'opération.</p>
                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Comptabilité" /> → <Tag value="Journaux" severity="info" /></li>
                            </ol>
                            <h6 className="text-blue-600 mt-3">Fonctionnalités</h6>
                            <ul className="line-height-3">
                                <li><strong>Gestion des journaux :</strong> Créer, modifier et consulter les journaux (Journal des Achats, Ventes, Banque, Caisse, Opérations Diverses)</li>
                                <li><strong>Code et libellé :</strong> Chaque journal a un code unique et un libellé descriptif</li>
                                <li><strong>Association aux exercices :</strong> Les journaux sont liés à l'exercice comptable actif</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">10.4 Exercices Comptables</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>L'exercice comptable définit la période de comptabilisation (généralement du 1er janvier au 31 décembre).</p>
                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Comptabilité" /> → <Tag value="Exercices" severity="info" /></li>
                            </ol>
                            <h6 className="text-blue-600 mt-3">Fonctionnalités</h6>
                            <ul className="line-height-3">
                                <li><strong>Création d'exercice :</strong> Définir la date de début, date de fin et le libellé</li>
                                <li><strong>Statuts :</strong> <Tag value="OUVERT" severity="success" /> (exercice actif), <Tag value="CLOTURE" severity="danger" /> (exercice fermé)</li>
                                <li><strong>Exercice actif :</strong> Un seul exercice peut être actif à la fois, sélectionné via le cookie de session</li>
                                <li><strong>Clôture d'exercice :</strong> Génération automatique des à-nouveaux pour le nouvel exercice</li>
                            </ul>
                            <div className="border-left-3 border-orange-500 pl-3 mt-3">
                                <p className="text-sm"><i className="pi pi-exclamation-triangle text-orange-500 mr-2"></i>
                                    La clôture d'un exercice est <strong>irréversible</strong>. S'assurer que toutes les écritures sont validées avant de procéder.
                                </p>
                            </div>
                        </div>

                        <h5 className="text-primary">10.5 Brouillards</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Les brouillards sont des écritures provisoires qui peuvent être modifiées avant validation définitive.</p>
                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Comptabilité" /> → <Tag value="Brouillards" severity="info" /></li>
                            </ol>
                            <h6 className="text-blue-600 mt-3">Fonctionnalités</h6>
                            <ul className="line-height-3">
                                <li><strong>Saisie de brouillard :</strong> Créer des écritures provisoires avec date, journal, libellé, comptes débit/crédit et montants</li>
                                <li><strong>Validation :</strong> Transformer un brouillard en écriture définitive après vérification</li>
                                <li><strong>Suppression :</strong> Les brouillards non validés peuvent être supprimés</li>
                                <li><strong>Équilibre :</strong> Le système vérifie que le total débit = total crédit</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">10.6 Écritures Comptables</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Les écritures comptables enregistrent définitivement les mouvements financiers dans les comptes.</p>
                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Comptabilité" /> → <Tag value="Écritures" severity="info" /></li>
                            </ol>
                            <h6 className="text-blue-600 mt-3">Fonctionnalités</h6>
                            <ul className="line-height-3">
                                <li><strong>Consultation :</strong> Afficher les écritures avec filtres par période, journal, compte</li>
                                <li><strong>Détail :</strong> Pour chaque écriture : date, numéro de pièce, journal, libellé, comptes mouvementés, montants débit/crédit</li>
                                <li><strong>Source :</strong> Identification de l'origine (manuelle, clôture journalière automatique)</li>
                                <li><strong>Lettrage :</strong> Rapprochement des écritures sur un même compte de tiers</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">10.7 États Financiers</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Les états financiers sont les documents comptables obligatoires produits à partir des écritures.</p>

                            <div className="grid mt-3">
                                <div className="col-12 md:col-6">
                                    <Card className="mb-3">
                                        <h6 className="mt-0 text-blue-600"><i className="pi pi-table mr-2"></i>Balance Générale</h6>
                                        <p className="text-sm">Récapitule pour chaque compte les totaux débit/crédit et le solde.</p>
                                        <ul className="text-sm">
                                            <li>Accès : <Tag value="Comptabilité" /> → <Tag value="Balance" severity="info" /></li>
                                            <li>Filtres par période et classe de comptes</li>
                                            <li>Totaux et contrôle d'équilibre automatique</li>
                                            <li>Export PDF disponible</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="mb-3">
                                        <h6 className="mt-0 text-green-600"><i className="pi pi-chart-bar mr-2"></i>Bilan</h6>
                                        <p className="text-sm">Présente la situation patrimoniale : Actif (emplois) et Passif (ressources).</p>
                                        <ul className="text-sm">
                                            <li>Accès : <Tag value="Comptabilité" /> → <Tag value="Bilan" severity="info" /></li>
                                            <li>Format SYSCOHADA réglementaire</li>
                                            <li>Actif = Passif (contrôle automatique)</li>
                                            <li>Export PDF disponible</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="mb-3">
                                        <h6 className="mt-0 text-purple-600"><i className="pi pi-chart-line mr-2"></i>Compte de Résultat</h6>
                                        <p className="text-sm">Détermine le résultat de l'exercice : Produits - Charges = Bénéfice ou Perte.</p>
                                        <ul className="text-sm">
                                            <li>Accès : <Tag value="Comptabilité" /> → <Tag value="Compte de Résultat" severity="info" /></li>
                                            <li>Charges d'exploitation, financières et exceptionnelles</li>
                                            <li>Produits d'exploitation, financiers et exceptionnels</li>
                                            <li>Calcul automatique du résultat net</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="mb-3">
                                        <h6 className="mt-0 text-orange-600"><i className="pi pi-arrows-h mr-2"></i>Flux de Trésorerie</h6>
                                        <p className="text-sm">Retrace les mouvements de trésorerie par catégorie d'activité.</p>
                                        <ul className="text-sm">
                                            <li>Accès : <Tag value="Comptabilité" /> → <Tag value="Flux de Trésorerie" severity="info" /></li>
                                            <li>Flux d'exploitation, d'investissement et de financement</li>
                                            <li>Variation nette de trésorerie</li>
                                            <li>Export PDF disponible</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card className="mb-3">
                                        <h6 className="mt-0 text-teal-600"><i className="pi pi-sort-alt mr-2"></i>Variation des Capitaux Propres</h6>
                                        <p className="text-sm">Montre l'évolution des capitaux propres entre deux exercices.</p>
                                        <ul className="text-sm">
                                            <li>Accès : <Tag value="Comptabilité" /> → <Tag value="Variation des Capitaux" severity="info" /></li>
                                            <li>Capital, réserves, résultat et report à nouveau</li>
                                            <li>Comparaison N et N-1</li>
                                            <li>Export PDF disponible</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">10.8 Éditions et Rapports</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Les éditions permettent de consulter et imprimer les détails des opérations comptables.</p>
                            <ul className="line-height-3">
                                <li><strong>Grand Livre :</strong> Détail de tous les mouvements par compte, avec solde progressif. Accès : <Tag value="Comptabilité" /> → <Tag value="Grand Livre" severity="info" /></li>
                                <li><strong>Édition Journal :</strong> Impression des écritures par journal et par période. Accès : <Tag value="Comptabilité" /> → <Tag value="Édition Journal" severity="info" /></li>
                                <li><strong>Rapport par Compte :</strong> Analyse détaillée d'un compte spécifique avec graphiques. Accès : <Tag value="Comptabilité" /> → <Tag value="Rapport Compte" severity="info" /></li>
                            </ul>
                            <div className="border-left-3 border-green-500 pl-3 mt-3">
                                <p className="text-sm"><i className="pi pi-file-pdf text-green-500 mr-2"></i>
                                    Tous les rapports et éditions sont exportables au format PDF pour l'archivage et la communication aux autorités de tutelle.
                                </p>
                            </div>
                        </div>

                        <h5 className="text-primary">10.9 Contrôle Comptable</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Le contrôle comptable permet de vérifier la cohérence et l'intégrité des données comptables.</p>
                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Comptabilité" /> → <Tag value="Contrôle" severity="info" /></li>
                            </ol>
                            <h6 className="text-blue-600 mt-3">Vérifications Effectuées</h6>
                            <ul className="line-height-3">
                                <li><strong>Équilibre des écritures :</strong> Vérification que chaque écriture a un total débit = total crédit</li>
                                <li><strong>Cohérence des comptes :</strong> Validation que les comptes utilisés existent dans le plan comptable</li>
                                <li><strong>Continuité des numéros :</strong> Vérification de la séquence des numéros de pièces</li>
                                <li><strong>Rapprochement inter-modules :</strong> Concordance entre les opérations des modules et les écritures comptables</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">10.10 Taux de Change</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Gestion des taux de change pour les opérations en devises étrangères.</p>
                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Comptabilité" /> → <Tag value="Paramètres" /> → <Tag value="Taux de Change" severity="info" /></li>
                            </ol>
                            <h6 className="text-blue-600 mt-3">Fonctionnalités</h6>
                            <ul className="line-height-3">
                                <li><strong>Saisie des taux :</strong> Enregistrer le taux de change par devise et par date</li>
                                <li><strong>Historique :</strong> Consulter l'évolution des taux de change</li>
                                <li><strong>Conversion automatique :</strong> Les montants en devises sont convertis en FBU selon le taux du jour</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">10.11 Clôture Journalière Comptable</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                La clôture journalière comptable est l'étape finale qui génère les écritures comptables à partir des opérations
                                vérifiées dans les modules Épargne, Crédit et Remboursement.
                            </p>

                            <h6 className="text-blue-600 mt-3">Accès</h6>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Comptabilité" /> → <Tag value="Clôture Journalière" severity="info" /></li>
                                <li>Sélectionner la date de clôture</li>
                                <li>Cliquer sur <Tag value="Aperçu" severity="info" /> pour voir les opérations à comptabiliser</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Processus</h6>
                            <div className="grid">
                                <div className="col-12">
                                    <div className="flex align-items-center gap-2 flex-wrap">
                                        <Tag value="1. Aperçu" severity="info" className="text-lg" />
                                        <i className="pi pi-arrow-right"></i>
                                        <Tag value="2. Vérification" severity="warning" className="text-lg" />
                                        <i className="pi pi-arrow-right"></i>
                                        <Tag value="3. Exécution" severity="success" className="text-lg" />
                                    </div>
                                </div>
                            </div>

                            <h6 className="text-blue-600 mt-3">Onglets par Type d'Opération</h6>
                            <ul className="line-height-3">
                                <li><strong>Dépôts :</strong> Écritures générées par les dépôts d'épargne vérifiés</li>
                                <li><strong>Retraits :</strong> Écritures générées par les retraits d'épargne vérifiés</li>
                                <li><strong>Décaissements :</strong> Écritures générées par les décaissements de crédit vérifiés</li>
                                <li><strong>Remboursements :</strong> Écritures générées par les paiements de remboursement vérifiés</li>
                                <li><strong>Remb. Anticipés :</strong> Écritures générées par les remboursements anticipés vérifiés</li>
                                <li><strong>Trésorerie :</strong> Écritures de régularisation de trésorerie</li>
                                <li><strong>Toutes :</strong> Vue consolidée de toutes les écritures</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Actions Disponibles</h6>
                            <ul className="line-height-3">
                                <li><Tag value="Aperçu" severity="info" /> Charger et visualiser les écritures à générer pour la date sélectionnée</li>
                                <li><Tag value="Exécuter" severity="success" /> Générer définitivement les écritures comptables (après confirmation)</li>
                                <li><Tag value="Annuler" severity="danger" /> Inverser une clôture déjà exécutée (génère des contre-écritures)</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Statuts de Clôture</h6>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <div><Tag value="COMPLETED" severity="success" /> Clôture exécutée avec succès</div>
                                <div><Tag value="REVERSED" severity="warning" /> Clôture annulée (contre-écritures générées)</div>
                                <div><Tag value="PENDING" severity="info" /> En attente d'exécution</div>
                            </div>

                            <h6 className="text-blue-600 mt-3">Règles Importantes</h6>
                            <div className="border-left-3 border-red-500 pl-3">
                                <ul className="line-height-3">
                                    <li><i className="pi pi-exclamation-triangle text-red-500 mr-2"></i>Les opérations des modules Épargne, Crédit et Remboursement doivent être <strong>vérifiées</strong> avant de pouvoir exécuter la clôture comptable</li>
                                    <li><i className="pi pi-lock text-red-500 mr-2"></i>Une fois la clôture exécutée, les vérifications dans les modules opérationnels sont <strong>verrouillées</strong> (impossibilité d'annuler)</li>
                                    <li><i className="pi pi-info-circle text-blue-500 mr-2"></i>Chaque écriture générée contient la référence de l'opération source pour la traçabilité</li>
                                    <li><i className="pi pi-refresh text-orange-500 mr-2"></i>L'annulation génère des contre-écritures et déverrouille les modules opérationnels</li>
                                </ul>
                            </div>
                        </div>

                        <h5 className="text-primary">10.12 Conseils et Bonnes Pratiques</h5>
                        <div className="surface-100 p-3 border-round">
                            <h6 className="text-blue-600">Routine Quotidienne</h6>
                            <ol className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier les opérations du jour dans chaque module (Épargne, Crédit, Remboursement)</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Exécuter la clôture journalière comptable</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Consulter la balance pour vérifier l'équilibre</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Lancer le contrôle comptable en cas de doute</li>
                            </ol>

                            <h6 className="text-blue-600 mt-3">Gestion des Exercices</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>S'assurer qu'un seul exercice est actif</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier tous les états financiers avant la clôture annuelle</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Conserver les exports PDF des états financiers pour l'archivage</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Rapprocher les soldes comptables avec les soldes des modules opérationnels</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Sécurité</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Ne jamais modifier directement les écritures générées automatiquement</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Utiliser les brouillards pour les écritures manuelles avant validation</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Documenter toute annulation de clôture avec un motif clair</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier les taux de change avant toute opération en devise</li>
                            </ul>
                        </div>
                    </div>
                </AccordionTab>

                {/* Journal d'Audit / Traçabilité */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-history"></i>
                            <span className="font-bold">11. Journal d'Audit (Traçabilité)</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">11.1 Vue d'Ensemble</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>
                                Le module Journal d'Audit permet de tracer toutes les actions effectuées dans le système.
                                Il assure la traçabilité complète pour la conformité réglementaire et la sécurité.
                            </p>
                            <ul className="line-height-3">
                                <li><strong>Traçabilité Complète :</strong> Enregistrement automatique de toutes les opérations (création, modification, suppression)</li>
                                <li><strong>Sécurité :</strong> Suivi des connexions, déconnexions et tentatives d'accès</li>
                                <li><strong>Conformité :</strong> Conservation des preuves pour les audits et contrôles</li>
                                <li><strong>Transparence :</strong> Historique des changements avec les valeurs avant/après</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">11.2 Accès au Journal d'Audit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Pour accéder au journal :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="ADMINISTRATION" /></li>
                                <li>Cliquer sur <Tag value="Journal d'Audit" severity="info" /></li>
                                <li>La page affiche les statistiques et la liste des actions enregistrées</li>
                            </ol>
                        </div>

                        <h5 className="text-primary">11.3 Types d'Actions Enregistrées</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full border-left-3 border-blue-500">
                                    <h6 className="mt-0 text-blue-500">
                                        <i className="pi pi-database mr-2"></i>
                                        Opérations sur les Données
                                    </h6>
                                    <ul className="text-sm line-height-3">
                                        <li><Tag value="Création" severity="success" /> Ajout d'un nouvel enregistrement</li>
                                        <li><Tag value="Lecture" severity="info" /> Consultation des données</li>
                                        <li><Tag value="Modification" severity="warning" /> Mise à jour d'un enregistrement</li>
                                        <li><Tag value="Suppression" severity="danger" /> Suppression d'un enregistrement</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full border-left-3 border-green-500">
                                    <h6 className="mt-0 text-green-500">
                                        <i className="pi pi-user mr-2"></i>
                                        Authentification
                                    </h6>
                                    <ul className="text-sm line-height-3">
                                        <li><Tag value="Connexion" severity="success" /> Connexion réussie</li>
                                        <li><Tag value="Déconnexion" severity="info" /> Fin de session</li>
                                        <li><Tag value="Échec connexion" severity="danger" /> Tentative échouée</li>
                                        <li><Tag value="Mot de passe" severity="warning" /> Changement de mot de passe</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full border-left-3 border-purple-500">
                                    <h6 className="mt-0 text-purple-500">
                                        <i className="pi pi-cog mr-2"></i>
                                        Actions Métier
                                    </h6>
                                    <ul className="text-sm line-height-3">
                                        <li><Tag value="Validation" severity="success" /> Validation d'un document</li>
                                        <li><Tag value="Approbation" severity="success" /> Approbation d'une demande</li>
                                        <li><Tag value="Rejet" severity="danger" /> Rejet d'une demande</li>
                                        <li><Tag value="Export" severity="info" /> Export de données</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary">11.4 Filtres de Recherche</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>La page d'audit offre plusieurs filtres pour affiner la recherche :</p>
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <ul className="line-height-3">
                                        <li><strong>Période :</strong> Date de début et date de fin</li>
                                        <li><strong>Utilisateur :</strong> Recherche par nom d'utilisateur</li>
                                        <li><strong>Table/Entité :</strong> Type d'objet concerné</li>
                                        <li><strong>Type d'Action :</strong> Création, Modification, Suppression, etc.</li>
                                    </ul>
                                </div>
                                <div className="col-12 md:col-6">
                                    <ul className="line-height-3">
                                        <li><strong>Module :</strong> Système, Authentification, Clients, Facturation, etc.</li>
                                        <li><strong>Statut :</strong> Succès, Échec, En attente</li>
                                        <li><strong>ID Entité :</strong> Identifiant spécifique d'un enregistrement</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">11.5 Informations Enregistrées</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Chaque entrée d'audit contient les informations suivantes :</p>
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-blue-500"><i className="pi pi-user mr-2"></i>Informations Utilisateur</h6>
                                        <ul className="text-sm">
                                            <li><strong>ID Utilisateur :</strong> Identifiant unique</li>
                                            <li><strong>Nom d'utilisateur :</strong> Login de l'utilisateur</li>
                                            <li><strong>Nom complet :</strong> Prénom et nom</li>
                                            <li><strong>Rôle :</strong> Rôle de l'utilisateur</li>
                                            <li><strong>Agence :</strong> Agence de rattachement</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-green-500"><i className="pi pi-file mr-2"></i>Détails de l'Action</h6>
                                        <ul className="text-sm">
                                            <li><strong>Date et Heure :</strong> Horodatage précis</li>
                                            <li><strong>Type d'action :</strong> Nature de l'opération</li>
                                            <li><strong>Module :</strong> Module concerné</li>
                                            <li><strong>Description :</strong> Description de l'action</li>
                                            <li><strong>Statut :</strong> Résultat (Succès/Échec)</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-orange-500"><i className="pi pi-database mr-2"></i>Données Modifiées</h6>
                                        <ul className="text-sm">
                                            <li><strong>Table/Entité :</strong> Objet concerné</li>
                                            <li><strong>ID Entité :</strong> Identifiant de l'enregistrement</li>
                                            <li><strong>Valeurs Avant :</strong> Données originales (JSON)</li>
                                            <li><strong>Valeurs Après :</strong> Nouvelles données (JSON)</li>
                                            <li><strong>Champs Modifiés :</strong> Liste des champs changés</li>
                                        </ul>
                                    </Card>
                                </div>
                                <div className="col-12 md:col-6">
                                    <Card>
                                        <h6 className="mt-0 text-purple-500"><i className="pi pi-globe mr-2"></i>Informations Techniques</h6>
                                        <ul className="text-sm">
                                            <li><strong>Adresse IP :</strong> IP du client</li>
                                            <li><strong>User Agent :</strong> Navigateur utilisé</li>
                                            <li><strong>URL :</strong> Endpoint appelé</li>
                                            <li><strong>Méthode HTTP :</strong> GET, POST, PUT, DELETE</li>
                                            <li><strong>ID Session :</strong> Identifiant de session</li>
                                        </ul>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">11.6 Consultation des Détails</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Pour voir les détails d'une entrée d'audit :</strong></p>
                            <ol className="line-height-3">
                                <li>Dans la liste des audits, cliquer sur l'icone <i className="pi pi-eye text-blue-500"></i> (Voir détails)</li>
                                <li>Une fenêtre modale s'ouvre avec 5 onglets :
                                    <ul>
                                        <li><Tag value="Général" /> Informations de base (date, action, statut)</li>
                                        <li><Tag value="Utilisateur" /> Détails de l'utilisateur ayant effectué l'action</li>
                                        <li><Tag value="Entité" /> Informations sur l'objet concerné</li>
                                        <li><Tag value="Valeurs" /> Comparaison des valeurs avant/après modification</li>
                                        <li><Tag value="Technique" /> Informations techniques (IP, navigateur, etc.)</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>

                        <h5 className="text-primary">11.7 Statistiques du Tableau de Bord</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p>Le haut de la page affiche des statistiques sur la période sélectionnée :</p>
                            <div className="grid">
                                <div className="col-6 md:col-3">
                                    <Card className="text-center">
                                        <i className="pi pi-check-circle text-green-500 text-3xl"></i>
                                        <h6 className="mt-2 mb-0">Actions Réussies</h6>
                                        <p className="text-sm text-500">Opérations terminées avec succès</p>
                                    </Card>
                                </div>
                                <div className="col-6 md:col-3">
                                    <Card className="text-center">
                                        <i className="pi pi-times-circle text-red-500 text-3xl"></i>
                                        <h6 className="mt-2 mb-0">Actions Échouées</h6>
                                        <p className="text-sm text-500">Opérations ayant échoué</p>
                                    </Card>
                                </div>
                                <div className="col-6 md:col-3">
                                    <Card className="text-center">
                                        <i className="pi pi-clock text-yellow-500 text-3xl"></i>
                                        <h6 className="mt-2 mb-0">En Attente</h6>
                                        <p className="text-sm text-500">Opérations en cours</p>
                                    </Card>
                                </div>
                                <div className="col-6 md:col-3">
                                    <Card className="text-center">
                                        <i className="pi pi-list text-blue-500 text-3xl"></i>
                                        <h6 className="mt-2 mb-0">Total</h6>
                                        <p className="text-sm text-500">Nombre total d'actions</p>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <h5 className="text-primary">11.8 Export des Données</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Pour exporter le journal d'audit :</strong></p>
                            <ol className="line-height-3">
                                <li>Appliquer les filtres souhaités (période, utilisateur, etc.)</li>
                                <li>Cliquer sur le bouton <Tag value="Exporter CSV" severity="success" /></li>
                                <li>Le fichier CSV contient toutes les entrées correspondant aux filtres</li>
                            </ol>
                            <p className="mt-2"><strong>Colonnes exportées :</strong> ID, Date, Heure, Utilisateur, Action, Module, Entité, Description, Statut</p>
                        </div>

                        <h5 className="text-primary">11.9 Modules Tracés</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6 lg:col-3">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-cog mr-2"></i>Système</h6>
                                    <ul className="text-sm">
                                        <li>Configuration système</li>
                                        <li>Paramètres généraux</li>
                                        <li>Sauvegarde/Restauration</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-users mr-2"></i>Utilisateurs</h6>
                                    <ul className="text-sm">
                                        <li>Gestion des comptes</li>
                                        <li>Attribution des rôles</li>
                                        <li>Authentification</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-id-card mr-2"></i>Clients</h6>
                                    <ul className="text-sm">
                                        <li>Création de clients</li>
                                        <li>Modification de données</li>
                                        <li>Gestion des groupes</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-money-bill mr-2"></i>Finance</h6>
                                    <ul className="text-sm">
                                        <li>Facturation</li>
                                        <li>Paiements</li>
                                        <li>Validations</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary">11.10 Bonnes Pratiques</h5>
                        <div className="surface-100 p-3 border-round">
                            <h6 className="text-blue-600">Surveillance</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Consulter régulièrement le journal pour détecter les anomalies</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Surveiller les échecs de connexion répétés (potentielles tentatives d'intrusion)</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Vérifier les suppressions de données sensibles</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Conservation</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Exporter périodiquement les logs pour archivage</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Conserver les exports selon la politique de rétention (généralement 5 ans minimum)</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Stocker les archives dans un emplacement sécurisé</li>
                            </ul>

                            <h6 className="text-blue-600 mt-3">Audit Interne</h6>
                            <ul className="line-height-3">
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Utiliser le journal lors des audits internes</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Documenter les investigations avec les références d'audit</li>
                                <li><i className="pi pi-check text-green-500 mr-2"></i>Rapporter toute activité suspecte à l'administrateur</li>
                            </ul>
                        </div>

                        <h5 className="text-primary mt-4">11.11 Questions Fréquentes - Journal d'Audit</h5>
                        <Accordion>
                            <AccordionTab header="Qui a accès au journal d'audit ?">
                                <p>L'accès au journal d'audit est réservé aux administrateurs et aux utilisateurs disposant des autorisations appropriées. Contactez votre administrateur pour obtenir les droits d'accès si nécessaire.</p>
                            </AccordionTab>
                            <AccordionTab header="Combien de temps les données d'audit sont-elles conservées ?">
                                <p>Les données d'audit sont conservées selon la politique de rétention de l'institution, généralement 5 ans minimum pour des raisons de conformité réglementaire. Les anciennes entrées peuvent être archivées automatiquement.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment retrouver qui a modifié un enregistrement spécifique ?">
                                <p>Utilisez les filtres pour rechercher par Table/Entité et ID Entité. Sélectionnez le type d'action "Modification" et définissez la période approximative. Les résultats montreront tous les utilisateurs ayant modifié cet enregistrement avec les détails des changements.</p>
                            </AccordionTab>
                            <AccordionTab header="Les actions des administrateurs sont-elles aussi tracées ?">
                                <p>Oui, absolument. Toutes les actions sont tracées sans exception, y compris celles des administrateurs. Cela garantit une transparence totale et une responsabilité pour toutes les opérations du système.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment voir les valeurs avant et après une modification ?">
                                <p>Cliquez sur l'icone "Voir détails" d'une entrée de modification, puis accédez à l'onglet "Valeurs". Les colonnes "Anciennes Valeurs" et "Nouvelles Valeurs" affichent les données au format JSON, permettant une comparaison complète des changements.</p>
                            </AccordionTab>
                        </Accordion>
                    </div>
                </AccordionTab>
            </Accordion>

            {/* Footer */}
            <Divider />
            <div className="text-center text-500 text-sm">
                <p>
                    <i className="pi pi-info-circle mr-2"></i>
                    Pour toute assistance supplémentaire, veuillez contacter l'administrateur système.
                </p>
                <p>Version 7.0 - Système AgrM - Modules: Gestion Clients, Groupes Solidaires, Produits Financiers, Épargne, Crédit, Remboursement, Comptabilité, Traçabilité</p>
            </div>
        </div>
    );
}

export default UserManualComponent;
