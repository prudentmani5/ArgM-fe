'use client';

import { InputText } from 'primereact/inputtext';
import { CategorieVehiculeSortieMagasin } from './CategorieVehiculeSortieMagasin';

interface Props {
  categorie: CategorieVehiculeSortieMagasin;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CategorieVehiculeSortieMagasinForm: React.FC<Props> = ({ categorie, handleChange }) => {
  return (
    <div className="card p-fluid">
      <div className="formgrid grid">
        <div className="field col-12">
          <label htmlFor="libelle">Libelle</label>
          <InputText id="libelle" name="libelle" value={categorie.libelle} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
};

export default CategorieVehiculeSortieMagasinForm;
