'use client';

import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';

const UserManagementPage = () => {
    const router = useRouter();

    const navigationCards = [
        {
            title: 'Recherche d\'Utilisateurs',
            description: 'Rechercher tous les utilisateurs et gérer leurs mots de passe.',
            icon: 'pi pi-search',
            color: 'bg-green-500',
            route: '/usermanagement/users'
        },
        {
            title: 'Gestion des Rôles',
            description: 'Créer, modifier et gérer les rôles utilisateurs et leurs autorisations.',
            icon: 'pi pi-users',
            color: 'bg-blue-500',
            route: '/usermanagement/appUserRoles'
        },
        {
            title: 'Demandes d\'Accès',
            description: 'Approuver ou rejeter les demandes de création de compte utilisateur.',
            icon: 'pi pi-user-plus',
            color: 'bg-orange-500',
            route: '/usermanagement/pendingApprovals'
        }
    ];

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5 className="mb-2">Gestion des Utilisateurs</h5>
                    <p className="text-600 mb-5">
                        Gérez les utilisateurs, les rôles et les autorisations de votre système ERP.
                    </p>
                </div>
            </div>

            {navigationCards.map((card, index) => (
                <div key={index} className="col-12 md:col-6 lg:col-4">
                    <Card className="border-1 surface-border h-full">
                        <div className="flex flex-column h-full">
                            <div className="flex align-items-center mb-3">
                                <div
                                    className={`${card.color} border-circle flex align-items-center justify-content-center`}
                                    style={{ width: '3rem', height: '3rem' }}
                                >
                                    <i className={`${card.icon} text-white text-2xl`}></i>
                                </div>
                                <h5 className="ml-3 mb-0">{card.title}</h5>
                            </div>
                            <p className="text-600 mb-4 flex-1">{card.description}</p>
                            <div>
                                <Button
                                    label="Ouvrir"
                                    icon="pi pi-arrow-right"
                                    className="w-full"
                                    onClick={() => router.push(card.route)}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
};

export default UserManagementPage;
