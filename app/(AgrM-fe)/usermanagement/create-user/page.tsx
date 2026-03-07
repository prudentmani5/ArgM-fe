'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { ProtectedPage } from '@/components/ProtectedPage';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { AppUserRoleResponse } from '../types';

function CreateUserPage() {
    const baseUrl = API_BASE_URL;

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        roleId: null as number | null,
        compteComptable: '' as string,
        branchId: null as number | null
    });

    const [roles, setRoles] = useState<AppUserRoleResponse[]>([]);
    const [caisses, setCaisses] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const caissesApi = useConsumApi('');
    const branchesApi = useConsumApi('');
    const toast = useRef<Toast>(null);

    // Check if selected role is a caissier role
    const selectedRole = roles.find(r => r.id === formData.roleId);
    const isCaissierRole = selectedRole?.name?.toLowerCase().includes('caiss') || false;

    const showMessage = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 5000 });
    };

    useEffect(() => {
        fetchData(null, 'GET', `${baseUrl}/api/roles`, 'loadRoles');
        caissesApi.fetchData(null, 'GET', `${baseUrl}/api/comptability/caisses/findall`, 'loadCaisses');
        branchesApi.fetchData(null, 'GET', `${baseUrl}/api/reference-data/branches/findall`, 'loadBranches');
    }, []);

    // Handle caisses data
    useEffect(() => {
        if (caissesApi.data) {
            const data = Array.isArray(caissesApi.data) ? caissesApi.data : [];
            setCaisses(data);
        }
    }, [caissesApi.data]);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            const data = Array.isArray(branchesApi.data) ? branchesApi.data : [];
            setBranches(data.filter((b: any) => b.isActive));
        }
    }, [branchesApi.data]);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadRoles':
                    const rolesData = Array.isArray(data) ? data : [];
                    setRoles(rolesData.filter((r: AppUserRoleResponse) => r.active));
                    break;
                case 'createUser':
                    showMessage('success', 'Succès', 'Utilisateur créé avec succès!');
                    resetForm();
                    break;
            }
        }
        if (error) {
            showMessage('error', 'Erreur', error.message || 'Une erreur s\'est produite');
        }
    }, [data, error, callType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'lastname' ? value.toUpperCase() : value
        }));
    };

    const resetForm = () => {
        setFormData({
            firstname: '',
            lastname: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            roleId: null,
            compteComptable: '',
            branchId: null
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstname || !formData.lastname || !formData.email || !formData.password) {
            showMessage('error', 'Validation', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showMessage('error', 'Validation', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            showMessage('error', 'Validation', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (!formData.roleId) {
            showMessage('error', 'Validation', 'Veuillez sélectionner un rôle');
            return;
        }

        const dataToSend = {
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            password: formData.password,
            roleId: formData.roleId,
            compteComptable: formData.compteComptable || null,
            branchId: formData.branchId || null,
            enabled: true,
            approved: true,
            userAction: getUserAction()
        };

        fetchData(dataToSend, 'POST', `${baseUrl}/api/users`, 'createUser');
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Card>
                    <div className="flex align-items-center gap-3 mb-4">
                        <div className="bg-primary border-circle flex align-items-center justify-content-center" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-user-plus text-white text-2xl"></i>
                        </div>
                        <div>
                            <h4 className="m-0">Créer un Nouvel Utilisateur</h4>
                            <p className="m-0 text-600">Remplissez le formulaire pour créer un nouveau compte utilisateur</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label htmlFor="firstname" className="font-semibold">
                                    Prénom <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="firstname"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleInputChange}
                                    placeholder="Entrez le prénom"
                                    className="w-full"
                                    required
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="lastname" className="font-semibold">
                                    Nom <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="lastname"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleInputChange}
                                    placeholder="Entrez le nom"
                                    className="w-full"
                                    required
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="email" className="font-semibold">
                                    Nom d'utilisateur <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Entrez le nom d'utilisateur"
                                    className="w-full"
                                    required
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="phoneNumber" className="font-semibold">
                                    Numéro de téléphone
                                </label>
                                <InputText
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="+257 XX XX XX XX"
                                    className="w-full"
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="branchId" className="font-semibold">
                                    Agence
                                </label>
                                <Dropdown
                                    id="branchId"
                                    value={formData.branchId}
                                    options={branches}
                                    onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.value }))}
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Selectionner une agence"
                                    className="w-full"
                                    filter
                                    showClear
                                    itemTemplate={(option: any) => (
                                        <span>{option.code} - {option.name}</span>
                                    )}
                                />
                                <small className="text-500">
                                    Laisser vide pour les administrateurs (acces a toutes les agences)
                                </small>
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="roleId" className="font-semibold">
                                    Rôle <span className="text-red-500">*</span>
                                </label>
                                <Dropdown
                                    id="roleId"
                                    value={formData.roleId}
                                    options={roles}
                                    onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.value }))}
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Sélectionner un rôle"
                                    className="w-full"
                                    filter
                                />
                            </div>

                            {/* Conditional: Compte Comptable for caissier roles */}
                            {isCaissierRole ? (
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="compteComptable" className="font-semibold">
                                        Compte Comptable (Caisse) <span className="text-red-500">*</span>
                                    </label>
                                    <Dropdown
                                        id="compteComptable"
                                        value={formData.compteComptable}
                                        options={caisses.filter((c: any) => c.actif)}
                                        onChange={(e) => setFormData(prev => ({ ...prev, compteComptable: e.value }))}
                                        optionLabel="codeCaisse"
                                        optionValue="compteComptable"
                                        placeholder="Sélectionner le compte comptable"
                                        className="w-full"
                                        filter
                                        showClear
                                        itemTemplate={(option: any) => (
                                            <span>{option.compteComptable} - {option.codeCaisse} ({option.libelle})</span>
                                        )}
                                    />
                                    <small className="text-500">
                                        Ce compte sera associé à l'utilisateur pour les opérations de caisse
                                    </small>
                                </div>
                            ) : (
                                <div className="field col-12 md:col-6"></div>
                            )}

                            <div className="field col-12 md:col-6">
                                <label htmlFor="password" className="font-semibold">
                                    Mot de passe <span className="text-red-500">*</span>
                                </label>
                                <Password
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Min. 6 caractères"
                                    toggleMask
                                    feedback={false}
                                    className="w-full"
                                    inputClassName="w-full"
                                    required
                                />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="confirmPassword" className="font-semibold">
                                    Confirmer le mot de passe <span className="text-red-500">*</span>
                                </label>
                                <Password
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirmez le mot de passe"
                                    toggleMask
                                    feedback={false}
                                    className="w-full"
                                    inputClassName="w-full"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-content-end mt-4">
                            <Button
                                type="button"
                                label="Réinitialiser"
                                icon="pi pi-refresh"
                                severity="secondary"
                                onClick={resetForm}
                            />
                            <Button
                                type="submit"
                                label="Créer l'utilisateur"
                                icon="pi pi-user-plus"
                                loading={loading && callType === 'createUser'}
                            />
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['USER_CREATE']}>
            <CreateUserPage />
        </ProtectedPage>
    );
}
