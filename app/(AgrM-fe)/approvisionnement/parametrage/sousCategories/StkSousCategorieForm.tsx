'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { StkSousCategorie } from "./StkSousCategorie";
import { useEffect, useState } from "react";

interface StkSousCategorieFormProps {
    stkSousCategorie: StkSousCategorie;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    categories: any[];
    loading?: boolean;
    existingIds?: string[];
}

const StkSousCategorieForm: React.FC<StkSousCategorieFormProps> = ({ 
    stkSousCategorie, 
    handleChange, 
    categories,
    loading = false,
    existingIds = []
}) => {
    const [selectedCategorie, setSelectedCategorie] = useState<any>(null);

    useEffect(() => {
        // Trouver la catégorie correspondante
        if (stkSousCategorie.categorieId && categories.length > 0) {
            const categorie = categories.find(cat => 
                cat.categorieId === stkSousCategorie.categorieId || 
                cat.id === stkSousCategorie.categorieId ||
                cat.value === stkSousCategorie.categorieId
            );
            setSelectedCategorie(categorie);
        } else {
            setSelectedCategorie(null);
        }
    }, [stkSousCategorie.categorieId, categories]);

    const handleCategorieChange = (e: { value: any }) => {
        const selectedValue = e.value;
        setSelectedCategorie(selectedValue);
        
        // Récupérer l'ID Magasin depuis la catégorie sélectionnée
        const magasinId = selectedValue ? selectedValue.magasinId || selectedValue.magasin || '' : '';
        
        // Créer un événement synthétique pour mettre à jour le formulaire
        const syntheticEventCategorie = {
            target: {
                name: 'categorieId',
                value: selectedValue ? selectedValue.categorieId || selectedValue.id || selectedValue.value : ''
            }
        } as React.ChangeEvent<HTMLInputElement>;
        
        // Mettre à jour l'ID Magasin automatiquement
        const syntheticEventMagasin = {
            target: {
                name: 'magasinId',
                value: magasinId
            }
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleChange(syntheticEventCategorie);
        handleChange(syntheticEventMagasin);
    };

    // Vérifier si l'ID existe déjà
    const isIdDuplicate = existingIds.includes(stkSousCategorie.sousCategorieId);

    // Transformer les catégories pour le Dropdown
    const categoryOptions = categories.map(cat => ({
        label: cat.libelle || cat.nom || cat.label || cat.categorieId || cat.id || 'Catégorie sans nom',
        value: cat
    }));

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="sousCategorieId">Code Sous-Catégorie *</label>
                    <InputText 
                        id="sousCategorieId" 
                        type="text" 
                        name="sousCategorieId" 
                        value={stkSousCategorie.sousCategorieId} 
                        onChange={handleChange} 
                        required
                        className={`w-full ${isIdDuplicate && stkSousCategorie.sousCategorieId ? 'p-invalid' : ''}`}
                    />
                    {isIdDuplicate && stkSousCategorie.sousCategorieId && (
                        <small className="p-error">Cet ID existe déjà. Veuillez en choisir un autre.</small>
                    )}
                    <small className="p-error">Ce champ est obligatoire et doit être unique</small>
                </div>
                
                <div className="field col-12 md:col-6">
                    <label htmlFor="categorieId">Catégorie *</label>
                    <Dropdown
                        id="categorieId"
                        value={selectedCategorie}
                        onChange={handleCategorieChange}
                        options={categoryOptions}
                        optionLabel="label"
                        placeholder={loading ? "Chargement..." : "Sélectionnez une catégorie"}
                        className="w-full"
                        required
                        disabled={loading}
                        filter
                        filterBy="label"
                        showClear
                    />
                    {loading && (
                        <small className="p-text-secondary">Chargement des catégories...</small>
                    )}
                    <small className="p-error">Ce champ est obligatoire</small>
                    
                    {/* Affichage de l'ID Magasin récupéré automatiquement */}
                    {selectedCategorie && selectedCategorie.magasinId && (
                        <small className="p-text-secondary">
                            Magasin associé: {selectedCategorie.magasinId}
                        </small>
                    )}
                </div>
                
                <div className="field col-12 md:col-6">
                    <label htmlFor="libelle">Libellé *</label>
                    <InputText 
                        id="libelle" 
                        type="text" 
                        name="libelle" 
                        value={stkSousCategorie.libelle} 
                        onChange={handleChange} 
                        required
                        className="w-full"
                    />
                    <small className="p-error">Ce champ est obligatoire</small>
                </div>
                
                <div className="field col-12 md:col-6">
                    <label htmlFor="compte">Compte</label>
                    <InputText 
                        id="compte" 
                        type="text" 
                        name="compte" 
                        value={stkSousCategorie.compte} 
                        onChange={handleChange} 
                        className="w-full"
                    />
                </div>
                
                {/* Champ magasinId caché pour stocker la valeur */}
                <input 
                    type="hidden" 
                    name="magasinId" 
                    value={stkSousCategorie.magasinId || ''} 
                />
            </div>
        </div>
    );
}

export default StkSousCategorieForm;