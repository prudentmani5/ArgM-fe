'use client';
import React, { forwardRef } from 'react';

const PrintableUserManual = forwardRef<HTMLDivElement>((_, ref) => {
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    const sectionStyle: React.CSSProperties = {
        pageBreakBefore: 'always',
        marginTop: '30px',
    };

    const subSectionStyle: React.CSSProperties = {
        marginTop: '18px',
        marginBottom: '8px',
    };

    const tableStyle: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '11px',
        marginBottom: '12px',
    };

    const thStyle: React.CSSProperties = {
        background: '#1e3a8a',
        color: '#fff',
        padding: '6px 8px',
        textAlign: 'left',
        fontSize: '11px',
    };

    const tdStyle: React.CSSProperties = {
        padding: '5px 8px',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '11px',
    };

    const tagStyle = (color = '#1e3a8a'): React.CSSProperties => ({
        background: color,
        color: '#fff',
        borderRadius: '4px',
        padding: '1px 6px',
        fontSize: '10px',
        fontWeight: 'bold',
        display: 'inline-block',
        margin: '2px',
    });

    const infoBox = (bg = '#eff6ff', border = '#1e3a8a'): React.CSSProperties => ({
        background: bg,
        border: `1px solid ${border}`,
        borderLeft: `4px solid ${border}`,
        borderRadius: '4px',
        padding: '10px 14px',
        marginBottom: '12px',
        fontSize: '11px',
    });

    return (
        <div ref={ref} style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#1a1a1a', padding: '20mm', width: '210mm', margin: '0 auto' }}>

            {/* ── Cover Page ── */}
            <div style={{ textAlign: 'center', paddingTop: '60px', pageBreakAfter: 'always' }}>
                <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style={{ height: '90px', objectFit: 'contain', marginBottom: '20px' }} />
                <h1 style={{ fontSize: '28px', color: '#1e3a8a', margin: '0 0 8px' }}>MANUEL D'UTILISATION</h1>
                <h2 style={{ fontSize: '18px', color: '#475569', fontWeight: 'normal', margin: '0 0 40px' }}>Système AgrM — Plateforme de Microfinance</h2>
                <div style={{ borderTop: '2px solid #1e3a8a', borderBottom: '2px solid #1e3a8a', padding: '16px 0', margin: '0 40px 40px' }}>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>Version 9.0</p>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>Date d'édition : {today}</p>
                </div>
                <div style={{ textAlign: 'left', display: 'inline-block', fontSize: '12px', color: '#475569' }}>
                    <p style={{ margin: '4px 0' }}>Ce manuel couvre les modules suivants :</p>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px', lineHeight: '1.8' }}>
                        <li>Gestion des Clients et Groupes Solidaires</li>
                        <li>Données de Référence</li>
                        <li>Produits Financiers</li>
                        <li>Épargne</li>
                        <li>Crédit et Remboursement</li>
                        <li>Comptabilité</li>
                        <li>Traçabilité (Journal d'Audit)</li>
                        <li>Rapprochement Bancaire</li>
                        <li>GRH (Ressources Humaines)</li>
                        <li>Dépenses</li>
                        <li>Actionnaires</li>
                    </ul>
                </div>
            </div>

            {/* ── Table of Contents ── */}
            <div style={{ pageBreakAfter: 'always' }}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px', marginBottom: '16px' }}>TABLE DES MATIÈRES</h2>
                {[
                    ['1', 'Gestion des Clients'],
                    ['2', 'Gestion des Groupes Solidaires'],
                    ['3', 'Données de Référence'],
                    ['4', 'Conseils et Bonnes Pratiques'],
                    ['5', 'Glossaire'],
                    ['6', 'Module Produits Financiers'],
                    ['7', 'Module Épargne'],
                    ['8', 'Module Crédit'],
                    ['9', 'Module Remboursement'],
                    ['10', 'Module Comptabilité'],
                    ['11', 'Journal d\'Audit (Traçabilité)'],
                    ['12', 'Rapprochement Bancaire'],
                    ['13', 'Module GRH (Ressources Humaines)'],
                    ['14', 'Module Dépenses'],
                    ['15', 'Module Actionnaires'],
                ].map(([num, title]) => (
                    <div key={num} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dotted #cbd5e1', fontSize: '12px' }}>
                        <span><strong>{num}.</strong> {title}</span>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>Module {num}</span>
                    </div>
                ))}
            </div>

            {/* ── Section 1 : Clients ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>1. Gestion des Clients</h2>

                <h3 style={subSectionStyle}>1.1 Création d'un Nouveau Client</h3>
                <ol style={{ lineHeight: '1.7', fontSize: '11px' }}>
                    <li>Accéder au menu <strong>Clients</strong> puis cliquer sur <strong>Nouveau Client</strong></li>
                    <li>Sélectionner le type : <strong>Individuel</strong> (personne physique) ou <strong>Entreprise</strong> (personne morale)</li>
                    <li>Remplir les champs obligatoires : Nom, Téléphone, Agence, Province et Commune</li>
                    <li>Compléter les informations optionnelles selon disponibilité</li>
                    <li>Cliquer sur <strong>Enregistrer</strong></li>
                </ol>

                <h3 style={subSectionStyle}>1.2 Types de Clients</h3>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Informations requises</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={tdStyle}><strong>Individuel</strong></td>
                            <td style={tdStyle}>Nom, Prénom, Date/lieu de naissance, Genre, Nationalité, Document d'identité, État civil, Profession</td>
                        </tr>
                        <tr style={{ background: '#f8fafc' }}>
                            <td style={tdStyle}><strong>Entreprise</strong></td>
                            <td style={tdStyle}>Nom entreprise, N° RCCM, Type entreprise, Date création, Secteur d'activité, Représentant légal</td>
                        </tr>
                    </tbody>
                </table>

                <h3 style={subSectionStyle}>1.3 Statuts des Clients</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {[['Prospect', '#3b82f6'], ['En attente', '#f59e0b'], ['Actif', '#22c55e'], ['Inactif', '#94a3b8'], ['Liste noire', '#ef4444']].map(([label, color]) => (
                        <span key={label} style={tagStyle(color)}>{label}</span>
                    ))}
                </div>
            </div>

            {/* ── Section 2 : Groupes Solidaires ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>2. Gestion des Groupes Solidaires</h2>

                <h3 style={subSectionStyle}>2.1 Création d'un Groupe</h3>
                <ol style={{ lineHeight: '1.7', fontSize: '11px' }}>
                    <li>Accéder à <strong>Groupes Solidaires</strong> → <strong>Nouveau Groupe</strong></li>
                    <li>Remplir : Nom, Type, Date de formation, Agence, Localisation</li>
                    <li>Configurer le calendrier des réunions (fréquence, jour, heure, lieu)</li>
                    <li>Définir les paramètres financiers (frais d'adhésion, objectif épargne, garantie)</li>
                    <li>Cliquer sur <strong>Enregistrer</strong></li>
                </ol>

                <h3 style={subSectionStyle}>2.2 Cycle de Vie d'un Groupe</h3>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={tagStyle('#3b82f6')}>En Formation</span>
                    <span>→</span>
                    <span style={tagStyle('#f59e0b')}>En Attente</span>
                    <span>→</span>
                    <span style={tagStyle('#22c55e')}>Actif</span>
                    <span>→</span>
                    <span style={tagStyle('#ef4444')}>Suspendu/Dissous</span>
                </div>

                <h3 style={subSectionStyle}>2.3 Rôles des Membres</h3>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Rôle</th>
                            <th style={thStyle}>Responsabilité</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Président', 'Dirige les réunions et représente le groupe'],
                            ['Secrétaire', 'Tient les procès-verbaux et documents'],
                            ['Trésorier', 'Gère les fonds et cotisations'],
                            ['Membre', 'Participant standard'],
                        ].map(([role, resp], i) => (
                            <tr key={role} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={tdStyle}><strong>{role}</strong></td>
                                <td style={tdStyle}>{resp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Section 3 : Données de Référence ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>3. Données de Référence</h2>
                <p style={{ fontSize: '11px', marginBottom: '10px' }}>Les données de référence configurent les listes déroulantes utilisées dans tout le système.</p>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Catégorie</th>
                            <th style={thStyle}>Éléments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Localisation', 'Provinces, Communes, Zones, Collines'],
                            ['Identification', 'Nationalités, Types de documents, États civils, Niveaux d\'études'],
                            ['Classification', 'Secteurs d\'activité, Catégories client, Types d\'habitation, Types de garanties'],
                            ['Groupes', 'Types de groupes, Rôles de groupe, Types de relations'],
                            ['Organisation', 'Agences, Types documents KYC'],
                        ].map(([cat, items], i) => (
                            <tr key={cat} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={tdStyle}><strong>{cat}</strong></td>
                                <td style={tdStyle}>{items}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={infoBox()}>
                    <strong>Règle importante :</strong> Le code doit être unique. Désactiver plutôt que supprimer pour conserver l'historique. Seules les valeurs actives apparaissent dans les listes déroulantes.
                </div>
            </div>

            {/* ── Section 4 : Conseils ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>4. Conseils et Bonnes Pratiques</h2>
                <h3 style={subSectionStyle}>Saisie des Données</h3>
                <ul style={{ lineHeight: '1.7', fontSize: '11px' }}>
                    <li>Vérifier les informations avant enregistrement</li>
                    <li>Utiliser les champs de recherche pour éviter les doublons</li>
                    <li>Remplir tous les champs obligatoires</li>
                    <li>Utiliser des numéros de téléphone valides</li>
                </ul>
                <h3 style={subSectionStyle}>Sécurité</h3>
                <ul style={{ lineHeight: '1.7', fontSize: '11px' }}>
                    <li>Ne jamais partager vos identifiants de connexion</li>
                    <li>Se déconnecter après chaque session de travail</li>
                    <li>Signaler toute activité suspecte à l'administrateur</li>
                </ul>
            </div>

            {/* ── Section 5 : Glossaire ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>5. Glossaire</h2>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Terme</th>
                            <th style={thStyle}>Définition</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Client', 'Personne physique ou morale utilisatrice des services de l\'institution'],
                            ['Groupe Solidaire', 'Association de clients pour le crédit mutuel et la garantie solidaire'],
                            ['KYC', 'Know Your Customer — procédure de connaissance et vérification du client'],
                            ['RCCM', 'Registre du Commerce et du Crédit Mobilier'],
                            ['DTI', 'Ratio Dette/Revenu — pourcentage du revenu consacré aux remboursements de dettes'],
                            ['Méthode des 5C', 'Évaluation du crédit : Caractère, Capacité, Capital, Garantie (Collateral), Conditions'],
                            ['Intérêt Dégressif', 'Intérêt calculé sur le capital restant dû (diminue chaque mois)'],
                            ['Période de Grâce', 'Délai avant le début des remboursements accordé à l\'emprunteur'],
                            ['Plan Comptable IMF', 'Référentiel comptable spécifique aux institutions de microfinance'],
                            ['BRB', 'Banque de la République du Burundi — autorité de régulation financière'],
                            ['IRCM', 'Impôt sur les Revenus des Capitaux Mobiliers (retenue sur dividendes)'],
                            ['INSS', 'Institut National de Sécurité Sociale — cotisations sociales obligatoires'],
                            ['IRE/BHP', 'Impôt sur le Revenu des Employés / Bénéfices et Honoraires Professionnels'],
                        ].map(([term, def], i) => (
                            <tr key={term} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{term}</td>
                                <td style={tdStyle}>{def}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Section 6 : Produits Financiers ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>6. Module Produits Financiers</h2>
                <p style={{ fontSize: '11px', marginBottom: '10px' }}>Configuration des produits de crédit : paramètres, frais, garanties et flux d'approbation.</p>

                <h3 style={subSectionStyle}>6.1 Configuration d'un Produit (4 onglets)</h3>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Onglet</th>
                            <th style={thStyle}>Champs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['1. Informations Générales', 'Code produit, Type, Nom (FR/EN), Devise, Clientèle cible, Statut'],
                            ['2. Montants & Durées', 'Montant Min/Max/Défaut, Durée Min/Max/Défaut (en mois)'],
                            ['3. Intérêts & Paiements', 'Méthode de calcul, Taux Min/Max/Défaut, Fréquence de paiement, Période de grâce'],
                            ['4. Options & Exigences', 'Remboursement anticipé, Taux pénalité, Garants requis, Garanties matérielles'],
                        ].map(([ong, champs], i) => (
                            <tr key={ong} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{ong}</td>
                                <td style={tdStyle}>{champs}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 style={subSectionStyle}>6.2 Statuts des Produits</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[['Brouillon', '#94a3b8'], ['Actif', '#22c55e'], ['Suspendu', '#f59e0b'], ['Abandonné', '#ef4444']].map(([s, c]) => (
                        <span key={s} style={tagStyle(c)}>{s}</span>
                    ))}
                </div>
            </div>

            {/* ── Section 7 : Épargne ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>7. Module Épargne</h2>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Sous-module</th>
                            <th style={thStyle}>Fonction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Compte Épargne', 'Ouverture et gestion des comptes épargne et dépôts à terme'],
                            ['Bordereaux de Dépôt', 'Enregistrement des versements sur compte épargne'],
                            ['Demandes de Retrait', 'Traitement des retraits avec validation'],
                            ['Carnet de Chèque', 'Commande et remise de carnets de chèques'],
                            ['Demande de Situation', 'Génération d\'un relevé de compte à une date donnée'],
                            ['Demande d\'Historique', 'Consultation de l\'historique des opérations'],
                            ['Attestation d\'Engagement', 'Certification d\'engagement d\'épargne'],
                            ['Attestation de Non-Redevabilité', 'Attestation de solde nul ou de clôture de compte'],
                        ].map(([sub, fn], i) => (
                            <tr key={sub} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{sub}</td>
                                <td style={tdStyle}>{fn}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Section 8 : Crédit ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>8. Module Crédit</h2>
                <h3 style={subSectionStyle}>8.1 Workflow d'une Demande de Crédit</h3>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {[
                        ['Dépôt', '#3b82f6'], ['Documents', '#8b5cf6'], ['Analyse', '#f59e0b'],
                        ['Visite Terrain', '#f97316'], ['Comité', '#ef4444'], ['Décaissement', '#22c55e']
                    ].map(([step, color]) => (
                        <React.Fragment key={step as string}>
                            <span style={tagStyle(color as string)}>{step as string}</span>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>→</span>
                        </React.Fragment>
                    ))}
                </div>
                <h3 style={subSectionStyle}>8.2 Étapes de Traitement</h3>
                <ol style={{ lineHeight: '1.8', fontSize: '11px' }}>
                    <li><strong>Création :</strong> Saisir le client/groupe, le produit, le montant et l'objectif</li>
                    <li><strong>Documents :</strong> Joindre les pièces justificatives requises par le produit</li>
                    <li><strong>Analyse Financière :</strong> Évaluer les revenus, dépenses, capacité de remboursement (méthode 5C)</li>
                    <li><strong>Visite de Terrain :</strong> Vérification sur site du domicile/entreprise de l'emprunteur</li>
                    <li><strong>Comité de Crédit :</strong> Décision collégiale d'approbation ou de rejet</li>
                    <li><strong>Décaissement :</strong> Virement du montant approuvé vers le compte du bénéficiaire</li>
                </ol>
            </div>

            {/* ── Section 9 : Remboursement ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>9. Module Remboursement</h2>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Sous-module</th>
                            <th style={thStyle}>Fonction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Prêts Actifs', 'Consultation des prêts décaissés et de leur échéancier'],
                            ['Paiements', 'Enregistrement des remboursements mensuel (principal + intérêts)'],
                            ['Remboursement Anticipé', 'Clôture anticipée d\'un prêt avec calcul de pénalités'],
                            ['Modes de Remboursement', 'Configuration : espèces, virement, mobile money'],
                            ['Classifications de Retard', 'Définir les seuils de retard (PAR 30, 60, 90 jours)'],
                            ['Configurations de Pénalités', 'Taux de pénalités de retard par palier'],
                            ['Étapes de Recouvrement', 'Workflow de relance et contentieux'],
                            ['Restructuration', 'Rééchelonnement des prêts en difficulté'],
                        ].map(([sub, fn], i) => (
                            <tr key={sub} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{sub}</td>
                                <td style={tdStyle}>{fn}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Section 10 : Comptabilité ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>10. Module Comptabilité</h2>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Sous-module</th>
                            <th style={thStyle}>Fonction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Plan Comptable', 'Gestion du plan comptable IMF (classes 1 à 7)'],
                            ['Exercices Comptables', 'Création et activation des exercices fiscaux annuels'],
                            ['Comptes Internes', 'Comptes de liaison entre modules opérationnels et comptabilité'],
                            ['Saisie Manuelle', 'Journaux de saisie avec brouillard et validation'],
                            ['Balance', 'Balance des comptes avec soldes débiteurs/créditeurs'],
                            ['Grand Livre', 'Détail des mouvements par compte'],
                            ['Journal des Écritures', 'Écritures générées automatiquement par les opérations'],
                            ['Clôture Journalière', 'Génération des écritures comptables des opérations vérifiées'],
                            ['Caisse', 'Mouvements de la caisse principale et caisses guichetiers'],
                        ].map(([sub, fn], i) => (
                            <tr key={sub} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{sub}</td>
                                <td style={tdStyle}>{fn}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 style={subSectionStyle}>10.1 Routine Quotidienne Recommandée</h3>
                <ol style={{ lineHeight: '1.8', fontSize: '11px' }}>
                    <li>Vérifier les opérations du jour dans Épargne, Crédit et Remboursement</li>
                    <li>Exécuter la clôture journalière comptable</li>
                    <li>Consulter la balance pour vérifier l'équilibre</li>
                    <li>Lancer le contrôle comptable en cas de doute</li>
                </ol>
            </div>

            {/* ── Section 11 : Journal d'Audit ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>11. Journal d'Audit (Traçabilité)</h2>
                <p style={{ fontSize: '11px', marginBottom: '10px' }}>Enregistrement automatique de toutes les actions effectuées dans le système pour assurer la conformité réglementaire.</p>

                <h3 style={subSectionStyle}>11.1 Types d'Actions Enregistrées</h3>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Catégorie</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Données', 'Création, Lecture, Modification, Suppression'],
                            ['Authentification', 'Connexion, Déconnexion, Échec de connexion, Changement de mot de passe'],
                            ['Actions Métier', 'Validation, Approbation, Rejet, Export de données'],
                        ].map(([cat, actions], i) => (
                            <tr key={cat} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{cat}</td>
                                <td style={tdStyle}>{actions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 style={subSectionStyle}>11.2 Filtres de Recherche</h3>
                <ul style={{ lineHeight: '1.7', fontSize: '11px', columns: 2 }}>
                    <li>Période (date début / date fin)</li>
                    <li>Utilisateur</li>
                    <li>Table / Entité</li>
                    <li>Type d'action</li>
                    <li>Module</li>
                    <li>Statut (Succès / Échec)</li>
                </ul>

                <div style={{ ...infoBox('#fff7ed', '#f97316'), marginTop: '10px' }}>
                    <strong>Conservation :</strong> Les données d'audit doivent être conservées au minimum 5 ans selon les exigences réglementaires. Exporter périodiquement en CSV pour archivage sécurisé.
                </div>
            </div>

            {/* ── Section 12 : Rapprochement Bancaire ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>12. Rapprochement Bancaire</h2>
                <p style={{ fontSize: '11px', marginBottom: '10px' }}>Comparaison des opérations comptables avec les relevés bancaires pour détecter les écarts et assurer la fiabilité des soldes.</p>

                <h3 style={subSectionStyle}>12.1 Processus en 5 Étapes</h3>
                <ol style={{ lineHeight: '1.8', fontSize: '11px' }}>
                    <li><strong>Importation du Relevé Bancaire :</strong> Saisir les lignes du relevé (date, référence, débit/crédit)</li>
                    <li><strong>Création du Rapprochement :</strong> Lier le relevé au compte comptable correspondant</li>
                    <li><strong>Rapprochement Automatique :</strong> Correspondance 100% (montant + référence), 75% (montant + date ±2j), 50% (montant seul)</li>
                    <li><strong>Rapprochement Manuel :</strong> Traiter les lignes non rapprochées, documenter les écarts</li>
                    <li><strong>Validation et Approbation :</strong> Signature comptable puis approbation Direction</li>
                </ol>

                <h3 style={subSectionStyle}>12.2 Statuts</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[['BROUILLON', '#94a3b8'], ['EN COURS', '#f59e0b'], ['TERMINÉ', '#3b82f6'], ['VALIDÉ', '#22c55e']].map(([s, c]) => (
                        <span key={s} style={tagStyle(c)}>{s}</span>
                    ))}
                </div>
            </div>

            {/* ── Section 13 : GRH ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>13. Module GRH (Gestion des Ressources Humaines)</h2>

                <h3 style={subSectionStyle}>13.1 Fiche Employé — Sous-modules</h3>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Sous-module</th>
                            <th style={thStyle}>Informations gérées</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Identification', 'Matricule, Nom/Prénom, Photo, Genre, Date naissance, Département, Fonction, Agence, Coordonnées bancaires'],
                            ['Diplômes', 'Type de diplôme, Établissement, Pays d\'obtention, Année'],
                            ['Absences', 'Type (congé annuel, maladie, maternité...), Période, Motif, Statut'],
                            ['Actions Disciplinaires', 'Type de sanction, Date, Motif, Durée'],
                            ['Ayants Droit', 'Lien de parenté, Identité, Date de naissance (pour avantages sociaux)'],
                            ['Formations/Stages', 'Intitulé, Domaine, Période, Organisme, Résultat'],
                            ['Cotation', 'Note d\'évaluation, Calcul du nouvel échelon salarial, Application de la progression'],
                            ['Éditions', 'État Inspection du Travail, Liste par Service'],
                        ].map(([sub, info], i) => (
                            <tr key={sub} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{sub}</td>
                                <td style={tdStyle}>{info}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 style={subSectionStyle}>13.2 Module Paie</h3>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Édition</th>
                            <th style={thStyle}>Contenu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Listing INSS', 'État mensuel des cotisations sociales (part employé + employeur)'],
                            ['Listing INSS Trimestriel', 'Récapitulatif trimestriel des cotisations'],
                            ['Listing IRE', 'Impôt sur le Revenu des Employés (mensuel)'],
                            ['Listing IRE Récapitulatif', 'Résumé annuel des retenues IRE'],
                            ['Journal de Paie', 'Écritures comptables générées par la paie du mois'],
                            ['Virement Bancaire', 'Ordres de virement groupés par banque pour paiement des salaires'],
                            ['Synthèse Consolidée', 'Vue globale de la masse salariale par département'],
                            ['Listing Retenue BHB', 'État des retenues spécifiques Bénéfices et Honoraires'],
                            ['Listing Jubilé', 'Liste des employés retraités ou en fin de carrière'],
                        ].map(([ed, desc], i) => (
                            <tr key={ed} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{ed}</td>
                                <td style={tdStyle}>{desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 style={subSectionStyle}>13.3 Processus Mensuel de Paie</h3>
                <ol style={{ lineHeight: '1.8', fontSize: '11px' }}>
                    <li>Vérifier les présences biométriques et valider les heures supplémentaires</li>
                    <li>Accéder à <strong>Paie → Saisie</strong>, sélectionner la période (mois/année)</li>
                    <li>Saisir les éléments variables (primes, retenues exceptionnelles)</li>
                    <li>Lancer le calcul automatique (INSS, IRE, net à payer)</li>
                    <li>Générer les bulletins de salaire et les états réglementaires</li>
                    <li>Exécuter les ordres de virement bancaire</li>
                </ol>
            </div>

            {/* ── Section 14 : Dépenses ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>14. Module Dépenses</h2>
                <p style={{ fontSize: '11px', marginBottom: '10px' }}>Circuit complet des charges de l'institution avec workflow d'approbation multi-niveaux.</p>

                <h3 style={subSectionStyle}>14.1 Circuit d'une Demande de Dépense</h3>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {[
                        ['EN ATTENTE', '#94a3b8'], ['SOUMISE', '#3b82f6'], ['VALIDÉE N1', '#f59e0b'],
                        ['VALIDÉE N2', '#f97316'], ['APPROUVÉE', '#22c55e'],
                    ].map(([step, color]) => (
                        <React.Fragment key={step as string}>
                            <span style={tagStyle(color as string)}>{step as string}</span>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>→</span>
                        </React.Fragment>
                    ))}
                    <span style={tagStyle('#ef4444')}>REJETÉE</span>
                    <span style={{ fontSize: '10px', color: '#475569', marginLeft: '4px' }}>(à tout moment)</span>
                </div>

                <h3 style={subSectionStyle}>14.2 Sous-modules</h3>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Sous-module</th>
                            <th style={thStyle}>Fonction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Demandes', 'Création avec catégorie, priorité, fournisseur, montant estimé'],
                            ['Approbations', 'Circuit N1 (responsable direct) → N2 (chef département) → DG'],
                            ['Paiements', 'Enregistrement du paiement ; génération Bon de Caisse / Preuve de Paiement'],
                            ['Petite Caisse', 'Menues dépenses : ouverture, mouvements, réapprovisionnement, clôture'],
                            ['Budgets', 'Allocation par catégorie et exercice ; alerte dépassement budgétaire'],
                            ['Rapports', 'KPIs (total, en attente, rejetées) + graphiques par catégorie et budget vs réalisé'],
                        ].map(([sub, fn], i) => (
                            <tr key={sub} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{sub}</td>
                                <td style={tdStyle}>{fn}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={infoBox('#fff7ed', '#f97316')}>
                    <strong>Règle d'or :</strong> Toujours soumettre une demande <em>avant</em> d'engager la dépense. Joindre systématiquement les factures ou devis comme pièces justificatives.
                </div>
            </div>

            {/* ── Section 15 : Actionnaires ── */}
            <div style={sectionStyle}>
                <h2 style={{ color: '#1e3a8a', borderBottom: '2px solid #1e3a8a', paddingBottom: '6px' }}>15. Module Actionnaires</h2>
                <p style={{ fontSize: '11px', marginBottom: '10px' }}>Gestion complète du capital social : actionnaires, parts, dividendes, assemblées et conformité BRB.</p>

                <h3 style={subSectionStyle}>15.1 Sous-modules</h3>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Sous-module</th>
                            <th style={thStyle}>Fonction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Tableau de Bord', 'Capital autorisé/souscrit/libéré, ratios BRB, conformité KYC en temps réel'],
                            ['Registre', 'Liste officielle des actionnaires avec type (fondateur/ordinaire/institutionnel/employé/état)'],
                            ['Souscriptions', 'Achat de parts : quantité, valeur unitaire, mode de libération et de paiement'],
                            ['Transferts / Rachats', 'Cession entre actionnaires ou rachat par l\'institution avec workflow d\'approbation'],
                            ['Dividendes', 'Déclaration, distribution proratisée, retenue IRCM (15% par défaut), paiement'],
                            ['Assemblées Générales', 'AGO / AGE / AGM : convocation, quorum, résolutions, PV officiel'],
                            ['Comptabilisation', 'Schémas comptables automatiques pour toutes les opérations sur capital'],
                            ['Rapports', 'Registre officiel, état dividendes, évolution capital, certificats d\'actionnariat, ratio BRB'],
                            ['Paramètres', 'Valeur nominale, capital autorisé, taux IRCM, mode de vote, délai préavis rachat'],
                        ].map(([sub, fn], i) => (
                            <tr key={sub} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{sub}</td>
                                <td style={tdStyle}>{fn}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 style={subSectionStyle}>15.2 Types d'Assemblées Générales</h3>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Objet</th>
                            <th style={thStyle}>Fréquence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['AGO', 'Approbation des comptes, dividendes, renouvellement mandats', 'Annuelle obligatoire'],
                            ['AGE', 'Modification des statuts, augmentation de capital', 'Exceptionnelle'],
                            ['AGM', 'Ordre du jour mixte AGO + AGE', 'Selon besoin'],
                        ].map(([type, objet, freq], i) => (
                            <tr key={type} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{type}</td>
                                <td style={tdStyle}>{objet}</td>
                                <td style={tdStyle}>{freq}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ ...infoBox('#fff7ed', '#f97316'), marginTop: '10px' }}>
                    <strong>Conformité BRB :</strong> La retenue IRCM sur dividendes doit être déclarée à l'OBR dans les délais légaux. Le ratio de capital minimum et le ratio de solvabilité sont visibles en permanence sur le tableau de bord.
                </div>
            </div>

            {/* ── Footer ── */}
            <div style={{ marginTop: '40px', borderTop: '2px solid #1e3a8a', paddingTop: '12px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
                <p style={{ margin: '2px 0' }}>Version 9.0 — Système AgrM — Édité le {today}</p>
                <p style={{ margin: '2px 0' }}>Modules : Clients, Groupes Solidaires, Produits Financiers, Épargne, Crédit, Remboursement, Comptabilité, Traçabilité, Rapprochement Bancaire, GRH, Dépenses, Actionnaires</p>
                <p style={{ margin: '4px 0', color: '#94a3b8' }}>Pour toute assistance, contacter l'administrateur système.</p>
            </div>
        </div>
    );
});

PrintableUserManual.displayName = 'PrintableUserManual';
export default PrintableUserManual;
