'use client';
import Head from 'next/head';
import React, { useState } from 'react';
import type { ChildContainerProps, LayoutContextProps, LayoutConfig, LayoutState, Breadcrumb } from '../../types/types';

export const LayoutContext = React.createContext({} as LayoutContextProps);

export const LayoutProvider = (props: ChildContainerProps) => {
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        ripple: true,
        inputStyle: 'outlined',
        // menuMode: 'static',
          menuMode: 'horizontal',
        colorScheme: 'light',
        componentTheme: 'indigo',
        scale:  20,
        menuTheme: 'light',
        topbarTheme: 'indigo',
        menuProfilePosition: 'end',
        desktopMenuActive: true,
        mobileMenuActive: false,
        mobileTopbarActive: false
    });

     const [nextButtonConfig, setNextButtonConfig] = useState({
        visible: false,
        label: 'Suivant',
        width: '20px' // Largeur par défaut
    });

    const toggleNextButton = (visible: boolean, width?: string) => {
        setNextButtonConfig(prev => ({
            ...prev,
            visible,
            width: width || prev.width
        }));
    };

    const [layoutState, setLayoutState] = useState<LayoutState>({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        profileSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
        rightMenuActive: false,
        topbarMenuActive: false,
        sidebarActive: false,
        anchored: false,
        overlaySubmenuActive: false,
        menuProfileActive: false,
        resetMenu: false
    });

    const onMenuProfileToggle = () => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            menuProfileActive: !prevLayoutState.menuProfileActive
        }));
    };

    const isSidebarActive = () => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive || layoutState.overlaySubmenuActive;

    const onMenuToggle = () => {
        if (isOverlay()) {
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                overlayMenuActive: !prevLayoutState.overlayMenuActive
            }));
        }

        if (isDesktop()) {
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive
            }));
        } else {
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive
            }));
        }
    };

    const isOverlay = () => {
        return layoutConfig.menuMode === 'overlay';
    };

    const isSlim = () => {
        return layoutConfig.menuMode === 'slim';
    };

    const isSlimPlus = () => {
        return layoutConfig.menuMode === 'slim-plus';
    };

    const isHorizontal = () => {
        return layoutConfig.menuMode === 'horizontal';
    };

    const isDesktop = () => {
        return window.innerWidth > 991;
    };
    const onTopbarMenuToggle = () => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            topbarMenuActive: !prevLayoutState.topbarMenuActive
        }));
    };
    const showRightSidebar = () => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            rightMenuActive: true
        }));
    };

    const value = {
        layoutConfig,
        setLayoutConfig,
        layoutState,
        setLayoutState,
        onMenuToggle,
        isSlim,
        isSlimPlus,
        isHorizontal,
        isDesktop,
        isSidebarActive,
        breadcrumbs,
        setBreadcrumbs,
        onMenuProfileToggle,
        onTopbarMenuToggle,
        showRightSidebar,
        nextButtonConfig,
        toggleNextButton
    };

    

    return (
        <LayoutContext.Provider value={value}>
            <>
                <Head>
                    <title>PrimeReact - ULTIMA</title>
                    <meta charSet="UTF-8" />
                    <meta name="description" content="The ultimate collection of design-agnostic, flexible and accessible React UI Components." />
                    <meta name="robots" content="index, follow" />
                    <meta name="viewport" content="initial-scale=1, width=device-width" />
                    <meta property="og:type" content="website"></meta>
                    <meta property="og:title" content="Ultima by PrimeReact for NextJS"></meta>
                    <meta property="og:url" content="https://www.primefaces.org/ultima-react"></meta>
                    <meta property="og:description" content="The ultimate collection of design-agnostic, flexible and accessible React UI Components." />
                    <meta property="og:image" content="https://www.primefaces.org/static/social/ultima-react.png"></meta>
                    <meta property="og:ttl" content="604800"></meta>
                    <link rel="icon" href={`/favicon.ico`} type="image/x-icon"></link>
                </Head>
                {props.children}
            </>
        </LayoutContext.Provider>
    );
};
