// StkServiceResponsableForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { StkServiceResponsable } from "./StkServiceResponsable";
import { Stkservice } from "../../parametrage/service/Stkservice";
import { StkResponsable } from "../../parametrage/responsable/StkResponsable";
import React from 'react';

interface StkServiceResponsableProps {
    stkServiceResponsable: StkServiceResponsable;
    services: Stkservice[];
    responsables: StkResponsable[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
}

const StkServiceResponsableForm: React.FC<StkServiceResponsableProps> = ({
    stkServiceResponsable,
    services,
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
                    <label htmlFor="servRespId">ID Service Responsable</label>
                    <InputText
                        id="servRespId"
                        name="servRespId"
                        value={stkServiceResponsable.servRespId}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="serviceId">Service</label>
                    <Dropdown
                        id="serviceId"
                        name="serviceId"
                        value={stkServiceResponsable.serviceId}
                        options={services}
                        onChange={handleDropdownChange}
                        optionLabel="libelle"
                        optionValue="serviceId"
                        placeholder="Sélectionner un service"
                        filter
                        filterBy="libelle"
                        showClear
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="responsableId">Responsable</label>
                    <Dropdown
                        id="responsableId"
                        name="responsableId"
                        value={stkServiceResponsable.responsableId}
                        options={responsables}
                        onChange={handleDropdownChange}
                        optionLabel="libelle" // Supposons que StkResponsable a un champ libelle
                        optionValue="responsableId"
                        placeholder="Sélectionner un responsable"
                        filter
                        filterBy="libelle"
                        showClear
                    />
                </div>

                <div className="field col-4">
                    <label htmlFor="actif">Actif</label>
                    <Checkbox
                        inputId="actif"
                        name="actif"
                        checked={stkServiceResponsable.actif}
                        onChange={handleCheckboxChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default StkServiceResponsableForm;