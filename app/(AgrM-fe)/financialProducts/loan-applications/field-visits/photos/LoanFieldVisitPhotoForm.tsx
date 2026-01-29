'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import { LoanFieldVisitPhoto } from './LoanFieldVisitPhoto';

interface LoanFieldVisitPhotoFormProps {
    visible: boolean;
    fieldVisitId: number;
    onHide: () => void;
    onUpload: () => void;
}

interface PhotoUpload {
    file: File;
    preview: string;
    caption: string;
}

const LoanFieldVisitPhotoForm: React.FC<LoanFieldVisitPhotoFormProps> = ({
    visible,
    fieldVisitId,
    onHide,
    onUpload
}) => {
    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const [photos, setPhotos] = useState<PhotoUpload[]>([]);
    const [loading, setLoading] = useState(false);

    const maxFileSize = 5000000; // 5MB

    useEffect(() => {
        if (!visible) {
            setPhotos([]);
            fileUploadRef.current?.clear();
        }
    }, [visible]);

    const onSelect = (e: any) => {
        const files = e.files;
        const newPhotos: PhotoUpload[] = [];

        files.forEach((file: File) => {
            if (file.size > maxFileSize) {
                toast.current?.show({
                    severity: 'warn',
                    summary: 'File Too Large',
                    detail: `${file.name} exceeds 5MB limit`,
                    life: 3000
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                newPhotos.push({
                    file,
                    preview: reader.result as string,
                    caption: ''
                });

                if (newPhotos.length === files.length) {
                    setPhotos([...photos, ...newPhotos]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const updateCaption = (index: number, caption: string) => {
        const updatedPhotos = [...photos];
        updatedPhotos[index].caption = caption;
        setPhotos(updatedPhotos);
    };

    const removePhoto = (index: number) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        setPhotos(updatedPhotos);
    };

    const handleUpload = async () => {
        if (photos.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'No Photos',
                detail: 'Please select at least one photo to upload',
                life: 3000
            });
            return;
        }

        setLoading(true);

        try {
            for (const photo of photos) {
                const formData = new FormData();
                formData.append('file', photo.file);
                formData.append('caption', photo.caption);
                formData.append('fieldVisitId', fieldVisitId.toString());

                const response = await fetch(
                    `/api/financial-products/loan-applications/field-visits/${fieldVisitId}/photos/`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to upload ${photo.file.name}`);
                }
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Succès',
                detail: `${photos.length} photo(s) uploaded successfully`,
                life: 3000
            });

            setPhotos([]);
            fileUploadRef.current?.clear();
            onUpload();
            onHide();
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Failed to upload photos',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const dialogFooter = (
        <div>
            <Button
                label="Annuler"
                icon="pi pi-times"
                onClick={onHide}
                className="p-button-text"
                disabled={loading}
            />
            <Button
                label="Télécharger"
                icon="pi pi-upload"
                onClick={handleUpload}
                disabled={loading || photos.length === 0}
                loading={loading}
            />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                visible={visible}
                style={{ width: '900px' }}
                header="Upload Field Visit Photos"
                modal
                className="p-fluid"
                footer={dialogFooter}
                onHide={onHide}
            >
                <div className="field">
                    <FileUpload
                        ref={fileUploadRef}
                        name="photos"
                        accept="image/*"
                        maxFileSize={maxFileSize}
                        multiple
                        onSelect={onSelect}
                        auto={false}
                        customUpload
                        chooseLabel="Select Photos"
                        uploadLabel="Upload All"
                        cancelLabel="Clear"
                        emptyTemplate={
                            <p className="text-center p-4">
                                Drag and drop images here to upload (max 5MB per file)
                            </p>
                        }
                    />
                </div>

                {photos.length > 0 && (
                    <div className="mt-4">
                        <h4>Selected Photos ({photos.length})</h4>
                        <div className="grid">
                            {photos.map((photo, index) => (
                                <div key={index} className="col-12 md:col-6 lg:col-4">
                                    <div className="border-1 border-300 border-round p-3">
                                        <div className="relative">
                                            <Image
                                                src={photo.preview}
                                                alt={`Preview ${index + 1}`}
                                                width="100%"
                                                preview
                                            />
                                            <Button
                                                icon="pi pi-times"
                                                rounded
                                                severity="danger"
                                                className="absolute"
                                                style={{ top: '5px', right: '5px' }}
                                                onClick={() => removePhoto(index)}
                                                type="button"
                                            />
                                        </div>
                                        <div className="mt-2">
                                            <small className="block mb-1">
                                                {photo.file.name} ({(photo.file.size / 1024 / 1024).toFixed(2)} MB)
                                            </small>
                                            <InputText
                                                placeholder="Enter caption (optional)"
                                                value={photo.caption}
                                                onChange={(e) => updateCaption(index, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default LoanFieldVisitPhotoForm;
