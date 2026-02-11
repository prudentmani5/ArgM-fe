'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { ProgressBar } from 'primereact/progressbar';
import { Image } from 'primereact/image';
import { buildApiUrl } from '@/utils/apiConfig';
import { getUserAction } from '@/hooks/fetchData/useConsumApi';
import Cookies from 'js-cookie';

// API URLs
const APP_URL = buildApiUrl('/api/credit/applications');
const DOCUMENTS_URL = buildApiUrl('/api/credit/application-documents');
const DOCUMENT_TYPES_URL = buildApiUrl('/api/credit/document-types');

interface ApplicationDocument {
    id?: number;
    applicationId?: number;
    documentTypeId?: number;
    documentType?: any;
    documentName?: string;
    filePath?: string;
    fileSizeKb?: number;
    mimeType?: string;
    isReceived?: boolean;
    receivedDate?: string;
    isValidated?: boolean;
    validatedDate?: string;
    validationNotes?: string;
    userAction?: string;
    createdAt?: string;
}

export default function DocumentsCreditPage() {
    const params = useParams();
    const applicationId = Number(params.applicationId);

    // State
    const [application, setApplication] = useState<any>(null);
    const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
    const [documentTypes, setDocumentTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog state
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showValidateDialog, setShowValidateDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<ApplicationDocument | null>(null);
    const [newDocument, setNewDocument] = useState<ApplicationDocument>({});
    const [validationNotes, setValidationNotes] = useState('');

    // File upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);

    // Fetch helper
    const fetchWithAuth = async (url: string, options?: RequestInit) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            ...options
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };

    // Load dropdown data directly on mount (separate from the shared hook to avoid race conditions)
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                // Load document types
                const typesResponse = await fetch(`${DOCUMENT_TYPES_URL}/findall`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                if (typesResponse.ok) {
                    const typesData = await typesResponse.json();
                    setDocumentTypes(Array.isArray(typesData) ? typesData : typesData.content || []);
                }
            } catch (err) {
                console.error('Error loading dropdown data:', err);
            }
        };

        loadDropdownData();
    }, []);

    // Load application data
    useEffect(() => {
        if (applicationId) {
            loadAllData();
        }
    }, [applicationId]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [appData, docsData] = await Promise.all([
                fetchWithAuth(`${APP_URL}/findbyid/${applicationId}`).catch((err) => {
                    console.error('Error loading application:', err);
                    return null;
                }),
                fetchWithAuth(`${DOCUMENTS_URL}/findbyapplication/${applicationId}`).catch((err) => {
                    console.error('Error loading documents:', err);
                    return [];
                })
            ]);

            setApplication(appData);
            setDocuments(Array.isArray(docsData) ? docsData : docsData?.content || []);
        } catch (err) {
            console.error('Error loading data:', err);
            showToast('error', 'Erreur', 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Upload file to server
    const uploadFile = async (file: File, folder: string): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch(buildApiUrl('/api/files/upload'), {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        const data = await response.json();
        return data.filePath || data.path || data.url;
    };

    // Handle file selection
    const handleFileSelect = (e: any) => {
        if (e.files && e.files.length > 0) {
            const file = e.files[0];
            setSelectedFile(file);
            // Auto-fill document name if empty
            if (!newDocument.documentName) {
                setNewDocument(prev => ({ ...prev, documentName: file.name }));
            }
            // Set file size
            setNewDocument(prev => ({
                ...prev,
                fileSizeKb: Math.round(file.size / 1024),
                mimeType: file.type
            }));
        }
    };

    // Clear file selection
    const handleFileClear = () => {
        setSelectedFile(null);
        setNewDocument(prev => ({ ...prev, fileSizeKb: undefined, mimeType: undefined }));
        if (fileUploadRef.current) {
            fileUploadRef.current.clear();
        }
    };

    // Add document
    const handleAddDocument = async () => {
        if (!newDocument.documentTypeId) {
            showToast('error', 'Erreur', 'Veuillez sélectionner un type de document');
            return;
        }

        setUploading(true);

        try {
            let filePath = newDocument.filePath;

            // Upload file if selected
            if (selectedFile) {
                try {
                    filePath = await uploadFile(selectedFile, `credit/documents/${applicationId}`);
                    console.log('📎 Document uploaded:', filePath);
                } catch (error) {
                    console.error('Error uploading document:', error);
                    showToast('warn', 'Attention', 'Erreur lors du téléchargement du fichier');
                    setUploading(false);
                    return;
                }
            }

            const documentToSave = {
                ...newDocument,
                applicationId,
                filePath,
                userAction: getUserAction()
            };

            const response = await fetch(`${DOCUMENTS_URL}/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(documentToSave)
            });

            if (response.ok) {
                showToast('success', 'Succès', 'Document ajouté avec succès');
                setShowAddDialog(false);
                setNewDocument({});
                setSelectedFile(null);
                if (fileUploadRef.current) {
                    fileUploadRef.current.clear();
                }
                loadAllData();
            } else {
                throw new Error('Failed to add document');
            }
        } catch (err) {
            showToast('error', 'Erreur', 'Erreur lors de l\'ajout du document');
        } finally {
            setUploading(false);
        }
    };

    // Mark as received
    const handleMarkReceived = async (doc: ApplicationDocument) => {
        try {
            const response = await fetch(`${DOCUMENTS_URL}/update/${doc.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...doc,
                    isReceived: true,
                    receivedDate: new Date().toISOString().split('T')[0],
                    userAction: getUserAction()
                })
            });

            if (response.ok) {
                showToast('success', 'Succès', 'Document marqué comme reçu');
                loadAllData();
            }
        } catch (err) {
            showToast('error', 'Erreur', 'Erreur lors de la mise à jour');
        }
    };

    // Validate document
    const handleValidate = async () => {
        if (!selectedDocument) return;

        try {
            const response = await fetch(`${DOCUMENTS_URL}/update/${selectedDocument.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...selectedDocument,
                    isValidated: true,
                    validatedDate: new Date().toISOString().split('T')[0],
                    validationNotes: validationNotes,
                    userAction: getUserAction()
                })
            });

            if (response.ok) {
                showToast('success', 'Succès', 'Document validé avec succès');
                setShowValidateDialog(false);
                setSelectedDocument(null);
                setValidationNotes('');
                loadAllData();
            }
        } catch (err) {
            showToast('error', 'Erreur', 'Erreur lors de la validation');
        }
    };

    // Delete document
    const handleDelete = (doc: ApplicationDocument) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer ce document ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                try {
                    const response = await fetch(`${DOCUMENTS_URL}/delete/${doc.id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (response.ok) {
                        showToast('success', 'Succès', 'Document supprimé');
                        loadAllData();
                    }
                } catch (err) {
                    showToast('error', 'Erreur', 'Erreur lors de la suppression');
                }
            }
        });
    };

    // Format date
    const formatDate = (date: string | undefined) =>
        date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';

    // Status template
    const statusTemplate = (row: ApplicationDocument) => {
        if (row.isValidated) return <Tag value="Validé" severity="success" />;
        if (row.isReceived) return <Tag value="Reçu" severity="warning" />;
        return <Tag value="En attente" severity="danger" />;
    };

    // File template - show file info with download link
    const fileTemplate = (row: ApplicationDocument) => {
        if (!row.filePath) {
            return <span className="text-500">Aucun fichier</span>;
        }
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-file text-primary"></i>
                <span className="text-sm">{row.fileSizeKb ? `${row.fileSizeKb} KB` : ''}</span>
            </div>
        );
    };

    // View document details
    const handleViewDocument = (doc: ApplicationDocument) => {
        setSelectedDocument(doc);
        setShowViewDialog(true);
    };

    // Actions template
    const actionsTemplate = (row: ApplicationDocument) => (
        <div className="flex gap-1">
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                onClick={() => handleViewDocument(row)}
                tooltip="Voir détails"
            />
            {row.filePath && (
                <Button
                    icon="pi pi-download"
                    rounded
                    text
                    severity="secondary"
                    onClick={() => {
                        const link = document.createElement('a');
                        link.href = buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(row.filePath!)}`);
                        link.download = row.documentName || 'document';
                        link.click();
                    }}
                    tooltip="Télécharger"
                />
            )}
            {!row.isReceived && (
                <Button
                    icon="pi pi-check"
                    rounded
                    text
                    severity="success"
                    onClick={() => handleMarkReceived(row)}
                    tooltip="Marquer reçu"
                />
            )}
            {row.isReceived && !row.isValidated && (
                <Button
                    icon="pi pi-verified"
                    rounded
                    text
                    severity="warning"
                    onClick={() => {
                        setSelectedDocument(row);
                        setShowValidateDialog(true);
                    }}
                    tooltip="Valider"
                />
            )}
            {!row.isValidated && (
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => handleDelete(row)}
                    tooltip="Supprimer"
                />
            )}
        </div>
    );

    // Calculate progress
    const totalDocs = documents.length;
    const receivedDocs = documents.filter(d => d.isReceived).length;
    const validatedDocs = documents.filter(d => d.isValidated).length;
    const progress = totalDocs > 0 ? Math.round((validatedDocs / totalDocs) * 100) : 0;

    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center p-5">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
                <span className="ml-3 text-xl">Chargement des documents...</span>
            </div>
        );
    }

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <h4 className="m-0">
                    <i className="pi pi-file mr-2"></i>
                    Documents du Dossier - {application?.applicationNumber || 'N/A'}
                </h4>
                <div className="flex gap-2">
                    <Button
                        label="Ajouter Document"
                        icon="pi pi-plus"
                        onClick={() => setShowAddDialog(true)}
                    />
                    <Button
                        label="Retour aux demandes"
                        icon="pi pi-arrow-left"
                        severity="secondary"
                        onClick={() => window.location.href = '/credit/demandes'}
                    />
                </div>
            </div>

            {/* Client Info */}
            <Card className="mb-4 surface-100">
                <div className="grid">
                    <div className="col-12 md:col-3">
                        <strong><i className="pi pi-user mr-2"></i>Client:</strong><br />
                        {application?.client?.firstName} {application?.client?.lastName}
                    </div>
                    <div className="col-12 md:col-3">
                        <strong><i className="pi pi-money-bill mr-2"></i>Montant:</strong><br />
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', maximumFractionDigits: 0 }).format(application?.amountRequested || 0)}
                    </div>
                    <div className="col-12 md:col-3">
                        <strong><i className="pi pi-tag mr-2"></i>Objet:</strong><br />
                        {application?.creditPurpose?.nameFr || 'N/A'}
                    </div>
                    <div className="col-12 md:col-3">
                        <strong><i className="pi pi-chart-line mr-2"></i>Progression:</strong><br />
                        <ProgressBar value={progress} showValue className="mt-2" />
                    </div>
                </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid mb-4">
                <div className="col-12 md:col-4">
                    <Card className="text-center">
                        <div className="text-500 mb-2">Total Documents</div>
                        <div className="text-3xl font-bold text-primary">{totalDocs}</div>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card className="text-center">
                        <div className="text-500 mb-2">Documents Reçus</div>
                        <div className="text-3xl font-bold text-orange-500">{receivedDocs}</div>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card className="text-center">
                        <div className="text-500 mb-2">Documents Validés</div>
                        <div className="text-3xl font-bold text-green-500">{validatedDocs}</div>
                    </Card>
                </div>
            </div>

            {/* Documents Table */}
            <DataTable
                value={documents}
                emptyMessage="Aucun document enregistré"
                className="p-datatable-sm"
                paginator
                rows={10}
            >
                <Column field="documentType.nameFr" header="Type de Document" sortable />
                <Column
                    field="documentName"
                    header="Nom du Fichier"
                    body={(row: ApplicationDocument) => {
                        if (!row.filePath) {
                            return <span className="text-500">{row.documentName || 'Aucun fichier'}</span>;
                        }
                        return (
                            <a
                                href={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(row.filePath)}`)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline cursor-pointer flex align-items-center gap-2"
                                onClick={(e) => {
                                    // For PDFs and images, open in new tab; for others, download
                                    const isPdfOrImage = row.mimeType?.startsWith('image/') ||
                                                        row.mimeType === 'application/pdf' ||
                                                        row.filePath?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|pdf)$/);
                                    if (!isPdfOrImage) {
                                        e.preventDefault();
                                        const link = document.createElement('a');
                                        link.href = buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(row.filePath!)}`);
                                        link.download = row.documentName || 'document';
                                        link.click();
                                    }
                                }}
                            >
                                <i className="pi pi-file-pdf text-red-500"></i>
                                {row.documentName || 'Fichier'}
                            </a>
                        );
                    }}
                />
                <Column header="Fichier" body={fileTemplate} style={{ width: '100px' }} />
                <Column header="Statut" body={statusTemplate} sortable />
                <Column
                    field="receivedDate"
                    header="Date Réception"
                    body={(row) => formatDate(row.receivedDate)}
                />
                <Column
                    field="validatedDate"
                    header="Date Validation"
                    body={(row) => formatDate(row.validatedDate)}
                />
                <Column field="validationNotes" header="Notes" />
                <Column field="userAction" header="Par" />
                <Column header="Actions" body={actionsTemplate} style={{ width: '220px' }} />
            </DataTable>

            {/* Add Document Dialog */}
            <Dialog
                header="Ajouter un Document"
                visible={showAddDialog}
                style={{ width: '600px' }}
                onHide={() => {
                    setShowAddDialog(false);
                    setNewDocument({});
                    setSelectedFile(null);
                    if (fileUploadRef.current) {
                        fileUploadRef.current.clear();
                    }
                }}
            >
                <div className="formgrid grid">
                    <div className="field col-12">
                        <label className="font-semibold">Type de Document *</label>
                        <Dropdown
                            value={newDocument.documentTypeId}
                            options={documentTypes}
                            onChange={(e) => setNewDocument(prev => ({ ...prev, documentTypeId: e.value }))}
                            optionLabel="nameFr"
                            optionValue="id"
                            placeholder="Sélectionner"
                            className="w-full"
                            filter
                        />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Fichier à Télécharger</label>
                        <FileUpload
                            ref={fileUploadRef}
                            mode="basic"
                            name="documentFile"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                            maxFileSize={10000000}
                            chooseLabel={selectedFile ? selectedFile.name : "Choisir un fichier"}
                            onSelect={handleFileSelect}
                            onClear={handleFileClear}
                            className="w-full"
                            auto={false}
                            customUpload
                        />
                        {selectedFile && (
                            <div className="mt-2 p-2 surface-100 border-round">
                                <div className="flex align-items-center justify-content-between">
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-file text-primary"></i>
                                        <span className="font-semibold">{selectedFile.name}</span>
                                        <span className="text-500">({Math.round(selectedFile.size / 1024)} KB)</span>
                                    </div>
                                    <Button
                                        icon="pi pi-times"
                                        rounded
                                        text
                                        severity="danger"
                                        onClick={handleFileClear}
                                        tooltip="Supprimer"
                                    />
                                </div>
                            </div>
                        )}
                        <small className="text-500 block mt-1">
                            Formats acceptés: Images, PDF, Word, Excel (max 10 MB)
                        </small>
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Nom du Document</label>
                        <InputText
                            value={newDocument.documentName || ''}
                            onChange={(e) => setNewDocument({ ...newDocument, documentName: e.target.value })}
                            className="w-full"
                            placeholder="Ex: CNI_client.pdf (auto-rempli si fichier sélectionné)"
                        />
                    </div>
                    <div className="field col-12">
                        <label className="font-semibold">Notes</label>
                        <InputTextarea
                            value={newDocument.validationNotes || ''}
                            onChange={(e) => setNewDocument({ ...newDocument, validationNotes: e.target.value })}
                            className="w-full"
                            rows={3}
                            placeholder="Notes ou commentaires sur le document..."
                        />
                    </div>
                </div>
                <div className="flex justify-content-end gap-2 mt-4">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        severity="secondary"
                        onClick={() => {
                            setShowAddDialog(false);
                            setNewDocument({});
                            setSelectedFile(null);
                            if (fileUploadRef.current) {
                                fileUploadRef.current.clear();
                            }
                        }}
                    />
                    <Button
                        label={uploading ? "Téléchargement..." : "Ajouter"}
                        icon={uploading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                        onClick={handleAddDocument}
                        disabled={uploading}
                    />
                </div>
            </Dialog>

            {/* Validate Dialog */}
            <Dialog
                header="Valider le Document"
                visible={showValidateDialog}
                style={{ width: '500px' }}
                onHide={() => {
                    setShowValidateDialog(false);
                    setSelectedDocument(null);
                    setValidationNotes('');
                }}
            >
                <div className="mb-3">
                    <strong>Document:</strong> {selectedDocument?.documentType?.nameFr}
                </div>
                <div className="field">
                    <label className="font-semibold">Notes de Validation</label>
                    <InputTextarea
                        value={validationNotes}
                        onChange={(e) => setValidationNotes(e.target.value)}
                        className="w-full"
                        rows={4}
                        placeholder="Notes optionnelles..."
                    />
                </div>
                <div className="flex justify-content-end gap-2 mt-4">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        severity="secondary"
                        onClick={() => {
                            setShowValidateDialog(false);
                            setSelectedDocument(null);
                            setValidationNotes('');
                        }}
                    />
                    <Button
                        label="Valider"
                        icon="pi pi-check"
                        severity="success"
                        onClick={handleValidate}
                    />
                </div>
            </Dialog>

            {/* View Document Dialog */}
            <Dialog
                header="Détails du Document"
                visible={showViewDialog}
                style={{ width: '700px' }}
                onHide={() => {
                    setShowViewDialog(false);
                    setSelectedDocument(null);
                }}
            >
                {selectedDocument && (
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round mb-3">
                                <h6 className="mt-0 mb-3"><i className="pi pi-info-circle mr-2"></i>Informations</h6>
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Type:</span>
                                        <span className="font-semibold">{selectedDocument.documentType?.nameFr || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Nom:</span>
                                        <span className="font-semibold">{selectedDocument.documentName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Taille:</span>
                                        <span className="font-semibold">{selectedDocument.fileSizeKb ? `${selectedDocument.fileSizeKb} KB` : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Format:</span>
                                        <span className="font-semibold">{selectedDocument.mimeType || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round mb-3">
                                <h6 className="mt-0 mb-3"><i className="pi pi-check-circle mr-2"></i>Statut</h6>
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between align-items-center">
                                        <span className="text-500">Statut:</span>
                                        {statusTemplate(selectedDocument)}
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date Réception:</span>
                                        <span className="font-semibold">{formatDate(selectedDocument.receivedDate)}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date Validation:</span>
                                        <span className="font-semibold">{formatDate(selectedDocument.validatedDate)}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Par:</span>
                                        <span className="font-semibold">{selectedDocument.userAction || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {selectedDocument.validationNotes && (
                            <div className="col-12">
                                <div className="surface-100 p-3 border-round mb-3">
                                    <h6 className="mt-0 mb-2"><i className="pi pi-comment mr-2"></i>Notes</h6>
                                    <p className="m-0">{selectedDocument.validationNotes}</p>
                                </div>
                            </div>
                        )}
                        {selectedDocument.filePath && (
                            <div className="col-12">
                                <div className="surface-100 p-3 border-round">
                                    <h6 className="mt-0 mb-3"><i className="pi pi-file mr-2"></i>Aperçu du Fichier</h6>
                                    {selectedDocument.mimeType?.startsWith('image/') || selectedDocument.filePath?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                        <div className="text-center">
                                            <Image
                                                src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedDocument.filePath)}`)}
                                                alt={selectedDocument.documentName || 'Document'}
                                                width="300"
                                                preview
                                                imageClassName="border-round shadow-1"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-column gap-2 align-items-center">
                                            <i className="pi pi-file text-5xl text-primary"></i>
                                            <span className="text-500">{selectedDocument.documentName}</span>
                                            <Button
                                                label="Ouvrir le fichier"
                                                icon="pi pi-external-link"
                                                onClick={() => window.open(buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedDocument.filePath!)}`), '_blank')}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="flex justify-content-end gap-2 mt-4">
                    <Button
                        label="Fermer"
                        icon="pi pi-times"
                        severity="secondary"
                        onClick={() => {
                            setShowViewDialog(false);
                            setSelectedDocument(null);
                        }}
                    />
                    {selectedDocument?.filePath && (
                        <Button
                            label="Télécharger"
                            icon="pi pi-download"
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedDocument.filePath!)}`);
                                link.download = selectedDocument.documentName || 'document';
                                link.click();
                            }}
                        />
                    )}
                </div>
            </Dialog>
        </div>
    );
}
