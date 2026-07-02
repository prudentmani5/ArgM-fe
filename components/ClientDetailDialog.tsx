'use client';
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { Image } from 'primereact/image';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL, buildApiUrl } from '@/utils/apiConfig';
import { ClientType } from '@/app/(AgrM-fe)/moduleCostumerGroup/clients/Client';

const CLIENTS_URL = `${API_BASE_URL}/api/clients`;

interface ClientDetailDialogProps {
    clientId?: number | null;
    visible: boolean;
    onHide: () => void;
}

/**
 * Reusable client-details dialog. Fetches the full client (and signature members for
 * BUSINESS clients) by id and renders the same layout used in the withdrawal-requests page.
 */
const ClientDetailDialog: React.FC<ClientDetailDialogProps> = ({ clientId, visible, onHide }) => {
    const [clientDetail, setClientDetail] = useState<any>(null);
    const [clientSignatories, setClientSignatories] = useState<any[]>([]);
    const [selectedSignatory, setSelectedSignatory] = useState<any>(null);
    const [signatoryDetailDialog, setSignatoryDetailDialog] = useState(false);

    const clientDetailApi = useConsumApi('');
    const clientSignatoriesApi = useConsumApi('');

    // Fetch the client whenever the dialog opens for a given id
    useEffect(() => {
        if (visible && clientId) {
            setClientDetail(null);
            setClientSignatories([]);
            clientDetailApi.fetchData(null, 'GET', `${CLIENTS_URL}/findbyid/${clientId}`, 'viewClientById');
        }
    }, [visible, clientId]);

    // Handle client detail API response
    useEffect(() => {
        if (clientDetailApi.data && clientDetailApi.callType === 'viewClientById') {
            const client = clientDetailApi.data;
            setClientDetail(client);
            if (client.clientType === 'BUSINESS' && client.id) {
                setClientSignatories([]);
                clientSignatoriesApi.fetchData(null, 'GET', `${CLIENTS_URL}/${client.id}/signatory-members/findall`, 'loadSignatories');
            }
        }
    }, [clientDetailApi.data, clientDetailApi.callType]);

    // Handle client signatories API response
    useEffect(() => {
        if (clientSignatoriesApi.data && clientSignatoriesApi.callType === 'loadSignatories') {
            setClientSignatories(Array.isArray(clientSignatoriesApi.data) ? clientSignatoriesApi.data : []);
        }
    }, [clientSignatoriesApi.data, clientSignatoriesApi.callType]);

    return (
        <>
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user text-2xl text-primary"></i>
                        <span>Details du Client</span>
                    </div>
                }
                visible={visible}
                style={{ width: '90vw', maxWidth: '1200px' }}
                modal
                onHide={onHide}
            >
                {clientDetailApi.loading && !clientDetail && (
                    <div className="flex align-items-center justify-content-center p-5">
                        <i className="pi pi-spin pi-spinner text-3xl text-primary" />
                    </div>
                )}
                {clientDetail && (
                    <>
                    <div className="grid">
                        {/* Left Column */}
                        <div className="col-12 md:col-4">
                            <Card className="mb-3">
                                <div className="flex flex-column align-items-center text-center mb-3">
                                    {clientDetail.photoPath ? (
                                        <Image
                                            src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientDetail.photoPath)}`)}
                                            alt="Photo /Fiche du client"
                                            width="150"
                                            height="150"
                                            preview
                                            imageClassName="border-round-xl shadow-2"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Avatar
                                            icon={clientDetail.clientType === ClientType.BUSINESS ? "pi pi-building" : clientDetail.clientType === ClientType.JOINT_ACCOUNT ? "pi pi-users" : "pi pi-user"}
                                            size="xlarge"
                                            shape="circle"
                                            className={clientDetail.clientType === ClientType.BUSINESS ? "bg-green-100 text-green-600" : clientDetail.clientType === ClientType.JOINT_ACCOUNT ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}
                                            style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                                        />
                                    )}
                                    <h4 className="m-0 mt-3">
                                        {clientDetail.clientType === ClientType.JOINT_ACCOUNT
                                            ? `${clientDetail.firstName || ''} ${clientDetail.lastName || ''} & ${clientDetail.secondFirstName || ''} ${clientDetail.secondLastName || ''}`.trim()
                                            : (clientDetail.clientType === ClientType.INDIVIDUAL)
                                                ? `${clientDetail.firstName} ${clientDetail.lastName}`
                                                : clientDetail.businessName}
                                    </h4>
                                    <p className="text-500 m-0">{clientDetail.clientNumber}</p>
                                    <div className="flex gap-2 mt-2">
                                        {clientDetail.clientType === ClientType.INDIVIDUAL && <Tag value="Individuel" severity="info" icon="pi pi-user" />}
                                        {clientDetail.clientType === ClientType.JOINT_ACCOUNT && <Tag value="Compte Conjoint" severity="warning" icon="pi pi-users" />}
                                        {clientDetail.clientType === ClientType.BUSINESS && <Tag value="Entreprise" severity="success" icon="pi pi-building" />}
                                        <Tag
                                            value={clientDetail.status === 'ACTIVE' ? 'Actif' : clientDetail.status === 'PENDING' ? 'En attente' : clientDetail.status === 'SUSPENDED' ? 'Suspendu' : clientDetail.status}
                                            severity={clientDetail.status === 'ACTIVE' ? 'success' : clientDetail.status === 'PENDING' ? 'info' : clientDetail.status === 'SUSPENDED' ? 'warning' : null}
                                        />
                                    </div>
                                </div>
                                <Divider />
                                <div className="flex flex-column gap-2">
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-phone text-primary"></i>
                                        <span className="font-semibold">{clientDetail.phonePrimary || 'N/A'}</span>
                                    </div>
                                    {clientDetail.phoneSecondary && (
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-phone text-500"></i>
                                            <span>{clientDetail.phoneSecondary}</span>
                                        </div>
                                    )}
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-envelope text-primary"></i>
                                        <span>{clientDetail.email || 'N/A'}</span>
                                    </div>
                                </div>
                                {clientDetail.clientType !== ClientType.BUSINESS && clientDetail.signatureImagePath && (
                                    <>
                                        <Divider />
                                        <div>
                                            <p className="text-500 mb-2">Signature</p>
                                            <Image
                                                src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientDetail.signatureImagePath)}`)}
                                                alt="Signature du client"
                                                width="150"
                                                preview
                                            />
                                        </div>
                                    </>
                                )}
                            </Card>
                        </div>

                        {/* Middle Column */}
                        <div className="col-12 md:col-4">
                            {(clientDetail.clientType === ClientType.INDIVIDUAL || clientDetail.clientType === ClientType.JOINT_ACCOUNT) && (
                                <Card title={clientDetail.clientType === ClientType.JOINT_ACCOUNT ? "Titulaire Principal (1ère Personne)" : "Informations Personnelles"} className="mb-3">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nom complet</span>
                                            <span className="font-semibold">{`${clientDetail.lastName || ''} ${clientDetail.firstName || ''} ${clientDetail.middleName || ''}`.trim() || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Genre</span>
                                            <span className="font-semibold">{clientDetail.gender === 'M' ? 'Masculin' : clientDetail.gender === 'F' ? 'Féminin' : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date de naissance</span>
                                            <span className="font-semibold">{clientDetail.dateOfBirth ? new Date(clientDetail.dateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Lieu de naissance</span>
                                            <span className="font-semibold">{clientDetail.placeOfBirth || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nationalité</span>
                                            <span className="font-semibold">{clientDetail.nationality?.name || 'N/A'}</span>
                                        </div>
                                        {clientDetail.clientType === ClientType.INDIVIDUAL && (
                                            <>
                                                <div className="flex justify-content-between">
                                                    <span className="text-500">Etat civil</span>
                                                    <span className="font-semibold">{clientDetail.maritalStatus?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-content-between">
                                                    <span className="text-500">Niveau d'étude</span>
                                                    <span className="font-semibold">{clientDetail.educationLevel?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-content-between">
                                                    <span className="text-500">Type d'habitation</span>
                                                    <span className="font-semibold">{clientDetail.housingType?.name || 'N/A'}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            )}

                            {/* Co-titulaire */}
                            {clientDetail.clientType === ClientType.JOINT_ACCOUNT && (
                                <Card title="Co-titulaire (2ème Personne)" className="mb-3" style={{ borderLeft: '4px solid #f97316' }}>
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nom complet</span>
                                            <span className="font-semibold">{`${clientDetail.secondLastName || ''} ${clientDetail.secondFirstName || ''}`.trim() || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Genre</span>
                                            <span className="font-semibold">{clientDetail.secondGender === 'M' ? 'Masculin' : clientDetail.secondGender === 'F' ? 'Féminin' : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date de naissance</span>
                                            <span className="font-semibold">{clientDetail.secondDateOfBirth ? new Date(clientDetail.secondDateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Lieu de naissance</span>
                                            <span className="font-semibold">{clientDetail.secondPlaceOfBirth || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nationalité</span>
                                            <span className="font-semibold">{clientDetail.secondNationality?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Téléphone</span>
                                            <span className="font-semibold">{clientDetail.secondPhonePrimary || 'N/A'}</span>
                                        </div>
                                        <Divider />
                                        <h6 className="m-0 text-primary">Document d'identité</h6>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Type</span>
                                            <span className="font-semibold">{clientDetail.secondIdDocumentType?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Numéro</span>
                                            <span className="font-semibold">{clientDetail.secondIdDocumentNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date de délivrance</span>
                                            <span className="font-semibold">{clientDetail.secondIdIssueDate ? new Date(clientDetail.secondIdIssueDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date d'expiration</span>
                                            <span className="font-semibold">{clientDetail.secondIdExpiryDate ? new Date(clientDetail.secondIdExpiryDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Business Info */}
                            {clientDetail.clientType === ClientType.BUSINESS && (
                                <Card title="Informations Entreprise" className="mb-3">
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Nom entreprise</span>
                                            <span className="font-semibold">{clientDetail.businessName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Numéro RCCM</span>
                                            <span className="font-semibold">{clientDetail.businessRegistrationNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Type entreprise</span>
                                            <span className="font-semibold">{clientDetail.businessType || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-content-between">
                                            <span className="text-500">Date de création</span>
                                            <span className="font-semibold">{clientDetail.dateOfIncorporation ? new Date(clientDetail.dateOfIncorporation).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* ID Document */}
                            <Card title="Document d'Identité" className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Type de document</span>
                                        <span className="font-semibold">{clientDetail.idDocumentType?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Numéro</span>
                                        <span className="font-semibold">{clientDetail.idDocumentNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date de délivrance</span>
                                        <span className="font-semibold">{(clientDetail.idDocumentIssueDate || clientDetail.idIssueDate) ? new Date(clientDetail.idDocumentIssueDate || clientDetail.idIssueDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Date d'expiration</span>
                                        <span className="font-semibold">{(clientDetail.idDocumentExpiryDate || clientDetail.idExpiryDate) ? new Date(clientDetail.idDocumentExpiryDate || clientDetail.idExpiryDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Délivré par</span>
                                        <span className="font-semibold">{clientDetail.idDocumentIssuedBy || clientDetail.idIssuePlace || 'N/A'}</span>
                                    </div>
                                    {clientDetail.idDocumentScanPath && (
                                        <div className="mt-2">
                                            <p className="text-500 mb-2">Document scanné</p>
                                            {clientDetail.idDocumentScanPath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientDetail.idDocumentScanPath)}`)}
                                                    alt="Document d'identité"
                                                    width="200"
                                                    preview
                                                    imageClassName="border-round shadow-1"
                                                />
                                            ) : (
                                                <Button
                                                    icon="pi pi-eye"
                                                    label="Voir le document"
                                                    className="p-button-outlined p-button-info p-button-sm"
                                                    onClick={() => window.open(buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(clientDetail.idDocumentScanPath)}`), '_blank')}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="col-12 md:col-4">
                            {/* Address */}
                            <Card title={clientDetail.clientType === ClientType.JOINT_ACCOUNT ? "Adresse (Titulaire Principal)" : "Adresse"} className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Province</span>
                                        <span className="font-semibold">{clientDetail.province?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Commune</span>
                                        <span className="font-semibold">{clientDetail.commune?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Zone</span>
                                        <span className="font-semibold">{clientDetail.zone?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Colline</span>
                                        <span className="font-semibold">{clientDetail.colline?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Adresse détaillée</span>
                                        <span className="font-semibold text-right" style={{ maxWidth: '60%' }}>{clientDetail.streetAddress || 'N/A'}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Professional Info */}
                            <Card title={clientDetail.clientType === ClientType.BUSINESS ? "Secteur d'Activité" : "Informations Professionnelles"} className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Secteur d'activité</span>
                                        <span className="font-semibold">{clientDetail.activitySector?.name || 'N/A'}</span>
                                    </div>
                                    {clientDetail.clientType !== ClientType.BUSINESS && (
                                        <>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Profession</span>
                                                <span className="font-semibold">{clientDetail.profession || clientDetail.occupation || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Employeur</span>
                                                <span className="font-semibold">{clientDetail.employerName || clientDetail.employer || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-content-between">
                                                <span className="text-500">Revenu mensuel</span>
                                                <span className="font-semibold text-green-600">
                                                    {clientDetail.monthlyIncome?.toLocaleString('fr-BI') || '0'} BIF
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>

                            {/* Assignment */}
                            <Card title="Affectation" className="mb-3">
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Agence</span>
                                        <span className="font-semibold">{clientDetail.branch?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span className="text-500">Agent assigné</span>
                                        <span className="font-semibold">{clientDetail.assignedOfficer?.firstName ? `${clientDetail.assignedOfficer.firstName} ${clientDetail.assignedOfficer.lastName}` : 'N/A'}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Notes */}
                            {clientDetail.notes && (
                                <Card title="Notes">
                                    <p className="m-0 text-600">{clientDetail.notes}</p>
                                </Card>
                            )}
                        </div>
                    </div>

                        {/* Signatory Members — for BUSINESS clients */}
                        {clientDetail.clientType === ClientType.BUSINESS && (
                            <div className="mt-3">
                                <Card title={
                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-id-card text-primary" />
                                            <span>Membres de Signature</span>
                                            {clientSignatoriesApi.loading && <i className="pi pi-spin pi-spinner text-500 text-sm" />}
                                            {!clientSignatoriesApi.loading && (
                                                <Tag value={`${clientSignatories.length} membre(s)`} severity="info" />
                                            )}
                                        </div>
                                    </div>
                                }>
                                    <DataTable
                                        value={clientSignatories}
                                        loading={clientSignatoriesApi.loading}
                                        stripedRows
                                        showGridlines
                                        size="small"
                                        emptyMessage="Aucun membre de signature enregistré"
                                        paginator
                                        rows={5}
                                    >
                                        <Column
                                            header="Photo"
                                            style={{ width: '70px', textAlign: 'center' }}
                                            body={(s: any) => s.photoPath ? (
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(s.photoPath)}`)}
                                                    alt="Photo"
                                                    width="45"
                                                    preview
                                                    imageClassName="border-round-xl shadow-1"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            ) : <Avatar icon="pi pi-user" size="normal" shape="circle" className="bg-gray-100" />}
                                        />
                                        <Column
                                            header="Nom Complet"
                                            sortable
                                            body={(s: any) => (
                                                <div>
                                                    <div className="font-semibold">{`${s.firstName || ''} ${s.lastName || ''}`.trim() || '—'}</div>
                                                    <div className="text-xs text-500">{s.functionRole || '—'}</div>
                                                </div>
                                            )}
                                        />
                                        <Column
                                            header="Téléphone"
                                            body={(s: any) => (
                                                <div>
                                                    <div>{s.phonePrimary || '—'}</div>
                                                    {s.phoneSecondary && <div className="text-500 text-xs">{s.phoneSecondary}</div>}
                                                </div>
                                            )}
                                            style={{ width: '130px' }}
                                        />
                                        <Column
                                            header="Email"
                                            body={(s: any) => s.email || '—'}
                                            style={{ width: '180px' }}
                                        />
                                        <Column
                                            header="Pièce d'identité"
                                            body={(s: any) => (
                                                <div>
                                                    <div className="text-xs text-500">{s.idDocumentType?.name || '—'}</div>
                                                    <div className="font-semibold">{s.idDocumentNumber || '—'}</div>
                                                </div>
                                            )}
                                            style={{ width: '150px' }}
                                        />
                                        <Column
                                            header="Statut"
                                            style={{ width: '80px' }}
                                            body={(s: any) => (
                                                <Tag
                                                    value={s.isActive ? 'Actif' : 'Inactif'}
                                                    severity={s.isActive ? 'success' : 'warning'}
                                                />
                                            )}
                                        />
                                        <Column
                                            header="Signature"
                                            style={{ width: '90px', textAlign: 'center' }}
                                            body={(s: any) => s.signatureImagePath ? (
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(s.signatureImagePath)}`)}
                                                    alt="Signature"
                                                    width="75"
                                                    preview
                                                    imageClassName="border-round shadow-1"
                                                    style={{ objectFit: 'contain' }}
                                                />
                                            ) : <span className="text-500 text-xs">—</span>}
                                        />
                                        <Column
                                            header="Détails"
                                            style={{ width: '70px', textAlign: 'center' }}
                                            body={(s: any) => (
                                                <Button
                                                    icon="pi pi-eye"
                                                    className="p-button-rounded p-button-info p-button-sm"
                                                    tooltip="Voir tous les détails"
                                                    tooltipOptions={{ position: 'left' }}
                                                    onClick={() => { setSelectedSignatory(s); setSignatoryDetailDialog(true); }}
                                                />
                                            )}
                                        />
                                    </DataTable>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </Dialog>

            {/* Dialog détails d'un membre signataire */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user text-xl text-primary" />
                        <span>Détails du Signataire — {selectedSignatory ? `${selectedSignatory.firstName || ''} ${selectedSignatory.lastName || ''}`.trim() : ''}</span>
                    </div>
                }
                visible={signatoryDetailDialog}
                style={{ width: '80vw', maxWidth: '900px' }}
                modal
                onHide={() => setSignatoryDetailDialog(false)}
                footer={<Button label="Fermer" icon="pi pi-times" className="p-button-text" onClick={() => setSignatoryDetailDialog(false)} />}
            >
                {selectedSignatory && (
                    <div className="flex flex-column gap-3">
                        {/* Header strip */}
                        <div className="flex align-items-center gap-3 p-3 surface-100 border-round">
                            {selectedSignatory.photoPath ? (
                                <Image
                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedSignatory.photoPath)}`)}
                                    alt="Photo"
                                    width="70"
                                    preview
                                    imageClassName="border-round-xl shadow-2"
                                    style={{ objectFit: 'cover', height: '70px' }}
                                />
                            ) : (
                                <Avatar icon="pi pi-user" size="xlarge" shape="circle" className="bg-green-100 text-green-600" style={{ width: '70px', height: '70px', fontSize: '2rem' }} />
                            )}
                            <div className="flex-grow-1">
                                <div className="font-bold text-xl">{`${selectedSignatory.firstName || ''} ${selectedSignatory.lastName || ''}`.trim() || '—'}</div>
                                <div className="text-primary font-medium mt-1">{selectedSignatory.functionRole || '—'}</div>
                                <div className="flex gap-2 mt-2">
                                    <Tag value={selectedSignatory.isActive ? 'Actif' : 'Inactif'} severity={selectedSignatory.isActive ? 'success' : 'warning'} />
                                </div>
                            </div>
                        </div>

                        <div className="grid">
                            {/* Coordonnées */}
                            <div className="col-12 md:col-4">
                                <div className="surface-50 border-round p-3 h-full">
                                    <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                        <i className="pi pi-phone" />Coordonnées
                                    </div>
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Téléphone</span><span className="font-semibold">{selectedSignatory.phonePrimary || '—'}</span></div>
                                        {selectedSignatory.phoneSecondary && <div className="flex justify-content-between text-sm"><span className="text-500">Tél. 2</span><span className="font-semibold">{selectedSignatory.phoneSecondary}</span></div>}
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Email</span><span className="font-semibold" style={{ wordBreak: 'break-all' }}>{selectedSignatory.email || '—'}</span></div>
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Adresse</span><span className="font-semibold text-right" style={{ maxWidth: '55%' }}>{selectedSignatory.address || '—'}</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Pièce d'identité */}
                            <div className="col-12 md:col-4">
                                <div className="surface-50 border-round p-3 h-full">
                                    <div className="font-bold text-sm mb-3 text-primary flex align-items-center gap-2">
                                        <i className="pi pi-id-card" />Pièce d'Identité
                                    </div>
                                    <div className="flex flex-column gap-2">
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Type</span><span className="font-semibold">{selectedSignatory.idDocumentType?.name || '—'}</span></div>
                                        <div className="flex justify-content-between text-sm"><span className="text-500">Numéro</span><span className="font-semibold">{selectedSignatory.idDocumentNumber || '—'}</span></div>
                                        {selectedSignatory.idIssueDate && <div className="flex justify-content-between text-sm"><span className="text-500">Délivré le</span><span className="font-semibold">{new Date(selectedSignatory.idIssueDate).toLocaleDateString('fr-FR')}</span></div>}
                                        {selectedSignatory.idExpiryDate && <div className="flex justify-content-between text-sm"><span className="text-500">Expire le</span><span className="font-semibold">{new Date(selectedSignatory.idExpiryDate).toLocaleDateString('fr-FR')}</span></div>}
                                    </div>
                                    {selectedSignatory.idDocumentScanPath && (
                                        <div className="mt-3">
                                            <div className="text-xs text-500 mb-1">Scan du document</div>
                                            {selectedSignatory.idDocumentScanPath.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/) ? (
                                                <Image
                                                    src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedSignatory.idDocumentScanPath)}`)}
                                                    alt="Scan ID"
                                                    width="120"
                                                    preview
                                                    imageClassName="border-round shadow-1"
                                                />
                                            ) : (
                                                <a href={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedSignatory.idDocumentScanPath)}`)} target="_blank" rel="noopener noreferrer" className="text-primary text-sm">
                                                    <i className="pi pi-download mr-1" />Télécharger le scan
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact & Signature */}
                            <div className="col-12 md:col-4">
                                <div className="flex flex-column gap-2 h-full">
                                    {/* Signature */}
                                    {selectedSignatory.signatureImagePath && (
                                        <div className="surface-50 border-round p-3">
                                            <div className="font-bold text-sm mb-2 text-primary flex align-items-center gap-2">
                                                <i className="pi pi-pencil" />Signature
                                            </div>
                                            <Image
                                                src={buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(selectedSignatory.signatureImagePath)}`)}
                                                alt="Signature"
                                                width="180"
                                                preview
                                                imageClassName="border-round shadow-1"
                                                style={{ objectFit: 'contain', background: '#fff', padding: '4px' }}
                                            />
                                        </div>
                                    )}
                                    {/* Personne de contact */}
                                    {selectedSignatory.contactPersonName && (
                                        <div className="surface-50 border-round p-3 flex-grow-1">
                                            <div className="font-bold text-sm mb-2 text-primary flex align-items-center gap-2">
                                                <i className="pi pi-users" />Personne de Contact
                                            </div>
                                            <div className="flex flex-column gap-2">
                                                <div className="flex justify-content-between text-sm"><span className="text-500">Nom</span><span className="font-semibold">{selectedSignatory.contactPersonName}</span></div>
                                                {selectedSignatory.contactPersonRelationshipType && <div className="flex justify-content-between text-sm"><span className="text-500">Relation</span><span className="font-semibold">{selectedSignatory.contactPersonRelationshipType?.name || selectedSignatory.contactPersonRelationshipOther || '—'}</span></div>}
                                                {selectedSignatory.contactPersonPhone && <div className="flex justify-content-between text-sm"><span className="text-500">Téléphone</span><span className="font-semibold">{selectedSignatory.contactPersonPhone}</span></div>}
                                                {selectedSignatory.contactPersonAddress && <div className="flex justify-content-between text-sm"><span className="text-500">Adresse</span><span className="font-semibold">{selectedSignatory.contactPersonAddress}</span></div>}
                                            </div>
                                        </div>
                                    )}
                                    {/* Notes */}
                                    {selectedSignatory.notes && (
                                        <div className="p-2 border-round surface-50 text-sm">
                                            <div className="text-500 text-xs mb-1">Notes</div>
                                            <div>{selectedSignatory.notes}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default ClientDetailDialog;
