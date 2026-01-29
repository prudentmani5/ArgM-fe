// FacSaisieUserForm.tsx
'use client';

import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

interface FacSaisieUserFormProps {
    onGenerate: (values: { dateDebut: Date; dateFin: Date }) => void;
    loading: boolean;
}

const FacSaisieUserForm: React.FC<FacSaisieUserFormProps> = ({ 
    onGenerate, 
    loading
}) => {
    const [dateDebut, setDateDebut] = useState<Date>(new Date());
    const [dateFin, setDateFin] = useState<Date>(new Date());
    const toast = useRef<Toast>(null);

    const handleSubmit = () => {
        if (!dateDebut || !dateFin) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez sélectionner les dates',
                life: 3000
            });
            return;
        }
        
        if (dateDebut > dateFin) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'La date de début doit être antérieure à la date de fin',
                life: 3000
            });
            return;
        }
        
        onGenerate({
            dateDebut,
            dateFin
        });
    };

    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="dateDebut">Date début</label>
                    <Calendar
                        id="dateDebut"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        maxDate={dateFin}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateFin">Date fin</label>
                    <Calendar
                        id="dateFin"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.value as Date)}
                        dateFormat="dd/mm/yy"
                        showIcon
                        className="w-full"
                        minDate={dateDebut}
                    />
                </div>

                <div className="field col-12 md:col-4 flex align-items-end">
                    <Button
                        label="Générer du rapport"
                        icon="pi pi-cog"
                        onClick={handleSubmit}
                        loading={loading}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};

// Make sure this export is present
export default FacSaisieUserForm;