#!/usr/bin/env python3
"""
Comprehensive translation script for Financial Products module
Translates all English text to French in TSX/TS files systematically
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Base directory
BASE_DIR = Path(r"C:\Users\prudence.manirakiza\Documents\AgrM\AgrM-fe\app\(AgrM-fe)\financialProducts")

# Simple string replacements (exact matches)
SIMPLE_TRANSLATIONS = {
    # Toast summaries
    "summary: 'Success'": "summary: 'Succès'",
    "summary: 'Error'": "summary: 'Erreur'",
    'summary: "Success"': 'summary: "Succès"',
    'summary: "Error"': 'summary: "Erreur"',

    # Validation messages
    "detail: 'Please fill required fields'": "detail: 'Veuillez remplir les champs obligatoires'",
    'detail: "Please fill required fields"': 'detail: "Veuillez remplir les champs obligatoires"',

    # Status tags (in JSX)
    "? 'Active' : 'Inactive'": "? 'Actif' : 'Inactif'",
    'value="Default"': 'value="Par défaut"',
    "value='Default'": "value='Par défaut'",
    'value="Active"': 'value="Actif"',
    'value="Inactive"': 'value="Inactif"',

    # Button labels
    'label="Save"': 'label="Enregistrer"',
    "label='Save'": "label='Enregistrer'",
    'label="Update"': 'label="Modifier"',
    "label='Update'": "label='Modifier'",
    'label="Cancel"': 'label="Annuler"',
    "label='Cancel'": "label='Annuler'",
    'label="Delete"': 'label="Supprimer"',
    "label='Delete'": "label='Supprimer'",
    'label="Yes"': 'label="Oui"',
    "label='Yes'": "label='Oui'",
    'label="No"': 'label="Non"',
    "label='No'": "label='Non'",
    'label="Submit"': 'label="Soumettre"',
    'label="Approve"': 'label="Approuver"',
    'label="Reject"': 'label="Rejeter"',
    'label="Verify"': 'label="Vérifier"',
    'label="Search"': 'label="Rechercher"',
    'label="Upload"': 'label="Télécharger"',
    'label="New"': 'label="Nouveau"',
    'label="Edit"': 'label="Modifier"',

    # Conditional button labels
    "'Update' : 'Save'": "'Modifier' : 'Enregistrer'",
    '"Update" : "Save"': '"Modifier" : "Enregistrer"',

    # Placeholders
    'placeholder="Search..."': 'placeholder="Rechercher..."',
    "placeholder='Search...'": "placeholder='Rechercher...'",

    # Table headers
    'header="Name"': 'header="Nom"',
    'header="Status"': 'header="Statut"',
    'header="Symbol"': 'header="Symbole"',
    'header="Decimals"': 'header="Décimales"',
    'header="Default"': 'header="Par défaut"',
    'header="Formula"': 'header="Formule"',
    'header="Frequency"': 'header="Fréquence"',
    'header="Period"': 'header="Période"',
    'header="Amount"': 'header="Montant"',
    'header="Rate"': 'header="Taux"',
    'header="Type"': 'header="Type"',
    'header="Level"': 'header="Niveau"',
    'header="Priority"': 'header="Priorité"',
    'header="Order"': 'header="Ordre"',

    # Dialog headers
    'header="Confirm"': 'header="Confirmer"',

    # Form section headers
    '<h5>Basic Information</h5>': '<h5>Informations de Base</h5>',
    '<h5>Details</h5>': '<h5>Détails</h5>',
    '<h5>Configuration</h5>': '<h5>Configuration</h5>',

    # Form labels
    '<label htmlFor="name">Name *</label>': '<label htmlFor="name">Nom *</label>',
    '<label htmlFor="isActive">Active</label>': '<label htmlFor="isActive">Actif</label>',
    '<label htmlFor="symbol">Symbol</label>': '<label htmlFor="symbol">Symbole</label>',
    '<label htmlFor="decimalPlaces">Decimal Places</label>': '<label htmlFor="decimalPlaces">Décimales</label>',
    '<label htmlFor="isDefault">Default Currency</label>': '<label htmlFor="isDefault">Devise par Défaut</label>',
    '<label htmlFor="formula">Formula</label>': '<label htmlFor="formula">Formule</label>',
    '<label htmlFor="description">Description</label>': '<label htmlFor="description">Description</label>',

    # Confirmation messages
    'Are you sure you want to delete': 'Êtes-vous sûr de vouloir supprimer',
}

# Entity-specific translations for success messages
ENTITY_TRANSLATIONS = {
    'Currency': 'Devise',
    'Loan product type': 'Type de produit de crédit',
    'Interest calculation method': 'Méthode de calcul d\'intérêt',
    'Payment frequency': 'Fréquence de paiement',
    'Fee type': 'Type de frais',
    'Fee calculation method': 'Méthode de calcul de frais',
    'Loan guarantee type': 'Type de garantie de prêt',
    'Loan decision type': 'Type de décision de prêt',
    'Income type': 'Type de revenu',
    'Expense type': 'Type de dépense',
    'Disbursement condition type': 'Type de condition de décaissement',
    'Savings product type': 'Type de produit d\'épargne',
    'Savings account status': 'Statut de compte d\'épargne',
    'Transaction channel': 'Canal de transaction',
    'Transfer type': 'Type de transfert',
    'Bill payment type': 'Type de paiement de facture',
    'Insurance type': 'Type d\'assurance',
    'Capitalization frequency': 'Fréquence de capitalisation',
    'Term deposit duration': 'Durée de dépôt à terme',
    'Approval level': 'Niveau d\'approbation',
    'Loan status': 'Statut de prêt',
    'Risk level': 'Niveau de risque',
    'Credit score factor': 'Facteur de score de crédit',
    'Application stage': 'Étape de demande',
    'Transaction type': 'Type de transaction',
    'Transfer partner': 'Partenaire de transfert',
    'Mobile money operator': 'Opérateur de mobile money',
    'Insurance partner': 'Partenaire d\'assurance',
    'Bill payment partner': 'Partenaire de paiement de facture',
    'Loan purpose': 'Objectif de prêt',
    'Loan product': 'Produit de crédit',
    'Loan application': 'Demande de prêt',
    'Loan guarantee': 'Garantie de prêt',
    'Product fee': 'Frais de produit',
    'Required document': 'Document requis',
    'Product sector': 'Secteur de produit',
    'Workflow stage': 'Étape du workflow',
}

# Regex patterns for complex translations
PATTERNS: List[Tuple[str, str]] = [
    # Success messages with entity names
    (r"detail: ['\"]([^'\"]+) created successfully['\"]",
     lambda m: f"detail: '{ENTITY_TRANSLATIONS.get(m.group(1), m.group(1))} créé avec succès'" if "'" in m.group(0) else f'detail: "{ENTITY_TRANSLATIONS.get(m.group(1), m.group(1))} créé avec succès"'),

    (r"detail: ['\"]([^'\"]+) updated successfully['\"]",
     lambda m: f"detail: '{ENTITY_TRANSLATIONS.get(m.group(1), m.group(1))} modifié avec succès'" if "'" in m.group(0) else f'detail: "{ENTITY_TRANSLATIONS.get(m.group(1), m.group(1))} modifié avec succès"'),

    (r"detail: ['\"]([^'\"]+) deleted successfully['\"]",
     lambda m: f"detail: '{ENTITY_TRANSLATIONS.get(m.group(1), m.group(1))} supprimé avec succès'" if "'" in m.group(0) else f'detail: "{ENTITY_TRANSLATIONS.get(m.group(1), m.group(1))} supprimé avec succès"'),

    # Empty messages
    (r'emptyMessage="No ([^"]+) found"',
     lambda m: f'emptyMessage="Aucun(e) {translate_entity_plural(m.group(1))} trouvé(e)"'),

    # Manage headers
    (r'<h4[^>]*>Manage ([^<]+)</h4>',
     lambda m: f'<h4 className="m-0">Gérer les {translate_entity_plural(m.group(1))}</h4>'),
]

def translate_entity_plural(entity: str) -> str:
    """Translate entity names in plural form"""
    plurals = {
        'Currencies': 'Devises',
        'Loan Product Types': 'Types de Produits de Crédit',
        'Interest Calculation Methods': 'Méthodes de Calcul d\'Intérêts',
        'Payment Frequencies': 'Fréquences de Paiement',
        'Fee Types': 'Types de Frais',
        'Fee Calculation Methods': 'Méthodes de Calcul de Frais',
        'Loan Guarantee Types': 'Types de Garanties de Prêt',
        'Loan Decision Types': 'Types de Décisions de Prêt',
        'Income Types': 'Types de Revenus',
        'Expense Types': 'Types de Dépenses',
        'Disbursement Condition Types': 'Types de Conditions de Décaissement',
        'Savings Product Types': 'Types de Produits d\'Épargne',
        'Savings Account Statuses': 'Statuts de Comptes d\'Épargne',
        'Transaction Channels': 'Canaux de Transaction',
        'Transfer Types': 'Types de Transferts',
        'Bill Payment Types': 'Types de Paiements de Facture',
        'Insurance Types': 'Types d\'Assurance',
        'Capitalization Frequencies': 'Fréquences de Capitalisation',
        'Term Deposit Durations': 'Durées de Dépôts à Terme',
        'Approval Levels': 'Niveaux d\'Approbation',
        'Loan Statuses': 'Statuts de Prêts',
        'Risk Levels': 'Niveaux de Risque',
        'Credit Score Factors': 'Facteurs de Score de Crédit',
        'Application Stages': 'Étapes de Demande',
        'Transaction Types': 'Types de Transactions',
        'Transfer Partners': 'Partenaires de Transfert',
        'Mobile Money Operators': 'Opérateurs de Mobile Money',
        'Insurance Partners': 'Partenaires d\'Assurance',
        'Bill Payment Partners': 'Partenaires de Paiement de Facture',
        'Loan Purposes': 'Objectifs de Prêts',
        'Loan Products': 'Produits de Crédit',
        'Loan Applications': 'Demandes de Prêts',
        # Lowercase versions
        'currencies': 'devises',
        'loan product types': 'types de produits de crédit',
        'interest calculation methods': 'méthodes de calcul d\'intérêts',
        'payment frequencies': 'fréquences de paiement',
        'fee types': 'types de frais',
        'loan applications': 'demandes de prêts',
    }
    return plurals.get(entity, entity)

def translate_content(content: str) -> str:
    """Apply all translations to content"""
    # Apply simple string replacements
    for english, french in SIMPLE_TRANSLATIONS.items():
        content = content.replace(english, french)

    # Apply regex patterns
    for pattern, replacement in PATTERNS:
        if callable(replacement):
            content = re.sub(pattern, replacement, content)
        else:
            content = re.sub(pattern, replacement, content)

    return content

def translate_file(file_path: Path) -> bool:
    """Translate a single file, return True if changed"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        translated_content = translate_content(original_content)

        if translated_content != original_content:
            # Create backup
            backup_path = file_path.with_suffix(file_path.suffix + '.bak')
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)

            # Write translated content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(translated_content)

            return True
        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    if not BASE_DIR.exists():
        print(f"Error: Base directory not found: {BASE_DIR}")
        return

    # Find all .tsx and .ts files (excluding .d.ts)
    tsx_files = list(BASE_DIR.rglob("*.tsx"))
    ts_files = [f for f in BASE_DIR.rglob("*.ts") if not f.name.endswith('.d.ts')]

    all_files = tsx_files + ts_files

    print(f"Found {len(all_files)} files to process")
    print(f"  - {len(tsx_files)} .tsx files")
    print(f"  - {len(ts_files)} .ts files")
    print()

    translated_count = 0
    skipped_count = 0

    for file_path in sorted(all_files):
        if translate_file(file_path):
            translated_count += 1
            rel_path = file_path.relative_to(BASE_DIR)
            print(f"[OK] Translated: {rel_path}")
        else:
            skipped_count += 1

    print()
    print("="* 60)
    print(f"Translation complete!")
    print(f"  - {translated_count} files modified")
    print(f"  - {skipped_count} files unchanged")
    print(f"  - {len(all_files)} total files processed")
    print(f"  - Backups created with .bak extension")
    print("="* 60)

if __name__ == "__main__":
    main()
