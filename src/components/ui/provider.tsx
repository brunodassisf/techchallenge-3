"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export function Provider({ children, ...props }: ColorModeProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeProvider {...props}>
        <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
      </ColorModeProvider>
    </QueryClientProvider>
  )
}
