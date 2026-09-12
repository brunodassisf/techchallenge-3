'use client'
import { IconButton } from "@chakra-ui/react"
import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa6"

function usePasswordVisibility() {
    const [visible, setVisible] = useState(false)

    return {
        type: visible ? "text" : "password",
        endElement: (
            <IconButton
                aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                variant="ghost"
                size="sm"
                onClick={() => setVisible((prev) => !prev)}
            >
                {visible ? <FaEyeSlash /> : <FaEye />}
            </IconButton>
        ),
    }
}

export default usePasswordVisibility;