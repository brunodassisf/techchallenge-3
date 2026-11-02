"use client"

import { createListCollection, Select } from "@chakra-ui/react"
import { CATEGORY_OPTIONS } from "@/lib/category"
import { Category } from "../../../../generated/prisma/enums"

const categoryCollection = createListCollection({ items: CATEGORY_OPTIONS })

interface CategorySelectProps {
    /** Uso controlado (edição). */
    value?: Category
    onChange?: (category: Category) => void
    /** Uso não controlado (criação, lido via FormData pelo `name`). */
    defaultValue?: Category
    name?: string
}

/**
 * Select de matéria dos modais de post. Sem <Portal>: dentro de um Dialog,
 * o conteúdo precisa ficar na árvore do modal para não fechar o modal nem
 * ficar atrás dele ao clicar numa opção.
 */
const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, defaultValue, name }) => (
    <Select.Root
        collection={categoryCollection}
        name={name}
        value={value ? [value] : undefined}
        defaultValue={defaultValue ? [defaultValue] : undefined}
        onValueChange={(details) => {
            const [selected] = details.value
            if (selected) onChange?.(selected as Category)
        }}
    >
        <Select.HiddenSelect />
        <Select.Label>Matéria</Select.Label>
        <Select.Control>
            <Select.Trigger>
                <Select.ValueText placeholder="Selecione a matéria" />
            </Select.Trigger>
            <Select.IndicatorGroup>
                <Select.Indicator />
            </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
            <Select.Content>
                {categoryCollection.items.map((category) => (
                    <Select.Item item={category} key={category.value}>
                        <Select.ItemText>{category.label}</Select.ItemText>
                        <Select.ItemIndicator />
                    </Select.Item>
                ))}
            </Select.Content>
        </Select.Positioner>
    </Select.Root>
)

export default CategorySelect
