/**
 * Clave compartida para proteger los guardados (crear/editar/borrar
 * preguntas) contra ediciones accidentales o de terceros sin acceso a
 * EDIT_PASSWORD. No es un sistema de usuarios: una única contraseña
 * compartida, verificada en el servidor en cada Server Action de guardado.
 */
export function isValidEditKey(key: string): boolean {
  const expected = process.env.EDIT_PASSWORD;
  return (
    typeof expected === "string" &&
    expected.length > 0 &&
    typeof key === "string" &&
    key === expected
  );
}

export const INVALID_EDIT_KEY_MESSAGE = "Clave incorrecta.";
