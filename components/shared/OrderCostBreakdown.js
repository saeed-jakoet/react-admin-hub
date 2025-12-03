"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { get } from "@/lib/api/fetcher";

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        minimumFractionDigits: 2,
    }).format(amount || 0);
};

export default function OrderCostBreakdown({ orderId, orderType, accentColor = "blue" }) {
    const [costData, setCostData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const colors = {
        blue: "text-blue-600 dark:text-blue-400",
        purple: "text-purple-600 dark:text-purple-400",
    };

    const accentClass = colors[accentColor] || colors.blue;

    useEffect(() => {
        const fetchCosts = async () => {
            if (!orderId) return;

            setLoading(true);
            setError(null);

            try {
                const endpoint =
                    orderType === "drop_cable"
                        ? `/drop-cable/${orderId}/costs`
                        : `/link-build/${orderId}/costs`;

                const response = await get(endpoint);
                if (response.status === "success") {
                    setCostData(response.data);
                } else {
                    setError(response.message || "Failed to load cost breakdown");
                }
            } catch (err) {
                setError(err.message || "Failed to load cost breakdown");
            } finally {
                setLoading(false);
            }
        };

        fetchCosts();
    }, [orderId, orderType]);

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center py-6">
                    <Loader2 className={`w-5 h-5 animate-spin ${accentClass}`} />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            </Card>
        );
    }

    if (!costData) {
        return (
            <Card className="p-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No cost data available
                </p>
            </Card>
        );
    }

    // Build line items based on order type
    const getLineItems = () => {
        if (orderType === "drop_cable") {
            const items = [];

            // Services
            if (costData.breakdown?.services?.length > 0) {
                costData.breakdown.services.forEach((service) => {
                    items.push({
                        label: service.name,
                        detail: service.multiplier > 1 ? `×${service.multiplier}` : null,
                        amount: service.cost,
                    });
                });
            }

            // Installation
            if (costData.breakdown?.installation) {
                const inst = costData.breakdown.installation;
                items.push({
                    label: "Installation",
                    detail: `${inst.distance}m`,
                    amount: inst.final_cost,
                });
            }

            // Additional
            if (costData.breakdown?.additional?.amount > 0) {
                items.push({
                    label: "Additional Charges",
                    detail: costData.breakdown.additional.reason || null,
                    amount: costData.breakdown.additional.amount,
                });
            }

            return items;
        } else {
            // Link Build
            const items = [];

            if (costData.breakdown?.service_type) {
                const st = costData.breakdown.service_type;
                items.push({
                    label: st.label || "Service",
                    detail: st.fiber_pairs > 0 ? `${st.fiber_pairs} fiber pairs` : null,
                    amount: st.base_cost,
                });
            }

            if (costData.breakdown?.splices?.cost > 0) {
                items.push({
                    label: "Splices After 15km",
                    detail: `${costData.breakdown.splices.splices_after_15km} splices`,
                    amount: costData.breakdown.splices.cost,
                });
            }

            return items;
        }
    };

    const lineItems = getLineItems();

    return (
        <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Cost Breakdown
                </h3>
                {costData.week && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {costData.week}
                    </span>
                )}
            </div>

            {/* Line Items */}
            <div className="space-y-3 mb-4">
                {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {item.label}
                            </span>
                            {item.detail && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                                    {item.detail}
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white ml-4">
                            {formatCurrency(item.amount)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Total
                    </span>
                    <span className={`text-xl font-semibold ${accentClass}`}>
                        {formatCurrency(costData.total)}
                    </span>
                </div>
            </div>

            {/* Rate Card Toggle */}
            {costData.breakdown?.rates && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        {showDetails ? (
                            <ChevronUp className="w-3 h-3" />
                        ) : (
                            <ChevronDown className="w-3 h-3" />
                        )}
                        <span>Rate card</span>
                    </button>

                    {showDetails && (
                        <div className="mt-3 flex flex-col gap-1 text-xs">
                            {orderType === "drop_cable" ? (
                                <>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Survey Planning</span>
                                        <span>{formatCurrency(costData.breakdown.rates.survey_planning_rate)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Callout</span>
                                        <span>{formatCurrency(costData.breakdown.rates.callout_rate)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Installation (flat)</span>
                                        <span>{formatCurrency(costData.breakdown.rates.installation_flat_rate)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Per Meter</span>
                                        <span>{formatCurrency(costData.breakdown.rates.per_meter_rate)}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Full Splice</span>
                                        <span>{formatCurrency(costData.breakdown.rates.full_splice_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Splice + Float</span>
                                        <span>{formatCurrency(costData.breakdown.rates.full_splice_float_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Splice Broadband</span>
                                        <span>{formatCurrency(costData.breakdown.rates.full_splice_broadband_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Access Float</span>
                                        <span>{formatCurrency(costData.breakdown.rates.access_float_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Link Build -15%</span>
                                        <span>{formatCurrency(costData.breakdown.rates.access_float_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Link Build Broadband -15%</span>
                                        <span>{formatCurrency(costData.breakdown.rates.access_float_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Link Build + Float -15%</span>
                                        <span>{formatCurrency(costData.breakdown.rates.access_float_cost)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
