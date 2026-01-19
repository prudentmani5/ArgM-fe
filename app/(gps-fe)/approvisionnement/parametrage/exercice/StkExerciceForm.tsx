// StkExerciceForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Nullable } from "primereact/ts-helpers";
import { StkExercice } from "./StkExercice";
import { StkMagasin } from "./StkMagasin";

interface StkExerciceProps {
    stkExercice: StkExercice;
    magasins: StkMagasin[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateChange: (name: string, value: string) => void;
    handleMagasinChange: (magasinId: string) => void;
}

const StkExerciceForm: React.FC<StkExerciceProps> = ({ 
    stkExercice, 
    magasins, 
    handleChange, 
    handleDateChange,
    handleMagasinChange 
}) => {
    
    const magasinOptions = magasins.map(magasin => ({
        label: magasin.nom,
        value: magasin.magasinId
    }));

    const formatDateForInput = (dateString: string): Date | null => {
        if (!dateString) return null;
        try {
            return new Date(dateString);
        } catch {
            return null;
        }
    };

    const handleCalendarChange = (name: string, value: Nullable<string | Date | Date[]>) => {
        if (value instanceof Date) {
            // Format YYYY-MM-DD pour la base de données
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, '0');
            const day = String(value.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            handleDateChange(name, formattedDate);
        } else if (value === null) {
            handleDateChange(name, '');
        }
        // Ignorer les autres types (string, Date[])
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="exerciceId">ID Exercice *</label>
                    <InputText 
                        id="exerciceId" 
                        type="text" 
                        name="exerciceId" 
                        value={stkExercice.exerciceId} 
                        onChange={handleChange} 
                        required
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé *</label>
                    <InputText 
                        id="libelle" 
                        type="text" 
                        name="libelle" 
                        value={stkExercice.libelle} 
                        onChange={handleChange} 
                        required
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="annee">Année</label>
                    <InputText 
                        id="annee" 
                        type="text" 
                        name="annee" 
                        value={stkExercice.annee || ''} 
                        onChange={handleChange} 
                        placeholder="Saisissez l'exercice"
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="magasinId">Magasin</label>
                    <Dropdown
                        id="magasinId"
                        value={stkExercice.magasinId}
                        options={magasinOptions}
                        onChange={(e) => handleMagasinChange(e.value)}
                        placeholder="Sélectionner un magasin"
                        showClear
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="dateDebut">Date Début *</label>
                    <Calendar
                        id="dateDebut"
                        name="dateDebut"
                        value={formatDateForInput(stkExercice.dateDebut)}
                        onChange={(e) => handleCalendarChange('dateDebut', e.value)}
                        showIcon
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="dateFin">Date Fin *</label>
                    <Calendar
                        id="dateFin"
                        name="dateFin"
                        value={formatDateForInput(stkExercice.dateFin)}
                        onChange={(e) => handleCalendarChange('dateFin', e.value)}
                        showIcon
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>
            </div>
        </div>
    );
}

export default StkExerciceForm;