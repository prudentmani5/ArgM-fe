'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Grade } from './Grade';
import GradeForm from './GradeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function GradeComponent() {

    const [grade, setGrade] = useState<Grade>(new Grade());
    const [gradeEdit, setGradeEdit] = useState<Grade>(new Grade());
    const [editGradeDialog, setEditGradeDialog] = useState(false);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: categorieData, fetchData: fetchCategories } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    
    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        // Load categories on component mount
        loadCategories();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadGrades') {
                setGrades(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
        
        if (categorieData) {
            setCategories(Array.isArray(categorieData) ? categorieData : [categorieData]);
        }
    }, [data, categorieData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGrade((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGradeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: any) => {
        setGrade((prev) => ({ ...prev, valeurIndice: e.value || 0 }));
    };

    const handleNumberChangeEdit = (e: any) => {
        setGradeEdit((prev) => ({ ...prev, valeurIndice: e.value || 0 }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setGrade((prev) => ({ ...prev, categorieId: e.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setGradeEdit((prev) => ({ ...prev, categorieId: e.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', grade);
        fetchData(grade, 'Post', buildApiUrl('/grades/new'), 'createGrade');
    }

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', gradeEdit);
        fetchData(gradeEdit, 'Put', buildApiUrl(`/grades/update/${gradeEdit.gradeId}`), 'updateGrade');
    }

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateGrade')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateGrade')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des grades.');
        else if (data !== null && error === null) {
            if (callType === 'createGrade') {
                setGrade(new Grade());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if(callType === 'updateGrade') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setGradeEdit(new Grade());
                setEditGradeDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterGrade = () => {
        setGlobalFilter('');
    }

    const loadGradeToEdit = (data: Grade) => {
        if (data) {
            setEditGradeDialog(true);
            console.log(" id Grade " + data.gradeId);
            setGradeEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadGradeToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/grades/findall'), 'loadGrades');
    }

    const loadCategories = () => {
        fetchCategories(null, 'Get', buildApiUrl('/categories/findall'), 'loadCategories');
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const getCategorieLabel = (categorieId: string) => {
        const categorie = categories.find(c => c.categorieId === categorieId);
        return categorie ? categorie.libelle : categorieId;
    };

    const categorieBodyTemplate = (rowData: Grade) => {
        return getCategorieLabel(rowData.categorieId);
    };

    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={clearFilterGrade}
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

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Grade" visible={editGradeDialog} style={{ width: '50vw' }} modal onHide={() => setEditGradeDialog(false)}>
            <GradeForm 
                grade={gradeEdit as Grade} 
                categories={categories}
                handleChange={handleChangeEdit} 
                handleNumberChange={handleNumberChangeEdit}
                handleDropdownChange={handleDropdownChangeEdit}
            />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <GradeForm 
                    grade={grade as Grade} 
                    categories={categories}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleDropdownChange={handleDropdownChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={() => setGrade(new Grade())} />
                        </div>
                        <div className="md:field md:col-3">
                            <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
                        </div>
                    </div>
                </div>
            </TabPanel>
            <TabPanel header="Tous">
                <div className='grid'>
                    <div className='col-12'>
                        <div className='card'>
                            <DataTable value={grades} header={renderSearch} emptyMessage={"Pas de grade à afficher"} globalFilter={globalFilter}>
                                <Column field="gradeId" header="Code" sortable />
                                <Column field="libelle" header="Libellé" sortable />
                                <Column header="Catégorie" body={categorieBodyTemplate} sortable />
                                <Column field="valeurIndice" header="Valeur Indice" sortable />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default GradeComponent;