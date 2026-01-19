'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { OtherExitInvoice } from './OtherExitInvoice';
import OtherExitInvoiceForm from './OtherExitInvoiceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { EnterRSP } from './EnterRSP';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { API_BASE_URL } from '@/utils/apiConfig';

export default function OtherExitInvoiceComponent() {
    const baseUrl = `${API_BASE_URL}`;
    const [otherExitInvoice, setOtherExitInvoice] = useState<OtherExitInvoice>(new OtherExitInvoice());
    const [otherExitInvoiceEdit1, setOtherExitInvoiceEdit1] = useState<OtherExitInvoice>(new OtherExitInvoice());
    const [otherExitInvoiceEdit, setOtherExitInvoiceEdit] = useState<OtherExitInvoice>(new OtherExitInvoice());
    const [editOtherExitInvoiceDialog, setEditOtherExitInvoiceDialog] = useState(false);
    const [otherExitInvoices, setOtherExitInvoices] = useState<OtherExitInvoice[]>([]);
    const [otherExitInvoices1, setOtherExitInvoices1] = useState<OtherExitInvoice[]>([]);

    const [items, setItems] = useState<OtherExitInvoice[]>([]);
    const [enterRSPs, setEnterRSPs] = useState<EnterRSP[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadOtherExitInvoices') {
                const invoices = Array.isArray(data) ? data : [data];
                console.log('📊 Loaded OtherExitInvoices:', invoices);
                console.log('📊 Sample valideFacture values:', invoices.slice(0, 5).map((inv: any) => ({
                    sortieId: inv.sortieId,
                    valideFacture: inv.valideFacture,
                    typeOfValideFacture: typeof inv.valideFacture
                })));
                setOtherExitInvoices(invoices);
            } else if (callType === 'loadEnterRSPs') {
                setEnterRSPs(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    useEffect(() => {
        if (data) {

            if (callType === 'loadRSPDataInvoice') {
                setOtherExitInvoices1(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);


    useEffect(() => {
        if (data) {
            if (callType === 'loadOtherExitInvoices') {
                setOtherExitInvoices(Array.isArray(data) ? data : [data]);
            } else if (callType === 'loadEnterRSPs') {
                setEnterRSPs(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const encodedRSP = encodeURIComponent(otherExitInvoice.rsp);

    const loadAllData = () => {
        fetchData(null, 'GET', baseUrl + '/otherexitinvoices/findall', 'loadOtherExitInvoices');
        fetchData(null, 'GET', baseUrl + '/enterRSP/findall', 'loadEnterRSPs');
        //fetchData(null, 'GET', `${baseUrl}/otherexitinvoices/findbyRSPInvoice?noRSP=${encodedRSP}`, 'loadRSPDataInvoice');

    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtherExitInvoice(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtherExitInvoiceEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setOtherExitInvoice(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChangeEdit = (name: string, value: Date | null) => {
        setOtherExitInvoiceEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setOtherExitInvoice(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setOtherExitInvoice((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };
    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setOtherExitInvoiceEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleRSPSelect = (rsp: string) => {
        const selectedRSP = enterRSPs.find(r => r.rspInt?.toString() === rsp);
        if (selectedRSP) {
            setOtherExitInvoice(prev => ({
                ...prev,
                rsp,
                noEntree: selectedRSP.noEntree,
                dateEntree: selectedRSP.dateEntree,
                entreposId: selectedRSP.entreposId,
                marchandiseId: selectedRSP.marchandiseId,
                nbreColis: selectedRSP.nbreColis,
                tonage: selectedRSP.poids,
                lettreTransport: selectedRSP.noLettreTransport,
                taxeMag: selectedRSP.taxe
            }));
        } else {
            setOtherExitInvoice(prev => ({
                ...prev,
                rsp,
                noEntree: null,
                dateEntree: null,
                entreposId: null,
                marchandiseId: null,
                nbreColis: null,
                tonage: null
            }));
        }
    };


    const fetchSearchResults = async (rsp: string): Promise<OtherExitInvoice[]> => {
        try {
            const encodedRSP = encodeURIComponent(rsp);
            const response = await fetch(
                `${baseUrl}/otherexitinvoices/findbyRSPInvoice?noRSP=${encodedRSP}`
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };

    const handleSearchByRSP = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!otherExitInvoice.rsp) {
            accept('error', 'Erreur', 'Veuillez entrer un RSP');
            return;
        }

        setBtnLoading(true);
        try {
            const results = await fetchSearchResults(otherExitInvoice.rsp);
            setOtherExitInvoices1(results);

            // Si vous avez besoin des données supplémentaires via useConsumApi
            fetchData(
                null,
                'GET',
                `${baseUrl}/otherexitinvoices/findbyRSP?noRSP=${encodeURIComponent(otherExitInvoice.rsp)}`,
                'loadRSPData'
            );
            if (data && callType === 'loadRSPData') {
                setOtherExitInvoice(prev => ({
                    ...prev,
                    noEntree: data.noEntree,
                    dateEntree: data.dateEntree ? new Date(data.dateEntree) : null,
                    entreposId: data.entreposId,
                    marchandiseId: data.marchandiseId,
                    nbreColis: data.nbreColis,
                    tonage: data.poids,
                    lettreTransport: data.noLettreTransport,
                    montant: data.montant,
                    taxeMag: data.taxe,
                    tauxChange: data.taxe,
                    //valideFacture: data.valideFacture,
 

                }))
            };

            accept('success', 'Succès', `${results.length} factures trouvées`);
        } catch (error) {
            accept('error', 'Erreur', 'Aucune donnée trouvée pour ce RSP');
            setOtherExitInvoices1([]);
        } finally {
            setBtnLoading(false);
        }
    };


    useEffect(() => {
        if (!otherExitInvoice.dateSortie) {
            handleDateChange('dateSortie', new Date());
        }
    }, []);

    const handleSubmit = async () => {
        if (!otherExitInvoice.rsp) {
            accept('error', 'Erreur', 'Le RSP est obligatoire');
            return;
        }

        // Ajoutez d'autres validations si nécessaire...

        //setBtnLoading(true);
        //fetchData(otherExitInvoice, 'POST', baseUrl + '/otherexitinvoices/new', 'createOtherExitInvoice');
        setBtnLoading(true);
        try {
            fetchData(otherExitInvoice, 'POST', baseUrl + '/otherexitinvoices/new', 'createOtherExitInvoice');
            // Vérifiez si l'appel a réussi
            if (error) {
                //throw new Error(error);
            }

            // Si succès
          
            accept('success', 'Succès', 'Facture de sortie créée avec succès GOOOOO');
             // Rafraîchir les données après suppression
            if (otherExitInvoice.rsp) {
                const encodedRSP = encodeURIComponent(otherExitInvoice.rsp);
                await fetchData(
                    null,
                    'GET',
                    `${baseUrl}/otherexitinvoices/findbyRSPInvoice?noRSP=${encodedRSP}`,
                    'loadRSPDataInvoice'
                );
            }
          setOtherExitInvoice(new OtherExitInvoice());
        } catch (err) {
            accept('error', 'Erreur', `Échec de la création: || 'Erreur serveur'}`);
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = () => {
        if (!otherExitInvoiceEdit.rsp) {
            accept('error', 'Erreur', 'Le RSP est obligatoire');
            return;
        }

        setBtnLoading(true);
        fetchData(otherExitInvoiceEdit, 'PUT', baseUrl + '/otherexitinvoices/update/' + otherExitInvoiceEdit.sortieId, 'updateOtherExitInvoice');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateOtherExitInvoice') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des factures de sortie');
        }
        else if (data !== null && error === null) {
            if (callType === 'createOtherExitInvoice') {
                setOtherExitInvoice(new OtherExitInvoice());
                accept('success', 'Succès', 'Facture de sortie créée avec succès');
            } else if (callType === 'updateOtherExitInvoice') {
                accept('success', 'Succès', 'Facture de sortie modifiée avec succès');
                setOtherExitInvoiceEdit(new OtherExitInvoice());
                setEditOtherExitInvoiceDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadOtherExitInvoiceToEdit = (data: OtherExitInvoice) => {
        if (data) {
            setEditOtherExitInvoiceDialog(true);
            setOtherExitInvoiceEdit(data);
        }
    };

    const optionButtons = (data: OtherExitInvoice): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadOtherExitInvoiceToEdit(data)}
                    rounded
                    severity='warning'
                />
            </div>
        );
    };

    const handleDelete = async (sortieId: string) => {
        try {
            setBtnLoading(true);
            await fetch(`${baseUrl}/otherexitinvoices/delete?sortieId=${sortieId}`, {
                method: 'DELETE'
            });

            // Rafraîchir les données après suppression
            if (otherExitInvoice.rsp) {
                const encodedRSP = encodeURIComponent(otherExitInvoice.rsp);
                await fetchData(
                    null,
                    'GET',
                    `${baseUrl}/otherexitinvoices/findbyRSPInvoice?noRSP=${encodedRSP}`,
                    'loadRSPDataInvoice'
                );
            }

            accept('success', 'Succès', 'Facture supprimée avec succès');
        } catch (error) {
            accept('error', 'Erreur', 'Échec de la suppression');
        } finally {
            setBtnLoading(false);
        }
    };

    const confirmDelete = (sortieId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            handleDelete(sortieId);
        }
    };

    const optionButtons1 = (data: OtherExitInvoice): React.ReactNode => {
        const handleDeleteClick = () => {
            if (data.sortieId) {
                confirmDelete(data.sortieId);
            } else {
                // Gérer le cas où sortieId est null
                console.error("Impossible de supprimer : sortieId est null");
                // Vous pouvez aussi afficher un toast/message d'erreur
                accept('error', 'Erreur', 'Impossible de supprimer : ID manquant');
            }
        };

        // Ne pas afficher le bouton supprimer si la facture est validée
        if (data.valideFacture) {
            return null;
        }

        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-trash"
                    onClick={handleDeleteClick}
                    rounded
                    severity='danger'
                    className="p-button-danger"
                    disabled={!data.sortieId}
                />
            </div>
        );
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Actualiser les factures  du RSP" outlined onClick={loadAllData} />

            </div>
        );
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

  

    // Status column body template
    const statusBodyTemplate = (rowData: OtherExitInvoice) => {
        return (
            <Tag
                value={rowData.valideFacture ? "Facture validée" : "Facture non validée"}
                severity={rowData.valideFacture ? "success" : "danger"}
            />
        );
    };


    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Facture de Sortie"
                visible={editOtherExitInvoiceDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditOtherExitInvoiceDialog(false)}
            >
                <OtherExitInvoiceForm
                    otherExitInvoice={otherExitInvoiceEdit}
                    otherExitInvoice1={otherExitInvoiceEdit}
                    enterRSPs={enterRSPs}
                    handleChange={handleChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}

                    handleCheckboxChange={handleCheckboxChange}
                    handleRSPSelect={(rsp) => setOtherExitInvoiceEdit(prev => ({ ...prev, rsp }))} handleSearchByRSP={function (e: React.MouseEvent): Promise<void> {
                        throw new Error('Function not implemented.');
                    }} />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditOtherExitInvoiceDialog(false)}
                        className="p-button-text"
                    />
                    <form onSubmit={handleSubmit}>
                        <Button
                            label="Enregistrer"
                            icon="pi pi-save"
                            loading={btnLoading}
                            //type="submit"
                            severity="secondary"
                        />
                    </form>
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">

                    <div className="flex justify-content-end gap-2 mt-3">

                        <Button
                            label="Enregistrer"
                            icon="pi pi-save"
                            loading={btnLoading}
                            onClick={handleSubmit}
                            type="button" // ✅ Ajoutez ceci pour empêcher un submit implicite
                        />
                    </div>
                    <OtherExitInvoiceForm
                        otherExitInvoice1={otherExitInvoice}
                        otherExitInvoice={otherExitInvoice}

                        enterRSPs={enterRSPs}
                        handleChange={handleChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        handleSearchByRSP={handleSearchByRSP}
                        handleCheckboxChange={handleCheckboxChange}
                        handleRSPSelect={(rsp) => handleRSPSelect(rsp)} // Ajoutez cette ligne si nécessaire
                    />


                    <DataTable
                        value={otherExitInvoices1}
                        //header={renderSearch}

                        paginator
                        rows={10}
                        emptyMessage="Aucune facture de sortie trouvée"
                    >
                        <Column field="rsp" header="RSP" />
                        <Column field="sortieId" header="Facture" />
                        <Column field="nbreColis" header="Quantite" />
                        <Column field="tonage" header="Poids" />

                        <Column
                            field="dateSortie"
                            header="Date Sortie"
                            body={(rowData) => {
                                if (!rowData.dateSortie) return '';

                                try {
                                    const date = new Date(rowData.dateSortie);
                                    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
                                } catch {
                                    return '';
                                }
                            }}

                        />

                        <Column
                            field="datesupplement"
                            header="Date Supplement"
                            body={(rowData) => {
                                if (!rowData.dateSupplement) return '';

                                try {
                                    const date = new Date(rowData.dateSupplement);
                                    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
                                } catch {
                                    return '';
                                }
                            }}

                        />

                        <Column
                            field="dateDerniereSortie"
                            header="Derniere Date sortie"
                            body={(rowData) => {
                                if (!rowData.dateDerniereSortie) return '';

                                try {
                                    const date = new Date(rowData.dateDerniereSortie);
                                    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
                                } catch {
                                    return '';
                                }
                            }}

                        />

                        <Column field="tonage" header="Tonage" />

                        <Column
                            field="montantReduction"
                            header="Montant Réduction"
                            body={(rowData) => {
                                const amount = Number(rowData.montantReduction);
                                return isNaN(amount) ? '' : amount.toLocaleString('fr-MG', {
                                    style: 'currency',
                                    currency: 'BIF'
                                });
                            }}

                        />

                        <Column field="tauxReduction" header="Taux Réduction" />

                        <Column field="tauxReduction" header="Taux Réduction" />
                               <Column 
                            field="valideFacture" 
                            header="Status" 
                            body={statusBodyTemplate}
                        />
                        <Column header="Actions" body={optionButtons1} />
                    </DataTable>


                </TabPanel>
               
               {/*
                <TabPanel header="Liste">
                    <div className="card">
                        <DataTable
                            value={otherExitInvoices}
                            //header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucune facture de sortie trouvée"
                        >
                            <Column field="sortieId" header="Facture" sortable />
                            <Column field="rsp" header="RSP" sortable />
                            <Column field="lettreTransport" header="Lettre Transport" sortable />
                            <Column field="noEntree" header="No Entrée" sortable />
                            <Column
                                field="dateSortie"
                                header="Date Sortie"
                                body={(rowData) => {
                                    if (!rowData.dateSortie) return '';

                                    try {
                                        const date = new Date(rowData.dateSortie);
                                        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
                                    } catch {
                                        return '';
                                    }
                                }}
                                sortable
                            />
                            <Column field="nbreColis" header="Nb Colis" sortable />
                            <Column field="tonage" header="Tonage" sortable />

                            <Column
                                field="montant"
                                header="Montant"
                                body={(rowData) => {
                                    const amount = Number(rowData.montant);
                                    return isNaN(amount) ? '' : amount.toLocaleString('fr-MG', {
                                        style: 'currency',
                                        currency: 'BIF'
                                    });
                                }}
                                sortable
                            />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel> */}
            </TabView>
        </>
    );
}