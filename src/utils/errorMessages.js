export function errorMessage(error) {
  return error?.code && typeof error.message === 'string' ? error.message : 'No se pudo completar la acción. Reintenta; no se anunció ningún cambio como guardado.';
}
