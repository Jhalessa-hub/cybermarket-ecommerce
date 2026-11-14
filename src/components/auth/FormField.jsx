import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function FormField({ label, error, hint, type = 'text', ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <div className="relative">
        <input {...props} id={id} type={password && visible ? 'text' : type} aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-help` : undefined} className={`form-input ${password ? 'pr-12' : ''}`} />
        {password && <button type="button" className="absolute right-1 top-1 rounded-lg p-2 text-ink-muted hover:text-white" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>}
      </div>
      {(error || hint) && <p id={`${id}-help`} className={`text-xs leading-relaxed ${error ? 'text-red-300' : 'text-ink-muted'}`}>{error || hint}</p>}
    </div>
  );
}
