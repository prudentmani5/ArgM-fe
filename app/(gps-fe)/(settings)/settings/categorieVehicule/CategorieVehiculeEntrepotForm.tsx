'use client';

import { InputText } from 'primereact/inputtext';
import { CategorieVehiculeEntrepot } from './CategorieVehiculeEntrepot';

interface Props {
  categorie: CategorieVehiculeEntrepot;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CategorieVehiculeEntrepotForm: React.FC<Props> = ({ categorie, handleChange }) => {
  return (
    <div className="card p-fluid">
      <div className="formgrid grid">
        <div className="field col-12">
          <label htmlFor="libelle">Libellé</label>
          <InputText id="libelle" name="libelle" value={categorie.libelle} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
};

export default CategorieVehiculeEntrepotForm;
