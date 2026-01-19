'use client';

import { useEffect, useRef, useState } from "react";
import { ActionDisciplinaire } from "./ActionDisciplinaire";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import ActionDisciplinaireForm from "./ActionDisciplinaireForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const ActionDisciplinaireComponent = () => {
    const baseUrl = `${API_BASE_URL}`;

    const [action, setAction] = useState<ActionDisciplinaire>(new ActionDisciplinaire());
    const [actionEdit, setActionEdit] = useState<ActionDisciplinaire>(new ActionDisciplinaire());
    const [editActionDialog, setEditActionDialog] = useState(false);
    const [actions, setActions] = useState<ActionDisciplinaire[]>([]);
    const [filteredActions, setFilteredActions] = useState<ActionDisciplinaire[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [employeeName, setEmployeeName] = useState<string>('');
    const [employeeNameEdit, setEmployeeNameEdit] = useState<string>('');
    const [formKey, setFormKey] = useState<number>(0);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchApiLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const { data: searchActionData, loading: searchActionLoading, error: searchActionError, fetchData: fetchSearchAction, callType: searchActionCallType } = useConsumApi('');

    const toast = useRef<Toast>(null);
    const processedSearchData = useRef<any>(null);
    const processedData = useRef<any>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    const formatDateToString = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadActions') {
                setActions(Array.isArray(data) ? data : [data]);
                setFilteredActions(Array.isArray(data) ? data : [data]);
            }
        }

        if (searchData && searchCallType === 'searchByMatricule' && searchData !== processedSearchData.current) {
            processedSearchData.current = searchData;
            const foundEmployee = searchData as any;
            setEmployeeName(`${foundEmployee.nom} ${foundEmployee.prenom}`);
            accept('info', 'Employe trouve', 'Les donnees de l\'employe ont ete chargees.');
            setSearchLoading(false);
        }

        if (searchError && searchCallType === 'searchByMatricule' && !processedSearchData.current) {
            processedSearchData.current = 'error';
            accept('warn', 'Employe non trouve', 'Aucun employe trouve avec ce matricule.');
            setEmployeeName('');
            setSearchLoading(false);
        }

        if (searchData && searchCallType === 'searchByMatriculeEdit' && searchData !== processedSearchData.current) {
            processedSearchData.current = searchData;
            const foundEmployee = searchData as any;
            setEmployeeNameEdit(`${foundEmployee.nom} ${foundEmployee.prenom}`);
        }

        if (searchActionData && searchActionCallType === 'searchActions') {
            const searchResults = Array.isArray(searchActionData) ? searchActionData : [searchActionData];
            setFilteredActions(searchResults);
            if (searchResults.length === 0) {
                accept('info', 'Recherche', 'Aucune action disciplinaire trouvee pour ce matricule.');
            } else {
                accept('success', 'Recherche', `${searchResults.length} action(s) disciplinaire(s) trouvee(s).`);
            }
        }

        if (searchActionError && searchActionCallType === 'searchActions') {
            accept('warn', 'Erreur de recherche', 'Erreur lors de la recherche des actions disciplinaires.');
            setFilteredActions([]);
        }

        if (data && data !== processedData.current && (callType === 'createAction' || callType === 'updateAction')) {
            processedData.current = data;
            handleAfterApiCall(activeIndex);
        }

        if (error && (callType === 'createAction' || callType === 'updateAction') && processedData.current !== 'error') {
            processedData.current = 'error';
            if (callType === 'createAction') {
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas ete effectue.');
            } else {
                accept('warn', 'A votre attention', 'La mise a jour n\'a pas ete effectuee.');
            }
            setBtnLoading(false);
        }
    }, [data, searchData, searchError, searchActionData, searchActionError, error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editActionDialog) {
            setAction((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setActionEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const handleCalendarChange = (e: any) => {
        const fieldName = e.target.name;
        const date = e.value as Date;
        const dateString = date ? formatDateToString(date) : '';

        if (!editActionDialog) {
            setAction((prev) => ({ ...prev, [fieldName]: dateString }));
        } else {
            setActionEdit((prev) => ({ ...prev, [fieldName]: dateString }));
        }
    };

    const handleMatriculeBlur = (matriculeId: string) => {
        if (matriculeId.trim() === '') return;

        processedSearchData.current = null;
        setSearchLoading(true);
        console.log('Searching for employee with matricule:', matriculeId);
        fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + matriculeId, 'searchByMatricule');
    };

    const handleSearchActions = (matriculeValue: string) => {
        if (matriculeValue.trim() === '') {
            setFilteredActions(actions);
            return;
        }

        console.log('Searching actions by matricule:', matriculeValue);
        fetchSearchAction(null, 'Get',
            `${baseUrl}/api/grh/actions-disciplinaires/matricule/${encodeURIComponent(matriculeValue.trim())}`,
            'searchActions'
        );
    };

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        const timeoutId = setTimeout(() => {
            handleSearchActions(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    const handleSubmit = () => {
        if (!action.matriculeId || !action.dateOuverture) {
            accept('warn', 'Validation', 'Le matricule et la date d\'ouverture sont obligatoires.');
            return;
        }
        setBtnLoading(true);
        processedData.current = null;
        console.log('Data sent to the backend:', action);
        fetchData(action, 'Post', baseUrl + '/api/grh/actions-disciplinaires/new', 'createAction');
    };

    const handleSubmitEdit = () => {
        if (!actionEdit.matriculeId || !actionEdit.dateOuverture) {
            accept('warn', 'Validation', 'Le matricule et la date d\'ouverture sont obligatoires.');
            return;
        }
        setBtnLoading(true);
        processedData.current = null;
        console.log('Data sent to the backend:', actionEdit);
        fetchData(actionEdit, 'Put', baseUrl + '/api/grh/actions-disciplinaires/update/' + actionEdit.actionId, 'updateAction');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateAction')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas ete effectue.');
            else if (callType === 'updateAction')
                accept('warn', 'A votre attention', 'La mise a jour n\'a pas ete effectuee.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des actions disciplinaires.');
        else if (data !== null && error === null) {
            if (callType === 'createAction') {
                setAction(new ActionDisciplinaire());
                setEmployeeName('');
                processedSearchData.current = null;
                setFormKey(prev => prev + 1);
                accept('info', 'OK', 'L\'enregistrement a ete effectue avec succes.');
            } else if (callType === 'updateAction') {
                accept('info', 'OK', 'La modification a ete effectuee avec succes.');
                setActionEdit(new ActionDisciplinaire());
                setEmployeeNameEdit('');
                processedSearchData.current = null;
                setEditActionDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterAction = () => {
        setSearchTerm('');
        setFilteredActions(actions);
    };

    const loadActionToEdit = (data: ActionDisciplinaire) => {
        if (data) {
            setEditActionDialog(true);
            setActionEdit(data);

            if (data.matriculeId) {
                processedSearchData.current = null;
                fetchSearchData(null, 'Get', baseUrl + '/api/grh/employees/matricule/' + data.matriculeId, 'searchByMatriculeEdit');
            }
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadActionToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/api/grh/actions-disciplinaires/findall', 'loadActions');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setAction(new ActionDisciplinaire());
            setEmployeeName('');
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <div className="flex gap-2">
                    <Button type="button" icon="pi pi-refresh" label="Reinitialiser" outlined onClick={clearFilterAction} />
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Recherche par Matricule"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                    />
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Action Disciplinaire"
                visible={editActionDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setEditActionDialog(false)}
            >
                <ActionDisciplinaireForm
                    action={actionEdit}
                    employeeName={employeeNameEdit}
                    handleChange={handleChange}
                    handleCalendarChange={handleCalendarChange}
                    isEditMode={true}
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
                <TabPanel header="Nouvelle Action Disciplinaire">
                    <ActionDisciplinaireForm
                        key={formKey}
                        action={action}
                        employeeName={employeeName}
                        handleChange={handleChange}
                        handleCalendarChange={handleCalendarChange}
                        handleMatriculeBlur={handleMatriculeBlur}
                        searchLoading={searchLoading}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Reinitialiser"
                                    onClick={() => {
                                        setAction(new ActionDisciplinaire());
                                        setEmployeeName('');
                                        processedSearchData.current = null;
                                        setFormKey(prev => prev + 1);
                                    }}
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button
                                    icon="pi pi-check"
                                    label="Enregistrer"
                                    loading={btnLoading || searchLoading}
                                    onClick={handleSubmit}
                                />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Toutes les Actions Disciplinaires">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredActions}
                                    header={renderSearch}
                                    emptyMessage={"Pas d'actions disciplinaires a afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="matriculeId" header="Matricule" sortable />
                                    <Column field="nom" header="Nom" sortable />
                                    <Column field="prenom" header="Prenom" sortable />
                                    <Column field="dateOuverture" header="Date Ouverture" sortable />
                                    <Column field="dateDecision" header="Date Decision" sortable />
                                    <Column field="decisionPrise" header="Decision Prise" sortable />
                                    <Column field="autoriteDecision" header="Autorite" sortable />
                                    <Column field="dateLevee" header="Date Levee" sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
};

export default ActionDisciplinaireComponent;
