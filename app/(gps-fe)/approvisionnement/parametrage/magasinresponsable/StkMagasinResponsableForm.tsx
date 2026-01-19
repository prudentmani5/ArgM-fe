// StkMagasinResponsableForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { StkMagasinResponsable } from "./StkMagasinResponsable";
import { Magasin } from "../../parametrage/magasin/Magasin";
import { StkResponsable } from "../../parametrage/responsable/StkResponsable";
import React from 'react';

interface StkMagasinResponsableProps {
    stkMagasinResponsable: StkMagasinResponsable;
    magasins: Magasin[];
    responsables: StkResponsable[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
}

const StkMagasinResponsableForm: React.FC<StkMagasinResponsableProps> = ({
    stkMagasinResponsable,
    magasins,
    responsables,
    loadingStatus,
    handleChange,
    handleDropdownChange,
    handleCheckboxChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="magRespId">ID Magasin Responsable</label>
                    <InputText
                        id="magRespId"
                        name="magRespId"
                        value={stkMagasinResponsable.magRespId}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="magasinId">Magasin</label>
                    <Dropdown
                        id="magasinId"
                        name="magasinId"
                        value={stkMagasinResponsable.magasinId}
                        options={magasins}
                        onChange={handleDropdownChange}
                        optionLabel="nom"
                        optionValue="magasinId"
                        placeholder="Sélectionner un magasin"
                        filter
                        filterBy="nom"
                        showClear
                        disabled={loadingStatus}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="responsableId">Responsable</label>
                    <Dropdown
                        id="responsableId"
                        name="responsableId"
                        value={stkMagasinResponsable.responsableId}
                        options={responsables}
                        onChange={handleDropdownChange}
                        optionLabel="nom" // Supposons que StkResponsable a un champ nom
                        optionValue="responsableId"
                        placeholder="Sélectionner un responsable"
                        filter
                        filterBy="nom"
                        showClear
                        disabled={loadingStatus}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="actif">Actif</label>
                    <Checkbox
                        inputId="actif"
                        name="actif"
                        checked={stkMagasinResponsable.actif}
                        onChange={handleCheckboxChange}
                        disabled={loadingStatus}
                    />
                </div>
            </div>
        </div>
    );
};

export default StkMagasinResponsableForm;