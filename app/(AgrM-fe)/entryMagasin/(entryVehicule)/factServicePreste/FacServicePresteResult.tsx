// FacServicePresteResult.tsx
'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { FacServicePreste } from './FacServicePreste';
import { FacService } from '../../../(settings)/settings/facService/FacService';

interface FacServicePresteResultProps {
    facServiceTableTitle: string;
    results: FacServicePreste[];
    loading: boolean;
    onSelect: (facture: FacServicePreste) => void;
    onClear: () => void;
    onDelete?: (service: FacServicePreste) => void;
    onEdit?: (service: FacServicePreste) => void;
    services?: FacService[];
    isEditMode?: boolean;
}

const FacServicePresteResult: React.FC<FacServicePresteResultProps> = ({
    facServiceTableTitle,
    results,
    loading,
    onSelect,
    onClear,
    onDelete,
    onEdit,
    services = [],
    isEditMode = false
}) => {
    
    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '';
    };

    const formatCurrency = (amount: number | null) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
    };

    const formatCurrencyWithDecimals = (amount: number | null) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const handleDelete = (rowData: FacServicePreste) => {
        const serviceName = getServiceName(rowData.serviceId);
        const isSaved = rowData.servicePresteId || (rowData.numFacture && rowData.numFacture.trim() !== '');

        confirmDialog({
            message: `Êtes-vous sûr de vouloir ${isSaved ? 'supprimer' : 'retirer'} ce service ?

Service: ${serviceName}
Montant: ${formatCurrency(rowData.montant)} FBU`,
            header: isSaved ? 'Confirmation de suppression' : 'Confirmation de retrait',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                if (onDelete) {
                    onDelete(rowData);
                }
            }
        });
    };

    const actionBodyTemplate = (rowData: FacServicePreste) => {
        return (
            <div className="flex gap-2">
                {isEditMode && onEdit && (
                    <Button
                        icon="pi pi-pencil"
                        rounded
                        outlined
                        severity="info"
                        onClick={() => onEdit(rowData)}
                        tooltip="Modifier"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => handleDelete(rowData)}
                    tooltip="Supprimer"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const getServiceName = (serviceId: number | null): string => {
        if (!serviceId) return 'N/A';
        const service = services.find(s => s.id === serviceId);
        return service ? service.libelleService : `Service #${serviceId}`;
    };

    return (
        <div className="card mt-4">
            <div className="flex justify-content-between align-items-center mb-4">
                <h5>{facServiceTableTitle}</h5>
                <button 
                    className="p-button p-button-text p-button-sm"
                    onClick={onClear}
                >
                    Effacer les résultats
                </button>
            </div>
            
            <DataTable
                value={results}
                loading={loading}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                emptyMessage="Aucun service trouvé"
            >
                <Column
                    field="serviceId"
                    header="Service"
                    body={(rowData) => getServiceName(rowData.serviceId)}
                    sortable
                />
                <Column field="montant" header="Montant" body={(rowData) => `${formatCurrency(rowData.montant)} FBU`} sortable />
                <Column field="montTaxe" header="Montant Taxe" body={(rowData) => `${formatCurrencyWithDecimals(rowData.montTaxe)} FBU`} sortable />
                <Column field="montRedev" header="Redevance Info." body={(rowData) => `${formatCurrency(rowData.montRedev)} FBU`} sortable />
                <Column field="montRedevTaxe" header="Taxe Redevance" body={(rowData) => `${formatCurrencyWithDecimals(rowData.montRedevTaxe)} FBU`} sortable />
                <Column
                    header="Montant Total"
                    body={(rowData) => `${formatCurrency(Math.round(
                        (rowData.montant || 0) +
                        (rowData.montTaxe || 0) +
                        (rowData.montRedev || 0) +
                        (rowData.montRedevTaxe || 0)
                    ))} FBU`}
                    sortable
                />
                <Column body={actionBodyTemplate} header="Action" style={{ width: '8rem', textAlign: 'center' }} />
            </DataTable>
        </div>
    );
};

export default FacServicePresteResult;