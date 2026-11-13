import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";

export function useFavoritos() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [sesion, setSesion] = useState<boolean | null>(null);

  const cargar = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/api/favoritos`, { credentials: "include" });
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
    const r = await fetch(`${API_URL}/api/favoritos/${id}`, {
      method: esFav ? "DELETE" : "POST",
      credentials: "include",
    });
    if (r.status === 401) {
      navigate("/login");
      return;
    }
    await cargar();
  };

  return { items, ids: items.map((x) => x.id_juego as number), sesion, alternar };
}
