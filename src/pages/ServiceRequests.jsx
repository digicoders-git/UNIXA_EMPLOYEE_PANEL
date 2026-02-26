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
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Circle,
  Center,
  useToast,
} from "@chakra-ui/react";
import {
  FaClipboardList,
  FaSearch,
  FaFilter,
  FaAngleLeft,
  FaAngleRight,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const ServiceRequests = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      console.log('Fetching service requests...');
      const { data } = await api.get('/employee-dashboard/complaints');
      console.log('API Response:', data);
      
      if (!data.complaints || data.complaints.length === 0) {
        console.log('No complaints found in response');
        setRequests([]);
        return;
      }
      
      const formattedRequests = data.complaints.map(complaint => {
        console.log('Processing complaint:', complaint);
        return {
          requestId: complaint.ticketId,
          customerName: complaint.customerName,
          customerMobile: complaint.customerMobile,
          serviceType: complaint.type,
          status: complaint.status,
          date: new Date(complaint.date).toLocaleDateString('en-IN'),
          priority: complaint.priority,
          description: complaint.description
        };
      });
      
      console.log('Formatted requests:', formattedRequests);
      setRequests(formattedRequests);
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
      toast({ title: "Failed to load requests", description: error.message, status: "error", duration: 3000 });
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.post(`/employee-dashboard/service-requests/${requestId}/accept`);
      toast({ title: "Request Accepted", status: "success", duration: 3000 });
      fetchServiceRequests();
    } catch (error) {
      toast({ title: "Failed to accept request", status: "error", duration: 3000 });
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/employee-dashboard/service-requests/${requestId}/reject`);
      toast({ title: "Request Rejected", status: "warning", duration: 3000 });
      fetchServiceRequests();
    } catch (error) {
      toast({ title: "Failed to reject request", status: "error", duration: 3000 });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      "Pending": { bg: "orange.50", color: "orange.500", label: "Pending" },
      "Accepted": { bg: "green.50", color: "green.600", label: "Accepted" },
      "Rejected": { bg: "red.50", color: "red.500", label: "Rejected" },
    };
    const style = styles[status] || { bg: "slate.50", color: "slate.500", label: status };
    return (
      <Badge 
        bg={style.bg} color={style.color} px={3} py={1.5} borderRadius="full" 
        fontSize="10px" fontWeight="800" textTransform="uppercase" letterSpacing="0.05em"
      >
        {style.label}
      </Badge>
    );
  };

  const filteredRequests = requests.filter(req => 
    req.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <VStack spacing={8} align="stretch" w="full">
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4}>
        <VStack align="start" spacing={1}>
          <HStack>
            <Circle size="10" bg="brand.50" color="brand.500">
              <Icon as={FaClipboardList} boxSize={5} />
            </Circle>
            <Heading size="md" fontWeight="black" color="slate.800">Service Requests</Heading>
          </HStack>
          <Text color="slate.500" fontSize="sm">Manage incoming service requests from notifications</Text>
        </VStack>
        <Button 
          variant="outline" 
          colorScheme="brand" 
          size="sm"
          onClick={() => navigate('/notifications')}
        >
          Back to Notifications
        </Button>
      </Flex>

      <Flex gap={4} p={1}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none" h="12">
            <Icon as={FaSearch} color="slate.300" />
          </InputLeftElement>
          <Input 
            h="12" placeholder="Search by request ID, customer name, service type..." bg="white"
            borderRadius="2xl" border="1px solid" borderColor="slate.100"
            _focus={{ borderColor: "brand.300", boxShadow: "lg" }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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

      <Box bg="white" borderRadius="3xl" border="1px solid" borderColor="slate.50" boxShadow="sm" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="lg">
            <Thead bg="slate.50/50">
              <Tr>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Request ID</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Customer</Th>
                <Th py={5} fontSize="11px" fontWeight="900" color="slate.400" letterSpacing="0.1em" textTransform="uppercase" borderBottom="1px solid" borderColor="slate.100">Service Type</Th>
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
                        <Text color="slate.500" fontSize="sm" fontWeight="medium">No service requests found.</Text>
                      </VStack>
                    </Center>
                  </Td>
                </Tr>
              ) : (
                currentItems.map((request, index) => (
                  <Tr key={request.requestId || index} _hover={{ bg: "slate.50" }} transition="all 0.2s">
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      <Text fontWeight="800" color="slate.700" fontSize="sm">{request.requestId}</Text>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      <HStack>
                        <Avatar size="xs" name={request.customerName} bg="brand.50" color="brand.600" fontWeight="bold" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="700" color="slate.600" fontSize="sm">{request.customerName}</Text>
                          <Text fontSize="xs" fontWeight="medium" color="slate.400">{request.customerMobile}</Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      <Text fontWeight="700" color="slate.600" fontSize="sm">{request.serviceType}</Text>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      {getStatusBadge(request.status)}
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50">
                      <Text fontSize="xs" fontWeight="bold" color="slate.500">{request.date}</Text>
                    </Td>
                    <Td py={5} borderBottom="1px solid" borderColor="slate.50" textAlign="right">
                      {request.status === "Pending" && (
                        <HStack spacing={2} justify="flex-end">
                          <Button 
                            size="sm" 
                            colorScheme="green" 
                            leftIcon={<FaCheck />}
                            borderRadius="lg"
                            onClick={() => handleAccept(request.requestId)}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            colorScheme="red" 
                            variant="outline"
                            leftIcon={<FaTimes />}
                            borderRadius="lg"
                            onClick={() => handleReject(request.requestId)}
                          >
                            Reject
                          </Button>
                        </HStack>
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

        {filteredRequests.length > 0 && (
          <Flex px={8} py={5} justify="space-between" align="center" borderTop="1px solid" borderColor="slate.50" bg="slate.50/30">
            <Text fontSize="xs" fontWeight="bold" color="slate.500">
              Showing <Text as="span" color="slate.800">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRequests.length)}</Text> of {filteredRequests.length}
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
    </VStack>
  );
};

export default ServiceRequests;
