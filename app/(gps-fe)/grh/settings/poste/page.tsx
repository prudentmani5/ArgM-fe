'use client';

import { useEffect, useRef, useState } from "react";
import { GrhPoste } from "./GrhPoste";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import GrhPosteForm from "./GrhPosteForm";
import { InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { RHFonction } from "../rhfonction/RHFonction";
import { DropdownChangeEvent } from "primereact/dropdown";
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

const GrhPosteComponent = () => {
    
    const [grhposte, setGrhPoste] = useState<GrhPoste>(new GrhPoste());
    const [grhposteEdit, setGrhPosteEdit] = useState<GrhPoste>(new GrhPoste());
    const [editGrhPosteDialog, setEditGrhPosteDialog] = useState(false);
    const [grhpostes, setGrhPostes] = useState<GrhPoste[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: rhfonctionData, loading: rhfonctionsLoading, error: rhfonctionError, fetchData: fetchRHFonctions, callType: rhfonctionCallType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);

    const [rhfonctions, setRHFonctions] = useState<RHFonction[]>([]);
    const [selectedFonction, setSelectedFonction] = useState<RHFonction>();

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllRHFonctions();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadGrhPostes') {
                const postesWithFonctionNames = Array.isArray(data) ? data.map((poste: GrhPoste) => {
                    const fonction = rhfonctions.find(f => f.fonctionid === poste.fonctionId);
                    return {
                        ...poste,
                        fonctionLibelle: fonction ? fonction.libelle : poste.fonctionId
                    };
                }) : [data];
                setGrhPostes(postesWithFonctionNames);
            }
        }
        
        if (rhfonctionData) {
            if (rhfonctionCallType === 'loadRHFonctions') {
                console.log('Loading RH Fonctions...');
                setRHFonctions(Array.isArray(rhfonctionData) ? rhfonctionData : [rhfonctionData]);
            }
        }
        
        handleAfterApiCall(activeIndex);
    }, [data, rhfonctionData, rhfonctions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGrhPoste((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGrhPosteEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onInputNumberChangeHandler = (e: InputNumberValueChangeEvent) => {
        setGrhPoste((prev) => ({ ...prev, [e.target.name as string]: e.value }));
    };

    const onInputNumberChangeHandlerEdit = (e: InputNumberValueChangeEvent) => {
        setGrhPosteEdit((prev) => ({ ...prev, [e.target.name as string]: e.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', grhposte);
        fetchData(grhposte, 'Post', buildApiUrl('/grhpostes/new'), 'createGrhPoste');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', grhposteEdit);
        fetchData(grhposteEdit, 'Put', buildApiUrl(`/grhpostes/update/${grhposteEdit.posteId}`), 'updateGrhPoste');
    };

    const handleReset = () => {
        setGrhPoste(new GrhPoste());
        setSelectedFonction(undefined);
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateGrhPoste' && callType !== 'deleteGrhPoste')
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateGrhPoste')
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            else if (callType === 'deleteGrhPoste')
                accept('warn', 'Attention', 'La suppression n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'Attention', 'Impossible de charger la liste des postes.');
        else if (data !== null && error === null) {
            if (callType === 'createGrhPoste') {
                setGrhPoste(new GrhPoste());
                setSelectedFonction(undefined);
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateGrhPoste') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setGrhPosteEdit(new GrhPoste());
                setEditGrhPosteDialog(false);
                setSelectedFonction(undefined);
                loadAllData();
            } else if (callType === 'deleteGrhPoste') {
                accept('info', 'OK', 'La suppression a été effectuée avec succès.');
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadGrhPosteToEdit = (data: GrhPoste) => {
        if (data) {
            setEditGrhPosteDialog(true);
            setGrhPosteEdit(data);
            const fonction = rhfonctions.find(f => f.fonctionid === data.fonctionId);
            if (fonction) {
                setSelectedFonction(fonction);
            }
        }
    };

    const confirmDelete = (grhposte: GrhPoste) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le poste "${grhposte.posteId}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteGrhPoste(grhposte.posteId),
            acceptLabel: 'Oui',
            rejectLabel: 'Non'
        });
    };

    const deleteGrhPoste = (posteId: string) => {
        setBtnLoading(true);
        fetchData(null, 'Delete', buildApiUrl(`/grhpostes/delete/${posteId}`), 'deleteGrhPoste');
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadGrhPosteToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                />
                <Button 
                    icon="pi pi-trash" 
                    onClick={() => confirmDelete(data)} 
                    raised 
                    severity='danger' 
                    tooltip="Supprimer"
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/grhpostes/findall'), 'loadGrhPostes');
    };

    const loadAllRHFonctions = () => {
        fetchRHFonctions(null, 'Get', buildApiUrl('/rhfonctions/findall'), 'loadRHFonctions');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setGrhPoste(new GrhPoste());
            setSelectedFonction(undefined);
        }
        setActiveIndex(e.index);
    };

    function onDropdownSelect(e: DropdownChangeEvent) {
        console.log('Selected fonction: ' + e.target.value);
        const selectedFonctionId = e.target.value;
        const fonction = rhfonctions.find(f => f.fonctionid === selectedFonctionId);
        
        if (fonction) {
            setSelectedFonction(fonction);
            if (!editGrhPosteDialog) {
                setGrhPoste((prev) => ({ 
                    ...prev, 
                    fonctionId: selectedFonctionId,
                    fonctionLibelle: fonction.libelle 
                }));
            } else {
                setGrhPosteEdit((prev) => ({ 
                    ...prev, 
                    fonctionId: selectedFonctionId,
                    fonctionLibelle: fonction.libelle 
                }));
            }
        }
    }

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center mb-3">
                <Button
                    icon="pi pi-filter-slash"
                    label="Effacer filtres"
                    outlined
                    onClick={() => setGlobalFilter('')}
                />
                <span className="p-input-icon-left" style={{ width: '40%' }}>
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher"
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    const statusTemplate = (rowData: GrhPoste) => {
        const isFullyOccupied = rowData.nbrePosteVacant === 0;
        const hasVacancies = rowData.nbrePosteVacant > 0;
        
        return (
            <div className="flex align-items-center gap-2">
                <i 
                    className={`pi ${isFullyOccupied ? 'pi-check-circle' : 'pi-exclamation-triangle'}`}
                    style={{ 
                        color: isFullyOccupied ? '#22C55E' : hasVacancies ? '#F59E0B' : '#EF4444',
                        fontSize: '1.2rem'
                    }}
                />
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isFullyOccupied 
                        ? 'bg-green-100 text-green-800' 
                        : hasVacancies 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                }`}>
                    {isFullyOccupied ? 'Complet' : `${rowData.nbrePosteVacant} vacant(s)`}
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Dialog
                header="Modifier Poste"
                visible={editGrhPosteDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditGrhPosteDialog(false)}
            >
                <GrhPosteForm
                    grhposte={grhposteEdit as GrhPoste}
                    selectedFonction={selectedFonction as RHFonction}
                    rhfonctions={rhfonctions as RHFonction[]}
                    handleChange={handleChangeEdit}
                    handleValueChange={onInputNumberChangeHandlerEdit}
                    handleDropDownSelect={onDropdownSelect}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        icon="pi pi-times"
                        label="Annuler"
                        outlined
                        onClick={() => setEditGrhPosteDialog(false)}
                    />
                    <Button
                        icon="pi pi-check"
                        label="Modifier"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <GrhPosteForm
                        grhposte={grhposte as GrhPoste}
                        selectedFonction={selectedFonction as RHFonction}
                        rhfonctions={rhfonctions as RHFonction[]}
                        handleChange={handleChange}
                        handleValueChange={onInputNumberChangeHandler}
                        handleDropDownSelect={onDropdownSelect}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={handleReset}
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button
                                    icon="pi pi-check"
                                    label="Enregistrer"
                                    loading={btnLoading}
                                    onClick={handleSubmit}
                                />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={grhpostes}
                                    header={renderSearch}
                                    emptyMessage={"Pas de postes à afficher"}
                                    globalFilter={globalFilter}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25]}
                                >
                                    <Column field="posteId" header="Code" sortable />
                                    <Column field="fonctionLibelle" header="Fonction" sortable />
                                    <Column field="nbrePoste" header="Nb Postes" sortable />
                                    <Column field="nbrePosteVacant" header="Nb Vacants" sortable />
                                    <Column header="Statut" body={statusTemplate} />
                                    <Column header="Options" body={optionButtons} style={{ width: '12rem' }} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default GrhPosteComponent;