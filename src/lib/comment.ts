/** Formato de um comentário nas respostas da API (nome do estudante, sem e-mail). */
export const commentSelect = {
  id: true,
  text: true,
  postId: true,
  studentId: true,
  createdAt: true,
  updatedAt: true,
  student: { select: { id: true, name: true } },
} as const;
