import { 
  Box, 
  Flex, 
  Container, 
  Text, 
  VStack,
  HStack,
  useDisclosure,
  Divider
} from "@chakra-ui/react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Flex h="100vh" bg="slate.50" overflow="hidden">
      {/* Mobile Overlay is handled internally by Chakra if we were using Drawer, 
          but here we use custom Sidebar logic for layout consistency */}
      {isOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.300"
          backdropFilter="blur(2px)"
          zIndex={40}
          display={{ base: "block", lg: "none" }}
          onClick={onClose}
        />
      )}

      <Sidebar 
        isOpen={isOpen} 
        onClose={onClose} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Viewport */}
      <Flex flex={1} direction="column" overflow="hidden" position="relative">
        <Header 
            onToggleSidebar={onOpen} 
            user={user} 
        />

        {/* Dynamic Page Content Area */}
        <Box 
          as="main" 
          flex={1} 
          overflowY="auto" 
          p={{ base: 4, md: 8, lg: 10 }}
          css={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: '#f1f5f9' },
            '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '10px' },
          }}
        >
          <Container maxW="container.xl" p={0}>
            {/* Page specific content */}
            <Box animation="fade-in 0.4s ease-out">
              <Outlet />
            </Box>
          </Container>
        </Box>
      </Flex>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Flex>
  );
};

export default DashboardLayout;
