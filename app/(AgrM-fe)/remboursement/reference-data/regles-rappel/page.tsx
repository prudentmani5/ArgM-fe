'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

interface RegleRappel {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    daysRelative?: number;
    reminderType?: string;
    channel?: string;
    messageTemplateFr?: string;
    messageTemplateEn?: string;
    requiresAction?: boolean;
    actionDescription?: string;
    escalationRequired?: boolean;
    sortOrder?: number;
    isActive?: boolean;
}

class RegleRappelClass implements RegleRappel {
    id?: number;
    code?: string = '';
    name?: string = '';
    nameFr?: string = '';
    daysRelative?: number = 1;
    reminderType?: string = 'REMINDER';
    channel?: string = 'SMS';
    messageTemplateFr?: string = '';
    messageTemplateEn?: string = '';
    requiresAction?: boolean = false;
    actionDescription?: string = '';
    escalationRequired?: boolean = false;
    sortOrder?: number = 0;
    isActive?: boolean = true;
}

const TYPES_RAPPEL = [
    { label: 'Rappel Simple', value: 'REMINDER' },
    { label: 'Relance', value: 'FOLLOW_UP' },
    { label: 'Mise en Demeure', value: 'FORMAL_NOTICE' },
    { label: 'Convocation', value: 'SUMMONS' },
    { label: 'Avis Final', value: 'FINAL_NOTICE' }
];

const CANAUX_COMMUNICATION = [
    { label: 'SMS', value: 'SMS' },
    { label: 'Email', value: 'EMAIL' },
    { label: 'Appel Téléphonique', value: 'PHONE' },
    { label: 'Lettre', value: 'LETTER' },
    { label: 'Visite à Domicile', value: 'VISIT' }
];

export default function ReglesRappelPage() {
    const [regles, setRegles] = useState<RegleRappel[]>([]);
    const [regle, setRegle] = useState<RegleRappel>(new RegleRappelClass());
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/reminder-rules');

    useEffect(() => {
        loadRegles();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'getall':
                    setRegles(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: isEdit ? 'Règle modifiée' : 'Règle créée', life: 3000 });
                    loadRegles();
                    setDialogVisible(false);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Règle supprimée', life: 3000 });
                    loadRegles();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue', life: 3000 });
        }
    }, [data, error, callType]);

    const loadRegles = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'getall');
    };

    const openNew = () => {
        setRegle(new RegleRappelClass());
        setIsEdit(false);
        setDialogVisible(true);
    };

    const openEdit = (rowData: RegleRappel) => {
        setRegle({ ...rowData });
        setIsEdit(true);
        setDialogVisible(true);
    };

    const handleSave = () => {
        if (!regle.code || !regle.name || !regle.nameFr || regle.daysRelative === undefined) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez remplir les champs obligatoires', life: 3000 });
            return;
        }

        if (isEdit && regle.id) {
            fetchData(regle, 'PUT', `${BASE_URL}/update/${regle.id}`, 'update');
        } else {
            fetchData(regle, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const confirmDelete = (rowData: RegleRappel) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la règle "${rowData.nameFr || rowData.name}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRegle(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setRegle(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setRegle(prev => ({ ...prev, [name]: value }));
    };

    const leftToolbarTemplate = () => {
        return (
            <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} />
        );
    };

    const actionBodyTemplate = (rowData: RegleRappel) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const activeBodyTemplate = (rowData: RegleRappel) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const actionRequiredBodyTemplate = (rowData: RegleRappel) => {
        return <Tag value={rowData.requiresAction ? 'Action Requise' : 'Auto'} severity={rowData.requiresAction ? 'warning' : 'info'} />;
    };

    const escalationBodyTemplate = (rowData: RegleRappel) => {
        return rowData.escalationRequired ? <Tag value="Escalade" severity="danger" icon="pi pi-exclamation-triangle" /> : '-';
    };

    const canalBodyTemplate = (rowData: RegleRappel) => {
        const canal = CANAUX_COMMUNICATION.find(c => c.value === rowData.channel);
        const iconMap: { [key: string]: string } = {
            'SMS': 'pi-mobile',
            'EMAIL': 'pi-envelope',
            'PHONE': 'pi-phone',
            'LETTER': 'pi-file',
            'VISIT': 'pi-map-marker'
        };
        return (
            <div className="flex align-items-center gap-2">
                <i className={`pi ${iconMap[rowData.channel || ''] || 'pi-bell'}`}></i>
                <span>{canal?.label || rowData.channel}</span>
            </div>
        );
    };

    const typeBodyTemplate = (rowData: RegleRappel) => {
        const type = TYPES_RAPPEL.find(t => t.value === rowData.reminderType);
        return type?.label || rowData.reminderType;
    };

    const daysBodyTemplate = (rowData: RegleRappel) => {
        if (rowData.daysRelative === 0) return 'Jour J';
        if ((rowData.daysRelative || 0) < 0) return `J${rowData.daysRelative}`;
        return `J+${rowData.daysRelative}`;
    };

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setDialogVisible(false)} />
            <Button label="Enregistrer" icon="pi pi-check" onClick={handleSave} loading={loading && (callType === 'create' || callType === 'update')} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2 className="mb-4">
                <i className="pi pi-bell mr-2"></i>
                Règles de Rappel Automatique
            </h2>

            <div className="surface-100 p-3 border-round mb-4">
                <p className="m-0">
                    <i className="pi pi-info-circle mr-2"></i>
                    <strong>Actions automatisées:</strong>
                    <br />
                    <span className="ml-4">J+1: SMS de rappel | J+3: Appel téléphonique | J+7: Lettre de relance</span>
                    <br />
                    <span className="ml-4">J+15: Visite à domicile | J+30: Convocation | J+60: Mise en demeure</span>
                </p>
            </div>

            <Toolbar className="mb-4" left={leftToolbarTemplate} />

            <DataTable
                value={regles}
                loading={loading && callType === 'getall'}
                paginator
                rows={10}
                emptyMessage="Aucune règle trouvée"
                stripedRows
                sortField="daysRelative"
                sortOrder={1}
            >
                <Column field="code" header="Code" sortable />
                <Column field="nameFr" header="Nom (FR)" sortable />
                <Column field="daysRelative" header="Déclenchement" body={daysBodyTemplate} sortable />
                <Column field="reminderType" header="Type" body={typeBodyTemplate} />
                <Column field="channel" header="Canal" body={canalBodyTemplate} />
                <Column field="requiresAction" header="Action" body={actionRequiredBodyTemplate} />
                <Column field="escalationRequired" header="Escalade" body={escalationBodyTemplate} />
                <Column field="sortOrder" header="Ordre" sortable />
                <Column field="isActive" header="Statut" body={activeBodyTemplate} />
                <Column header="Actions" body={actionBodyTemplate} style={{ width: '10rem' }} />
            </DataTable>

            <Dialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                header={isEdit ? 'Modifier la Règle' : 'Nouvelle Règle de Rappel'}
                style={{ width: '60vw' }}
                footer={dialogFooter}
                modal
            >
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="ruleName" className="font-semibold">Nom de la Règle *</label>
                            <InputText
                                id="ruleName"
                                name="ruleName"
                                value={regle.ruleName || ''}
                                onChange={handleChange}
                                className="w-full"
                                placeholder="Ex: Rappel SMS J+1"
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="daysAfterDue" className="font-semibold">Jours Après Échéance *</label>
                            <InputNumber
                                id="daysAfterDue"
                                value={regle.daysAfterDue ?? null}
                                onValueChange={(e) => handleNumberChange('daysAfterDue', e.value ?? null)}
                                className="w-full"
                                showButtons
                                prefix="J+"
                            />
                            <small className="text-500">Utilisez des valeurs négatives pour rappels avant échéance</small>
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="reminderType" className="font-semibold">Type de Rappel</label>
                            <Dropdown
                                id="reminderType"
                                value={regle.reminderType}
                                options={TYPES_RAPPEL}
                                onChange={(e) => handleDropdownChange('reminderType', e.value)}
                                className="w-full"
                                placeholder="Sélectionner..."
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="channel" className="font-semibold">Canal de Communication</label>
                            <Dropdown
                                id="channel"
                                value={regle.channel}
                                options={CANAUX_COMMUNICATION}
                                onChange={(e) => handleDropdownChange('channel', e.value)}
                                className="w-full"
                                placeholder="Sélectionner..."
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="messageTemplate" className="font-semibold">Modèle de Message</label>
                            <InputTextarea
                                id="messageTemplate"
                                name="messageTemplate"
                                value={regle.messageTemplate || ''}
                                onChange={handleChange}
                                className="w-full"
                                rows={4}
                                placeholder="Variables disponibles: {clientName}, {amount}, {dueDate}, {loanNumber}..."
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="description" className="font-semibold">Description</label>
                            <InputTextarea
                                id="description"
                                name="description"
                                value={regle.description || ''}
                                onChange={handleChange}
                                className="w-full"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="isAutomatic" className="font-semibold block mb-2">Exécution Automatique</label>
                            <InputSwitch
                                id="isAutomatic"
                                checked={regle.isAutomatic ?? true}
                                onChange={(e) => setRegle(prev => ({ ...prev, isAutomatic: e.value }))}
                            />
                        </div>
                    </div>

                    <div className="col-12 md:col-4">
                        <div className="field">
                            <label htmlFor="active" className="font-semibold block mb-2">Actif</label>
                            <InputSwitch
                                id="active"
                                checked={regle.active ?? true}
                                onChange={(e) => setRegle(prev => ({ ...prev, active: e.value }))}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
