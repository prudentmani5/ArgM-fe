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

                        <h5 className="text-primary">6.3 Configuration d'un Produit de Crédit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Étapes de Configuration :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="Produits de Crédit" /> puis <Tag value="Nouveau Produit" severity="info" /></li>
                                <li><strong>Informations de Base :</strong>
                                    <ul>
                                        <li>Code produit (unique)</li>
                                        <li>Nom du produit (français et anglais)</li>
                                        <li>Type de produit et devise</li>
                                        <li>Clientèle cible (Individuel/Groupe/Mixte)</li>
                                    </ul>
                                </li>
                                <li><strong>Limites de Montant :</strong>
                                    <ul>
                                        <li>Montant minimum, maximum et par défaut</li>
                                        <li>Durée minimum, maximum et par défaut (en mois)</li>
                                    </ul>
                                </li>
                                <li><strong>Configuration des Intérêts :</strong>
                                    <ul>
                                        <li>Méthode de calcul des intérêts</li>
                                        <li>Taux minimum, maximum et par défaut (%)</li>
                                        <li>Fréquence de paiement</li>
                                    </ul>
                                </li>
                                <li><strong>Exigences :</strong>
                                    <ul>
                                        <li>Garantie requise (Oui/Non)</li>
                                        <li>Cautions requises et nombre minimum</li>
                                        <li>Remboursement anticipé autorisé</li>
                                        <li>Période de grâce autorisée</li>
                                    </ul>
                                </li>
                                <li><strong>Configuration Avancée :</strong>
                                    <ul>
                                        <li>Définir les frais applicables (onglet Frais)</li>
                                        <li>Définir les types de garanties acceptées</li>
                                        <li>Configurer le workflow d'approbation</li>
                                        <li>Spécifier les documents requis</li>
                                    </ul>
                                </li>
                                <li>Définir le statut : <Tag value="BROUILLON" /> → <Tag value="ACTIF" severity="success" /></li>
                            </ol>
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

                        <h5 className="text-primary">7.10 Conseils et Bonnes Pratiques</h5>
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

                        <h5 className="text-primary">8.9 Conseils et Bonnes Pratiques</h5>
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
                                <li><strong>Échéanciers :</strong> Génération et suivi des tableaux d'amortissement</li>
                                <li><strong>Paiements :</strong> Enregistrement avec allocation automatique (Pénalités → Intérêts → Capital)</li>
                                <li><strong>Recouvrement :</strong> Gestion en 3 phases (Amiable, Relance, Contentieux)</li>
                                <li><strong>Pénalités :</strong> Calcul automatique selon les jours de retard (0,5% à 2% par jour)</li>
                                <li><strong>Restructuration :</strong> Réaménagement des crédits en difficulté</li>
                                <li><strong>Contentieux :</strong> Gestion des dossiers juridiques avec approbation DG</li>
                            </ul>
                        </div>

                        <h5 className="text-primary">9.2 Données de Référence</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6 lg:col-4">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-credit-card mr-2"></i>Modes de Remboursement</h6>
                                    <ul className="text-sm">
                                        <li><strong>Espèces (CASH) :</strong> Paiement en liquide au guichet</li>
                                        <li><strong>Virement Bancaire :</strong> Transfert depuis un compte bancaire</li>
                                        <li><strong>Mobile Money :</strong> Paiement via Lumicash, Ecocash, etc.</li>
                                        <li><strong>Chèque :</strong> Paiement par chèque certifié</li>
                                        <li><strong>Prélèvement Épargne :</strong> Débit du compte épargne</li>
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

                        <h5 className="text-primary">9.5 Remboursement Anticipé</h5>
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

                        <h5 className="text-primary">9.6 Gestion du Recouvrement</h5>
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
                                <li>Assigner un agent de recouvrement</li>
                                <li>Planifier les actions selon la phase</li>
                                <li>Documenter chaque action entreprise</li>
                            </ol>
                        </div>

                        <h5 className="text-primary">9.7 Gestion des Dossiers Contentieux</h5>
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
                                        <li>Motif de la mise en contentieux</li>
                                        <li>Avocat assigné (si applicable)</li>
                                        <li>Tribunal compétent</li>
                                        <li>Documents justificatifs</li>
                                    </ul>
                                </li>
                                <li>Si le montant &gt; 500 000 FBU :
                                    <ul>
                                        <li>Le statut passe à <Tag value="En attente Approbation DG" severity="warning" /></li>
                                        <li>Le DG reçoit une notification</li>
                                        <li>Aucune action n'est possible avant approbation</li>
                                    </ul>
                                </li>
                                <li>Après approbation, suivre les étapes judiciaires</li>
                            </ol>

                            <p className="mt-3"><strong>Statuts des Dossiers Contentieux :</strong></p>
                            <div className="flex flex-wrap gap-2 align-items-center">
                                <Tag value="En préparation" severity="secondary" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="En attente Approbation DG" severity="warning" icon="pi pi-lock" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Déposé" severity="info" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="En cours" severity="warning" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Jugement" severity="info" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Exécution" severity="warning" />
                                <i className="pi pi-arrow-right text-500"></i>
                                <Tag value="Clôturé" severity="success" />
                            </div>
                        </div>

                        <h5 className="text-primary">9.8 Restructuration de Crédit</h5>
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

                        <h5 className="text-primary">9.9 Rapports du Module Remboursement</h5>
                        <div className="grid mb-3">
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-money-bill mr-2"></i>Rapport des Paiements</h6>
                                    <ul className="text-sm">
                                        <li>Liste des paiements par période</li>
                                        <li>Filtrage par mode de paiement</li>
                                        <li>Totaux par catégorie (Capital, Intérêts, Pénalités)</li>
                                        <li>Export Excel et PDF</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-exclamation-triangle mr-2"></i>Rapport des Retards</h6>
                                    <ul className="text-sm">
                                        <li>Liste des crédits en retard</li>
                                        <li>Classification par jours de retard</li>
                                        <li>Montants impayés et pénalités</li>
                                        <li>Coordonnées clients pour relance</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-users mr-2"></i>Rapport Recouvrement</h6>
                                    <ul className="text-sm">
                                        <li>Dossiers par phase de recouvrement</li>
                                        <li>Taux de recouvrement par agent</li>
                                        <li>Actions effectuées et résultats</li>
                                        <li>Performance globale</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card className="h-full">
                                    <h6 className="mt-0"><i className="pi pi-briefcase mr-2"></i>Rapport Contentieux</h6>
                                    <ul className="text-sm">
                                        <li>Dossiers par statut juridique</li>
                                        <li>Montants en contentieux</li>
                                        <li>Dossiers en attente approbation DG</li>
                                        <li>Résultats des procédures</li>
                                    </ul>
                                </Card>
                            </div>
                            <div className="col-12">
                                <Card>
                                    <h6 className="mt-0"><i className="pi pi-chart-pie mr-2"></i>Synthèse Remboursement</h6>
                                    <p className="text-sm">Tableau de bord complet avec :</p>
                                    <div className="grid">
                                        <div className="col-12 md:col-3">
                                            <ul className="text-sm">
                                                <li>Nombre de crédits actifs</li>
                                                <li>Encours total</li>
                                            </ul>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <ul className="text-sm">
                                                <li>Montant collecté</li>
                                                <li>Taux de recouvrement</li>
                                            </ul>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <ul className="text-sm">
                                                <li>Crédits en retard</li>
                                                <li>Montant impayé</li>
                                            </ul>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <ul className="text-sm">
                                                <li>Graphiques de tendance</li>
                                                <li>Top 10 impayés</li>
                                            </ul>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <h5 className="text-primary">9.10 Questions Fréquentes - Remboursement</h5>
                        <Accordion>
                            <AccordionTab header="Comment le système calcule-t-il les pénalités de retard ?">
                                <p>Les pénalités sont calculées selon la formule : <strong>Pénalité = Montant en retard × Taux journalier × Nombre de jours de retard</strong>. Le taux journalier est configuré dans les données de référence (généralement 0,5% à 2%). Un plafond maximum de 10% du capital restant dû est appliqué pour éviter des pénalités excessives.</p>
                            </AccordionTab>
                            <AccordionTab header="Pourquoi mon paiement n'a-t-il pas réduit le capital ?">
                                <p>Le système applique l'ordre d'allocation automatique : <strong>Pénalités → Intérêts → Capital</strong>. Si le paiement n'a pas réduit le capital, c'est qu'il a d'abord servi à couvrir les pénalités et intérêts dus. Consultez le détail de la ventilation dans le reçu de paiement.</p>
                            </AccordionTab>
                            <AccordionTab header="Quand un crédit passe-t-il en contentieux ?">
                                <p>Un crédit passe automatiquement en phase Contentieux lorsque le retard dépasse 90 jours. À ce stade, les actions de recouvrement classiques ont échoué et des procédures juridiques peuvent être envisagées, sous réserve de l'approbation du DG pour les montants supérieurs à 500 000 FBU.</p>
                            </AccordionTab>
                            <AccordionTab header="Peut-on restructurer un crédit plusieurs fois ?">
                                <p>Non, la politique de l'institution limite à <strong>une seule restructuration par crédit</strong>. Cette règle vise à éviter les restructurations en cascade et à encourager une discipline de remboursement. En cas de difficulté persistante après restructuration, le dossier doit être orienté vers le contentieux.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment obtenir l'approbation du DG pour un dossier contentieux ?">
                                <p>Lorsque vous créez un dossier contentieux pour un montant supérieur à 500 000 FBU, le système envoie automatiquement une demande d'approbation au Directeur Général. Le DG reçoit une notification et peut approuver ou rejeter via le menu dédié. Vous serez notifié de la décision et pourrez alors poursuivre les actions.</p>
                            </AccordionTab>
                            <AccordionTab header="Comment effectuer un remboursement anticipé partiel ?">
                                <p>Dans le menu "Remboursement Anticipé", après avoir sélectionné le crédit, choisissez l'option "Remboursement Partiel". Saisissez le montant que le client souhaite rembourser en plus de l'échéance courante. Le système recalculera automatiquement les échéances futures avec le nouveau capital restant.</p>
                            </AccordionTab>
                        </Accordion>
                    </div>
                </AccordionTab>

                {/* Journal d'Audit / Traçabilité */}
                <AccordionTab
                    header={
                        <span className="flex align-items-center gap-2">
                            <i className="pi pi-history"></i>
                            <span className="font-bold">10. Journal d'Audit (Traçabilité)</span>
                        </span>
                    }
                >
                    <div className="p-3">
                        <h5 className="text-primary">10.1 Vue d'Ensemble</h5>
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

                        <h5 className="text-primary">10.2 Accès au Journal d'Audit</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Pour accéder au journal :</strong></p>
                            <ol className="line-height-3">
                                <li>Accéder au menu <Tag value="ADMINISTRATION" /></li>
                                <li>Cliquer sur <Tag value="Journal d'Audit" severity="info" /></li>
                                <li>La page affiche les statistiques et la liste des actions enregistrées</li>
                            </ol>
                        </div>

                        <h5 className="text-primary">10.3 Types d'Actions Enregistrées</h5>
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

                        <h5 className="text-primary">10.4 Filtres de Recherche</h5>
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

                        <h5 className="text-primary">10.5 Informations Enregistrées</h5>
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

                        <h5 className="text-primary">10.6 Consultation des Détails</h5>
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

                        <h5 className="text-primary">10.7 Statistiques du Tableau de Bord</h5>
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

                        <h5 className="text-primary">10.8 Export des Données</h5>
                        <div className="surface-100 p-3 border-round mb-3">
                            <p><strong>Pour exporter le journal d'audit :</strong></p>
                            <ol className="line-height-3">
                                <li>Appliquer les filtres souhaités (période, utilisateur, etc.)</li>
                                <li>Cliquer sur le bouton <Tag value="Exporter CSV" severity="success" /></li>
                                <li>Le fichier CSV contient toutes les entrées correspondant aux filtres</li>
                            </ol>
                            <p className="mt-2"><strong>Colonnes exportées :</strong> ID, Date, Heure, Utilisateur, Action, Module, Entité, Description, Statut</p>
                        </div>

                        <h5 className="text-primary">10.9 Modules Tracés</h5>
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

                        <h5 className="text-primary">10.10 Bonnes Pratiques</h5>
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

                        <h5 className="text-primary mt-4">10.11 Questions Fréquentes - Journal d'Audit</h5>
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
                <p>Version 6.0 - Système AgrM - Modules: Gestion Clients, Groupes Solidaires, Produits Financiers, Épargne, Crédit, Remboursement, Traçabilité</p>
            </div>
        </div>
    );
}

export default UserManualComponent;
