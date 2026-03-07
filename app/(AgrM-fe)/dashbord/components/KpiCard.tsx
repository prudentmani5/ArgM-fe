'use client';

import React from 'react';
import { Card } from 'primereact/card';

interface KpiCardProps {
    label: string;
    value: string;
    icon: string;
    color?: string;
    trend?: number | null;
    subtitle?: string;
}

export default function KpiCard({ label, value, icon, color = '#3b82f6', trend, subtitle }: KpiCardProps) {
    const trendIcon = trend != null && trend > 0 ? 'pi pi-arrow-up' : trend != null && trend < 0 ? 'pi pi-arrow-down' : '';
    const trendColor = trend != null && trend > 0 ? '#22c55e' : trend != null && trend < 0 ? '#ef4444' : '#6b7280';

    return (
        <Card className="shadow-1 h-full">
            <div className="flex align-items-center justify-content-between">
                <div className="flex-1">
                    <span className="block text-500 font-medium text-sm mb-2">{label}</span>
                    <div className="text-900 font-bold text-2xl">{value}</div>
                    {subtitle && <span className="block text-500 text-xs mt-1">{subtitle}</span>}
                    {trend != null && (
                        <div className="flex align-items-center mt-1" style={{ color: trendColor }}>
                            <i className={`${trendIcon} text-xs mr-1`}></i>
                            <span className="text-xs font-medium">{Math.abs(trend).toFixed(1)}%</span>
                        </div>
                    )}
                </div>
                <div className="flex align-items-center justify-content-center border-round"
                     style={{ width: '3rem', height: '3rem', backgroundColor: color + '20' }}>
                    <i className={`${icon} text-xl`} style={{ color }}></i>
                </div>
            </div>
        </Card>
    );
}
