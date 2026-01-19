'use client';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React, { useEffect, useRef, useState } from 'react';
import type { Page } from '../../../../types/types';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import Cookies from 'js-cookie';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { buildApiUrl } from '../../../../utils/apiConfig';

const Login: Page = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showRegisterDialog, setShowRegisterDialog] = useState(false);
    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const { data, loading, error, fetchData, callType } = useConsumApi('/api/auth/login');
    const { data: registerResponse, loading: registerLoading, error: registerError, fetchData: registerFetchData, callType: registerCallType } = useConsumApi('/api/auth/register');
    const messageRef = useRef<Toast>(null);

    const showMessage = (severity: 'success' | 'error', summary: string, detail: string) => {
        if (messageRef.current) {
            messageRef.current.show({
                severity,
                summary,
                detail,
                life: 7000
            });
        }
    }


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({
            ...prev,
            [name]: name === 'lastName' ? value.toUpperCase() : value
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.password) {
            showMessage('error', 'Erreur de validation', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (registerData.password !== registerData.confirmPassword) {
            showMessage('error', 'Erreur de validation', 'Les mots de passe ne correspondent pas');
            return;
        }

        if (registerData.password.length < 6) {
            showMessage('error', 'Erreur de validation', 'Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        // Prepare data for backend - matching AppUserCreateRequest DTO
        // Note: roleId is intentionally not set - will be assigned by admin after approval
        const registrationData = {
            firstname: registerData.firstName,
            lastname: registerData.lastName,
            email: registerData.email,
            phoneNumber: registerData.phoneNumber,
            password: registerData.password,
            // roleId: null, // No role assigned - admin will assign after approval
            enabled: true,
            approved: false
        };

        await registerFetchData(
            registrationData,
            'POST',
            buildApiUrl('/api/users'),
            'register',
            true
        );
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form Data:', JSON.stringify(formData));
        // Use fetchData with skipAuth parameter (5th parameter)
        await fetchData(
            formData,           // data to send
            'POST',             // method
            buildApiUrl('/auth/authenticate'),  // url
            'login',            // call type
            true                // skipAuth = true
        );
    };

    // Handle successful login response
    useEffect(() => {
        if (data && data.token) {
            Cookies.set('token', data.token);
            Cookies.set('appUser', JSON.stringify(data.appUser));

            console.log(data.appUser);
            //window.location.href = '/settings/barge';
            window.location.href = '/settings/bienvenue';

        }
        if (error) {

            // Handle error (e.g., show a notification)
            const errorMessage = error.message !== 'Failed to fetch' ? error.message : 'Une erreur s\'est produite lors de la connexion. Veuillez contacter l\'administrateur';

            showMessage('error', 'A votre attention', errorMessage);
        }
    }, [data, error]);

    // Handle registration response
    useEffect(() => {
        if (registerResponse && registerCallType === 'register') {
            showMessage('success', 'Succès', 'Votre compte a été créé avec succès! Il sera activé après validation par un administrateur.');
            setShowRegisterDialog(false);
            // Reset form
            setRegisterData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                password: '',
                confirmPassword: ''
            });
        }
        if (registerError && registerCallType === 'register') {
            const errorMessage = registerError.message !== 'Failed to fetch'
                ? registerError.message
                : 'Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer.';
            showMessage('error', 'Erreur d\'inscription', errorMessage);
        }
    }, [registerResponse, registerError, registerCallType]);

    return (
        <>
            <Toast ref={messageRef} position="top-right" />
            <div className="h-screen flex w-full surface-ground">
                <div style={{
                         backgroundImage: 'url(/layout/images/pages/404-bg.jpg)'
                     }} className="flex flex-1 flex-column surface-ground align-items-center justify-content-center">
                    <div className="w-11 sm:w-30rem">
                        <div className="flex flex-column">
                            <div style={{ height: '56px', width: '56px' }} className="bg-primary-50 border-circle flex align-items-center justify-content-center">
                                <i className="pi pi-sign-in text-primary text-4xl"></i>
                            </div>
                            <div className="mt-4">
                                <h1 className="m-0 text-primary font-semibold text-4xl">Bienvenue!</h1>
                                <span className="block text-700 text-white mt-2">Veuillez entrer votre nom d'utlisateur et votre mot de passe</span>
                            </div>
                        </div>
                        <form onSubmit={handleLogin} className="flex flex-column gap-3 mt-6">
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-user"></i>
                                </span>
                                <InputText type="text" name='email' v-model="email" placeholder="Nom d'utilisateur" onChange={handleInputChange} />
                            </div>
                            <div className="p-inputgroup">
                                <span className="p-inputgroup-addon">
                                    <i className="pi pi-key"></i>
                                </span>
                                <Password value={formData.password} name='password' onChange={handleInputChange} placeholder="Mot de passe" toggleMask feedback={false} />
                            </div>
                            <div>
                                <Button type="submit" loading={loading} className="w-full" label="ENTRER" icon="pi pi-sign-in"></Button>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-white mr-2">Vous n'avez pas de compte?</span>
                                <Button
                                    type="button"
                                    className="p-0"
                                    link
                                    label="Créer un compte"
                                    icon="pi pi-user-plus"
                                    onClick={() => setShowRegisterDialog(true)}
                                    style={{
                                        color: '#60a5fa',
                                        fontWeight: '600',
                                        textDecoration: 'underline'
                                    }}
                                ></Button>
                            </div>
                        </form>
                    </div>
                </div>
                <div
                    // style={{
                    //     backgroundImage: 'url(/layout/images/pages/404-bg.jpg)'
                    // }}
                    className="hidden lg:flex flex-1 align-items-center justify-content-center bg-cover"
                >
                    <img src="/layout/images/logo/gps_icon_.png" alt="" />
                </div>
            </div>

            {/* Registration Dialog */}
            <Dialog
                header="Créer un nouveau compte"
                visible={showRegisterDialog}
                style={{ width: '650px' }}
                onHide={() => setShowRegisterDialog(false)}
                modal
            >
                <form onSubmit={handleRegister} className="flex flex-column gap-3">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="firstName" className="font-semibold">
                            Prénom <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="firstName"
                            name="firstName"
                            value={registerData.firstName}
                            onChange={handleRegisterInputChange}
                            placeholder="Entrez votre prénom"
                            required
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="lastName" className="font-semibold">
                            Nom <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="lastName"
                            name="lastName"
                            value={registerData.lastName}
                            onChange={handleRegisterInputChange}
                            placeholder="Entrez votre nom"
                            required
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="registerEmail" className="font-semibold">
                            Nom d'utilisateur <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="registerEmail"
                            name="email"
                            type="text"
                            value={registerData.email}
                            onChange={handleRegisterInputChange}
                            placeholder="Entrez votre nom d'utilisateur"
                            required
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="phoneNumber" className="font-semibold">
                            Numéro de téléphone
                        </label>
                        <InputText
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={registerData.phoneNumber}
                            onChange={handleRegisterInputChange}
                            placeholder="+257 XX XX XX XX"
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="registerPassword" className="font-semibold">
                            Mot de passe <span className="text-red-500">*</span>
                        </label>
                        <Password
                            id="registerPassword"
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterInputChange}
                            placeholder="Mot de passe (min. 6 caractères)"
                            toggleMask
                            feedback={false}
                            required
                        />
                    </div>

                    <div className="flex flex-column gap-2">
                        <label htmlFor="confirmPassword" className="font-semibold">
                            Confirmer le mot de passe <span className="text-red-500">*</span>
                        </label>
                        <Password
                            id="confirmPassword"
                            name="confirmPassword"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterInputChange}
                            placeholder="Confirmez votre mot de passe"
                            toggleMask
                            feedback={false}
                            required
                        />
                    </div>

                    <div className="flex gap-2 justify-content-end mt-3">
                        <Button
                            type="button"
                            label="Annuler"
                            severity="secondary"
                            outlined
                            onClick={() => setShowRegisterDialog(false)}
                        />
                        <Button
                            type="submit"
                            label="Créer le compte"
                            icon="pi pi-user-plus"
                            loading={registerLoading}
                        />
                    </div>
                </form>
            </Dialog>
        </>
    );
};

export default Login;
