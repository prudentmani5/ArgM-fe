'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import ValidInvoiceForm from './ValidInvoiceForm';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { ValidInvoice } from './ValidInvoice';
import { buildApiUrl } from '../../../../../utils/apiConfig';

export default function ValidInvoicePage() {
    const [invoices, setInvoices] = useState<ValidInvoice[]>([]);
     const [activeIndex, setActiveIndex] = useState(0);
    //const { data, fetchData } = useConsumApi('');
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [globalFilter, setGlobalFilter] = useState<string>('');

    useEffect(() => {
        if (data && Array.isArray(data)) {
            setInvoices(data);
        }
    }, [data]);


    const loadValidatedInvoices = () => {
        fetchData(null, 'GET', `${baseUrl}/invoices/validated`, 'loadValidated');
    };

     const handleTabChange = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index);
        if (e.index === 1) { // Si on clique sur l'onglet "Factures Validées"
            loadValidatedInvoices();
        }
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Actualiser" 
                    onClick={loadValidatedInvoices} 
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                   <InputText  
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Facture ou RSP ou LT"
                    className="w-full"
                    
                    />
                </span>
            </div>
        );
    };

    const formatCurrency = (value: number | null) => {
        return value?.toLocaleString('fr-FR', { style: 'currency', currency: 'BIF' }) || '';
    };

    const filteredData = Array.isArray(invoices) 
    ? invoices.filter(item => {
        if (!item) return false; // Filtre les éléments null/undefined
        
        return JSON.stringify({
            factureId: item.sortieId || '',
            rsp: item.rsp || '',
            reference: item.lt || ''
            
        }).toLowerCase().includes(globalFilter.toLowerCase());
      })
    : [];

    return (
        <div className="card">
            <TabView>
                <TabPanel header="Validation">
                    <ValidInvoiceForm />
                </TabPanel>
                <TabPanel header="Factures Validées">
                    <DataTable
                        value={invoices}
                        header={renderSearch}
                        paginator
                        rows={10}
                        loading={loading}
                        emptyMessage="Aucune facture validée trouvée"
                        filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                    >
                        <Column field="sortieId" header="Numéro Facture" sortable />
                        <Column field="rsp" header="RSP" sortable />
                        <Column field="lt" header="Lettre Transport" sortable />
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

                        />
                        <Column 
                            field="montTotalManut" 
                            header="Total Manutention" 
                            body={(rowData) => formatCurrency(rowData.montTotalManut)}
                            sortable
                        />

                        <Column
                                field="montantReduction"
                                header="montant Reduction"
                                body={(rowData) => {
                                    const amount = Number(rowData.montantReduction);
                                    return isNaN(amount) ? '' : amount.toLocaleString('fr-MG', {
                                        style: 'currency',
                                        currency: 'BIF'
                                    });
                                }}
                                sortable
                            />

                            <Column
                                field="montMagasinage"
                                header="Montant Magasinage"
                                body={(rowData) => {
                                    const amount = Number(rowData.montMagasinage);
                                    return isNaN(amount) ? '' : amount.toLocaleString('fr-MG', {
                                        style: 'currency',
                                        currency: 'BIF'
                                    });
                                }}
                                sortable
                            />

                            <Column
                                field="montGardienage"
                                header="Montant Gardienage"
                                body={(rowData) => {
                                    const amount = Number(rowData.montGardienage);
                                    return isNaN(amount) ? '' : amount.toLocaleString('fr-MG', {
                                        style: 'currency',
                                        currency: 'BIF'
                                    });
                                }}
                                sortable
                            />
                             <Column
                                field="montTVA"
                                header="Montant TVA"
                                body={(rowData) => {
                                    const amount = Number(rowData.montTVA);
                                    return isNaN(amount) ? '' : amount.toLocaleString('fr-MG', {
                                        style: 'currency',
                                        currency: 'BIF'
                                    });
                                }}
                                sortable
                            />
                        <Column 
                            field="montantPaye" 
                            header="Montant Payé" 
                            body={(rowData) => formatCurrency(rowData.montantPaye)}
                            sortable
                        />
                    </DataTable>
                    
                </TabPanel>
            </TabView>
        </div>
    );
}