import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  IconButton, 
  Button, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge, 
  Icon, 
  Center,
  Circle,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useToast,
  List,
  ListItem,
  Avatar,
  Tooltip,
  Switch,
  Collapse,
  Divider,
  SimpleGrid,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt,
  FaClock,
  FaPhone,
  FaChevronDown,
  FaSave,
  FaTimes,
  FaAngleLeft,
  FaAngleRight
} from "react-icons/fa";

const InputField = ({ label, icon, ...props }) => (
  <FormControl>
    <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>{label}</FormLabel>
    <InputGroup size="lg">
      {icon && (
        <InputLeftElement pointerEvents="none">
          <Icon as={icon} color="slate.300" />
        </InputLeftElement>
      )}
      <Input 
        bg="slate.50"
        border="1px solid"
        borderColor="slate.100"
        borderRadius="2xl"
        _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
        fontSize="sm"
        fontWeight="semibold"
        {...props}
      />
    </InputGroup>
  </FormControl>
);

const ComplainTickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [sources, setSources] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals & Alerts
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();
  
  const toast = useToast();

  // State Management
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Search State
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Form State
  const [ticketData, setTicketData] = useState({
    type: "",
    priority: "Medium",
    description: "",
    status: "Open",
    scheduledDate: "",
    preferredTime: "",
    source: "Phone",
    assignedTechnician: "",
    resolutionNotes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/employee-dashboard/complaints');
        setTickets(data.complaints || []);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast({ title: 'Failed to load tickets', status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    const fetchTicketTypes = async () => {
      try {
        const { data } = await api.get('/employee-dashboard/ticket-types');
        setTicketTypes(data.ticketTypes || []);
      } catch (error) {
        console.error('Failed to fetch ticket types:', error);
      }
    };
    const fetchMetadata = async () => {
      try {
        const { data } = await api.get('/employee-dashboard/ticket-metadata');
        setPriorities(data.priorities || ['Low', 'Medium', 'High']);
        setStatuses(data.statuses || ['Open', 'In Progress', 'Closed']);
        setSources(data.sources || ['Phone', 'Email', 'Whatsapp']);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
        setPriorities(['Low', 'Medium', 'High']);
        setStatuses(['Open', 'In Progress', 'Closed']);
        setSources(['Phone', 'Email', 'Whatsapp']);
      }
    };
    fetchTicketTypes();
    fetchMetadata();
  }, []);

  useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const { data } = await api.get(`/orders/customers?search=${encodeURIComponent(customerSearchQuery)}`);
        setSearchResults(data || []);
      } catch (error) {
        console.error('Failed to search customers:', error);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(searchCustomers, 300);
    return () => clearTimeout(timeoutId);
  }, [customerSearchQuery]);

  // Handlers
  const handleOpenCreate = () => {
      setModalMode("create");
      setTicketData({ 
        type: ticketTypes[0] || "", 
        priority: priorities[1] || "Medium", 
        description: "", 
        status: statuses[0] || "Open", 
        scheduledDate: "", 
        preferredTime: "", 
        source: sources[0] || "Phone",
        assignedTechnician: "",
        resolutionNotes: ""
      });
      setSelectedCustomer(null);
      setCustomerSearchQuery("");
      onOpen();
  };

  const handleOpenEdit = (ticket) => {
      setModalMode("edit");
      setSelectedTicket(ticket);
      setTicketData({
          type: ticket.type,
          priority: ticket.priority,
          description: ticket.description || "",
          status: ticket.status,
          scheduledDate: ticket.scheduledDate || "",
          preferredTime: ticket.preferredTime || "",
          source: ticket.source || "Phone",
          assignedTechnician: ticket.assignedTechnician || "",
          resolutionNotes: ticket.resolutionNotes || ""
      });
      setSelectedCustomer({ name: ticket.customerName, mobile: ticket.customerMobile });
      onOpen();
  };

  const handleOpenView = (ticket) => {
      setSelectedTicket(ticket);
      onViewOpen();
  };

  const handleOpenDelete = (ticket) => {
      setSelectedTicket(ticket);
      onDeleteOpen();
  };

  const handleSubmitTicket = async () => {
    if (!selectedCustomer) {
      toast({ title: "Please select a customer", status: "warning" });
      return;
    }
    if (!ticketData.description) {
      toast({ title: "Please enter a description", status: "warning" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (modalMode === "create") {
        const { data } = await api.post('/employee-dashboard/complaints', {
          customerMobile: selectedCustomer.mobile,
          ...ticketData
        });
        setTickets([data.complaint, ...tickets]);
        toast({ title: "Ticket Created!", status: "success", duration: 3000 });
      } else {
        const { data } = await api.put(`/employee-dashboard/complaints/${selectedTicket.ticketId}`, ticketData);
        const updatedTickets = tickets.map(t => 
          t.ticketId === selectedTicket.ticketId ? data.complaint : t
        );
        setTickets(updatedTickets);
        toast({ title: "Ticket Updated!", status: "success", duration: 3000 });
      }
      onClose();
      setShowAdvanced(false);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      toast({ title: "Failed to save ticket", status: "error", duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/employee-dashboard/complaints/${selectedTicket.ticketId}`);
      const filtered = tickets.filter(t => t.ticketId !== selectedTicket.ticketId);
      setTickets(filtered);
      toast({ title: "Ticket Deleted", status: "success", duration: 3000 });
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      toast({ title: "Failed to delete ticket", status: "error", duration: 3000 });
    } finally {
      onDeleteClose();
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      "Open": { bg: "red.50", color: "red.500", label: "Open" },
      "In Progress": { bg: "orange.50", color: "orange.500", label: "In Progress" },
      "Closed": { bg: "green.50", color: "green.600", label: "Closed" },
      "Resolved": { bg: "blue.50", color: "blue.500", label: "Resolved" }
    };
    const style = styles[status] || { bg: "slate.50", color: "slate.500", label: status };
    return (
      <Badge 
        bg={style.bg} color={style.color} px={3} py={1.5} borderRadius="full" 
        fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="0.05em"
        border="1px solid" borderColor="transparent"
      >
        {style.label}
      </Badge>
    );
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customerMobile?.includes(searchTerm)
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header */}
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="md" fontWeight="black" color="slate.800">Complain Tickets</Heading>
          <Text color="slate.500" fontSize="sm">Manage and track customer support tickets</Text>
        </VStack>
        {/* <Button 
          onClick={handleOpenCreate}
          leftIcon={<FaPlus />} 
          colorScheme="brand" 
          boxShadow="lg" 
          px={6} h="12" borderRadius="xl" fontWeight="bold"
          _active={{ transform: "scale(0.95)" }}
        >
          New Ticket
        </Button> */}
      </Flex>

      {/* Filters Area */}
      <Flex gap={4} p={1}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none" h="12">
            <Icon as={FaSearch} color="slate.300" />
          </InputLeftElement>
          <Input 
            h="12" placeholder="Search by ticket ID, customer name..." bg="white"
            borderRadius="2xl" border="1px solid" borderColor="slate.100"
            _focus={{ borderColor: "brand.300", boxShadow: "lg" }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset to page 1 on search
          />
        </InputGroup>
        <Button 
          variant="outline" h="12" px={6} borderRadius="2xl" borderColor="slate.100" 
          color="slate.600" bg="white" leftIcon={<FaFilter />}
          _hover={{ bg: "slate.50", borderColor: "slate.200" }}
        >
          Filters
        </Button>
      </Flex>

      {/* Table Container */}
      <Box bg="white" borderRadius="3xl" border="1px solid" borderColor="slate.50" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="lg">
            <Thead bg="slate.50/50">
              <Tr>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Ticket ID</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Customer</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Priority</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Status</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Date</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100" textAlign="right">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.length === 0 ? (
                <Tr>
                  <Td colSpan={6} borderBottom="none">
                    <Center py={12}>
                      <VStack spacing={3}>
                        <Circle size="12" bg="slate.50"><Icon as={FaSearch} color="slate.300" /></Circle>
                        <Text color="slate.500" fontSize="sm" fontWeight="medium">No tickets found matching your search.</Text>
                      </VStack>
                    </Center>
                  </Td>
                </Tr>
              ) : (
                currentItems.map((ticket, index) => (
                  <Tr key={ticket.ticketId || index} _hover={{ bg: "slate.50" }} transition="all 0.2s">
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="800" color="slate.700" fontSize="sm">{ticket.ticketId}</Text>
                        <Badge variant="subtle" colorScheme="purple" fontSize="8px" px={2} borderRadius="md">{ticket.type}</Badge>
                      </VStack>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      <HStack>
                        <Avatar size="xs" name={ticket.customerName} bg="brand.50" color="brand.600" fontWeight="bold" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="700" color="slate.600" fontSize="sm">{ticket.customerName}</Text>
                          <Text fontSize="xs" fontWeight="medium" color="slate.400">{ticket.customerMobile}</Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      <HStack spacing={1}>
                          <Circle size={2} bg={ticket.priority === 'High' ? 'red.500' : ticket.priority === 'Medium' ? 'orange.500' : 'emerald.400'} />
                          <Text fontSize="xs" fontWeight="bold" color="slate.600">{ticket.priority}</Text>
                      </HStack>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      {getStatusBadge(ticket.status)}
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      <Text fontSize="xs" fontWeight="700" color="slate.500" letterSpacing="0.02em">
                        {new Date(ticket.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50" textAlign="right">
                      <HStack spacing={1} justify="flex-end">
                        <Tooltip label="View Details" hasArrow>
                          <IconButton 
                            icon={<FaEye />} onClick={() => handleOpenView(ticket)}
                            variant="ghost" size="sm" color="slate.400" borderRadius="lg"
                            _hover={{ bg: "brand.50", color: "brand.500" }} aria-label="View"
                          />
                        </Tooltip>
                        <Tooltip label="Edit Ticket" hasArrow>
                          <IconButton 
                            icon={<FaEdit />} onClick={() => handleOpenEdit(ticket)}
                            variant="ghost" size="sm" color="slate.400" borderRadius="lg"
                            _hover={{ bg: "blue.50", color: "blue.500" }} aria-label="Edit"
                          />
                        </Tooltip>
                        <Tooltip label="Delete Ticket" hasArrow>
                          <IconButton 
                            icon={<FaTrash />} onClick={() => handleOpenDelete(ticket)}
                            variant="ghost" size="sm" color="slate.400" borderRadius="lg"
                            _hover={{ bg: "red.50", color: "red.500" }} aria-label="Delete"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
        
        {/* Pagination Footer */}
        {filteredTickets.length > 0 && (
            <Flex px={8} py={5} justify="space-between" align="center" borderTop="1px solid" borderColor="slate.50" bg="slate.50/30">
                <Text fontSize="xs" fontWeight="bold" color="slate.500">
                    Showing <Text as="span" color="slate.800">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTickets.length)}</Text> of {filteredTickets.length}
                </Text>
                <HStack spacing={2}>
                    <Button 
                        size="sm" variant="outline" bg="white" borderColor="slate.200" color="slate.600" fontSize="xs" borderRadius="lg"
                        leftIcon={<FaAngleLeft />}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        isDisabled={currentPage === 1}
                        _hover={{ bg: "white", borderColor: "brand.300", color: "brand.500" }}
                    >
                        Previous
                    </Button>
                    <HStack spacing={1}>
                        {[...Array(totalPages).keys()].map(number => (
                            <Button
                                key={number + 1}
                                size="sm"
                                borderRadius="lg"
                                fontSize="xs"
                                bg={currentPage === number + 1 ? "brand.500" : "transparent"}
                                color={currentPage === number + 1 ? "white" : "slate.500"}
                                _hover={{ bg: currentPage === number + 1 ? "brand.600" : "slate.100" }}
                                onClick={() => setCurrentPage(number + 1)}
                                w="8" h="8" p={0}
                            >
                                {number + 1}
                            </Button>
                        ))}
                    </HStack>
                    <Button 
                        size="sm" variant="outline" bg="white" borderColor="slate.200" color="slate.600" fontSize="xs" borderRadius="lg"
                        rightIcon={<FaAngleRight />}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        isDisabled={currentPage === totalPages}
                        _hover={{ bg: "white", borderColor: "brand.300", color: "brand.500" }}
                    >
                        Next
                    </Button>
                </HStack>
            </Flex>
        )}
      </Box>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.200" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="3xl" boxShadow="2xl">
          <ModalHeader py={6} px={8} borderBottom="1px solid" borderColor="slate.50">
            <Flex justify="space-between" align="center">
               <Flex direction="column" gap={1}>
                 <Heading size="md" fontWeight="black" color="slate.800">
                     {modalMode === 'create' ? 'Create New Ticket' : 'Edit Ticket'}
                 </Heading>
                 <Text color="slate.500" fontSize="sm" fontWeight="medium">
                    {modalMode === 'create' ? 'Enter ticket details below' : `Updating ${selectedTicket?.ticketId}`}
                 </Text>
               </Flex>
               <HStack bg="slate.50" p={1} borderRadius="lg" border="1px solid" borderColor="slate.100" spacing={1}>
                  <Text fontSize="xs" fontWeight="bold" color={showAdvanced ? "brand.500" : "slate.400"} px={2}>
                    {showAdvanced ? "Advanced" : "Simple"}
                  </Text>
                  <Switch size="sm" colorScheme="brand" isChecked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} />
               </HStack>
            </Flex>
          </ModalHeader>
          {/* <ModalCloseButton mt={-1} mr={4} borderRadius="full" /> */}
          
          <ModalBody p={0}>
             <Box p={8}>
               <VStack spacing={6} align="stretch">
                 <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired gridColumn={{ base: "span 1", md: "span 2" }}>
                        <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Customer</FormLabel>
                        {!selectedCustomer ? (
                            <Box position="relative">
                                <InputGroup size="lg">
                                <InputLeftElement pointerEvents="none"><Icon as={FaSearch} color="slate.300" /></InputLeftElement>
                                <Input 
                                    placeholder="Search customer by name or mobile..." 
                                    value={customerSearchQuery}
                                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                    borderRadius="2xl" bg="slate.50" border="1px solid" borderColor="slate.100" fontWeight="semibold"
                                    _focus={{ borderColor: "brand.300", bg: "white", boxShadow: "lg" }}
                                />
                                </InputGroup>
                                {searchResults.length > 0 && (
                                <Box position="absolute" top="100%" left={0} right={0} bg="white" mt={2} borderRadius="2xl" boxShadow="2xl" zIndex={100} maxH="250px" overflowY="auto" border="1px solid" borderColor="slate.100">
                                    <List spacing={0}>
                                    {searchResults.map((customer) => (
                                        <ListItem 
                                            key={customer._id} px={4} py={3} cursor="pointer" borderBottom="1px solid" borderColor="slate.50" transition="all 0.2s"
                                            _hover={{ bg: "brand.50" }}
                                            onClick={() => { setSelectedCustomer(customer); setSearchResults([]); setCustomerSearchQuery(""); }}
                                        >
                                            <HStack>
                                                <Avatar size="sm" name={customer.name} bg="brand.100" color="brand.600" />
                                                <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight="bold" color="slate.700">{customer.name}</Text>
                                                <Text fontSize="xs" color="slate.400" fontWeight="medium">{customer.mobile}</Text>
                                                </VStack>
                                            </HStack>
                                        </ListItem>
                                    ))}
                                    </List>
                                </Box>
                                )}
                            </Box>
                        ) : (
                            <Flex p={3} bg="brand.50" borderRadius="2xl" border="1px solid" borderColor="brand.200" justify="space-between" align="center">
                                <HStack>
                                <Avatar size="sm" name={selectedCustomer.name} bg="white" color="brand.500" />
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="bold" color="brand.900">{selectedCustomer.name}</Text>
                                    <Text fontSize="xs" color="brand.600" fontWeight="medium">{selectedCustomer.mobile}</Text>
                                </VStack>
                                </HStack>
                                <IconButton size="sm" variant="ghost" colorScheme="red" icon={<FaTimes />} onClick={() => setSelectedCustomer(null)} borderRadius="full" />
                            </Flex>
                        )}
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Complaint Type</FormLabel>
                      <Select 
                        size="lg" bg="slate.50" border="1px solid" borderColor="slate.100" borderRadius="2xl"
                        _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
                        fontSize="sm" fontWeight="semibold"
                        value={ticketData.type} onChange={(e) => setTicketData({...ticketData, type: e.target.value})}
                      >
                        {ticketTypes.length > 0 ? (
                          ticketTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))
                        ) : (
                          <option value="Repair">Repair</option>
                        )}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Status</FormLabel>
                         <Select 
                            size="lg" bg="slate.50" border="1px solid" borderColor="slate.100" borderRadius="2xl"
                            _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
                            fontSize="sm" fontWeight="semibold"
                            value={ticketData.status} onChange={(e) => setTicketData({...ticketData, status: e.target.value})}
                        >
                            {statuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                        </Select>
                    </FormControl>
                 </SimpleGrid>

                 <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Description</FormLabel>
                    <Textarea 
                      placeholder="Describe the issue in detail..." p={4} bg="slate.50" border="1px solid" borderColor="slate.100" borderRadius="2xl"
                      _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
                      fontSize="sm" fontWeight="semibold" rows={3}
                      value={ticketData.description} onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                    />
                 </FormControl>

                 <Collapse in={showAdvanced} animateOpacity>
                    <VStack spacing={6} align="stretch" pt={2}>
                        <Divider borderColor="slate.50" />
                        <Flex align="center" gap={2}><Text fontSize="xs" fontWeight="black" color="slate.300" textTransform="uppercase" letterSpacing="widest">Advanced Details</Text><Divider flex={1} borderColor="slate.50" /></Flex>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Priority</FormLabel>
                                <Select 
                                    size="lg" bg="slate.50" border="1px solid" borderColor="slate.100" borderRadius="2xl"
                                    _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
                                    fontSize="sm" fontWeight="semibold"
                                    value={ticketData.priority} onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
                                >
                                    {priorities.map((priority) => (
                                      <option key={priority} value={priority}>{priority}</option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Ticket Source</FormLabel>
                                <Select 
                                    size="lg" bg="slate.50" border="1px solid" borderColor="slate.100" borderRadius="2xl"
                                    _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
                                    fontSize="sm" fontWeight="semibold"
                                    value={ticketData.source} onChange={(e) => setTicketData({...ticketData, source: e.target.value})}
                                >
                                    {sources.map((source) => (
                                      <option key={source} value={source}>{source === 'Phone' ? 'Phone Call' : source}</option>
                                    ))}
                                </Select>
                            </FormControl>

                            <InputField type="date" label="Scheduled Date" icon={FaCalendarAlt} value={ticketData.scheduledDate} onChange={(e) => setTicketData({...ticketData, scheduledDate: e.target.value})} />
                            <InputField type="time" label="Preferred Time" icon={FaClock} value={ticketData.preferredTime} onChange={(e) => setTicketData({...ticketData, preferredTime: e.target.value})} />
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Assigned Technician</FormLabel>
                                <Input 
                                    placeholder="Technician name (optional)"
                                    borderRadius="2xl"
                                    bg="slate.50"
                                    border="1px solid"
                                    borderColor="slate.100"
                                    fontWeight="semibold"
                                    _focus={{ borderColor: "brand.300", bg: "white", boxShadow: "lg" }}
                                    value={ticketData.assignedTechnician}
                                    onChange={(e) => setTicketData({...ticketData, assignedTechnician: e.target.value})}
                                />
                            </FormControl>
                        </SimpleGrid>

                        <FormControl>
                            <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Resolution Notes</FormLabel>
                            <Textarea 
                                placeholder="Add resolution notes or updates..."
                                borderRadius="2xl"
                                bg="slate.50"
                                border="1px solid"
                                borderColor="slate.100"
                                fontWeight="semibold"
                                _focus={{ borderColor: "brand.300", bg: "white", boxShadow: "lg" }}
                                rows={3}
                                value={ticketData.resolutionNotes}
                                onChange={(e) => setTicketData({...ticketData, resolutionNotes: e.target.value})}
                            />
                        </FormControl>
                    </VStack>
                 </Collapse>
                 
                 {!showAdvanced && (
                    <Center>
                        <Button variant="ghost" size="sm" color="slate.400" rightIcon={<FaChevronDown />} onClick={() => setShowAdvanced(true)} fontSize="xs">
                        Add Advanced Details
                        </Button>
                    </Center>
                )}
               </VStack>
             </Box>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="slate.50" py={5} px={8}>
             <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl" fontWeight="bold" color="slate.500">Cancel</Button>
             <Button 
               colorScheme="brand" onClick={handleSubmitTicket} isLoading={isSubmitting} borderRadius="xl" fontWeight="bold" px={10} h="12" boxShadow="lg" leftIcon={<FaSave />}
               _active={{ transform: "scale(0.95)" }}
             >
               {modalMode === 'create' ? 'Create Ticket' : 'Update Ticket'}
             </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.200" backdropFilter="blur(2px)" />
        <ModalContent borderRadius="3xl" boxShadow="2xl">
           {selectedTicket && (
               <>
                <ModalHeader bg="slate.50" borderBottom="1px solid" borderColor="slate.100" py={6} borderTopRadius="3xl">
                    <Flex justify="space-between" align="start">
                        <VStack align="start" spacing={1}>
                            <Heading size="md" color="slate.800" fontWeight="black">{selectedTicket.ticketId}</Heading>
                            <Badge colorScheme={selectedTicket.priority === 'High' ? 'red' : 'brand'} borderRadius="md">{selectedTicket.time || '10:30 AM'}</Badge> 
                        </VStack>
                        <ModalCloseButton position="static" borderRadius="full" />
                    </Flex>
                </ModalHeader>
                <ModalBody p={8}>
                    <VStack align="stretch" spacing={6}>
                       <Box>
                          <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" letterSpacing="widest" mb={3}>Customer Details</Text>
                          <HStack spacing={4}>
                             <Avatar name={selectedTicket.customerName} size="md" bg="brand.50" color="brand.500" />
                             <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" color="slate.800">{selectedTicket.customerName}</Text>
                                <HStack spacing={2} color="slate.500">
                                    <Icon as={FaPhone} fontSize="xs" />
                                    <Text fontSize="sm">{selectedTicket.customerMobile}</Text>
                                </HStack>
                             </VStack>
                          </HStack>
                       </Box>
                       <Divider borderColor="slate.50" />
                       <Box>
                          <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" letterSpacing="widest" mb={3}>Ticket Information</Text>
                          <SimpleGrid columns={2} spacing={4}>
                              <Box>
                                  <Text fontSize="xs" color="slate.400">Type</Text>
                                  <Text fontWeight="bold" color="slate.700">{selectedTicket.type}</Text>
                              </Box>
                              <Box>
                                  <Text fontSize="xs" color="slate.400">Status</Text>
                                  <Badge colorScheme={selectedTicket.status === 'Open' ? 'red' : 'green'}>{selectedTicket.status}</Badge>
                              </Box>
                              <Box>
                                  <Text fontSize="xs" color="slate.400">Scheduled Date</Text>
                                  <Text fontWeight="bold" color="slate.700">{selectedTicket.scheduledDate || 'Not Scheduled'}</Text>
                              </Box>
                              <Box>
                                  <Text fontSize="xs" color="slate.400">Priority</Text>
                                  <Text fontWeight="bold" color={selectedTicket.priority === 'High' ? 'red.500' : 'slate.700'}>{selectedTicket.priority}</Text>
                              </Box>
                          </SimpleGrid>
                       </Box>
                       <Box bg="slate.50" p={4} borderRadius="xl">
                           <Text fontSize="xs" color="slate.400" mb={1} fontWeight="bold">DESCRIPTION</Text>
                           <Text fontSize="sm" color="slate.600" lineHeight="tall">
                               {selectedTicket.description || "No description provided."}
                           </Text>
                       </Box>
                    </VStack>
                </ModalBody>
               </>
           )}
        </ModalContent>
      </Modal>

      {/* Delete Alert Dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(2px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Ticket
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This action cannot be undone. This will permanently delete ticket <b>{selectedTicket?.ticketId}</b>.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose} borderRadius="xl" fontWeight="bold">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3} borderRadius="xl" fontWeight="bold">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

    </VStack>
  );
};

export default ComplainTickets;
