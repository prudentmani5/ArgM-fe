'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { RetenueParametre } from "./RetenueParametre";

interface RetenueParametreProps {
    retenueParametre: RetenueParametre;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (field: string, checked: boolean) => void;
    isEditMode?: boolean;
}

const RetenueParametreForm: React.FC<RetenueParametreProps> = ({
    retenueParametre,
    handleChange,
    handleCheckboxChange,
    isEditMode = false
}) => {

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="codeRet">Code *</label>
                    <InputText
                        id="codeRet"
                        name="codeRet"
                        value={retenueParametre.codeRet}
                        onChange={handleChange}
                        maxLength={3}
                        required
                        disabled={isEditMode}
                        style={{ textTransform: 'uppercase' }}
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="libelleRet">Libellé *</label>
                    <InputText
                        id="libelleRet"
                        name="libelleRet"
                        value={retenueParametre.libelleRet}
                        onChange={handleChange}
                        maxLength={100}
                        required
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="imposable" className="ml-2">Imposable</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="imposable"
                            checked={retenueParametre.imposable}
                            onChange={(e) => handleCheckboxChange('imposable', e.checked || false)}
                        />
                    </div>
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="estCredit" className="ml-2">Crédit</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="estCredit"
                            checked={retenueParametre.estCredit}
                            onChange={(e) => handleCheckboxChange('estCredit', e.checked || false)}
                        />
                        
                    </div>
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="compteCompta">Compte Comptable</label>
                    <InputText
                        id="compteCompta"
                        name="compteCompta"
                        value={retenueParametre.compteCompta}
                        onChange={handleChange}
                        maxLength={13}
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="actif" className="ml-2">Actif</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="actif"
                            checked={retenueParametre.actif}
                            onChange={(e) => handleCheckboxChange('actif', e.checked || false)}
                        />
                    </div>
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="displayInPaymentToDO" className="ml-2">Afficher dans la liste des paiements à effectuer</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="displayInPaymentToDO"
                            checked={retenueParametre.displayInPaymentToDO}
                            onChange={(e) => handleCheckboxChange('displayInPaymentToDO', e.checked || false)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RetenueParametreForm;