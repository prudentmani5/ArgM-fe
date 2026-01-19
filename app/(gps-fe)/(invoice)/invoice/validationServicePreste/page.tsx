'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import FacServicePresteForm from './FacServicePresteForm';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { useEffect, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { FacServicePreste } from './FacServicePreste';
import { buildApiUrl } from '../../../../../utils/apiConfig';

export default function FacServicePrestePage() {
    const [services, setServices] = useState<FacServicePreste[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, fetchData } = useConsumApi('');
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [dateDebut, setDateDebut] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFin, setDateFin] = useState<Date>(new Date());
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: '',
        sortOrder: null as number | null
    });

    useEffect(() => {
        if (data) {
            if (data.content && Array.isArray(data.content)) {
                // Paginated response
                setServices(data.content);
                setTotalRecords(data.totalElements || 0);
            } else if (Array.isArray(data)) {
                // Non-paginated response (fallback)
                setServices(data);
                setTotalRecords(data.length);
            }
        }
    }, [data]);

    const loadValidatedServices = () => {
        let url = buildApiUrl('/servicepreste/validated');
        const params = new URLSearchParams();
        
        // Add pagination parameters
        params.append('page', lazyParams.page.toString());
        params.append('size', lazyParams.rows.toString());
        
        // Add date filters
        if (dateDebut && dateFin) {
            const formatDate = (date: Date) => date.toISOString().split('T')[0];
            params.append('dateDebut', formatDate(dateDebut));
            params.append('dateFin', formatDate(dateFin));
        }
        
        // Add search filter if provided
        if (globalFilter.trim()) {
            params.append('search', globalFilter.trim());
        }
        
        url += `?${params.toString()}`;
        fetchData(null, 'GET', url, 'loadValidated');
    };

    useEffect(() => {
        if (activeIndex === 1) {
            loadValidatedServices();
        }
    }, [lazyParams.page, lazyParams.rows]);

    const handleTabChange = (e: TabViewTabChangeEvent) => {
        setActiveIndex(e.index);
        if (e.index === 1) {
            // Reset to first page when switching to validated tab
            setLazyParams({...lazyParams, first: 0, page: 0});
            setTimeout(() => {
                loadValidatedServices();
            }, 100);
        }
    };

    const handleSearch = () => {
        // Reset to first page when searching
        setLazyParams({...lazyParams, first: 0, page: 0});
        setTimeout(() => {
            loadValidatedServices();
        }, 100);
    };

    const clearSearch = () => {
        setDateDebut(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFin(new Date());
        setGlobalFilter('');
        setLazyParams({...lazyParams, first: 0, page: 0});
        setTimeout(() => {
            loadValidatedServices();
        }, 100);
    };

    const onPage = (event: any) => {
        const newLazyParams = {
            ...lazyParams,
            first: event.first,
            rows: event.rows,
            page: event.page || Math.floor(event.first / event.rows)
        };
        setLazyParams(newLazyParams);
    };

    const onFilter = (e: any) => {
        setGlobalFilter(e.target.value);
        // Debounce the filter to avoid too many requests
        setTimeout(() => {
            handleSearch();
        }, 500);
    };

    const renderSearch = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche des services validés</h5>
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
                        <label htmlFor="globalFilter">Recherche (Facture/LT)</label>
                        <InputText
                            id="globalFilter"
                            value={globalFilter}
                            onChange={onFilter}
                            placeholder="Facture ou lettre transport"
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

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        try {
            const d = new Date(date);
            return isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR');
        } catch {
            return '';
        }
    };

    const formatTaxe = (taxe: boolean) => {
        return taxe ? 'Oui' : 'Non';
    };

    const filteredServices = services.filter(service => {
        if (!service) return false;
        
        const searchString = (
            (service.numFacture || '') + 
            (service.lettreTransp || '') +
            (service.dateValidation ? formatDate(service.dateValidation) : '') +
            (service.dateEnvoiOBR ? formatDate(new Date(service.dateEnvoiOBR)) : '')
        ).toLowerCase();
        
        return searchString.includes(globalFilter.toLowerCase());
    });

    return (
        <div className="card">
            <TabView activeIndex={activeIndex} onTabChange={handleTabChange}>
                <TabPanel header="Validation">
                    <FacServicePresteForm />
                </TabPanel>
                <TabPanel header="Services Validés">
                    <DataTable
                        value={filteredServices}
                        header={renderSearch}
                        paginator
                        rows={lazyParams.rows}
                        first={lazyParams.first}
                        totalRecords={totalRecords}
                        onPage={onPage}
                        lazy
                        emptyMessage="Aucun service validé trouvé"
                        loading={loading}
                        filterDisplay="menu"
                        dataKey="servicePresteId"
                    >
                        <Column
                            field="numFacture"
                            header="Numéro Facture"
                            sortable
                            filter
                            filterPlaceholder="Rechercher par numéro"
                        />
                        <Column
                            field="lettreTransp"
                            header="Lettre Transport"
                            sortable
                            filter
                            filterPlaceholder="Rechercher par lettre"
                        />
                        <Column
                            field="dateCreation"
                            header="Date Création"
                            body={(rowData) => formatDate(rowData.dateCreation)}
                            sortable
                        />
                        <Column
                            field="montant"
                            header="Montant"
                            body={(rowData) => formatCurrency(rowData.montant)}
                            sortable
                        />
                        <Column
                            field="taxe"
                            header="Exonéré"
                            body={(rowData) => formatTaxe(rowData.taxe)}
                            sortable
                        />
                        <Column
                            field="dateValidation"
                            header="Date Validation"
                            body={(rowData) => formatDate(rowData.dateValidation)}
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