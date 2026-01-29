#!/bin/bash

# Translation script for Financial Products module
# This script applies systematic translations to all TSX/TS files

BASE_DIR="C:\\Users\\prudence.manirakiza\\Documents\\AgrM\\AgrM-fe\\app\\(AgrM-fe)\\financialProducts"

# Find all .tsx and .ts files
find "$BASE_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "*.d.ts" | while read -r file; do
    echo "Processing: $file"

    # Create backup
    cp "$file" "$file.bak"

    # Apply translations using sed
    sed -i "s/summary: 'Success'/summary: 'Succès'/g" "$file"
    sed -i "s/summary: 'Error'/summary: 'Erreur'/g" "$file"
    sed -i "s/summary: \"Success\"/summary: \"Succès\"/g" "$file"
    sed -i "s/summary: \"Error\"/summary: \"Erreur\"/g" "$file"

    # Validation messages
    sed -i "s/detail: 'Please fill required fields'/detail: 'Veuillez remplir les champs obligatoires'/g" "$file"
    sed -i "s/detail: \"Please fill required fields\"/detail: \"Veuillez remplir les champs obligatoires\"/g" "$file"

    # Status tags
    sed -i "s/value={rowData\\.isActive ? 'Active' : 'Inactive'}/value={rowData.isActive ? 'Actif' : 'Inactif'}/g" "$file"
    sed -i "s/value=\"Default\"/value=\"Par défaut\"/g" "$file"
    sed -i "s/value='Default'/value='Par défaut'/g" "$file"

    # Button labels - using word boundaries
    sed -i "s/label=\"Save\"/label=\"Enregistrer\"/g" "$file"
    sed -i "s/label='Save'/label='Enregistrer'/g" "$file"
    sed -i "s/label=\"Update\"/label=\"Modifier\"/g" "$file"
    sed -i "s/label='Update'/label='Modifier'/g" "$file"
    sed -i "s/label=\"Cancel\"/label=\"Annuler\"/g" "$file"
    sed -i "s/label='Cancel'/label='Annuler'/g" "$file"
    sed -i "s/label=\"Delete\"/label=\"Supprimer\"/g" "$file"
    sed -i "s/label='Delete'/label='Supprimer'/g" "$file"
    sed -i "s/label=\"Yes\"/label=\"Oui\"/g" "$file"
    sed -i "s/label='Yes'/label='Oui'/g" "$file"
    sed -i "s/label=\"No\"/label=\"Non\"/g" "$file"
    sed -i "s/label='No'/label='Non'/g" "$file"
    sed -i "s/label=\"Submit\"/label=\"Soumettre\"/g" "$file"
    sed -i "s/label=\"Approve\"/label=\"Approuver\"/g" "$file"
    sed -i "s/label=\"Reject\"/label=\"Rejeter\"/g" "$file"
    sed -i "s/label=\"Verify\"/label=\"Vérifier\"/g" "$file"
    sed -i "s/label=\"Search\"/label=\"Rechercher\"/g" "$file"
    sed -i "s/label=\"Upload\"/label=\"Télécharger\"/g" "$file"

    # Placeholders
    sed -i 's/placeholder="Search\\.\\.\\."/placeholder="Rechercher..."/g' "$file"
    sed -i "s/placeholder='Search\\.\\.\\.'/ placeholder='Rechercher...'/g" "$file"

    # Table headers
    sed -i 's/header="Name"/header="Nom"/g' "$file"
    sed -i 's/header="Status"/header="Statut"/g' "$file"
    sed -i 's/header="Symbol"/header="Symbole"/g' "$file"
    sed -i 's/header="Decimals"/header="Décimales"/g' "$file"
    sed -i 's/header="Default"/header="Par défaut"/g' "$file"

    # Dialog headers
    sed -i 's/header="Confirm"/header="Confirmer"/g' "$file"

    # Form labels
    sed -i 's/<h5>Basic Information<\\/h5>/<h5>Informations de Base<\\/h5>/g' "$file"
    sed -i 's/<label htmlFor="name">Name \\*<\\/label>/<label htmlFor="name">Nom *<\\/label>/g' "$file"
    sed -i 's/<label htmlFor="isActive">Active<\\/label>/<label htmlFor="isActive">Actif<\\/label>/g' "$file"
    sed -i 's/<label htmlFor="symbol">Symbol<\\/label>/<label htmlFor="symbol">Symbole<\\/label>/g' "$file"

    # Confirmation dialog
    sed -i 's/Are you sure you want to delete/Êtes-vous sûr de vouloir supprimer/g' "$file"

done

echo "Translation complete!"
