import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Source Sans 3', sans-serif`,
    body: `'Source Sans 3', sans-serif`,
  },
  colors: {
    brand: {
      50: "#e4f4fb",
      100: "#badff3",
      200: "#8cc9ea",
      300: "#5eb3e1",
      400: "#36a2d9",
      500: "#2197d7", // User provided primary blue
      600: "#187aad",
      700: "#105d84",
      800: "#08415b",
      900: "#002434",
    },
    accent: {
      50: "#fff5e9",
      100: "#ffe3c7",
      200: "#ffd0a2",
      300: "#ffbc7c",
      400: "#ffa857",
      500: "#f89944", // User provided secondary orange
      600: "#d98538",
      700: "#ba712d",
      800: "#9b5e22",
      900: "#7c4a17",
    },
    slate: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    }
  },
  styles: {
    global: {
      body: {
        bg: "slate.50",
        color: "slate.800",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "xl",
        fontWeight: "bold",
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === "brand" ? "brand.500" : props.colorScheme === "accent" ? "accent.500" : undefined,
          color: "white",
          _hover: {
            bg: props.colorScheme === "brand" ? "brand.600" : props.colorScheme === "accent" ? "accent.600" : undefined,
          },
        }),
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "3xl",
          border: "1px solid",
          borderColor: "slate.100",
          boxShadow: "sm",
        },
      },
    },
  },
});

export default theme;
