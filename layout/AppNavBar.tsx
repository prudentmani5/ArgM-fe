'use client';
import { MegaMenu } from 'primereact/megamenu';
import { useRouter, usePathname } from 'next/navigation';
import { useContext, useEffect, useRef, useCallback } from 'react';
import { useCurrentUser } from '../hooks/fetchData/useCurrentUser';
import { hasAnyAuthority } from '../app/(AgrM-fe)/usermanagement/types';
import { LayoutContext } from './context/layoutcontext';
import type { Breadcrumb } from '../types/types';

const AppNavBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useCurrentUser();
    const { setBreadcrumbs } = useContext(LayoutContext);
    const navbarRef = useRef<HTMLDivElement>(null);

    // Center any dropdown panel that overflows the viewport
    const centerOverflowPanels = useCallback(() => {
        requestAnimationFrame(() => {
            const container = navbarRef.current;
            if (!container) return;
            const panels = container.querySelectorAll('.p-menuitem-active > .p-megamenu-panel');
            panels.forEach((panel) => {
                const el = panel as HTMLElement;
                const rect = el.getBoundingClientRect();
                if (rect.width === 0) return;
                const vw = window.innerWidth;
                // If panel overflows viewport on either side, center it
                if (rect.left < 0 || rect.right > vw) {
                    const li = el.parentElement;
                    if (!li) return;
                    const liRect = li.getBoundingClientRect();
                    const desiredLeft = Math.max(8, (vw - rect.width) / 2);
                    const newLeft = desiredLeft - liRect.left;
                    el.style.setProperty('left', `${newLeft}px`, 'important');
                    el.style.setProperty('right', 'auto', 'important');
                }
            });
        });
    }, []);

    useEffect(() => {
        const container = navbarRef.current;
        if (!container) return;
        const observer = new MutationObserver(centerOverflowPanels);
        observer.observe(container, { attributes: true, subtree: true, attributeFilter: ['class'] });
        window.addEventListener('resize', centerOverflowPanels);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', centerOverflowPanels);
        };
    }, [centerOverflowPanels]);

    const isVisible = (item: any): boolean => {
        if (item.visible === undefined) return true;
        return item.visible;
    };

    const buildSidebarModel = (appUser: any): any[] => [
           
            {
                label: 'Enregistrement des clients',
                icon: 'pi pi-truck',
                routePrefix: '/moduleCostumerGroup',
                visible: appUser ? hasAnyAuthority(appUser, [
                    'CUSTOMER_GROUP_VIEW', 'CUSTOMER_GROUP_CREATE', 'CUSTOMER_GROUP_UPDATE',
                    'CUSTOMER_GROUP_DELETE', 'CUSTOMER_GROUP_APPROVE', 'CUSTOMER_GROUP_VALIDATE',
                    'CUSTOMER_GROUP_BLACKLIST', 'CUSTOMER_GROUP_REPORT', 'CUSTOMER_GROUP_SETTINGS'
                ]) : false,
                items: [
                    {
                        label: 'Paramètres',
                        visible: appUser ? hasAnyAuthority(appUser, ['CUSTOMER_GROUP_SETTINGS']) : false,
                        items: [
                            { label: 'Paramètres de base', icon: 'pi pi-cog', to: '/moduleCostumerGroup/reference-data' }
                        ]
                    },
                    {
                        label: 'Clients',
                        visible: appUser ? hasAnyAuthority(appUser, ['CUSTOMER_GROUP_VIEW', 'CUSTOMER_GROUP_CREATE', 'CUSTOMER_GROUP_UPDATE', 'CUSTOMER_GROUP_VALIDATE']) : false,
                        items: [
                            { label: 'Enregistrement du client', icon: 'pi pi-user', to: '/moduleCostumerGroup/clients' },
                            { label: 'Enregistrement du groupe', icon: 'pi pi-users', to: '/moduleCostumerGroup/solidarity-groups' }
                        ]
                    },
                    {
                        label: 'Rapports',
                        visible: appUser ? hasAnyAuthority(appUser, ['CUSTOMER_GROUP_REPORT']) : false,
                        items: [
                            { label: 'Rapports Clients et Groupes', icon: 'pi pi-file', to: '/moduleCostumerGroup/reports' }
                        ]
                    }
                ]
            },
            {
                label: 'Produits Finances',
                icon: 'pi pi-money-bill',
                routePrefix: '/financialProducts',
                visible: appUser ? hasAnyAuthority(appUser, [
                    'FINANCIAL_PRODUCT_VIEW', 'FINANCIAL_PRODUCT_CREATE', 'FINANCIAL_PRODUCT_UPDATE',
                    'FINANCIAL_PRODUCT_DELETE', 'FINANCIAL_PRODUCT_APPROVE', 'FINANCIAL_PRODUCT_SETTINGS'
                ]) : false,
                items: [
                    { label: 'Devises', icon: 'pi pi-dollar', to: '/financialProducts/reference-data/currencies', visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false },
                    { label: 'Product Types', icon: 'pi pi-briefcase', to: '/financialProducts/reference-data/loan-product-types', visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false },
                    { label: 'Types de Frais', icon: 'pi pi-money-bill', to: '/financialProducts/reference-data/fee-types', visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false },
                    { label: 'Types de Garanties', icon: 'pi pi-shield', to: '/financialProducts/reference-data/loan-guarantee-types', visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false }, 
                    { label: 'Fréquences de Paiement', icon: 'pi pi-calendar', to: '/financialProducts/reference-data/payment-frequencies', visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false },
                    { label: 'Interest Calculation', icon: 'pi pi-percentage', to: '/financialProducts/reference-data/interest-calculation-methods', visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_SETTINGS']) : false },
                    { label: 'Tous les Produits', icon: 'pi pi-list', to: '/financialProducts/loan-products', visible: appUser ? hasAnyAuthority(appUser, ['FINANCIAL_PRODUCT_VIEW']) : false }
                              ]
            },
            {
                label: 'Operations',
                icon: 'pi pi-wallet',
                routePrefix: '/epargne',
                visible: appUser ? hasAnyAuthority(appUser, [
                    'EPARGNE_VIEW', 'EPARGNE_CREATE', 'EPARGNE_UPDATE', 'EPARGNE_DELETE',
                    'EPARGNE_VALIDATE', 'EPARGNE_CLOSE', 'EPARGNE_REPORT', 'EPARGNE_SETTINGS', 'EPARGNE_DAILY_CLOSING',
                    'EPARGNE_WITHDRAWAL_CREATE', 'EPARGNE_WITHDRAWAL_VERIFY', 'EPARGNE_WITHDRAWAL_SECOND_VERIFY',
                    'EPARGNE_WITHDRAWAL_MANAGER_APPROVE', 'EPARGNE_WITHDRAWAL_DISBURSE', 'EPARGNE_WITHDRAWAL_REJECT',
                    'EPARGNE_DEPOSIT_CREATE', 'EPARGNE_DEPOSIT_COMPLETE', 'EPARGNE_DEPOSIT_CANCEL',
                    'EPARGNE_TERM_DEPOSIT_CREATE', 'EPARGNE_TERM_DEPOSIT_MANAGE', 'EPARGNE_TERM_DEPOSIT_CLOSE',
                    'EPARGNE_COMPULSORY_CREATE', 'EPARGNE_COMPULSORY_RELEASE',
                    'ACCOUNTING_CASH_MANAGEMENT', 'GUICHET_CAISSE', 'CAISSE_VALIDATE_CLOSING', 'CAISSE_ACKNOWLEDGE_RECEIPT'
                ]) : false,
                items: [
                    {
                        label: 'Operations Journalieres',
                        visible: appUser ? hasAnyAuthority(appUser, [
                            'ACCOUNTING_CASH_MANAGEMENT', 'GUICHET_CAISSE', 'CAISSE_VALIDATE_CLOSING', 'CAISSE_ACKNOWLEDGE_RECEIPT',
                            'EPARGNE_DEPOSIT_CREATE', 'EPARGNE_DEPOSIT_COMPLETE',
                            'EPARGNE_WITHDRAWAL_CREATE', 'EPARGNE_WITHDRAWAL_VERIFY', 'EPARGNE_WITHDRAWAL_DISBURSE'
                        ]) : false,
                        items: [
                            { label: 'Gestion de Caisse', icon: 'pi pi-wallet', to: '/epargne/gestion-caisse', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_CASH_MANAGEMENT', 'GUICHET_CAISSE', 'CAISSE_VALIDATE_CLOSING', 'CAISSE_ACKNOWLEDGE_RECEIPT']) : false },
                            { label: 'Bordereaux de Depot', icon: 'pi pi-file-import', to: '/epargne/bordereaux-depot', visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_DEPOSIT_CREATE', 'EPARGNE_DEPOSIT_COMPLETE']) : false },
                            { label: 'Demandes de Retrait', icon: 'pi pi-file-export', to: '/epargne/demandes-retrait', visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_WITHDRAWAL_CREATE', 'EPARGNE_WITHDRAWAL_VERIFY', 'EPARGNE_WITHDRAWAL_DISBURSE']) : false }
                        ]
                    },
                    {
                        label: 'Données de Référence',
                        visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_SETTINGS']) : false,
                        items: [
                            { label: 'Types d\'Opérations', icon: 'pi pi-exchange', to: '/epargne/reference-data/types-operation' },
                            { label: 'Statuts de Livret', icon: 'pi pi-tags', to: '/epargne/reference-data/statuts-livret' },
                            { label: 'Durées de Terme', icon: 'pi pi-clock', to: '/epargne/reference-data/durees-terme' },
                            { label: 'Niveaux d\'Autorisation', icon: 'pi pi-shield', to: '/epargne/reference-data/niveaux-autorisation' }
                        ]
                    },
                    {
                        label: 'Épargne Libre',
                        visible: appUser ? hasAnyAuthority(appUser, [
                            'EPARGNE_VIEW', 'EPARGNE_CREATE',
                            'EPARGNE_WITHDRAWAL_CREATE', 'EPARGNE_WITHDRAWAL_VERIFY', 'EPARGNE_WITHDRAWAL_DISBURSE',
                            'EPARGNE_DEPOSIT_CREATE', 'EPARGNE_DEPOSIT_COMPLETE'
                        ]) : false,
                        items: [
                            { label: 'Comptes d\'Épargne', icon: 'pi pi-wallet', to: '/epargne/compte-epargne' },
                            { label: 'Livrets d\'Épargne', icon: 'pi pi-id-card', to: '/epargne/livret-epargne' },
                            { label: 'Bordereaux de Dépôt', icon: 'pi pi-file-import', to: '/epargne/bordereaux-depot' },
                            { label: 'Demandes de Retrait', icon: 'pi pi-file-export', to: '/epargne/demandes-retrait' },
                            { label: 'Virements', icon: 'pi pi-arrow-right-arrow-left', to: '/epargne/virements' },
                            { label: 'Carnet de Chèques', icon: 'pi pi-book', to: '/epargne/carnet-cheque' },
                            { label: 'Demande de Situation', icon: 'pi pi-file', to: '/epargne/demande-situation' },
                            { label: 'Demande d\'Historique', icon: 'pi pi-history', to: '/epargne/demande-historique' },
                            { label: 'Attestation Non Redevabilité', icon: 'pi pi-verified', to: '/epargne/attestation-non-redevabilite' },
                            { label: 'Attestation d\'Engagement', icon: 'pi pi-shield', to: '/epargne/attestation-engagement' }
                        ]
                    },
                    { label: 'Clôture Journalière', icon: 'pi pi-lock', to: '/epargne/cloture-journaliere', visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_DAILY_CLOSING', 'ACCOUNTING_CASH_MANAGEMENT']) : false },
                    { label: 'Frais de Tenue de Compte', icon: 'pi pi-money-bill', to: '/epargne/frais-tenue-compte', visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_SETTINGS', 'EPARGNE_FEE_EXECUTE']) : false },
                    {
                        label: 'Rapports Épargne',
                        visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_REPORT']) : false,
                        items: [
                            { label: 'Rapport des Livrets', icon: 'pi pi-book', to: '/epargne/rapports/livrets' },
                            { label: 'Rapport des Dépôts', icon: 'pi pi-arrow-down', to: '/epargne/rapports/depots' },
                            { label: 'Rapport des Retraits', icon: 'pi pi-arrow-up', to: '/epargne/rapports/retraits' },
                            { label: 'Consulter historique', icon: 'pi pi-lock', to: '/epargne/rapports/historique-operations' },
                            { label: 'Synthèse Générale', icon: 'pi pi-chart-pie', to: '/epargne/rapports/synthese' },
                            { label: 'Rapport Carnets de Chèques', icon: 'pi pi-credit-card', to: '/epargne/rapports/carnets-cheque' },
                            { label: 'Rapport Demandes Situation', icon: 'pi pi-file', to: '/epargne/rapports/demandes-situation' },
                            { label: 'Rapport Demandes Historique', icon: 'pi pi-history', to: '/epargne/rapports/demandes-historique' },
                            { label: 'Rapport Frais de Tenue', icon: 'pi pi-money-bill', to: '/epargne/rapports/frais-tenue-compte' },
                            { label: 'Rapport Virements', icon: 'pi pi-arrows-h', to: '/epargne/rapports/virements' },
                            { label: 'Rapport Comptes Réguliers', icon: 'pi pi-book', to: '/epargne/rapports/comptes-reguliers' },
                            { label: 'Rapport Comptes DAT', icon: 'pi pi-lock', to: '/epargne/rapports/comptes-dat' }
                        ]
                    }
                ]
            },
            {
                label: 'Crédit',
                icon: 'pi pi-briefcase',
                routePrefix: '/credit',
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
                        label: 'Réf. Demandes',
                        visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_SETTINGS']) : false,
                        items: [
                            { label: 'Statuts de Demande', icon: 'pi pi-tags', to: '/credit/reference-data/statuts-demande' },
                            { label: 'Objets de Crédit', icon: 'pi pi-bookmark', to: '/credit/reference-data/objets-credit' },
                            { label: 'Types de Documents', icon: 'pi pi-file', to: '/credit/reference-data/types-documents' },
                            { label: 'Décisions du Comité', icon: 'pi pi-users', to: '/credit/reference-data/decisions-comite' },
                            { label: 'Modes de Décaissement', icon: 'pi pi-money-bill', to: '/credit/reference-data/modes-decaissement' },
                            { label: 'Règles d\'Allocation', icon: 'pi pi-sliders-h', to: '/credit/reference-data/regles-allocation' },
                            { label: 'Recommandations', icon: 'pi pi-check-circle', to: '/credit/reference-data/recommandations-visite' }
                        ]
                    },
                    {
                        label: 'Réf. Profil Client',
                        visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_SETTINGS']) : false,
                        items: [
                            { label: 'Types de Revenus', icon: 'pi pi-dollar', to: '/credit/reference-data/types-revenus' },
                            { label: 'Types de Dépenses', icon: 'pi pi-credit-card', to: '/credit/reference-data/types-depenses' },
                            { label: 'Types de Garanties', icon: 'pi pi-shield', to: '/credit/reference-data/types-garanties' },
                            { label: 'Types d\'Emploi', icon: 'pi pi-id-card', to: '/credit/reference-data/types-emploi' },
                            { label: 'Lieux de Visite', icon: 'pi pi-map-marker', to: '/credit/reference-data/lieux-visite' },
                            { label: 'Statuts de Logement', icon: 'pi pi-home', to: '/credit/reference-data/statuts-logement' }
                        ]
                    },
                    {
                        label: 'Risque & Scoring',
                        visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_SETTINGS']) : false,
                        items: [
                            { label: 'Étapes de Recouvrement', icon: 'pi pi-sitemap', to: '/credit/reference-data/etapes-recouvrement' },
                            { label: 'Actions de Recouvrement', icon: 'pi pi-bolt', to: '/credit/reference-data/actions-recouvrement' },
                            { label: 'Classifications de Prêt', icon: 'pi pi-chart-bar', to: '/credit/reference-data/classifications-pret' },
                            { label: 'Niveaux de Risque', icon: 'pi pi-exclamation-triangle', to: '/credit/reference-data/niveaux-risque' },
                            { label: 'Catégories de Scoring', icon: 'pi pi-star', to: '/credit/reference-data/categories-scoring' },
                            { label: 'Règles de Scoring', icon: 'pi pi-cog', to: '/credit/reference-data/regles-scoring' }
                        ]
                    },
                    {
                        label: 'Décaissements',
                        visible: appUser ? hasAnyAuthority(appUser, [
                            'CREDIT_DISBURSE', 'CREDIT_DISBURSE_CREATE', 'CREDIT_DISBURSE_EXECUTE', 'CREDIT_DISBURSE_CANCEL'
                        ]) : false,
                        items: [
                            { label: 'Demandes Approuvées', icon: 'pi pi-check', to: '/credit/decaissements/approuves' },
                            { label: 'Décaissements Effectués', icon: 'pi pi-check-circle', to: '/credit/decaissements/effectues' }
                        ]
                    },
                    {
                        label: 'Rapports Crédit',
                        visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_REPORT']) : false,
                        items: [
                            { label: 'Rapport des Demandes', icon: 'pi pi-file', to: '/credit/rapports/demandes' },
                            { label: 'Rapport des Analyses', icon: 'pi pi-chart-line', to: '/credit/rapports/analyses' },
                            { label: 'Rapport des Visites', icon: 'pi pi-map', to: '/credit/rapports/visites' },
                            { label: 'Rapport des Décisions', icon: 'pi pi-users', to: '/credit/rapports/decisions' },
                            { label: 'Rapport des Décaissements', icon: 'pi pi-money-bill', to: '/credit/rapports/decaissements' },
                            { label: 'Synthèse du Portefeuille', icon: 'pi pi-chart-pie', to: '/credit/rapports/synthese' }
                        ]
                    },
                    {
                        label: 'Gestion des Demandes',
                        visible: appUser ? hasAnyAuthority(appUser, [
                            'CREDIT_VIEW', 'CREDIT_CREATE',
                            'CREDIT_APPLICATION_CREATE', 'CREDIT_APPLICATION_UPDATE', 'CREDIT_APPLICATION_CHANGE_STATUS'
                        ]) : false,
                        items: [
                            { label: 'Toutes les Demandes', icon: 'pi pi-list', to: '/credit/demandes' },
                            { label: 'Nouvelle Demande', icon: 'pi pi-plus-circle', to: '/credit/demandes?mode=new' },
                            { label: 'En Attente d\'Analyse', icon: 'pi pi-clock', to: '/credit/demandes?status=EN_ATTENTE_ANALYSE' },
                            { label: 'En Cours de Visite', icon: 'pi pi-map', to: '/credit/demandes?status=EN_VISITE' },
                            { label: 'En Comité', icon: 'pi pi-users', to: '/credit/demandes?status=EN_COMITE' }
                        ]
                    },
                    {
                        label: 'Analyses Financières',
                        visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_ANALYZE']) : false,
                        items: [
                            { label: 'Analyses en Cours', icon: 'pi pi-spinner', to: '/credit/analyses' }
                        ]
                    },
                    {
                        label: 'Actions',
                        visible: appUser ? hasAnyAuthority(appUser, ['CREDIT_DAILY_CLOSING']) : false,
                        items: [
                            { label: 'Clôture Journalière', icon: 'pi pi-lock', to: '/credit/cloture-journaliere' }
                        ]
                    }
                ]
            },
            {
                label: 'Remboursement',
                icon: 'pi pi-replay',
                routePrefix: '/remboursement',
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
                        visible: appUser ? hasAnyAuthority(appUser, ['REMBOURSEMENT_SETTINGS']) : false,
                        items: [
                            { label: 'Modes de Remboursement', icon: 'pi pi-credit-card', to: '/remboursement/reference-data/modes-remboursement' },
                            { label: 'Étapes de Recouvrement', icon: 'pi pi-sitemap', to: '/remboursement/reference-data/etapes-recouvrement' },
                            { label: 'Classifications de Retard', icon: 'pi pi-exclamation-triangle', to: '/remboursement/reference-data/classifications-retard' },
                            { label: 'Config. Pénalités', icon: 'pi pi-percentage', to: '/remboursement/reference-data/configurations-penalites' },
                            { label: 'Règles de Rappel', icon: 'pi pi-bell', to: '/remboursement/reference-data/regles-rappel' },
                            { label: 'Config. Restructuration', icon: 'pi pi-refresh', to: '/remboursement/reference-data/configurations-restructuration' },
                            { label: 'Seuils de Contentieux', icon: 'pi pi-exclamation-circle', to: '/remboursement/reference-data/seuils-contentieux' }
                        ]
                    },
                    {
                        label: 'Échéanciers',
                        visible: appUser ? hasAnyAuthority(appUser, ['REMBOURSEMENT_VIEW']) : false,
                        items: [
                            { label: 'Gestion des Échéanciers', icon: 'pi pi-list', to: '/remboursement/echeancier' }
                        ]
                    },
                    {
                        label: 'Paiements',
                        visible: appUser ? hasAnyAuthority(appUser, [
                            'REMBOURSEMENT_VIEW', 'REMBOURSEMENT_CREATE', 'REMBOURSEMENT_VALIDATE',
                            'REMBOURSEMENT_PAYMENT_CREATE', 'REMBOURSEMENT_PAYMENT_PROCESS',
                            'REMBOURSEMENT_EARLY_CREATE', 'REMBOURSEMENT_EARLY_APPROVE', 'REMBOURSEMENT_EARLY_PROCESS'
                        ]) : false,
                        items: [
                            { label: 'Saisie des Paiements', icon: 'pi pi-plus-circle', to: '/remboursement/paiements' },
                            { label: 'Remboursement Anticipé', icon: 'pi pi-forward', to: '/remboursement/remboursement-anticipe' },
                            { label: 'Prélèvement Automatique', icon: 'pi pi-sync', to: '/remboursement/prelevement-automatique' },
                            { label: 'Calcul Auto. Pénalités', icon: 'pi pi-calculator', to: '/remboursement/calcul-penalites' }
                        ]
                    },
                    {
                        label: 'Rapports',
                        visible: appUser ? hasAnyAuthority(appUser, ['REMBOURSEMENT_REPORT']) : false,
                        items: [
                            { label: 'Rapport des Paiements', icon: 'pi pi-money-bill', to: '/remboursement/rapports/paiements' },
                            { label: 'Rapport des Retards', icon: 'pi pi-exclamation-triangle', to: '/remboursement/rapports/retards' },
                            { label: 'Rapport Recouvrement', icon: 'pi pi-users', to: '/remboursement/rapports/recouvrement' },
                            { label: 'Rapport Contentieux', icon: 'pi pi-briefcase', to: '/remboursement/rapports/contentieux' },
                            { label: 'Synthèse', icon: 'pi pi-chart-pie', to: '/remboursement/rapports/synthese' },
                            { label: 'Rapport Échéanciers', icon: 'pi pi-calendar', to: '/remboursement/rapports/echeanciers' },
                            { label: 'Rapport Remb. Anticipé', icon: 'pi pi-fast-forward', to: '/remboursement/rapports/remboursement-anticipe' },
                            { label: 'Rapport Pénalités', icon: 'pi pi-calculator', to: '/remboursement/rapports/penalites' },
                            { label: 'Rapport Prélèvements', icon: 'pi pi-sync', to: '/remboursement/rapports/prelevements-automatiques' },
                            { label: 'Rapport Restructurations', icon: 'pi pi-refresh', to: '/remboursement/rapports/restructurations' }
                        ]
                    },
                    {
                        label: 'Recouvrement',
                        visible: appUser ? hasAnyAuthority(appUser, [
                            'REMBOURSEMENT_RECOVERY', 'REMBOURSEMENT_RECOVERY_CREATE', 'REMBOURSEMENT_RECOVERY_ASSIGN',
                            'REMBOURSEMENT_RECOVERY_ESCALATE', 'REMBOURSEMENT_RECOVERY_CLOSE'
                        ]) : false,
                        items: [
                            { label: 'Dossiers de Recouvrement', icon: 'pi pi-folder', to: '/remboursement/recouvrement' },
                            { label: 'Dossiers Contentieux', icon: 'pi pi-briefcase', to: '/remboursement/contentieux' }
                        ]
                    },
                    {
                        label: 'Restructuration',
                        visible: appUser ? hasAnyAuthority(appUser, [
                            'REMBOURSEMENT_RESTRUCTURE', 'REMBOURSEMENT_RESTRUCTURE_CREATE', 'REMBOURSEMENT_RESTRUCTURE_APPROVE'
                        ]) : false,
                        items: [
                            { label: 'Demandes de Restructuration', icon: 'pi pi-refresh', to: '/remboursement/restructuration' }
                        ]
                    },
                    { label: 'Clôture Journalière', icon: 'pi pi-lock', to: '/remboursement/cloture-journaliere', visible: appUser ? hasAnyAuthority(appUser, ['REMBOURSEMENT_DAILY_CLOSING']) : false }
                ]
            },
            {
                label: 'Comptabilité',
                icon: 'pi pi-calculator',
                routePrefix: '/comptability',
                visible: appUser ? hasAnyAuthority(appUser, [
                    'ACCOUNTING_VIEW', 'ACCOUNTING_ENTRY_CREATE', 'ACCOUNTING_ENTRY_VALIDATE',
                    'ACCOUNTING_DELETE', 'ACCOUNTING_DAILY_CLOSING', 'ACCOUNTING_SETTINGS',
                    'ACCOUNTING_CLOSING_EXECUTE', 'ACCOUNTING_CLOSING_REVERSE',
                    'ACCOUNTING_MONTHLY_CLOSING', 'ACCOUNTING_ANNUAL_CLOSING', 'ACCOUNTING_CASH_MANAGEMENT',
                    'ACCOUNTING_REPORT_VIEW', 'ACCOUNTING_REPORT_EXPORT',
                    'ACCOUNTING_INTERNAL_ACCOUNTS', 'ACCOUNTING_INTERNAL_DEPOT', 'ACCOUNTING_INTERNAL_RETRAIT',
                    'ACCOUNTING_INTERNAL_TRANSFERT', 'ACCOUNTING_INTERNAL_TOGGLE_STATUS',
                    'ACCOUNTING_INTERNAL_VALIDATE_DEPOT', 'ACCOUNTING_INTERNAL_VALIDATE_RETRAIT', 'ACCOUNTING_INTERNAL_VALIDATE_TRANSFERT'
                ]) : false,
                items: [
                    {
                        label: 'Saisie',
                        visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW', 'ACCOUNTING_ENTRY_CREATE', 'ACCOUNTING_SETTINGS']) : false,
                        items: [
                            { label: 'Taux de change', icon: 'pi pi-dollar', to: '/comptability/settings/tauxChange', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_SETTINGS']) : false },
                            { label: 'Plan comptable SYSCOHADA', icon: 'pi pi-list', to: '/comptability/compte', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW']) : false },
                            { label: 'Journaux', icon: 'pi pi-book', to: '/comptability/journal', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW']) : false },
                            { label: 'Exercice', icon: 'pi pi-calendar', to: '/comptability/exercice', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW', 'ACCOUNTING_ENTRY_CREATE']) : false },
                            { label: 'Périodes Comptables', icon: 'pi pi-calendar-times', to: '/comptability/periodes', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW']) : false },
                            { label: 'Brouillard', icon: 'pi pi-file-edit', to: '/comptability/brouillard', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW', 'ACCOUNTING_ENTRY_CREATE']) : false },
                            { label: 'Écritures', icon: 'pi pi-pencil', to: '/comptability/ecriture', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_ENTRY_CREATE']) : false },
                            { label: 'Contrôle d\'intégrité', icon: 'pi pi-check-circle', to: '/comptability/control', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_VIEW']) : false }
                        ]
                    },
                    {
                        label: 'Clôtures',
                        visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_DAILY_CLOSING', 'ACCOUNTING_CLOSING_EXECUTE', 'ACCOUNTING_CLOSING_REVERSE', 'ACCOUNTING_MONTHLY_CLOSING', 'ACCOUNTING_ANNUAL_CLOSING']) : false,
                        items: [
                            { label: 'Clôture Journalière', icon: 'pi pi-lock', to: '/comptability/cloture-journaliere', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_DAILY_CLOSING', 'ACCOUNTING_CLOSING_EXECUTE', 'ACCOUNTING_CLOSING_REVERSE']) : false },
                            { label: 'Clôture Mensuelle', icon: 'pi pi-calendar-times', to: '/comptability/cloture-mensuelle', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_MONTHLY_CLOSING']) : false },
                            { label: 'Clôture Annuelle', icon: 'pi pi-calendar-minus', to: '/comptability/cloture-annuelle', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_ANNUAL_CLOSING']) : false }
                        ]
                    },
                    { label: 'Gestion de Caisse', icon: 'pi pi-wallet', to: '/comptability/caisse', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_CASH_MANAGEMENT']) : false },
                    { label: 'Comptes Internes', icon: 'pi pi-building', to: '/comptability/comptes-internes', visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_INTERNAL_ACCOUNTS', 'ACCOUNTING_INTERNAL_DEPOT', 'ACCOUNTING_INTERNAL_RETRAIT', 'ACCOUNTING_INTERNAL_TRANSFERT', 'ACCOUNTING_INTERNAL_TOGGLE_STATUS', 'ACCOUNTING_INTERNAL_VALIDATE_DEPOT', 'ACCOUNTING_INTERNAL_VALIDATE_RETRAIT', 'ACCOUNTING_INTERNAL_VALIDATE_TRANSFERT']) : false },
                    { label: 'Frais de Tenue de Compte', icon: 'pi pi-money-bill', to: '/epargne/frais-tenue-compte', visible: appUser ? hasAnyAuthority(appUser, ['EPARGNE_SETTINGS', 'EPARGNE_FEE_EXECUTE']) : false },
                    {
                        label: 'Rapports',
                        visible: appUser ? hasAnyAuthority(appUser, ['ACCOUNTING_REPORT_VIEW', 'ACCOUNTING_REPORT_EXPORT']) : false,
                        items: [
                            { label: 'Consultation compte', icon: 'pi pi-search', to: '/comptability/rapportcompte' },
                            { label: 'Édition journal', icon: 'pi pi-folder-plus', to: '/comptability/editionJournal' },
                            { label: 'Grand livre', icon: 'pi pi-book', to: '/comptability/grandlivre' },
                            { label: 'Balance', icon: 'pi pi-gauge', to: '/comptability/balance' },
                            { label: 'Bilan', icon: 'pi pi-file', to: '/comptability/bilan' },
                            { label: 'Compte de résultat', icon: 'pi pi-calculator', to: '/comptability/compteResultat' },
                            { label: 'Flux de trésorerie', icon: 'pi pi-credit-card', to: '/comptability/fluxTresorerie' },
                            { label: 'Variation des capitaux', icon: 'pi pi-chart-line', to: '/comptability/variationCapitaux' }
                        ]
                    }
                ]
            },
            {
                label: 'Rapprochement',
                icon: 'pi pi-check-square',
                routePrefix: '/rapprochement',
                visible: appUser ? hasAnyAuthority(appUser, [
                    'RAPPROCHEMENT_VIEW', 'RAPPROCHEMENT_CREATE', 'RAPPROCHEMENT_UPDATE',
                    'RAPPROCHEMENT_DELETE', 'RAPPROCHEMENT_VALIDATE', 'RAPPROCHEMENT_APPROVE',
                    'RAPPROCHEMENT_RECONCILE', 'RAPPROCHEMENT_REPORT',
                    'RAPPROCHEMENT_AUTO_RECONCILE', 'RAPPROCHEMENT_MANUAL_MATCH'
                ]) : false,
                items: [
                    { label: 'Tableau de Bord', icon: 'pi pi-th-large', to: '/rapprochement', visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_VIEW']) : false },
                    { label: 'Rapprochement Bancaire', icon: 'pi pi-building', to: '/rapprochement/rapprochements', visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_RECONCILE', 'RAPPROCHEMENT_AUTO_RECONCILE', 'RAPPROCHEMENT_MANUAL_MATCH', 'RAPPROCHEMENT_VALIDATE', 'RAPPROCHEMENT_APPROVE']) : false },
                    { label: 'Relevés Bancaires', icon: 'pi pi-file-import', to: '/rapprochement/releves', visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_CREATE']) : false },
                    { label: 'Rapprochement Caisse', icon: 'pi pi-wallet', to: '/rapprochement/rapprochement-caisse', visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_VIEW']) : false },
                    { label: 'Portefeuille Crédits', icon: 'pi pi-briefcase', to: '/rapprochement/rapprochement-credits', visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_VIEW']) : false },
                    { label: 'Dépôts Épargne', icon: 'pi pi-money-bill', to: '/rapprochement/rapprochement-depots', visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_VIEW']) : false },
                    { label: 'Gestion des Écarts', icon: 'pi pi-exclamation-triangle', to: '/rapprochement/ecarts', visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_VIEW']) : false },
                    { label: 'Rapports', icon: 'pi pi-print', to: '/rapprochement/rapports', visible: appUser ? hasAnyAuthority(appUser, ['RAPPROCHEMENT_REPORT']) : false }
                ]
            },
            {
                label: 'Dépenses',
                icon: 'pi pi-wallet',
                routePrefix: '/depenses',
                visible: appUser ? hasAnyAuthority(appUser, [
                    'DEPENSE_VIEW', 'DEPENSE_CREATE', 'DEPENSE_UPDATE', 'DEPENSE_DELETE',
                    'DEPENSE_APPROVE_N1', 'DEPENSE_APPROVE_N2', 'DEPENSE_APPROVE_N3',
                    'DEPENSE_PAY', 'DEPENSE_JUSTIFY', 'DEPENSE_CLOSE',
                    'DEPENSE_PETITE_CAISSE', 'DEPENSE_BUDGET', 'DEPENSE_REPORT', 'DEPENSE_SETTINGS'
                ]) : false,
                items: [


                     {
                        label: 'Données de Référence',
                        visible: appUser ? hasAnyAuthority(appUser, ['DEPENSE_SETTINGS']) : false,
                        items: [
                            { label: 'Catégories de Dépenses', icon: 'pi pi-tags', to: '/depenses/reference-data/categories-depense' },
                            { label: 'Niveaux de Priorité', icon: 'pi pi-flag', to: '/depenses/reference-data/niveaux-priorite' },
                            { label: 'Modes de Paiement', icon: 'pi pi-credit-card', to: '/depenses/reference-data/modes-paiement' },
                            { label: 'Seuils d\'Approbation', icon: 'pi pi-sliders-h', to: '/depenses/reference-data/seuils-approbation' },
                            { label: 'Fournisseurs', icon: 'pi pi-users', to: '/depenses/reference-data/fournisseurs' }
                        ]
                    },
                    {
                        label: 'Gestion des Dépenses',
                        visible: appUser ? hasAnyAuthority(appUser, ['DEPENSE_VIEW', 'DEPENSE_CREATE', 'DEPENSE_UPDATE', 'DEPENSE_APPROVE_N1', 'DEPENSE_APPROVE_N2', 'DEPENSE_APPROVE_N3', 'DEPENSE_PAY', 'DEPENSE_JUSTIFY', 'DEPENSE_CLOSE']) : false,
                        items: [
                            { label: 'Demandes de Dépenses', icon: 'pi pi-file', to: '/depenses/demandes' },
                            { label: 'Approbations', icon: 'pi pi-check-square', to: '/depenses/approbations' },
                            { label: 'Paiements', icon: 'pi pi-money-bill', to: '/depenses/paiements' },
                            { label: 'Budgets', icon: 'pi pi-chart-bar', to: '/depenses/budgets' },
                            { label: 'Petite Caisse', icon: 'pi pi-wallet', to: '/depenses/petite-caisse' }
                        ]
                    },
                   
                    {
                        label: 'Rapports & Analyses',
                        visible: appUser ? hasAnyAuthority(appUser, ['DEPENSE_REPORT']) : false,
                        items: [
                            { label: 'Rapports Dépenses', icon: 'pi pi-chart-pie', to: '/depenses/rapports' }
                        ]
                    }
                ]
            },
            {
                label: 'Administration',
                icon: 'pi pi-cog',
                routePrefix: ['/usermanagement', '/tracking'],
                visible: appUser ? hasAnyAuthority(appUser, ['ADMIN', 'USER_VIEW', 'USER_CREATE', 'TRACKING_VIEW']) : false,
                items: [
                    { label: 'Créer un Utilisateur', icon: 'pi pi-user-plus', to: '/usermanagement/create-user', visible: appUser ? hasAnyAuthority(appUser, ['ADMIN', 'USER_CREATE']) : false },
                    { label: 'Gestion des utilisateurs', icon: 'pi pi-users', to: '/usermanagement', visible: appUser ? hasAnyAuthority(appUser, ['ADMIN', 'USER_VIEW']) : false },
                    { label: 'Journal d\'Audit', icon: 'pi pi-history', to: '/tracking', visible: appUser ? hasAnyAuthority(appUser, ['TRACKING_VIEW']) : false }
                ]
            },
             {
                label: 'Tableaux de Bord',
                icon: 'pi pi-chart-bar',
                routePrefix: '/dashbord',
                visible: appUser ? hasAnyAuthority(appUser, ['DASHBOARD_DG_VIEW', 'DASHBOARD_CREDIT_OPS_VIEW', 'DASHBOARD_ACCOUNTING_VIEW', 'DASHBOARD_BRANCH_MANAGER_VIEW']) : false,
                items: [
                    {
                        label: 'Tableaux de Bord',
                        items: [
                            { label: 'Direction Générale', icon: 'pi pi-building', to: '/dashbord/dg', visible: appUser ? hasAnyAuthority(appUser, ['DASHBOARD_DG_VIEW']) : false },
                            { label: 'Chef d\'Agence', icon: 'pi pi-home', to: '/dashbord/chef-agence', visible: appUser ? hasAnyAuthority(appUser, ['DASHBOARD_BRANCH_MANAGER_VIEW']) : false },
                            { label: 'Opérations Crédit', icon: 'pi pi-briefcase', to: '/dashbord/credit-ops', visible: appUser ? hasAnyAuthority(appUser, ['DASHBOARD_CREDIT_OPS_VIEW']) : false },
                            { label: 'Comptabilité', icon: 'pi pi-calculator', to: '/dashbord/comptable', visible: appUser ? hasAnyAuthority(appUser, ['DASHBOARD_ACCOUNTING_VIEW']) : false }
                        ]
                    }
                ]
            },
            {
                label: 'Manuel',
                icon: 'pi pi-book',
                routePrefix: '/user-manual',
                items: [
                    { label: 'Manuel Utilisateur', icon: 'pi pi-file', to: '/user-manual' }
                ]
            }
    ];

    const buildMegaMenuModel = () => {
        const appUser = user;

        const toLeaf = (item: any) => ({
            label: item.label,
            icon: item.icon,
            command: item.to ? () => router.push(item.to) : undefined,
        });

        const isModuleActive = (module: any): boolean => {
            if (module.routeExact) {
                const exactRoutes = Array.isArray(module.routeExact) ? module.routeExact : [module.routeExact];
                if (exactRoutes.some((r: string) => pathname.startsWith(r))) return true;
            }
            if (module.routePrefix) {
                const prefixes = Array.isArray(module.routePrefix) ? module.routePrefix : [module.routePrefix];
                return prefixes.some((p: string) => pathname.startsWith(p));
            }
            return false;
        };

        const sidebarModel = buildSidebarModel(appUser);
        const BASE_MAX_COLUMNS = 4;

        const visibleModules = sidebarModel.filter(isVisible);
        const totalVisible = visibleModules.length;

        return visibleModules.map((module, index) => {
            const active = isModuleActive(module);
            const alignRight = index >= totalVisible - 3;

            if (!module.items || module.items.length === 0) {
                const classes = [active ? 'active-module' : '', alignRight ? 'panel-right' : ''].filter(Boolean).join(' ');
                return { label: module.label, icon: module.icon, className: classes };
            }

            const visibleChildren = module.items.filter(isVisible);
            const sections = visibleChildren.filter((c: any) => c.items && c.items.length > 0);
            const standaloneLeaves = visibleChildren.filter((c: any) => !c.items && c.to);

            // Build all section groups
            const allGroups: any[] = [];

            sections.forEach((section: any) => {
                const visibleLeaves = (section.items || []).filter(isVisible);
                if (visibleLeaves.length > 0) {
                    allGroups.push({ label: section.label, items: visibleLeaves.map(toLeaf) });
                }
            });

            if (standaloneLeaves.length > 0) {
                allGroups.push({ label: 'Actions', items: standaloneLeaves.map(toLeaf) });
            }

            if (allGroups.length === 0) return null;

            // Dynamic max columns: use 5 for modules with many groups
            const MAX_COLUMNS = allGroups.length > 6 ? 5 : BASE_MAX_COLUMNS;

            // Smart distribution: pair small adjacent groups together
            let columns: any[][];
            if (allGroups.length <= MAX_COLUMNS) {
                columns = allGroups.map(g => [g]);
            } else {
                columns = [];
                let i = 0;
                const excess = allGroups.length - MAX_COLUMNS;
                let merges = 0;
                while (i < allGroups.length) {
                    const curr = allGroups[i];
                    const next = i + 1 < allGroups.length ? allGroups[i + 1] : null;
                    const currSize = curr.items?.length || 0;
                    const nextSize = next?.items?.length || 0;
                    if (merges < excess && currSize <= 5 && next && nextSize <= 6) {
                        columns.push([curr, next]);
                        i += 2;
                        merges++;
                    } else {
                        columns.push([curr]);
                        i++;
                    }
                }
                // If still too many columns, merge last ones
                while (columns.length > MAX_COLUMNS) {
                    const last = columns.pop()!;
                    columns[columns.length - 1].push(...last);
                }
            }

            const isWide = allGroups.length > MAX_COLUMNS;
            const classes = [
                active ? 'active-module' : '',
                isWide ? 'wide-panel' : (alignRight ? 'panel-right' : '')
            ].filter(Boolean).join(' ');

            return { label: module.label, icon: module.icon, items: columns, className: classes };
        }).filter((item): item is NonNullable<typeof item> => item !== null);
    };

    const model = buildMegaMenuModel();

    // Generate breadcrumbs from the menu model
    useEffect(() => {
        const breadcrumbs: Breadcrumb[] = [];
        const generateBreadcrumbs = (item: any, labels: string[] = []) => {
            const { label, to, items } = item;
            if (label) labels.push(label);
            if (items) {
                items.forEach((child: any) => generateBreadcrumbs(child, labels.slice()));
            }
            if (to) breadcrumbs.push({ labels, to });
        };

        const appUser = user;
        const isVisible = (item: any): boolean => item.visible === undefined ? true : item.visible;

        // Rebuild sidebarModel for breadcrumb generation
        const allModules = buildSidebarModel(appUser);
        allModules.filter(isVisible).forEach((mod: any) => generateBreadcrumbs(mod));
        setBreadcrumbs(breadcrumbs);
    }, [user]);

    return (
        <div className="layout-navbar" ref={navbarRef}>
            <MegaMenu model={model} className="layout-megamenu" />
        </div>
    );
};

export default AppNavBar;
