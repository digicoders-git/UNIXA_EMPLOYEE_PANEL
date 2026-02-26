import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  Button,
  Badge,
  Flex,
  Divider,
  Circle,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaEllipsisV,
  FaTrashAlt,
  FaEnvelopeOpen,
  FaCalendarAlt,
  FaWrench,
  FaTicketAlt,
  FaClipboardList,
} from "react-icons/fa";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/employee-dashboard/notifications');
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "job":
        return FaWrench;
      case "ticket":
        return FaTicketAlt;
      case "calendar":
        return FaCalendarAlt;
      default:
        return FaInfoCircle;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "red.500";
      case "medium":
        return "orange.400";
      default:
        return "brand.500";
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <Box maxW="4xl" mx="auto" w="full" py={4}>
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={1}>
          <HStack>
            <Circle size="10" bg="brand.50" color="brand.500">
              <Icon as={FaBell} boxSize={5} />
            </Circle>
            <Heading size="xl" color="slate.800" fontWeight="900" letterSpacing="-0.02em">
              Notifications
            </Heading>
          </HStack>
          <Text color="slate.500" fontSize="md" fontWeight="medium">
            Stay updated with your latest assignments and activities
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<FaClipboardList />}
            colorScheme="brand"
            size="sm"
            fontWeight="bold"
            onClick={() => navigate('/service-requests')}
          >
            Service Requests
          </Button>
          <Button
            leftIcon={<FaEnvelopeOpen />}
            variant="ghost"
            colorScheme="brand"
            size="sm"
            fontWeight="bold"
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
        </HStack>
      </Flex>

      <Tabs variant="soft-rounded" colorScheme="brand" mb={8}>
        <TabList bg="white" p={1.5} borderRadius="2xl" border="1px solid" borderColor="slate.100" boxShadow="sm">
          <Tab fontSize="sm" fontWeight="900" borderRadius="xl" px={6}>All</Tab>
          <Tab fontSize="sm" fontWeight="900" borderRadius="xl" px={6}>Unread</Tab>
          <Tab fontSize="sm" fontWeight="900" borderRadius="xl" px={6}>Jobs</Tab>
          <Tab fontSize="sm" fontWeight="900" borderRadius="xl" px={6}>System</Tab>
        </TabList>

        <TabPanels mt={6}>
          <TabPanel p={0}>
            <VStack spacing={3} align="stretch">
              {notifications.map((n) => (
                <NotificationCard 
                  key={n.id} 
                  notification={n} 
                  icon={getIcon(n.type)} 
                  priorityColor={getPriorityColor(n.priority)}
                  onDelete={() => deleteNotification(n.id)}
                />
              ))}
            </VStack>
          </TabPanel>
          <TabPanel p={0}>
            <VStack spacing={3} align="stretch">
              {notifications.filter(n => n.status === 'unread').map((n) => (
                <NotificationCard 
                  key={n.id} 
                  notification={n} 
                  icon={getIcon(n.type)} 
                  priorityColor={getPriorityColor(n.priority)}
                  onDelete={() => deleteNotification(n.id)}
                />
              ))}
            </VStack>
          </TabPanel>
          <TabPanel p={0}>
            <VStack spacing={3} align="stretch">
              {notifications.filter(n => n.type === 'job').map((n) => (
                <NotificationCard 
                  key={n.id} 
                  notification={n} 
                  icon={getIcon(n.type)} 
                  priorityColor={getPriorityColor(n.priority)}
                  onDelete={() => deleteNotification(n.id)}
                />
              ))}
            </VStack>
          </TabPanel>
          <TabPanel p={0}>
            <VStack spacing={3} align="stretch">
              {notifications.filter(n => n.type === 'system').map((n) => (
                <NotificationCard 
                  key={n.id} 
                  notification={n} 
                  icon={getIcon(n.type)} 
                  priorityColor={getPriorityColor(n.priority)}
                  onDelete={() => deleteNotification(n.id)}
                />
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

const NotificationCard = ({ notification, icon, priorityColor, onDelete }) => {
  const isRead = notification.status === "read";

  return (
    <Box
      p={5}
      bg={isRead ? "white" : "brand.50/30"}
      borderRadius="2xl"
      border="1px solid"
      borderColor={isRead ? "slate.100" : "brand.100"}
      position="relative"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md", borderColor: "brand.200" }}
    >
      <Flex gap={4}>
        <Circle size="12" bg="white" color={priorityColor} shadow="sm" border="1px solid" borderColor="slate.100">
          <Icon as={icon} boxSize={5} />
        </Circle>
        
        <Box flex={1}>
          <Flex justify="space-between" align="start">
            <VStack align="start" spacing={0.5}>
              <HStack>
                <Text fontWeight="800" color="slate.800" fontSize="md">
                  {notification.title}
                </Text>
                {!isRead && (
                  <Badge colorScheme="brand" variant="solid" borderRadius="full" px={2} fontSize="9px" fontWeight="black">
                    NEW
                  </Badge>
                )}
              </HStack>
              <Text color="slate.500" fontSize="sm" fontWeight="medium" lineHeight="1.5">
                {notification.description}
              </Text>
            </VStack>
            
            <VStack align="flex-end" spacing={2}>
              <Text fontSize="xs" fontWeight="bold" color="slate.400" whiteSpace="nowrap">
                {notification.time}
              </Text>
              <Menu isLazy>
                <MenuButton
                  as={IconButton}
                  icon={<FaEllipsisV />}
                  variant="ghost"
                  size="xs"
                  aria-label="Options"
                  color="slate.400"
                  _hover={{ bg: "slate.100", color: "slate.600" }}
                />
                <MenuList borderRadius="xl" shadow="xl" border="1px solid" borderColor="slate.100" p={2}>
                  <MenuItem 
                    icon={<FaCheckCircle color="var(--chakra-colors-brand-500)" />} 
                    borderRadius="lg" 
                    fontWeight="bold" 
                    fontSize="sm"
                    color="slate.600"
                  >
                    Mark as read
                  </MenuItem>
                  <MenuItem 
                    icon={<FaTrashAlt color="var(--chakra-colors-red-500)" />} 
                    borderRadius="lg" 
                    fontWeight="bold" 
                    fontSize="sm"
                    color="red.500"
                    onClick={onDelete}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </VStack>
          </Flex>
          
          <HStack mt={3} spacing={3}>
             <Badge variant="subtle" colorScheme={notification.priority === 'high' ? 'red' : 'orange'} borderRadius="md" px={2} py={0.5} fontSize="10px" fontWeight="900" textTransform="uppercase">
                {notification.priority} Priority
             </Badge>
             <Text fontSize="xs" fontWeight="bold" color="slate.300">•</Text>
             <Text fontSize="xs" fontWeight="black" color="brand.500" textTransform="uppercase" letterSpacing="wider">
                {notification.type}
             </Text>
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default Notifications;
