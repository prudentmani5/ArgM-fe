#!/usr/bin/env python3
"""
Supplementary translation script for remaining English text
Handles edge cases and specific fields that might have been missed
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(r"C:\Users\prudence.manirakiza\Documents\AgrM\AgrM-fe\app\(AgrM-fe)\financialProducts")

# Additional translations for specific fields
ADDITIONAL_TRANSLATIONS = {
    # Field-specific headers
    'header="Payments/Year"': 'header="Paiements/An"',
    'header="Days"': 'header="Jours"',
    'header="Months"': 'header="Mois"',
    'header="Years"': 'header="Années"',
    'header="Weeks"': 'header="Semaines"',
    'header="Factor"': 'header="Facteur"',
    'header="Weight"': 'header="Poids"',
    'header="Min Amount"': 'header="Montant Min"',
    'header="Max Amount"': 'header="Montant Max"',
    'header="Min Rate"': 'header="Taux Min"',
    'header="Max Rate"': 'header="Taux Max"',
    'header="Min Term"': 'header="Terme Min"',
    'header="Max Term"': 'header="Terme Max"',
    'header="Grace Period"': 'header="Période de Grâce"',
    'header="Required"': 'header="Obligatoire"',
    'header="Mandatory"': 'header="Obligatoire"',
    'header="Optional"': 'header="Optionnel"',
    'header="Percentage"': 'header="Pourcentage"',
    'header="Fixed Amount"': 'header="Montant Fixe"',
    'header="Minimum"': 'header="Minimum"',
    'header="Maximum"': 'header="Maximum"',
    'header="Duration"': 'header="Durée"',
    'header="Channel"': 'header="Canal"',
    'header="Partner"': 'header="Partenaire"',
    'header="Provider"': 'header="Fournisseur"',
    'header="Operator"': 'header="Opérateur"',
    'header="Account Number"': 'header="Numéro de Compte"',
    'header="Contact"': 'header="Contact"',
    'header="Email"': 'header="Email"',
    'header="Phone"': 'header="Téléphone"',
    'header="Address"': 'header="Adresse"',
    'header="Date"': 'header="Date"',
    'header="Created"': 'header="Créé"',
    'header="Updated"': 'header="Modifié"',
    'header="Created At"': 'header="Créé le"',
    'header="Updated At"': 'header="Modifié le"',

    # Form labels that might have been missed
    '<label htmlFor="paymentsPerYear">Payments per Year</label>': '<label htmlFor="paymentsPerYear">Paiements par An</label>',
    '<label htmlFor="days">Days</label>': '<label htmlFor="days">Jours</label>',
    '<label htmlFor="months">Months</label>': '<label htmlFor="months">Mois</label>',
    '<label htmlFor="years">Years</label>': '<label htmlFor="years">Années</label>',
    '<label htmlFor="weeks">Weeks</label>': '<label htmlFor="weeks">Semaines</label>',
    '<label htmlFor="weight">Weight</label>': '<label htmlFor="weight">Poids</label>',
    '<label htmlFor="factor">Factor</label>': '<label htmlFor="factor">Facteur</label>',
    '<label htmlFor="percentage">Percentage</label>': '<label htmlFor="percentage">Pourcentage</label>',
    '<label htmlFor="minAmount">Minimum Amount</label>': '<label htmlFor="minAmount">Montant Minimum</label>',
    '<label htmlFor="maxAmount">Maximum Amount</label>': '<label htmlFor="maxAmount">Montant Maximum</label>',
    '<label htmlFor="minRate">Minimum Rate</label>': '<label htmlFor="minRate">Taux Minimum</label>',
    '<label htmlFor="maxRate">Maximum Rate</label>': '<label htmlFor="maxRate">Taux Maximum</label>',
    '<label htmlFor="minTerm">Minimum Term</label>': '<label htmlFor="minTerm">Terme Minimum</label>',
    '<label htmlFor="maxTerm">Maximum Term</label>': '<label htmlFor="maxTerm">Terme Maximum</label>',
    '<label htmlFor="gracePeriod">Grace Period</label>': '<label htmlFor="gracePeriod">Période de Grâce</label>',
    '<label htmlFor="required">Required</label>': '<label htmlFor="required">Obligatoire</label>',
    '<label htmlFor="mandatory">Mandatory</label>': '<label htmlFor="mandatory">Obligatoire</label>',
    '<label htmlFor="optional">Optional</label>': '<label htmlFor="optional">Optionnel</label>',
    '<label htmlFor="duration">Duration</label>': '<label htmlFor="duration">Durée</label>',
    '<label htmlFor="channel">Channel</label>': '<label htmlFor="channel">Canal</label>',
    '<label htmlFor="partner">Partner</label>': '<label htmlFor="partner">Partenaire</label>',
    '<label htmlFor="provider">Provider</label>': '<label htmlFor="provider">Fournisseur</label>',
    '<label htmlFor="operator">Operator</label>': '<label htmlFor="operator">Opérateur</label>',
    '<label htmlFor="accountNumber">Account Number</label>': '<label htmlFor="accountNumber">Numéro de Compte</label>',
    '<label htmlFor="contact">Contact</label>': '<label htmlFor="contact">Contact</label>',
    '<label htmlFor="email">Email</label>': '<label htmlFor="email">Email</label>',
    '<label htmlFor="phone">Phone</label>': '<label htmlFor="phone">Téléphone</label>',
    '<label htmlFor="address">Address</label>': '<label htmlFor="address">Adresse</label>',

    # Status values
    'value="DRAFT"': 'value="BROUILLON"',
    'value="ACTIVE"': 'value="ACTIF"',
    'value="PENDING"': 'value="EN ATTENTE"',
    'value="SUBMITTED"': 'value="SOUMISE"',
    'value="UNDER_REVIEW"': 'value="EN RÉVISION"',
    'value="APPROVED"': 'value="APPROUVÉE"',
    'value="REJECTED"': 'value="REJETÉE"',
    'value="DISBURSED"': 'value="DÉCAISSÉE"',
    'value="WITHDRAWN"': 'value="RETIRÉE"',
    'value="IN_PROGRESS"': 'value="EN COURS"',
    'value="COMPLETED"': 'value="TERMINÉE"',
    'value="VERIFIED"': 'value="VÉRIFIÉE"',

    # Additional button labels
    'label="Capture GPS"': 'label="Capturer GPS"',
    'label="Add"': 'label="Ajouter"',
    'label="Remove"': 'label="Retirer"',
    'label="Clear"': 'label="Effacer"',
    'label="Reset"': 'label="Réinitialiser"',
    'label="Close"': 'label="Fermer"',
    'label="Back"': 'label="Retour"',
    'label="Next"': 'label="Suivant"',
    'label="Previous"': 'label="Précédent"',
    'label="Finish"': 'label="Terminer"',
    'label="View"': 'label="Voir"',
    'label="Print"': 'label="Imprimer"',
    'label="Export"': 'label="Exporter"',
    'label="Import"': 'label="Importer"',
    'label="Download"': 'label="Télécharger"',
    'label="Refresh"': 'label="Actualiser"',
    'label="Filter"': 'label="Filtrer"',
}

def translate_file(file_path: Path) -> bool:
    """Apply additional translations to a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Apply additional translations
        for english, french in ADDITIONAL_TRANSLATIONS.items():
            content = content.replace(english, french)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    if not BASE_DIR.exists():
        print(f"Error: Base directory not found: {BASE_DIR}")
        return

    # Find all .tsx files
    tsx_files = list(BASE_DIR.rglob("*.tsx"))

    print(f"Found {len(tsx_files)} .tsx files to check for remaining translations")
    print()

    translated_count = 0

    for file_path in sorted(tsx_files):
        if translate_file(file_path):
            translated_count += 1
            rel_path = file_path.relative_to(BASE_DIR)
            print(f"[OK] Updated: {rel_path}")

    print()
    print("="* 60)
    print(f"Supplementary translation complete!")
    print(f"  - {translated_count} files modified")
    print(f"  - {len(tsx_files) - translated_count} files unchanged")
    print("="* 60)

if __name__ == "__main__":
    main()
