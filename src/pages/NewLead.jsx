import React, { useState, useRef, useEffect } from "react";
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Icon, 
  FormControl, 
  FormLabel, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Select, 
  Textarea, 
  Button, 
  SimpleGrid,
  useToast,
  Divider,
  Center,
  Collapse,
  Switch,
  Badge,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip
} from "@chakra-ui/react";
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaList, 
  FaMapMarkerAlt, 
  FaSave,
  FaPlusCircle,
  FaChevronDown,
  FaChevronUp,
  FaFire,
  FaSnowflake,
  FaSun,
  FaCalendarAlt,
  FaEye,
  FaEdit,
  FaTrash,
  FaAngleLeft,
  FaAngleRight
} from "react-icons/fa";
import api from '../services/api';

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

const NewLead = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogData, setCatalogData] = useState({ products: [], parts: [], rentPlans: [], amcPlans: [] });

  const [formData, setFormData] = useState({
    id: null,
    customerName: "",
    phone: "",
    email: "",
    address: "",
    productInterest: "",
    selectedItem: "",
    source: "Field Visit",
    notes: "",
    leadStatus: "Warm",
    followUpDate: ""
  });
  
  const [productFilter, setProductFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("this_month");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedLead, setSelectedLead] = useState(null);
  
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchLeads();
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const [products, parts, rentPlans, amcPlans] = await Promise.all([
        api.get('/products'),
        api.get('/ro-parts'),
        api.get('/rental-plans'),
        api.get('/amc-plans'),
      ]);
      setCatalogData({
        products: products.data?.products || products.data || [],
        parts: parts.data?.roParts || parts.data || [],
        rentPlans: rentPlans.data?.plans || rentPlans.data || [],
        amcPlans: amcPlans.data?.plans || amcPlans.data || [],
      });
    } catch (err) {
      console.error('Catalog fetch error:', err);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leads');
      console.log('Leads Response:', response.data);
      const leads = response.data.leads || response.data || [];
      const data = Array.isArray(leads) ? leads : [];
      const formattedLeads = data.map((lead) => ({
        id: lead._id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email || 'N/A',
        product: lead.productInterest || 'General Inquiry',
        status: lead.leadStatus || 'Warm',
        location: lead.address || 'Unknown',
        date: new Date(lead.createdAt).toISOString().split('T')[0],
        notes: lead.notes || '',
        followUpDate: lead.followUpDate || ''
      }));
      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
      toast({ title: 'Failed to load leads', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const DATE_FILTERS = [
    { key: "this_month", label: "This Month" },
    { key: "last_month", label: "Last Month" },
    { key: "last_3_months", label: "Last 3 Months" },
  ];

  const getDateRange = (filter) => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    if (filter === "this_month") return { from: new Date(y, m, 1), to: now };
    if (filter === "last_month") return { from: new Date(y, m - 1, 1), to: new Date(y, m, 0, 23, 59, 59) };
    return { from: new Date(y, m - 2, 1), to: now };
  };

  const productCategories = ["All", "Product", "Part", "Rent", "AMC", "Water Testing", "Installation", "Service Paid Type", "Others", "Demo"];

  const { from: dateFrom, to: dateTo } = getDateRange(dateFilter);
  const dateFilteredLeads = leads.filter(l => {
    const d = new Date(l.date);
    return d >= dateFrom && d <= dateTo;
  });
  const filteredByProduct = productFilter === "All" ? dateFilteredLeads : dateFilteredLeads.filter(l => (l.product || 'General Inquiry') === productFilter);
  const statsTotal = filteredByProduct.length;
  const statsCompleted = filteredByProduct.filter(l => l.status === 'Completed').length;
  const statsPending = filteredByProduct.filter(l => l.status !== 'Completed').length;

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredByProduct.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredByProduct.length / itemsPerPage);

  const handleOpenCreate = () => {
      setModalMode("create");
      setFormData({
        id: null,
        customerName: "",
        phone: "",
        email: "",
        address: "",
        productInterest: "",
        selectedItem: "",
        source: "Field Visit",
        notes: "",
        leadStatus: "Warm",
        followUpDate: ""
      });
      setShowAdvanced(false);
      onOpen();
  };

  const handleOpenEdit = (lead) => {
      setModalMode("edit");
      setFormData({
          id: lead.id,
          customerName: lead.name,
          phone: lead.phone.replace("+91 ", ""),
          email: lead.email || "",
          address: lead.location,
          productInterest: lead.product,
          source: "Field Visit",
          notes: lead.notes || "",
          leadStatus: lead.status,
          followUpDate: lead.followUpDate || ""
      });
      setShowAdvanced(true);
      onOpen();
  };

  const handleOpenView = (lead) => {
      setSelectedLead(lead);
      onViewOpen();
  };

  const handleOpenDelete = (lead) => {
      setSelectedLead(lead);
      onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/leads/${selectedLead.id}`);
      toast({ title: "Lead Deleted", status: "error", duration: 3000 });
      fetchLeads();
      onDeleteClose();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({ title: "Failed to delete lead", status: "error", duration: 3000 });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    
    try {
      if (modalMode === "create") {
        const response = await api.post('/leads', {
          name: formData.customerName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          productInterest: formData.productInterest,
          selectedItem: formData.selectedItem || undefined,
          source: formData.source,
          notes: formData.notes,
          leadStatus: formData.leadStatus,
          followUpDate: formData.followUpDate
        });
        console.log('Lead created:', response.data);
        toast({ title: "Lead saved successfully.", status: "success", duration: 3000 });
      } else {
        const response = await api.put(`/leads/${formData.id}`, {
          name: formData.customerName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          productInterest: formData.productInterest,
          notes: formData.notes,
          leadStatus: formData.leadStatus,
          followUpDate: formData.followUpDate
        });
        console.log('Lead updated:', response.data);
        toast({ title: "Lead updated successfully.", status: "success", duration: 3000 });
      }
      await fetchLeads();
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save lead';
      toast({ title: errorMsg, status: "error", duration: 5000 });
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };


  return (
    <Box maxW="6xl" mx="auto" w="full">
      <VStack spacing={8} align="stretch">
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4}>
          <Flex direction="column" gap={1}>
            <Heading size="md" fontWeight="black" color="slate.800">Lead Management</Heading>
            <Text color="slate.500" fontSize="sm">Track and manage your field leads</Text>
          </Flex>

          <HStack spacing={3}>
            {/* Date Filter Dropdown */}
            <Select
              size="sm"
              borderRadius="xl"
              fontWeight="bold"
              fontSize="xs"
              bg="white"
              border="1px solid"
              borderColor="slate.200"
              w="36"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              _focus={{ borderColor: "brand.300" }}
            >
              {DATE_FILTERS.map(f => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </Select>

            <Button 
              onClick={handleOpenCreate}
            colorScheme="brand" 
            px={8} 
            h="12"
            borderRadius="xl" 
            boxShadow="lg"
            leftIcon={<FaPlusCircle />}
            fontSize="sm"
            fontWeight="bold"
            _active={{ transform: "scale(0.95)" }}
            >
              Add New Lead
            </Button>
          </HStack>
        </Flex>

        {/* Date Range Filter */}

          {/* Product Filter + Stats */}
        <Box>
          <HStack mb={4} spacing={2} flexWrap="wrap">
            {productCategories.map(cat => (
              <Button
                key={cat}
                size="sm"
                borderRadius="xl"
                fontSize="xs"
                fontWeight="bold"
                variant={productFilter === cat ? "solid" : "outline"}
                colorScheme={productFilter === cat ? "brand" : "gray"}
                onClick={() => { setProductFilter(cat); setCurrentPage(1); }}
              >
                {cat}
              </Button>
            ))}
          </HStack>

          <SimpleGrid columns={3} spacing={4}>
              <Box bg="white" border="1px solid" borderColor="slate.100" borderRadius="2xl" p={4} textAlign="center">
                <Text fontSize="2xl" fontWeight="black" color="slate.700">{statsTotal}</Text>
                <Text fontSize="xs" fontWeight="bold" color="slate.400" textTransform="uppercase">Total Leads</Text>
              </Box>
              <Box bg="white" border="1px solid" borderColor="green.100" borderRadius="2xl" p={4} textAlign="center">
                <Text fontSize="2xl" fontWeight="black" color="green.500">{statsCompleted}</Text>
                <Text fontSize="xs" fontWeight="bold" color="green.400" textTransform="uppercase">Completed</Text>
              </Box>
              <Box bg="white" border="1px solid" borderColor="orange.100" borderRadius="2xl" p={4} textAlign="center">
                <Text fontSize="2xl" fontWeight="black" color="orange.500">{statsPending}</Text>
                <Text fontSize="xs" fontWeight="bold" color="orange.400" textTransform="uppercase">Pending</Text>
              </Box>
            </SimpleGrid>

        </Box>

        {/* Leads Table */}
        <Box 
           bg="white" 
           borderRadius="3xl" 
           border="1px solid" 
           borderColor="slate.50" 
           boxShadow="sm" 
           overflow="hidden"
        >
           <Box overflowX="auto">
             <Table variant="simple" size="lg">
               <Thead bg="slate.50/50">
                 <Tr>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Lead Details</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Contact Info</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Product</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Status</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Location</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100" textAlign="right">Actions</Th>
                 </Tr>
               </Thead>
               <Tbody>
                 {currentItems.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={10} color="slate.400">
                        No leads found. Add a new lead to get started.
                      </Td>
                    </Tr>
                 ) : (
                   currentItems.map((lead) => (
                     <Tr key={lead.id} _hover={{ bg: "slate.50" }} transition="all 0.2s">
                       <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                          <HStack spacing={3}>
                             <Avatar size="sm" name={lead.name} bg="brand.50" color="brand.600" fontWeight="bold" />
                             <VStack align="start" spacing={0}>
                                <Text fontWeight="800" color="slate.700" fontSize="sm" whiteSpace="nowrap">{lead.name}</Text>
                                <Text fontSize="xs" fontWeight="bold" color="slate.400" whiteSpace="nowrap">ID: #LD-{lead.id}</Text>
                             </VStack>
                          </HStack>
                       </Td>
                       <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                          <HStack spacing={2} color="slate.600">
                             <Icon as={FaPhone} fontSize="xs" color="slate.400" />
                             <Text fontSize="sm" fontWeight="bold" whiteSpace="nowrap">{lead.phone}</Text>
                          </HStack>
                       </Td>
                       <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                          <Badge variant="outline" colorScheme="purple" px={2} py={0.5} borderRadius="md" fontSize="9px" fontWeight="black">
                            {lead.product}
                          </Badge>
                       </Td>
                       <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                          <Badge 
                            variant="subtle" 
                            colorScheme={lead.status === 'Hot' ? 'red' : lead.status === 'Warm' ? 'orange' : 'blue'} 
                            px={2} py={0.5} borderRadius="full" fontSize="9px" fontWeight="black" textTransform="uppercase"
                          >
                            {lead.status}
                          </Badge>
                       </Td>
                       <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                           <HStack spacing={1} color="slate.500">
                              <Icon as={FaMapMarkerAlt} fontSize="xs" />
                              <Text fontSize="xs" fontWeight="medium" noOfLines={1} maxW="150px">
                                {lead.location}
                              </Text>
                           </HStack>
                       </Td>
                       <Td py={5} borderBottom="1px solid" borderColor="slate.50" textAlign="right">
                          <HStack spacing={0} justify="flex-end">
                            <Tooltip label="View Details">
                                <IconButton 
                                    icon={<FaEye />} 
                                    variant="ghost" 
                                    size="sm" 
                                    borderRadius="lg" 
                                    color="slate.400"
                                    _hover={{ bg: "brand.50", color: "brand.500" }}
                                    aria-label="View Details"
                                    onClick={() => handleOpenView(lead)}
                                />
                            </Tooltip>
                            <Tooltip label="Edit Lead">
                                <IconButton 
                                    icon={<FaEdit />} 
                                    variant="ghost" 
                                    size="sm" 
                                    borderRadius="lg" 
                                    color="slate.400"
                                    _hover={{ bg: "blue.50", color: "blue.500" }}
                                    aria-label="Edit Lead"
                                    onClick={() => handleOpenEdit(lead)}
                                />
                            </Tooltip>
                            <Tooltip label="Delete Lead">
                                <IconButton 
                                    icon={<FaTrash />} 
                                    variant="ghost" 
                                    size="sm" 
                                    borderRadius="lg" 
                                    color="slate.400"
                                    _hover={{ bg: "red.50", color: "red.500" }}
                                    aria-label="Delete Lead"
                                    onClick={() => handleOpenDelete(lead)}
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
            {leads.length > 0 && (
                <Flex px={8} py={5} justify="space-between" align="center" borderTop="1px solid" borderColor="slate.50" bg="slate.50/30">
                    <Text fontSize="xs" fontWeight="bold" color="slate.500">
                        Showing <Text as="span" color="slate.800">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredByProduct.length)}</Text> of {filteredByProduct.length}
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

        {/* Add/Edit Lead Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
          <ModalOverlay bg="blackAlpha.200" backdropFilter="blur(2px)" />
          <ModalContent borderRadius="3xl" boxShadow="2xl">
            <ModalHeader py={6} px={8} borderBottom="1px solid" borderColor="slate.50">
                <Flex justify="space-between" align="center">
                   <Flex direction="column" gap={1}>
                     <Heading size="md" fontWeight="black" color="slate.800">
                        {modalMode === 'create' ? 'Add New Lead' : 'Edit Lead Details'}
                     </Heading>
                     <Text color="slate.500" fontSize="sm" fontWeight="medium">
                        {modalMode === 'create' ? 'Enter customer details below' : `Update information for ${formData.customerName}`}
                     </Text>
                   </Flex>
                   <HStack bg="slate.50" p={1} borderRadius="lg" border="1px solid" borderColor="slate.100" spacing={1}>
                      <Text fontSize="xs" fontWeight="bold" color={showAdvanced ? "brand.500" : "slate.400"} px={2}>
                        {showAdvanced ? "Advanced" : "Simple"}
                      </Text>
                      <Switch 
                        size="sm"
                        colorScheme="brand" 
                        isChecked={showAdvanced} 
                        onChange={(e) => setShowAdvanced(e.target.checked)} 
                      />
                   </HStack>
                </Flex>
            </ModalHeader>
            <ModalCloseButton mt={4} mr={4} borderRadius="full" />
            
            <ModalBody p={0}>
              <Box p={8}>
                <form id="lead-form" onSubmit={handleSubmit}>
                    <VStack spacing={6} align="stretch">
                    {/* Essential Fields */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <InputField 
                            label="Customer Name" 
                            icon={FaUser} 
                            placeholder="Enter full name" 
                            required 
                            value={formData.customerName}
                            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        />
                        <InputField 
                            label="Phone Number" 
                            icon={FaPhone} 
                            placeholder="+91 98765 XXXXX" 
                            required 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                        <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Product Interest</FormLabel>
                        <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none">
                            <Icon as={FaList} color="slate.300" />
                            </InputLeftElement>
                            <Select 
                            pl="12"
                            bg="slate.50"
                            border="1px solid"
                            borderColor="slate.100"
                            borderRadius="2xl"
                            _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
                            fontSize="sm"
                            fontWeight="semibold"
                            value={formData.productInterest}
                            onChange={(e) => setFormData({...formData, productInterest: e.target.value, selectedItem: ""})}
                            placeholder="Select product category"
                            >
                            <option value="Product">Product</option>
                            <option value="Part">Part</option>
                            <option value="Rent">Rent</option>
                            <option value="AMC">AMC</option>
                            <option value="Water Testing">Water Testing</option>
                            <option value="Installation">Installation</option>
                            <option value="Service Paid Type">Service Paid Type</option>
                            <option value="Others">Others</option>
                            <option value="Demo">Demo</option>
                            </Select>
                        </InputGroup>
                        </FormControl>

                        {/* Dynamic item selector for Product/Part/Rent/AMC */}
                        {["Product", "Part", "Rent", "AMC"].includes(formData.productInterest) && (() => {
                          const optionMap = {
                            Product: catalogData.products.map(p => ({ value: p._id, label: p.name })),
                            Part: catalogData.parts.map(p => ({ value: p._id, label: p.name })),
                            Rent: catalogData.rentPlans.map(p => ({ value: p._id, label: p.planName || p.name })),
                            AMC: catalogData.amcPlans.map(p => ({ value: p._id, label: p.planName || p.name })),
                          };
                          const options = optionMap[formData.productInterest] || [];
                          return (
                            <FormControl isRequired>
                              <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>
                                Select {formData.productInterest}
                              </FormLabel>
                              <InputGroup size="lg">
                                <InputLeftElement pointerEvents="none">
                                  <Icon as={FaList} color="slate.300" />
                                </InputLeftElement>
                                <Select
                                  pl="12"
                                  bg="slate.50"
                                  border="1px solid"
                                  borderColor="slate.100"
                                  borderRadius="2xl"
                                  _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  value={formData.selectedItem}
                                  onChange={(e) => setFormData({...formData, selectedItem: e.target.value})}
                                  placeholder={`Choose a ${formData.productInterest}`}
                                >
                                  {options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </Select>
                              </InputGroup>
                            </FormControl>
                          );
                        })()}
                        
                        <InputField 
                        label="Location / Area" 
                        icon={FaMapMarkerAlt} 
                        placeholder="Sector, Area or Pin Code" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                    </SimpleGrid>

                    {/* Advanced Fields Collapse */}
                    <Collapse in={showAdvanced} animateOpacity>
                        <VStack spacing={6} align="stretch" pt={2}>
                            <Divider borderColor="slate.50" />
                            <Flex align="center" gap={2}>
                            <Text fontSize="xs" fontWeight="black" color="slate.300" textTransform="uppercase" letterSpacing="widest">Advanced Details</Text>
                            <Divider flex={1} borderColor="slate.50" />
                            </Flex>

                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            {/* Lead Status Selection */}
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Lead Priority</FormLabel>
                                <SimpleGrid columns={3} spacing={3}>
                                    {["Hot", "Warm", "Cold"].map((status) => {
                                    const isActive = formData.leadStatus === status;
                                    const colors = { Hot: "red", Warm: "orange", Cold: "blue" };
                                    const icons = { Hot: FaFire, Warm: FaSun, Cold: FaSnowflake };
                                    const color = colors[status];
                                    
                                    return (
                                        <Button
                                        key={status}
                                        onClick={() => setFormData({...formData, leadStatus: status})}
                                        variant="outline"
                                        h="12"
                                        bg={isActive ? `${color}.50` : "white"}
                                        borderColor={isActive ? `${color}.200` : "slate.100"}
                                        color={isActive ? `${color}.600` : "slate.400"}
                                        _hover={{ bg: `${color}.50`, borderColor: `${color}.200` }}
                                        borderRadius="xl"
                                        leftIcon={<Icon as={icons[status]} />}
                                        fontSize="xs"
                                        >
                                            {status}
                                        </Button>
                                    );
                                    })}
                                </SimpleGrid>
                            </FormControl>

                            <InputField 
                                label="Email Address" 
                                icon={FaEnvelope} 
                                placeholder="customer@domain.com" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />

                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Follow-up Date</FormLabel>
                                <InputGroup size="lg">
                                    <InputLeftElement pointerEvents="none">
                                    <Icon as={FaCalendarAlt} color="slate.300" />
                                    </InputLeftElement>
                                    <Input 
                                        type="date"
                                        bg="slate.50"
                                        border="1px solid"
                                        borderColor="slate.100"
                                        borderRadius="2xl"
                                        _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        value={formData.followUpDate}
                                        onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                                    />
                                </InputGroup>
                            </FormControl>
                            </SimpleGrid>

                            <FormControl>
                            <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Additional Notes</FormLabel>
                            <Textarea 
                                p={4}
                                bg="slate.50"
                                border="1px solid"
                                borderColor="slate.100"
                                borderRadius="2xl"
                                _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "lg" }}
                                fontSize="sm"
                                fontWeight="semibold"
                                rows={4}
                                placeholder="Mention specific requirements, competitors, or meeting notes..."
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            />
                            </FormControl>
                        </VStack>
                    </Collapse>

                    {!showAdvanced && (
                        <Center>
                            <Button 
                            variant="ghost" 
                            size="sm" 
                            color="slate.400" 
                            rightIcon={<FaChevronDown />}
                            onClick={() => setShowAdvanced(true)}
                            fontSize="xs"
                            >
                            Add More Details
                            </Button>
                        </Center>
                    )}
                    </VStack>
                </form>
              </Box>
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="slate.50" py={5} px={8}>
                <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl" fontWeight="bold" color="slate.500">
                   Cancel
                </Button>
                <Button 
                   form="lead-form"
                   type="submit" 
                   colorScheme="brand" 
                   px={10} 
                   h="12"
                   borderRadius="xl" 
                   boxShadow="lg"
                   leftIcon={<FaSave />} 
                   fontWeight="bold"
                   _active={{ transform: "scale(0.95)" }}
                >
                   {modalMode === 'create' ? 'Save Lead' : 'Update Lead'}
                </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Details Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} isCentered size="lg">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
          <ModalContent borderRadius="3xl">
              <ModalHeader bg="brand.50" borderTopRadius="3xl" borderBottom="1px solid" borderColor="brand.100" py={6} px={8}>
                  <HStack spacing={4}>
                      <Avatar name={selectedLead?.name} size="md" bg="brand.500" color="white" />
                      <VStack align="start" spacing={0}>
                          <Heading size="md" color="brand.800">{selectedLead?.name}</Heading>
                          <Text fontSize="sm" color="brand.600" fontWeight="medium">Lead ID: #LD-{selectedLead?.id}</Text>
                      </VStack>
                  </HStack>
                  <ModalCloseButton position="absolute" right={6} top={6} borderRadius="full" />
              </ModalHeader>
              <ModalBody p={8}>
                  <VStack spacing={6} align="stretch">
                      <SimpleGrid columns={2} spacing={6}>
                          <Box>
                              <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" mb={1}>Phone</Text>
                              <HStack>
                                  <Icon as={FaPhone} color="slate.400" fontSize="xs" />
                                  <Text fontWeight="bold" color="slate.700">{selectedLead?.phone}</Text>
                              </HStack>
                          </Box>
                          <Box>
                              <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" mb={1}>Email</Text>
                              <HStack>
                                  <Icon as={FaEnvelope} color="slate.400" fontSize="xs" />
                                  <Text fontWeight="bold" color="slate.700">{selectedLead?.email || "N/A"}</Text>
                              </HStack>
                          </Box>
                          <Box>
                              <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" mb={1}>Location</Text>
                              <HStack>
                                  <Icon as={FaMapMarkerAlt} color="slate.400" fontSize="xs" />
                                  <Text fontWeight="bold" color="slate.700">{selectedLead?.location}</Text>
                              </HStack>
                          </Box>
                          <Box>
                              <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" mb={1}>Date Added</Text>
                              <HStack>
                                  <Icon as={FaCalendarAlt} color="slate.400" fontSize="xs" />
                                  <Text fontWeight="bold" color="slate.700">{selectedLead?.date}</Text>
                              </HStack>
                          </Box>
                      </SimpleGrid>
                      
                      <Divider borderColor="slate.100" />
                      
                      <Box>
                          <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" mb={3}>Interest & Status</Text>
                          <HStack spacing={4}>
                              <Badge colorScheme="purple" px={3} py={1} borderRadius="lg" fontSize="xs" display="flex" alignItems="center" gap={2}>
                                  <Icon as={FaList} /> {selectedLead?.product}
                              </Badge>
                              <Badge 
                                  colorScheme={selectedLead?.status === 'Hot' ? 'red' : selectedLead?.status === 'Warm' ? 'orange' : 'blue'} 
                                  px={3} py={1} borderRadius="lg" fontSize="xs" display="flex" alignItems="center" gap={2}
                              >
                                  <Icon as={selectedLead?.status === 'Hot' ? FaFire : selectedLead?.status === 'Warm' ? FaSun : FaSnowflake} /> 
                                  {selectedLead?.status} Priority
                              </Badge>
                          </HStack>
                      </Box>

                      {selectedLead?.notes && (
                          <Box bg="slate.50" p={4} borderRadius="xl" border="1px dashed" borderColor="slate.200">
                              <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" mb={1}>Notes</Text>
                              <Text fontSize="sm" color="slate.600">{selectedLead.notes}</Text>
                          </Box>
                      )}
                  </VStack>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor="slate.50" py={4}>
                  <Button w="full" onClick={onViewClose} borderRadius="xl" fontWeight="bold">Close Details</Button>
              </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
          <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(5px)">
            <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Lead
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure? This action cannot be undone. This will permanently delete the lead <b>{selectedLead?.name}</b>.
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
    </Box>
  );
};

export default NewLead;
