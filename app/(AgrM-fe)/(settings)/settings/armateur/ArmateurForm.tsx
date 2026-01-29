'use client';

import { InputText } from "primereact/inputtext";
import { Armateur } from "./Armateur";


interface ArmateurProps {
    armateur : Armateur;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}


const ArmateurForm: React.FC<ArmateurProps> = ({armateur, handleChange}) => {

return (
    <div className="card p-fluid">
        <div className="formgrid grid">
            <div className="field col-6">
                <label htmlFor="nom">Nom</label>
                <InputText id="nom" type="text" name="nom" value={armateur.nom} onChange={handleChange} />
            </div>
            <div className="field col-6">
                <label htmlFor="responsable">Responsable</label>
                <InputText id="responsable" type="text" name="responsable" value={armateur.responsable} onChange={handleChange} />
            </div>
            <div className="field col-6">
                <label htmlFor="tel">Tél</label>
                <InputText id="tel" type="text" name="tel" value={armateur.tel} onChange={handleChange} />
            </div>
            <div className="field col-6">
                <label htmlFor="fax">Fax</label>
                <InputText id="fax" type="text" name="fax" value={armateur.fax} onChange={handleChange} />
            </div>
        </div>
    </div>
);

}


export default ArmateurForm;