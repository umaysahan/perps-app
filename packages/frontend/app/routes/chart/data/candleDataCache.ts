import { bsColorSets } from '~/stores/AppSettingsStore';
import { fetchCandles, fetchUserFillsHistory } from './fetchCandleData';
import {
    getChartThemeColors,
    mapResolutionToInterval,
    resolutionToSeconds,
} from './utils/utils';
import type { Bar } from '~/tv/charting_library';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataCache = new Map<string, any[]>();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataCacheWithUser = new Map<string, { user: string; dataCache: any[] }>();

export async function getHistoricalData(
    symbol: string,
    resolution: string,
    from: number,
    to: number,
) {
    const key = `${symbol}-${resolution}`;
    const cachedData = dataCache.get(key) || [];

    const candleCount = (to - from) / resolutionToSeconds(resolution);
    const hasDataForRange =
        cachedData.filter(
            (bar) => bar.time >= from * 1000 && bar.time <= to * 1000,
        ).length >= candleCount;

    if (hasDataForRange) {
        return cachedData.filter(
            (bar) => bar.time >= from * 1000 && bar.time <= to * 1000,
        );
    }

    const period = mapResolutionToInterval(resolution);
    const data = await fetchCandles(symbol, period, from, to).then(
        (res: any) => {
            if (res) {
                const formattedData = res.map((item: any) => ({
                    time: item.t,
                    open: Number(item.o),
                    high: Number(item.h),
                    low: Number(item.l),
                    close: Number(item.c),
                    volume: Number(item.v),
                }));

                for (const newBar of formattedData) {
                    const index = cachedData.findIndex(
                        (bar) => bar.time === newBar.time,
                    );

                    if (index > -1) {
                        cachedData[index] = newBar;
                    } else {
                        cachedData.push(newBar);
                    }
                }

                dataCache.set(key, cachedData);
                const filteredCandle = cachedData.filter(
                    (bar) => bar.time >= from * 1000 && bar.time <= to * 1000,
                );
                return filteredCandle.sort((a, b) => a.time - b.time);
            }
        },
    );

    return data;
}

export function updateCandleCache(
    symbol: string,
    resolution: string,
    tick: Bar,
) {
    const key = `${symbol}-${resolution}`;
    const cachedData = dataCache.get(key) || [];
    const tickTime = tick.time;

    const lastIndex = cachedData.findIndex((b) => b.time === tickTime);

    if (lastIndex > -1) {
        cachedData[lastIndex] = { ...cachedData[lastIndex], ...tick };
    } else {
        cachedData.push(tick);
    }

    dataCache.set(key, cachedData);
}

export async function getMarkFillData(coin: string, user?: string) {
    const cacheKey = `${coin}-fillData`;

    const cachedData = dataCacheWithUser.get(cacheKey);

    if (
        cachedData &&
        cachedData.dataCache.length > 0 &&
        (!user || user === cachedData.user)
    ) {
        return cachedData;
    }

    if (user) {
        return await fetchUserFillsHistory(user).then((res: any) => {
            const poolFillData: Array<any> = [];

            if (res) {
                res.forEach((element: any) => {
                    if (element.coin === coin) {
                        poolFillData.push(element);
                    }
                });

                const fetchedDataWithUser = {
                    user: user,
                    dataCache: poolFillData,
                };

                dataCacheWithUser.set(cacheKey, fetchedDataWithUser);

                return fetchedDataWithUser;
            }
        });
    } else {
        return [];
    }
}

export function updateMarkDataWithSubscription(
    coin: string,
    newMarks: any[],
    user: string,
) {
    const cacheKey = `${coin}-fillData`;

    const cachedData = dataCacheWithUser.get(cacheKey);

    if (cachedData) {
        const existingMarks = cachedData.dataCache;

        newMarks.forEach((newMark) => {
            const exists = existingMarks.some(
                (oldMark) => oldMark.oid === newMark.oid,
            );

            if (!exists) {
                existingMarks.push(newMark);
            }
        });

        const fetchedDataWithUser = {
            user: user,
            dataCache: existingMarks,
        };

        dataCacheWithUser.set(cacheKey, fetchedDataWithUser);
    }
}

export function getMarkColorData() {
    const candleSettings = localStorage.getItem(
        'tradingview.chartproperties.mainSeriesProperties',
    );

    const parsedCandleSettings = candleSettings
        ? JSON.parse(candleSettings)
        : null;

    const chartThemeColors = getChartThemeColors();

    if (parsedCandleSettings?.candleStyle) {
        const {
            upColor,
            downColor,
            borderUpColor,
            borderDownColor,
            wickUpColor,
            wickDownColor,
        } = parsedCandleSettings.candleStyle;

        const activeColors = [
            upColor,
            downColor,
            borderUpColor,
            borderDownColor,
            wickUpColor,
            wickDownColor,
        ];
        const isCustomized = activeColors.some((color) =>
            color?.startsWith('rgba'),
        );

        if (!isCustomized && chartThemeColors) {
            return chartThemeColors;
        }

        return { buy: upColor, sell: downColor };
    }

    if (chartThemeColors) {
        return chartThemeColors;
    }

    return bsColorSets['default'];
}
