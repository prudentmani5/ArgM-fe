'use client';

import { useEffect, useRef, useState } from "react";
import { Barge } from "./Barge";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import BargeForm from "./BargeForm";
import { InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Armateur } from "../armateur/Armateur";
import { DropdownChangeEvent } from "primereact/dropdown";
import { CheckboxChangeEvent } from "primereact/checkbox";
import { buildApiUrl } from '../../../../../utils/apiConfig';

const BargeComponent = () => {
    // const baseUrl = "http://10.100.27.47:8080";
    const baseUrl = buildApiUrl('');
    const [barge, setBarge] = useState<Barge>(new Barge());
    const [bargeEdit, setBargeEdit] = useState<Barge>(new Barge());
    const [editBargeDialog, setEditBargeDialog] = useState(false);
    const [barges, setBarges] = useState<Barge[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data : armateurData, loading : armateursLoading, error : armateurError, fetchData : fetchArmateurs, callType : armateurCallType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const transportOptions = [
        { label: "Routier", value: "R" },
        { label: "Maritime", value: "M" },
    ];

    const [armateurs, setArmateurs] = useState<Armateur[]>([]);
    const [selectedArmateur, setSelectedArmateur] = useState<Armateur>();
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllArmateurs();
      }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadBarges') {
                setBarges(Array.isArray(data) ? data : [data]);
            }
        } if(armateurData){
            if (armateurCallType === 'loadArmateurs'){
                console.log('Load load ...');
                setArmateurs(Array.isArray(armateurData) ? armateurData : [armateurData]);
            }
                
        }
        handleAfterApiCall(activeIndex);
    }, [data, armateurData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBarge((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBargeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onInputNumberChangeHandler = (e: InputNumberValueChangeEvent) => {
        setBarge((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    const onInputNumberChangeHandlerEdit = (e: InputNumberValueChangeEvent) => {
        setBargeEdit((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setBarge((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setBargeEdit((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', barge);
        fetchData(barge, 'Post', baseUrl + 'barges/new', 'createBarge');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', bargeEdit);
        fetchData(bargeEdit, 'Put', baseUrl + 'barges/update/' + bargeEdit.bargeId, 'updateBarge');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateBarge')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateBarge')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des barges.');
        else if (data !== null && error === null) {
            if (callType === 'createBarge') {
                setBarge(new Barge());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateBarge') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setBargeEdit(new Barge());
                setEditBargeDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterBarge = () => {
        setGlobalFilter('');
    };

    const loadBargeToEdit = (data: Barge) => {
        if (data) {
            setEditBargeDialog(true);
            setBargeEdit(data);
            armateurs.map((arm: Armateur) => {
                if (arm.id == bargeEdit.armateur) {
                    setSelectedArmateur(arm);

                }
            })
          
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadBargeToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + 'barges/findall', 'loadBarges');
    };

    const   loadAllArmateurs = () => {
        fetchArmateurs(null, 'Get', baseUrl + 'armateurs/findall', 'loadArmateurs');
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setBarge(new Barge());
        }
        setActiveIndex(e.index);
    };

    function onDropdownSelect(e: DropdownChangeEvent) {
        if (e.target.name == 'transport') {
            if (!editBargeDialog)
                setBarge((prev) => ({ ...prev, [e.target.name]: e.target.value }));
            else
                setBargeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            console.log('Choosen : ' + e.target.value + ' Size : ' + armateurData.length );
            armateurData.map((arm: Armateur) => {
                console.log(arm.id);
                if (arm.id === e.target.value) {
                    console.log("found a match.. ");
                    setSelectedArmateur(arm);
                    if (!editBargeDialog)
                        setBarge((prev) => ({ ...prev, [e.target.name]: arm.id }));
                    else {
                        setBargeEdit((prev) => ({ ...prev, [e.target.name]: arm.id }));
                        console.log(arm.id);
                        console.log()
                    }
                    return;
                }
            });
        }
    }

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterBarge} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Recherche"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Barge"
                visible={editBargeDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditBargeDialog(false)}
            >
                <BargeForm
                    barge={bargeEdit as Barge}
                    selectedArmateur={selectedArmateur as Armateur}
                    armateurs={armateurs as Armateur[]}
                    handleChange={handleChangeEdit}
                    transportOptions={transportOptions}
                    handleValueChange={onInputNumberChangeHandlerEdit}
                    handleDropDownSelect={onDropdownSelect}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                />
                <div className="flex justify-content-end mt-3">
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
                    <BargeForm
                        barge={barge as Barge}
                        selectedArmateur={selectedArmateur as Armateur}
                        armateurs={armateurs as Armateur[]}
                        handleChange={handleChange}
                        transportOptions={transportOptions}
                        handleValueChange={onInputNumberChangeHandler}
                        handleDropDownSelect={onDropdownSelect}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => setBarge(new Barge())}
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
                <TabPanel header="Consultation">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={barges}
                                    header={renderSearch}
                                    emptyMessage={"Pas de barges à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                    globalFilter={globalFilter}
                                    filterDisplay="row"
                                >
                                    <Column field="nom" header="Nom" sortable />
                                    <Column field="armateurNom" header="Armateur" sortable />
                                    <Column field="plaque" header="Plaque" sortable />
                                    <Column field="longeur" header="Longueur" sortable />
                                    <Column field="largeur" header="Largeur" sortable />
                                    <Column field="transport" header="Transport"
                                        body={(rowData) =>
                                            transportOptions.find(opt => opt.value === rowData.transport)?.label
                                        }
                                        sortable
                                    />
                                    <Column field="accostageEnDollars" header="Accostage en $"
                                        body={(rowData) =>
                                            rowData.accostageEnDollars ? 'Oui' : 'Non'
                                        }
                                        sortable
                                    />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default BargeComponent;