// StkExerciceForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { StkExercice } from "./StkExercice";

interface StkExerciceProps {
    stkExercice: StkExercice;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateChange: (name: string, value: string) => void;
}

const StkExerciceForm: React.FC<StkExerciceProps> = ({ stkExercice, handleChange, handleDateChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="exerciceId">ID Exercice</label>
                    <InputText id="exerciceId" type="text" name="exerciceId" value={stkExercice.exerciceId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText id="libelle" type="text" name="libelle" value={stkExercice.libelle} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="annee">Année</label>
                    <InputText id="annee" type="text" name="annee" value={stkExercice.annee || ''} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="magasinId">Magasin ID</label>
                    <InputText id="magasinId" type="text" name="magasinId" value={stkExercice.magasinId || ''} onChange={handleChange} />
                </div>


                <div className="field col-6">
                    <label htmlFor="dateDebut">Date Début</label>
                    <Calendar
                        id="dateDebut"
                        name="dateDebut"
                        value={stkExercice.dateDebut ? new Date(stkExercice.dateDebut) : null}
                        onChange={(e) => {
                            if (e.value) {
                                // Crée une date ISO sans le décalage horaire
                                const date = new Date();
                                const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                handleDateChange('dateDebut', isoString);
                            } else {
                                handleDateChange('dateDebut', '');
                            }
                        }}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>




                  <div className="field col-6">
                    <label htmlFor="dateFin">Date Fin</label>
                    <Calendar
                        id="dateFin"
                        name="dateFin"
                        value={stkExercice.dateFin ? new Date(stkExercice.dateFin) : null}
                        onChange={(e) => {
                            if (e.value) {
                                // Crée une date ISO sans le décalage horaire
                                const date = new Date();
                                const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                handleDateChange('dateFin', isoString);
                            } else {
                                handleDateChange('dateFin', '');
                            }
                        }}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>







                
                <div className="field col-6">
                    <label htmlFor="userCloture">User Clôture</label>
                    <InputText id="userCloture" type="text" name="userCloture" value={stkExercice.userCloture || ''} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
}

export default StkExerciceForm;