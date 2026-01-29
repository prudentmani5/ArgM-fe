'use client';

import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useState } from 'react';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { InputText } from 'primereact/inputtext';

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
        <div className="surface-card p-4 border-round-lg shadow-2">
            <Toast ref={toast} />
            
            <div className="mb-4">
                <h3 className="text-primary m-0">📊 Paramètres du Rapport</h3>
                <p className="text-color-secondary mt-1">Sélectionnez la période pour générer le rapport</p>
            </div>

            <div className="formgrid grid">
                <div className="field col-12 md:col-5">
                    <label htmlFor="dateDebut" className="font-semibold block mb-2">
                        <i className="pi pi-calendar mr-2"></i>
                        Date de début
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon bg-primary border-primary">
                            <i className="pi pi-calendar text-white"></i>
                        </span>
                        <Calendar
                            id="dateDebut"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full border-round-right"
                            maxDate={dateFin}
                            inputClassName="border-left-none"
                            placeholder="Sélectionner la date de début"
                        />
                    </div>
                </div>

                <div className="field col-12 md:col-5">
                    <label htmlFor="dateFin" className="font-semibold block mb-2">
                        <i className="pi pi-calendar mr-2"></i>
                        Date de fin
                    </label>
                    <div className="p-inputgroup">
                        <span className="p-inputgroup-addon bg-primary border-primary">
                            <i className="pi pi-calendar text-white"></i>
                        </span>
                        <Calendar
                            id="dateFin"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full border-round-right"
                            minDate={dateDebut}
                            inputClassName="border-left-none"
                            placeholder="Sélectionner la date de fin"
                        />
                    </div>
                </div>

                <div className="field col-12 md:col-2 flex align-items-end">
                    <Button
                        label="Générer"
                        icon="pi pi-chart-bar"
                        onClick={handleSubmit}
                        loading={loading}
                        className="w-full p-button-raised p-button-success border-round-lg"
                        size="large"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="mt-4 p-3 surface-100 border-round">
                <div className="flex align-items-center">
                    <i className="pi pi-info-circle text-primary mr-2"></i>
                    <span className="text-sm">
                        Le rapport sera généré pour les factures saisies entre ces dates incluses
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FacSaisieUserForm;