/**
 * Verifica se `id` tem o formato de um ObjectId do MongoDB (24 caracteres
 * hexadecimais). Usado nas rotas `[id]` para responder 404 em vez de deixar o
 * Prisma lançar erro (500) com um id malformado.
 */
export function isObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
}
