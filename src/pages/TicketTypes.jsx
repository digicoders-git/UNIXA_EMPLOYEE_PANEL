import api from '../services/api';
import React, { useState, useRef, useEffect } from "react";
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Icon, 
  Button, 
  IconButton,
  SimpleGrid, 
  Badge, 
  Divider,
  Center,
  Progress,
  Tooltip,
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
  Input,
  Select,
  Textarea,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Collapse,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
import { 
  FaPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaWrench,
  FaFilter,
  FaBolt,
  FaClipboardList,
  FaTag,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaChevronDown,
  FaSave,
  FaAngleLeft,
  FaAngleRight
} from "react-icons/fa";

const TicketTypes = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();
  const cancelRef = useRef();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [types, setTypes] = useState([]);

  useEffect(() => {
    fetchTicketTypesData();
  }, []);

  const fetchTicketTypesData = async () => {
    try {
      setLoading(true);
      const [typesRes, complaintsRes] = await Promise.all([
        api.get('/employee-dashboard/ticket-types'),
        api.get('/employee-dashboard/complaints')
      ]);

      const ticketTypes = typesRes.data.ticketTypes || [];
      const complaints = complaintsRes.data.complaints || [];

      const iconMap = {
        'AMC': FaClipboardList,
        'Annual': FaClipboardList,
        'Maintenance': FaClipboardList,
        'Installation': FaPlus,
        'Install': FaPlus,
        'Repair': FaBolt,
        'Emergency': FaBolt,
        'Filter': FaFilter,
        'Service': FaWrench,
        'Warranty': FaCheckCircle,
        'Lead': FaUserPlus,
        'Sales': FaUserPlus
      };

      const colorMap = ['brand', 'blue', 'red', 'purple', 'cyan', 'orange', 'green', 'teal', 'pink'];

      const typesWithStats = ticketTypes.map((typeName, index) => {
        const typeComplaints = complaints.filter(c => c.type === typeName);
        const pending = typeComplaints.filter(c => c.status === 'Open' || c.status === 'In Progress').length;
        const resolved = typeComplaints.filter(c => c.status === 'Resolved').length;
        const progress = typeComplaints.length > 0 ? Math.round((resolved / typeComplaints.length) * 100) : 0;

        const iconKey = Object.keys(iconMap).find(key => typeName.toUpperCase().includes(key.toUpperCase()));
        
        return {
          id: index + 1,
          name: typeName,
          sub: typeName.split(' ').slice(0, 2).join(' '),
          icon: iconMap[iconKey] || FaTag,
          count: typeComplaints.length,
          pending: pending,
          avgTime: typeComplaints.length > 0 ? 'N/A' : 'N/A',
          color: colorMap[index % colorMap.length],
          desc: `Service tickets for ${typeName.toLowerCase()}`,
          progress: progress
        };
      });

      setTypes(typesWithStats);
    } catch (error) {
      console.error('Failed to fetch ticket types:', error);
      toast({ title: 'Failed to load data', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    sub: "",
    desc: "",
    color: "brand",
    avgTime: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = types.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(types.length / itemsPerPage);

  // Actions
  const handleOpenCreate = () => {
      setModalMode("create");
      setCategoryForm({ name: "", sub: "", desc: "", color: "brand", avgTime: "" });
      setShowAdvanced(false);
      onOpen();
  };

  const handleOpenEdit = (type) => {
      setModalMode("edit");
      setSelectedType(type);
      setCategoryForm({
          name: type.name,
          sub: type.sub,
          desc: type.desc,
          color: type.color,
          avgTime: type.avgTime
      });
      setShowAdvanced(true); // Usually need advanced fields for editing
      onOpen();
  };

  const handleOpenView = (type) => {
      setSelectedType(type);
      onViewOpen();
  };

  const handleOpenDelete = (type) => {
      setSelectedType(type);
      onDeleteOpen();
  };

  const handleDeleteConfirm = () => {
      const filtered = types.filter(t => t.id !== selectedType.id);
      setTypes(filtered);
      // Adjust pagination if needed
      if ((currentPage - 1) * itemsPerPage >= filtered.length && currentPage > 1) {
          setCurrentPage(currentPage - 1);
      }
      toast({ title: "Category Deleted", status: "error", duration: 3000 });
      onDeleteClose();
  };

  const handleSubmitCategory = () => {
    if (!categoryForm.name || !categoryForm.sub) {
      toast({ title: "Please fill required fields", status: "warning" });
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
        if (modalMode === "create") {
            const newCat = {
                id: types.length + 1,
                name: categoryForm.name,
                sub: categoryForm.sub,
                icon: FaTag, // Default icon
                count: 0,
                pending: 0,
                avgTime: categoryForm.avgTime || "N/A",
                color: categoryForm.color,
                desc: categoryForm.desc || "No description provided",
                progress: 0
            };
            setTypes([...types, newCat]);
            toast({ title: "Category Created Successfully", status: "success", duration: 3000 });
        } else {
            const updatedTypes = types.map(t => 
                t.id === selectedType.id 
                ? { ...t, ...categoryForm } 
                : t
            );
            setTypes(updatedTypes);
            toast({ title: "Category Updated Successfully", status: "success", duration: 3000 });
        }

        setIsSubmitting(false);
        onClose();
        setCategoryForm({ name: "", sub: "", desc: "", color: "brand", avgTime: "" });
    }, 800);
  };

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header Section */}
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="md" fontWeight="black" color="slate.800">Ticket Categories</Heading>
          <Text color="slate.500" fontSize="sm">Overview of service types, active loads, and performance metrics</Text>
        </VStack>
        <HStack>
             <Button variant="outline" size="sm" borderRadius="xl" leftIcon={<FaFilter />} color="slate.500">Filter View</Button>
             <Button onClick={handleOpenCreate} colorScheme="brand" size="sm" borderRadius="xl" leftIcon={<FaPlus />} fontWeight="bold">Add Category</Button>
        </HStack>
      </Flex>

      {/* Table Layout */}
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
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Category Name</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Description</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Total Tickets</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100" minW="150px">Performance</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Pending</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100" textAlign="right">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.length === 0 ? (
                <Tr>
                  <Td colSpan={6} borderBottom="none">
                     <Center py={12}>
                        <Text color="slate.500" fontSize="sm" fontWeight="medium">No categories found.</Text>
                     </Center>
                  </Td>
                </Tr>
              ) : (
                currentItems.map((type) => (
                  <Tr key={type.id} _hover={{ bg: "slate.50" }} transition="all 0.2s">
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      <HStack spacing={4}>
                         <Center 
                            w={10} h={10} bg={`${type.color}.50`} color={`${type.color}.500`} 
                            borderRadius="xl" shadow="sm"
                         >
                            <Icon as={type.icon || FaTag} fontSize="lg" />
                         </Center>
                         <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="800" color="slate.700">{type.name}</Text>
                            <Text fontSize="xs" fontWeight="bold" color="slate.400" textTransform="uppercase">{type.sub}</Text>
                         </VStack>
                      </HStack>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50" maxW="300px">
                      <Text fontSize="xs" color="slate.500" fontWeight="medium" noOfLines={2}>
                        {type.desc}
                      </Text>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                       <Badge 
                          variant="subtle" 
                          colorScheme={type.color} 
                          borderRadius="full" 
                          px={3} 
                          py={1} 
                          fontSize="10px" 
                          fontWeight="800"
                       >
                          {type.count} Tickets
                       </Badge>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                       <VStack align="stretch" spacing={2} maxW="150px">
                          <Flex justify="space-between" align="center">
                             <HStack spacing={1}>
                                <Icon as={FaClock} fontSize="xs" color="slate.400" />
                                <Text fontSize="xs" fontWeight="bold" color="slate.500">{type.avgTime} avg</Text>
                             </HStack>
                             <Text fontSize="xs" fontWeight="black" color="slate.700">{type.progress}%</Text>
                          </Flex>
                          <Progress value={type.progress} size="xs" colorScheme={type.color} borderRadius="full" bg="slate.100" />
                       </VStack>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                       <HStack spacing={2}>
                          <Icon as={FaExclamationCircle} color={type.pending > 5 ? "red.400" : "emerald.400"} fontSize="xs" />
                          <Text fontSize="xs" fontWeight="bold" color="slate.600">
                             {type.pending} Pending
                          </Text>
                       </HStack>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50" textAlign="right">
                        <HStack spacing={1} justify="flex-end">
                            <Tooltip label="View Details" hasArrow>
                                <IconButton 
                                    aria-label="View" 
                                    icon={<FaEye />} 
                                    onClick={() => handleOpenView(type)}
                                    variant="ghost" 
                                    size="sm" 
                                    color="slate.400" 
                                    borderRadius="lg"
                                    _hover={{ bg: "brand.50", color: "brand.500" }}
                                />
                            </Tooltip>
                            <Tooltip label="Edit Category" hasArrow>
                                <IconButton 
                                    aria-label="Edit" 
                                    icon={<FaEdit />} 
                                    onClick={() => handleOpenEdit(type)}
                                    variant="ghost" 
                                    size="sm" 
                                    color="slate.400" 
                                    borderRadius="lg"
                                    _hover={{ bg: "blue.50", color: "blue.500" }}
                                />
                            </Tooltip>
                            <Tooltip label="Delete Category" hasArrow>
                                <IconButton 
                                    aria-label="Delete" 
                                    icon={<FaTrash />} 
                                    onClick={() => handleOpenDelete(type)}
                                    variant="ghost" 
                                    size="sm" 
                                    color="slate.400" 
                                    borderRadius="lg"
                                    _hover={{ bg: "red.50", color: "red.500" }}
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
        {types.length > 0 && (
            <Flex px={8} py={5} justify="space-between" align="center" borderTop="1px solid" borderColor="slate.50" bg="slate.50/30">
                <Text fontSize="xs" fontWeight="bold" color="slate.500">
                    Showing <Text as="span" color="slate.800">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, types.length)}</Text> of {types.length}
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

      {/* Add/Edit Category Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl" mx={4}>
             <ModalHeader borderBottom="1px solid" borderColor="slate.50" py={6} px={8}>
                <Flex justify="space-between" align="center">
                   <HStack>
                     <Circle size={10} bg="brand.50" color="brand.500">
                       <Icon as={FaPlus} />
                     </Circle>
                     <VStack align="start" spacing={0}>
                       <Text fontSize="lg" fontWeight="black" color="slate.800">
                           {modalMode === 'create' ? 'Add Category' : 'Edit Category'}
                       </Text>
                       <Text fontSize="xs" color="slate.500" fontWeight="medium">
                           {modalMode === 'create' ? 'New ticket classification' : `Update details for ${selectedType?.name}`}
                       </Text>
                     </VStack>
                   </HStack>
                   
                   <HStack bg="slate.50" p={1} borderRadius="lg" border="1px solid" borderColor="slate.100" spacing={1}>
                       <Text fontSize="xs" fontWeight="bold" color={showAdvanced ? "brand.500" : "slate.400"} px={2}>
                         {showAdvanced ? "Adv." : "Simple"}
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
             <ModalCloseButton mt={-2} mr={-1} borderRadius="full" />

             <ModalBody py={6} px={8}>
                <VStack spacing={5}>
                    <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Category Name</FormLabel>
                        <Input 
                            placeholder="e.g. Reverse Osmosis Service"
                            borderRadius="2xl"
                            bg="slate.50"
                            border="1px solid"
                            borderColor="slate.100"
                            fontWeight="semibold"
                            _focus={{ borderColor: "brand.300", bg: "white", boxShadow: "lg" }}
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Short Code / Sub</FormLabel>
                        <Input 
                            placeholder="e.g. RO Service"
                            borderRadius="2xl"
                            bg="slate.50"
                            border="1px solid"
                            borderColor="slate.100"
                            fontWeight="semibold"
                            _focus={{ borderColor: "brand.300", bg: "white", boxShadow: "lg" }}
                            value={categoryForm.sub}
                            onChange={(e) => setCategoryForm({...categoryForm, sub: e.target.value})}
                        />
                    </FormControl>
                    
                    <Collapse in={showAdvanced} animateOpacity style={{ width: "100%" }}>
                        <VStack spacing={5} align="stretch" pt={1}>
                             <FormControl>
                                <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Theme Color</FormLabel>
                                <Select 
                                    borderRadius="2xl"
                                    bg="slate.50"
                                    border="1px solid"
                                    borderColor="slate.100"
                                    fontWeight="semibold"
                                    _focus={{ borderColor: "brand.300", bg: "white", boxShadow: "lg" }}
                                    value={categoryForm.color}
                                    onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                                >
                                    <option value="brand">Brand (Purple)</option>
                                    <option value="blue">Blue</option>
                                    <option value="emerald">Emerald</option>
                                    <option value="red">Red</option>
                                    <option value="orange">Orange</option>
                                    <option value="cyan">Cyan</option>
                                    <option value="green">Green</option>
                                </Select>
                             </FormControl>

                             <FormControl>
                                <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Est. Avg. Time</FormLabel>
                                <Input 
                                    placeholder="e.g. 45m"
                                    borderRadius="2xl"
                                    bg="slate.50"
                                    border="1px solid"
                                    borderColor="slate.100"
                                    fontWeight="semibold"
                                    _focus={{ borderColor: "brand.300", bg: "white", boxShadow: "lg" }}
                                    value={categoryForm.avgTime}
                                    onChange={(e) => setCategoryForm({...categoryForm, avgTime: e.target.value})}
                                />
                             </FormControl>

                             <FormControl>
                                <FormLabel fontSize="sm" fontWeight="black" color="slate.700" ml={1}>Description</FormLabel>
                                <Textarea 
                                    placeholder="Brief description of when this category is used..."
                                    borderRadius="2xl"
                                    bg="slate.50"
                                    border="1px solid"
                                    borderColor="slate.100"
                                    fontWeight="semibold"
                                    _focus={{ borderColor: "brand.300", bg: "white", boxShadow: "lg" }}
                                    minH="100px"
                                    value={categoryForm.desc}
                                    onChange={(e) => setCategoryForm({...categoryForm, desc: e.target.value})}
                                />
                             </FormControl>
                        </VStack>
                    </Collapse>

                     {!showAdvanced && (
                        <Center w="full">
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
             </ModalBody>

             <ModalFooter bg="slate.50" borderTop="1px solid" borderColor="slate.50" borderBottomRadius="3xl" py={5} px={8}>
                 <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl" fontWeight="bold" color="slate.500">Cancel</Button>
                 <Button 
                   colorScheme="brand" 
                   onClick={handleSubmitCategory} 
                   isLoading={isSubmitting}
                   borderRadius="xl" 
                   fontWeight="bold" 
                   px={10}
                   h="12"
                   boxShadow="lg"
                   leftIcon={<FaSave />}
                 >
                   {modalMode === 'create' ? 'Save Category' : 'Update Category'}
                 </Button>
             </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl">
             <ModalHeader borderBottom="1px solid" borderColor="slate.50" py={6} px={8} bg="slate.50/50" borderTopRadius="3xl">
                 <HStack>
                     <Center w={10} h={10} bg={`${selectedType?.color || 'brand'}.100`} color={`${selectedType?.color || 'brand'}.500`} borderRadius="xl">
                         <Icon as={selectedType?.icon || FaTag} fontSize="lg" />
                     </Center>
                     <VStack align="start" spacing={0}>
                         <Heading size="sm" color="slate.800">{selectedType?.name}</Heading>
                         <Text fontSize="xs" fontWeight="bold" color="slate.400" textTransform="uppercase">{selectedType?.sub}</Text>
                     </VStack>
                 </HStack>
             </ModalHeader>
             <ModalCloseButton mt={4} mr={4} borderRadius="full" />
             <ModalBody p={8}>
                 <VStack spacing={4} align="stretch">
                    <Box>
                        <Text fontSize="xs" color="slate.400" fontWeight="bold" mb={1} textTransform="uppercase">Description</Text>
                        <Text fontSize="sm" color="slate.600" lineHeight="tall">{selectedType?.desc || "No description available."}</Text>
                    </Box>
                    <Divider borderColor="slate.100" />
                    <SimpleGrid columns={2} spacing={4}>
                         <Box>
                             <Text fontSize="xs" color="slate.400" fontWeight="bold" mb={1}>AVG TIME</Text>
                             <Text fontWeight="bold" color="slate.700">{selectedType?.avgTime}</Text>
                         </Box>
                         <Box>
                             <Text fontSize="xs" color="slate.400" fontWeight="bold" mb={1}>ACTIVE TICKETS</Text>
                             <Badge colorScheme={selectedType?.color} borderRadius="md" px={2}>{selectedType?.count}</Badge>
                         </Box>
                         <Box>
                             <Text fontSize="xs" color="slate.400" fontWeight="bold" mb={1}>PENDING</Text>
                             <Text fontWeight="bold" color={selectedType?.pending > 0 ? "red.500" : "slate.700"}>{selectedType?.pending}</Text>
                         </Box>
                         <Box>
                             <Text fontSize="xs" color="slate.400" fontWeight="bold" mb={1}>PROGRESS</Text>
                             <Text fontWeight="bold" color="brand.500">{selectedType?.progress}%</Text>
                         </Box>
                    </SimpleGrid>
                 </VStack>
             </ModalBody>
             <ModalFooter bg="slate.50" borderBottomRadius="3xl" py={4}>
                 <Button width="full" onClick={onViewClose} borderRadius="xl" fontWeight="bold">Close</Button>
             </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(5px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Category
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This action cannot be undone. This will permanently delete the category <b>{selectedType?.name}</b>.
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

export default TicketTypes;
