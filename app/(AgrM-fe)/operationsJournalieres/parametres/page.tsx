'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';

import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

const PARAMETRES_URL = buildApiUrl('/api/operations-journalieres/parametres');

interface Parametre {
    parametreId?: number;
    codeParam: string;
    libelleParam: string;
    valeurParam: string;
    descriptionParam: string;
    typeValeur: string;
    unite: string;
}

const defaultParams: Parametre[] = [
    { codeParam: 'OPENING_TIME', libelleParam: "Heure d'Ouverture", valeurParam: '08:00', descriptionParam: "Heure à laquelle le système s'ouvre pour les transactions", typeValeur: 'TIME', unite: 'HH:MM' },
    { codeParam: 'CLOSING_TIME', libelleParam: 'Heure de Fermeture', valeurParam: '17:00', descriptionParam: 'Heure à laquelle les nouvelles transactions sont bloquées', typeValeur: 'TIME', unite: 'HH:MM' },
    { codeParam: 'PRE_CLOSE_WARNING', libelleParam: 'Avertissement Pré-Fermeture', valeurParam: '15', descriptionParam: 'Minutes avant la fermeture pour notifier les utilisateurs', typeValeur: 'INTEGER', unite: 'minutes' },
    { codeParam: 'EOD_START_DELAY', libelleParam: 'Délai Démarrage EOD', valeurParam: '5', descriptionParam: 'Minutes après la fermeture avant le démarrage de l\'EOD', typeValeur: 'INTEGER', unite: 'minutes' },
    { codeParam: 'BACKUP_RETENTION', libelleParam: 'Rétention des Sauvegardes', valeurParam: '90', descriptionParam: 'Nombre de jours de conservation des sauvegardes quotidiennes', typeValeur: 'INTEGER', unite: 'jours' },
    { codeParam: 'AUDIT_LOG_RETENTION', libelleParam: "Rétention des Journaux d'Audit", valeurParam: '7', descriptionParam: "Nombre d'années de conservation des journaux d'audit", typeValeur: 'INTEGER', unite: 'années' },
    { codeParam: 'INTERBANK_CUTOFF', libelleParam: 'Délai Transferts Interbancaires', valeurParam: '15:30', descriptionParam: 'Délai limite pour les transferts interbancaires', typeValeur: 'TIME', unite: 'HH:MM' },
];

const ParametresPage = () => {
    const [parametres, setParametres] = useState<Parametre[]>([]);
    const [selectedParam, setSelectedParam] = useState<Parametre | null>(null);
    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [editValeur, setEditValeur] = useState('');
    const [loading, setLoading] = useState(false);

    const toast = useRef<Toast>(null);
    const parametresApi = useConsumApi('');
    const saveApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    useEffect(() => {
        loadParametres();
    }, []);

    const loadParametres = () => {
        setLoading(true);
        parametresApi.fetchData(null, 'GET', PARAMETRES_URL, 'loadParametres');
    };

    useEffect(() => {
        if (parametresApi.data && parametresApi.callType === 'loadParametres') {
            const data = Array.isArray(parametresApi.data) ? parametresApi.data : [];
            if (data.length === 0) {
                setParametres(defaultParams);
            } else {
                setParametres(data);
            }
            setLoading(false);
        }
        if (parametresApi.error && parametresApi.callType === 'loadParametres') {
            setParametres(defaultParams);
            setLoading(false);
        }
    }, [parametresApi.data, parametresApi.error, parametresApi.callType]);

    useEffect(() => {
        if (saveApi.data && saveApi.callType === 'saveParam') {
            showToast('success', 'Succès', 'Paramètre mis à jour avec succès');
            setEditDialogVisible(false);
            loadParametres();
        }
        if (saveApi.error && saveApi.callType === 'saveParam') {
            showToast('error', 'Erreur', saveApi.error.message || 'Erreur lors de la mise à jour');
        }
    }, [saveApi.data, saveApi.error, saveApi.callType]);

    const openEdit = (param: Parametre) => {
        setSelectedParam(param);
        setEditValeur(param.valeurParam);
        setEditDialogVisible(true);
    };

    const saveParam = () => {
        if (!selectedParam) return;
        if (!editValeur.trim()) {
            showToast('warn', 'Attention', 'La valeur ne peut pas être vide');
            return;
        }
        const payload = {
            ...selectedParam,
            valeurParam: editValeur.trim(),
            userAction: getUserAction(),
        };
        if (selectedParam.parametreId) {
            saveApi.fetchData(payload, 'PUT', `${PARAMETRES_URL}/${selectedParam.parametreId}`, 'saveParam');
        } else {
            saveApi.fetchData(payload, 'POST', PARAMETRES_URL, 'saveParam');
        }
    };

    const uniteTemplate = (rowData: Parametre) => (
        <Tag value={rowData.unite} severity="info" rounded />
    );

    const typeTemplate = (rowData: Parametre) => {
        const colorMap: Record<string, 'success' | 'info' | 'warning'> = {
            TIME: 'success',
            INTEGER: 'info',
            STRING: 'warning',
        };
        return <Tag value={rowData.typeValeur} severity={colorMap[rowData.typeValeur] || 'info'} rounded />;
    };

    const actionTemplate = (rowData: Parametre) => (
        <Button
            icon="pi pi-pencil"
            rounded
            outlined
            severity="warning"
            tooltip="Modifier"
            onClick={() => openEdit(rowData)}
        />
    );

    const editFooter = (
        <div className="flex gap-2 justify-content-end">
            <Button label="Annuler" icon="pi pi-times" outlined onClick={() => setEditDialogVisible(false)} />
            <Button label="Enregistrer" icon="pi pi-check" onClick={saveParam} loading={saveApi.loading} />
        </div>
    );

    return (
        <ProtectedPage requiredAuthorities={['OJ_PARAMETRES_VIEW', 'OJ_PARAMETRES_MANAGE', 'ADMIN']}>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="card">
                <div className="flex align-items-center gap-3 mb-4">
                    <i className="pi pi-sliders-h text-4xl text-primary" />
                    <div>
                        <h2 className="m-0 text-900">Paramètres du Système</h2>
                        <p className="m-0 text-500 text-sm">Configuration des heures d'ouverture, fermeture et traitements EOD</p>
                    </div>
                </div>

                <div className="grid mb-4">
                    {[
                        { label: "Heure d'Ouverture", code: 'OPENING_TIME', icon: 'pi-sun', color: '#4CAF50' },
                        { label: 'Heure de Fermeture', code: 'CLOSING_TIME', icon: 'pi-moon', color: '#FF9800' },
                        { label: 'Pré-Fermeture (min)', code: 'PRE_CLOSE_WARNING', icon: 'pi-bell', color: '#2196F3' },
                        { label: 'Délai EOD (min)', code: 'EOD_START_DELAY', icon: 'pi-cog', color: '#9C27B0' },
                    ].map(item => {
                        const param = parametres.find(p => p.codeParam === item.code);
                        return (
                            <div key={item.code} className="col-12 md:col-6 lg:col-3">
                                <Card className="text-center">
                                    <i className={`pi ${item.icon} text-3xl mb-2`} style={{ color: item.color }} />
                                    <div className="text-2xl font-bold" style={{ color: item.color }}>{param?.valeurParam || '-'}</div>
                                    <div className="text-500 text-sm mt-1">{item.label}</div>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                <DataTable
                    value={parametres}
                    loading={loading}
                    stripedRows
                    showGridlines
                    paginator
                    rows={10}
                    emptyMessage="Aucun paramètre trouvé"
                    header={<span className="font-bold text-lg">Liste des Paramètres</span>}
                >
                    <Column field="codeParam" header="Code" sortable style={{ minWidth: '180px' }} />
                    <Column field="libelleParam" header="Libellé" sortable style={{ minWidth: '220px' }} />
                    <Column field="valeurParam" header="Valeur Actuelle" sortable style={{ minWidth: '140px' }} bodyClassName="font-bold text-primary" />
                    <Column header="Unité" body={uniteTemplate} style={{ minWidth: '100px' }} />
                    <Column header="Type" body={typeTemplate} style={{ minWidth: '100px' }} />
                    <Column field="descriptionParam" header="Description" style={{ minWidth: '300px' }} />
                    <Column header="Action" body={actionTemplate} style={{ minWidth: '80px' }} />
                </DataTable>
            </div>

            <Dialog
                header={`Modifier : ${selectedParam?.libelleParam}`}
                visible={editDialogVisible}
                style={{ width: '450px' }}
                onHide={() => setEditDialogVisible(false)}
                footer={editFooter}
            >
                {selectedParam && (
                    <div className="p-fluid">
                        <div className="field">
                            <label className="font-bold">Code Paramètre</label>
                            <InputText value={selectedParam.codeParam} disabled className="mt-1" />
                        </div>
                        <div className="field">
                            <label className="font-bold">Description</label>
                            <p className="text-500 text-sm mt-1">{selectedParam.descriptionParam}</p>
                        </div>
                        <Divider />
                        <div className="field">
                            <label className="font-bold">
                                Nouvelle Valeur <Tag value={selectedParam.unite} severity="info" className="ml-2" />
                            </label>
                            <InputText
                                value={editValeur}
                                onChange={e => setEditValeur(e.target.value)}
                                placeholder={selectedParam.typeValeur === 'TIME' ? 'HH:MM' : 'Entrez la valeur'}
                                className="mt-1"
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </ProtectedPage>
    );
};

export default ParametresPage;
