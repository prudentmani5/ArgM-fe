// StkTypeMvtForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { StkTypeMvt } from "./StkTypeMvt";

interface StkTypeMvtProps {
    stkTypeMvt: StkTypeMvt;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const StkTypeMvtForm: React.FC<StkTypeMvtProps> = ({stkTypeMvt, handleChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="typeMvtId">ID Type Mouvement</label>
                    <InputText id="typeMvtId" type="text" name="typeMvtId" value={stkTypeMvt.typeMvtId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText id="libelle" type="text" name="libelle" value={stkTypeMvt.libelle} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="sens">Sens</label>
                    <InputText id="sens" type="text" name="sens" value={stkTypeMvt.sens} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
}

export default StkTypeMvtForm;