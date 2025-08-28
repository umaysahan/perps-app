import { useEffect, useState } from 'react';
import LineChart from '~/components/LineChart/LineChart';
import { useInfoApi } from '~/hooks/useInfoApi';
import { useUserDataStore } from '~/stores/UserDataStore';
import type { UserPositionIF } from '~/utils/UserDataIFs';
import CollateralPieChart from '../CollateralChart/CollateralPieChart';

export interface TabChartContext {
    activeTab: string;
    selectedVault: { label: string; value: string };
    selectedPeriod: { label: string; value: string };
    isLineDataFetched: boolean;
    handleLineDataFetched: (isDataFetched: boolean) => void;
    pnlHistory: { time: number; value: number }[] | undefined;
    setPnlHistory: React.Dispatch<
        React.SetStateAction<{ time: number; value: number }[] | undefined>
    >;
    accountValueHistory: { time: number; value: number }[] | undefined;
    setAccountValueHistory: React.Dispatch<
        React.SetStateAction<{ time: number; value: number }[] | undefined>
    >;
    userProfileLineData: any;
    setUserProfileLineData: React.Dispatch<React.SetStateAction<any>>;
}

const TabChartContext: React.FC<TabChartContext> = (props) => {
    const {
        activeTab,
        selectedVault,
        selectedPeriod,
        isLineDataFetched,
        handleLineDataFetched,
        pnlHistory,
        setPnlHistory,
        accountValueHistory,
        setAccountValueHistory,
        userProfileLineData,
        setUserProfileLineData,
    } = props;

    const { userAddress } = useUserDataStore();

    const { fetchUserPortfolio } = useInfoApi();

    const [parsedKey, setParsedKey] = useState<string>();
    const [chartWidth, setChartWidth] = useState<number>(
        window.innerWidth > 768
            ? Math.min(850, window.innerWidth - 50)
            : window.innerWidth - 50,
    );
    const [chartHeight, setChartHeight] = useState<number>(
        Math.max(250 - (870 - window.innerHeight), 100),
    );

    const parseUserProfileData = (data: any, key: string) => {
        const userPositionData = data.get(key) as UserPositionIF;

        if (userPositionData.accountValueHistory) {
            const accountValueHistory =
                userPositionData.accountValueHistory.map((accountValue) => {
                    return {
                        time: accountValue[0],
                        value: Number(accountValue[1]),
                    };
                });

            setAccountValueHistory(() => accountValueHistory);
        }

        if (userPositionData.pnlHistory) {
            const pnlHistory = userPositionData.pnlHistory.map((pnlValue) => {
                return {
                    time: pnlValue[0],
                    value: Number(pnlValue[1]),
                };
            });

            setPnlHistory(() => pnlHistory);
        }

        setParsedKey(() => key);
    };

    useEffect(() => {
        if (userAddress && !isLineDataFetched) {
            fetchUserPortfolio(userAddress).then((data) => {
                setUserProfileLineData(() => data);

                handleLineDataFetched(true);
            });
        }
    }, [userAddress, isLineDataFetched]);

    useEffect(() => {
        const key =
            selectedVault.value === 'perp'
                ? 'perp' + selectedPeriod.value
                : selectedPeriod.value === 'AllTime'
                  ? 'allTime'
                  : selectedPeriod.value?.toLowerCase();

        if (key !== parsedKey && userProfileLineData) {
            parseUserProfileData(userProfileLineData, key);
        }
    }, [
        userProfileLineData,
        selectedVault.value,
        selectedPeriod.value,
        activeTab,
    ]);

    window.addEventListener('resize', () => {
        const height = window.innerHeight;
        const width = window.innerWidth;

        if (width > 768) {
            if (width < 1250) {
                setChartWidth(() => Math.max(850 - (1250 - width), 250));
            } else {
                setChartWidth(() => 900);
            }
        } else {
            setChartWidth(() => width - 50);
        }

        if (height < 870) {
            setChartHeight(() => Math.max(250 - (870 - height), 100));
        } else {
            setChartHeight(() => 250);
        }
    });

    return (
        <div>
            {activeTab === 'Performance' && pnlHistory && (
                <LineChart
                    lineData={pnlHistory}
                    curve={'step'}
                    chartName={selectedVault.value + selectedPeriod.value}
                    height={chartHeight}
                    width={chartWidth}
                />
            )}

            {activeTab === 'Account Value' && accountValueHistory && (
                <LineChart
                    lineData={accountValueHistory}
                    curve={'step'}
                    chartName={selectedVault.value + selectedPeriod.value}
                    height={chartHeight}
                    width={chartWidth}
                />
            )}

            {activeTab === 'Collateral' && (
                <CollateralPieChart height={chartHeight} width={chartWidth} />
            )}
        </div>
    );
};

export default TabChartContext;
