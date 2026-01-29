import AppSubMenu from './AppSubMenu';
import type { MenuModel } from '../types/types';
import { AppMenuItem } from '../types/layout';
import './menu-overrides.css';
import React from 'react';
import { LayoutContext } from './context/layoutcontext';
import { useCurrentUser } from '../hooks/fetchData/useCurrentUser';
import { hasAnyAuthority, hasAuthority } from '../app/(AgrM-fe)/usermanagement/types';

interface MyMenuItem {
    label?: string;
    icon?: string;
    to?: string;
    separator?: boolean;
}
interface ExtendedMenuModel extends AppMenuItem {
    separator?: boolean;
}


const AppMenu = () => {

    const { user: appUser } = useCurrentUser();
    const { nextButtonConfig } = React.useContext(LayoutContext);


    const model: (AppMenuItem & { separator?: boolean })[] = [

        {
            label: 'MODULE DES CLIENTS ET GROUPES',
            icon: 'pi pi-truck',
            /*visible: appUser ? hasAnyAuthority(appUser, [
                'ENTREE_SETTINGS_CREATE',
                'ENTREE_SETTINGS_VIEW',
                'ENTREE_SETTINGS_UPDATE',
                'ENTREE_VEHICULE_CREATE',
                'ENTREE_VEHICULE_UPDATE',
                'ENTREE_VEHICULE_CONSULTATION',
                'ENTREE_MAGASIN_CREATE',
                'ENTREE_MAGASIN_UPDATE',
                'ENTREE_MAGASIN_CONSULTATION',
                'GPS_MAGASIN_CREATE',
                'GPS_MAGASIN_UPDATE',
                'GPS_MAGASIN_VIEW',
                'GPS_MAGASIN_VALIDATE_1',
                'GPS_MAGASIN_VALIDATE_2',
                'GPS_ENREGISTREMENT_CREATE',
                'GPS_ENREGISTREMENT_UPDATE',
                'GPS_ENREGISTREMENT_VIEW',
                'GPS_ENREGISTREMENT_VALIDATE_1',
                'GPS_ENREGISTREMENT_VALIDATE_2',
                'ACCOSTAGE_CREATE',
                'ACCOSTAGE_UPDATE',
                'ACCOSTAGE_VALIDATE_1',
                'ACCOSTAGE_VALIDATE_2',
                'REMORQUAGE_CREATE',
                'REMORQUAGE_UPDATE',
                'REMORQUAGE_VALIDATE_1',
                'REMORQUAGE_VALIDATE_2'
            ]) : false, */
            items: [
                {
                    label: ' Paramétres',
                    icon: 'pi pi-wallet',
                  /*  visible: appUser ? hasAnyAuthority(appUser, [
                        'ENTREE_SETTINGS_CREATE',
                        'ENTREE_SETTINGS_VIEW',
                        'ENTREE_SETTINGS_UPDATE'
                    ]) : false,*/
                    items: [
                        {
                            label: 'Parametres de base',
                            icon: 'pi pi-truck',
                            to: '/moduleCostumerGroup/reference-data',
                            className: 'menu-item'
                        }
                    ]
                }
                ,

                {
                    label: 'Clients',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Enregistrement du client',
                        icon: 'pi pi-chart-bar',
                        to: '/moduleCostumerGroup/clients',
                       /* visible: appUser ? hasAnyAuthority(appUser, [
                            'ENTREE_VEHICULE_CREATE',
                            'ENTREE_VEHICULE_UPDATE',
                            'ENTREE_VEHICULE_CONSULTATION'
                        ]) : false*/
                    }, {
                        label: 'Enregistrement du groupe',
                        icon: 'pi pi-wallet',
                        to: '/moduleCostumerGroup/solidarity-groups',
                       /* visible: appUser ? hasAnyAuthority(appUser, [
                            'ENTREE_MAGASIN_CREATE',
                            'ENTREE_MAGASIN_UPDATE',
                            'ENTREE_MAGASIN_CONSULTATION'
                        ]) : false*/
                    }]
                },

                {
                    label: 'Rapports',
                    icon: 'pi pi-chart-bar',
                    items: [{
                        label: 'Rapports Clients et Groupes',
                        icon: 'pi pi-file',
                        to: '/moduleCostumerGroup/reports'
                    }]
                },


                {
                    label: 'Gestion des services divers',
                    icon: 'pi pi-wallet',
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'GPS_MAGASIN_CREATE',
                        'GPS_MAGASIN_UPDATE',
                        'GPS_MAGASIN_VIEW',
                        'GPS_MAGASIN_VALIDATE_1',
                        'GPS_MAGASIN_VALIDATE_2',
                        'GPS_ENREGISTREMENT_CREATE',
                        'GPS_ENREGISTREMENT_UPDATE',
                        'GPS_ENREGISTREMENT_VIEW',
                        'GPS_ENREGISTREMENT_VALIDATE_1',
                        'GPS_ENREGISTREMENT_VALIDATE_2',
                        'ACCOSTAGE_CREATE',
                        'ACCOSTAGE_UPDATE',
                        'ACCOSTAGE_VALIDATE_1',
                        'ACCOSTAGE_VALIDATE_2',
                        'REMORQUAGE_CREATE',
                        'REMORQUAGE_UPDATE',
                        'REMORQUAGE_VALIDATE_1',
                        'REMORQUAGE_VALIDATE_2'
                    ]) : false,
                    items: [{
                        label: 'Entrée',
                        icon: 'pi pi-chart-bar',
                        to: '/entryMagasin/factServicePresteEntree'
                    }, {
                        label: 'Enregistrement',
                        icon: 'pi pi-chart-bar',
                        to: '/entryMagasin/factServicePreste'
                    },
                    {
                        label: 'Accostage',
                        icon: 'pi pi-chart-bar',
                        to: '/entryMagasin/accostage'
                    }, {
                        label: 'Remorquage',
                        icon: 'pi pi-chart-bar',
                        to: '/entryMagasin/remorquage'
                    },]
                },



            ]

        },

       /* {
            label: ' PRODUITS FINANCIERS',
            icon: 'pi pi-money-bill',
            items: [
                {
                    label: ' Données de Référence',
                    icon: 'pi pi-database',
                    items: [
                        {
                            label: ' Devises',
                            icon: 'pi pi-dollar',
                            to: '/financialProducts/reference-data/currencies'
                        },
                        {
                            label: 'Product Types',
                            icon: 'pi pi-briefcase',
                            to: '/financialProducts/reference-data/loan-product-types'
                        },
                        {
                            label: 'Interest Calculation Methods',
                            icon: 'pi pi-percentage',
                            to: '/financialProducts/reference-data/interest-calculation-methods'
                        },
                        {
                            label: 'Frequences de Payment ',
                            icon: 'pi pi-calendar',
                            to: '/financialProducts/reference-data/payment-frequencies'
                        },
                        {
                            label: 'Types de Frais',
                            icon: 'pi pi-money-bill',
                            to: '/financialProducts/reference-data/fee-types'
                        },
                        {
                            label: 'Typesde des Guarantes',
                            icon: 'pi pi-shield',
                            to: '/financialProducts/reference-data/loan-guarantee-types'
                        },
                        {
                            label: 'Approval Levels',
                            icon: 'pi pi-check-circle',
                            to: '/financialProducts/reference-data/approval-levels'
                        },
                        {
                            label: 'Loan Statuses',
                            icon: 'pi pi-tags',
                            to: '/financialProducts/reference-data/loan-statuses'
                        },
                        {
                            label: 'Risk Levels',
                            icon: 'pi pi-exclamation-triangle',
                            to: '/financialProducts/reference-data/risk-levels'
                        },
                        {
                            label: 'Credit Score Factors',
                            icon: 'pi pi-star',
                            to: '/financialProducts/reference-data/credit-score-factors'
                        },
                        {
                            label: 'Loan Purposes',
                            icon: 'pi pi-bookmark',
                            to: '/financialProducts/reference-data/loan-purposes'
                        },
                        {
                            label: 'Income/Expense Types',
                            icon: 'pi pi-chart-line',
                            to: '/financialProducts/reference-data/income-types'
                        },
                        {
                            label: 'Application Stages',
                            icon: 'pi pi-sitemap',
                            to: '/financialProducts/reference-data/application-stages'
                        }
                    ]
                },
                {
                    label: 'Loan Products / Produits de Crédit',
                    icon: 'pi pi-briefcase',
                    items: [
                        {
                            label: 'All Products / Tous les Produits',
                            icon: 'pi pi-list',
                            to: '/financialProducts/loan-products'
                        }
                    ]
                },
                {
                    label: 'Loan Applications / Demandes de Crédit',
                    icon: 'pi pi-file-edit',
                    items: [
                        {
                            label: 'New Application / Nouvelle Demande',
                            icon: 'pi pi-plus-circle',
                            to: '/financialProducts/loan-applications'
                        },
                        {
                            label: 'Pending Review / En Révision',
                            icon: 'pi pi-clock',
                            to: '/financialProducts/loan-applications?status=UNDER_REVIEW'
                        },
                        {
                            label: 'Committee Sessions / Sessions du Comité',
                            icon: 'pi pi-users',
                            to: '/financialProducts/loan-applications/committee-sessions'
                        }
                    ]
                },
                {
                    label: 'Active Loans / Prêts Actifs',
                    icon: 'pi pi-wallet',
                    items: [
                        {
                            label: 'All Active Loans / Tous les Prêts',
                            icon: 'pi pi-list',
                            to: '/financialProducts/loans'
                        },
                        {
                            label: 'Disbursements / Décaissements',
                            icon: 'pi pi-money-bill',
                            to: '/financialProducts/loans/disbursements'
                        },
                        {
                            label: 'Payment Schedules / Échéanciers',
                            icon: 'pi pi-calendar',
                            to: '/financialProducts/loans/schedules'
                        },
                        {
                            label: 'Payments / Paiements',
                            icon: 'pi pi-credit-card',
                            to: '/financialProducts/loans/payments'
                        },
                        {
                            label: 'Penalties / Pénalités',
                            icon: 'pi pi-exclamation-circle',
                            to: '/financialProducts/loans/penalties'
                        },
                        {
                            label: 'Guarantees / Garanties',
                            icon: 'pi pi-shield',
                            to: '/financialProducts/loans/guarantees'
                        },
                        {
                            label: 'Guarantors / Garants',
                            icon: 'pi pi-users',
                            to: '/financialProducts/loans/guarantors'
                        },
                        {
                            label: 'Loan Closures / Clôtures',
                            icon: 'pi pi-check-circle',
                            to: '/financialProducts/loans/closures'
                        },
                        {
                            label: 'Restructuring / Restructuration',
                            icon: 'pi pi-refresh',
                            to: '/financialProducts/loans/restructuring'
                        },
                        {
                            label: 'Write-offs / Provisions',
                            icon: 'pi pi-times-circle',
                            to: '/financialProducts/loans/write-offs'
                        }
                    ]
                }
            ]
        },*/

        {
            label: 'MODULE ÉPARGNE',
            icon: 'pi pi-wallet',
            items: [
                {
                    label: 'Données de Référence',
                    icon: 'pi pi-database',
                    items: [
                        {
                            label: 'Types d\'Opérations',
                            icon: 'pi pi-exchange',
                            to: '/epargne/reference-data/types-operation'
                        },
                        {
                            label: 'Statuts de Livret',
                            icon: 'pi pi-tags',
                            to: '/epargne/reference-data/statuts-livret'
                        },
                        {
                            label: 'Durées de Terme',
                            icon: 'pi pi-clock',
                            to: '/epargne/reference-data/durees-terme'
                        },
                        {
                            label: 'Niveaux d\'Autorisation',
                            icon: 'pi pi-shield',
                            to: '/epargne/reference-data/niveaux-autorisation'
                        }
                    ]
                },
                {
                    label: 'Épargne Libre',
                    icon: 'pi pi-book',
                    items: [
                        {
                            label: 'Comptes d\'Épargne',
                            icon: 'pi pi-wallet',
                            to: '/epargne/compte-epargne'
                        },
                        {
                            label: 'Livrets d\'Épargne',
                            icon: 'pi pi-id-card',
                            to: '/epargne/livret-epargne'
                        },
                        {
                            label: 'Bordereaux de Dépôt',
                            icon: 'pi pi-file-import',
                            to: '/epargne/bordereaux-depot'
                        },
                        {
                            label: 'Demandes de Retrait',
                            icon: 'pi pi-file-export',
                            to: '/epargne/demandes-retrait'
                        }
                    ]
                },
                /*{
                    label: 'Dépôts à Terme (DAT)',
                    icon: 'pi pi-lock',
                    items: [
                        {
                            label: 'Gestion des DAT',
                            icon: 'pi pi-list',
                            to: '/epargne/depots-terme'
                        }
                    ]
                },
                {
                    label: 'Tontine (Épargne Groupe)',
                    icon: 'pi pi-users',
                    items: [
                        {
                            label: 'Groupes de Tontine',
                            icon: 'pi pi-sitemap',
                            to: '/epargne/tontine/groupes'
                        }
                    ]
                },
                {
                    label: 'Épargne Obligatoire',
                    icon: 'pi pi-link',
                    items: [
                        {
                            label: 'Comptes Liés aux Crédits',
                            icon: 'pi pi-briefcase',
                            to: '/epargne/epargne-obligatoire'
                        }
                    ]
                },*/
                {
                    label: 'Rapports Épargne',
                    icon: 'pi pi-chart-bar',
                    items: [
                        {
                            label: 'Rapport des Livrets',
                            icon: 'pi pi-book',
                            to: '/epargne/rapports/livrets'
                        },
                        {
                            label: 'Rapport des Dépôts',
                            icon: 'pi pi-arrow-down',
                            to: '/epargne/rapports/depots'
                        },
                        {
                            label: 'Rapport des Retraits',
                            icon: 'pi pi-arrow-up',
                            to: '/epargne/rapports/retraits'
                        },
                       /* {
                            label: 'Rapport des DAT',
                            icon: 'pi pi-lock',
                            to: '/epargne/rapports/dat'
                        },
                        {
                            label: 'Rapport Tontine',
                            icon: 'pi pi-users',
                            to: '/epargne/rapports/tontine'
                        },
                        {
                            label: 'Rapport Épargne Obligatoire',
                            icon: 'pi pi-link',
                            to: '/epargne/rapports/epargne-obligatoire'
                        }, */
                        {
                            label: 'Synthèse Générale',
                            icon: 'pi pi-chart-pie',
                            to: '/epargne/rapports/synthese'
                        }
                    ]
                }
            ]
        },

        {
            label: 'MODULE CRÉDIT',
            icon: 'pi pi-briefcase',
            items: [
                {
                    label: 'Données de Référence',
                    icon: 'pi pi-database',
                    items: [
                        {
                            label: 'Statuts de Demande',
                            icon: 'pi pi-tags',
                            to: '/credit/reference-data/statuts-demande'
                        },
                        {
                            label: 'Objets de Crédit',
                            icon: 'pi pi-bookmark',
                            to: '/credit/reference-data/objets-credit'
                        },
                        {
                            label: 'Types de Documents',
                            icon: 'pi pi-file',
                            to: '/credit/reference-data/types-documents'
                        },
                        {
                            label: 'Types de Revenus',
                            icon: 'pi pi-dollar',
                            to: '/credit/reference-data/types-revenus'
                        },
                        {
                            label: 'Types de Dépenses',
                            icon: 'pi pi-credit-card',
                            to: '/credit/reference-data/types-depenses'
                        },
                        {
                            label: 'Types de Garanties',
                            icon: 'pi pi-shield',
                            to: '/credit/reference-data/types-garanties'
                        },
                        {
                            label: 'Types d\'Emploi',
                            icon: 'pi pi-id-card',
                            to: '/credit/reference-data/types-emploi'
                        },
                        {
                            label: 'Lieux de Visite',
                            icon: 'pi pi-map-marker',
                            to: '/credit/reference-data/lieux-visite'
                        },
                        {
                            label: 'Statuts de Logement',
                            icon: 'pi pi-home',
                            to: '/credit/reference-data/statuts-logement'
                        },
                        {
                            label: 'Recommandations de Visite',
                            icon: 'pi pi-check-circle',
                            to: '/credit/reference-data/recommandations-visite'
                        },
                        {
                            label: 'Décisions du Comité',
                            icon: 'pi pi-users',
                            to: '/credit/reference-data/decisions-comite'
                        },
                        {
                            label: 'Modes de Décaissement',
                            icon: 'pi pi-money-bill',
                            to: '/credit/reference-data/modes-decaissement'
                        },
                        {
                            label: 'Règles d\'Allocation',
                            icon: 'pi pi-sliders-h',
                            to: '/credit/reference-data/regles-allocation'
                        },
                        {
                            label: 'Étapes de Recouvrement',
                            icon: 'pi pi-sitemap',
                            to: '/credit/reference-data/etapes-recouvrement'
                        },
                        {
                            label: 'Actions de Recouvrement',
                            icon: 'pi pi-bolt',
                            to: '/credit/reference-data/actions-recouvrement'
                        },
                        {
                            label: 'Classifications de Prêt',
                            icon: 'pi pi-chart-bar',
                            to: '/credit/reference-data/classifications-pret'
                        },
                        {
                            label: 'Niveaux de Risque',
                            icon: 'pi pi-exclamation-triangle',
                            to: '/credit/reference-data/niveaux-risque'
                        },
                        {
                            label: 'Catégories de Scoring',
                            icon: 'pi pi-star',
                            to: '/credit/reference-data/categories-scoring'
                        },
                        {
                            label: 'Règles de Scoring',
                            icon: 'pi pi-cog',
                            to: '/credit/reference-data/regles-scoring'
                        }
                    ]
                },
                {
                    label: 'Gestion des Demandes',
                    icon: 'pi pi-file-edit',
                    items: [
                        {
                            label: 'Toutes les Demandes',
                            icon: 'pi pi-list',
                            to: '/credit/demandes'
                        },
                        {
                            label: 'Nouvelle Demande',
                            icon: 'pi pi-plus-circle',
                            to: '/credit/demandes?mode=new'
                        },
                        {
                            label: 'En Attente d\'Analyse',
                            icon: 'pi pi-clock',
                            to: '/credit/demandes?status=EN_ATTENTE_ANALYSE'
                        },
                        {
                            label: 'En Cours de Visite',
                            icon: 'pi pi-map',
                            to: '/credit/demandes?status=EN_VISITE'
                        },
                        {
                            label: 'En Comité',
                            icon: 'pi pi-users',
                            to: '/credit/demandes?status=EN_COMITE'
                        }
                    ]
                },
                {
                    label: 'Analyses Financières',
                    icon: 'pi pi-chart-line',
                    items: [
                        {
                            label: 'Analyses en Cours',
                            icon: 'pi pi-spinner',
                            to: '/credit/analyses'
                        }
                    ]
                },
                {
                    label: 'Visites Terrain',
                    icon: 'pi pi-map-marker',
                    items: [
                        {
                            label: 'Visites Planifiées',
                            icon: 'pi pi-calendar',
                            to: '/credit/visites'
                        },
                        {
                            label: 'Visites Effectuées',
                            icon: 'pi pi-check-circle',
                            to: '/credit/visites?status=EFFECTUEE'
                        }
                    ]
                },
                {
                    label: 'Comité de Crédit',
                    icon: 'pi pi-users',
                    items: [
                        {
                            label: 'Sessions du Comité',
                            icon: 'pi pi-calendar-plus',
                            to: '/credit/comite/sessions'
                        },
                        {
                            label: 'Demandes à Examiner',
                            icon: 'pi pi-inbox',
                            to: '/credit/comite/demandes'
                        }
                    ]
                },
                {
                    label: 'Décaissements',
                    icon: 'pi pi-money-bill',
                    items: [
                        {
                            label: 'Demandes Approuvées',
                            icon: 'pi pi-check',
                            to: '/credit/decaissements/approuves'
                        },
                        {
                            label: 'Décaissements Effectués',
                            icon: 'pi pi-check-circle',
                            to: '/credit/decaissements/effectues'
                        }
                    ]
                },
                {
                    label: 'Rapports Crédit',
                    icon: 'pi pi-chart-bar',
                    items: [
                        {
                            label: 'Rapport des Demandes',
                            icon: 'pi pi-file',
                            to: '/credit/rapports/demandes'
                        },
                        {
                            label: 'Rapport des Analyses',
                            icon: 'pi pi-chart-line',
                            to: '/credit/rapports/analyses'
                        },
                        {
                            label: 'Rapport des Visites',
                            icon: 'pi pi-map',
                            to: '/credit/rapports/visites'
                        },
                        {
                            label: 'Rapport des Décisions',
                            icon: 'pi pi-users',
                            to: '/credit/rapports/decisions'
                        },
                        {
                            label: 'Rapport des Décaissements',
                            icon: 'pi pi-money-bill',
                            to: '/credit/rapports/decaissements'
                        },
                        {
                            label: 'Synthèse du Portefeuille',
                            icon: 'pi pi-chart-pie',
                            to: '/credit/rapports/synthese'
                        }
                    ]
                }
            ]
        },

        {
            label: 'MODULE REMBOURSEMENT',
            icon: 'pi pi-replay',
            items: [
                {
                    label: 'Données de Référence',
                    icon: 'pi pi-database',
                    items: [
                        {
                            label: 'Modes de Remboursement',
                            icon: 'pi pi-credit-card',
                            to: '/remboursement/reference-data/modes-remboursement'
                        },
                        {
                            label: 'Étapes de Recouvrement',
                            icon: 'pi pi-sitemap',
                            to: '/remboursement/reference-data/etapes-recouvrement'
                        },
                        {
                            label: 'Classifications de Retard',
                            icon: 'pi pi-exclamation-triangle',
                            to: '/remboursement/reference-data/classifications-retard'
                        },
                        {
                            label: 'Configurations Pénalités',
                            icon: 'pi pi-percentage',
                            to: '/remboursement/reference-data/configurations-penalites'
                        },
                        {
                            label: 'Règles de Rappel',
                            icon: 'pi pi-bell',
                            to: '/remboursement/reference-data/regles-rappel'
                        },
                        {
                            label: 'Configurations Restructuration',
                            icon: 'pi pi-refresh',
                            to: '/remboursement/reference-data/configurations-restructuration'
                        },
                        {
                            label: 'Seuils de Contentieux',
                            icon: 'pi pi-exclamation-circle',
                            to: '/remboursement/reference-data/seuils-contentieux'
                        }
                    ]
                },
                {
                    label: 'Échéanciers',
                    icon: 'pi pi-calendar',
                    items: [
                        {
                            label: 'Gestion des Échéanciers',
                            icon: 'pi pi-list',
                            to: '/remboursement/echeancier'
                        }
                    ]
                },
                {
                    label: 'Paiements',
                    icon: 'pi pi-money-bill',
                    items: [
                        {
                            label: 'Saisie des Paiements',
                            icon: 'pi pi-plus-circle',
                            to: '/remboursement/paiements'
                        },
                        {
                            label: 'Remboursement Anticipé',
                            icon: 'pi pi-forward',
                            to: '/remboursement/remboursement-anticipe'
                        }
                    ]
                },
                {
                    label: 'Recouvrement',
                    icon: 'pi pi-users',
                    items: [
                        {
                            label: 'Dossiers de Recouvrement',
                            icon: 'pi pi-folder',
                            to: '/remboursement/recouvrement'
                        },
                        {
                            label: 'Restructuration',
                            icon: 'pi pi-refresh',
                            to: '/remboursement/restructuration'
                        }
                    ]
                },
                {
                    label: 'Contentieux',
                    icon: 'pi pi-briefcase',
                    items: [
                        {
                            label: 'Dossiers Contentieux',
                            icon: 'pi pi-file',
                            to: '/remboursement/contentieux'
                        }
                    ]
                },
                {
                    label: 'Rapports Remboursement',
                    icon: 'pi pi-chart-bar',
                    items: [
                        {
                            label: 'Rapport des Paiements',
                            icon: 'pi pi-money-bill',
                            to: '/remboursement/rapports/paiements'
                        },
                        {
                            label: 'Rapport des Retards',
                            icon: 'pi pi-exclamation-triangle',
                            to: '/remboursement/rapports/retards'
                        },
                        {
                            label: 'Rapport Recouvrement',
                            icon: 'pi pi-users',
                            to: '/remboursement/rapports/recouvrement'
                        },
                        {
                            label: 'Rapport Contentieux',
                            icon: 'pi pi-briefcase',
                            to: '/remboursement/rapports/contentieux'
                        },
                        {
                            label: 'Synthèse Remboursement',
                            icon: 'pi pi-chart-pie',
                            to: '/remboursement/rapports/synthese'
                        }
                    ]
                }
            ]
        },

        {
            label: 'MANUEL UTILISATEUR',
            icon: 'pi pi-home',
           /* visible: appUser ? hasAnyAuthority(appUser, [
                'PONT_BASCULE_CREATE',
                'PONT_BASCULE_UPDATE',
                'PONT_BASCULE_CONSULTATION',
                'STORAGE_EXIT_WITH_RSP',
                'STORAGE_EXIT_WITH_GPS',
                'PORT_EXIT_WITH_RSP',
                'PORT_EXIT_WITH_GPS'
            ]) : false, */

            items: [

                {
                    label: 'Manuel',

                        icon: 'pi pi-chart-bar',
                        to: '/moduleCostumerGroup/user-manual'

                },
                // {
                //         label: 'Service presté',
                //         icon: 'pi pi-chart-bar',
                //         to: '/entryMagasin/factServicePreste'
                //     },
                {
                    label: 'Gestion des Sorties',
                    icon: 'pi pi-wallet',
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'STORAGE_EXIT_WITH_RSP',
                        'STORAGE_EXIT_WITH_GPS',
                        'PORT_EXIT_WITH_RSP',
                        'PORT_EXIT_WITH_GPS'
                    ]) : false,
                    items: [{
                        label: 'Sortie Magasin avec RSP',
                        icon: 'pi pi-chart-bar',
                        to: '/sortie/sortieMagasinRsp'
                        // to: '/storage/exitStockOther'
                    }, {
                        label: 'Sortie Magasin Autre',
                        icon: 'pi pi-chart-bar',
                        to: '/sortie/sortieMagasinAutre'
                        // to: '/storage/exitStockOther'
                    }, {
                        label: 'Sortie Port avec RSP',
                        icon: 'pi pi-chart-bar',
                        to: '/sortie/sortiePortRsp',
                        visible: appUser ? hasAuthority(appUser, 'PORT_EXIT_WITH_RSP') : false
                    }, {
                        label: 'Sortie Port avec GPS',
                        icon: 'pi pi-map-marker',
                        to: '/sortie/sortiePortGps',
                        visible: appUser ? hasAuthority(appUser, 'PORT_EXIT_WITH_GPS') : false
                    }]
                },

                {
                    label: 'Gestion Pont Bascule',
                    icon: 'pi pi-home',
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'PONT_BASCULE_CREATE',
                        'PONT_BASCULE_UPDATE',
                        'PONT_BASCULE_CONSULTATION'
                    ]) : false,
                    items: [
                        {
                            label: 'Pont Bascule',
                            icon: 'pi pi-home',
                            to: '/storage/pontBascule'
                        }]
                }]
        },



       



        


          


        {
            label: 'Comptabilite',
            icon: 'pi pi-home',
            visible: appUser ? hasAnyAuthority(appUser, [
                'ACCOUNTING_VIEW',
                'ACCOUNTING_ENTRY_CREATE',
                'ACCOUNTING_ENTRY_VALIDATE',
                'ACCOUNTING_REPORT_VIEW',
                'ACCOUNTING_REPORT_EXPORT'
            ]) : false,
            items:
                [
                    {
                        label: 'Paramètrse',
                        icon: 'pi pi-users',
                        items: [
                            {
                                label: 'Taux de change',
                                icon: 'pi pi-users',
                                to: '/comptabilite/settings/tauxChange'
                            }
                        ]
                    },
                    {
                        label: 'Plan comptable',
                        icon: 'pi pi-users',
                        to: '/comptabilite/compte'
                    },
                    {
                        label: 'Journaux',
                        icon: 'pi pi-users',
                        to: '/comptabilite/journal'
                    }
                    ,
                    {
                        label: 'Exercice',
                        icon: 'pi pi-users',
                        to: '/comptabilite/exercice'
                    }
                    ,
                    {
                        label: 'Brouillard',
                        icon: 'pi pi-users',
                        to: '/comptabilite/brouillard'
                    }
                    ,
                    {
                        label: 'Ecritures',
                        icon: 'pi pi-users',
                        to: '/comptabilite/ecriture'
                    }
                    ,
                     
                    {
                        label: `Control d'intégrité`,
                        icon: 'pi pi-users',
                        to: '/comptabilite/control'
                    }
                ]
        },

        {
            label: 'Rapport Compta',
            icon: 'pi pi-chart-bar',
            visible: appUser ? hasAnyAuthority(appUser, [
                'ACCOUNTING_VIEW',
                'ACCOUNTING_ENTRY_CREATE',
                'ACCOUNTING_ENTRY_VALIDATE',
                'ACCOUNTING_REPORT_VIEW',
                'ACCOUNTING_REPORT_EXPORT'
            ]) : false,
            items: [
                {
                    label: 'Consultation compte',
                    icon: 'pi pi-search',
                    to: '/comptabilite/rapportcompte'
                },
                {
                    label: 'Edition journal',
                    icon: 'pi pi-folder-plus',
                    to: '/comptabilite/editionJournal'
                },
                {
                    label: 'Grand livre',
                    icon: 'pi pi-book',
                    to: '/comptabilite/grandlivre'
                },
                {
                    label: 'Balance',
                    icon: 'pi pi-gauge',
                    to: '/comptabilite/balance'
                },
                {
                    label: 'Bilan',
                    icon: 'pi pi-file',
                    to: '/comptabilite/bilan'
                },
                {
                    label: 'Compte resultat',
                    icon: 'pi pi-calculator',
                    to: '/comptabilite/compteResultat'
                }
                ,
                {
                    label: 'Flux de trésorerie',
                    icon: 'pi pi-credit-card',
                    to: '/comptabilite/fluxTresorerie'
                }
                ,
                {
                    label: 'Variation des capitaux',
                    icon: 'pi pi-chart-line',
                    to: '/comptabilite/variationCapitaux'
                }
            ]
        },

        



        {

            label: 'Ressources Humaines',
            icon: 'pi pi-home',
            visible: appUser ? hasAnyAuthority(appUser, ['RH_MANAGER', 'RH_OPERATEUR_SAISIE']) : false,
            items: [
                {

                    label: 'Gestion des carrières',
                    icon: 'pi pi-wallet',
                    items: [
                        {
                            label: 'Gestion des renseignements',
                            icon: 'pi pi-wallet',
                            items: [{
                                label: 'Identification',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/identification'
                            }, {
                                label: 'Administrations',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/administration'
                            }, {
                                label: 'Carrières',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/carriere'
                            }, {
                                label: 'Logistiques',
                                icon: 'pi pi-check-square',
                                to: '/approvisionnement/parametrage/unite'
                            },
                            {
                                label: 'Les ayants droits',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/ayantDroit'
                            },]
                        }
                        ,
                        {
                            label: 'Gestion des mouvements',
                            icon: 'pi pi-wallet',
                            visible: true,
                            items: [{
                                label: 'Absences',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/absence'
                            }, {
                                label: 'Congés',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/conge'
                            },
                            {
                                label: 'Sorties',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/sortie'
                            }, {
                                label: 'Diplomes',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/diplome'
                            }, {
                                label: 'Formation-Stage',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/formationStage'
                            }, {
                                label: 'Cotation',
                                icon: 'pi pi-check-square',
                                items: [{
                                    label: 'Création',
                                    icon: 'pi pi-check-square',
                                    to: '/grh/ficheEmploye/cotation'
                                }]
                            }, {
                                label: 'Mutation',
                                icon: 'pi pi-check-square',
                                to: '/approvisionnement/mouvement/sortiearticle'
                            }, {
                                label: 'Actions Disciplinaires',
                                icon: 'pi pi-check-square',
                                to: '/grh/ficheEmploye/actionDisciplinaire'
                            },]
                        }
                        ,
                        {
                            label: 'Gestion des parametres',
                            icon: 'pi pi-home',
                            items: [{
                                label: 'Départements',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/department'
                            }, {
                                label: 'Services',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/service'
                            }, {
                                label: 'Fonctions',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/fonction'
                            }, {
                                label: 'Catégories',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/categorie'
                            }, {
                                label: 'Grade',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/grade'
                            }, {
                                label: 'Banques',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/banque'
                            },
                            {
                                label: 'Type de congés',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/typeConge'
                            }, {
                                label: 'Type de diplome',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/typeDiplome'
                            }, {
                                label: 'Situation',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/situation'
                            }, {
                                label: 'Notation',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/notation'
                            }, {
                                label: 'Pays',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/pays'
                            }, {
                                label: 'Province',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/province'
                            }, {
                                label: 'Commune',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/commune'
                            }, {
                                label: 'Colline',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/colline'
                            }, {
                                label: 'Postes',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/poste'
                            }, {
                                label: 'Domaines de formation',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/domaineFormation'
                            }]
                        }, {
                            label: 'Edition',
                            icon: 'pi pi-home',
                            to: '/grh/ficheEmploye/edition'
                        }]

                }, {

                    label: 'Gestion de la paie',
                    icon: 'pi pi-wallet',
                    visible: appUser ? hasAuthority(appUser, 'RH_MANAGER') : false,
                    items: [
                        {
                            label: 'Saisie',
                            icon: 'pi pi-wallet',
                            items: [{
                                label: 'Indemnités',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/saisie/indemnite'
                            }, {
                                label: 'Prime',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/saisie/prime'
                            }, {
                                label: 'Retenue',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/saisie/retenue'
                            }, {
                                label: 'Paie',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/saisie/paie'
                            },
                            ]
                        }
                        ,
                        {
                            label: 'FingerPrint',
                            icon: 'pi pi-wallet',
                            visible: true,
                            items: [{
                                label: 'Parametrage des groupes',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/fingerPrint/shiftGroupe'
                            }, {
                                label: 'Horaire pour tout le monde',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/fingerPrint/horaire'
                            },
                            {
                                label: 'Pointage',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/fingerPrint/attendance'
                            }, {
                                label: 'Heure Supplémentaire',
                                icon: 'pi pi-clock',
                                to: '/grh/paie/fingerPrint/heureSupplementaire'
                            }, {
                                label: 'actions Disciplinaire',
                                icon: 'pi pi-check-square',
                                to: '/approvisionnement/mouvement/sortiearticle'
                            }]
                        }
                        ,
                        {
                            label: 'Gestion des parametres',
                            icon: 'pi pi-home',
                            items: [{
                                label: 'Période',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/periodePaie'
                            }, {
                                label: 'Rubrique de paie',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/paieRubrique'
                            }, {
                                label: 'Indemnité',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/indemniteParametre'
                            }, {
                                label: 'Prime',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/primeParametre'
                            }, {
                                label: 'Retenue',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/retenueParametre'
                            }, {
                                label: 'Tranche Impôts',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/trancheImpotParametre'
                            }, {
                                label: 'Tranche Impôts Annuel',
                                icon: 'pi pi-check-square',
                                to: '/grh/paie/trancheImpotAnnuelParametre'
                            }, {
                                label: 'Banque',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/banque'
                            },
                            {
                                label: 'Type de congés',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/typeConge'
                            }, {
                                label: 'Type de diplome',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/typeDiplome'
                            }, {
                                label: 'Situation',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/situation'
                            }, {
                                label: 'Notation',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/notation'
                            }, {
                                label: 'Pays',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/pays'
                            }, {
                                label: 'Province',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/province'
                            }, {
                                label: 'Commune',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/commune'
                            }, {
                                label: 'Colline',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/colline'
                            }, {
                                label: 'Postes',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/poste'
                            }, {
                                label: 'Domaines de formation',
                                icon: 'pi pi-check-square',
                                to: '/grh/settings/domaineFormation'
                            }]
                        }, {
                            label: 'Consultation de la paie',
                            icon: 'pi pi-eye',
                            to: '/grh/paie/consultation'
                        }, {
                            label: 'Comptabilisation',
                            icon: 'pi pi-calculator',
                            to: '/grh/paie/comptabilisation'
                        }]

                },
                {
                    label: 'Editions Paie',
                    icon: 'pi pi-print',
                    visible: appUser ? hasAuthority(appUser, 'RH_MANAGER') : false,
                    items: [{
                        label: 'Bulletin de paie',
                        icon: 'pi pi-file',
                        to: '/grh/paie/editions/bulletinPaie'
                    }, {
                        label: 'Journal de paie',
                        icon: 'pi pi-book',
                        to: '/grh/paie/editions/journalPaie'
                    }, {
                        label: 'Paiement a effectuer',
                        icon: 'pi pi-money-bill',
                        to: '/grh/paie/editions/paiementAEffectuer'
                    }, {
                        label: 'Virement bancaire',
                        icon: 'pi pi-credit-card',
                        to: '/grh/paie/editions/virementBancaire'
                    }, {
                        label: 'Listing IRE',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingIre'
                    }, {
                        label: 'Listing IRE par tranche',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingIREParTranche'
                    }, {
                        label: 'Listing IRE Recapitulatif',
                        icon: 'pi pi-file-excel',
                        to: '/grh/paie/editions/listingIreRecapitulatif'
                    }, {
                        label: 'Listing Inss',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingInss'
                    }, {
                        label: 'Listing Jubilée',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingJubile'
                    }, {
                        label: 'Fond de pension',
                        icon: 'pi pi-wallet',
                        to: '/grh/paie/editions/fondPensionComplementaire'
                    }, {
                        label: 'Listing des retenues',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingRetenue'
                    }, {
                        label: 'Listing Retenues BHB',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingRetenueBhb'
                    }, {
                        label: 'Synthése',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/syntheseConsolidE'
                    }, {
                        label: 'Listing de Participation Restauration',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingParticipationRestauration'
                    }, {
                        label: 'Listing des indemnités diverses',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingIndemnitesDiverses'
                    }, {
                        label: 'Listing des heures supplémentaire',
                        icon: 'pi pi-clock',
                        to: '/grh/paie/editions/listingHeuresSupplementaire'
                    }, {
                        label: "Listing de l'Inss Trimestriel",
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingInssTrimestriel'
                    }, {
                        label: 'Listing des retenues par an',
                        icon: 'pi pi-list',
                        to: '/grh/paie/editions/listingRetenuesParAn'
                    }, {
                        label: 'IRE groupé par Mois',
                        icon: 'pi pi-calendar',
                        to: '/grh/paie/editions/ireGroupeParMois'
                    }, {
                        label: 'IRE Annuel',
                        icon: 'pi pi-calendar-plus',
                        to: '/grh/paie/editions/ireAnnuel'
                    }, {
                        label: 'Masse salariale Brut',
                        icon: 'pi pi-money-bill',
                        to: '/grh/paie/editions/masseSalarialeBrut'
                    }, {
                        label: 'Masse salariale Brut Global',
                        icon: 'pi pi-money-bill',
                        to: '/grh/paie/editions/masseSalarialeBrutGlobal'
                    }]
                }]
        },

        {
            label: 'ADMINISTRATION',
            icon: 'pi pi-home',
            //visible: appUser ? hasAuthority(appUser, 'ADMIN') : false,
            items: [{
                label: 'Gestion des utilisateurs',
                icon: 'pi pi-users',
                to: '/usermanagement'
            },
            {
                label: 'Journal d\'Audit',
                icon: 'pi pi-history',
                to: '/tracking'
            }]
        },




       
    ];

    return (
        <div className="menu-wrapper">
            <AppSubMenu model={model} />
            {nextButtonConfig.visible && (
                <div className="next-button-container">
                    <button
                        className="next-button"
                        style={{ width: nextButtonConfig.width }}
                    >
                        {nextButtonConfig.label}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppMenu;
