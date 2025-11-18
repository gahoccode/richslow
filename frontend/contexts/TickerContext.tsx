"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TickerContextType {
  ticker: string;
  startDate: string;
  endDate: string;
  period: 'quarter' | 'year';
  setTicker: (ticker: string) => void;
  setDateRange: (start: string, end: string) => void;
  setPeriod: (period: 'quarter' | 'year') => void;
  updateParams: (params: Partial<TickerParams>) => void;
}

interface TickerParams {
  ticker: string;
  startDate: string;
  endDate: string;
  period: 'quarter' | 'year';
}

const TickerContext = createContext<TickerContextType | undefined>(undefined);

export function TickerProvider({ children }: { children: ReactNode }) {
  const [ticker, setTickerState] = useState<string>('VNM');
  const [startDate, setStartDate] = useState<string>('2023-01-01');
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [period, setPeriodState] = useState<'quarter' | 'year'>('quarter');

  const setTicker = (newTicker: string) => {
    setTickerState(newTicker.toUpperCase());
  };

  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const setPeriod = (newPeriod: 'quarter' | 'year') => {
    setPeriodState(newPeriod);
  };

  const updateParams = (params: Partial<TickerParams>) => {
    if (params.ticker) setTickerState(params.ticker.toUpperCase());
    if (params.startDate) setStartDate(params.startDate);
    if (params.endDate) setEndDate(params.endDate);
    if (params.period) setPeriodState(params.period);
  };

  return (
    <TickerContext.Provider
      value={{
        ticker,
        startDate,
        endDate,
        period,
        setTicker,
        setDateRange,
        setPeriod,
        updateParams,
      }}
    >
      {children}
    </TickerContext.Provider>
  );
}

export function useTicker() {
  const context = useContext(TickerContext);
  if (context === undefined) {
    throw new Error('useTicker must be used within a TickerProvider');
  }
  return context;
}
