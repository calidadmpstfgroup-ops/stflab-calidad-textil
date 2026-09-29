import React from 'react';
import { 
  CalculadoraLaboratorioModal, 
  CalculadoraLaboratorioModalProps,
  ProporcionPieza,
  TabCalculadora
} from '../laboratorio/CalculadoraLaboratorioModal';

export type { ProporcionPieza, TabCalculadora };

export interface CalculadoraPatronajeModalProps {
  abierto: boolean;
  onCerrar: () => void;
  muestraInicialId?: string;
  onAbrirGestionUsuarios?: () => void;
  onAplicarValoresAPatronaje?: (valores: {
    factorX: number;
    factorY: number;
    largoCompensado: number;
    anchoCompensado: number;
    observacionCad: string;
    holguraSugerida: number;
  }) => void;
}

export const CalculadoraPatronajeModal: React.FC<CalculadoraPatronajeModalProps> = ({
  abierto,
  onCerrar,
  muestraInicialId,
  onAbrirGestionUsuarios,
  onAplicarValoresAPatronaje
}) => {
  return (
    <CalculadoraLaboratorioModal
      abierto={abierto}
      onCerrar={onCerrar}
      tabInicial="patronaje"
      muestraInicialId={muestraInicialId}
      onAbrirGestionUsuarios={onAbrirGestionUsuarios}
      onAplicarValoresAPatronaje={onAplicarValoresAPatronaje}
    />
  );
};

export default CalculadoraPatronajeModal;
