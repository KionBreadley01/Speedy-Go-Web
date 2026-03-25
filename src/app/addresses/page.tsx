"use client"

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useAddressStore, AddressItem } from '@/store/addressStore';
import { userService } from '@/lib/services/userService';
import { MapPin, Plus, Home, Briefcase, Building, CheckCircle2, Crosshair, Search, Trash2, ArrowLeft, Navigation, ChevronRight, Loader2, MoreHorizontal, Pencil } from 'lucide-react';
import styles from './addresses.module.css';
import { MapPicker } from '@/components/MapPicker';
import { useToast } from '@/components/Toast';

export default function Addresses() {
  const router = useRouter();
  const { addresses, currentAddress, setAddresses, setCurrentAddress, loading, setLoading } = useAddressStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // New address form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Casa');
  const [details, setDetails] = useState('');
  const [tag, setTag] = useState('');
  const [instructions, setInstructions] = useState('');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Autocomplete state
  interface Suggestion { display_name: string; lat: string; lon: string; type: string; }
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddr, setSearchingAddr] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search for address predictions
  const searchAddress = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchingAddr(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=mx&addressdetails=1`,
          { headers: { 'User-Agent': 'SpeedyGoWeb/1.0' } }
        );
        const data = await res.json();
        setSuggestions(data || []);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchingAddr(false);
      }
    }, 400);
  }, []);

  const handleSelectSuggestion = (sug: Suggestion) => {
    setDescription(sug.display_name);
    setCoords({ lat: parseFloat(sug.lat), lng: parseFloat(sug.lon) });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          setLoading(true);
          const data = await userService.getAddresses(user.uid);
          setAddresses(data);
        } catch (error) {
          console.error("Error loading addresses:", error);
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, setAddresses, setLoading]);

  const handleSelect = (addr: AddressItem) => {
    setCurrentAddress(addr);
    router.push('/');
    router.refresh();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const addrData = {
        title: title || tag || type,
        description,
        type,
        details,
        tag,
        instructions,
        ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
      };

      if (editId) {
        await userService.updateAddress(user.uid, editId, addrData);
        showToast('Dirección actualizada.', 'success');
      } else {
        await userService.addAddress(user.uid, addrData);
        showToast('Dirección guardada.', 'success');
      }

      const data = await userService.getAddresses(user.uid);
      setAddresses(data);
      setIsAdding(false);
      setEditId(null);
      setTitle('');
      setDescription('');
      setDetails('');
      setTag('');
      setInstructions('');
      setCoords(null);
    } catch (e) {
      console.error(e);
      showToast('Error al guardar la dirección.', 'error');
    }
  };

  const handleGetLocation = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('La geolocalización no es compatible con tu navegador.');
      showToast('Tu navegador no soporta geolocalización.', 'error');
      return;
    }
    
    setIsGettingLocation(true);
    showToast('Buscando tu ubicación GPS...', 'info');

    // Try high accuracy first, then fall back to low accuracy
    const tryGeolocation = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { 'User-Agent': 'SpeedyGoWeb/1.0' } }
            );
            const data = await response.json();
            
            if (data && data.display_name) {
              setDescription(data.display_name);
              setTitle('Mi Ubicación Actual');
              showToast('¡Ubicación detectada correctamente!', 'success');
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            setDescription(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
            showToast('Ubicación GPS obtenida. La dirección no pudo resolverse.', 'warning');
          } finally {
            setIsGettingLocation(false);
          }
        }, 
        (error) => {
          // If high accuracy failed, retry with low accuracy (network-based)
          if (highAccuracy) {
            console.warn('High accuracy failed, trying low accuracy...', error.message);
            tryGeolocation(false);
            return;
          }
          
          // Both attempts failed
          if (error.code === 1) {
            setGeoError('No tenemos acceso a tu ubicación. Haz clic en el candado de la barra de tu navegador → Permisos → Ubicación → Permitir, y luego recarga la página.');
            showToast('Permiso de ubicación denegado. Revisa los permisos del navegador.', 'error');
          } else if (error.code === 2) {
            setGeoError('La red no pudo determinar tu ubicación. Verifica que tu Wi-Fi esté activo o que tu dispositivo tenga GPS.');
            showToast('No se pudo determinar tu ubicación.', 'error');
          } else if (error.code === 3) {
            setGeoError('El tiempo se agotó buscando tu ubicación. Intenta de nuevo o escribe tu dirección manualmente.');
            showToast('Tiempo agotado. Intenta de nuevo.', 'warning');
          } else {
            setGeoError(`Error al detectar ubicación: ${error.message}`);
          }
          setIsGettingLocation(false);
        },
        { 
          enableHighAccuracy: highAccuracy,
          timeout: 15000, 
          maximumAge: 120000 
        }
      );
    };

    tryGeolocation(true);
  };

  const getIcon = (addrType: string) => {
    if (addrType === 'Casa') return <Home size={20} color="var(--slate-500)" />;
    if (addrType === 'Oficina') return <Briefcase size={20} color="var(--slate-500)" />;
    return <Building size={20} color="var(--slate-500)" />;
  };

  if (loading) {
    return <div className={styles.loading}>Cargando direcciones...</div>;
  }

  return (
    <div className={styles.container}>
      {!isAdding && (
        <div className={styles.header}>
          <h1 className={styles.title}>Mis Direcciones</h1>
          <button className={styles.addBtn} onClick={() => setIsAdding(true)}>
            <Plus size={20} />
            <span>Agregar</span>
          </button>
        </div>
      )}

      {isAdding ? (
        <form className={styles.addForm} onSubmit={handleAddSubmit}>
          <div className={styles.locationHeaderRow}>
            <h2 className={styles.formTitle}>{editId ? 'Editar dirección' : 'Detalles de entrega'}</h2>
          </div>

          <div className={styles.formSplit}>
            {/* Left: GPS + Map */}
            <div className={styles.formLeft}>
              <button className={styles.gpsBigBtn} onClick={handleGetLocation} type="button" disabled={isGettingLocation}>
                <div className={styles.gpsIconCircle}>
                  {isGettingLocation ? <Loader2 size={18} color="var(--white)" className="spin" /> : <Navigation size={18} color="var(--white)" />}
                </div>
                <div className={styles.gpsTextWrap}>
                  <div className={styles.gpsText}>Mi ubicación actual</div>
                  <div className={styles.gpsSub}>{isGettingLocation ? 'Buscando satélites...' : 'Usar el GPS para detectar dónde estás'}</div>
                </div>
                {!isGettingLocation && <ChevronRight size={20} color="#9ca3af" />}
              </button>

              <div className={styles.mapPreview}>
                <MapPicker 
                  key={coords ? `${coords.lat}-${coords.lng}` : 'default-map'}
                  initialLat={coords?.lat} 
                  initialLng={coords?.lng} 
                  onLocationSelect={async (lat, lng) => {
                    setCoords({ lat, lng });
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                      const data = await res.json();
                      if (data && data.display_name) {
                         setDescription(data.display_name);
                      }
                    } catch(e) {}
                  }} 
                />
              </div>
              {geoError && <div className={styles.geoErrorMsg}>{geoError}</div>}
            </div>

            {/* Right: Form fields in 2-col grid */}
            <div className={styles.formRight}>
              <div className={styles.inputGroup} style={{ position: 'relative' }} ref={suggestionsRef}>
                <label>Localidad / Lugar</label>
                <input
                  required
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    searchAddress(e.target.value);
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className={styles.input}
                  placeholder="Escribe una calle, colonia o ciudad..."
                  autoComplete="off"
                />
                {searchingAddr && (
                  <div className={styles.searchingHint}>
                    <Loader2 size={14} className="spin" /> Buscando...
                  </div>
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div className={styles.suggestionsDropdown}>
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        className={styles.suggestionItem}
                        onClick={() => handleSelectSuggestion(sug)}
                      >
                        <MapPin size={16} color="var(--primary)" className={styles.suggestionIcon} />
                        <div className={styles.suggestionText}>
                          <span className={styles.suggestionMain}>{sug.display_name.split(',')[0]}</span>
                          <span className={styles.suggestionSub}>{sug.display_name.split(',').slice(1, 3).join(',')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Tipo de dirección</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={styles.input}>
                  <option value="Casa">Casa</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Residencial">Residencial</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Etiqueta (opcional)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={styles.input} placeholder="Ej. Mamá, Abuela, Consultorio..." />
                <div className={styles.chipRow}>
                  {['Casa', 'Oficina', 'Pareja'].map(c => (
                    <button 
                      key={c} type="button" 
                      className={`${styles.chip} ${tag === c ? styles.chipActive : ''}`} 
                      onClick={() => setTag(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Detalles adicionales (opcional)</label>
                <input value={details} onChange={(e) => setDetails(e.target.value)} className={styles.input} placeholder="Ej. Casa de tejado verde" />
              </div>

              <div className={styles.inputGroup}>
                <label>Instrucciones de entrega</label>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className={styles.textarea} rows={2} placeholder="Ej. Dejar en recepción" />
              </div>
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsAdding(false)}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>Guardar</button>
          </div>
        </form>
      ) : (
        <div className={styles.addressList}>
          {addresses.length === 0 ? (
             <div className={styles.emptyState}>No tienes direcciones guardadas.</div>
          ) : (
            addresses.map((addr) => {
              const isSelected = currentAddress?.id === addr.id;
              const isMenuOpen = openMenuId === addr.id;
              return (
                <div 
                  key={addr.id} 
                  className={`${styles.addressCard} ${isSelected ? styles.selectedCard : ''}`}
                >
                  <div className={styles.cardLeft} onClick={() => handleSelect(addr)}>
                    <div className={styles.iconCircle}>
                      {getIcon(addr.type)}
                    </div>
                    <div className={styles.addressInfo}>
                      <h3 className={styles.addressTitle}>{addr.title}</h3>
                      <p className={styles.addressDesc}>{addr.description}</p>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    {isSelected && (
                      <CheckCircle2 size={20} color="var(--primary)" />
                    )}
                    <button
                      className={styles.moreBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : (addr.id || null));
                      }}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {isMenuOpen && (
                      <div className={styles.optionsMenu}>
                        <button
                          className={styles.optionItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            // Pre-fill form for editing
                            setEditId(addr.id || null);
                            setTitle(addr.title);
                            setDescription(addr.description);
                            setType(addr.type || 'Casa');
                            setTag('');
                            setDetails('');
                            setInstructions('');
                            setCoords(null);
                            setIsAdding(true);
                          }}
                        >
                          <Pencil size={18} color="var(--slate-600)" />
                          <span>Editar dirección</span>
                        </button>
                        <button
                          className={`${styles.optionItem} ${styles.optionDanger}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            const user = auth.currentUser;
                            if (!user || !addr.id) return;
                            try {
                              await userService.deleteAddress(user.uid, addr.id);
                              const data = await userService.getAddresses(user.uid);
                              setAddresses(data);
                              showToast('Dirección eliminada.', 'success');
                            } catch {
                              showToast('No se pudo eliminar.', 'error');
                            }
                          }}
                        >
                          <Trash2 size={18} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
