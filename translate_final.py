#!/usr/bin/env python3
"""
Final translation pass for complex cases and mixed English/French text
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(r"C:\Users\prudence.manirakiza\Documents\AgrM\AgrM-fe\app\(AgrM-fe)\financialProducts")

# Final translations for complex cases
FINAL_TRANSLATIONS = {
    # Mixed confirm messages
    "confirm('Êtes-vous sûr de vouloir supprimer this": "confirm('Êtes-vous sûr de vouloir supprimer cette",

    # Status labels in dropdowns
    "{ label: 'All Statuses', value: '' }": "{ label: 'Tous les Statuts', value: '' }",
    "{ label: 'Pending', value: 'PENDING' }": "{ label: 'En Attente', value: 'PENDING' }",
    "{ label: 'Submitted', value: 'SUBMITTED' }": "{ label: 'Soumise', value: 'SUBMITTED' }",
    "{ label: 'Under Review', value: 'UNDER_REVIEW' }": "{ label: 'En Révision', value: 'UNDER_REVIEW' }",
    "{ label: 'Approved', value: 'APPROVED' }": "{ label: 'Approuvée', value: 'APPROVED' }",
    "{ label: 'Rejected', value: 'REJECTED' }": "{ label: 'Rejetée', value: 'REJECTED' }",
    "{ label: 'Withdrawn', value: 'WITHDRAWN' }": "{ label: 'Retirée', value: 'WITHDRAWN' }",
    "{ label: 'Disbursed', value: 'DISBURSED' }": "{ label: 'Décaissée', value: 'DISBURSED' }",
    "{ label: 'Completed', value: 'COMPLETED' }": "{ label: 'Terminée', value: 'COMPLETED' }",
    "{ label: 'In Progress', value: 'IN_PROGRESS' }": "{ label: 'En Cours', value: 'IN_PROGRESS' }",
    "{ label: 'Verified', value: 'VERIFIED' }": "{ label: 'Vérifiée', value: 'VERIFIED' }",
    "{ label: 'Draft', value: 'DRAFT' }": "{ label: 'Brouillon', value: 'DRAFT' }",
    "{ label: 'Active', value: 'ACTIVE' }": "{ label: 'Actif', value: 'ACTIVE' }",

    # Error messages in detail
    "detail: 'Failed to load": "detail: 'Échec du chargement de",
    "detail: 'Failed to save": "detail: 'Échec de la sauvegarde de",
    "detail: 'Failed to delete": "detail: 'Échec de la suppression de",
    "detail: 'Failed to submit": "detail: 'Échec de la soumission de",
    "detail: 'Failed to approve": "detail: 'Échec de l\\'approbation de",
    "detail: 'Failed to reject": "detail: 'Échec du rejet de",

    # Success messages with specific entities
    "detail: 'Loan application saved successfully'": "detail: 'Demande de prêt enregistrée avec succès'",
    "detail: 'Loan application submitted successfully'": "detail: 'Demande de prêt soumise avec succès'",
    "detail: 'Loan application approved successfully'": "detail: 'Demande de prêt approuvée avec succès'",
    "detail: 'Loan application rejected successfully'": "detail: 'Demande de prêt rejetée avec succès'",
    "detail: 'Loan application deleted successfully'": "detail: 'Demande de prêt supprimée avec succès'",
    "detail: 'Loan product saved successfully'": "detail: 'Produit de crédit enregistré avec succès'",
    "detail: 'Document uploaded successfully'": "detail: 'Document téléchargé avec succès'",
    "detail: 'File uploaded successfully'": "detail: 'Fichier téléchargé avec succès'",
    "detail: 'Photo uploaded successfully'": "detail: 'Photo téléchargée avec succès'",

    # Toolbar and action labels
    "icon='pi pi-plus'": "icon='pi pi-plus'",  # Keep icons as is
    "title='New'": "title='Nouveau'",
    "title='Edit'": "title='Modifier'",
    "title='Delete'": "title='Supprimer'",
    "title='View'": "title='Voir'",
    "title='Export'": "title='Exporter'",
    "title='Import'": "title='Importer'",

    # Additional column headers
    'header="Application No"': 'header="No de Demande"',
    'header="Applicant"': 'header="Demandeur"',
    'header="Product"': 'header="Produit"',
    'header="Amount Requested"': 'header="Montant Demandé"',
    'header="Term"': 'header="Terme"',
    'header="Interest Rate"': 'header="Taux d\'Intérêt"',
    'header="Monthly Payment"': 'header="Paiement Mensuel"',
    'header="Application Date"': 'header="Date de Demande"',
    'header="Submitted Date"': 'header="Date de Soumission"',
    'header="Approved Date"': 'header="Date d\'Approbation"',
    'header="Disbursement Date"': 'header="Date de Décaissement"',
    'header="Progress"': 'header="Progrès"',
    'header="Stage"': 'header="Étape"',
    'header="Score"': 'header="Score"',
    'header="Risk Level"': 'header="Niveau de Risque"',
    'header="Decision"': 'header="Décision"',
    'header="Comments"': 'header="Commentaires"',
    'header="Notes"': 'header="Notes"',
    'header="Condition"': 'header="Condition"',
    'header="Guarantee"': 'header="Garantie"',
    'header="Value"': 'header="Valeur"',
    'header="Document"': 'header="Document"',
    'header="File"': 'header="Fichier"',
    'header="Verified"': 'header="Vérifié"',
    'header="Approved By"': 'header="Approuvé par"',
    'header="Reviewer"': 'header="Réviseur"',
    'header="Officer"': 'header="Agent"',

    # Dialog titles
    'header="Submit Application"': 'header="Soumettre la Demande"',
    'header="Approve Application"': 'header="Approuver la Demande"',
    'header="Reject Application"': 'header="Rejeter la Demande"',
    'header="Upload Document"': 'header="Télécharger un Document"',
    'header="Add Guarantee"': 'header="Ajouter une Garantie"',
    'header="Field Visit"': 'header="Visite sur Terrain"',
    'header="Risk Assessment"': 'header="Évaluation des Risques"',
    'header="Committee Review"': 'header="Révision du Comité"',

    # Empty messages for specific entities
    'emptyMessage="No loan applications found"': 'emptyMessage="Aucune demande de prêt trouvée"',
    'emptyMessage="No loan products found"': 'emptyMessage="Aucun produit de crédit trouvé"',
    'emptyMessage="No documents found"': 'emptyMessage="Aucun document trouvé"',
    'emptyMessage="No guarantees found"': 'emptyMessage="Aucune garantie trouvée"',
    'emptyMessage="No fees found"': 'emptyMessage="Aucun frais trouvé"',
    'emptyMessage="No sectors found"': 'emptyMessage="Aucun secteur trouvé"',
    'emptyMessage="No workflows found"': 'emptyMessage="Aucun workflow trouvé"',
    'emptyMessage="No conditions found"': 'emptyMessage="Aucune condition trouvée"',
    'emptyMessage="No income sources found"': 'emptyMessage="Aucune source de revenu trouvée"',
    'emptyMessage="No expenses found"': 'emptyMessage="Aucune dépense trouvée"',
    'emptyMessage="No references found"': 'emptyMessage="Aucune référence trouvée"',
    'emptyMessage="No visits found"': 'emptyMessage="Aucune visite trouvée"',
    'emptyMessage="No photos found"': 'emptyMessage="Aucune photo trouvée"',
    'emptyMessage="No sessions found"': 'emptyMessage="Aucune session trouvée"',
    'emptyMessage="No members found"': 'emptyMessage="Aucun membre trouvé"',
    'emptyMessage="No reviews found"': 'emptyMessage="Aucune révision trouvée"',
    'emptyMessage="No assessments found"': 'emptyMessage="Aucune évaluation trouvée"',
    'emptyMessage="No records found"': 'emptyMessage="Aucun enregistrement trouvé"',

    # Specific entity names
    'loan applications': 'demandes de prêt',
    'loan application': 'demande de prêt',
    'loan products': 'produits de crédit',
    'loan product': 'produit de crédit',
}

# Patterns that need regex
REGEX_PATTERNS = [
    # Fix mixed translations in confirm dialogs
    (r"confirm\('Êtes-vous sûr de vouloir supprimer this ([^']+)'\)", r"confirm('Êtes-vous sûr de vouloir supprimer cette \1')"),
    (r"confirm\('Êtes-vous sûr de vouloir supprimer the ([^']+)'\)", r"confirm('Êtes-vous sûr de vouloir supprimer \1')"),

    # Fix "Failed to" messages
    (r"detail: 'Failed to load ([^']+)'", r"detail: 'Échec du chargement de \1'"),
    (r"detail: 'Failed to save ([^']+)'", r"detail: 'Échec de la sauvegarde de \1'"),
    (r"detail: 'Failed to delete ([^']+)'", r"detail: 'Échec de la suppression de \1'"),
]

def translate_file(file_path: Path) -> bool:
    """Apply final translations to a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Apply direct translations
        for english, french in FINAL_TRANSLATIONS.items():
            content = content.replace(english, french)

        # Apply regex patterns
        for pattern, replacement in REGEX_PATTERNS:
            content = re.sub(pattern, replacement, content)

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

    print(f"Found {len(tsx_files)} .tsx files for final translation pass")
    print()

    translated_count = 0

    for file_path in sorted(tsx_files):
        if translate_file(file_path):
            translated_count += 1
            rel_path = file_path.relative_to(BASE_DIR)
            print(f"[OK] Updated: {rel_path}")

    print()
    print("="* 60)
    print(f"Final translation pass complete!")
    print(f"  - {translated_count} files modified")
    print(f"  - {len(tsx_files) - translated_count} files unchanged")
    print("="* 60)

if __name__ == "__main__":
    main()
