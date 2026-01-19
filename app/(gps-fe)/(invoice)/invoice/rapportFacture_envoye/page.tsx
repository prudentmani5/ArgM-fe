// FacSaisieUserPage.tsx
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

export default function FacSaisieUserPage() {
    const [loading, setLoading] = useState(false);
    const [saisies, setSaisies] = useState<FacSaisieUser[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showPdfPreview, setShowPdfPreview] = useState(false);
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
        setLoading(true);
        try {
            const debut = format(startOfDay(values.dateDebut), 'yyyy-MM-dd');
            const fin = format(endOfDay(values.dateFin), 'yyyy-MM-dd');
            
            const response = await fetch(
                `${API_BASE_URL}/factueUserSaisis/genererEnvoye?dateDebut=${debut}&dateFin=${fin}`,
                { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la génération');
            }
            
            showToast('success', 'Succès', 'Factures utilisateur générées avec succès');
            await fetchData();
        } catch (error) {
            console.error("Erreur:", error);
            showToast('error', 'Erreur', 'Échec de la génération des factures');
        } finally {
            setLoading(false);
        }
    };

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'BIF',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const handlePrintPreview = () => {
        setShowPdfPreview(true);
    };

    const filteredData = saisies.filter(item => 
        !globalFilter || 
        Object.values(item).some(
            val => val?.toString().toLowerCase().includes(globalFilter.toLowerCase())
        )
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            
            {/* PDF Preview Modal */}
            {showPdfPreview && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '10px',
                        backgroundColor: 'white'
                    }}>
                        <Button
                            icon="pi pi-times"
                            onClick={() => setShowPdfPreview(false)}
                            className="p-button-text"
                        />
                        <Button
                            icon="pi pi-print"
                            onClick={() => window.print()}
                            label="Imprimer"
                            className="ml-2"
                        />
                    </div>
                    <PDFViewer style={{
                        width: '100%',
                        height: '100%'
                    }}>
                        <FacSaisieUserPdf 
                            data={filteredData}
                            globalFilter={globalFilter}
                        />
                    </PDFViewer>
                </div>
            )}

            <div className="col-12">
                <Card title="Génération de rapport des factures envoyées à l'OBR ">
                    <FacSaisieUserForm 
                        onGenerate={handleGenerate}
                        loading={loading}
                    />
                </Card>
            </div>
            
            <div className="col-12 mt-4">
                <Card title="Liste des factures generées envoyées à l'OBR">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <span className="p-input-icon-left" style={{ width: '40%' }}>
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full"
                            />
                        </span>
                        <div>
                            <Button
                                icon="pi pi-print"
                                onClick={handlePrintPreview}
                                disabled={loading || saisies.length === 0}
                                tooltip="Visualiser avant impression"
                                tooltipOptions={{ position: 'left' }}
                                className="mr-2"
                            />
                            <Button
                                icon="pi pi-refresh"
                                onClick={fetchData}
                                disabled={loading}
                                tooltip="Rafraîchir"
                                tooltipOptions={{ position: 'left' }}
                            />
                        </div>
                    </div>

                    <DataTable
                        value={filteredData}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        globalFilter={globalFilter}
                        emptyMessage="Aucune saisie trouvée"
                    >
                        <Column field="factureId" header="N° Facture" sortable />
                        <Column field="client" header="Client" sortable />
                        <Column field="declarant" header="Déclarant" sortable />
                        <Column field="marchandise" header="Marchandise" sortable />
                        <Column 
                            field="montant" 
                            header="Montant" 
                            body={(row) => formatCurrency(row.montant)} 
                            sortable 
                        />
                        <Column 
                            field="htva" 
                            header="HTVA" 
                            body={(row) => formatCurrency(row.htva)} 
                            sortable 
                        />
                        <Column 
                            field="tva" 
                            header="TVA" 
                            body={(row) => formatCurrency(row.tva)} 
                            sortable 
                        />
                        <Column 
                            field="dateSaisie" 
                            header="Date Saisie" 
                            body={(row) => formatDisplayDate(row.dateSaisie)} 
                            sortable 
                        />
                        <Column field="userId" header="Utilisateur" sortable />
                    </DataTable>

                    <div className="flex justify-content-between mt-3">
                        <div>
                            <span className="font-bold">Total Montant: </span>
                            <span>{formatCurrency(filteredData.reduce((sum, item) => sum + (item.montant || 0), 0))}</span>
                        </div>
                        <div>
                            <span className="font-bold">Total HTVA: </span>
                            <span>{formatCurrency(filteredData.reduce((sum, item) => sum + (item.htva || 0), 0))}</span>
                        </div>
                        <div>
                            <span className="font-bold">Total TVA: </span>
                            <span>{formatCurrency(filteredData.reduce((sum, item) => sum + (item.tva || 0), 0))}</span>
                        </div>
                        <div>
                            <span className="font-bold">Nombre: </span>
                            <span>{filteredData.length}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}