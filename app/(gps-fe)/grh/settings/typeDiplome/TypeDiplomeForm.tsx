'use client';

import { InputText } from "primereact/inputtext";
import { TypeDiplome } from "./TypeDiplome";

interface Props {
    typeDiplome: TypeDiplome;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TypeDiplomeForm: React.FC<Props> = ({ typeDiplome, handleChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="typeDiplomeId">Code</label>
                    <InputText id="typeDiplomeId" type="text" name="typeDiplomeId" value={typeDiplome.typeDiplomeId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="diplome">Diplôme</label>
                    <InputText id="diplome" type="text" name="diplome" value={typeDiplome.diplome} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
}

export default TypeDiplomeForm;
