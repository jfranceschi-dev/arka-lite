import Swal, { type SweetAlertIcon } from "sweetalert2";

// SweetAlert2 con el estilo de la plantilla: sin estilos propios de la
// librería, solo las clases arka-* definidas en app.css, que siguen el tema.
// Los textos se pasan como texto plano, nunca como HTML.

const clases = {
  container: "arka-swal-fondo",
  popup: "arka-swal",
  title: "arka-swal-titulo",
  htmlContainer: "arka-swal-texto",
  actions: "arka-swal-acciones",
  confirmButton: "arka-boton arka-boton-primario",
  cancelButton: "arka-boton arka-boton-secundario",
  icon: "arka-swal-icono",
};

export interface Confirmacion {
  titulo: string;
  texto: string;
  confirmar: string;
  tono?: "normal" | "peligro";
}

export async function confirmar({ titulo, texto, confirmar, tono = "normal" }: Confirmacion): Promise<boolean> {
  const r = await Swal.fire({
    title: titulo,
    text: texto,
    icon: tono === "peligro" ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmar,
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    buttonsStyling: false,
    focusConfirm: true,
    customClass: { ...clases, confirmButton: tono === "peligro" ? "arka-boton arka-boton-peligro" : clases.confirmButton },
    showClass: { popup: "arka-swal-entra" },
    hideClass: { popup: "arka-swal-sale" },
  });
  return r.isConfirmed;
}

export function avisar(titulo: string, texto: string, icono: SweetAlertIcon = "success"): void {
  void Swal.fire({
    toast: true,
    position: "top-end",
    timer: 3500,
    timerProgressBar: true,
    showConfirmButton: false,
    title: titulo,
    text: texto,
    icon: icono,
    customClass: { popup: "arka-swal arka-swal-toast", title: "arka-swal-titulo", htmlContainer: "arka-swal-texto", timerProgressBar: "arka-swal-progreso" },
  });
}

export async function informarError(titulo: string, texto: string): Promise<void> {
  await Swal.fire({
    title: titulo,
    text: texto,
    icon: "error",
    confirmButtonText: "Entendido",
    buttonsStyling: false,
    customClass: clases,
    showClass: { popup: "arka-swal-entra" },
    hideClass: { popup: "arka-swal-sale" },
  });
}
