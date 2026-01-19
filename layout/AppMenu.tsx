import AppSubMenu from './AppSubMenu';
import type { MenuModel } from '../types/types';
import { AppMenuItem } from '../types/layout';
import './menu-overrides.css';
import React from 'react';
import { LayoutContext } from './context/layoutcontext';
import { useCurrentUser } from '../hooks/fetchData/useCurrentUser';
import { hasAnyAuthority, hasAuthority } from '../app/(gps-fe)/usermanagement/types';

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
            label: 'Gestion des Entrées',
            icon: 'pi pi-truck',
            visible: appUser ? hasAnyAuthority(appUser, [
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
            ]) : false,
            items: [
                {
                    label: ' Paramétres',
                    icon: 'pi pi-wallet',
                    visible: appUser ? hasAnyAuthority(appUser, [
                        'ENTREE_SETTINGS_CREATE',
                        'ENTREE_SETTINGS_VIEW',
                        'ENTREE_SETTINGS_UPDATE'
                    ]) : false,
                    items: [
                        {
                            label: 'Importateur',
                            icon: 'pi pi-truck',
                            to: '/settings/importateur',
                            className: 'menu-item'
                        },
                        {
                            label: 'Agence en douane',
                            icon: 'pi pi-building',
                            to: '/settings/agence',
                            className: 'menu-item'
                        },
                        {
                            label: 'Dossier',
                            icon: 'pi pi-folder',
                            to: '/settings/dossier',
                            className: 'menu-item'
                        },
                        {
                            label: 'Engin',
                            icon: 'pi pi-sliders-h',
                            to: '/settings/engin',
                            className: 'menu-item'
                        },
                        {
                            label: 'Entrepot',
                            icon: 'pi pi-building',
                            to: '/settings/entrepot',
                            className: 'menu-item'
                        },
                        {
                            label: 'Exportateur',
                            icon: 'pi pi-send',
                            to: '/settings/exportateur',
                            className: 'menu-item'
                        },
                        {
                            label: 'Provenance',
                            icon: 'pi pi-directions',
                            to: '/settings/provenance',
                            className: 'menu-item'
                        },
                        {
                            label: 'Armateur',
                            icon: 'pi pi-megaphone',
                            to: '/settings/armateur',
                            className: 'menu-item'
                        },
                        {
                            label: 'Barge',
                            icon: 'pi pi-truck',
                            to: '/settings/barge',
                            className: 'menu-item'
                        },
                        {
                            label: 'Marchandise',
                            icon: 'pi pi-cart-plus',
                            to: '/settings/marchandise',
                            className: 'menu-item'
                        },
                        {
                            label: 'Service',
                            icon: 'pi pi-cart-plus',
                            to: '/settings/facService',
                            className: 'menu-item'
                        },
                        {
                            label: 'Redevance Informatique',
                            icon: 'pi pi-cart-plus',
                            to: '/settings/redevanceInformatique',
                            className: 'menu-item'
                        },

                    ]
                },

                {
                    label: 'Gestion des entrées',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Saisie des entrées véhicules',
                        icon: 'pi pi-chart-bar',
                        to: '/entryMagasin/vehicule',
                        visible: appUser ? hasAnyAuthority(appUser, [
                            'ENTREE_VEHICULE_CREATE',
                            'ENTREE_VEHICULE_UPDATE',
                            'ENTREE_VEHICULE_CONSULTATION'
                        ]) : false
                    }, {
                        label: 'Entrée magasin',
                        icon: 'pi pi-wallet',
                        to: '/storage/entreeStock',
                        visible: appUser ? hasAnyAuthority(appUser, [
                            'ENTREE_MAGASIN_CREATE',
                            'ENTREE_MAGASIN_UPDATE',
                            'ENTREE_MAGASIN_CONSULTATION'
                        ]) : false
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


        /*   
           {
           label: 'Paramètres généraux',
           icon: 'pi pi-cog',
           className: 'layout-root-submenulist',
          
           items: [
               {
                   label: 'Categories et classes',
                   icon: 'pi pi-cart-plus',
                   className: 'nested-submenu', // Ajout d'une classe pour les sous-menus imbri, // Ajoutez une classe spécifiqu   
                   items: [{
                       label: 'Classe tarif',
                       icon: 'pi pi-cart-plus',
                       to: '/settings/facClasse'
                   }, {
                       label: 'Catégorie classe',
                       icon: 'pi pi-cart-plus',
                       to: '/settings/classeCategory'
                   }, {
                       label: 'Classe Compte Marchandise',
                       icon: 'pi pi-cart-plus',
                       to: '/settings/classeMarchandise'
                   }, {
                       label: 'Catégorie emballage',
                       icon: 'pi pi-inbox',
                       to: '/settings/emballage'
                   },
   
                   ]
               },
   
   
               {
                   label: 'Tarif des Marchandises',
                   icon: 'pi pi-dollar',
                   className: 'nested-submenu', // Ajout d'une classe pour les sous-menus imbriqués
                   items: [
   
                       {
                           label: 'Tarif Magasin',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixMagasin'
                       },
                       {
                           label: 'Tarif Marchandise',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixMarchandiseMagasin'
                       },
                       {
                           label: 'Tarif Marchandise Transit',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixMarchandiseTransit'
                       },
                       {
                           label: 'Tarif Prestation',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixPrestation'
   
                       },
                       {
                           label: 'Tarif Colis',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixColis'
                       }, {
                           label: 'Tarif service tonnage',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixServiceTonnage'
   
                       }
   
                   ]
               },
   
               {
                   label: 'Autres Tarifs',
                   icon: 'pi pi-dollar',
                   className: 'nested-submenu', // Ajout d'une classe pour les sous-menus imbriqués
                   items: [
                       {
                           label: 'Tarif Abonnement',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixAbonnement'
                       },
                       {
                           label: 'Tarif Accostage',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixAccostage'
                       },
                       {
                           label: 'Tarif Arrimage',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixArrimage'
                       },
                       {
                           label: 'Tarif Conteneur',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixConteneur'
                       }
                       ,
   
                       {
                           label: 'Tarif surtaxe',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixSurtaxe'
                       },
                       {
                           label: 'Tarif Vehicule',
                           icon: 'pi pi-tag',
                           to: '/settings/tarif/prixVehicule'
   
                       }
   
   
                   ]
               }
               ,
   
   
               {
                   label: 'Autres parametres',
                   icon: 'pi pi-folder',
                   className: 'nested-submenu large-submenu', // Classes supplémentaires
                   items: [
                       
                       {
                           label: 'Type de conditionnement',
                           icon: 'pi pi-cart-plus',
                           to: '/settings/typePackaging',
                           className: 'menu-item'
                       },
                       {
                           label: 'Importateur',
                           icon: 'pi pi-truck',
                           to: '/settings/importateur',
                           className: 'menu-item'
                       },
                       {
                           label: 'Agence en douane',
                           icon: 'pi pi-building',
                           to: '/settings/agence',
                           className: 'menu-item'
                       },
                       {
                           label: 'Banque',
                           icon: 'pi pi-wallet',
                           to: '/settings/banque',
                           className: 'menu-item'
                       },
   
                        {
                           label: 'Compte Banquaire',
                           icon: 'pi pi-wallet',
                           to: '/settings/compteBanquaire',
                           className: 'menu-item'
                       },
                        {
                           label: 'Divise Caisse',
                           icon: 'pi pi-wallet',
                           to: '/settings/deviseCaisse',
                           className: 'menu-item'
                       },
                       {
                           label: 'Dossier',
                           icon: 'pi pi-folder',
                           to: '/settings/dossier',
                           className: 'menu-item'
                       },
                       {
                           label: 'Engin',
                           icon: 'pi pi-sliders-h',
                           to: '/settings/engin',
                           className: 'menu-item'
                       },
                       {
                           label: 'Entrepot',
                           icon: 'pi pi-building',
                           to: '/settings/entrepot',
                           className: 'menu-item'
                       },
                       {
                           label: 'Exportateur',
                           icon: 'pi pi-send',
                           to: '/settings/exportateur',
                           className: 'menu-item'
                       },
                       {
                           label: 'Provenance',
                           icon: 'pi pi-directions',
                           to: '/settings/provenance',
                           className: 'menu-item'
                       }
                       ,
                       {
                           label: 'Caissier',
                           icon: 'pi pi-wallet',
                           to: '/settings/caissier',
                           className: 'menu-item'
                       }
                        ,
                       {
                           label: 'Importateur à Crédit',
                           icon: 'pi pi-wallet',
                           to: '/settings/importateurCredit',
                           className: 'menu-item'
                       }
   
                       
                   ]
   
   
               }
   
           ]
       },
    */

        {
            label: 'Gestion des entrepôts',
            icon: 'pi pi-home',
            visible: appUser ? hasAnyAuthority(appUser, [
                'PONT_BASCULE_CREATE',
                'PONT_BASCULE_UPDATE',
                'PONT_BASCULE_CONSULTATION',
                'STORAGE_EXIT_WITH_RSP',
                'STORAGE_EXIT_WITH_GPS',
                'PORT_EXIT_WITH_RSP',
                'PORT_EXIT_WITH_GPS'
            ]) : false,
            items: [

                {
                    label: 'Saisie RSP',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Création RSP',
                        icon: 'pi pi-chart-bar',
                        to: '/storage/rsp'
                    }]
                },
                {
                    label: 'Entrée caffé stock',
                    icon: 'pi pi-chart-bar',
                    to: '/storage/entryCoffes'
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
            label: 'Facturation',
            icon: 'pi pi-cog',
            visible: appUser ? hasAnyAuthority(appUser, [
                'INVOICE_VIEW',
                'INVOICE_CREATE',
                'INVOICE_UPDATE',
                'INVOICE_DELETE',
                'INVOICE_VALIDATE',
                'INVOICE_PRINT',
                'INVOICE_SETTINGS'
            ]) : false,
            items: [

                {
                    label: 'Paramètres',
                    icon: 'pi pi-cog',
                    visible: appUser ? hasAuthority(appUser, 'INVOICE_SETTINGS') : false,

                    items: [



                        {
                            label: 'Type de conditionnement',
                            icon: 'pi pi-cart-plus',
                            to: '/settings/typePackaging',
                            className: 'menu-item'
                        },
                        {
                            label: 'Importateur',
                            icon: 'pi pi-truck',
                            to: '/settings/importateur',
                            className: 'menu-item'
                        },
                        {
                            label: 'Agence en douane',
                            icon: 'pi pi-building',
                            to: '/settings/agence',
                            className: 'menu-item'
                        },
                        {
                            label: 'Banque',
                            icon: 'pi pi-wallet',
                            to: '/settings/banque',
                            className: 'menu-item'
                        },

                        {
                            label: 'Engin',
                            icon: 'pi pi-sliders-h',
                            to: '/settings/engin',
                            className: 'menu-item'
                        },
                        {
                            label: 'Entrepot',
                            icon: 'pi pi-building',
                            to: '/settings/entrepot',
                            className: 'menu-item'
                        },
                        {
                            label: 'Exportateur',
                            icon: 'pi pi-send',
                            to: '/settings/exportateur',
                            className: 'menu-item'
                        },
                        {
                            label: 'Provenance',
                            icon: 'pi pi-directions',
                            to: '/settings/provenance',
                            className: 'menu-item'
                        },

                        {
                            label: 'Categories et classes',
                            icon: 'pi pi-cart-plus',
                            className: 'nested-submenu', // Ajout d'une classe pour les sous-menus imbri, // Ajoutez une classe spécifiqu   
                            items: [{
                                label: 'Classe tarif',
                                icon: 'pi pi-cart-plus',
                                to: '/settings/facClasse'
                            }, {
                                label: 'Catégorie classe',
                                icon: 'pi pi-cart-plus',
                                to: '/settings/classeCategory'
                            }, {
                                label: 'Classe Compte Marchandise',
                                icon: 'pi pi-cart-plus',
                                to: '/settings/classeMarchandise'
                            }, {
                                label: 'Catégorie emballage',
                                icon: 'pi pi-inbox',
                                to: '/settings/emballage'
                            },

                            ]
                        },


                        {
                            label: 'Tarif des Marchandises',
                            icon: 'pi pi-dollar',
                            className: 'nested-submenu', // Ajout d'une classe pour les sous-menus imbriqués
                            items: [

                                {
                                    label: 'Tarif Magasin',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixMagasin'
                                },
                                {
                                    label: 'Tarif Marchandise',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixMarchandiseMagasin'
                                },
                                {
                                    label: 'Tarif Marchandise Transit',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixMarchandiseTransit'
                                },
                                {
                                    label: 'Tarif Prestation',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixPrestation'

                                },
                                {
                                    label: 'Tarif Colis',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixColis'
                                }, {
                                    label: 'Tarif service tonnage',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixServiceTonnage'

                                }

                            ]
                        },

                        {
                            label: 'Autres Tarifs',
                            icon: 'pi pi-dollar',
                            className: 'nested-submenu', // Ajout d'une classe pour les sous-menus imbriqués
                            items: [
                                {
                                    label: 'Tarif Abonnement',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixAbonnement'
                                },
                                {
                                    label: 'Tarif Accostage',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixAccostage'
                                },
                                {
                                    label: 'Tarif Arrimage',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixArrimage'
                                },
                                {
                                    label: 'Tarif Conteneur',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixConteneur'
                                }
                                ,

                                {
                                    label: 'Tarif surtaxe',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixSurtaxe'
                                },
                                {
                                    label: 'Tarif Vehicule',
                                    icon: 'pi pi-tag',
                                    to: '/settings/tarif/prixVehicule'

                                }


                            ]
                        }
                        ,



                    ]
                },





                {
                    label: 'Facture avec RSP',
                    icon: 'pi pi-chart-bar',
                    items: [{
                        label: 'Préfacturation RSP',
                        icon: 'pi pi-chart-bar',
                        to: '/invoice/otherExitInvoice'
                    }, /*{
                        label: 'Créer facture RSP',
                        icon: 'pi pi-plus-circle',
                        to: '/invoice/invoiceRSP'
                    },*/
                    {

                        label: 'Créer facture RSP',
                        icon: 'pi pi-plus-circle',
                        to: '/invoice/calculFacture'
                    },
                    {
                        label: 'Valider facture RSP',
                        icon: 'pi pi-check-square',
                        to: '/invoice/validationFacturationRSP'
                    },]
                },

                {
                    label: 'Facture avec GPS',
                    icon: 'pi pi-chart-bar',
                    items: [{
                        label: 'Valider Accostage',
                        icon: 'pi pi-check-square',
                        to: '/invoice/validationFactureAccostage'
                    }, {
                        label: 'Valider Remorquage',
                        icon: 'pi pi-check-square',
                        to: '/invoice/validationFactureRemorquage'
                    },
                    {
                        label: 'Valider autres services',
                        icon: 'pi pi-check-square',
                        to: '/invoice/validationServicePreste'
                    },]
                }

                ,
                {

                    label: 'Autre Type de facture',
                    icon: 'pi pi-home',
                    to: '/invoice/otherInvoice'
                },
                {
                    label: 'Editions',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Raport des factures validées',
                        icon: 'pi pi-check-square',
                        to: '/invoice/rapportFacture'
                    }
                     ,
                     {
                        label: 'Rapport des factures envoyés',
                        icon: 'pi pi-check-square',
                        to: '/invoice/rapportFactureEnvoye'
                    }
                    ,
                    
                     {
                        label: 'Rapport des factures non envoyées',
                        icon: 'pi pi-check-square',
                        to: '/invoice/rapportFactureNonEnvoye'
                    }
                     ,
                   
                   
                     {
                        label: 'Rapport des factures encaissées',
                        icon: 'pi pi-check-square',
                        to: '/invoice/rapportFactureEncaisse'
                    }

                     ,
                       
                   
                     {
                        label: 'Rapport des factures non encaisses',
                        icon: 'pi pi-check-square',
                        to: '/invoice/rapportFactureNonEncaisse'
                    }

                    


                    ]
                },]
        },



        {
            label: 'Caisse et Controle des recettes',
            icon: 'pi pi-home',
            visible: appUser ? hasAnyAuthority(appUser, [
                'CASH_VIEW',
                'CASH_RECEIPT_CREATE',
                'CASH_PAYMENT_CREATE',
                'CASH_VALIDATE'
            ]) : false,
            items: [


                {
                    label: 'Paramètres',
                    icon: 'pi pi-cog',


                    items: [

                        {
                            label: 'Banque',
                            icon: 'pi pi-chart-bar',
                            to: '/settings/banque',
                            className: 'menu-item'
                        },

                        {
                            label: 'Compte Banquaire',
                            icon: 'pi pi-chart-bar',
                            to: '/settings/compteBanquaire',
                            className: 'menu-item'
                        },
                        {
                            label: 'Divise Caisse',
                            icon: 'pi pi-chart-bar',
                            to: '/settings/deviseCaisse',
                            className: 'menu-item'
                        },
                        {
                            label: 'Caissier',
                            icon: 'pi pi-chart-bar',
                            to: '/settings/caissier',
                            className: 'menu-item'
                        }
                        ,
                        {
                            label: 'Importateur à Crédit',
                            icon: 'pi pi-chart-bar',
                            to: '/settings/importateurCredit',
                            className: 'menu-item'
                        }




                    ]
                },




                {
                    label: 'Gestion des mouvements',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Saisir des paiements',
                        icon: 'pi pi-check-square',
                        to: '/saisirPaiement'
                    }, {
                        label: 'Paiements à Credits',
                        icon: 'pi pi-check-square',
                        to: '/saisirPaiementCredit'
                    },
                    {
                        label: 'Excedents',
                        icon: 'pi pi-check-square',
                        to: '/excedent'
                    },
                    {
                        label: 'Fiche Apurement',
                        icon: 'pi pi-check-square',
                        to: '/ficheApurement'
                    },]
                },


                {
                    label: 'Editions',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Rapport details par caissier',
                        icon: 'pi pi-check-square',
                        to: '/rapportCaissierV'
                    },
                    {
                        label: 'Rapport resumé des encaissements',
                        icon: 'pi pi-check-square',
                        to: '/rapportCaissierResumeV'
                    },
                    
                     {
                        label: 'Rapport tous les caissiers',
                        icon: 'pi pi-check-square',
                        to: '/rapportCaissierTotal'
                    },
                    {
                        label: 'Rapport par Banque',
                        icon: 'pi pi-check-square',
                        to: '/rapportBanque'
                    },
                    
                    {
                        label: 'Rapport Resumé tous les banques',
                        icon: 'pi pi-check-square',
                        to: '/rapportBanqueResumeTotal'
                    },
                    {
                        label: 'Rapport details tous les banques',
                        icon: 'pi pi-check-square',
                        to: '/rapportBanqueTotal'
                    },
                    {
                        label: 'Rapport des paiements cash et TVA',
                        icon: 'pi pi-check-square',
                        to: '/rapportCashTVA'
                    },
                    {
                        label: 'Rapport par client',
                        icon: 'pi pi-check-square',
                        to: '/rapportClient'
                    },
                    {
                        label: 'Rapport de tous les clients',
                        icon: 'pi pi-check-square',
                        to: '/rapportClientTous'
                    }
                        ,
                    {
                        label: 'Rapport de factures impayés',
                        icon: 'pi pi-check-square',
                        to: '/ rapportListeFactureImpaye'
                    },
                {
                        label: 'Rapport des anciens encaissements par caissier',
                        icon: 'pi pi-check-square',
                        to: '/rapportCaissier'
                    }]
                },
                {
                    label: 'Comptabilisation des recettes',
                    icon: 'pi pi-wallet',
                    items: [/*{
                    label: 'Credits',
                    icon: 'pi pi-check-square',
                    to: '/recetteCREDIT'
                }, */{
                            label: 'Cashs',
                            icon: 'pi pi-check-square',
                            to: '/recetteCASH'
                        },
                    ]
                },]
        },



        {
            label: 'Approvisionnement',
            icon: 'pi pi-home',
            visible: appUser ? hasAnyAuthority(appUser, [
                'PROCUREMENT_VIEW',
                'PROCUREMENT_CREATE',
                'PROCUREMENT_UPDATE'
            ]) : false,
            items: [
                {
                    label: 'Parametrage',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Exercice',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/exercice'
                    }, {
                        label: 'Catégories',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/categories'
                    }, {
                        label: 'Sous-Catégories',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/sousCategories'
                    }, {
                        label: 'Unités',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/unite'
                    },
                    {
                        label: 'Articles',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/mouvement/article'
                    }, {
                        label: 'Type de Mouvement',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/Typemvt'
                    }, {
                        label: 'Fournisseurs',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/fournisseur'
                    }, {
                        label: 'Banque',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/banque'
                    }, {
                        label: 'Responsable',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/responsable'
                    }, {
                        label: 'Magasin/Dépot',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/magasin'
                    }, {
                        label: 'Magasin Responsables',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/magasinresponsable'
                    }, {
                        label: 'Services',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/service'
                    }, {
                        label: 'Service Responsable',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/serviceresponsable'
                    }, {
                        label: 'Destination',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/destination'
                    }, {
                        label: 'Devise',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/devise'
                    }, {
                        label: 'Frais',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/parametrage/frais'
                    },]
                }

                , {
                    label: 'Mouvement Stock',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Articles',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/mouvement/article'
                    }, {
                        label: 'Entrees',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/mouvement/entreeArticle'
                    },
                    {
                        label: 'Sorties',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/mouvement/sortiearticle'
                    },{
                        label: 'Inventaires',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/mouvement/inventaire'
                    },{
                        label: 'Inventaires Stock',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/mouvement/inventairestock'
                    },]
                }, {
                    label: 'Rapports ',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Fiche de stock',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/rapports/ficheStock'
                    }, {
                        label: 'Fiche de sortie',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/rapports/ficheSortie'
                    }, {
                        label: 'Fiche entrées',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/rapports/ficheEntre'
                    },
                    {
                        label: 'Sortie par service',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/rapports/sortieparservice'
                    }, {
                        label: 'Entrée par fournisseur',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/mouvement/sortiearticle'
                    }, {
                        label: 'Sortie par destination',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/rapports/sortiepardestination'
                    }
                    ,

                     {
                        label: 'Mouvement stock',
                        icon: 'pi pi-check-square',
                        to: '/approvisionnement/rapports/movementStock'
                    }
                ]
                }, {
                    label: 'Comptabilisation',
                    icon: 'pi pi-wallet',
                    to: '/approvisionnement/transfert'
                }]
        },
        {
            label: 'Dispensaire',
            icon: 'pi pi-home',
            visible: appUser ? hasAnyAuthority(appUser, [
                'GESTION_DISPENSAIRE',
                'RH_MANAGER'
            ]) : false,
            items: [
                {
                    label: 'Parametrage',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Exercice',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/exercice'
                    }, {
                        label: 'Catégories',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/categories'
                    }, {
                        label: 'Sous-Catégories',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/sousCategories'
                    }, {
                        label: 'Unités',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/unite'
                    },
                    {
                        label: 'Articles',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/mouvement/article'
                    }, {
                        label: 'Type de Mouvement',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/Typemvt'
                    }, {
                        label: 'Fournisseurs',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/fournisseur'
                    }, {
                        label: 'Banque',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/banque'
                    }, {
                        label: 'Responsable',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/responsable'
                    }, {
                        label: 'Magasin/Dépot',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/magasin'
                    }, {
                        label: 'Magasin Responsables',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/magasinresponsable'
                    }, {
                        label: 'Services',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/service'
                    }, {
                        label: 'Service Responsable',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/serviceresponsable'
                    }, {
                        label: 'Destination',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/destination'
                    }, {
                        label: 'Devise',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/devise'
                    }, {
                        label: 'Frais',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/parametrage/frais'
                    },]
                }

                , {
                    label: 'Gestion du Mouvement',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Articles',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/mouvement/article'
                    },
                    {
                        label: 'Inventaire',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/mouvement/inventaire'
                    }, {
                        label: 'Entrees',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/mouvement/entreeArticle'
                    },
                    {
                        label: 'Sorties',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/mouvement/sortiearticle'
                    },
                    {
                        label: 'Fiche de consommation',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/mouvement/consommation'
                    }]
                },


                {
                    label: 'Edition',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Consultation journaliere',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/rapport/ConsultationJournaliere'
                    },
                    {
                        label: 'Cout par partenaire',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/rapport/CoutPartenaire'
                    }, {
                        label: 'Consommation externe/employé',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/rapport/ConsommationExterne'
                    },
                    {
                        label: 'Consommation par prestation',
                        icon: 'pi pi-check-square',
                        to: '/dispensaire/rapport/ConsommationPrestation'
                    }]
                }
                ,

                {
                    label: 'Comptabilisation',
                    icon: 'pi pi-wallet',
                    to: '/dispensaire/comptabilisationDispensaire'
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
            label: 'Gestion des Pannes',
            icon: 'pi pi-home',
            visible: false,
            items: [
                {
                    label: 'Paramétres',
                    icon: 'pi pi-wallet',
                    items: [{
                        label: 'Unite',
                        icon: 'pi pi-check-square',
                        to: '/pannes/panUnite'
                    }, {
                        label: 'Catégories des engins',
                        icon: 'pi pi-check-square',
                        to: '/pannes/panCategorie'
                    }, {
                        label: 'Types Entretiens',
                        icon: 'pi pi-check-square',
                        to: '/pannes/entretiensType'
                    }, {
                        label: 'Engin Entretien Type',
                        icon: 'pi pi-check-square',
                        to: '/pannes/enginsEntretiensType'
                    }, {
                        label: 'Parties Engin ',
                        icon: 'pi pi-check-square',
                        to: '/pannes/enginsPartieType'
                    },
                    {
                        label: 'Pieces Rechanges Engin',
                        icon: 'pi pi-check-square',
                        to: '/pannes/enginsPieceRechange'
                    }, {
                        label: 'Engin',
                        icon: 'pi pi-check-square',
                        to: '/pannes/panEngin'
                    }, {
                        label: 'Personnel Technique',
                        icon: 'pi pi-check-square',
                        to: '/pannes/personnelTechnique'
                    },]
                }

                , {
                    label: 'Mouvement Pannes',
                    icon: 'pi pi-wallet',
                    items: [
                        {
                            label: 'Devis',
                            icon: 'pi pi-check-square',
                            to: '/pannes/devis'
                        },
                        {
                            label: 'Requisitions',
                            icon: 'pi pi-check-square',
                            to: '/pannes/requisition'
                        },
                        {
                            label: 'Travaux',
                            icon: 'pi pi-check-square',
                            to: '/pannes/panTravaux'
                        },
                        {
                            label: 'Pannes',
                            icon: 'pi pi-check-square',
                            to: '/pannes/panPannes'
                        },
                        {
                            label: 'Entretiens',
                            icon: 'pi pi-check-square',
                            to: '/pannes/panEntretiens'
                        }
                    ]
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
            label: 'Administration',
            icon: 'pi pi-home',
            visible: appUser ? hasAuthority(appUser, 'ADMIN') : false,
            items: [{
                label: 'Gestion des utilisateurs',
                icon: 'pi pi-users',
                to: '/usermanagement'
            }]
        },




        // {
        //     label: 'Dashboards',
        //     icon: 'pi pi-home',
        //     items: [
        //         {
        //             label: 'Sales Dashboard',
        //             icon: 'pi pi-fw pi-home',
        //             to: '/'
        //         },
        //         {
        //             label: 'Analytics Dashboard',
        //             icon: 'pi pi-fw pi-chart-pie',
        //             to: '/dashboards/dashboardanalytics'
        //         },
        //         {
        //             label: 'SaaS Dashboard',
        //             icon: 'pi pi-fw pi-bolt',
        //             to: '/dashboards/dashboardsaas'
        //         }
        //     ]
        // },
        // {
        //     label: 'Apps',
        //     icon: 'pi pi-th-large',
        //     items: [
        //         {
        //             label: 'Blog',
        //             icon: 'pi pi-fw pi-comment',
        //             items: [
        //                 {
        //                     label: 'List',
        //                     icon: 'pi pi-fw pi-image',
        //                     to: '/apps/blog/list'
        //                 },
        //                 {
        //                     label: 'Detail',
        //                     icon: 'pi pi-fw pi-list',
        //                     to: '/apps/blog/detail'
        //                 },
        //                 {
        //                     label: 'Edit',
        //                     icon: 'pi pi-fw pi-pencil',
        //                     to: '/apps/blog/edit'
        //                 }
        //             ]
        //         },
        //         {
        //             label: 'Calendar',
        //             icon: 'pi pi-fw pi-calendar',
        //             to: '/apps/calendar'
        //         },
        //         {
        //             label: 'Chat',
        //             icon: 'pi pi-fw pi-comments',
        //             to: '/apps/chat'
        //         },
        //         {
        //             label: 'Files',
        //             icon: 'pi pi-fw pi-folder',
        //             to: '/apps/files'
        //         },
        //         {
        //             label: 'Mail',
        //             icon: 'pi pi-fw pi-envelope',
        //             items: [
        //                 {
        //                     label: 'Inbox',
        //                     icon: 'pi pi-fw pi-inbox',
        //                     to: '/apps/mail/inbox'
        //                 },
        //                 {
        //                     label: 'Compose',
        //                     icon: 'pi pi-fw pi-pencil',
        //                     to: '/apps/mail/compose'
        //                 },
        //                 {
        //                     label: 'Detail',
        //                     icon: 'pi pi-fw pi-comment',
        //                     to: '/apps/mail/detail/1000'
        //                 }
        //             ]
        //         },
        //         {
        //             label: 'Task List',
        //             icon: 'pi pi-fw pi-check-square',
        //             to: '/apps/tasklist'
        //         }
        //     ]
        // },
        // {
        //     label: 'UI Kit',
        //     icon: 'pi pi-fw pi-star-fill',
        //     items: [
        //         {
        //             label: 'Form Layout',
        //             icon: 'pi pi-fw pi-id-card',
        //             to: '/uikit/formlayout'
        //         },
        //         {
        //             label: 'Input',
        //             icon: 'pi pi-fw pi-check-square',
        //             to: '/uikit/input'
        //         },
        //         {
        //             label: 'Float Label',
        //             icon: 'pi pi-fw pi-bookmark',
        //             to: '/uikit/floatlabel'
        //         },
        //         {
        //             label: 'Invalid State',
        //             icon: 'pi pi-fw pi-exclamation-circle',
        //             to: '/uikit/invalidstate'
        //         },
        //         {
        //             label: 'Button',
        //             icon: 'pi pi-fw pi-box',
        //             to: '/uikit/button'
        //         },
        //         {
        //             label: 'Table',
        //             icon: 'pi pi-fw pi-table',
        //             to: '/uikit/table'
        //         },
        //         {
        //             label: 'List',
        //             icon: 'pi pi-fw pi-list',
        //             to: '/uikit/list'
        //         },
        //         {
        //             label: 'Tree',
        //             icon: 'pi pi-fw pi-share-alt',
        //             to: '/uikit/tree'
        //         },
        //         {
        //             label: 'Panel',
        //             icon: 'pi pi-fw pi-tablet',
        //             to: '/uikit/panel'
        //         },
        //         {
        //             label: 'Overlay',
        //             icon: 'pi pi-fw pi-clone',
        //             to: '/uikit/overlay'
        //         },
        //         {
        //             label: 'Media',
        //             icon: 'pi pi-fw pi-image',
        //             to: '/uikit/media'
        //         },
        //         {
        //             label: 'Menu',
        //             icon: 'pi pi-fw pi-bars',
        //             to: '/uikit/menu'
        //         },
        //         {
        //             label: 'Message',
        //             icon: 'pi pi-fw pi-comment',
        //             to: '/uikit/message'
        //         },
        //         {
        //             label: 'File',
        //             icon: 'pi pi-fw pi-file',
        //             to: '/uikit/file'
        //         },
        //         {
        //             label: 'Chart',
        //             icon: 'pi pi-fw pi-chart-bar',
        //             to: '/uikit/charts'
        //         },
        //         {
        //             label: 'Misc',
        //             icon: 'pi pi-fw pi-circle-off',
        //             to: '/uikit/misc'
        //         }
        //     ]
        // },
        // {
        //     label: 'Prime Blocks',
        //     icon: 'pi pi-fw pi-prime',
        //     items: [
        //         {
        //             label: 'Free Blocks',
        //             icon: 'pi pi-fw pi-eye',
        //             to: '/blocks'
        //         },
        //         {
        //             label: 'All Blocks',
        //             icon: 'pi pi-fw pi-globe',
        //             url: 'https://blocks.primereact.org/',
        //             target: '_blank'
        //         }
        //     ]
        // },
        // {
        //     label: 'Utilities',
        //     icon: 'pi pi-fw pi-compass',
        //     items: [
        //         {
        //             label: 'PrimeIcons',
        //             icon: 'pi pi-fw pi-prime',
        //             to: '/utilities/icons'
        //         },
        //         {
        //             label: 'Colors',
        //             icon: 'pi pi-fw pi-palette',
        //             to: '/utilities/colors'
        //         },
        //         {
        //             label: 'PrimeFlex',
        //             icon: 'pi pi-fw pi-desktop',
        //             url: 'https://www.primeflex.org',
        //             target: '_blank'
        //         },
        //         {
        //             label: 'Figma',
        //             icon: 'pi pi-fw pi-pencil',
        //             url: 'https://www.figma.com/file/ijQrxq13lxacgkb6XHlLxA/Preview-%7C-Ultima-2022?node-id=354%3A7715&t=gjWHprUDE5RJIg78-1',
        //             target: '_blank'
        //         }
        //     ]
        // },
        // {
        //     label: 'Pages',
        //     icon: 'pi pi-fw pi-briefcase',
        //     items: [
        //         {
        //             label: 'Landing',
        //             icon: 'pi pi-fw pi-globe',
        //             to: '/landing'
        //         },
        //         {
        //             label: 'Auth',
        //             icon: 'pi pi-fw pi-user',
        //             items: [
        //                 {
        //                     label: 'Login',
        //                     icon: 'pi pi-fw pi-sign-in',
        //                     to: '/auth/login'
        //                 },
        //                 {
        //                     label: 'Login 2',
        //                     icon: 'pi pi-fw pi-sign-in',
        //                     to: '/auth/login2'
        //                 },
        //                 {
        //                     label: 'Error',
        //                     icon: 'pi pi-fw pi-times-circle',
        //                     to: '/auth/error'
        //                 },
        //                 {
        //                     label: 'Error 2',
        //                     icon: 'pi pi-fw pi-times-circle',
        //                     to: '/auth/error2'
        //                 },
        //                 {
        //                     label: 'Access Denied',
        //                     icon: 'pi pi-fw pi-lock',
        //                     to: '/auth/access'
        //                 },
        //                 {
        //                     label: 'Access Denied 2',
        //                     icon: 'pi pi-fw pi-lock',
        //                     to: '/auth/access2'
        //                 },
        //                 {
        //                     label: 'Register',
        //                     icon: 'pi pi-fw pi-user-plus',
        //                     to: '/auth/register'
        //                 },
        //                 {
        //                     label: 'Forgot Password',
        //                     icon: 'pi pi-fw pi-question',
        //                     to: '/auth/forgotpassword'
        //                 },
        //                 {
        //                     label: 'New Password',
        //                     icon: 'pi pi-fw pi-cog',
        //                     to: '/auth/newpassword'
        //                 },
        //                 {
        //                     label: 'Verification',
        //                     icon: 'pi pi-fw pi-envelope',
        //                     to: '/auth/verification'
        //                 },
        //                 {
        //                     label: 'Lock Screen',
        //                     icon: 'pi pi-fw pi-eye-slash',
        //                     to: '/auth/lockscreen'
        //                 }
        //             ]
        //         },
        //         {
        //             label: 'Crud',
        //             icon: 'pi pi-fw pi-pencil',
        //             to: '/pages/crud'
        //         },
        //         {
        //             label: 'Timeline',
        //             icon: 'pi pi-fw pi-calendar',
        //             to: '/pages/timeline'
        //         },
        //         {
        //             label: 'Invoice',
        //             icon: 'pi pi-fw pi-dollar',
        //             to: '/pages/invoice'
        //         },

        //         {
        //             label: 'Help',
        //             icon: 'pi pi-fw pi-question-circle',
        //             to: '/pages/help'
        //         },
        //         {
        //             label: 'Not Found',
        //             icon: 'pi pi-fw pi-exclamation-circle',
        //             to: '/pages/notfound'
        //         },
        //         {
        //             label: 'Empty',
        //             icon: 'pi pi-fw pi-circle-off',
        //             to: '/pages/empty'
        //         },
        //         {
        //             label: 'Contact Us',
        //             icon: 'pi pi-fw pi-phone',
        //             to: '/pages/contact'
        //         }
        //     ]
        // },
        // {
        //     label: 'E-Commerce',
        //     icon: 'pi pi-fw pi-wallet',
        //     items: [
        //         {
        //             label: 'Product Overview',
        //             icon: 'pi pi-fw pi-image',
        //             to: '/ecommerce/product-overview'
        //         },
        //         {
        //             label: 'Product List',
        //             icon: 'pi pi-fw pi-list',
        //             to: '/ecommerce/product-list'
        //         },
        //         {
        //             label: 'New Product',
        //             icon: 'pi pi-fw pi-plus',
        //             to: '/ecommerce/new-product'
        //         },
        //         {
        //             label: 'Shopping Cart',
        //             icon: 'pi pi-fw pi-shopping-cart',
        //             to: '/ecommerce/shopping-cart'
        //         },
        //         {
        //             label: 'Checkout Form',
        //             icon: 'pi pi-fw pi-check-square',
        //             to: '/ecommerce/checkout-form'
        //         },
        //         {
        //             label: 'Order History',
        //             icon: 'pi pi-fw pi-history',
        //             to: '/ecommerce/order-history'
        //         },
        //         {
        //             label: 'Order Summary',
        //             icon: 'pi pi-fw pi-file',
        //             to: '/ecommerce/order-summary'
        //         }
        //     ]
        // },

        // {
        //     label: 'User Management',
        //     icon: 'pi pi-fw pi-user',
        //     items: [
        //         {
        //             label: 'List',
        //             icon: 'pi pi-fw pi-list',
        //             to: '/profile/list'
        //         },
        //         {
        //             label: 'Create',
        //             icon: 'pi pi-fw pi-plus',
        //             to: '/profile/create'
        //         }
        //     ]
        // },
        // {
        //     label: 'Hierarchy',
        //     icon: 'pi pi-fw pi-align-left',
        //     items: [
        //         {
        //             label: 'Submenu 1',
        //             icon: 'pi pi-fw pi-align-left',
        //             items: [
        //                 {
        //                     label: 'Submenu 1.1',
        //                     icon: 'pi pi-fw pi-align-left',
        //                     items: [
        //                         {
        //                             label: 'Submenu 1.1.1',
        //                             icon: 'pi pi-fw pi-align-left'
        //                         },
        //                         {
        //                             label: 'Submenu 1.1.2',
        //                             icon: 'pi pi-fw pi-align-left'
        //                         },
        //                         {
        //                             label: 'Submenu 1.1.3',
        //                             icon: 'pi pi-fw pi-align-left'
        //                         }
        //                     ]
        //                 },
        //                 {
        //                     label: 'Submenu 1.2',
        //                     icon: 'pi pi-fw pi-align-left',
        //                     items: [
        //                         {
        //                             label: 'Submenu 1.2.1',
        //                             icon: 'pi pi-fw pi-align-left'
        //                         }
        //                     ]
        //                 }
        //             ]
        //         },
        //         {
        //             label: 'Submenu 2',
        //             icon: 'pi pi-fw pi-align-left',
        //             items: [
        //                 {
        //                     label: 'Submenu 2.1',
        //                     icon: 'pi pi-fw pi-align-left',
        //                     items: [
        //                         {
        //                             label: 'Submenu 2.1.1',
        //                             icon: 'pi pi-fw pi-align-left'
        //                         },
        //                         {
        //                             label: 'Submenu 2.1.2',
        //                             icon: 'pi pi-fw pi-align-left'
        //                         }
        //                     ]
        //                 },
        //                 {
        //                     label: 'Submenu 2.2',
        //                     icon: 'pi pi-fw pi-align-left',
        //                     items: [
        //                         {
        //                             label: 'Submenu 2.2.1',
        //                             icon: 'pi pi-fw pi-align-left'
        //                         }
        //                     ]
        //                 }
        //             ]
        //         }
        //     ]
        // },
        // {
        //     label: 'Start',
        //     icon: 'pi pi-fw pi-download',
        //     items: [
        //         {
        //             label: 'Buy Now',
        //             icon: 'pi pi-fw pi-shopping-cart',
        //             url: 'https://www.primefaces.org/store'
        //         },
        //         {
        //             label: 'Documentation',
        //             icon: 'pi pi-fw pi-info-circle',
        //             to: '/documentation'
        //         }
        //     ]
        // }
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
