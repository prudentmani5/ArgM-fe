'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { Excedent } from './Excedent';
import ExcedentForm from './ExcedentForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { buildApiUrl } from '../../../../utils/apiConfig';

export default function ExcedentComponent() {
    const [excedent, setExcedent] = useState<Excedent>(new Excedent());
    const [excedentEdit, setExcedentEdit] = useState<Excedent>(new Excedent());
    const [editExcedentDialog, setEditExcedentDialog] = useState(false);
    const [excedents, setExcedents] = useState<Excedent[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    
    // TVA rate (18% as example - adjust according to your needs)
    const TVA_RATE = 0.18;

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Function to calculate montant and TVA from montantExcedent
    const calculateMontantAndTVA = (montantExcedent: number | null) => {
        if (!montantExcedent || montantExcedent <= 0) {
            return { montant: 0, tva: 0 };
        }
        
        // montantExcedent = montant + tva
        // tva = montant * TVA_RATE
        // So: montantExcedent = montant + (montant * TVA_RATE)
        // montantExcedent = montant * (1 + TVA_RATE)
        // montant = montantExcedent / (1 + TVA_RATE)
        
        const montant = montantExcedent / (1 + TVA_RATE);
        const tva = montantExcedent - montant;
        
        return {
            montant: Math.round(montant * 100) / 100, // Round to 2 decimal places
            tva: Math.round(tva * 100) / 100 // Round to 2 decimal places
        };
    };

    // Handler for montantExcedent changes
    const handleMontantExcedentChange = (value: number | null) => {
        const calculated = calculateMontantAndTVA(value);
        setExcedent(prev => ({ 
            ...prev, 
            montantExcedent: value || 0,
            montant: calculated.montant,
            tva: calculated.tva
        }));
    };

    // Handler for montantExcedent changes in edit mode
    const handleMontantExcedentChangeEdit = (value: number | null) => {
        const calculated = calculateMontantAndTVA(value);
        setExcedentEdit(prev => ({ 
            ...prev, 
            montantExcedent: value || 0,
            montant: calculated.montant,
            tva: calculated.tva
        }));
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadExcedents') {
                setExcedents(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const loadAllData = () => {
        fetchData(null, 'GET', buildApiUrl('/excedents/findall'), 'loadExcedents');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExcedent(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExcedentEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleValueChange = (e: InputNumberValueChangeEvent) => {
        setExcedent(prev => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleValueChangeEdit = (e: InputNumberValueChangeEvent) => {
        setExcedentEdit(prev => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleDropDownSelect = (e: DropdownChangeEvent) => {
        if (!editExcedentDialog) {
            setExcedent(prev => ({ ...prev, [e.target.name]: e.value }));
        } else {
            setExcedentEdit(prev => ({ ...prev, [e.target.name]: e.value }));
        }
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setExcedent(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChangeEdit = (name: string, value: Date | null) => {
        setExcedentEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!excedent.type) {
            accept('error', 'Erreur', 'Le type est obligatoire');
            return;
        }

        if (!excedent.montantExcedent || excedent.montantExcedent <= 0) {
            accept('error', 'Erreur', 'Le montant excédent doit être positif');
            return;
        }

        setBtnLoading(true);
        fetchData(excedent, 'POST', buildApiUrl('/excedents/new'), 'createExcedent');
    };

    const handleSubmitEdit = () => {
        if (!excedentEdit.type) {
            accept('error', 'Erreur', 'Le type est obligatoire');
            return;
        }

        setBtnLoading(true);
        fetchData(excedentEdit, 'PUT', buildApiUrl(`/excedents/update/${excedentEdit.excedentId}`), 'updateExcedent');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateExcedent') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des excédents');
        }
        else if (data !== null && error === null) {
            if (callType === 'createExcedent') {
                setExcedent(new Excedent());
                accept('success', 'Succès', 'Excédent créé avec succès');
            } else if (callType === 'updateExcedent') {
                accept('success', 'Succès', 'Excédent modifié avec succès');
                setExcedentEdit(new Excedent());
                setEditExcedentDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadExcedentToEdit = (data: Excedent) => {
        if (data) {
            setEditExcedentDialog(true);
            setExcedentEdit(data);
        }
    };

    const optionButtons = (data: Excedent): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadExcedentToEdit(data)}
                    rounded
                    severity='warning'
                />
            </div>
        );
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Actualiser" outlined onClick={loadAllData} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Recherche globale"
                    />
                </span>
            </div>
        );
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const formatCurrency = (value: number | null) => {
        if (!value) return '';
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        try {
            const d = new Date(date);
            return isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR');
        } catch {
            return '';
        }
    };

    const filteredExcedents = excedents.filter(ex => {
        return JSON.stringify({
            type: ex.type,
            montant: ex.montant,
            tva: ex.tva,
            date: formatDate(ex.dateExcedent)
        }).toLowerCase().includes(globalFilter.toLowerCase());
    });

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Excédent"
                visible={editExcedentDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditExcedentDialog(false)}
            >
                <ExcedentForm
                    excedent={excedentEdit}
                    handleChange={handleChangeEdit}
                    handleValueChange={handleValueChangeEdit}
                    handleDropDownSelect={handleDropDownSelect}
                    handleDateChange={handleDateChangeEdit}
                    handleMontantExcedentChange={handleMontantExcedentChangeEdit} // Pass the edit handler
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditExcedentDialog(false)}
                        className="p-button-text"
                    />
                    <Button
                        label="Enregistrer"
                        icon="pi pi-check"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <ExcedentForm
                        excedent={excedent}
                        handleChange={handleChange}
                        handleValueChange={handleValueChange}
                        handleDropDownSelect={handleDropDownSelect}
                        handleDateChange={handleDateChange}
                        handleMontantExcedentChange={handleMontantExcedentChange} // Pass the main handler
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={() => setExcedent(new Excedent())}
                            severity="secondary"
                        />
                        <Button
                            label="Enregistrer"
                            icon="pi pi-save"
                            loading={btnLoading}
                            onClick={handleSubmit}
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste">
                    <div className="card">
                        <DataTable
                            value={filteredExcedents}
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun excédent trouvé"
                            globalFilter={globalFilter}
                        >
                            <Column field="type" header="Type" sortable />
                            <Column 
                                field="dateExcedent" 
                                header="Date" 
                                body={(rowData) => formatDate(rowData.dateExcedent)}
                                sortable 
                            />
                            <Column 
                                field="montantExcedent" 
                                header="Montant Excédent" 
                                body={(rowData) => formatCurrency(rowData.montantExcedent)}
                                sortable 
                            />
                            <Column 
                                field="montant" 
                                header="Montant HTVA" 
                                body={(rowData) => formatCurrency(rowData.montant)}
                                sortable 
                            />
                            <Column 
                                field="tva" 
                                header="TVA" 
                                body={(rowData) => formatCurrency(rowData.tva)}
                                sortable 
                            />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}