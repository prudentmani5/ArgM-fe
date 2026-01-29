'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useRef, useState, useEffect } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import FacSaisieUserForm from './FacSaisieUserForm';
import { FacSaisieUser } from './FacSaisieUser';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { PDFViewer } from '@react-pdf/renderer';
import FacSaisieUserPdf from './FacSaisieUserPdf';
import { API_BASE_URL } from '@/utils/apiConfig';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';

export default function FacSaisieUserPage() {
    const [loading, setLoading] = useState(false);
    const [saisies, setSaisies] = useState<FacSaisieUser[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [dateRangeFilter, setDateRangeFilter] = useState<{ startDate?: string; endDate?: string }>({});
    
    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/factueUserSaisis/findall`);
            
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
            
            const data = await response.json();
            setSaisies(data);
            showToast('success', 'Chargement réussi', `${data.length} factures chargées`);
        } catch (error) {
            console.error("Erreur de chargement:", error);
            showToast('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGenerate = async (values: { dateDebut: Date; dateFin: Date }) => {
        setGenerating(true);
        setSelectedStartDate(values.dateDebut);
        setSelectedEndDate(values.dateFin);
        
        const startDateStr = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
        const endDateStr = format(endOfDay(values.dateFin), 'yyyy-MM-dd');
        setDateRangeFilter({
            startDate: startDateStr,
            endDate: endDateStr
        });
        
        try {
            const debut = startDateStr;
            const fin = endDateStr;
            
            showToast('info', 'Génération en cours', 'Traitement des factures...');
            
            const response = await fetch(
                `${API_BASE_URL}/factueUserSaisis/genererNonEnvoye?dateDebut=${debut}&dateFin=${fin}`,
                { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                let errorMessage = `Erreur HTTP: ${response.status}`;
                try {
                    const errorData = await response.text();
                    if (errorData) {
                        try {
                            const jsonError = JSON.parse(errorData);
                            errorMessage = jsonError.message || jsonError.error || errorData;
                        } catch {
                            errorMessage = errorData;
                        }
                    }
                } catch {
                    // Ignorer si on ne peut pas lire le corps
                }
                throw new Error(errorMessage);
            }
            
            const contentType = response.headers.get('content-type');
            let result;
            
            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                if (text.trim()) {
                    result = JSON.parse(text);
                } else {
                    result = { message: 'Succès', count: 0 };
                }
            } else {
                const text = await response.text();
                result = { message: text || 'Génération réussie', count: 0 };
            }
            
            showToast(
                'success', 
                'Succès', 
                result.message || `Factures générées: ${result.count || 0} enregistrements créés`
            );
            await fetchData();
        } catch (error: any) {
            console.error("Erreur détaillée:", error);
            showToast('error', 'Erreur', error.message || 'Échec de la génération des factures');
        } finally {
            setGenerating(false);
        }
    };

    const getFilteredData = () => {
        let filtered = saisies;
        
        if (globalFilter) {
            filtered = filtered.filter(item => 
                Object.values(item).some(
                    val => val?.toString().toLowerCase().includes(globalFilter.toLowerCase())
                )
            );
        }
        
        if (dateRangeFilter.startDate && dateRangeFilter.endDate) {
            filtered = filtered.filter(item => {
                if (!item.dateSaisie) return false;
                
                const itemDate = new Date(item.dateSaisie);
                const startDate = new Date(dateRangeFilter.startDate + 'T00:00:00');
                const endDate = new Date(dateRangeFilter.endDate + 'T23:59:59');
                
                return itemDate >= startDate && itemDate <= endDate;
            });
        }
        
        return filtered;
    };

    const filteredData = getFilteredData();

    const formatDisplayDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) 
                ? dateString 
                : date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR');
        } catch (e) {
            return dateString;
        }
    };

     const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            currencyDisplay: 'code',
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
            .format(value || 0)
            .replace(/\s/g, ' ')
            .replace(/BIF$/, ' ');
    };

    const handlePrintPreview = () => {
        setShowPdfPreview(true);
    };

    const handleResetDateFilter = () => {
        setDateRangeFilter({});
        setSelectedStartDate(null);
        setSelectedEndDate(null);
    };

    const totalMontant = filteredData.reduce((sum, item) => sum + (item.montant || 0), 0);
    const totalHTVA = filteredData.reduce((sum, item) => sum + (item.htva || 0), 0);
    const totalTVA = filteredData.reduce((sum, item) => sum + (item.tva || 0), 0);

    const footerTemplate = () => (
        <div className="grid mt-4">
            <div className="col-3">
                <div className="surface-100 p-3 border-round text-center">
                    <div className="text-sm font-semibold text-600">Total Montant</div>
                    <div className="text-xl font-bold text-primary">{formatCurrency(totalMontant)}</div>
                </div>
            </div>
            <div className="col-3">
                <div className="surface-100 p-3 border-round text-center">
                    <div className="text-sm font-semibold text-600">Total HTVA</div>
                    <div className="text-xl font-bold text-green-600">{formatCurrency(totalHTVA)}</div>
                </div>
            </div>
            <div className="col-3">
                <div className="surface-100 p-3 border-round text-center">
                    <div className="text-sm font-semibold text-600">Total TVA</div>
                    <div className="text-xl font-bold text-orange-600">{formatCurrency(totalTVA)}</div>
                </div>
            </div>
            <div className="col-3">
                <div className="surface-100 p-3 border-round text-center">
                    <div className="text-sm font-semibold text-600">Nombre de factures</div>
                    <div className="text-xl font-bold text-cyan-600">
                        <Tag value={filteredData.length} severity="info" rounded />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4">
            <Toast ref={toast} />
            
            <Dialog 
                header="Aperçu d'impression"
                visible={showPdfPreview}
                style={{ width: '95vw', height: '90vh' }}
                onHide={() => setShowPdfPreview(false)}
                maximizable
            >
                <div className="flex justify-content-end mb-3">
                    <Button
                        icon="pi pi-print"
                        onClick={() => window.print()}
                        label="Imprimer"
                        className="p-button-raised p-button-help"
                    />
                </div>
                <PDFViewer style={{
                    width: '100%',
                    height: 'calc(90vh - 120px)'
                }}>
                    <FacSaisieUserPdf 
                        data={filteredData}
                        globalFilter={globalFilter}
                        startDate={dateRangeFilter.startDate}
                        endDate={dateRangeFilter.endDate}
                    />
                </PDFViewer>
            </Dialog>

            <div className="mb-6">
                <div className="flex align-items-center mb-3">
                    <i className="pi pi-file-pdf text-primary text-3xl mr-3"></i>
                    <div>
                        <h1 className="text-3xl font-bold text-900 m-0">Rapport de toutes factures non envoyées à l'OBR</h1>
                        {dateRangeFilter.startDate && dateRangeFilter.endDate && (
                            <div className="flex align-items-center mt-2">
                                <Tag 
                                    severity="info" 
                                    value={`Période: ${format(new Date(dateRangeFilter.startDate!), 'dd/MM/yyyy')} - ${format(new Date(dateRangeFilter.endDate!), 'dd/MM/yyyy')}`}
                                    className="mr-2"
                                />
                                <Button 
                                    icon="pi pi-times" 
                                    onClick={handleResetDateFilter}
                                    className="p-button-rounded p-button-text p-button-sm"
                                    tooltip="Effacer le filtre de date"
                                />
                            </div>
                        )}
                    </div>
                </div>
                
                {generating && (
                    <div className="flex align-items-center mt-3">
                        <ProgressSpinner style={{width: '25px', height: '25px'}} />
                        <span className="ml-2 font-medium">Génération en cours...</span>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <Card className="shadow-3 border-round-xl">
                    <FacSaisieUserForm 
                        onGenerate={handleGenerate}
                        loading={generating}
                    />
                </Card>
            </div>
            
            <Card className="shadow-2 border-round-xl">
                <div className="flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-900 m-0">📋 Liste des Factures non envoyées à l'OBR</h2>
                        <p className="text-color-secondary m-0 mt-1">
                            {filteredData.length} facture{filteredData.length !== 1 ? 's' : ''} trouvée{filteredData.length !== 1 ? 's' : ''}
                            {dateRangeFilter.startDate && dateRangeFilter.endDate && (
                                <span className="ml-2 text-primary">
                                    (Filtrée par période)
                                </span>
                            )}
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="p-inputgroup w-30rem">
                            <span className="p-inputgroup-addon bg-primary border-primary">
                                <i className="pi pi-search text-white"></i>
                            </span>
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par client, déclarant, marchandise..."
                                className="w-full"
                            />
                            {globalFilter && (
                                <Button
                                    icon="pi pi-times"
                                    onClick={() => setGlobalFilter('')}
                                    className="p-button-text"
                                />
                            )}
                        </div>
                        
                        <div className="flex gap-2 ml-2">
                            <Button
                                icon="pi pi-print"
                                label="PDF"
                                onClick={handlePrintPreview}
                                disabled={loading || filteredData.length === 0}
                                className="p-button-raised p-button-help"
                                tooltip="Générer un PDF"
                                tooltipOptions={{ position: 'bottom' }}
                            />
                            <Button
                                icon="pi pi-refresh"
                                onClick={fetchData}
                                disabled={loading || generating}
                                className="p-button-outlined"
                                tooltip="Rafraîchir les données"
                                tooltipOptions={{ position: 'bottom' }}
                            />
                        </div>
                    </div>
                </div>

                <DataTable
                    value={filteredData}
                    loading={loading}
                    paginator
                    rows={15}
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    emptyMessage={
                        <div className="text-center p-4">
                            <i className="pi pi-inbox text-4xl text-400 mb-3"></i>
                            <p className="text-2xl text-500">Aucune facture trouvée</p>
                            {dateRangeFilter.startDate && dateRangeFilter.endDate && (
                                <Button 
                                    label="Effacer le filtre de date" 
                                    onClick={handleResetDateFilter}
                                    className="p-button-text mt-2"
                                />
                            )}
                        </div>
                    }
                    className="p-datatable-striped"
                    size="small"
                >
                    <Column 
                        field="factureId" 
                        header="N° Facture" 
                        sortable 
                        headerClassName="font-semibold"
                        body={(row) => (
                            <span className="font-semibold text-900">
                                {row.factureId}
                            </span>
                        )}
                        style={{ minWidth: '120px' }}
                    />
                    <Column 
                        field="client" 
                        header="Client" 
                        sortable 
                        filter
                        headerClassName="font-semibold"
                        style={{ minWidth: '200px' }}
                    />
                    
                    <Column 
                        field="montant" 
                        header="Montant Total" 
                        body={(row) => (
                            <span className="font-bold text-primary">
                                {formatCurrency(row.montant)}
                            </span>
                        )} 
                        sortable 
                        headerClassName="font-semibold text-right"
                        bodyClassName="text-right"
                    />
                    <Column 
                        field="htva" 
                        header="HTVA" 
                        body={(row) => formatCurrency(row.htva)} 
                        sortable 
                        headerClassName="font-semibold text-right"
                        bodyClassName="text-right"
                    />
                    <Column 
                        field="tva" 
                        header="TVA" 
                        body={(row) => formatCurrency(row.tva)} 
                        sortable 
                        headerClassName="font-semibold text-right"
                        bodyClassName="text-right"
                    />
                    <Column 
                        field="dateSaisie" 
                        header="Date Saisie" 
                        body={(row) => (
                            <div className="flex flex-column">
                                <span className="font-semibold">
                                    {formatDisplayDate(row.dateSaisie).split(' ')[0]}
                                </span>
                                <span className="text-xs text-color-secondary">
                                    {formatDisplayDate(row.dateSaisie).split(' ')[1]}
                                </span>
                            </div>
                        )} 
                        sortable 
                        headerClassName="font-semibold"
                        style={{ minWidth: '160px' }}
                    />
                    
                 

                    <Column 
                        field="userId" 
                        header="Agent" 
                        sortable 
                        headerClassName="font-semibold"
                        body={(row) => (
                            <span className="font-medium text-900">
                                {row.userId}
                            </span>
                        )}
                        style={{ minWidth: '120px' }}
                    />

                        <Column 
                        field="marchandise" 
                        header="Marchandise" 
                        sortable 
                        filter
                        headerClassName="font-semibold"
                        style={{ minWidth: '250px' }}
                    />
                </DataTable>

                {footerTemplate()}
            </Card>

            <div className="grid mt-4">
                <div className="col-12">
                    <div className="surface-100 p-3 border-round">
                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <i className="pi pi-info-circle text-primary mr-2"></i>
                                <span className="text-sm text-600">
                                    {dateRangeFilter.startDate && dateRangeFilter.endDate ? (
                                        `Données filtrées du ${format(new Date(dateRangeFilter.startDate!), 'dd/MM/yyyy')} au ${format(new Date(dateRangeFilter.endDate!), 'dd/MM/yyyy')}`
                                    ) : (
                                        'Données mises à jour en temps réel'
                                    )}
                                </span>
                            </div>
                            <div className="text-sm text-600">
                                <i className="pi pi-database mr-2"></i>
                                <span>Base de données: {saisies.length} enregistrements</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}