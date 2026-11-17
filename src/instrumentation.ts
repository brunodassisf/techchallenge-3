/** Roda uma vez quando o servidor sobe (dev e produção). */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureAdmin } = await import("@/lib/ensure-admin");
  // Banco fora do ar não derruba o servidor: só fica sem o admin até o próximo start.
  await ensureAdmin().catch((error) => console.error("Falha ao verificar o ADMIN inicial:", error));
}
