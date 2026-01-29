'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import ValidRemorquageForm from './ValidRemorquageForm';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { ValidRemorquage } from './ValidRemorquage';
import { buildApiUrl } from '../../../../../utils/apiConfig';

export default function ValidRemorquagePage() {
    const [remorquages, setRemorquages] = useState<ValidRemorquage[]>([]);
    const { data, fetchData } = useConsumApi('');
    const [globalFilter, setGlobalFilter] = useState<string>('');

    useEffect(() => {
        if (data && Array.isArray(data)) {
            setRemorquages(data);
        }
    }, [data]);

    const loadValidatedRemorquages = () => {
        fetchData(null, 'GET', buildApiUrl('/remorquages/validated'), 'loadValidated');
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Actualiser" 
                    onClick={loadValidatedRemorquages} 
                />
               <span className="p-input-icon-left" style={{ width: '40%' }}>
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher par numéro, lettre transport ou montant..."
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    const formatCurrency = (value: number | null) => {
        return value?.toLocaleString('fr-FR', { style: 'currency', currency: 'BIF' }) || '';
    };

    return (
        <div className="card">
            <TabView>
                <TabPanel header="Validation">
                    <ValidRemorquageForm />
                </TabPanel>
                <TabPanel header="Remorquages Validés">
                    <DataTable
                        value={remorquages}
                        header={renderSearch}
                        paginator
                        rows={10}
                         globalFilter={globalFilter}
                        filterDisplay="menu"
                        emptyMessage="Aucun remorquage validé trouvé"
                    >
                        <Column field="noRemorque" header="Numéro Remorquage" sortable />
                        <Column field="lettreTransp" header="Lettre Transport" sortable />
                        <Column 
                            field="dateValidation" 
                            header="Date Validation" 
                            body={(rowData) => {
                                if (!rowData.dateValidation) return '';
                                try {
                                    const date = new Date(rowData.dateValidation);
                                    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
                                } catch {
                                    return '';
                                }
                            }}
                            sortable
                        />
                        <Column 
                            field="montant" 
                            header="Montant" 
                            body={(rowData) => formatCurrency(rowData.montant)}
                            sortable
                        />
                        <Column 
                            field="montantRedev" 
                            header="Redevance" 
                            body={(rowData) => formatCurrency(rowData.montantRedev)}
                            sortable
                        />
                        <Column
                            field="dateCreation"
                            header="dateCreation"
                            body={(rowData) => {
                                if (!rowData.dateCreation) return '';
                                try {
                                    const date = new Date(rowData.dateCreation);
                                    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
                                } catch {
                                    return '';
                                }
                            }}
                            sortable
                        />

                        {/* OBR Status Columns */}
                        <Column
                            field="statusEnvoiOBR"
                            header="Statut Envoi OBR"
                            body={(rowData) => {
                                const hasDateEnvoi = rowData.dateEnvoiOBR != null && rowData.dateEnvoiOBR !== '';
                                return (
                                    <span
                                        className={`font-bold ${hasDateEnvoi
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}
                                    >
                                        {hasDateEnvoi ? 'Envoyée' : 'Non envoyée'}
                                    </span>
                                );
                            }}
                            sortable
                        />

                        <Column
                            field="dateEnvoiOBR"
                            header="Date Envoi OBR"
                            body={(rowData) => {
                                if (!rowData.dateEnvoiOBR) return '';
                                try {
                                    const date = new Date(rowData.dateEnvoiOBR);
                                    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
                                } catch {
                                    return '';
                                }
                            }}
                            sortable
                        />

                        <Column
                            field="statusEnvoiCancelOBR"
                            header="Statut Annulation OBR"
                            body={(rowData) => {
                                if (rowData.annuleFacture == 1 || rowData.annuleFacture === true) {
                                    const status = rowData.statusEnvoiCancelOBR;
                                    const isEnvoye = status == 1 || status === true;
                                    return (
                                        <span
                                            className={`font-bold ${isEnvoye
                                                    ? 'text-blue-600'
                                                    : 'text-orange-600'
                                                }`}
                                        >
                                            {isEnvoye ? 'Annulation envoyée' : 'Annulation non envoyée'}
                                        </span>
                                    );
                                } else {
                                    return <span className="text-gray-500">Non applicable</span>;
                                }
                            }}
                            sortable
                        />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}