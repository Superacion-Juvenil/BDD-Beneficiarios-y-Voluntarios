import { useState, useEffect } from 'react';
import { MUNICIPIOS, OTRO, municipioDelCatalogo } from '../lib/municipios';
import { Field, Input, Select } from './ui/Field';

/**
 * Campo de municipio: lista desplegable con los municipios donde opera SJ,
 * más "Otro" con un cuadro de texto.
 *
 * Guarda el nombre del municipio en el mismo campo de texto de siempre, así
 * que no cambia nada en la base. Un valor antiguo que no esté en el catálogo
 * no se pierde ni se adivina: abre en "Otro" con el texto tal como estaba,
 * a la vista de quien edita.
 */
export function MunicipioField({ value, onChange, disabled }) {
  const delCatalogo = municipioDelCatalogo(value);
  const fueraDelCatalogo = Boolean((value || '').trim()) && !delCatalogo;

  const [modoOtro, setModoOtro] = useState(fueraDelCatalogo);

  // El perfil llega después de la carga: si el valor que aparece no está en
  // el catálogo, el campo pasa solo a "Otro".
  useEffect(() => {
    if (fueraDelCatalogo) setModoOtro(true);
  }, [fueraDelCatalogo]);

  function elegir(opcion) {
    if (opcion === OTRO) {
      setModoOtro(true);
      onChange('');
      return;
    }
    setModoOtro(false);
    onChange(opcion);
  }

  return (
    <Field label="Municipio">
      <Select
        value={modoOtro ? OTRO : (delCatalogo || '')}
        onChange={e => elegir(e.target.value)}
        disabled={disabled}
      >
        <option value="">Selecciona…</option>
        {MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
        <option value={OTRO}>{OTRO}</option>
      </Select>

      {modoOtro && (
        <Input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Escribe el municipio"
          disabled={disabled}
          style={{ marginTop: '8px' }}
        />
      )}
    </Field>
  );
}
