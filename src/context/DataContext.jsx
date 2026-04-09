import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const DataContext = createContext();

const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    sermons: [],
    weeks: [],
    holidaySettings: null,
    departments: [],
    events: [],
    songs: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const endpoints = {
    sermons: `${BASE_URL}/api/sermons`,
    weeks: `${BASE_URL}/api/weeks`,
    holidaySettings: `${BASE_URL}/api/holiday/settings`,
    holidayCount: `${BASE_URL}/api/holiday/count`,
    departments: `${BASE_URL}/api/departments`,
    events: `${BASE_URL}/api/events?status=upcoming&limit=2`,
    songs: `${BASE_URL}/api/songs`,
  };

  // Load from cache
  const loadFromCache = () => {
    const cached = localStorage.getItem('churchAppData');
    if (!cached) return null;

    const { data: cachedData, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem('churchAppData');
      return null;
    }
    return cachedData;
  };

  // Save to cache
  const saveToCache = (fetchedData) => {
    localStorage.setItem(
      'churchAppData',
      JSON.stringify({
        data: fetchedData,
        timestamp: Date.now(),
      })
    );
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const cachedData = loadFromCache();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          sermonsRes,
          weeksRes,
          holidaySettingsRes,
          holidayCountRes,
          departmentsRes,
          eventsRes,
          songsRes,
        ] = await Promise.all([
          axios.get(endpoints.sermons),
          axios.get(endpoints.weeks),
          axios.get(endpoints.holidaySettings),
          axios.get(endpoints.holidayCount),
          axios.get(endpoints.departments),
          axios.get(endpoints.events),
          axios.get(endpoints.songs),
        ]);

        const fetchedData = {
          sermons: sermonsRes.data || [],
          weeks: weeksRes.data || [],
          holidaySettings: holidaySettingsRes.data || null,
          participants: holidayCountRes.data?.count || 0,
          departments: Array.isArray(departmentsRes.data)
            ? departmentsRes.data
            : departmentsRes.data?.departments || departmentsRes.data?.data || [],
          events: eventsRes.data?.events || [],
          songs: songsRes.data || [],
        };

        setData(fetchedData);
        saveToCache(fetchedData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load some content. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const value = useMemo(() => ({
    ...data,
    loading,
    error,
    refetch: () => window.location.reload(), // simple refetch for now
  }), [data, loading, error]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useAppData = () => useContext(DataContext);