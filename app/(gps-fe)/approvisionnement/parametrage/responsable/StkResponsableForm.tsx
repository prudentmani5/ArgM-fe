// StkResponsableForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { StkResponsable } from "./StkResponsable";

interface StkResponsableProps {
    responsable: StkResponsable;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StkResponsableForm: React.FC<StkResponsableProps> = ({ 
    responsable, 
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="responsableId">ID Responsable</label>
                    <InputText 
                        id="responsableId" 
                        type="text" 
                        name="responsableId" 
                        value={responsable.responsableId} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="nom">Nom</label>
                    <InputText 
                        id="nom" 
                        type="text" 
                        name="nom" 
                        value={responsable.nom} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="adresse">Adresse</label>
                    <InputText 
                        id="adresse" 
                        type="text" 
                        name="adresse" 
                        value={responsable.adresse || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="email">Email</label>
                    <InputText 
                        id="email" 
                        type="text" 
                        name="email" 
                        value={responsable.email || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="tel">Téléphone</label>
                    <InputText 
                        id="tel" 
                        type="text" 
                        name="tel" 
                        value={responsable.tel || ''} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
    );
}

export default StkResponsableForm;