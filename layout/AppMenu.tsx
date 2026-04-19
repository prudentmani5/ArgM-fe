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
            visible: appUser ? hasAnyAuthority(appUser, [
                'CUSTOMER_GROUP_VIEW', 'CUSTOMER_GROUP_CREATE', 'CUSTOMER_GROUP_UPDATE',
                'CUSTOMER_GROUP_DELETE', 'CUSTOMER_GROUP_APPROVE', 'CUSTOMER_GROUP_BLACKLIST',
                'CUSTOMER_GROUP_REPORT', 'CUSTOMER_GROUP_SETTINGS'
            ]) : false,
            items: [
                {
                    label: ' Paramétres',
                    icon: 'pi pi-wallet',
                    visible: appUser ? hasAnyAuthority(appUser, ['CUSTOMER_GROUP_SETTINGS']) : false,
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
                    visible: appUser ? hasAnyAuthority(appUser, ['CUSTOMER_GROUP_VIEW', 'CUSTOMER_GROUP_CREATE', 'CUSTOMER_GROUP_UPDATE']) : false,
                    items: [{
                        label: 'Enregistrement du client',
                        icon: 'pi pi-chart-bar',
                        to: '/moduleCostumerGroup/clients'
                    }, {
                        label: 'Enregistrement du groupe',
                        icon: 'pi pi-wallet',
                        to: '/moduleCostumerGroup/solidarity-groups'
                    }]
                },

                {
                    label: 'Rapports',
                    icon: 'pi pi-chart-bar',
                    visible: appUser ? hasAnyAuthority(appUser, ['CUSTOMER_GROUP_REPORT']) : false,
                    items: [{
                        label: 'Rapports Clients et Groupes',
                        icon: 'pi pi-file',
                        to: '/moduleCostumerGroup/reports'
                    }]
                },


                /*{
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
                }*/



            ]

        },



        {
            label: ' MODULE PRODUITS FINANCIERS',
            icon: 'pi pi-money-bill',
            visible: appUser ? hasAnyAuthority(appUser, [
                'FINANCIAL_PRODUCT_VIEW', 'FINANCIAL_PRODUCT_CREATE', 'FINANCIAL_PRODUCT_UPDATE',
                'FINANCIAL_PRODUCT_DELETE', 'FINANCIAL_PRODUCT_APPROVE', 'FINANCIAL_PRODUCT_SETTINGS'
            ]) : false,
            items: [

                 {
                            label: ' Devises',
                            icon: 'pi pi-dollar',
                            to: '/financialProducts/reference-data/currencies',
                            visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false
                        },
                        {
                            label: 'Product Types',
                            icon: 'pi pi-briefcase',
                            to: '/financialProducts/reference-data/loan-product-types',
                            visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false
                        },


                        {
                            label: 'Types de Frais',
                            icon: 'pi pi-money-bill',
                            to: '/financialProducts/reference-data/fee-types',
                            visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false
                        },
                        {
                            label: 'Frequences de Payment ',
                            icon: 'pi pi-calendar',
                            to: '/financialProducts/reference-data/payment-frequencies',
                            visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false
                        },

                         {
                            label: 'Interest Calculation Methods',
                            icon: 'pi pi-percentage',
                            to: '/financialProducts/reference-data/interest-calculation-methods',
                            visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false
                        },
                         {
                            label: 'Tous les Produits',
                            icon: 'pi pi-list',
                            to: '/financialProducts/loan-products',
                            visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_VIEW']) : false
                        },
                         {
                            label: 'New Application / Nouvelle Demande',
                            icon: 'pi pi-plus-circle',
                            to: '/financialProducts/loan-applications',
                            visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_CREATE']) : false
                        }
                       
                        
                       
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
            visible: appUser ? hasAnyAuthority(appUser, [
                'EPARGNE_VIEW', 'EPARGNE_CREATE', 'EPARGNE_UPDATE', 'EPARGNE_DELETE',
                'EPARGNE_VALIDATE', 'EPARGNE_CLOSE', 'EPARGNE_REPORT', 'EPARGNE_SETTINGS', 'EPARGNE_DAILY_CLOSING',
                'EPARGNE_WITHDRAWAL_CREATE', 'EPARGNE_WITHDRAWAL_VERIFY', 'EPARGNE_WITHDRAWAL_SECOND_VERIFY',
                'EPARGNE_WITHDRAWAL_MANAGER_APPROVE', 'EPARGNE_WITHDRAWAL_DISBURSE', 'EPARGNE_WITHDRAWAL_REJECT',
                'EPARGNE_DEPOSIT_CREATE', 'EPARGNE_DEPOSIT_COMPLETE', 'EPARGNE_DEPOSIT_CANCEL',
                'EPARGNE_TERM_DEPOSIT_CREATE', 'EPARGNE_TERM_DEPOSIT_MANAGE', 'EPARGNE_TERM_DEPOSIT_CLOSE',
                'EPARGNE_COMPULSORY_CREATE', 'EPARGNE_COMPULSORY_RELEASE'
            ]) : false,
            items: [
                {
                    label: 'Données de Référence',
                    icon: 'pi pi-database',
                    visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_SETTINGS']) : false,
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
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'EPARGNE_VIEW', 'EPARGNE_CREATE',
                        'EPARGNE_WITHDRAWAL_CREATE', 'EPARGNE_WITHDRAWAL_VERIFY', 'EPARGNE_WITHDRAWAL_DISBURSE',
                        'EPARGNE_DEPOSIT_CREATE', 'EPARGNE_DEPOSIT_COMPLETE'
                    ]) : false,
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
                        },
                        {
                            label: 'Carnet de Chèques',
                            icon: 'pi pi-book',
                            to: '/epargne/carnet-cheque'
                        },
                        {
                            label: 'Demande de Situation',
                            icon: 'pi pi-file',
                            to: '/epargne/demande-situation'
                        },
                        {
                            label: 'Demande d\'Historique',
                            icon: 'pi pi-history',
                            to: '/epargne/demande-historique'
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
                    label: 'Clôture Journalière',
                    icon: 'pi pi-lock',
                    to: '/epargne/cloture-journaliere',
                    visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_DAILY_CLOSING']) : false
                },
                {
                    label: 'Rapports Épargne',
                    icon: 'pi pi-chart-bar',
                    visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_REPORT']) : false,
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
                       {
                            label: 'Consulter historique',
                            icon: 'pi pi-lock',
                            to: '/epargne/rapports/historique-operations'
                        }, /*
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
                        },
                        {
                            label: 'Rapport Carnets de Chèques',
                            icon: 'pi pi-credit-card',
                            to: '/epargne/rapports/carnets-cheque'
                        },
                        {
                            label: 'Rapport Demandes Situation',
                            icon: 'pi pi-file',
                            to: '/epargne/rapports/demandes-situation'
                        },
                        {
                            label: 'Rapport Demandes Historique',
                            icon: 'pi pi-history',
                            to: '/epargne/rapports/demandes-historique'
                        },
                        {
                            label: 'Rapport Frais de Tenue',
                            icon: 'pi pi-money-bill',
                            to: '/epargne/rapports/frais-tenue-compte'
                        },
                        {
                            label: 'Rapport Virements',
                            icon: 'pi pi-arrows-h',
                            to: '/epargne/rapports/virements'
                        },
                        {
                            label: 'Situation des Comptes',
                            icon: 'pi pi-list',
                            to: '/epargne/rapports/situation-comptes'
                        }
                    ]
                }
            ]
        },

        {
            label: 'MODULE CRÉDIT',
            icon: 'pi pi-briefcase',
            visible: appUser ? hasAnyAuthority(appUser, [
                'CREDIT_VIEW', 'CREDIT_CREATE', 'CREDIT_UPDATE', 'CREDIT_DELETE',
                'CREDIT_ANALYZE', 'CREDIT_COMMITTEE', 'CREDIT_DISBURSE', 'CREDIT_REPORT',
                'CREDIT_SETTINGS', 'CREDIT_DAILY_CLOSING',
                'CREDIT_APPLICATION_CREATE', 'CREDIT_APPLICATION_UPDATE', 'CREDIT_APPLICATION_CHANGE_STATUS',
                'CREDIT_DISBURSE_CREATE', 'CREDIT_DISBURSE_EXECUTE', 'CREDIT_DISBURSE_CANCEL',
                'CREDIT_COMMITTEE_CREATE', 'CREDIT_COMMITTEE_START', 'CREDIT_COMMITTEE_CLOSE'
            ]) : false,
            items: [
                {
                    label: 'Données de Référence',
                    icon: 'pi pi-database',
                    visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_SETTINGS']) : false,
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
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'CREDIT_VIEW', 'CREDIT_CREATE',
                        'CREDIT_APPLICATION_CREATE', 'CREDIT_APPLICATION_UPDATE', 'CREDIT_APPLICATION_CHANGE_STATUS'
                    ]) : false,
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
                    visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_ANALYZE']) : false,
                    items: [
                        {
                            label: 'Analyses en Cours',
                            icon: 'pi pi-spinner',
                            to: '/credit/analyses'
                        }
                    ]
                },
               /* {
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
                },*/
                {
                    label: 'Décaissements',
                    icon: 'pi pi-money-bill',
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'CREDIT_DISBURSE',
                        'CREDIT_DISBURSE_CREATE', 'CREDIT_DISBURSE_EXECUTE', 'CREDIT_DISBURSE_CANCEL'
                    ]) : false,
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
                    label: 'Clôture Journalière',
                    icon: 'pi pi-lock',
                    to: '/credit/cloture-journaliere',
                    visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_DAILY_CLOSING']) : false
                },
                {
                    label: 'Rapports Crédit',
                    icon: 'pi pi-chart-bar',
                    visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_REPORT']) : false,
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
                        },
                        {
                            label: 'Crédits Accordés',
                            icon: 'pi pi-chart-bar',
                            to: '/credit/rapports/credits-accordes'
                        }
                    ]
                }
            ]
        },

        {
            label: 'MODULE REMBOURSEMENT',
            icon: 'pi pi-replay',
            visible: appUser ? hasAnyAuthority(appUser, [
                'REMBOURSEMENT_VIEW', 'REMBOURSEMENT_CREATE', 'REMBOURSEMENT_UPDATE', 'REMBOURSEMENT_DELETE',
                'REMBOURSEMENT_VALIDATE', 'REMBOURSEMENT_RECOVERY', 'REMBOURSEMENT_RESTRUCTURE',
                'REMBOURSEMENT_REPORT', 'REMBOURSEMENT_SETTINGS', 'REMBOURSEMENT_DAILY_CLOSING',
                'REMBOURSEMENT_PAYMENT_CREATE', 'REMBOURSEMENT_PAYMENT_PROCESS', 'REMBOURSEMENT_PAYMENT_UPDATE',
                'REMBOURSEMENT_EARLY_CREATE', 'REMBOURSEMENT_EARLY_APPROVE', 'REMBOURSEMENT_EARLY_PROCESS',
                'REMBOURSEMENT_RESTRUCTURE_CREATE', 'REMBOURSEMENT_RESTRUCTURE_APPROVE',
                'REMBOURSEMENT_RECOVERY_CREATE', 'REMBOURSEMENT_RECOVERY_ASSIGN',
                'REMBOURSEMENT_RECOVERY_ESCALATE', 'REMBOURSEMENT_RECOVERY_CLOSE'
            ]) : false,
            items: [
                {
                    label: 'Données de Référence',
                    icon: 'pi pi-database',
                    visible: appUser ? hasAnyAuthority(appUser, ['REMBOURSEMENT_SETTINGS']) : false,
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
                    visible: appUser ? hasAnyAuthority(appUser, ['REMBOURSEMENT_VIEW']) : false,
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
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'REMBOURSEMENT_VIEW', 'REMBOURSEMENT_CREATE', 'REMBOURSEMENT_VALIDATE',
                        'REMBOURSEMENT_PAYMENT_CREATE', 'REMBOURSEMENT_PAYMENT_PROCESS',
                        'REMBOURSEMENT_EARLY_CREATE', 'REMBOURSEMENT_EARLY_APPROVE', 'REMBOURSEMENT_EARLY_PROCESS'
                    ]) : false,
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
                        },
                        {
                            label: 'Prélèvement Automatique',
                            icon: 'pi pi-sync',
                            to: '/remboursement/prelevement-automatique'
                        },
                        {
                            label: 'Calcul Automatique Pénalités',
                            icon: 'pi pi-calculator',
                            to: '/remboursement/calcul-penalites'
                        }
                    ]
                },
                {
                    label: 'Recouvrement',
                    icon: 'pi pi-users',
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'REMBOURSEMENT_RECOVERY',
                        'REMBOURSEMENT_RECOVERY_CREATE', 'REMBOURSEMENT_RECOVERY_ASSIGN',
                        'REMBOURSEMENT_RECOVERY_ESCALATE', 'REMBOURSEMENT_RECOVERY_CLOSE'
                    ]) : false,
                    items: [
                        {
                            label: 'Dossiers de Recouvrement',
                            icon: 'pi pi-folder',
                            to: '/remboursement/recouvrement'
                        },
                        /*{
                            label: 'Restructuration',
                            icon: 'pi pi-refresh',
                            to: '/remboursement/restructuration'
                        }*/
                    ]
                },
                {
                    label: 'Clôture Journalière',
                    icon: 'pi pi-lock',
                    to: '/remboursement/cloture-journaliere',
                    visible: appUser ? hasAnyAuthority(appUser, ['REMBOURSEMENT_DAILY_CLOSING']) : false
                },
                {
                    label: 'Rapports Remboursement',
                    icon: 'pi pi-chart-bar',
                    visible: appUser ? hasAnyAuthority(appUser, ['REMBOURSEMENT_REPORT']) : false,
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
                        },
                        {
                            label: 'Rapport Échéanciers',
                            icon: 'pi pi-calendar',
                            to: '/remboursement/rapports/echeanciers'
                        },
                        {
                            label: 'Rapport Remb. Anticipé',
                            icon: 'pi pi-fast-forward',
                            to: '/remboursement/rapports/remboursement-anticipe'
                        },
                        {
                            label: 'Rapport Pénalités',
                            icon: 'pi pi-calculator',
                            to: '/remboursement/rapports/penalites'
                        },
                        {
                            label: 'Rapport Prélèvements Auto.',
                            icon: 'pi pi-sync',
                            to: '/remboursement/rapports/prelevements-automatiques'
                        },
                        {
                            label: 'Rapport Restructurations',
                            icon: 'pi pi-refresh',
                            to: '/remboursement/rapports/restructurations'
                        }
                    ]
                }
            ]
        },

          


        {
            label: 'MODULE COMPTABILITÉ',
            icon: 'pi pi-calculator',
            visible: appUser ? hasAnyAuthority(appUser, [
                'ACCOUNTING_VIEW', 'ACCOUNTING_ENTRY_CREATE', 'ACCOUNTING_ENTRY_VALIDATE',
                'ACCOUNTING_DELETE', 'ACCOUNTING_DAILY_CLOSING', 'ACCOUNTING_SETTINGS',
                'ACCOUNTING_CLOSING_EXECUTE', 'ACCOUNTING_CLOSING_REVERSE'
            ]) : false,
            items: [
                {
                    label: 'Paramètres',
                    icon: 'pi pi-cog',
                    visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_SETTINGS']) : false,
                    items: [
                        {
                            label: 'Taux de change',
                            icon: 'pi pi-dollar',
                            to: '/comptability/settings/tauxChange'
                        }
                    ]
                },
                {
                    label: 'Plan comptable SYSCOHADA',
                    icon: 'pi pi-list',
                    to: '/comptability/compte',
                    visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW']) : false
                },
                {
                    label: 'Journaux',
                    icon: 'pi pi-book',
                    to: '/comptability/journal',
                    visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW']) : false
                },
                {
                    label: 'Exercice',
                    icon: 'pi pi-calendar',
                    to: '/comptability/exercice',
                    visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW', 'ACCOUNTING_ENTRY_CREATE']) : false
                },
                {
                    label: 'Brouillard',
                    icon: 'pi pi-file-edit',
                    to: '/comptability/brouillard',
                    visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW', 'ACCOUNTING_ENTRY_CREATE']) : false
                },
                {
                    label: 'Écritures',
                    icon: 'pi pi-pencil',
                    to: '/comptability/ecriture',
                    visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_ENTRY_CREATE']) : false
                },
                {
                    label: 'Contrôle d\'intégrité',
                    icon: 'pi pi-check-circle',
                    to: '/comptability/control',
                    visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW']) : false
                },
                {
                    label: 'Clôture Journalière',
                    icon: 'pi pi-lock',
                    to: '/comptability/cloture-journaliere',
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'ACCOUNTING_DAILY_CLOSING', 'ACCOUNTING_CLOSING_EXECUTE', 'ACCOUNTING_CLOSING_REVERSE'
                    ]) : false
                },
                {
                    label: 'Frais de Tenue de Compte',
                    icon: 'pi pi-money-bill',
                    to: '/epargne/frais-tenue-compte',
                    visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_SETTINGS', 'EPARGNE_FEE_EXECUTE']) : false
                },
                {
                    label: 'Comptes Internes',
                    icon: 'pi pi-building',
                    to: '/comptability/comptes-internes',
                    visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_INTERNAL_ACCOUNTS']) : false
                },
                {
                    label: 'Immobilisations',
                    icon: 'pi pi-server',
                    to: '/comptability/amortissement',
                    visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW', 'IMMO_VIEW']) : false
                }
            ]
        },

        {
            label: 'RAPPORTS COMPTABILITÉ',
            icon: 'pi pi-chart-bar',
            visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_REPORT_VIEW', 'ACCOUNTING_REPORT_EXPORT']) : false,
            items: [
                {
                    label: 'Consultation compte',
                    icon: 'pi pi-search',
                    to: '/comptability/rapportcompte'
                },
                {
                    label: 'Édition journal',
                    icon: 'pi pi-folder-plus',
                    to: '/comptability/editionJournal'
                },
                {
                    label: 'Grand livre',
                    icon: 'pi pi-book',
                    to: '/comptability/grandlivre'
                },
                {
                    label: 'Balance',
                    icon: 'pi pi-gauge',
                    to: '/comptability/balance'
                },
                {
                    label: 'Bilan',
                    icon: 'pi pi-file',
                    to: '/comptability/bilan'
                },
                {
                    label: 'Compte de résultat',
                    icon: 'pi pi-calculator',
                    to: '/comptability/compteResultat'
                },
                {
                    label: 'Flux de trésorerie',
                    icon: 'pi pi-credit-card',
                    to: '/comptability/fluxTresorerie'
                },
                {
                    label: 'Variation des capitaux',
                    icon: 'pi pi-chart-line',
                    to: '/comptability/variationCapitaux'
                }
            ]
        },

        {
            label: 'MODULE RAPPROCHEMENT',
            icon: 'pi pi-check-square',
            visible: appUser ? hasAnyAuthority(appUser, [
                'RAPPROCHEMENT_VIEW', 'RAPPROCHEMENT_CREATE', 'RAPPROCHEMENT_UPDATE',
                'RAPPROCHEMENT_DELETE', 'RAPPROCHEMENT_VALIDATE', 'RAPPROCHEMENT_APPROVE',
                'RAPPROCHEMENT_RECONCILE', 'RAPPROCHEMENT_REPORT',
                'RAPPROCHEMENT_AUTO_RECONCILE', 'RAPPROCHEMENT_MANUAL_MATCH'
            ]) : false,
            items: [
                {
                    label: 'Tableau de Bord',
                    icon: 'pi pi-th-large',
                    to: '/rapprochement',
                    visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_VIEW']) : false
                },
                {
                    label: 'Relevés Bancaires',
                    icon: 'pi pi-file-import',
                    to: '/rapprochement/releves',
                    visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_CREATE']) : false
                },
                {
                    label: 'Rapprochements',
                    icon: 'pi pi-check-circle',
                    to: '/rapprochement/rapprochements',
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'RAPPROCHEMENT_RECONCILE',
                        'RAPPROCHEMENT_AUTO_RECONCILE', 'RAPPROCHEMENT_MANUAL_MATCH',
                        'RAPPROCHEMENT_VALIDATE', 'RAPPROCHEMENT_APPROVE'
                    ]) : false
                },
                {
                    label: 'Gestion des Écarts',
                    icon: 'pi pi-exclamation-triangle',
                    to: '/rapprochement/ecarts',
                    visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_VIEW']) : false
                },
                {
                    label: 'Rapports',
                    icon: 'pi pi-print',
                    to: '/rapprochement/rapports',
                    visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_REPORT']) : false
                }
            ]
        },


        

        {
            label: 'ADMINISTRATION',
            icon: 'pi pi-home',
            visible: appUser ? hasAnyAuthority(appUser, ['ADMIN', 'USER_VIEW', 'USER_CREATE', 'TRACKING_VIEW']) : false,
            items: [{
                label: 'Créer un Utilisateur',
                icon: 'pi pi-user-plus',
                to: '/usermanagement/create-user',
                visible: appUser ? hasAnyAuthority(appUser, ['ADMIN', 'USER_CREATE']) : false
            },
            {
                label: 'Gestion des utilisateurs',
                icon: 'pi pi-users',
                to: '/usermanagement',
                visible: appUser ? hasAnyAuthority(appUser, ['ADMIN', 'USER_VIEW']) : false
            },
            {
                label: 'Journal d\'Audit',
                icon: 'pi pi-history',
                to: '/tracking',
                visible: appUser ? hasAnyAuthority(appUser, ['TRACKING_VIEW']) : false
            }]
        },

       {
            label: 'MANUEL UTILISATEUR',
            icon: 'pi pi-home',

            items: [

                {
                    label: 'Manuel',

                        icon: 'pi pi-chart-bar',
                        to: '/user-manual'
                },
             ]
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
