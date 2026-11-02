// Importa de "enums" (e não de "client") para poder ser usado em Client
// Components sem levar o Prisma Client para o bundle do navegador.
import { Category } from "../../generated/prisma/enums"

export const CATEGORY_LABELS: Record<Category, string> = {
    MATEMATICA: "Matemática",
    PORTUGUES: "Português",
    CIENCIAS: "Ciências",
    HISTORIA: "História",
    GEOGRAFIA: "Geografia",
    INGLES: "Inglês",
    ARTES: "Artes",
    EDUCACAO_FISICA: "Educação Física",
    GERAL: "Geral",
}

export const CATEGORY_OPTIONS = Object.values(Category).map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
}))
