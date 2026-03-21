import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  IconButton,
  Button,
  Avatar,
  Spacer,
  Tooltip,
  Center
} from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaTimes,
  FaTachometerAlt,
  FaTicketAlt,
  FaClipboardList,
  FaTools,
  FaUserPlus,
  FaChartBar,
  FaUserCircle,
  FaKey,
  FaSignOutAlt,
  FaChevronRight,
  FaTags,
  FaBox,
  FaCommentDots
} from "react-icons/fa";

const SidebarItem = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink to={to} onClick={onClick} style={{ width: '100%' }}>
      <HStack
        spacing={4}
        px={6}
        py={3.5}
        mx={3}
        mb={1}
        borderRadius="2xl"
        cursor="pointer"
        transition="all 0.2s"
        bg={isActive ? "brand.500" : "transparent"}
        color={isActive ? "white" : "slate.500"}
        boxShadow={isActive ? "lg" : "none"}
        _hover={!isActive ? { bg: "brand.50", color: "brand.600" } : {}}
        role="group"
      >
        <Icon as={icon} fontSize="lg" />
        <Text fontSize="sm" fontWeight="semibold" flex={1}>{label}</Text>
        <Icon
          as={FaChevronRight}
          fontSize="xs"
          opacity={isActive ? 1 : 0}
          _groupHover={{ opacity: isActive ? 1 : 0.5 }}
          transition="opacity 0.2s"
        />
      </HStack>
    </NavLink>
  );
};

const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const menuItems = [
    { to: "/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { to: "/complain-tickets", icon: FaTicketAlt, label: "Complain Tickets" },
    { to: "/ticket-types", icon: FaTags, label: "Ticket Types" },
    { to: "/assigned-jobs", icon: FaClipboardList, label: "Assigned Jobs" },
    { to: "/new-lead", icon: FaUserPlus, label: "New Lead" },
    { to: "/my-assets", icon: FaBox, label: "My Assets" },
    { to: "/reports", icon: FaChartBar, label: "Reports" },
    { to: "/sms-center", icon: FaCommentDots, label: "SMS Center" },
    { to: "/profile", icon: FaUserCircle, label: "Profile" },
    { to: "/change-password", icon: FaKey, label: "Change Password" },
  ];

  return (
    <Box
      as="aside"
      position={{ base: "fixed", lg: "static" }}
      left={0}
      top={0}
      h="100vh"
      w="72"
      bg="white"
      borderRight="1px"
      borderColor="slate.100"
      zIndex="50"
      transform={{ base: isOpen ? "translateX(0)" : "translateX(-100%)", lg: "none" }}
      transition="transform 0.3s ease-in-out"
      display="flex"
      flexDirection="column"
      boxShadow={{ base: "2xl", lg: "none" }}
    >
      {/* Sidebar Header */}
      <Flex h="36" px={9} align="center" justify="center" borderBottom="1px solid" borderColor="slate.100">
        <HStack spacing={3} justify="center">
        <VStack spacing={1} align="center">
            <Box>
              <img src="/favicon.png" alt="UNIXA Logo" style={{ width: '112px', height: '112px', objectFit: 'contain' }} />
            </Box>
            <Text
              fontSize="10px"
              fontWeight="900"
              color="accent.500"
              letterSpacing="0.4em"
              textTransform="uppercase"
              fontFamily="'Source Sans 3', sans-serif"
            >
              Employee Panel
            </Text>
          </VStack>
        </HStack>
        <IconButton
          display={{ base: "flex", lg: "none" }}
          variant="ghost"
          icon={<FaTimes />}
          onClick={onClose}
          aria-label="Close sidebar"
          size="sm"
          position="absolute"
          right="4"
          top="6"
          color="slate.400"
        />
      </Flex>

      {/* Navigation Links */}
      <Box flex={1} overflowY="auto" py={2}>
        <Text px={8} fontSize="10px" fontWeight="black" color="slate.400" textTransform="uppercase" letterSpacing="0.2em" mb={4}>
          Main Menu
        </Text>
        <VStack spacing={0} align="stretch" px={1}>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={onClose}
            />
          ))}
        </VStack>
      </Box>

      {/* Logout Link */}
      <Box p={6}>
        <Button
          w="full"
          h="3.5rem"
          variant="unstyled"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={3}
          bg="rose.50"
          color="rose.600"
          borderRadius="2xl"
          fontSize="sm"
          fontWeight="bold"
          _hover={{ bg: "red.600", color: "white" }}
          transition="all 0.3s"
          onClick={onLogout}
          sx={{
            '&:hover svg': {
              transform: 'rotate(12deg)'
            }
          }}
        >
          <Icon as={FaSignOutAlt} fontSize="lg" transition="transform 0.3s" />
          <Text>Logout Account</Text>
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
