'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataView } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Image } from 'primereact/image';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useSearchParams } from 'next/navigation';
import { LoanFieldVisitPhoto } from './LoanFieldVisitPhoto';
import LoanFieldVisitPhotoForm from './LoanFieldVisitPhotoForm';

const LoanFieldVisitPhotoPage = () => {
    const [photos, setPhotos] = useState<LoanFieldVisitPhoto[]>([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const fieldVisitId = searchParams.get('fieldVisitId');

    useEffect(() => {
        if (fieldVisitId) {
            fetchPhotos();
        }
    }, [fieldVisitId]);

    const fetchPhotos = async () => {
        if (!fieldVisitId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/financial-products/loan-applications/field-visits/${fieldVisitId}/photos/`
            );
            if (response.ok) {
                const data = await response.json();
                setPhotos(data);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Failed to fetch photos',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Failed to fetch photos',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const deletePhoto = (photo: LoanFieldVisitPhoto) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer this photo?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const response = await fetch(
                        `/api/financial-products/loan-applications/field-visits/${fieldVisitId}/photos/${photo.id}`,
                        { method: 'DELETE' }
                    );

                    if (response.ok) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Photo supprimé avec succès',
                            life: 3000
                        });
                        fetchPhotos();
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Échec de la suppression de photo',
                        life: 3000
                    });
                }
            }
        });
    };

    const itemTemplate = (photo: LoanFieldVisitPhoto) => {
        return (
            <div className="col-12 md:col-6 lg:col-4 xl:col-3">
                <div className="card m-2">
                    <div className="relative">
                        <Image
                            src={photo.fileUrl}
                            alt={photo.fileName}
                            width="100%"
                            preview
                            imageClassName="border-round"
                        />
                        <Button
                            icon="pi pi-trash"
                            rounded
                            severity="danger"
                            className="absolute"
                            style={{ top: '10px', right: '10px' }}
                            onClick={() => deletePhoto(photo)}
                            tooltip="Delete"
                            tooltipOptions={{ position: 'top' }}
                        />
                    </div>
                    <div className="mt-3">
                        {photo.caption && (
                            <p className="text-lg font-medium mb-2">{photo.caption}</p>
                        )}
                        <div className="text-sm text-500">
                            <div className="flex align-items-center mb-1">
                                <i className="pi pi-file mr-2"></i>
                                <span>{photo.fileName}</span>
                            </div>
                            <div className="flex align-items-center mb-1">
                                <i className="pi pi-chart-bar mr-2"></i>
                                <span>{(photo.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                            <div className="flex align-items-center mb-1">
                                <i className="pi pi-user mr-2"></i>
                                <span>{photo.uploadedBy}</span>
                            </div>
                            <div className="flex align-items-center">
                                <i className="pi pi-calendar mr-2"></i>
                                <span>{new Date(photo.uploadedAt!).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Upload Photos"
                    icon="pi pi-upload"
                    severity="success"
                    onClick={() => setDialogVisible(true)}
                    disabled={!fieldVisitId}
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex align-items-center gap-2">
                <i className="pi pi-images"></i>
                <span className="font-semibold">{photos.length} Photo(s)</span>
            </div>
        );
    };

    if (!fieldVisitId) {
        return (
            <div className="card">
                <div className="text-center p-5">
                    <i className="pi pi-exclamation-circle text-4xl text-orange-500"></i>
                    <p className="text-xl mt-3">Please select a field visit to view photos</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataView
                value={photos}
                itemTemplate={itemTemplate}
                layout="grid"
                loading={loading}
                emptyMessage={
                    <div className="text-center p-5">
                        <i className="pi pi-images text-6xl text-300"></i>
                        <p className="text-xl mt-3">No photos uploaded yet</p>
                    </div>
                }
            />

            {fieldVisitId && (
                <LoanFieldVisitPhotoForm
                    visible={dialogVisible}
                    fieldVisitId={parseInt(fieldVisitId)}
                    onHide={() => setDialogVisible(false)}
                    onUpload={fetchPhotos}
                />
            )}
        </div>
    );
};

export default LoanFieldVisitPhotoPage;
