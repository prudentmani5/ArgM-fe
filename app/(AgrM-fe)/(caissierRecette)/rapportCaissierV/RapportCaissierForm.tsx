'use client';

import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/utils/apiConfig';

interface RapportCaissierFormProps {
    onSearch: (values: { dateDebut: Date; dateFin: Date; userCreation: string }) => void;
    loading: boolean;
}

const RapportCaissierForm: React.FC<RapportCaissierFormProps> = ({ onSearch, loading }) => {
    const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
    const [userCreation, setUserCreation] = useState<string | null>(null);
    const [userCreations, setUserCreations] = useState<string[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [dateDebut, setDateDebut] = useState<Date>(new Date());
    const [dateFin, setDateFin] = useState<Date>(new Date());

    useEffect(() => {
        const fetchUserCreations = async () => {
            setLoadingUsers(true);
            try {
                const response = await fetch(`${API_BASE_URL}/entryPayements/findall`);
                if (!response.ok) throw new Error('Erreur réseau');
                const data = await response.json();

                // Extract unique userCreation values
                const uniqueUsers = Array.from(
                    new Set(
                        data
                            .map((payment: any) => payment.userCreation)
                            .filter((user: string) => user && user.trim() !== '')
                    )
                ).sort() as string[];

                setUserCreations(uniqueUsers);
            } catch (error) {
                console.error("Erreur de chargement des utilisateurs:", error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUserCreations();
    }, []);

        const handleSubmit = () => {
            if (!dateDebut || !dateFin || !userCreation) return;
            onSearch({
                dateDebut,
                dateFin,
                userCreation
            });
        };

        return (
            <div className="card p-fluid">
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

                    <div className="field col-12 md:col-4">
                        <label htmlFor="userCreation">Caissier</label>
                        <Dropdown
                            id="userCreation"
                            value={userCreation}
                            options={userCreations.map(user => ({
                                label: user,
                                value: user
                            }))}
                            onChange={(e: DropdownChangeEvent) => setUserCreation(e.value)}
                            placeholder={loadingUsers ? "Chargement..." : "Sélectionnez un utilisateur"}
                            className="w-full"
                            disabled={loadingUsers}
                        />
                    </div>

                    <div className="field col-12 md:col-4 flex align-items-end">
                        <Button
                            label="Rechercher"
                            icon="pi pi-search"
                            onClick={handleSubmit}
                            loading={loading}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        );
    };

    export default RapportCaissierForm;