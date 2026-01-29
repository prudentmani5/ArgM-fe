'use client';

import { InputText } from "primereact/inputtext";
import { StkSousCategorie } from "./StkSousCategorie";

interface StkSousCategorieProps {
    stkSousCategorie: StkSousCategorie;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const StkSousCategorieForm: React.FC<StkSousCategorieProps> = ({stkSousCategorie, handleChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="sousCategorieId">ID Sous-Catégorie</label>
                    <InputText id="sousCategorieId" type="text" name="sousCategorieId" value={stkSousCategorie.sousCategorieId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="categorieId">ID Catégorie</label>
                    <InputText id="categorieId" type="text" name="categorieId" value={stkSousCategorie.categorieId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="magasinId">ID Magasin</label>
                    <InputText id="magasinId" type="text" name="magasinId" value={stkSousCategorie.magasinId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText id="libelle" type="text" name="libelle" value={stkSousCategorie.libelle} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="compte">Compte</label>
                    <InputText id="compte" type="text" name="compte" value={stkSousCategorie.compte} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
}

export default StkSousCategorieForm;