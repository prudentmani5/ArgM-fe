'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { useSearchParams } from 'next/navigation';
import { LoanApplicationDocument } from './LoanApplicationDocument';
import { LoanApplicationDocumentForm } from './LoanApplicationDocumentForm';

export default function LoanApplicationDocumentPage() {
    const [documents, setDocuments] = useState<LoanApplicationDocument[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<LoanApplicationDocument[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingDocument, setEditingDocument] = useState<LoanApplicationDocument | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const applicationId = Number(searchParams.get('applicationId')) || 0;

    useEffect(() => {
        if (applicationId) {
            loadDocuments();
        }
    }, [applicationId]);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/documents/`);
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement de documents' });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setEditingDocument(undefined);
        setShowForm(true);
    };

    const editDocument = (document: LoanApplicationDocument) => {
        setEditingDocument(document);
        setShowForm(true);
    };

    const saveDocument = async (document: LoanApplicationDocument) => {
        try {
            const url = document.id
                ? `/api/financial-products/loan-applications/${applicationId}/documents/${document.id}/`
                : `/api/financial-products/loan-applications/${applicationId}/documents/`;

            const response = await fetch(url, {
                method: document.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(document)
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Document saved successfully' });
                setShowForm(false);
                loadDocuments();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la sauvegarde de document' });
        }
    };

    const deleteDocument = async (document: LoanApplicationDocument) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette document?')) {
            try {
                const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/documents/${document.id}/`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Document supprimé avec succès' });
                    loadDocuments();
                }
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression de document' });
            }
        }
    };

    const verifyDocument = async (document: LoanApplicationDocument) => {
        try {
            const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/documents/${document.id}/verify/`, {
                method: 'POST'
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Document verified successfully' });
                loadDocuments();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Failed to verify document' });
        }
    };

    const downloadDocument = (document: LoanApplicationDocument) => {
        if (document.fileUrl) {
            window.open(document.fileUrl, '_blank');
        } else {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'File URL not available' });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Upload Document" icon="pi pi-upload" severity="success" onClick={openNew} />
            </div>
        );
    };

    const verifiedBodyTemplate = (rowData: LoanApplicationDocument) => {
        return rowData.isVerified ? (
            <Tag value="Verified" severity="success" icon="pi pi-check" />
        ) : (
            <Tag value="Not Verified" severity="warning" icon="pi pi-clock" />
        );
    };

    const fileSizeBodyTemplate = (rowData: LoanApplicationDocument) => {
        if (rowData.fileSize) {
            return `${(rowData.fileSize / 1024).toFixed(2)} KB`;
        }
        return 'N/A';
    };

    const uploadedAtBodyTemplate = (rowData: LoanApplicationDocument) => {
        return rowData.uploadedAt ? new Date(rowData.uploadedAt).toLocaleString() : 'N/A';
    };

    const actionsBodyTemplate = (rowData: LoanApplicationDocument) => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    icon="pi pi-download"
                    rounded
                    outlined
                    severity="info"
                    tooltip="Download"
                    onClick={() => downloadDocument(rowData)}
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => editDocument(rowData)}
                />
                {!rowData.isVerified && (
                    <Button
                        icon="pi pi-check"
                        rounded
                        outlined
                        severity="success"
                        tooltip="Verify"
                        onClick={() => verifyDocument(rowData)}
                    />
                )}
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteDocument(rowData)}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Application Documents (Application #{applicationId})</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <input
                    type="search"
                    placeholder="Rechercher..."
                    className="p-inputtext p-component"
                    onInput={(e: any) => setGlobalFilter(e.target.value)}
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={documents}
                selection={selectedDocuments}
                onSelectionChange={(e) => setSelectedDocuments(e.value as LoanApplicationDocument[])}
                dataKey="id"
                paginator
                rows={10}
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="No documents found."
            >
                <Column selectionMode="multiple" exportable={false} />
                <Column field="documentType.name" header="Document Type" sortable />
                <Column field="fileName" header="File Name" sortable />
                <Column field="fileSize" header="File Size" body={fileSizeBodyTemplate} sortable />
                <Column field="uploadedBy.name" header="Uploaded By" sortable />
                <Column field="uploadedAt" header="Upload Date" body={uploadedAtBodyTemplate} sortable />
                <Column header="Verification Status" body={verifiedBodyTemplate} />
                <Column field="notes" header="Notes" />
                <Column header="Actions" body={actionsBodyTemplate} exportable={false} />
            </DataTable>

            <LoanApplicationDocumentForm
                visible={showForm}
                document={editingDocument}
                applicationId={applicationId}
                onHide={() => setShowForm(false)}
                onSave={saveDocument}
            />
        </div>
    );
}
