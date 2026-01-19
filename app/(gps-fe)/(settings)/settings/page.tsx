'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useState } from 'react';
import { AppSettings, BillingSettings } from '../../../../types/kukazeeSettings';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import AppSettingsComponent from './AppSettingsComponent';
import BillingSettingsComponent from './BillingSettingsComponent';
import { API_BASE_URL } from '@/utils/apiConfig';

function GeneralSetting() {

    const [appSettings, setAppSettings] = useState<AppSettings>();
    const [activeIndex, setActiveIndex] = useState(0);
    const [billingSettings, setBillingSettings] = useState<BillingSettings>();
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const {
        data: dataBillingSettings,
        loading: loadingBillingSettings,
        error: errorBillingSettings,
        fetchData: fetchDataBillingSetting,
        callType: callTypeBillingSetting
    } = useConsumApi('');

    useEffect(() => {
        fetchData(null, 'Get', `${API_BASE_URL}/api/v1/erp/settings/appSettings/1`, 'loadAppSettings');
    }, []);

    useEffect(() => {
        if (data) {
            setAppSettings(data);
        }
    }, [data]);

    useEffect(() => {
        if (dataBillingSettings) {
            setBillingSettings(dataBillingSettings);
        }
    }, [dataBillingSettings]);

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {

        if (e.index === 1) {
            fetchDataBillingSetting(null, 'GET', `${API_BASE_URL}/api/v1/erp/settings/billingSettings/1`, 'loadBillingSettings');
        }
        setActiveIndex(e.index);
    };

    return <>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Societe">
                <AppSettingsComponent appSettings={appSettings as AppSettings}></AppSettingsComponent>
            </TabPanel>
            <TabPanel header="Vente">
                <BillingSettingsComponent billingSettings={billingSettings as BillingSettings}></BillingSettingsComponent>
            </TabPanel>
            <TabPanel header="Tiers">

            </TabPanel>

        </TabView>
    </>;
}

export default GeneralSetting;


