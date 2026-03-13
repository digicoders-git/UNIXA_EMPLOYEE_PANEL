import React from "react";
import { 
  Flex, 
  HStack, 
  IconButton, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Text, 
  Box, 
  Icon, 
  Avatar, 
  Badge,
  Tooltip,
  VStack,
  useColorModeValue
} from "@chakra-ui/react";
import { FaBars, FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header = ({ onToggleSidebar, user }) => {
  const navigate = useNavigate();
  const bg = useColorModeValue("whiteAlpha.800", "slate.900Alpha.800");

  return (
    <Flex
      as="header"
      h="20"
      bg={bg}
      backdropFilter="blur(10px)"
      borderBottom="1px"
      borderColor="slate.100"
      align="center"
      justify="space-between"
      px={6}
      position="sticky"
      top={0}
      zIndex={30}
    >
      <HStack spacing={4}>
        <IconButton
          display={{ base: "flex", lg: "none" }}
          variant="ghost"
          icon={<FaBars />}
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
          borderRadius="xl"
          _hover={{ bg: "slate.100" }}
        />
        
        {/* Search Bar - Hidden on Mobile */}
        <InputGroup 
          display={{ base: "none", md: "flex" }} 
          w="80"
          transition="all 0.2s"
        >
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="slate.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search tickets, customers..." 
            variant="filled"
            bg="slate.50"
            borderRadius="2xl"
            border="1px solid"
            borderColor="slate.100"
            _focus={{ bg: "white", borderColor: "brand.500", ring: 2, ringColor: "brand.100" }}
          />
        </InputGroup>
      </HStack>

      <HStack spacing={{ base: 2, md: 4 }}>
        {/* Notifications */}
        <Box position="relative" cursor="pointer" onClick={() => navigate("/service-requests")}>
          <IconButton
            variant="ghost"
            icon={<FaBell />}
            aria-label="Notifications"
            borderRadius="xl"
            fontSize="xl"
            color="slate.500"
            _hover={{ color: "brand.500", bg: "brand.50" }}
          />
          <Badge
            position="absolute"
            top="2"
            right="2"
            w="2"
            h="2"
            bg="red.500"
            borderRadius="full"
            border="2px solid white"
          />
        </Box>

        <DividerVertical />

        {/* User Profile */}
        <HStack 
          spacing={3} 
          pl={2} 
          cursor="pointer" 
          onClick={() => navigate("/profile")}
          _hover={{ opacity: 0.8 }}
          transition="all 0.2s"
        >
          <VStack align="flex-end" spacing={0} display={{ base: "none", sm: "flex" }}>
            <Text fontSize="sm" fontWeight="bold" color="slate.800" lineHeight="1">
              {user?.name || "Employee"}
            </Text>
            <Text fontSize="10px" fontWeight="black" color="brand.500" textTransform="uppercase" letterSpacing="wider" mt={1}>
              {user?.role || "Technician"}
            </Text>
          </VStack>
          <Avatar 
            size="sm" 
            name={user?.name || "Employee"}
            src={user?.profilePicture}
            icon={<FaUserCircle fontSize="1.5rem" />} 
            bg="slate.50" 
            color="slate.400"
            border="1px solid"
            borderColor="slate.100"
            boxShadow="sm"
            borderRadius="xl"
          />
        </HStack>
      </HStack>
    </Flex>
  );
};

const DividerVertical = () => (
  <Box h="6" w="1px" bg="slate.100" mx={2} display={{ base: "none", md: "block" }} />
);

export default Header;
