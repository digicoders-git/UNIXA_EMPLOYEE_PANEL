import React, { useState } from "react";
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Icon, 
  SimpleGrid, 
  Badge, 
  Divider, 
  Button,
  List,
  ListItem,
  ListIcon,
  Center,
  Square,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@chakra-ui/react";
import { 
  FaTools, 
  FaCheck, 
  FaRupeeSign, 
  FaHourglassHalf,
  FaSearch,
  FaTable,
  FaThLarge,
  FaFileAlt,
  FaFilter,
  FaChevronRight,
  FaAngleLeft,
  FaAngleRight,
  FaInfoCircle
} from "react-icons/fa";

const ServiceDetails = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    { title: "Standard RO Service", code: "S-RO-01", price: "499", duration: "45 mins", items: ["Filter Cleaning", "TDS Check", "Pre-filter Wash"], category: "Maintenance" },
    { title: "RO Installation", code: "I-RO-01", price: "999", duration: "1.5 hours", items: ["Unit Setup", "Plumbing", "System Training"], category: "Installation" },
    { title: "Electrical Repair", code: "R-E-01", price: "350", duration: "30 mins", items: ["Pump Repair", "SMPS Replacement", "Wiring Check"], category: "Repair" },
    { title: "Filter Replacement", code: "M-FR-02", price: "1200", duration: "30 mins", items: ["Sediment Filter", "Carbon Filter", "Membrane Check"], category: "Maintenance" },
    { title: "Membrane Cleaning", code: "M-MC-03", price: "800", duration: "1 hour", items: ["Chemical Wash", "Flow Check", "Pressure Test"], category: "Maintenance" },
    { title: "Tank Cleaning", code: "S-TC-04", price: "300", duration: "20 mins", items: ["Tank Emptying", "Scrubbing", "Disinfection"], category: "Maintenance" },
    { title: "Booster Pump Replace", code: "R-BP-02", price: "1800", duration: "45 mins", items: ["Remove Old Pump", "Install New Pump", "Pressure Calibration"], category: "Repair" },
  ];

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const handleOpenSOP = (service) => {
      setSelectedService(service);
      onOpen();
  };

  return (
    <VStack spacing={8} align="stretch" w="full">
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="md" fontWeight="black" color="slate.800">Service Master</Heading>
          <Text color="slate.500" fontSize="sm">Standard rates and operating procedures</Text>
        </VStack>
        
        <HStack spacing={4} w={{ base: "full", md: "auto" }}>
          <InputGroup maxSize="xs">
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="slate.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search services..." 
              borderRadius="2xl" 
              bg="white" 
              fontSize="sm"
              fontWeight="medium"
              border="1px solid"
              borderColor="slate.100"
              _focus={{ borderColor: "brand.300", boxShadow: "lg" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

           {/* View Toggle */}
           <HStack bg="white" spacing={1} p={1} borderRadius="xl" border="1px solid" borderColor="slate.100">
              <IconButton 
                size="sm" 
                variant={viewMode === "grid" ? "solid" : "ghost"} 
                colorScheme={viewMode === "grid" ? "brand" : "gray"}
                color={viewMode === "grid" ? "white" : "slate.400"}
                icon={<FaThLarge />} 
                onClick={() => setViewMode("grid")}
                borderRadius="lg"
                aria-label="Grid View"
              />
              <IconButton 
                size="sm" 
                variant={viewMode === "table" ? "solid" : "ghost"} 
                colorScheme={viewMode === "table" ? "brand" : "gray"}
                color={viewMode === "table" ? "white" : "slate.400"}
                icon={<FaTable />} 
                onClick={() => setViewMode("table")}
                borderRadius="lg"
                aria-label="Table View"
              />
           </HStack>
        </HStack>
      </Flex>

      {viewMode === "grid" ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredServices.map((service, index) => (
            <Box 
              key={index} 
              bg="white" 
              borderRadius="3xl" 
              border="1px solid" 
              borderColor="slate.50" 
              boxShadow="sm"
              overflow="hidden"
              display="flex"
              flexDirection="column"
              transition="all 0.3s"
              _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
            >
              <Box p={6} borderBottom="1px solid" borderColor="slate.50">
                <Flex justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <Badge colorScheme={service.category === "Maintenance" ? "blue" : service.category === "Repair" ? "orange" : "brand"} variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="9px" fontWeight="black">
                      {service.category}
                    </Badge>
                    <Heading size="sm" color="slate.800" fontWeight="black" lineHeight="short">
                      {service.title}
                    </Heading>
                    <Text fontSize="10px" fontWeight="bold" color="slate.400" fontFamily="mono">{service.code}</Text>
                  </VStack>
                  <Square size="10" bg="slate.50" borderRadius="xl" color="slate.400">
                    <Icon as={FaTools} />
                  </Square>
                </Flex>
              </Box>

              <Box p={6} flex={1}>
                <VStack align="stretch" spacing={6}>
                  <Flex justify="space-between" align="center" bg="slate.50" p={4} borderRadius="xl" border="1px dashed" borderColor="slate.200">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="9px" fontWeight="black" color="slate.400" textTransform="uppercase">Price</Text>
                      <HStack spacing={0.5} color="slate.700">
                         <Icon as={FaRupeeSign} fontSize="sm" />
                         <Text fontSize="lg" fontWeight="black">{service.price}</Text>
                      </HStack>
                    </VStack>
                    <Divider orientation="vertical" h="8" borderColor="slate.200" />
                    <VStack align="end" spacing={0}>
                      <Text fontSize="9px" fontWeight="black" color="slate.400" textTransform="uppercase">Duration</Text>
                      <HStack spacing={1} color="slate.600">
                         <Icon as={FaHourglassHalf} fontSize="xs" />
                         <Text fontSize="sm" fontWeight="bold">{service.duration}</Text>
                      </HStack>
                    </VStack>
                  </Flex>

                  <Box>
                    <Text fontSize="10px" fontWeight="black" color="slate.300" textTransform="uppercase" letterSpacing="widest" mb={3}>Standard Procedures</Text>
                    <List spacing={3}>
                      {service.items.map((item, i) => (
                        <ListItem key={i} display="flex" alignItems="center">
                          <ListIcon as={FaCheck} color="brand.400" fontSize="10px" bg="brand.50" p={1} borderRadius="full" boxSize={4} />
                          <Text fontSize="xs" fontWeight="bold" color="slate.600">{item}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </VStack>
              </Box>
              
              <Box p={4} bg="slate.50" borderTop="1px solid" borderColor="slate.100">
                  <Button 
                    w="full" 
                    variant="ghost" 
                    size="sm" 
                    borderRadius="xl" 
                    fontSize="xs" 
                    fontWeight="black" 
                    color="slate.400"
                    rightIcon={<FaChevronRight />}
                    justifyContent="space-between"
                    _hover={{ bg: "white", color: "brand.500", shadow: "md" }}
                    onClick={() => handleOpenSOP(service)}
                  >
                    View Procedure Details
                  </Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
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
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Service Name</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Category</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Std. Cost</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Est. Time</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Checklist</Th>
                   <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100" textAlign="right">Action</Th>
                 </Tr>
               </Thead>
               <Tbody>
                 {currentItems.map((service, index) => (
                   <Tr key={index} _hover={{ bg: "slate.50" }} transition="all 0.2s">
                     <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="800" color="slate.700" fontSize="sm">{service.title}</Text>
                          <Badge variant="outline" colorScheme="slate" fontSize="9px" borderRadius="md">{service.code}</Badge>
                        </VStack>
                     </Td>
                     <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                        <Badge colorScheme={service.category === "Maintenance" ? "blue" : service.category === "Repair" ? "orange" : "brand"} variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="9px" fontWeight="black">
                          {service.category}
                        </Badge>
                     </Td>
                     <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                         <HStack spacing={1} color="slate.700">
                             <Icon as={FaRupeeSign} fontSize="xs" />
                             <Text fontWeight="black" fontSize="sm">{service.price}</Text>
                         </HStack>
                     </Td>
                     <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                         <HStack spacing={1} color="slate.500">
                             <Icon as={FaHourglassHalf} fontSize="xs" />
                             <Text fontSize="xs" fontWeight="bold">{service.duration}</Text>
                         </HStack>
                     </Td>
                     <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                         <Text fontSize="xs" color="slate.500" fontWeight="medium" noOfLines={2}>
                           {service.items.join(", ")}
                         </Text>
                     </Td>
                     <Td py={5} borderBottom="1px solid" borderColor="slate.50" textAlign="right">
                        <Tooltip label="View SOP" hasArrow>
                            <IconButton 
                                icon={<FaFileAlt />} 
                                variant="ghost" 
                                size="sm" 
                                borderRadius="lg" 
                                color="slate.400"
                                _hover={{ bg: "brand.50", color: "brand.500" }}
                                onClick={() => handleOpenSOP(service)}
                            />
                        </Tooltip>
                     </Td>
                   </Tr>
                 ))}
               </Tbody>
             </Table>
           </Box>

            {/* Pagination Footer */}
            {filteredServices.length > 0 && (
                <Flex px={8} py={5} justify="space-between" align="center" borderTop="1px solid" borderColor="slate.50" bg="slate.50/30">
                    <Text fontSize="xs" fontWeight="bold" color="slate.500">
                        Showing <Text as="span" color="slate.800">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredServices.length)}</Text> of {filteredServices.length}
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
      )}

      {/* SOP Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl">
          <ModalHeader py={6} px={8} borderBottom="1px solid" borderColor="slate.50" bg="slate.50/50" borderTopRadius="3xl">
             <HStack spacing={3}>
                <Square size={10} bg="brand.50" color="brand.500" borderRadius="xl">
                    <Icon as={FaFileAlt} />
                </Square>
                <VStack align="start" spacing={0}>
                    <Heading size="sm" color="slate.800">SOP Details</Heading>
                    <Text fontSize="xs" fontWeight="bold" color="slate.400" textTransform="uppercase">Standard Operating Procedure</Text>
                </VStack>
             </HStack>
          </ModalHeader>
          <ModalCloseButton mt={4} mr={4} borderRadius="full" />
          <ModalBody p={8}>
             <VStack spacing={6} align="stretch">
                 <Box bg="slate.50" p={5} borderRadius="xl" border="1px dashed" borderColor="slate.200">
                    <Heading size="sm" color="slate.800" mb={1}>{selectedService?.title}</Heading>
                    <HStack spacing={4} mt={2}>
                        <Badge colorScheme="brand" variant="solid" borderRadius="md">{selectedService?.code}</Badge>
                        <HStack spacing={1} color="slate.500">
                             <Icon as={FaHourglassHalf} fontSize="xs" />
                             <Text fontSize="xs" fontWeight="bold">{selectedService?.duration}</Text>
                         </HStack>
                    </HStack>
                 </Box>

                 <Box>
                    <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" mb={3} letterSpacing="wider">Checklist Items</Text>
                    <List spacing={3}>
                         {selectedService?.items.map((item, i) => (
                             <ListItem key={i} display="flex" alignItems="center">
                                 <ListIcon as={FaCheck} color="green.500" bg="green.50" p={1} borderRadius="full" boxSize={5} />
                                 <Text fontSize="sm" fontWeight="bold" color="slate.600">{item}</Text>
                             </ListItem>
                         ))}
                         <ListItem display="flex" alignItems="center">
                                 <ListIcon as={FaCheck} color="green.500" bg="green.50" p={1} borderRadius="full" boxSize={5} />
                                 <Text fontSize="sm" fontWeight="bold" color="slate.600">Post-service cleanup and verification</Text>
                         </ListItem>
                         <ListItem display="flex" alignItems="center">
                                 <ListIcon as={FaCheck} color="green.500" bg="green.50" p={1} borderRadius="full" boxSize={5} />
                                 <Text fontSize="sm" fontWeight="bold" color="slate.600">Customer signature on job card</Text>
                         </ListItem>
                    </List>
                 </Box>

                 <Box>
                    <HStack mb={2}>
                        <Icon as={FaInfoCircle} color="blue.400" />
                        <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" letterSpacing="wider">Important Note</Text>
                    </HStack>
                    <Text fontSize="sm" color="slate.500" lineHeight="tall">
                        Technicians must ensure all safety protocols are followed. Wear protective gear where necessary. Any additional parts used must be logged in the inventory system immediately.
                    </Text>
                 </Box>
             </VStack>
          </ModalBody>
          <ModalFooter bg="slate.50" borderBottomRadius="3xl" py={4}>
             <Button w="full" onClick={onClose} borderRadius="xl" fontWeight="bold">Close SOP</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </VStack>
  );
};

export default ServiceDetails;
