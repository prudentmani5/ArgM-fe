#!/usr/bin/env python3
"""
Automatic translation script for Financial Products module
Translates all English text to French in TSX files
"""

import os
import re
from pathlib import Path

# Translation mappings
TRANSLATIONS = {
    # Toast messages
    "summary: 'Success'": "summary: 'Succès'",
    "summary: 'Error'": "summary: 'Erreur'",
    "summary: 'Validation'": "summary: 'Validation'",
    "detail: 'Please fill required fields'": "detail: 'Veuillez remplir les champs obligatoires'",

    # Status tags
    "'Active'": "'Actif'",
    "'Inactive'": "'Inactif'",
    "'Default'": "'Par défaut'",
    "'DRAFT'": "'BROUILLON'",
    "'ACTIVE'": "'ACTIF'",
    "'PENDING'": "'EN ATTENTE'",
    "'SUBMITTED'": "'SOUMISE'",
    "'UNDER_REVIEW'": "'EN RÉVISION'",
    "'APPROVED'": "'APPROUVÉE'",
    "'REJECTED'": "'REJETÉE'",
    "'DISBURSED'": "'DÉCAISSÉE'",
    "'WITHDRAWN'": "'RETIRÉE'",
    "'IN_PROGRESS'": "'EN COURS'",
    "'COMPLETED'": "'TERMINÉE'",
    "'VERIFIED'": "'VÉRIFIÉE'",

    # Button labels
    "label=\"Save\"": "label=\"Enregistrer\"",
    "label=\"Update\"": "label=\"Modifier\"",
    "label=\"Cancel\"": "label=\"Annuler\"",
    "label=\"Delete\"": "label=\"Supprimer\"",
    "label=\"Submit\"": "label=\"Soumettre\"",
    "label=\"Approve\"": "label=\"Approuver\"",
    "label=\"Reject\"": "label=\"Rejeter\"",
    "label=\"Verify\"": "label=\"Vérifier\"",
    "label=\"New\"": "label=\"Nouveau\"",
    "label=\"Edit\"": "label=\"Modifier\"",
    "label=\"Search\"": "label=\"Rechercher\"",
    "label=\"Upload\"": "label=\"Télécharger\"",
    "label=\"Yes\"": "label=\"Oui\"",
    "label=\"No\"": "label=\"Non\"",
    "label='Save'": "label='Enregistrer'",
    "label='Update'": "label='Modifier'",
    "label='Cancel'": "label='Annuler'",
    "label='Delete'": "label='Supprimer'",
    "label='Yes'": "label='Oui'",
    "label='No'": "label='Non'",

    # Conditional labels
    "'Update' : 'Save'": "'Modifier' : 'Enregistrer'",
    "'Modifier' : 'Save'": "'Modifier' : 'Enregistrer'",

    # Placeholders
    'placeholder="Search..."': 'placeholder="Rechercher..."',
    "placeholder='Search...'": "placeholder='Rechercher...'",

    # Table headers
    'header="Code"': 'header="Code"',
    'header="Name"': 'header="Nom"',
    'header="Description"': 'header="Description"',
    'header="Status"': 'header="Statut"',
    'header="Actions"': 'header="Actions"',
    'header="Symbol"': 'header="Symbole"',
    'header="Decimals"': 'header="Décimales"',
    'header="Default"': 'header="Par défaut"',
    'header="Active"': 'header="Actif"',

    # Dialog headers
    'header="Confirm"': 'header="Confirmer"',

    # Form labels
    '<h5>Basic Information</h5>': '<h5>Informations de Base</h5>',
    '<label htmlFor="name">Name *</label>': '<label htmlFor="name">Nom *</label>',
    '<label htmlFor="symbol">Symbol</label>': '<label htmlFor="symbol">Symbole</label>',
    '<label htmlFor="decimalPlaces">Decimal Places</label>': '<label htmlFor="decimalPlaces">Décimales</label>',
    '<label htmlFor="isDefault">Default Currency</label>': '<label htmlFor="isDefault">Devise par Défaut</label>',
    '<label htmlFor="isActive">Active</label>': '<label htmlFor="isActive">Actif</label>',

    # Empty messages - general patterns
    'emptyMessage="No currencies found"': 'emptyMessage="Aucune devise trouvée"',
    'emptyMessage="No loan product types found"': 'emptyMessage="Aucun type de produit de crédit trouvé"',
    'emptyMessage="No interest calculation methods found"': 'emptyMessage="Aucune méthode de calcul d\'intérêt trouvée"',
    'emptyMessage="No payment frequencies found"': 'emptyMessage="Aucune fréquence de paiement trouvée"',
    'emptyMessage="No fee types found"': 'emptyMessage="Aucun type de frais trouvé"',
    'emptyMessage="No fee calculation methods found"': 'emptyMessage="Aucune méthode de calcul de frais trouvée"',

    # Manage headers - will need custom handling
    'Manage Currencies': 'Gérer les Devises',
    'Manage Loan Product Types': 'Gérer les Types de Produits de Crédit',
}

# Specific success message patterns
SUCCESS_PATTERNS = [
    (r"detail: '(\w+) created successfully'", r"detail: '\1 créé avec succès'"),
    (r"detail: '(\w+) updated successfully'", r"detail: '\1 modifié avec succès'"),
    (r"detail: '(\w+) deleted successfully'", r"detail: '\1 supprimé avec succès'"),
    (r'detail: "(\w+) created successfully"', r'detail: "\1 créé avec succès"'),
    (r'detail: "(\w+) updated successfully"', r'detail: "\1 modifié avec succès"'),
    (r'detail: "(\w+) deleted successfully"', r'detail: "\1 supprimé avec succès"'),
]

# Dialog confirmation patterns
DIALOG_PATTERNS = [
    (r'<span>Are you sure you want to delete <b>\{([^}]+)\}</b>\?</span>', r'<span>Êtes-vous sûr de vouloir supprimer <b>{\1}</b>?</span>'),
]

def translate_file(file_path):
    """Translate a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Apply direct translations
        for english, french in TRANSLATIONS.items():
            content = content.replace(english, french)

        # Apply pattern-based translations
        for pattern, replacement in SUCCESS_PATTERNS:
            content = re.sub(pattern, replacement, content)

        for pattern, replacement in DIALOG_PATTERNS:
            content = re.sub(pattern, replacement, content)

        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    base_dir = Path(r"C:\Users\prudence.manirakiza\Documents\AgrM\AgrM-fe\app\(AgrM-fe)\financialProducts")

    if not base_dir.exists():
        print(f"Base directory not found: {base_dir}")
        return

    # Find all .tsx and .ts files (excluding .d.ts)
    tsx_files = list(base_dir.rglob("*.tsx"))
    ts_files = [f for f in base_dir.rglob("*.ts") if not f.name.endswith('.d.ts')]

    all_files = tsx_files + ts_files

    print(f"Found {len(all_files)} files to process")

    translated_count = 0
    for file_path in all_files:
        if translate_file(file_path):
            translated_count += 1
            print(f"Translated: {file_path.relative_to(base_dir)}")

    print(f"\nTranslation complete: {translated_count}/{len(all_files)} files modified")

if __name__ == "__main__":
    main()
