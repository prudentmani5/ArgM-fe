'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import ValidInvoiceForm from './ValidInvoiceForm';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
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

    // Date filter states
    const [dateDebut, setDateDebut] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFin, setDateFin] = useState<Date>(new Date());

    useEffect(() => {
        if (data && Array.isArray(data)) {
            setInvoices(data);
        }
    }, [data]);


    const loadValidatedInvoices = () => {
        let url = buildApiUrl(`/invoices/validated-with-payment-status`);

        if (dateDebut && dateFin) {
            const formatDate = (date: Date) => date.toISOString().split('T')[0];
            url += `?dateDebut=${formatDate(dateDebut)}&dateFin=${formatDate(dateFin)}`;
        }

        fetchData(null, 'GET', url, 'loadValidated');
    };

    const handleSearch = () => {
        loadValidatedInvoices();
    };

    const clearSearch = () => {
        setDateDebut(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFin(new Date());
        setGlobalFilter('');
        // Reload with reset dates
        setTimeout(() => {
            loadValidatedInvoices();
        }, 100);
    };

    const handleTabChange = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index);
        if (e.index === 1) { // Si on clique sur l'onglet "Factures Validées"
            loadValidatedInvoices();
        }
    };

    const renderSearch = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche des factures validées</h5>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Rechercher"
                            onClick={handleSearch}
                            loading={loading}
                        />
                        <Button
                            icon="pi pi-times"
                            label="Effacer"
                            outlined
                            onClick={clearSearch}
                        />
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-4">
                        <label htmlFor="dateDebut">Date Début</label>
                        <Calendar
                            id="dateDebut"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor="dateFin">Date Fin</label>
                        <Calendar
                            id="dateFin"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor="globalFilter">Recherche (Facture/RSP/LT)</label>
                        <InputText
                            id="globalFilter"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Facture ou RSP ou LT"
                            className="w-full"
                        />
                    </div>
                </div>
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

                        <Column
                            field="statutEncaissement"
                            header="Encaissement"
                            sortable
                            body={(rowData) => (
                                <span
                                    className={`font-bold ${rowData.statutEncaissement === 1 || rowData.statutEncaissement === true
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        }`}
                                >
                                    {rowData.statutEncaissement === 1 || rowData.statutEncaissement === true ? 'Oui' : 'Non'}
                                </span>
                            )}
                        />

                         {/* New Column: Date Envoi OBR */}


    {/* New Column: Status Envoi OBR */}
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
    
    {/* New Column: Status Envoi Cancel OBR */}
    <Column
        field="statusEnvoiCancelOBR"
        header="Statut Annulation OBR"
        body={(rowData) => {
            // Check if annuleFacture is true/1
            if (rowData.annuleFacture === 1 || rowData.annuleFacture === true) {
                const status = rowData.statusEnvoiCancelOBR;
                return (
                    <span
                        className={`font-bold ${status === 1
                                ? 'text-blue-600'
                                : 'text-orange-600'
                            }`}
                    >
                        {status === 1 ? 'Annulation envoyée' : 'Annulation non envoyée'}
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