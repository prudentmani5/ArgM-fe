'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadUploadEvent } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';
import { LoanApplicationDocument } from './LoanApplicationDocument';

interface LoanApplicationDocumentFormProps {
    visible: boolean;
    document?: LoanApplicationDocument;
    applicationId: number;
    onHide: () => void;
    onSave: (document: LoanApplicationDocument) => void;
}

export const LoanApplicationDocumentForm: React.FC<LoanApplicationDocumentFormProps> = ({
    visible,
    document,
    applicationId,
    onHide,
    onSave
}) => {
    const [formData, setFormData] = useState<LoanApplicationDocument>(new LoanApplicationDocument());
    const [documentTypes, setDocumentTypes] = useState<any[]>([]);
    const [uploadedFile, setUploadedFile] = useState<any>(null);

    useEffect(() => {
        if (visible) {
            if (document) {
                setFormData(document);
            } else {
                const newDoc = new LoanApplicationDocument();
                newDoc.applicationId = applicationId;
                setFormData(newDoc);
            }
            loadDocumentTypes();
        }
    }, [visible, document, applicationId]);

    const loadDocumentTypes = async () => {
        try {
            const response = await fetch('/api/financial-products/reference/document-types/');
            const data = await response.json();
            setDocumentTypes(data);
        } catch (error) {
            console.error('Error loading document types:', error);
        }
    };

    const handleFileUpload = async (event: FileUploadUploadEvent) => {
        const file = event.files[0];

        // In a real implementation, upload to server and get URL
        // For now, simulate file upload
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            // Simulated upload - replace with actual upload endpoint
            const uploadResponse = await fetch('/api/upload/', {
                method: 'POST',
                body: formDataUpload
            });

            const uploadData = await uploadResponse.json();

            setFormData({
                ...formData,
                fileName: file.name,
                fileUrl: uploadData.url || '',
                fileSize: file.size
            });

            setUploadedFile(file);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    const footer = (
        <div>
            <Button label="Annuler" icon="pi pi-times" onClick={onHide} className="p-button-text" />
            <Button label="Enregistrer" icon="pi pi-check" onClick={handleSubmit} autoFocus />
        </div>
    );

    return (
        <Dialog
            visible={visible}
            style={{ width: '50vw' }}
            header={document?.id ? 'Edit Document' : 'Upload Document'}
            modal
            footer={footer}
            onHide={onHide}
        >
            <div className="p-fluid">
                <div className="field">
                    <label htmlFor="documentTypeId">Document Type *</label>
                    <Dropdown
                        id="documentTypeId"
                        value={formData.documentTypeId}
                        options={documentTypes}
                        onChange={(e) => setFormData({ ...formData, documentTypeId: e.value })}
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Select Document Type"
                        filter
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="fileUpload">File Upload *</label>
                    <FileUpload
                        id="fileUpload"
                        mode="basic"
                        name="file"
                        accept="application/pdf,image/*,.doc,.docx"
                        maxFileSize={10000000}
                        customUpload
                        uploadHandler={handleFileUpload}
                        auto
                        chooseLabel={formData.fileName || 'Choose File'}
                    />
                    {formData.fileName && (
                        <small className="block mt-2">
                            Current file: {formData.fileName}
                            {formData.fileSize && ` (${(formData.fileSize / 1024).toFixed(2)} KB)`}
                        </small>
                    )}
                </div>

                <div className="field">
                    <label htmlFor="notes">Notes</label>
                    <InputTextarea
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        placeholder="Additional notes about this document..."
                    />
                </div>

                {document?.id && (
                    <div className="field">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="isVerified"
                                checked={formData.isVerified}
                                onChange={(e) => setFormData({ ...formData, isVerified: e.checked || false })}
                            />
                            <label htmlFor="isVerified" className="ml-2">Document Verified</label>
                        </div>
                        {formData.verifiedBy && (
                            <small className="block mt-2">
                                Verified by: {formData.verifiedBy.name} on {formData.verifiedAt ? new Date(formData.verifiedAt).toLocaleDateString() : ''}
                            </small>
                        )}
                    </div>
                )}
            </div>
        </Dialog>
    );
};
