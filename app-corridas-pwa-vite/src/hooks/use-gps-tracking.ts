import { useState, useCallback, useRef, useEffect } from 'react';
import { enviarLocalizacao } from '@/api/corridas';

const SEND_INTERVAL_MS = 30_000;

interface GpsState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isTracking: boolean;
  error: string | null;
}

export function useGpsTracking(corridaId: number | null) {
  const [state, setState] = useState<GpsState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    isTracking: false,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPos = useRef<{ lat: number; lng: number; acc: number | null }>({
    lat: 0,
    lng: 0,
    acc: null,
  });

  const sendPosition = useCallback(async () => {
    if (!corridaId || !latestPos.current.lat) return;
    try {
      await enviarLocalizacao(
        corridaId,
        latestPos.current.lat,
        latestPos.current.lng,
        latestPos.current.acc ?? undefined,
      );
    } catch {
      // silently fail, will retry next interval
    }
  }, [corridaId]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState((s) => ({ ...s, isTracking: false }));
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'GPS nao disponivel neste dispositivo' }));
      return;
    }

    setState((s) => ({ ...s, isTracking: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        latestPos.current = { lat: latitude, lng: longitude, acc: accuracy };
        setState((s) => ({
          ...s,
          latitude,
          longitude,
          accuracy,
          error: null,
        }));
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message }));
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );

    sendPosition();
    intervalRef.current = setInterval(sendPosition, SEND_INTERVAL_MS);
  }, [sendPosition]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    latitude: state.latitude,
    longitude: state.longitude,
    accuracy: state.accuracy,
    isTracking: state.isTracking,
    error: state.error,
    startTracking,
    stopTracking,
  };
}
