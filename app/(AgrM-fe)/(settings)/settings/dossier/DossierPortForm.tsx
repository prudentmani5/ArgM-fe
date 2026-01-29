'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { DossierPort } from "./DossierPort";

interface DossierPortProps {
    dossierPort: DossierPort;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
}

const DossierPortForm: React.FC<DossierPortProps> = ({dossierPort, handleChange, handleNumberChange, handleDateChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="dossierId">ID Dossier</label>
                    <InputText id="dossierId" name="dossierId" value={dossierPort.dossierId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="nomDossier">Nom Dossier</label>
                    <InputText id="nomDossier" name="nomDossier" value={dossierPort.nomDossier} onChange={handleChange} />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="adresse">Adresse</label>
                    <InputText id="adresse" name="adresse" value={dossierPort.adresse} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="bp">BP</label>
                    <InputText id="bp" name="bp" value={dossierPort.bp} onChange={handleChange} />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="tel">Téléphone</label>
                    <InputText id="tel" name="tel" value={dossierPort.tel} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="fax">Fax</label>
                    <InputText id="fax" name="fax" value={dossierPort.fax} onChange={handleChange} />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="email">Email</label>
                    <InputText id="email" name="email" value={dossierPort.email} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="longueurCpte">Longueur Compte</label>
                    <InputNumber id="longueurCpte" name="longueurCpte" value={dossierPort.longueurCpte} 
                        onValueChange={(e) => handleNumberChange("longueurCpte", e.value?? null)} />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="dernierDateAmmo">Dernière Date Ammo</label>
                    <Calendar id="dernierDateAmmo" name="dernierDateAmmo" value={dossierPort.dernierDateAmmo} 
                        onChange={(e) => handleDateChange("dernierDateAmmo", e.value as Date)} showTime />
                </div>
                <div className="field col-6">
                    <label htmlFor="tauxTVA">Taux TVA</label>
                    <InputNumber id="tauxTVA" name="tauxTVA" value={dossierPort.tauxTVA} 
                        onValueChange={(e) => handleNumberChange("tauxTVA", e.value?? null)} mode="decimal" minFractionDigits={2} />
                </div>
                
                {/* Ajoutez les autres champs de la même manière */}
            </div>
        </div>
    );
};

export default DossierPortForm;