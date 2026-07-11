// =============================================================================
// Rapports BRB (réglementaires trimestriels — délimités par période)
// Structures de lignes conformes aux tableaux BRB (Circulaire 09) et helpers
// partagés par les pages Bilan / Compte de résultat / Flux de trésorerie.
// =============================================================================
import type React from 'react';

export interface BrbLine {
    type: 'classe' | 'groupe' | 'sous' | 'detail';
    compte: string;
    libelle: string;
}

// Valeur d'une ligne renvoyée par le backend :
// ventilation BIF / Devises × Résident / Non résident + N / N-1
export interface BrbCell {
    bifRes: number;
    bifNonRes: number;
    devRes: number;
    devNonRes: number;
    bif: number;   // total BIF (bifRes + bifNonRes)
    dev: number;   // total Devises (devRes + devNonRes)
    net: number;
    netN1: number;
}

export type BrbLines = Record<string, BrbCell | undefined>;

// ── BILAN — Tableau 3 (Actif) ────────────────────────────────────────────────
export const BILAN_ACTIF: BrbLine[] = [
    { type: 'classe', compte: '1', libelle: "Classe 1 : Opérations financières avec les institutions financières et autres partenaires" },
    { type: 'groupe', compte: '10', libelle: 'Encaisse' },
    { type: 'detail', compte: '101', libelle: 'Caisse' },
    { type: 'groupe', compte: '11', libelle: 'Dépôts' },
    { type: 'sous', compte: '111', libelle: 'Dépôts à vue' },
    { type: 'detail', compte: '1111', libelle: 'Banque centrale' },
    { type: 'detail', compte: '1112', libelle: 'Banques commerciales' },
    { type: 'detail', compte: '1113', libelle: 'Institutions de microfinance' },
    { type: 'detail', compte: '1114', libelle: 'Autres sociétés financières' },
    { type: 'sous', compte: '112', libelle: 'Dépôts à terme' },
    { type: 'detail', compte: '1121', libelle: 'Banque centrale' },
    { type: 'detail', compte: '1122', libelle: 'Banques commerciales' },
    { type: 'detail', compte: '1123', libelle: 'Institutions de microfinance' },
    { type: 'detail', compte: '1124', libelle: 'Autres sociétés financières' },
    { type: 'detail', compte: '12', libelle: 'Valeurs à encaisser' },
    { type: 'groupe', compte: '14', libelle: 'Prêts aux institutions financières' },
    { type: 'detail', compte: '141', libelle: 'Prêt à court terme' },
    { type: 'detail', compte: '142', libelle: 'Prêt à moyen terme' },
    { type: 'detail', compte: '143', libelle: 'Prêts à long terme' },
    { type: 'detail', compte: '146', libelle: 'Intérêts courus' },
    { type: 'detail', compte: '18', libelle: 'Virement interne' },
    { type: 'classe', compte: '2', libelle: 'Classe 2 : Opérations avec les membres, clients et bénéficiaires' },
    { type: 'groupe', compte: '21', libelle: "Crédits à l'économie" },
    { type: 'detail', compte: '211', libelle: 'Crédits sains sur ressources non affectées' },
    { type: 'detail', compte: '212', libelle: 'Crédits sains sur ressources affectées' },
    { type: 'detail', compte: '213', libelle: 'Crédits restructurés ou rééchelonnés' },
    { type: 'detail', compte: '214', libelle: 'Crédits en souffrance' },
    { type: 'groupe', compte: '26', libelle: 'Intérêt courus sur crédits' },
    { type: 'detail', compte: '261', libelle: 'Intérêts courus sur crédits sains sur ressources non affectées' },
    { type: 'detail', compte: '262', libelle: 'Intérêts courus sur crédits sains sur ressources affectées' },
    { type: 'detail', compte: '263', libelle: 'Intérêts courus sur crédits restructurés ou rééchelonnés' },
    { type: 'classe', compte: '3', libelle: 'Classe 3 : Opérations diverses' },
    { type: 'detail', compte: '30', libelle: 'Stocks' },
    { type: 'detail', compte: '31', libelle: 'Débiteurs divers' },
    { type: 'detail', compte: '32', libelle: 'Comptes de liaison' },
    { type: 'groupe', compte: '35', libelle: 'Avances et prêts au personnel et aux dirigeants' },
    { type: 'detail', compte: '351', libelle: 'Personnel - avances sur salaires' },
    { type: 'detail', compte: '352', libelle: 'Dirigeants – Découvert' },
    { type: 'detail', compte: '353', libelle: 'Personnel – prêts' },
    { type: 'detail', compte: '354', libelle: 'Dirigeants – Prêts' },
    { type: 'detail', compte: '356', libelle: 'Intérêts courus sur prêts au personnel et aux dirigeants' },
    { type: 'groupe', compte: '36', libelle: "Comptes de régularisation d'actif" },
    { type: 'detail', compte: '361', libelle: "Charges payées d'avance" },
    { type: 'detail', compte: '362', libelle: 'Produits à recevoir' },
    { type: 'detail', compte: '363', libelle: "Autres comptes de régularisation d'actif" },
    { type: 'classe', compte: '4', libelle: 'Classe 4 : Immobilisations' },
    { type: 'groupe', compte: '40', libelle: 'Immobilisations financières' },
    { type: 'detail', compte: '401', libelle: 'Dépôts et cautionnements versés' },
    { type: 'detail', compte: '408', libelle: 'Autres immobilisations financières' },
    { type: 'groupe', compte: '41', libelle: 'Immobilisations encours' },
    { type: 'detail', compte: '411', libelle: 'Avances versées sur immobilisations incorporelles' },
    { type: 'detail', compte: '412', libelle: 'Avances versées sur immobilisations corporelles' },
    { type: 'groupe', compte: '42', libelle: 'Immobilisations incorporelles' },
    { type: 'detail', compte: '421', libelle: "Frais d'établissement" },
    { type: 'detail', compte: '428', libelle: 'Autres immobilisations incorporelles' },
    { type: 'groupe', compte: '43', libelle: 'Immobilisations corporelles' },
    { type: 'detail', compte: '431', libelle: 'Terrains et aménagements de terrains' },
    { type: 'detail', compte: '432', libelle: 'Immeubles' },
    { type: 'detail', compte: '433', libelle: 'Améliorations locatives' },
    { type: 'detail', compte: '434', libelle: 'Matériel et mobilier' },
    { type: 'detail', compte: '435', libelle: 'Matériel roulant' },
    { type: 'detail', compte: '438', libelle: 'Autres immobilisations corporelles' },
];

// ── BILAN — Tableau 3 (Passif) ───────────────────────────────────────────────
export const BILAN_PASSIF: BrbLine[] = [
    { type: 'classe', compte: '1', libelle: 'Classe 1 : Trésorerie et opérations financières avec les institutions financières et autres partenaires' },
    { type: 'groupe', compte: '13', libelle: 'Emprunts' },
    { type: 'detail', compte: '131', libelle: 'Emprunts court terme, découvert banque' },
    { type: 'detail', compte: '132', libelle: 'Emprunts à moyen terme' },
    { type: 'detail', compte: '133', libelle: 'Emprunts à long terme' },
    { type: 'detail', compte: '136', libelle: 'Intérêts courus sur emprunts' },
    { type: 'detail', compte: '15', libelle: 'Ressources affectées' },
    { type: 'groupe', compte: '16', libelle: 'Subventions reçues non encore utilisées' },
    { type: 'detail', compte: '161', libelle: "Subventions d'exploitation reçues non encore utilisées" },
    { type: 'detail', compte: '162', libelle: "Subventions d'investissement reçues non encore utilisées" },
    { type: 'detail', compte: '18', libelle: 'Virement interne' },
    { type: 'classe', compte: '2', libelle: 'Classe 2 : Opérations avec les membres, clients et bénéficiaires' },
    { type: 'groupe', compte: '22', libelle: 'Dépôts des membres, clients et bénéficiaires' },
    { type: 'detail', compte: '221', libelle: 'Dépôts à vue' },
    { type: 'detail', compte: '222', libelle: 'Dépôts à terme' },
    { type: 'detail', compte: '223', libelle: "Comptes d'épargne" },
    { type: 'detail', compte: '224', libelle: 'Dépôts de garantie sur crédit accordé' },
    { type: 'detail', compte: '225', libelle: 'Autres dépôts' },
    { type: 'detail', compte: '226', libelle: 'Intérêt courus sur dépôts des membres, clients et bénéficiaires' },
    { type: 'classe', compte: '3', libelle: 'Classe 3 : Opérations diverses' },
    { type: 'detail', compte: '32', libelle: 'Compte de liaison' },
    { type: 'groupe', compte: '33', libelle: 'Créditeurs divers' },
    { type: 'detail', compte: '331', libelle: 'Sécurité sociale, INSS' },
    { type: 'detail', compte: '332', libelle: 'Impôt' },
    { type: 'detail', compte: '333', libelle: "Mutuelle d'assurance maladie" },
    { type: 'detail', compte: '334', libelle: 'Rémunérations dues' },
    { type: 'detail', compte: '335', libelle: 'Dividendes à distribuer' },
    { type: 'detail', compte: '338', libelle: 'Autres créditeurs divers' },
    { type: 'groupe', compte: '37', libelle: 'Comptes de régularisations de passif' },
    { type: 'detail', compte: '371', libelle: 'Charges à payer' },
    { type: 'detail', compte: '372', libelle: "Produits perçus d'avance" },
    { type: 'detail', compte: '373', libelle: 'Autres comptes de régularisations de passif' },
    { type: 'classe', compte: '5', libelle: 'Classe 5 : Fonds propres et assimilés' },
    { type: 'detail', compte: '50', libelle: 'Provisions pour risques ou à caractère de réserve' },
    { type: 'groupe', compte: '51', libelle: 'Fonds affectés' },
    { type: 'detail', compte: '511', libelle: 'Fonds de sécurité' },
    { type: 'detail', compte: '512', libelle: "Fonds d'auto assurance" },
    { type: 'detail', compte: '518', libelle: 'Autres fonds affectés' },
    { type: 'groupe', compte: '52', libelle: "Subventions d'investissement" },
    { type: 'detail', compte: '521', libelle: 'Subventions pour immobilisations' },
    { type: 'detail', compte: '522', libelle: 'Subventions pour fonds de crédit' },
    { type: 'groupe', compte: '53', libelle: 'Report à nouveau' },
    { type: 'detail', compte: '531', libelle: 'Report à nouveau créditeur' },
    { type: 'detail', compte: '532', libelle: 'Report à nouveau débiteur' },
    { type: 'groupe', compte: '54', libelle: 'Réserves' },
    { type: 'detail', compte: '541', libelle: 'Réserves légales' },
    { type: 'detail', compte: '542', libelle: 'Réserves statutaires' },
    { type: 'detail', compte: '543', libelle: 'Ecarts de réévaluation' },
    { type: 'detail', compte: '548', libelle: 'Autres réserves' },
    { type: 'groupe', compte: '55', libelle: 'Capital' },
    { type: 'detail', compte: '5511', libelle: 'Capital souscrit libéré' },
    { type: 'detail', compte: '5512', libelle: 'Capital souscrit non libéré' },
    { type: 'detail', compte: '552', libelle: 'Primes liées au capital' },
    { type: 'detail', compte: '553', libelle: 'Fonds de dotation' },
    { type: 'detail', compte: '56', libelle: 'Résultat de la période' },
];

// ── COMPTE DE RÉSULTAT — Tableau 5 (Produits) ────────────────────────────────
export const CR_PRODUITS: BrbLine[] = [
    { type: 'groupe', compte: '70', libelle: "Produits d'intérêts" },
    { type: 'detail', compte: '701', libelle: "Produits d'intérêts sur opérations avec les institutions financières" },
    { type: 'detail', compte: '702', libelle: "Produits d'intérêts sur les crédits sains" },
    { type: 'detail', compte: '703', libelle: "Produits d'intérêts sur les crédits sur ressources affectées" },
    { type: 'groupe', compte: '71', libelle: 'Commissions sur opérations financières' },
    { type: 'detail', compte: '711', libelle: 'Commissions sur dossiers de crédit' },
    { type: 'detail', compte: '712', libelle: 'Frais de tenue de comptes' },
    { type: 'detail', compte: '713', libelle: 'Commissions sur systèmes de paiement' },
    { type: 'detail', compte: '718', libelle: 'Autres commissions sur prestations de services' },
    { type: 'groupe', compte: '72', libelle: 'Autres produits financiers et non financiers' },
    { type: 'detail', compte: '721', libelle: 'Produits sur les immobilisations financières' },
    { type: 'detail', compte: '722', libelle: "Produits nets sur cession d'actif immobilisé" },
    { type: 'detail', compte: '723', libelle: "Frais d'adhésion" },
    { type: 'detail', compte: '728', libelle: 'Autres produits financiers' },
    { type: 'groupe', compte: '73', libelle: 'Subventions' },
    { type: 'detail', compte: '731', libelle: "Subventions d'exploitation" },
    { type: 'detail', compte: '732', libelle: "Subventions d'équilibre" },
    { type: 'detail', compte: '733', libelle: "Quote-part de subventions d'investissement reprise et affectée au résultat" },
    { type: 'groupe', compte: '74', libelle: 'Produits exceptionnels' },
    { type: 'detail', compte: '741', libelle: 'Encaissements de crédits radiés des livres' },
    { type: 'detail', compte: '748', libelle: 'Autres produits exceptionnels' },
    { type: 'groupe', compte: '79', libelle: "Reprise d'amortissements et de provisions" },
    { type: 'detail', compte: '791', libelle: 'Reprise sur amortissements' },
    { type: 'detail', compte: '792', libelle: 'Reprise sur provisions' },
];

// ── COMPTE DE RÉSULTAT — Tableau 5 (Charges) ─────────────────────────────────
export const CR_CHARGES: BrbLine[] = [
    { type: 'groupe', compte: '60', libelle: "Charges d'intérêts" },
    { type: 'detail', compte: '601', libelle: "Charges d'intérêts sur opérations avec les institutions financières" },
    { type: 'detail', compte: '602', libelle: "Charges d'intérêts sur opérations avec les membres, clients et bénéficiaires" },
    { type: 'detail', compte: '608', libelle: "Autres Charges d'intérêts" },
    { type: 'groupe', compte: '61', libelle: 'Commissions supportées sur opérations financières' },
    { type: 'detail', compte: '611', libelle: 'Commissions sur engagements de financements reçus' },
    { type: 'detail', compte: '612', libelle: 'Commissions sur garanties reçus' },
    { type: 'detail', compte: '618', libelle: 'Autres commissions' },
    { type: 'groupe', compte: '62', libelle: 'Autres charges financières' },
    { type: 'detail', compte: '621', libelle: 'Agios sur comptes bancaires' },
    { type: 'detail', compte: '622', libelle: 'Frais de contentieux liés aux opérations de crédits' },
    { type: 'groupe', compte: '63', libelle: "Charges générales d'exploitation" },
    { type: 'detail', compte: '630', libelle: 'Achats de fournitures' },
    { type: 'detail', compte: '631', libelle: 'Variations de stocks' },
    { type: 'detail', compte: '632', libelle: 'Transport et déplacement' },
    { type: 'detail', compte: '633', libelle: 'Location' },
    { type: 'detail', compte: '634', libelle: 'Entretien et réparations' },
    { type: 'detail', compte: '635', libelle: "Primes d'assurance" },
    { type: 'detail', compte: '636', libelle: 'Publicité et relations publiques' },
    { type: 'detail', compte: '637', libelle: 'Frais de communication' },
    { type: 'detail', compte: '638', libelle: 'Honoraires et prestations externes' },
    { type: 'detail', compte: '639', libelle: "Charges générales d'exploitation diverses" },
    { type: 'groupe', compte: '64', libelle: 'Impôts et taxes' },
    { type: 'detail', compte: '641', libelle: 'Impôts et taxes' },
    { type: 'detail', compte: '642', libelle: 'Pénalités et amendes fiscales' },
    { type: 'groupe', compte: '65', libelle: 'Personnel' },
    { type: 'detail', compte: '651', libelle: 'Rémunérations au personnel' },
    { type: 'detail', compte: '652', libelle: 'Charges sociales' },
    { type: 'groupe', compte: '66', libelle: 'Autres charges' },
    { type: 'detail', compte: '661', libelle: 'Pertes sur crédits et sur autres créances' },
    { type: 'detail', compte: '662', libelle: "Pertes nettes sur cessions d'actif immobilisé" },
    { type: 'detail', compte: '663', libelle: 'Charges diverses' },
    { type: 'groupe', compte: '68', libelle: 'Dotations aux amortissements et provisions' },
    { type: 'detail', compte: '681', libelle: 'Dotations aux amortissements' },
    { type: 'detail', compte: '682', libelle: 'Dotations aux provisions' },
    { type: 'detail', compte: '69', libelle: 'Impôts sur le résultat' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
export const fmt = (val: number): string => {
    if (!val) return '';
    return new Intl.NumberFormat('fr-FR').format(Math.round(val));
};

// Formatage compatible impression (sans espace insécable posant problème à jsPDF)
export const fmtN = (v: number): string =>
    v ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';

export const toIso = (d: Date | null): string => {
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const formatDate = (value: string): string => {
    if (!value) return '';
    return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
};

export const sumDetail = (lines: BrbLine[], data: BrbLines, field: keyof BrbCell): number =>
    lines.filter(l => l.type === 'detail').reduce((s, l) => s + (data[l.compte]?.[field] ?? 0), 0);

// Styles partagés
export const tdBase: React.CSSProperties = { border: '1px solid #aaa', padding: '3px 6px', fontSize: '0.72rem' };
export const tdNum: React.CSSProperties = { ...tdBase, textAlign: 'right', whiteSpace: 'nowrap', minWidth: '64px' };
export const tdCode: React.CSSProperties = { ...tdBase, textAlign: 'center', width: '46px', whiteSpace: 'nowrap' };
export const thStyle: React.CSSProperties = {
    border: '1px solid #555', padding: '5px 6px', fontSize: '0.68rem',
    textAlign: 'center', color: 'white', backgroundColor: '#1a3a5c', whiteSpace: 'nowrap',
};
