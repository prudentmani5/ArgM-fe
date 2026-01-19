'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import ValidAccostageForm from './ValidAccostageForm';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { ValidAccostage } from './ValidAccostage';
import { buildApiUrl } from '../../../../../utils/apiConfig';

export default function ValidAccostagePage() {
    const [accostages, setAccostages] = useState<ValidAccostage[]>([]);
    const { data, fetchData } = useConsumApi('');
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            setAccostages(data);
        }
    }, [data]);

    const loadValidatedAccostages = () => {
        fetchData(null, 'GET', buildApiUrl('/accostages/validated'), 'loadValidated');
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Actualiser" 
                    onClick={loadValidatedAccostages} 
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText 
                     value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher par facture, LT"
                    className="w-full" />
                </span>
            </div>
        );
    };

    const formatCurrency = (value: number | null) => {
        return value?.toLocaleString('fr-FR', { style: 'currency', currency: 'BIF' }) || '';
    };

     const filteredData = Array.isArray(accostages) 
    ? accostages.filter(item => {
        if (!item) return false; // Filtre les éléments null/undefined
        
        return JSON.stringify({
            factureId: item.noArrive || '',
            rsp: item.lettreTransp || '',
        }).toLowerCase().includes(globalFilter.toLowerCase());
      })
    : [];

    return (
        <div className="card">
            <TabView>
                <TabPanel header="Validation">
                    <ValidAccostageForm />
                </TabPanel>
                <TabPanel header="Accostages Validés">
                    <DataTable
                       // value={accostages}
                        header={renderSearch}
                        paginator
                        rows={10}
                        loading={loading}
                        value={filteredData}
                        //value={filteredData}
                        //header={renderSearch}
                        emptyMessage="Aucun accostage validé trouvé"
                    >
                        <Column field="noArrive" header="Numéro Facture" sortable />
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
                            field="taxeAccostage" 
                            header="Taxe Accostage" 
                            body={(rowData) => formatCurrency(rowData.taxeAccostage)}
                            sortable
                        />
                        <Column
                            field="taxeManut"
                            header="Taxe Manutention"
                            body={(rowData) => formatCurrency(rowData.taxeManut)}
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