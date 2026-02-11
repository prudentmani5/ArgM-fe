'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import useConsumApi, { getUserAction } from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { TauxChange } from '../../types';
import Cookies from 'js-cookie';

export default function TauxChangePage() {
    const [tauxList, setTauxList] = useState<TauxChange[]>([]);
    const [currentTaux, setCurrentTaux] = useState<TauxChange | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [newTaux, setNewTaux] = useState<number | null>(null);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/comptability/settings/taux-change');

    useEffect(() => {
        loadTauxList();
        loadCurrentTaux();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setTauxList(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'getcurrent':
                    setCurrentTaux(data);
                    break;
                case 'create':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succes',
                        detail: 'Nouveau taux de change enregistre avec succes',
                        life: 3000
                    });
                    setDialogVisible(false);
                    setNewTaux(null);
                    loadTauxList();
                    loadCurrentTaux();
                    break;
            }
        }
        if (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: error.message || 'Une erreur est survenue',
                life: 3000
            });
        }
    }, [data, error, callType]);

    const loadTauxList = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const loadCurrentTaux = () => {
        fetchData(null, 'GET', `${BASE_URL}/current`, 'getcurrent');
    };

    const openNew = () => {
        setNewTaux(null);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!newTaux || newTaux <= 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez saisir un taux de change valide (superieur a 0)',
                life: 3000
            });
            return;
        }

        const appUser = JSON.parse(Cookies.get('appUser') || '{}');
        const userId = appUser.id || appUser.userId;

        if (!userId) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Utilisateur non identifie. Veuillez vous reconnecter.',
                life: 3000
            });
            return;
        }

        const body = {
            taux: newTaux,
            userId: userId,
            userAction: getUserAction()
        };

        fetchData(body, 'POST', `${BASE_URL}/new`, 'create');
    };

    // --- Column body templates ---

    const tauxBodyTemplate = (rowData: TauxChange) => {
        return (
            <span className="font-semibold">
                {rowData.taux?.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                })}
            </span>
        );
    };

    const dateBodyTemplate = (rowData: TauxChange) => {
        if (!rowData.dateCreation) return '-';
        try {
            const date = new Date(rowData.dateCreation);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return rowData.dateCreation;
        }
    };

    const actifBodyTemplate = (rowData: TauxChange) => {
        return (
            <Tag
                value={rowData.actif ? 'Actif' : 'Inactif'}
                severity={rowData.actif ? 'success' : 'danger'}
            />
        );
    };

    // --- Toolbar ---

    const leftToolbarTemplate = () => {
        return (
            <Button
                label="Nouveau Taux"
                icon="pi pi-plus"
                severity="success"
                onClick={openNew}
            />
        );
    };

    // --- Dialog footer ---

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Annuler"
                icon="pi pi-times"
                severity="secondary"
                onClick={() => setDialogVisible(false)}
            />
            <Button
                label="Enregistrer"
                icon="pi pi-check"
                onClick={handleSave}
                loading={loading && callType === 'create'}
            />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="mb-4">
                <i className="pi pi-sync mr-2"></i>
                Gestion des Taux de Change
            </h2>

            {/* Current active rate card */}
            <div className="surface-card shadow-2 border-round p-4 mb-4">
                <div className="flex align-items-center justify-content-between">
                    <div>
                        <span className="text-500 font-medium block mb-2">
                            Taux de Change Actuel
                        </span>
                        <span className="text-4xl font-bold text-primary">
                            {currentTaux
                                ? currentTaux.taux?.toLocaleString('fr-FR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6
                                  })
                                : '---'}
                        </span>
                        {currentTaux && (
                            <div className="text-500 text-sm mt-2">
                                Defini par <strong>{currentTaux.userName}</strong>
                                {currentTaux.dateCreation && (
                                    <span>
                                        {' '}le{' '}
                                        {new Date(currentTaux.dateCreation).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <i
                            className="pi pi-dollar text-primary"
                            style={{ fontSize: '3rem', opacity: 0.3 }}
                        ></i>
                    </div>
                </div>
            </div>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={tauxList}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                emptyMessage="Aucun taux de change enregistre"
                stripedRows
                sortField="dateCreation"
                sortOrder={-1}
            >
                <Column
                    field="taux"
                    header="Taux"
                    body={tauxBodyTemplate}
                    sortable
                />
                <Column
                    field="userName"
                    header="Utilisateur"
                    sortable
                />
                <Column
                    field="dateCreation"
                    header="Date de Creation"
                    body={dateBodyTemplate}
                    sortable
                />
                <Column
                    field="actif"
                    header="Statut"
                    body={actifBodyTemplate}
                    sortable
                />
            </DataTable>

            {/* Dialog for new taux */}
            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header="Nouveau Taux de Change"
                style={{ width: '30vw' }}
                footer={dialogFooter}
                modal
            >
                <div className="grid">
                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="taux" className="font-semibold block mb-2">
                                Taux de Change *
                            </label>
                            <InputNumber
                                id="taux"
                                value={newTaux}
                                onValueChange={(e) => setNewTaux(e.value ?? null)}
                                className="w-full"
                                placeholder="Saisir le nouveau taux"
                                minFractionDigits={2}
                                maxFractionDigits={6}
                                locale="fr-FR"
                            />
                            <small className="text-500 block mt-1">
                                Le nouveau taux remplacera le taux actuel comme taux actif.
                            </small>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
