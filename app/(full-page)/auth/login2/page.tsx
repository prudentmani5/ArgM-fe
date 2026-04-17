'use client';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React, { useEffect, useRef, useState } from 'react';
import type { Page } from '../../../../types/types';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import Cookies from 'js-cookie';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';
import { buildApiUrl } from '../../../../utils/apiConfig';

const Login: Page = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const { data, loading, error, fetchData, callType } = useConsumApi('/api/auth/login');
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

    return (
        <>
            <Toast ref={messageRef} position="top-right" />
            <div className="h-screen flex w-full surface-ground">
                <div className="hidden lg:flex flex-1 align-items-center justify-content-center" style={{ backgroundColor: '#f5f5f0' }}>
                    <img src="/layout/images/logo/logoAgrinova.PNG" alt="Agrinova Microfinance" style={{ maxWidth: '500px', width: '80%', height: 'auto' }} />
                </div>
                <div style={{
                         backgroundImage: 'url(/layout/images/pages/404-bg.jpg)'
                     }} className="flex flex-1 flex-column surface-ground align-items-center justify-content-center">
                    <div className="w-11 sm:w-30rem">
                        <div className="flex flex-column">
                            <div className="flex align-items-center justify-content-center">
                                <img src="/layout/images/logo/Welcome.PNG" alt="PrFin MIS" style={{ maxWidth: '420px', width: '100%', height: 'auto' }} />
                            </div>
                            <div className="mt-4">
                                <h2 className="m-0 text-primary font-semibold text-2xl">Bienvenue!</h2>
                                <span className="block text-white mt-2">Veuillez entrer votre nom d&apos;utilisateur et votre mot de passe</span>
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
                                <span className="text-white mr-2">Vous n&apos;avez pas de compte?</span>
                                <span style={{ color: '#60a5fa', fontWeight: '600' }}>
                                    <i className="pi pi-phone mr-1"></i>
                                    Contactez Administrateur
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Login;
