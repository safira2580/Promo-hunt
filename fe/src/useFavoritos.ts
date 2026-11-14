import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import { authFetch, getToken } from "./api";

export function useFavoritos() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [sesion, setSesion] = useState<boolean | null>(null);

  const cargar = useCallback(async () => {
    try {
      if (!getToken()) {
        setItems([]);
        setSesion(false);
        return;
      }
      const r = await authFetch(`${API_URL}/api/v1/favoritos`);
      if (r.status === 401) {
        setItems([]);
        setSesion(false);
        return;
      }
      setItems(r.ok ? await r.json() : []);
      setSesion(true);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const alternar = async (id: number) => {
    const esFav = items.some((x) => x.id_juego === id);
    const r = await authFetch(`${API_URL}/api/v1/favoritos/${id}`, {
      method: esFav ? "DELETE" : "POST",
    });
    if (r.status === 401) {
      navigate("/login");
      return;
    }
    await cargar();
  };

  return { items, ids: items.map((x) => x.id_juego as number), sesion, alternar };
}
