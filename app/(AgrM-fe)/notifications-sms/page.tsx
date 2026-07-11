'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { ProtectedPage } from '@/components/ProtectedPage';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';

interface SmsNotification {
    id: number;
    clientId?: number;
    phoneNumber?: string;
    accountNumber?: string;
    messageType?: string;
    messageText?: string;
    relatedEntityType?: string;
    relatedEntityId?: number;
    status?: string;
    sentAt?: string;
    failureReason?: string;
    providerReference?: string;
    cost?: number;
    createdAt?: string;
}

interface SmsStats {
    total: number;
    sent: number;
    pending: number;
    failed: number;
    enabled: boolean;
}

const statusSeverity = (status?: string): 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
        case 'SENT': return 'success';
        case 'PENDING': return 'warning';
        case 'FAILED': return 'danger';
        default: return 'info';
    }
};

const formatDate = (v?: string) => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleString('fr-FR');
};

function SmsNotificationsContent() {
    const [notifications, setNotifications] = useState<SmsNotification[]>([]);
    const [stats, setStats] = useState<SmsStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');

    // Diagnostics
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('');
    const [diagResult, setDiagResult] = useState<string>('');

    const { data: listData, error: listError, fetchData: fetchList, callType: listCall } = useConsumApi('');
    const { data: statsData, fetchData: fetchStats, callType: statsCall } = useConsumApi('');
    const { data: diagData, error: diagError, fetchData: fetchDiag, callType: diagCall } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    const loadNotifications = () => {
        setLoading(true);
        fetchList(null, 'GET', buildApiUrl('/api/sms/notifications'), 'loadNotifications');
        fetchStats(null, 'GET', buildApiUrl('/api/sms/notifications/stats'), 'loadStats');
    };

    useEffect(() => {
        loadNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (listData && listCall === 'loadNotifications') {
            setNotifications(Array.isArray(listData) ? listData : []);
            setLoading(false);
        }
        if (listError && listCall === 'loadNotifications') {
            setLoading(false);
            showToast('error', 'Erreur', listError?.message || 'Erreur lors du chargement');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listData, listError, listCall]);

    useEffect(() => {
        if (statsData && statsCall === 'loadStats') {
            setStats(statsData);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statsData, statsCall]);

    useEffect(() => {
        if (diagData && diagCall === 'checkBalance') {
            setDiagResult(`${diagData.success ? '✅' : '⛔'} ${diagData.gatewayResponse}`);
            showToast(diagData.success ? 'success' : 'error', 'Vérification du compte', diagData.gatewayResponse);
        }
        if (diagData && diagCall === 'testSend') {
            setDiagResult(`${diagData.success ? '✅ Envoyé' : '⛔ Échec'} (${diagData.receiver}) : ${diagData.gatewayResponse}`);
            showToast(diagData.success ? 'success' : 'error', 'Envoi de test', diagData.gatewayResponse);
            loadNotifications();
        }
        if (diagError && (diagCall === 'checkBalance' || diagCall === 'testSend')) {
            setDiagResult('⛔ Erreur de communication');
            showToast('error', 'Erreur', diagError?.message || 'Erreur de communication avec la passerelle');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [diagData, diagError, diagCall]);

    const checkBalance = () => {
        setDiagResult('Vérification en cours...');
        fetchDiag(null, 'GET', buildApiUrl('/api/sms/check-balance'), 'checkBalance');
    };

    const testSend = () => {
        const digits = testPhone.replace(/[^0-9]/g, '');
        if (digits.length < 8) {
            showToast('warn', 'Attention', 'Numéro de téléphone invalide (min. 8 chiffres)');
            return;
        }
        setDiagResult('Envoi en cours...');
        const params = new URLSearchParams();
        params.append('phone', testPhone);
        if (testMessage) params.append('message', testMessage);
        fetchDiag({}, 'POST', buildApiUrl(`/api/sms/test-send?${params.toString()}`), 'testSend');
    };

    const statusBody = (row: SmsNotification) => (
        <Tag value={row.status} severity={statusSeverity(row.status)} />
    );

    const costBody = (row: SmsNotification) =>
        row.cost != null ? `${row.cost} BIF` : '';

    const header = (
        <div className="flex flex-wrap justify-content-between align-items-center gap-2">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher (téléphone, compte, message...)"
                    style={{ width: '24rem' }}
                />
            </span>
            <Button label="Actualiser" icon="pi pi-refresh" onClick={loadNotifications} loading={loading} />
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <h3 className="m-0 mb-3"><i className="pi pi-comment mr-2" />Notifications SMS</h3>
            </div>

            {/* Summary cards */}
            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="text-2xl font-bold">{stats?.total ?? '-'}</div>
                    <div className="text-color-secondary">Total</div>
                </Card>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats?.sent ?? '-'}</div>
                    <div className="text-color-secondary">Envoyés</div>
                </Card>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{stats?.pending ?? '-'}</div>
                    <div className="text-color-secondary">En attente</div>
                </Card>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <Card className="text-center">
                    <div className="text-2xl font-bold text-red-500">{stats?.failed ?? '-'}</div>
                    <div className="text-color-secondary">Échoués</div>
                </Card>
            </div>

            {/* Gateway diagnostics */}
            <div className="col-12">
                <Card title="Passerelle Lumitel — Diagnostic">
                    <div className="flex align-items-center gap-2 mb-3">
                        <span className="font-semibold">État:</span>
                        <Tag
                            value={stats?.enabled ? 'ACTIVÉE' : 'DÉSACTIVÉE'}
                            severity={stats?.enabled ? 'success' : 'warning'}
                        />
                        <Button label="Vérifier le compte (solde)" icon="pi pi-wallet" className="p-button-sm" onClick={checkBalance} />
                    </div>
                    <div className="flex flex-wrap align-items-end gap-2">
                        <div className="flex flex-column">
                            <label className="text-sm mb-1">Téléphone de test</label>
                            <InputText value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="65502867" />
                        </div>
                        <div className="flex flex-column flex-1" style={{ minWidth: '16rem' }}>
                            <label className="text-sm mb-1">Message (optionnel)</label>
                            <InputText value={testMessage} onChange={(e) => setTestMessage(e.target.value)} placeholder="AGRINOVA: message de test." />
                        </div>
                        <Button label="Envoyer un test" icon="pi pi-send" className="p-button-sm p-button-help" onClick={testSend} />
                    </div>
                    {diagResult && (
                        <div className="mt-3 p-2 border-round surface-100" style={{ fontFamily: 'monospace' }}>
                            {diagResult}
                        </div>
                    )}
                    <small className="block mt-2 text-color-secondary">
                        La vérification du solde et l&apos;envoi de test n&apos;affectent aucun compte et n&apos;engendrent aucun frais.
                    </small>
                </Card>
            </div>

            {/* Notifications table */}
            <div className="col-12">
                <Card>
                    <DataTable
                        value={notifications}
                        paginator
                        rows={20}
                        rowsPerPageOptions={[20, 50, 100]}
                        loading={loading}
                        globalFilter={globalFilter}
                        globalFilterFields={['phoneNumber', 'accountNumber', 'messageType', 'messageText', 'status', 'failureReason']}
                        header={header}
                        emptyMessage="Aucune notification"
                        sortField="createdAt"
                        sortOrder={-1}
                        size="small"
                        stripedRows
                    >
                        <Column field="createdAt" header="Date" body={(r) => formatDate(r.createdAt)} sortable style={{ minWidth: '11rem' }} />
                        <Column field="phoneNumber" header="Téléphone" sortable />
                        <Column field="accountNumber" header="Compte" sortable />
                        <Column field="messageType" header="Type" sortable />
                        <Column field="messageText" header="Message" style={{ minWidth: '20rem' }} />
                        <Column field="status" header="Statut" body={statusBody} sortable />
                        <Column field="cost" header="Frais" body={costBody} sortable />
                        <Column field="failureReason" header="Raison échec" style={{ minWidth: '16rem' }} />
                        <Column field="sentAt" header="Envoyé le" body={(r) => formatDate(r.sentAt)} sortable style={{ minWidth: '11rem' }} />
                    </DataTable>
                </Card>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['ADMIN']}>
            <SmsNotificationsContent />
        </ProtectedPage>
    );
}
