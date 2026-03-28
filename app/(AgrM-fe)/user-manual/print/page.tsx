'use client';

import { useRef } from 'react';
import { Button } from 'primereact/button';
import './manual-print.css';

export default function PrintableManual() {
    const contentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => { window.print(); };

    const handleDownload = () => {
        // Direct download of the pre-generated PDF
        const link = document.createElement('a');
        link.href = '/PrFin_MIS_Manuel_Utilisateur.pdf';
        link.download = 'PrFin_MIS_Manuel_Utilisateur.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="no-print flex justify-content-center p-3 gap-2" style={{ background: '#f0f2fa', borderBottom: '2px solid #3F51B5' }}>
                <Button icon="pi pi-download" label="Télécharger PDF" onClick={handleDownload} severity="info" size="large" />
                <Button icon="pi pi-print" label="Imprimer" onClick={handlePrint} severity="success" size="large" />
                <Button icon="pi pi-arrow-left" label="Retour" onClick={() => window.history.back()} outlined size="large" />
            </div>

            <div ref={contentRef} className="pm">
                {/* ===== COVER PAGE ===== */}
                <div className="cover" style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <img src="/layout/images/logo/Welcome.PNG" alt="PrFin MIS" />
                    <h1 style={{ border: 'none', fontSize: '3rem', marginTop: '1rem', letterSpacing: '2px' }}>MANUEL D&apos;UTILISATION</h1>
                    <div style={{ width: '120px', height: '4px', background: 'linear-gradient(90deg, #b8942e, #1e2a4a, #b8942e)', margin: '1.5rem auto', borderRadius: '2px' }}></div>
                    <p style={{ fontSize: '1.4rem', color: '#555', fontWeight: 500, letterSpacing: '3px', marginTop: '0.5rem' }}>PROFESSIONAL FINANCIAL MANAGEMENT</p>
                    <p style={{ fontSize: '1.4rem', color: '#555', fontWeight: 500, letterSpacing: '3px' }}>INFORMATION SYSTEM</p>
                    <p style={{ fontSize: '1.3rem', color: '#b8942e', fontStyle: 'italic', marginTop: '2rem', fontFamily: 'Georgia, serif' }}>Good Finance. Real Impact.</p>
                    <div style={{ marginTop: '4rem', padding: '1.2rem 3rem', border: '2px solid #1e2a4a', borderRadius: '8px', background: '#f8f9ff' }}>
                        <p style={{ fontSize: '1.1rem', color: '#1e2a4a', margin: '0.3rem 0', fontWeight: 600 }}>Version 10.0</p>
                        <p style={{ fontSize: '1rem', color: '#666', margin: '0.3rem 0' }}>{new Date().getFullYear()}</p>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: '#999', marginTop: '2rem', letterSpacing: '1px' }}>DOCUMENT CONFIDENTIEL — USAGE INTERNE UNIQUEMENT</p>
                </div>

                {/* ===== TABLE OF CONTENTS ===== */}
                <div className="page-break"></div>
                <h1>Table des Matières</h1>
                <div className="toc">
                    <ol style={{ fontSize: '1rem' }}>
                        <li><a href="#sec0">Introduction et Connexion</a></li>
                        <li><a href="#sec1">Gestion des Clients</a></li>
                        <li><a href="#sec2">Gestion des Groupes Solidaires</a></li>
                        <li><a href="#sec3">Données de Référence</a></li>
                        <li><a href="#sec6">Module Produits Financiers</a></li>
                        <li><a href="#sec7">Module Épargne (Opérations)</a></li>
                        <li><a href="#sec8">Module Crédit</a></li>
                        <li><a href="#sec9">Module Remboursement</a></li>
                        <li><a href="#sec10">Module Comptabilité</a></li>
                        <li><a href="#sec12">Rapprochement Bancaire</a></li>
                        <li><a href="#sec14">Module Dépenses</a></li>
                        <li><a href="#sec13">Tableaux de Bord</a></li>
                        <li><a href="#sec15">Administration et Gestion des Utilisateurs</a></li>
                        <li><a href="#sec11">Journal d&apos;Audit (Traçabilité)</a></li>
                        <li><a href="#sec4">Conseils, Bonnes Pratiques et Glossaire</a></li>
                    </ol>
                </div>

                {/* ===== OVERVIEW ===== */}
                <div className="page-break"></div>
                <h1>Vue d&apos;Ensemble du Système</h1>
                <p>
                    <strong>PrFin MIS</strong> (Professional Financial Management Information System) est une plateforme intégrée
                    conçue pour les institutions de microfinance. Elle couvre l&apos;ensemble du cycle financier : de l&apos;enregistrement
                    des clients jusqu&apos;à la production des états financiers, en passant par l&apos;épargne, le crédit,
                    le remboursement et la gestion des dépenses.
                </p>
                <p>
                    Le système est accessible via un navigateur web (Google Chrome recommandé). Chaque utilisateur
                    dispose d&apos;un compte personnel avec des permissions adaptées à son rôle dans l&apos;institution.
                </p>

                <h3>Comment fonctionne le système au quotidien ?</h3>
                <p>Voici le flux typique d&apos;une journée de travail dans PrFin MIS :</p>
                <div className="step-box">
                    <strong>Flux quotidien d&apos;une agence :</strong>
                    <ol>
                        <li><strong>Le matin :</strong> Le caissier ouvre sa caisse dans le module <strong>Opérations</strong> en saisissant son solde d&apos;ouverture</li>
                        <li><strong>Pendant la journée :</strong> Les agents de terrain enregistrent de nouveaux clients, les caissiers effectuent des versements et retraits, les agents de crédit traitent les demandes</li>
                        <li><strong>En fin de journée :</strong> Le caissier fait son comptage physique, clôture sa caisse, et le responsable lance la clôture journalière</li>
                        <li><strong>En fin de mois :</strong> Le comptable vérifie les écritures, fait le rapprochement bancaire, et lance la clôture mensuelle</li>
                        <li><strong>En fin d&apos;année :</strong> Le comptable prépare les états financiers (bilan, compte de résultat) et lance la clôture annuelle</li>
                    </ol>
                </div>

                <h3>Modules disponibles</h3>
                <table>
                    <thead><tr><th>N°</th><th>Module</th><th>Description</th><th>Qui l&apos;utilise ?</th></tr></thead>
                    <tbody>
                        <tr><td>1</td><td>Enregistrement Clients</td><td>Création et suivi des clients individuels, entreprises et groupes solidaires</td><td>Agents de terrain, guichetiers</td></tr>
                        <tr><td>2</td><td>Produits Financiers</td><td>Configuration des produits de crédit (taux, durée, frais, garanties)</td><td>Administrateurs, responsables produits</td></tr>
                        <tr><td>3</td><td>Opérations (Épargne)</td><td>Ouverture de comptes, versements, retraits, virements, gestion de caisse</td><td>Caissiers, guichetiers</td></tr>
                        <tr><td>4</td><td>Crédit</td><td>Cycle complet : demande → analyse → comité → décaissement</td><td>Agents de crédit, analystes, comité</td></tr>
                        <tr><td>5</td><td>Remboursement</td><td>Suivi des échéanciers, paiements, recouvrement, restructuration</td><td>Agents de crédit, agents recouvrement</td></tr>
                        <tr><td>6</td><td>Comptabilité</td><td>Écritures, journaux, clôtures, rapports financiers (bilan, balance...)</td><td>Comptables</td></tr>
                        <tr><td>7</td><td>Rapprochement</td><td>Comparaison des soldes bancaires, caisse, crédits avec le système</td><td>Comptables, auditeurs</td></tr>
                        <tr><td>8</td><td>Dépenses</td><td>Demandes de dépenses avec approbation multi-niveaux, budgets</td><td>Tous les employés, managers, DG</td></tr>
                        <tr><td>9</td><td>Tableaux de Bord</td><td>Indicateurs de performance en temps réel par rôle</td><td>DG, chefs d&apos;agence, responsables</td></tr>
                        <tr><td>10</td><td>Administration</td><td>Gestion des utilisateurs, rôles, permissions, journal d&apos;audit</td><td>Administrateurs système</td></tr>
                    </tbody>
                </table>

                {/* ===== SECTION 0 : CONNEXION ===== */}
                <h2 id="sec0">0. Introduction et Connexion au Système</h2>

                <h3>0.1 Comment se connecter ?</h3>
                <p>Pour accéder à PrFin MIS, ouvrez votre navigateur et saisissez l&apos;adresse fournie par votre administrateur.</p>
                <div className="step-box">
                    <strong>Étapes de connexion :</strong>
                    <ol>
                        <li>Ouvrez <strong>Google Chrome</strong> (navigateur recommandé)</li>
                        <li>Saisissez l&apos;adresse du système dans la barre d&apos;adresse</li>
                        <li>Sur la page de connexion, entrez votre <strong>nom d&apos;utilisateur</strong> (adresse e-mail)</li>
                        <li>Entrez votre <strong>mot de passe</strong></li>
                        <li>Cliquez sur le bouton <span className="tag t-blue">ENTRER</span></li>
                    </ol>
                </div>
                <div className="warning"><strong>⚠ Important :</strong> Ne partagez jamais votre mot de passe avec un collègue. Chaque utilisateur doit avoir son propre compte. En cas d&apos;oubli de mot de passe, contactez l&apos;administrateur.</div>

                <h3>0.2 Comprendre l&apos;interface</h3>
                <p>Une fois connecté, vous verrez l&apos;écran principal composé de 4 zones :</p>
                <table>
                    <thead><tr><th>Zone</th><th>Position</th><th>Description détaillée</th></tr></thead>
                    <tbody>
                        <tr><td><strong>Barre du haut (Topbar)</strong></td><td>Tout en haut</td><td>Affiche le logo de l&apos;institution à gauche, le nom du système &quot;PROFESSIONAL FINANCIAL MANAGEMENT INFORMATION SYSTEM - PrFin MIS&quot; au centre, et votre nom avec votre rôle à droite. Cliquez sur votre nom pour voir le menu de déconnexion.</td></tr>
                        <tr><td><strong>Barre de navigation (Navbar)</strong></td><td>Sous la topbar</td><td>Contient tous les menus du système. Chaque menu correspond à un module (Opérations, Crédit, Comptabilité...). Cliquez sur un menu pour faire apparaître un panneau déroulant avec les sous-menus organisés en colonnes.</td></tr>
                        <tr><td><strong>Fil d&apos;Ariane</strong></td><td>Sous la navbar</td><td>Indique votre position actuelle dans le système. Exemple : 🏠 &gt; Comptabilité &gt; Rapports &gt; Balance. Vous pouvez cliquer sur chaque niveau pour revenir en arrière.</td></tr>
                        <tr><td><strong>Zone de contenu</strong></td><td>Centre de la page</td><td>C&apos;est la zone principale où s&apos;affichent les formulaires de saisie, les tableaux de données, les rapports et les graphiques. C&apos;est ici que vous travaillez.</td></tr>
                    </tbody>
                </table>
                <div className="note"><strong>💡 Astuce :</strong> Vous ne voyez que les menus correspondant à vos permissions. Si un menu est absent, c&apos;est normal — votre rôle ne vous y donne pas accès. Contactez l&apos;administrateur si vous avez besoin d&apos;un accès supplémentaire.</div>

                <h3>0.3 Comment naviguer dans un tableau de données ?</h3>
                <p>La plupart des écrans affichent des données sous forme de tableau. Voici comment les utiliser :</p>
                <div className="step-box">
                    <strong>Fonctionnalités des tableaux :</strong>
                    <ol>
                        <li><strong>Recherche globale :</strong> En haut du tableau, une barre de recherche permet de filtrer les données en tapant un mot clé. Le tableau se met à jour en temps réel pendant que vous tapez.</li>
                        <li><strong>Tri par colonne :</strong> Cliquez sur l&apos;en-tête d&apos;une colonne pour trier les données par ordre croissant. Cliquez à nouveau pour trier par ordre décroissant.</li>
                        <li><strong>Pagination :</strong> En bas du tableau, des boutons de page (1, 2, 3...) permettent de naviguer entre les pages si la liste est longue. Vous pouvez aussi choisir le nombre de lignes par page (10, 25, 50).</li>
                        <li><strong>Boutons d&apos;action :</strong> À droite de chaque ligne, des icônes permettent d&apos;agir :
                            <ul>
                                <li>👁 <strong>Œil (bleu)</strong> = Voir les détails en lecture seule</li>
                                <li>✏️ <strong>Crayon (jaune)</strong> = Modifier les informations</li>
                                <li>🗑 <strong>Corbeille (rouge)</strong> = Supprimer (avec confirmation)</li>
                                <li>✅ <strong>Coche (vert)</strong> = Valider / Approuver</li>
                            </ul>
                        </li>
                        <li><strong>Export :</strong> Certains tableaux ont un bouton d&apos;export pour télécharger les données en Excel ou PDF.</li>
                    </ol>
                </div>

                <h3>0.4 Comment se déconnecter ?</h3>
                <div className="step-box">
                    <strong>Étapes :</strong>
                    <ol>
                        <li>Cliquez sur votre <strong>nom et rôle</strong> en haut à droite de l&apos;écran</li>
                        <li>Un menu déroulant apparaît</li>
                        <li>Cliquez sur le bouton de <strong>déconnexion</strong> (icône de sortie)</li>
                        <li>Vous êtes redirigé vers la page de connexion</li>
                    </ol>
                </div>
                <div className="warning"><strong>⚠ Sécurité :</strong> Déconnectez-vous toujours avant de quitter votre poste, surtout si l&apos;ordinateur est partagé. Ne laissez jamais votre session ouverte sans surveillance.</div>

                {/* ===== SECTION 1 : CLIENTS ===== */}
                <h2 id="sec1">1. Gestion des Clients</h2>
                <p>
                    Ce module permet d&apos;enregistrer et de gérer tous les clients de l&apos;institution.
                    Un client doit être enregistré dans le système avant de pouvoir ouvrir un compte d&apos;épargne ou faire une demande de crédit.
                    Il existe deux types de clients : <strong>Individuel</strong> (personne physique) et <strong>Entreprise</strong> (personne morale).
                </p>

                <h3>1.1 Comment créer un nouveau client ?</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Enregistrement des clients → Clients → onglet &quot;Nouveau Client&quot;</span>
                    <ol>
                        <li><strong>Choisir le type de client :</strong> Cliquez sur &quot;Individuel&quot; pour une personne physique ou &quot;Entreprise&quot; pour une société/association.</li>
                        <li><strong>Remplir les informations obligatoires</strong> (marquées par une étoile rouge *) :
                            <ul>
                                <li>Pour un <strong>individuel</strong> : Nom, Prénom, Téléphone, Agence, Province, Commune</li>
                                <li>Pour une <strong>entreprise</strong> : Raison sociale, N° RCCM, Téléphone, Agence, Province, Commune</li>
                            </ul>
                        </li>
                        <li><strong>Compléter les informations optionnelles</strong> selon les documents disponibles : date de naissance, numéro de pièce d&apos;identité, profession, adresse complète, photo...</li>
                        <li><strong>Enregistrer :</strong> Cliquez sur le bouton vert <span className="tag t-green">Enregistrer</span>. Un numéro de client sera automatiquement attribué.</li>
                    </ol>
                </div>

                <div className="example"><strong>📋 Exemple :</strong> Jean NDAYISABA se présente à l&apos;agence de Bujumbura avec sa CNI. L&apos;agent crée un client de type &quot;Individuel&quot;, saisit son nom, prénom, numéro de CNI, téléphone, et sélectionne l&apos;agence &quot;Bujumbura Centre&quot;. Après enregistrement, Jean reçoit le numéro client CLT-2026-0001.</div>

                <h3>1.2 Les informations d&apos;un client individuel</h3>
                <table>
                    <thead><tr><th>Champ</th><th>Obligatoire ?</th><th>Description</th></tr></thead>
                    <tbody>
                        <tr><td>Nom et Prénom</td><td>Oui</td><td>Nom complet tel qu&apos;il apparaît sur la pièce d&apos;identité</td></tr>
                        <tr><td>Date de naissance</td><td>Non</td><td>Permet de calculer l&apos;âge du client</td></tr>
                        <tr><td>Genre</td><td>Non</td><td>Masculin ou Féminin</td></tr>
                        <tr><td>Nationalité</td><td>Non</td><td>Pays d&apos;origine du client</td></tr>
                        <tr><td>Pièce d&apos;identité</td><td>Non</td><td>Type (CNI, Passeport...) et numéro</td></tr>
                        <tr><td>Téléphone</td><td>Oui</td><td>Numéro principal pour le contacter</td></tr>
                        <tr><td>Agence</td><td>Oui</td><td>Agence à laquelle le client est rattaché</td></tr>
                        <tr><td>Province / Commune</td><td>Oui</td><td>Lieu de résidence</td></tr>
                        <tr><td>Profession</td><td>Non</td><td>Activité principale du client</td></tr>
                        <tr><td>Revenus mensuels</td><td>Non</td><td>Estimation des revenus (utile pour le crédit)</td></tr>
                    </tbody>
                </table>

                <h3>1.3 Comment rechercher un client existant ?</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Enregistrement des clients → Clients → onglet &quot;Liste des Clients&quot;</span>
                    <ol>
                        <li>Utilisez la <strong>barre de recherche</strong> en haut du tableau pour filtrer par nom, numéro ou téléphone</li>
                        <li>Les résultats s&apos;affichent dans le tableau en dessous</li>
                        <li>Pour chaque client, vous disposez de boutons d&apos;action :
                            <ul>
                                <li>👁 <strong>Œil</strong> : Voir les détails complets du client</li>
                                <li>✏️ <strong>Crayon</strong> : Modifier les informations</li>
                                <li>🗑 <strong>Corbeille</strong> : Archiver le client</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <h3>1.4 Les statuts d&apos;un client</h3>
                <p>Chaque client passe par différents statuts au cours de sa relation avec l&apos;institution :</p>
                <table>
                    <thead><tr><th>Statut</th><th>Signification</th><th>Peut faire des opérations ?</th></tr></thead>
                    <tbody>
                        <tr><td><span className="tag t-blue">Prospect</span></td><td>Client potentiel, vient d&apos;être créé, pas encore validé</td><td>Non</td></tr>
                        <tr><td><span className="tag t-orange">En attente</span></td><td>Dossier soumis, en cours de vérification par un responsable</td><td>Non</td></tr>
                        <tr><td><span className="tag t-green">Actif</span></td><td>Client validé et approuvé, peut ouvrir des comptes et faire des opérations</td><td><strong>Oui</strong></td></tr>
                        <tr><td><span className="tag t-red">Inactif</span></td><td>Compte suspendu temporairement</td><td>Non</td></tr>
                        <tr><td><span className="tag t-red">Liste noire</span></td><td>Client interdit de toute opération (fraude, impayés graves...)</td><td>Non</td></tr>
                    </tbody>
                </table>
                <div className="warning"><strong>⚠ Règle importante :</strong> Seuls les clients avec le statut <strong>&quot;Actif&quot;</strong> peuvent ouvrir un compte d&apos;épargne, rejoindre un groupe solidaire ou déposer une demande de crédit.</div>

                {/* ===== SECTION 2 : GROUPES ===== */}
                <h2 id="sec2">2. Gestion des Groupes Solidaires</h2>
                <p>
                    Un groupe solidaire est une association de clients qui se portent garants les uns des autres pour obtenir des crédits.
                    Chaque membre contribue à une épargne collective et partage la responsabilité du remboursement.
                </p>

                <h3>2.1 Comment créer un groupe ?</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Enregistrement des clients → Enregistrement du groupe</span>
                    <ol>
                        <li><strong>Informations de base :</strong> Nom du groupe, Type, Date de formation, Agence, Province/Commune/Zone</li>
                        <li><strong>Calendrier de réunion :</strong> Choisir la fréquence (hebdomadaire, bimensuelle, mensuelle), le jour, l&apos;heure et le lieu de réunion</li>
                        <li><strong>Paramètres financiers :</strong> Cotisation d&apos;adhésion, objectif d&apos;épargne mensuel, type de garantie solidaire, montant de garantie</li>
                        <li>Cliquer sur <span className="tag t-green">Enregistrer</span></li>
                    </ol>
                </div>

                <h3>2.2 Comment ajouter des membres ?</h3>
                <div className="step-box">
                    <strong>Après la création du groupe :</strong>
                    <ol>
                        <li>Dans la liste des groupes, cliquez sur l&apos;icône <strong>membres</strong> (icône personnes) du groupe concerné</li>
                        <li>Cliquez sur <span className="tag t-blue">Ajouter un membre</span></li>
                        <li>Recherchez et sélectionnez un client <strong>actif</strong></li>
                        <li>Attribuez un rôle :
                            <ul>
                                <li><strong>Président :</strong> Dirige les réunions, représente le groupe</li>
                                <li><strong>Secrétaire :</strong> Gère les procès-verbaux</li>
                                <li><strong>Trésorier :</strong> Gère les fonds du groupe</li>
                                <li><strong>Membre :</strong> Participant ordinaire</li>
                            </ul>
                        </li>
                        <li>Définissez sa contribution aux parts</li>
                        <li><span className="tag t-green">Enregistrer</span></li>
                    </ol>
                </div>

                <h3>2.3 Cycle de vie d&apos;un groupe</h3>
                <table>
                    <thead><tr><th>Statut</th><th>Signification</th><th>Actions possibles</th></tr></thead>
                    <tbody>
                        <tr><td>En formation</td><td>Le groupe vient d&apos;être créé, les membres sont en cours d&apos;ajout</td><td>Ajouter/retirer des membres</td></tr>
                        <tr><td>En attente</td><td>Le groupe est complet et soumis pour approbation</td><td>Aucune modification</td></tr>
                        <tr><td>Actif</td><td>Le groupe est approuvé et peut demander des crédits</td><td>Opérations financières</td></tr>
                        <tr><td>Suspendu</td><td>Activités temporairement arrêtées</td><td>Aucune opération</td></tr>
                        <tr><td>Dissous</td><td>Le groupe est définitivement fermé</td><td>Consultation uniquement</td></tr>
                    </tbody>
                </table>

                {/* ===== SECTION 3 : DONNÉES DE RÉFÉRENCE ===== */}
                <h2 id="sec3">3. Données de Référence</h2>
                <p>
                    Les données de référence sont les <strong>listes de valeurs configurables</strong> utilisées partout dans le système.
                    Par exemple : les provinces, les types de pièce d&apos;identité, les secteurs d&apos;activité, etc.
                    Elles doivent être configurées <strong>avant</strong> de commencer à utiliser le système.
                </p>
                <div className="info"><strong>ℹ️ Qui peut modifier ?</strong> Seuls les utilisateurs ayant la permission <strong>SETTINGS</strong> du module concerné peuvent ajouter, modifier ou supprimer des données de référence.</div>

                <h3>Données de référence par module</h3>
                <table>
                    <thead><tr><th>Module</th><th>Chemin du menu</th><th>Éléments configurables</th></tr></thead>
                    <tbody>
                        <tr><td>Clients</td><td>Enregistrement des clients → Paramètres de base</td><td>Provinces, Communes, Types de pièce d&apos;identité, Nationalités, Secteurs d&apos;activité, Types de société, Agences</td></tr>
                        <tr><td>Produits Financiers</td><td>Produits Finances → (chaque sous-menu)</td><td>Devises, Types de produit, Types de frais, Types de garanties, Fréquences de paiement, Méthodes de calcul d&apos;intérêt</td></tr>
                        <tr><td>Épargne</td><td>Opérations → Données de Référence</td><td>Types d&apos;opérations, Statuts de livret, Durées de terme, Niveaux d&apos;autorisation</td></tr>
                        <tr><td>Crédit</td><td>Crédit → Réf. Demandes / Réf. Profil Client / Risque &amp; Scoring</td><td>Statuts de demande, Objets de crédit, Types de documents, Décisions du comité, Types de revenus/dépenses/garanties, Niveaux de risque, Règles de scoring</td></tr>
                        <tr><td>Remboursement</td><td>Remboursement → Données de Référence</td><td>Modes de remboursement, Étapes de recouvrement, Classifications de retard, Config. pénalités, Règles de rappel</td></tr>
                        <tr><td>Dépenses</td><td>Dépenses → Données de Référence</td><td>Catégories de dépenses, Niveaux de priorité, Modes de paiement, Seuils d&apos;approbation, Fournisseurs</td></tr>
                    </tbody>
                </table>

                {/* ===== SECTION 6 : PRODUITS FINANCIERS ===== */}
                <h2 id="sec6">4. Module Produits Financiers</h2>
                <p>
                    Avant de pouvoir accorder des crédits, l&apos;institution doit <strong>configurer ses produits de crédit</strong>.
                    Un produit définit les conditions : montant minimum/maximum, taux d&apos;intérêt, durée, mode de calcul des intérêts, frais et garanties exigées.
                </p>

                <h3>4.1 Comment créer un produit de crédit ?</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Produits Finances → Tous les Produits → Nouveau Produit</span>
                    <ol>
                        <li><strong>Informations générales :</strong> Code du produit, Nom, Description, Type de produit, Devise</li>
                        <li><strong>Paramètres de montant :</strong> Montant minimum et maximum accordé</li>
                        <li><strong>Paramètres de durée :</strong> Durée minimum et maximum (en mois)</li>
                        <li><strong>Taux d&apos;intérêt :</strong> Taux annuel, Méthode de calcul (linéaire, dégressif, in fine)</li>
                        <li><strong>Pénalités :</strong> Taux de pénalité en cas de retard de remboursement</li>
                        <li><strong>Frais :</strong> Ajouter les frais applicables (dossier, assurance, commission...)</li>
                        <li><strong>Garanties :</strong> Définir les types de garanties exigées</li>
                        <li>Cliquer sur <span className="tag t-green">Enregistrer</span></li>
                    </ol>
                </div>

                <div className="example"><strong>📋 Exemple :</strong> L&apos;institution crée le produit &quot;Crédit Agriculture&quot; : montant 500 000 à 10 000 000 FBu, durée 6 à 36 mois, taux 18% annuel en linéaire, frais de dossier 2%, garantie caution solidaire obligatoire.</div>

                <h3>4.2 Éléments configurables pré-requis</h3>
                <p>Avant de créer un produit, assurez-vous d&apos;avoir configuré :</p>
                <ul>
                    <li><strong>Devises :</strong> Au moins une devise active (ex: BIF)</li>
                    <li><strong>Types de Frais :</strong> Les frais que vous facturez (dossier, assurance, etc.)</li>
                    <li><strong>Types de Garanties :</strong> Les garanties que vous acceptez (hypothèque, nantissement, caution)</li>
                    <li><strong>Fréquences de Paiement :</strong> Comment le client rembourse (mensuel, trimestriel, etc.)</li>
                </ul>

                {/* ===== SECTION 7 : ÉPARGNE ===== */}
                <h2 id="sec7">5. Module Épargne (Opérations)</h2>
                <p>
                    Ce module est le cœur des opérations quotidiennes au guichet. Il gère les comptes d&apos;épargne des clients,
                    les versements (dépôts), les retraits, les virements et la gestion de caisse.
                    <strong> C&apos;est le module le plus utilisé par les caissiers et guichetiers.</strong>
                </p>

                <h3>5.1 Gestion de Caisse — La première chose à faire chaque matin</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Opérations → Gestion de Caisse</span>
                    <p>Chaque caissier doit ouvrir sa caisse en début de journée et la fermer en fin de journée.</p>
                    <ol>
                        <li><strong>Ouverture :</strong> Saisissez le solde d&apos;ouverture (montant en caisse au début de la journée). Ce montant doit correspondre au solde de clôture de la veille.</li>
                        <li><strong>Pendant la journée :</strong> Le système enregistre automatiquement chaque versement et retrait effectué.</li>
                        <li><strong>Approvisionnement :</strong> Si votre caisse manque de fonds, demandez un approvisionnement depuis la caisse principale.</li>
                        <li><strong>Retour de fonds :</strong> Si vous avez trop de liquidités, faites un retour vers la caisse principale.</li>
                        <li><strong>Clôture :</strong> En fin de journée, effectuez un comptage physique des billets et pièces, puis comparez avec le solde système.</li>
                    </ol>
                </div>
                <div className="warning"><strong>⚠ Règle :</strong> Vous ne pouvez pas effectuer de versements ou retraits tant que votre caisse n&apos;est pas ouverte. Le système vous bloquera.</div>

                <h3>5.2 Ouvrir un compte d&apos;épargne</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Opérations → Épargne Libre → Ouverture Compte</span>
                    <ol>
                        <li>Recherchez et sélectionnez le <strong>client</strong> (doit être au statut &quot;Actif&quot;)</li>
                        <li>Choisissez le <strong>type de compte</strong> :
                            <ul>
                                <li><strong>Épargne libre :</strong> Le client peut déposer et retirer à tout moment</li>
                                <li><strong>Dépôt à Terme (DAT) :</strong> L&apos;argent est bloqué pour une durée définie avec un taux d&apos;intérêt plus élevé</li>
                                <li><strong>Épargne obligatoire :</strong> Versement régulier obligatoire (souvent lié au crédit)</li>
                            </ul>
                        </li>
                        <li>Remplissez les paramètres du compte (montant minimum, etc.)</li>
                        <li><span className="tag t-green">Enregistrer</span> — Un numéro de compte est automatiquement attribué</li>
                    </ol>
                </div>

                <h3>5.3 Effectuer un Versement (Dépôt)</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Opérations → Versement</span>
                    <p>Quand un client vient déposer de l&apos;argent sur son compte :</p>
                    <ol>
                        <li><strong>Sélectionner le compte</strong> du client (par numéro de compte ou nom)</li>
                        <li><strong>Vérifier les informations</strong> affichées : nom du client, numéro de compte, solde actuel</li>
                        <li><strong>Saisir le montant</strong> du dépôt</li>
                        <li><strong>Valider</strong> l&apos;opération</li>
                        <li><strong>Imprimer le bordereau de dépôt</strong> à remettre au client comme reçu</li>
                    </ol>
                </div>
                <div className="note"><strong>💡 Astuce :</strong> Après validation, le solde du compte est immédiatement mis à jour. Le client peut vérifier son nouveau solde sur le bordereau imprimé.</div>

                <h3>5.4 Effectuer un Retrait</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Opérations → Retrait</span>
                    <p>Quand un client souhaite retirer de l&apos;argent :</p>
                    <ol>
                        <li><strong>Sélectionner le compte</strong> du client</li>
                        <li><strong>Saisir le montant</strong> souhaité</li>
                        <li>Le système vérifie automatiquement :
                            <ul>
                                <li>Que le <strong>solde est suffisant</strong></li>
                                <li>Que le <strong>solde minimum</strong> du compte sera respecté</li>
                                <li>Qu&apos;il n&apos;y a pas de <strong>montant bloqué</strong></li>
                            </ul>
                        </li>
                        <li><strong>Validation multi-niveaux</strong> selon le montant :
                            <ul>
                                <li>Petit montant : validation caissier uniquement</li>
                                <li>Montant moyen : vérification par un superviseur</li>
                                <li>Gros montant : approbation du responsable d&apos;agence</li>
                            </ul>
                        </li>
                        <li>Une fois approuvé, <strong>décaisser</strong> les fonds et remettre au client</li>
                    </ol>
                </div>

                <h3>5.5 Effectuer un Virement entre comptes</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Opérations → Épargne Libre → Virements</span>
                    <p>Quand un client veut transférer de l&apos;argent d&apos;un de ses comptes vers un autre :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Sélectionnez le <strong>compte source</strong> (celui d&apos;où l&apos;argent va partir)</li>
                        <li><strong>Étape 2 :</strong> Sélectionnez le <strong>compte destinataire</strong> (celui qui va recevoir l&apos;argent)</li>
                        <li><strong>Étape 3 :</strong> Saisissez le <strong>montant</strong> à transférer</li>
                        <li><strong>Étape 4 :</strong> Ajoutez un <strong>motif</strong> (optionnel mais recommandé, ex: &quot;Transfert vers DAT&quot;)</li>
                        <li><strong>Étape 5 :</strong> Vérifiez les informations affichées (noms, numéros de comptes, montant)</li>
                        <li><strong>Étape 6 :</strong> Cliquez sur <span className="tag t-green">Valider le Virement</span></li>
                    </ol>
                </div>
                <div className="note"><strong>💡</strong> Le solde du compte source est débité et le compte destinataire est crédité instantanément. Les deux mouvements apparaissent dans l&apos;historique des deux comptes.</div>

                <h3>5.6 Demander une Attestation ou Situation de Compte</h3>
                <div className="step-box">
                    <strong>Types de documents disponibles :</strong>
                    <ol>
                        <li><strong>Demande de Situation</strong> <span className="menu-path">(Opérations → Demande de Situation)</span> :
                            <ul>
                                <li>Sélectionnez le compte du client</li>
                                <li>Le système affiche le solde actuel, le montant disponible et le montant bloqué</li>
                                <li>Cliquez sur <span className="tag t-blue">Imprimer</span> pour générer le document à remettre au client</li>
                            </ul>
                        </li>
                        <li><strong>Demande d&apos;Historique</strong> <span className="menu-path">(Opérations → Demande d&apos;Historique)</span> :
                            <ul>
                                <li>Sélectionnez le compte du client</li>
                                <li>Choisissez la <strong>période</strong> (date début et date fin)</li>
                                <li>Le système affiche tous les mouvements (versements, retraits, virements) de la période</li>
                                <li>Cliquez sur <span className="tag t-blue">Imprimer</span> pour le relevé</li>
                            </ul>
                        </li>
                        <li><strong>Attestation de Non Redevabilité</strong> <span className="menu-path">(Opérations → Attestation Non Redevabilité)</span> :
                            <ul>
                                <li>Ce document certifie que le client n&apos;a <strong>aucune dette</strong> envers l&apos;institution</li>
                                <li>Sélectionnez le client, vérifiez qu&apos;il n&apos;a pas de prêt en cours</li>
                                <li>Générez et imprimez l&apos;attestation</li>
                            </ul>
                        </li>
                        <li><strong>Attestation d&apos;Engagement</strong> <span className="menu-path">(Opérations → Attestation d&apos;Engagement)</span> :
                            <ul>
                                <li>Ce document certifie que le client est membre actif de l&apos;institution</li>
                                <li>Sélectionnez le client et générez le document</li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <h3>5.7 Clôture Journalière de l&apos;Épargne</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Opérations → Clôture Journalière</span>
                    <p>À effectuer <strong>chaque soir</strong> avant de quitter l&apos;agence :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Vérifiez que toutes les opérations du jour ont été saisies et validées</li>
                        <li><strong>Étape 2 :</strong> Vérifiez que toutes les caisses sont clôturées (chaque caissier doit avoir fermé sa caisse)</li>
                        <li><strong>Étape 3 :</strong> Accédez à l&apos;écran de clôture journalière</li>
                        <li><strong>Étape 4 :</strong> Le système affiche un résumé : nombre de versements, nombre de retraits, totaux</li>
                        <li><strong>Étape 5 :</strong> Cliquez sur <span className="tag t-green">Lancer la Clôture</span></li>
                        <li><strong>Étape 6 :</strong> Après clôture, <strong>aucune opération ne peut être modifiée</strong> pour cette journée</li>
                    </ol>
                </div>
                <div className="warning"><strong>⚠ Attention :</strong> La clôture journalière est <strong>irréversible</strong>. Assurez-vous que toutes les opérations sont correctes avant de lancer la clôture. Si une erreur est découverte après, il faudra passer une opération corrective le jour suivant.</div>

                <h3>5.8 Récapitulatif des opérations d&apos;épargne</h3>
                <table>
                    <thead><tr><th>Opération</th><th>Chemin dans le menu</th><th>Qui peut le faire ?</th><th>Quand ?</th></tr></thead>
                    <tbody>
                        <tr><td>Ouvrir une caisse</td><td>Opérations → Gestion de Caisse</td><td>Caissier</td><td>Chaque matin</td></tr>
                        <tr><td>Faire un versement</td><td>Opérations → Versement</td><td>Caissier</td><td>Quand un client dépose</td></tr>
                        <tr><td>Faire un retrait</td><td>Opérations → Retrait</td><td>Caissier + Superviseur</td><td>Quand un client retire</td></tr>
                        <tr><td>Faire un virement</td><td>Opérations → Virements</td><td>Caissier</td><td>Sur demande du client</td></tr>
                        <tr><td>Ouvrir un compte</td><td>Opérations → Ouverture Compte</td><td>Agent / Caissier</td><td>Nouveau client</td></tr>
                        <tr><td>Imprimer situation</td><td>Opérations → Demande de Situation</td><td>Caissier</td><td>Sur demande du client</td></tr>
                        <tr><td>Imprimer historique</td><td>Opérations → Demande d&apos;Historique</td><td>Caissier</td><td>Sur demande du client</td></tr>
                        <tr><td>Frais de tenue</td><td>Opérations → Frais de Tenue de Compte</td><td>Administrateur</td><td>Périodiquement</td></tr>
                        <tr><td>Clôturer la journée</td><td>Opérations → Clôture Journalière</td><td>Responsable agence</td><td>Chaque soir</td></tr>
                    </tbody>
                </table>

                {/* ===== SECTION 8 : CRÉDIT ===== */}
                <h2 id="sec8">6. Module Crédit</h2>
                <p>
                    Ce module gère le <strong>cycle complet d&apos;une demande de crédit</strong>, depuis la réception de la demande
                    jusqu&apos;au décaissement des fonds. C&apos;est un processus en plusieurs étapes qui implique différents acteurs
                    (agent de crédit, analyste, comité de crédit, caissier).
                </p>

                <h3>6.1 Les étapes d&apos;une demande de crédit</h3>
                <table>
                    <thead><tr><th>Étape</th><th>Qui ?</th><th>Que fait-on ?</th><th>Résultat</th></tr></thead>
                    <tbody>
                        <tr><td>1. Initialisation</td><td>Agent de crédit</td><td>Créer la demande avec les infos du client et le produit choisi</td><td>Demande enregistrée</td></tr>
                        <tr><td>2. Documents</td><td>Agent de crédit</td><td>Collecter et scanner les pièces justificatives</td><td>Dossier complet</td></tr>
                        <tr><td>3. Analyse financière</td><td>Analyste</td><td>Saisir les revenus, dépenses, calculer la capacité de remboursement</td><td>Ratio DTI calculé</td></tr>
                        <tr><td>4. Visite de terrain</td><td>Agent de crédit</td><td>Visite sur place, photos, coordonnées GPS, recommandations</td><td>Rapport de visite</td></tr>
                        <tr><td>5. Comité de crédit</td><td>Comité</td><td>Étudier le dossier et prendre une décision collective</td><td>Approuvé ou Rejeté</td></tr>
                        <tr><td>6. Décaissement</td><td>Caissier/Comptable</td><td>Mettre les fonds à disposition du client</td><td>Prêt actif</td></tr>
                    </tbody>
                </table>

                <h3>6.2 Comment créer une demande de crédit ?</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Crédit → Gestion des Demandes → Nouvelle Demande</span>
                    <ol>
                        <li><strong>Sélectionner le compte d&apos;épargne</strong> du client demandeur — le nom du client se remplit automatiquement</li>
                        <li><strong>Choisir l&apos;agence de traitement</strong> — l&apos;agence qui va traiter la demande</li>
                        <li><strong>Sélectionner le produit de crédit</strong> — les conditions (taux, durée, etc.) se remplissent automatiquement</li>
                        <li><strong>Saisir le montant demandé</strong> — doit être entre le minimum et le maximum du produit</li>
                        <li><strong>Indiquer l&apos;objet du crédit</strong> — pourquoi le client emprunte (agriculture, commerce, construction...)</li>
                        <li><strong>Choisir la durée souhaitée</strong> (en mois)</li>
                        <li>Cliquer sur <span className="tag t-green">Enregistrer</span></li>
                    </ol>
                </div>

                <h3>6.3 L&apos;analyse financière</h3>
                <p>L&apos;analyse financière évalue si le client peut rembourser le prêt. Elle comprend 3 volets :</p>
                <ul>
                    <li><strong>Revenus :</strong> Lister toutes les sources de revenus du client (salaire, commerce, agriculture, loyers...) avec le montant mensuel de chacune</li>
                    <li><strong>Dépenses :</strong> Lister toutes les charges (loyer, nourriture, scolarité, autres crédits en cours...) avec le montant mensuel</li>
                    <li><strong>Capacité de remboursement :</strong> Le système calcule automatiquement :
                        <ul>
                            <li><strong>Revenu net</strong> = Total revenus - Total dépenses</li>
                            <li><strong>Ratio DTI</strong> (dette/revenu) = Échéance mensuelle / Revenu net</li>
                            <li>Un DTI inférieur à 40% est généralement considéré comme acceptable</li>
                        </ul>
                    </li>
                </ul>

                <h3>6.4 Le décaissement</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Crédit → Décaissements → Demandes Approuvées</span>
                    <p>Le décaissement est l&apos;acte de remettre les fonds au client après approbation :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Accédez à la liste des demandes approuvées</li>
                        <li><strong>Étape 2 :</strong> Sélectionnez la demande à décaisser — vérifiez le nom du client, le montant et les conditions</li>
                        <li><strong>Étape 3 :</strong> Choisissez le <strong>mode de décaissement</strong> :
                            <ul>
                                <li><strong>Virement sur compte d&apos;épargne :</strong> L&apos;argent est directement crédité sur le compte du client</li>
                                <li><strong>Espèces :</strong> Le client reçoit l&apos;argent en main propre au guichet</li>
                                <li><strong>Chèque :</strong> Un chèque est émis au nom du client</li>
                            </ul>
                        </li>
                        <li><strong>Étape 4 :</strong> Vérifiez une dernière fois toutes les informations</li>
                        <li><strong>Étape 5 :</strong> Cliquez sur <span className="tag t-green">Confirmer le Décaissement</span></li>
                        <li><strong>Étape 6 :</strong> Le système génère automatiquement l&apos;<strong>échéancier de remboursement</strong> avec toutes les dates et montants à payer</li>
                        <li><strong>Étape 7 :</strong> Imprimez le <strong>contrat de prêt</strong> et l&apos;<strong>échéancier</strong> à faire signer par le client</li>
                    </ol>
                </div>
                <div className="example"><strong>📋 Exemple :</strong> Jean NDAYISABA a obtenu un crédit de 2 000 000 FBu sur 12 mois à 18% annuel. Le décaissement est fait par virement sur son compte d&apos;épargne. Le système génère un échéancier de 12 mensualités de 183 333 FBu (principal) + intérêts dégressifs. Jean signe le contrat et reçoit son échéancier imprimé.</div>

                <h3>6.5 Visite de Terrain</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Crédit → Gestion des Demandes → sélectionner une demande → onglet Visite</span>
                    <p>L&apos;agent de crédit se rend chez le client pour vérifier les informations déclarées :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Se rendre sur le lieu d&apos;habitation ou d&apos;activité du client</li>
                        <li><strong>Étape 2 :</strong> Prendre des <strong>photos</strong> du lieu (habitation, commerce, terrain, garantie proposée)</li>
                        <li><strong>Étape 3 :</strong> Capturer les <strong>coordonnées GPS</strong> (le système peut utiliser la géolocalisation du téléphone)</li>
                        <li><strong>Étape 4 :</strong> Rédiger les <strong>observations</strong> : décrivez ce que vous avez vu, la situation réelle du client</li>
                        <li><strong>Étape 5 :</strong> Indiquer le <strong>lieu de visite</strong> (domicile, commerce, terrain agricole...)</li>
                        <li><strong>Étape 6 :</strong> Écrire votre <strong>recommandation</strong> : favorable, défavorable, ou avec réserves, avec justification</li>
                        <li><strong>Étape 7 :</strong> Cliquer sur <span className="tag t-green">Enregistrer</span> le rapport de visite</li>
                    </ol>
                </div>

                <h3>6.6 Comité de Crédit</h3>
                <div className="step-box">
                    <strong>Le comité de crédit se réunit pour examiner les dossiers et prendre des décisions :</strong>
                    <ol>
                        <li><strong>Étape 1 :</strong> Le secrétaire du comité crée une <strong>session de comité</strong> avec la date et les participants</li>
                        <li><strong>Étape 2 :</strong> Les demandes éligibles sont ajoutées à l&apos;ordre du jour de la session</li>
                        <li><strong>Étape 3 :</strong> Pour chaque demande, le comité examine :
                            <ul>
                                <li>Les informations du client et son historique</li>
                                <li>L&apos;analyse financière (revenus, dépenses, capacité, ratio DTI)</li>
                                <li>Le rapport de visite de terrain avec photos</li>
                                <li>Les garanties proposées et leur valeur</li>
                            </ul>
                        </li>
                        <li><strong>Étape 4 :</strong> Le comité prend une <strong>décision</strong> :
                            <ul>
                                <li><span className="tag t-green">Approuvée</span> — Le crédit est accordé tel que demandé</li>
                                <li><span className="tag t-orange">Approuvée avec conditions</span> — Accordé avec montant ou durée modifié</li>
                                <li><span className="tag t-red">Rejetée</span> — Refusé avec motif détaillé</li>
                                <li><span className="tag t-blue">Reportée</span> — Informations complémentaires nécessaires</li>
                            </ul>
                        </li>
                        <li><strong>Étape 5 :</strong> Le secrétaire enregistre la décision et les observations</li>
                        <li><strong>Étape 6 :</strong> La session est clôturée</li>
                    </ol>
                </div>

                <h3>6.7 Récapitulatif complet du cycle de crédit</h3>
                <div className="info"><strong>ℹ️ Résumé du processus complet :</strong><br/><br/>
                    <strong>1.</strong> Agent de crédit crée la <strong>demande</strong> avec les infos client et produit<br/>
                    <strong>2.</strong> Agent collecte les <strong>documents</strong> justificatifs du client<br/>
                    <strong>3.</strong> Analyste saisit les <strong>revenus + dépenses</strong> et le système calcule la capacité<br/>
                    <strong>4.</strong> Agent effectue la <strong>visite de terrain</strong> avec photos et GPS<br/>
                    <strong>5.</strong> Le <strong>comité de crédit</strong> examine le dossier et prend une décision<br/>
                    <strong>6.</strong> Si approuvé, le comptable/caissier effectue le <strong>décaissement</strong><br/>
                    <strong>7.</strong> Le système génère l&apos;<strong>échéancier de remboursement</strong> automatiquement<br/>
                    <strong>8.</strong> Le client commence à <strong>rembourser</strong> selon l&apos;échéancier
                </div>

                {/* ===== SECTION 9 : REMBOURSEMENT ===== */}
                <h2 id="sec9">7. Module Remboursement</h2>
                <p>
                    Une fois un crédit décaissé, le client doit le rembourser selon l&apos;échéancier établi.
                    Ce module permet de <strong>suivre les paiements</strong>, <strong>détecter les retards</strong>,
                    <strong>gérer le recouvrement</strong> et, si nécessaire, <strong>restructurer</strong> un prêt en difficulté.
                </p>

                <h3>7.1 Consultation de l&apos;échéancier</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Remboursement → Gestion des Échéanciers</span>
                    <p>L&apos;échéancier montre pour chaque mois :</p>
                    <ul>
                        <li>La <strong>date d&apos;échéance</strong></li>
                        <li>Le <strong>montant du principal</strong> à rembourser</li>
                        <li>Le <strong>montant des intérêts</strong></li>
                        <li>Le <strong>total à payer</strong> pour cette échéance</li>
                        <li>Le <strong>solde restant dû</strong> après paiement</li>
                        <li>Le <strong>statut</strong> : Payé, En cours, En retard</li>
                    </ul>
                </div>

                <h3>7.2 Enregistrer un paiement</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Remboursement → Saisie des Paiements</span>
                    <ol>
                        <li><strong>Sélectionner le prêt</strong> du client (par numéro de prêt ou nom du client)</li>
                        <li>L&apos;échéancier s&apos;affiche avec les montants dus</li>
                        <li><strong>Saisir le montant payé</strong> par le client</li>
                        <li>Le système répartit automatiquement le paiement : <strong>pénalités</strong> d&apos;abord, puis <strong>intérêts</strong>, puis <strong>principal</strong></li>
                        <li><span className="tag t-green">Valider</span> le paiement</li>
                    </ol>
                </div>

                <h3>7.3 Gestion des retards et recouvrement</h3>
                <p>Le système détecte automatiquement les retards de paiement et classe les prêts :</p>
                <table>
                    <thead><tr><th>Classification</th><th>Jours de retard</th><th>Actions</th></tr></thead>
                    <tbody>
                        <tr><td>Normal</td><td>0 jour</td><td>Aucune action</td></tr>
                        <tr><td>Sous surveillance</td><td>1-30 jours</td><td>Appel téléphonique, SMS de rappel</td></tr>
                        <tr><td>Substandard</td><td>31-90 jours</td><td>Lettre de relance, visite</td></tr>
                        <tr><td>Douteux</td><td>91-180 jours</td><td>Mise en demeure</td></tr>
                        <tr><td>Contentieux</td><td>+180 jours</td><td>Action juridique</td></tr>
                    </tbody>
                </table>

                <h3>7.4 Remboursement Anticipé</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Remboursement → Remboursement Anticipé</span>
                    <p>Quand un client souhaite rembourser tout ou partie de son prêt avant la fin de l&apos;échéancier :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Sélectionnez le prêt du client</li>
                        <li><strong>Étape 2 :</strong> Le système affiche le <strong>solde restant dû</strong> (capital + intérêts restants)</li>
                        <li><strong>Étape 3 :</strong> Choisissez le type : <strong>total</strong> (rembourser tout) ou <strong>partiel</strong> (rembourser une partie)</li>
                        <li><strong>Étape 4 :</strong> Saisissez le montant que le client souhaite rembourser</li>
                        <li><strong>Étape 5 :</strong> Le système recalcule automatiquement l&apos;échéancier restant</li>
                        <li><strong>Étape 6 :</strong> Soumettez la demande pour approbation par le responsable</li>
                        <li><strong>Étape 7 :</strong> Après approbation, le paiement est enregistré et l&apos;échéancier est mis à jour</li>
                    </ol>
                </div>

                <h3>7.5 Prélèvement Automatique</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Remboursement → Prélèvement Automatique</span>
                    <p>Ce mécanisme prélève automatiquement le montant de l&apos;échéance depuis le compte d&apos;épargne du client :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Sélectionnez le prêt concerné</li>
                        <li><strong>Étape 2 :</strong> Vérifiez que le compte d&apos;épargne associé a un <strong>solde suffisant</strong></li>
                        <li><strong>Étape 3 :</strong> Lancez le prélèvement automatique</li>
                        <li><strong>Étape 4 :</strong> Le système débite le compte d&apos;épargne et crédite le prêt</li>
                        <li><strong>Étape 5 :</strong> Un reçu est généré automatiquement</li>
                    </ol>
                </div>
                <div className="note"><strong>💡</strong> Le prélèvement automatique est très pratique pour les clients qui ont un solde d&apos;épargne régulier. Il évite les retards de paiement et les pénalités.</div>

                <h3>7.6 Calcul Automatique des Pénalités</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Remboursement → Calcul Auto. Pénalités</span>
                    <p>Le système peut calculer et appliquer automatiquement les pénalités de retard :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Lancez le calcul des pénalités pour une date donnée</li>
                        <li><strong>Étape 2 :</strong> Le système identifie tous les prêts avec des échéances en retard</li>
                        <li><strong>Étape 3 :</strong> Pour chaque prêt en retard, il calcule la pénalité selon le taux configuré dans le produit de crédit</li>
                        <li><strong>Étape 4 :</strong> Les pénalités sont ajoutées au solde dû du client</li>
                        <li><strong>Étape 5 :</strong> Un rapport récapitulatif est généré</li>
                    </ol>
                </div>

                <h3>7.7 Recouvrement des Impayés</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Remboursement → Recouvrement → Dossiers de Recouvrement</span>
                    <p>Quand un client ne paie plus, un dossier de recouvrement est ouvert :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Le système détecte automatiquement les prêts en retard et crée des alertes</li>
                        <li><strong>Étape 2 :</strong> L&apos;agent de recouvrement ouvre un <strong>dossier de recouvrement</strong></li>
                        <li><strong>Étape 3 :</strong> Il effectue les actions de relance selon les étapes configurées :
                            <ul>
                                <li><strong>Étape 1 — Rappel :</strong> Appel téléphonique, SMS de rappel au client</li>
                                <li><strong>Étape 2 — Relance :</strong> Lettre de relance envoyée au client</li>
                                <li><strong>Étape 3 — Mise en demeure :</strong> Courrier officiel avec délai de paiement</li>
                                <li><strong>Étape 4 — Visite :</strong> Visite au domicile ou lieu d&apos;activité du client</li>
                                <li><strong>Étape 5 — Contentieux :</strong> Transfert du dossier au service juridique</li>
                            </ul>
                        </li>
                        <li><strong>Étape 4 :</strong> Chaque action est enregistrée dans le dossier avec la date et le résultat</li>
                        <li><strong>Étape 5 :</strong> Le dossier est clôturé quand le client a payé ou quand le contentieux est résolu</li>
                    </ol>
                </div>

                <h3>7.8 Restructuration d&apos;un Prêt</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Remboursement → Restructuration → Demandes de Restructuration</span>
                    <p>Quand un client est en difficulté mais de bonne foi, on peut réaménager les conditions de son prêt :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Créez une <strong>demande de restructuration</strong> pour le prêt concerné</li>
                        <li><strong>Étape 2 :</strong> Définissez les nouvelles conditions :
                            <ul>
                                <li>Allonger la <strong>durée</strong> (ex: passer de 12 à 18 mois)</li>
                                <li>Réduire le montant des <strong>échéances mensuelles</strong></li>
                                <li>Accorder une <strong>période de grâce</strong> (pause de remboursement temporaire)</li>
                                <li>Ajuster le <strong>taux d&apos;intérêt</strong></li>
                            </ul>
                        </li>
                        <li><strong>Étape 3 :</strong> Soumettez la demande pour <strong>approbation</strong> par le responsable</li>
                        <li><strong>Étape 4 :</strong> Après approbation, le système génère un <strong>nouvel échéancier</strong></li>
                        <li><strong>Étape 5 :</strong> Le client signe le nouvel avenant au contrat</li>
                    </ol>
                </div>
                <div className="warning"><strong>⚠</strong> La restructuration est une mesure exceptionnelle. Elle doit être justifiée et approuvée par la hiérarchie. L&apos;ancien échéancier est archivé et remplacé par le nouveau.</div>

                {/* ===== SECTION 10 : COMPTABILITÉ ===== */}
                <h2 id="sec10">8. Module Comptabilité</h2>
                <p>
                    Le module comptabilité gère l&apos;ensemble des opérations comptables : plan de comptes, saisie des écritures,
                    journaux, clôtures et production des états financiers. Il suit les normes <strong>SYSCOHADA</strong>.
                </p>

                <h3>8.1 Configuration initiale</h3>
                <p>Avant de commencer la saisie, configurez dans l&apos;ordre :</p>
                <ol>
                    <li><strong>Plan comptable</strong> <span className="menu-path">(Comptabilité → Plan comptable SYSCOHADA)</span> : Vérifiez et complétez la liste des comptes</li>
                    <li><strong>Types de journal</strong> <span className="menu-path">(Comptabilité → Types de Journal)</span> : Achat, Vente, Banque, Caisse, OD</li>
                    <li><strong>Journaux</strong> <span className="menu-path">(Comptabilité → Journaux)</span> : Créez au moins un journal par type</li>
                    <li><strong>Exercice</strong> <span className="menu-path">(Comptabilité → Exercice)</span> : Définissez l&apos;exercice comptable en cours (du 01/01 au 31/12)</li>
                    <li><strong>Périodes</strong> <span className="menu-path">(Comptabilité → Périodes Comptables)</span> : Les 12 mois sont automatiquement créés</li>
                </ol>

                <h3>8.2 Comment saisir une écriture comptable ?</h3>
                <div className="step-box">
                    <strong>Processus en 2 étapes :</strong>
                    <p><strong>Étape 1 — Créer un brouillard :</strong></p>
                    <ol>
                        <li>Aller à <span className="menu-path">Comptabilité → Brouillard</span></li>
                        <li>Cliquer sur <span className="tag t-blue">Nouveau</span></li>
                        <li>Sélectionner le <strong>journal</strong> concerné</li>
                        <li>Indiquer la <strong>date</strong> de l&apos;opération</li>
                        <li>Saisir un <strong>libellé</strong> décrivant l&apos;opération</li>
                        <li><span className="tag t-green">Enregistrer</span></li>
                    </ol>
                    <p><strong>Étape 2 — Ajouter les lignes d&apos;écriture :</strong></p>
                    <ol>
                        <li>Ouvrir le brouillard créé</li>
                        <li>Pour chaque ligne, indiquer : <strong>Compte comptable</strong>, <strong>Montant débit</strong> ou <strong>Montant crédit</strong>, <strong>Libellé</strong></li>
                        <li>Vérifier que le <strong>total débit = total crédit</strong> (l&apos;écriture doit être équilibrée)</li>
                        <li>Lorsque l&apos;écriture est correcte, cliquer sur <span className="tag t-green">Valider</span> pour la transformer en écriture définitive</li>
                    </ol>
                </div>
                <div className="warning"><strong>⚠ Important :</strong> Une écriture validée ne peut plus être modifiée. Si vous faites une erreur, vous devez passer une écriture de contrepassation (écriture inverse).</div>

                <h3>8.3 Les clôtures comptables</h3>
                <table>
                    <thead><tr><th>Type de clôture</th><th>Quand ?</th><th>Que fait-elle ?</th><th>Chemin</th></tr></thead>
                    <tbody>
                        <tr><td>Clôture Journalière</td><td>Chaque soir</td><td>Verrouille les écritures du jour — aucune modification possible après</td><td>Comptabilité → Clôture Journalière</td></tr>
                        <tr><td>Clôture Mensuelle</td><td>Fin de mois</td><td>Verrouille toutes les écritures du mois</td><td>Comptabilité → Clôture Mensuelle</td></tr>
                        <tr><td>Clôture Annuelle</td><td>Fin d&apos;exercice</td><td>Clôture l&apos;exercice, calcule le résultat, génère les écritures de report à nouveau</td><td>Comptabilité → Clôture Annuelle</td></tr>
                    </tbody>
                </table>

                <h3>8.4 Comptes Internes</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Comptabilité → Comptes Internes</span>
                    <p>Les comptes internes sont les comptes de l&apos;institution elle-même (pas ceux des clients). Ils servent à gérer les fonds propres, les réserves, etc.</p>
                    <ol>
                        <li><strong>Dépôt interne :</strong> Ajouter des fonds sur un compte interne (ex: apport en capital)</li>
                        <li><strong>Retrait interne :</strong> Retirer des fonds d&apos;un compte interne</li>
                        <li><strong>Transfert interne :</strong> Transférer des fonds entre deux comptes internes</li>
                        <li>Chaque opération nécessite une <strong>validation</strong> par un responsable autorisé</li>
                    </ol>
                </div>

                <h3>8.5 Comment générer un rapport comptable ?</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Comptabilité → Rapports → (choisir le rapport)</span>
                    <p>La procédure est la même pour tous les rapports :</p>
                    <ol>
                        <li><strong>Étape 1 :</strong> Dans le menu Comptabilité → Rapports, cliquez sur le rapport souhaité</li>
                        <li><strong>Étape 2 :</strong> Sélectionnez la <strong>Date Début</strong> en utilisant le calendrier (cliquez sur l&apos;icône calendrier)</li>
                        <li><strong>Étape 3 :</strong> Sélectionnez la <strong>Date Fin</strong></li>
                        <li><strong>Étape 4 :</strong> Selon le rapport, des options supplémentaires peuvent être disponibles :
                            <ul>
                                <li><strong>Balance :</strong> Type (Générale, Auxiliaire, Âgée), Compte début/fin</li>
                                <li><strong>Consultation Compte :</strong> Sélectionner le compte spécifique à consulter</li>
                                <li><strong>Bilan/Compte de Résultat :</strong> Type (Détaillé ou Synthétique)</li>
                            </ul>
                        </li>
                        <li><strong>Étape 5 :</strong> Cliquez sur le bouton vert <span className="tag t-green">Générer</span></li>
                        <li><strong>Étape 6 :</strong> Le rapport se télécharge automatiquement en format <strong>PDF</strong></li>
                        <li><strong>Étape 7 :</strong> Ouvrez le fichier PDF pour consulter, imprimer ou envoyer le rapport</li>
                    </ol>
                </div>
                <table>
                    <thead><tr><th>Rapport</th><th>À quoi sert-il ?</th><th>Qui l&apos;utilise ?</th></tr></thead>
                    <tbody>
                        <tr><td>Consultation Compte</td><td>Voir tous les mouvements d&apos;un compte spécifique sur une période</td><td>Comptable</td></tr>
                        <tr><td>Édition Journal</td><td>Voir toutes les écritures enregistrées dans un journal spécifique</td><td>Comptable</td></tr>
                        <tr><td>Grand Livre</td><td>Récapitulatif de TOUTES les écritures, organisé par compte comptable</td><td>Comptable, Auditeur</td></tr>
                        <tr><td>Balance</td><td>Liste de tous les comptes avec leur solde débiteur ou créditeur</td><td>Comptable, DG</td></tr>
                        <tr><td>Bilan</td><td>Situation patrimoniale : ce que l&apos;institution possède (actif) vs ce qu&apos;elle doit (passif)</td><td>DG, Banque centrale</td></tr>
                        <tr><td>Compte de Résultat</td><td>Résumé des produits (revenus) et charges (dépenses) — montre si l&apos;institution est bénéficiaire ou déficitaire</td><td>DG, Banque centrale</td></tr>
                        <tr><td>Flux de Trésorerie</td><td>Mouvements d&apos;entrée et sortie de liquidités</td><td>DG, Trésorier</td></tr>
                        <tr><td>Variation des Capitaux</td><td>Comment les fonds propres ont évolué sur la période</td><td>DG, Auditeur</td></tr>
                    </tbody>
                </table>

                {/* ===== SECTION 12 : RAPPROCHEMENT ===== */}
                <h2 id="sec12">9. Rapprochement Bancaire</h2>
                <p>
                    Le rapprochement consiste à <strong>comparer les soldes du système avec la réalité</strong> :
                    relevé bancaire, comptage physique de la caisse, portefeuille de crédits, soldes des épargnants.
                    Il permet de détecter les erreurs, les omissions et les fraudes.
                </p>

                <h3>9.1 Types de rapprochement</h3>
                <table>
                    <thead><tr><th>Type</th><th>On compare...</th><th>Chemin</th></tr></thead>
                    <tbody>
                        <tr><td>Rapprochement Bancaire</td><td>Le relevé de la banque avec nos écritures comptables</td><td>Rapprochement → Rapprochement Bancaire</td></tr>
                        <tr><td>Rapprochement Caisse</td><td>Le comptage physique de la caisse avec le solde système</td><td>Rapprochement → Rapprochement Caisse</td></tr>
                        <tr><td>Portefeuille Crédits</td><td>Le total des prêts en cours avec le solde comptable des crédits</td><td>Rapprochement → Portefeuille Crédits</td></tr>
                        <tr><td>Dépôts Épargne</td><td>Le total des soldes épargnants avec le solde comptable de l&apos;épargne</td><td>Rapprochement → Dépôts Épargne</td></tr>
                    </tbody>
                </table>

                <h3>9.2 Comment faire un rapprochement bancaire ?</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Rapprochement → Rapprochement Bancaire</span>
                    <ol>
                        <li><strong>Importer le relevé bancaire</strong> (fichier CSV ou Excel fourni par la banque)</li>
                        <li><strong>Lancer le rapprochement automatique :</strong> Le système compare chaque ligne du relevé avec les écritures comptables (par montant, date, référence)</li>
                        <li><strong>Traiter les écarts :</strong> Pour les lignes non rapprochées automatiquement, effectuez un rapprochement manuel en associant les bonnes écritures</li>
                        <li><strong>Valider :</strong> Une fois toutes les lignes traitées, validez le rapprochement</li>
                    </ol>
                </div>

                {/* ===== SECTION 14 : DÉPENSES ===== */}
                <h2 id="sec14">10. Module Dépenses</h2>
                <p>
                    Ce module permet de gérer les <strong>dépenses de fonctionnement</strong> de l&apos;institution :
                    fournitures de bureau, déplacements, maintenance, loyers, etc.
                    Chaque dépense suit un processus d&apos;approbation avant d&apos;être payée.
                </p>

                <h3>10.1 Comment créer une demande de dépense ?</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Dépenses → Demandes de Dépenses → Nouvelle Demande</span>
                    <ol>
                        <li><strong>Décrire la dépense :</strong> Expliquez clairement ce que vous souhaitez acheter ou payer</li>
                        <li><strong>Catégorie :</strong> Choisissez la catégorie (fournitures, transport, maintenance...)</li>
                        <li><strong>Montant :</strong> Indiquez le montant estimé</li>
                        <li><strong>Priorité :</strong> Indiquez le niveau d&apos;urgence (faible, moyen, élevé, urgent)</li>
                        <li><strong>Fournisseur :</strong> Sélectionnez le fournisseur si applicable</li>
                        <li><strong>Justification :</strong> Expliquez pourquoi cette dépense est nécessaire</li>
                        <li><span className="tag t-green">Enregistrer</span></li>
                    </ol>
                </div>

                <h3>10.2 Processus d&apos;approbation</h3>
                <p>Selon le montant de la dépense, elle doit être approuvée par un ou plusieurs niveaux hiérarchiques :</p>
                <table>
                    <thead><tr><th>Niveau</th><th>Qui approuve ?</th><th>Quand ?</th></tr></thead>
                    <tbody>
                        <tr><td><span className="tag t-blue">Niveau 1</span></td><td>Responsable direct / Chef de service</td><td>Pour toute demande de dépense</td></tr>
                        <tr><td><span className="tag t-orange">Niveau 2</span></td><td>Directeur de département</td><td>Quand le montant dépasse le seuil N1</td></tr>
                        <tr><td><span className="tag t-red">Niveau 3</span></td><td>Direction Générale</td><td>Quand le montant dépasse le seuil N2</td></tr>
                    </tbody>
                </table>
                <div className="note"><strong>💡</strong> Les seuils sont configurables dans <span className="menu-path">Dépenses → Données de Référence → Seuils d&apos;Approbation</span>.</div>

                <h3>10.3 Budgets et Petite Caisse</h3>
                <ul>
                    <li><strong>Budgets :</strong> Définissez des budgets par catégorie et par période. Le système vous alerte quand vous approchez du plafond.</li>
                    <li><strong>Petite Caisse :</strong> Un fonds dédié aux petites dépenses quotidiennes (moins de X FBu). L&apos;utilisateur enregistre chaque sortie et demande un réapprovisionnement quand le fonds est épuisé.</li>
                </ul>

                {/* ===== SECTION 13 : TABLEAUX DE BORD ===== */}
                <h2 id="sec13">11. Tableaux de Bord</h2>
                <p>
                    Les tableaux de bord offrent une <strong>vision instantanée de la performance</strong> de l&apos;institution.
                    Chaque rôle dispose de son propre tableau de bord avec les indicateurs qui le concernent.
                </p>

                <table>
                    <thead><tr><th>Tableau de Bord</th><th>Pour qui ?</th><th>Indicateurs clés (KPIs)</th></tr></thead>
                    <tbody>
                        <tr><td>Direction Générale</td><td>DG, Directeurs</td><td>Portefeuille total, taux de rentabilité, croissance du nombre de clients, PAR (Portefeuille à Risque), ratio d&apos;autosuffisance</td></tr>
                        <tr><td>Chef d&apos;Agence</td><td>Responsable d&apos;agence</td><td>Performance de l&apos;agence vs objectifs, nombre de nouvelles demandes, décaissements du mois, retards de paiement</td></tr>
                        <tr><td>Opérations Crédit</td><td>Agents de crédit</td><td>Demandes en attente, demandes en analyse, décaissements effectués, portefeuille sous gestion, taux de recouvrement</td></tr>
                        <tr><td>Comptabilité</td><td>Comptables</td><td>Soldes des comptes principaux, écritures non validées, clôtures en attente, état des rapprochements</td></tr>
                    </tbody>
                </table>
                <div className="note"><strong>💡</strong> Les données sont en temps réel. Utilisez les filtres de période et cliquez sur <span className="tag t-green">Appliquer</span> pour actualiser.</div>

                {/* ===== SECTION 15 : ADMINISTRATION ===== */}
                <h2 id="sec15">12. Administration et Gestion des Utilisateurs</h2>
                <p>
                    Ce module est réservé aux <strong>administrateurs système</strong>. Il permet de créer les comptes utilisateurs,
                    attribuer les rôles et permissions, et consulter le journal d&apos;audit.
                </p>

                <h3>12.1 Créer un utilisateur</h3>
                <div className="step-box">
                    <strong>Chemin :</strong> <span className="menu-path">Administration → Créer un Utilisateur</span>
                    <ol>
                        <li><strong>Nom complet :</strong> Nom et prénom de l&apos;employé</li>
                        <li><strong>Adresse e-mail :</strong> Sera utilisée comme nom d&apos;utilisateur pour la connexion</li>
                        <li><strong>Mot de passe :</strong> Définir un mot de passe temporaire que l&apos;utilisateur devra changer</li>
                        <li><strong>Agence :</strong> Agence de rattachement de l&apos;employé</li>
                        <li><strong>Rôle :</strong> Définir le rôle principal (Agent de crédit, Caissier, Comptable, etc.)</li>
                        <li><strong>Permissions :</strong> Cocher les permissions spécifiques (VIEW, CREATE, UPDATE, VALIDATE, etc.) pour chaque module</li>
                        <li><span className="tag t-green">Enregistrer</span></li>
                    </ol>
                </div>

                <h3>12.2 Principales permissions par module</h3>
                <table>
                    <thead><tr><th>Module</th><th>Permissions courantes</th><th>Rôle typique</th></tr></thead>
                    <tbody>
                        <tr><td>Clients</td><td>CUSTOMER_GROUP_VIEW, _CREATE, _UPDATE, _VALIDATE</td><td>Agent de terrain</td></tr>
                        <tr><td>Épargne</td><td>EPARGNE_DEPOSIT_CREATE, _WITHDRAWAL_CREATE, GUICHET_CAISSE</td><td>Caissier</td></tr>
                        <tr><td>Crédit</td><td>CREDIT_VIEW, _CREATE, _ANALYZE, _APPLICATION_CHANGE_STATUS</td><td>Agent de crédit</td></tr>
                        <tr><td>Remboursement</td><td>REMBOURSEMENT_VIEW, _PAYMENT_CREATE, _PAYMENT_PROCESS</td><td>Agent de crédit</td></tr>
                        <tr><td>Comptabilité</td><td>ACCOUNTING_VIEW, _ENTRY_CREATE, _ENTRY_VALIDATE, _REPORT_VIEW</td><td>Comptable</td></tr>
                        <tr><td>Dépenses</td><td>DEPENSE_VIEW, _CREATE, _APPROVE_N1, _PAY</td><td>Manager / Comptable</td></tr>
                        <tr><td>Administration</td><td>ADMIN, USER_CREATE, TRACKING_VIEW</td><td>Administrateur IT</td></tr>
                    </tbody>
                </table>
                <div className="warning"><strong>⚠ Principe du moindre privilège :</strong> N&apos;accordez que les permissions strictement nécessaires à chaque utilisateur. Un caissier n&apos;a pas besoin d&apos;accéder à la comptabilité, un comptable n&apos;a pas besoin de créer des demandes de crédit.</div>

                {/* ===== SECTION 11 : AUDIT ===== */}
                <h2 id="sec11">13. Journal d&apos;Audit (Traçabilité)</h2>
                <p>
                    Le journal d&apos;audit est un <strong>enregistrement automatique et inaltérable</strong> de chaque action effectuée dans le système.
                    Il est essentiel pour la sécurité, la conformité réglementaire et la résolution des litiges.
                </p>

                <h3>Que contient le journal d&apos;audit ?</h3>
                <table>
                    <thead><tr><th>Information</th><th>Description</th><th>Exemple</th></tr></thead>
                    <tbody>
                        <tr><td>Utilisateur</td><td>Qui a effectué l&apos;action</td><td>jean.nda@institution.bi</td></tr>
                        <tr><td>Rôle</td><td>Le rôle de l&apos;utilisateur</td><td>AGENT_CREDIT</td></tr>
                        <tr><td>Action</td><td>Type d&apos;opération</td><td>Création, Modification, Suppression, Validation</td></tr>
                        <tr><td>Module</td><td>Module concerné</td><td>Crédit, Épargne, Comptabilité</td></tr>
                        <tr><td>Entité</td><td>L&apos;objet modifié</td><td>Demande de crédit #DEM-2026-0045</td></tr>
                        <tr><td>Anciennes valeurs</td><td>Valeurs avant modification</td><td>Montant: 1 000 000 FBu</td></tr>
                        <tr><td>Nouvelles valeurs</td><td>Valeurs après modification</td><td>Montant: 1 500 000 FBu</td></tr>
                        <tr><td>Date et heure</td><td>Moment exact</td><td>27/03/2026 à 14:35:22</td></tr>
                    </tbody>
                </table>
                <div className="info"><strong>ℹ️ Accès :</strong> <span className="menu-path">Administration → Journal d&apos;Audit</span>. Vous pouvez filtrer par utilisateur, module, date et type d&apos;action.</div>

                {/* ===== SECTION 4 : CONSEILS ===== */}
                <h2 id="sec4">14. Conseils, Bonnes Pratiques et Glossaire</h2>

                <h3>14.1 Bonnes pratiques</h3>
                <ul>
                    <li>✅ <strong>Enregistrez régulièrement :</strong> Ne saisissez pas de longues séries de données sans enregistrer. Sauvegardez fréquemment.</li>
                    <li>✅ <strong>Vérifiez avant de valider :</strong> Une fois validée, une opération ne peut plus être annulée facilement.</li>
                    <li>✅ <strong>Utilisez les filtres :</strong> Les tableaux ont des filtres en haut de chaque colonne. Utilisez-les pour retrouver rapidement les informations.</li>
                    <li>✅ <strong>Imprimez les reçus :</strong> Remettez toujours un bordereau imprimé au client après chaque opération (dépôt, retrait).</li>
                    <li>✅ <strong>Clôturez chaque jour :</strong> Ne quittez pas l&apos;agence sans avoir effectué la clôture journalière.</li>
                    <li>✅ <strong>Gardez vos identifiants secrets :</strong> Ne communiquez jamais votre mot de passe. Chaque action est tracée à votre nom.</li>
                    <li>✅ <strong>Signalez les anomalies :</strong> Si quelque chose ne fonctionne pas normalement, contactez immédiatement l&apos;administrateur.</li>
                </ul>

                <h3>14.2 Glossaire</h3>
                <table>
                    <thead><tr><th>Terme</th><th>Définition</th></tr></thead>
                    <tbody>
                        <tr><td>Client Individuel</td><td>Personne physique inscrite dans le système</td></tr>
                        <tr><td>Client Entreprise</td><td>Personne morale (société, association, coopérative)</td></tr>
                        <tr><td>Groupe Solidaire</td><td>Association de clients qui se portent garants mutuellement pour des crédits</td></tr>
                        <tr><td>RCCM</td><td>Registre du Commerce et du Crédit Mobilier — numéro d&apos;immatriculation d&apos;une entreprise</td></tr>
                        <tr><td>NIF</td><td>Numéro d&apos;Identification Fiscale</td></tr>
                        <tr><td>CNI</td><td>Carte Nationale d&apos;Identité</td></tr>
                        <tr><td>Épargne libre</td><td>Compte d&apos;épargne où le client peut déposer et retirer librement</td></tr>
                        <tr><td>DAT</td><td>Dépôt à Terme — argent bloqué pour une durée définie contre un taux d&apos;intérêt plus élevé</td></tr>
                        <tr><td>DTI</td><td>Debt-to-Income ratio — rapport entre la dette mensuelle et le revenu mensuel. Plus il est bas, mieux c&apos;est.</td></tr>
                        <tr><td>PAR</td><td>Portefeuille à Risque — pourcentage des prêts ayant au moins un jour de retard</td></tr>
                        <tr><td>Brouillard</td><td>Écriture comptable provisoire, non encore validée et donc modifiable</td></tr>
                        <tr><td>Écriture</td><td>Enregistrement comptable définitif (débit + crédit)</td></tr>
                        <tr><td>Exercice</td><td>Période comptable d&apos;un an (généralement du 1er janvier au 31 décembre)</td></tr>
                        <tr><td>Grand Livre</td><td>Document qui récapitule toutes les écritures, organisées par compte comptable</td></tr>
                        <tr><td>Balance</td><td>Tableau listant tous les comptes avec leurs soldes débiteurs et créditeurs</td></tr>
                        <tr><td>Bilan</td><td>État financier montrant ce que l&apos;institution possède (actif) et ce qu&apos;elle doit (passif)</td></tr>
                        <tr><td>Compte de Résultat</td><td>État financier montrant les revenus et les dépenses, et le bénéfice ou la perte</td></tr>
                        <tr><td>Rapprochement</td><td>Processus de comparaison entre deux sources de données pour vérifier leur cohérence</td></tr>
                        <tr><td>SYSCOHADA</td><td>Système Comptable harmonisé utilisé dans les pays de la zone OHADA</td></tr>
                    </tbody>
                </table>

                {/* ===== FOOTER ===== */}
                <div style={{ marginTop: '4rem', borderTop: '4px solid #b8942e', paddingTop: '2rem', textAlign: 'center', color: '#666' }}>
                    <img src="/layout/images/logo/Welcome.PNG" alt="PrFin MIS" style={{ maxWidth: '200px', marginBottom: '1.5rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }} />
                    <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e2a4a', letterSpacing: '1px' }}>PrFin MIS</p>
                    <p style={{ fontSize: '1.1rem', color: '#555' }}>Professional Financial Management Information System</p>
                    <div style={{ width: '80px', height: '3px', background: '#b8942e', margin: '1rem auto' }}></div>
                    <p style={{ fontStyle: 'italic', color: '#b8942e', fontSize: '1.15rem', fontFamily: 'Georgia, serif' }}>Good Finance. Real Impact.</p>
                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', display: 'inline-block' }}>
                        <p style={{ margin: '0.2rem 0', fontSize: '1rem' }}>Version 10.0 — {new Date().getFullYear()}</p>
                        <p style={{ margin: '0.2rem 0', fontSize: '1rem' }}>Pour toute assistance, contactez l&apos;administrateur système.</p>
                    </div>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#aaa' }}>&copy; {new Date().getFullYear()} INFOSTEAM. All rights reserved.</p>
                </div>
            </div>
        </>
    );
}
