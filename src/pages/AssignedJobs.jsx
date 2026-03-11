import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  SimpleGrid,
  Badge,
  Divider,
  Circle,
  Avatar,
  IconButton,
  Tooltip,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Collapse,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaExternalLinkAlt,
  FaTable,
  FaThLarge,
  FaInfoCircle,
  FaRoute,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaEdit,
  FaTrash,
  FaSave,
  FaAngleLeft,
  FaAngleRight,
  FaCamera,
  FaSync
} from "react-icons/fa";
import api from '../services/api';

const AssignedJobs = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortControllerRef = useRef(null);

  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isCompleteOpen, onOpen: onCompleteOpen, onClose: onCompleteClose } = useDisclosure();

  const toast = useToast();

  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchAssignedJobs = useCallback(async (isManualRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get employee name from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setJobs([]);
        setStats({ total: 0, completed: 0, pending: 0 });
        return;
      }

      const parsed = JSON.parse(userStr);
      const employeeName = parsed.name || parsed.employeeName || parsed.firstName;

      console.log('[DEBUG] Employee name from localStorage:', employeeName);
      console.log('[DEBUG] Full user object:', parsed);

      if (!employeeName) {
        console.error('[ERROR] No employee name found in localStorage');
        setJobs([]);
        setStats({ total: 0, completed: 0, pending: 0 });
        return;
      }

      // Validate employee name to prevent SSRF
      if (typeof employeeName !== 'string' || employeeName.length > 100 || /[<>"'&]/.test(employeeName)) {
        console.error('Invalid employee name format');
        setJobs([]);
        setStats({ total: 0, completed: 0, pending: 0 });
        return;
      }

      // Encode employee name for URL
      const encodedEmployeeName = encodeURIComponent(employeeName);
      
      console.log('[DEBUG] Making API call for employee:', employeeName);
      console.log('[DEBUG] Encoded name:', encodedEmployeeName);
      console.log('[DEBUG] Full API URL:', `/assigned-tickets/employee/${encodedEmployeeName}`);

      // Create abort controller for request cancellation
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 30000); // 30 second timeout for slow connections

      try {
        const response = await api.get(`/assigned-tickets/employee/${encodedEmployeeName}`, {
          signal: abortControllerRef.current.signal
        });
        clearTimeout(timeoutId);

        const assignedTickets = response.data || [];
        console.log(`[DEBUG] ========== API RESPONSE START ==========`);
        console.log(`[DEBUG] API Response status:`, response.status);
        console.log(`[DEBUG] API Response headers:`, response.headers);
        console.log(`[DEBUG] Raw response.data type:`, typeof response.data);
        console.log(`[DEBUG] Raw response.data:`, response.data);
        console.log(`[DEBUG] Received ${assignedTickets.length} raw tickets for "${employeeName}"`);
        console.log(`[DEBUG] API URL called:`, `/assigned-tickets/employee/${encodedEmployeeName}`);
        console.log(`[DEBUG] ========== API RESPONSE END ==========`);
        if (assignedTickets.length > 0) {
          console.log('[DEBUG] First ticket sample:', assignedTickets[0]);
        } else {
          console.warn('[WARNING] ⚠️ No tickets returned from API - Array is empty!');
        }
        const jobs = [];
        let totalCount = 0;
        let completedCount = 0;
        let pendingCount = 0;

        assignedTickets.forEach((ticket) => {
          totalCount++;

          if (ticket.status === 'Completed') {
            completedCount++;
            return; // Skip completed jobs
          }

          if (ticket.status === 'Pending') pendingCount++;

          // Minimal data processing for speed
          jobs.push({
            id: ticket._id,
            ticketNumber: ticket._id.slice(-8).toUpperCase(),
            title: ticket.title || 'Service Task',
            description: ticket.description || '',
            assignedBy: ticket.assignedBy || 'Admin',
            assignedTo: ticket.assignedTo || employeeName,
            priority: ticket.priority || 'Medium',
            status: ticket.status || 'Pending',
            dueDate: ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
            time: ticket.dueDate ? new Date(ticket.dueDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '09:00',
            customerName: ticket.customerName || 'Customer',
            customerPhone: ticket.customerPhone || 'N/A',
            customerEmail: ticket.customerEmail || 'N/A',
            address: ticket.address || 'N/A',
            notes: ticket.notes || 'No notes',
            amcInfo: null // AMC info removed for speed
          });
        });

        // Update state immediately
        setJobs(jobs);
        const newStats = {
          total: totalCount,
          completed: completedCount,
          pending: pendingCount
        };
        setStats(newStats);
        
        console.log('[DEBUG] ✅ State updated successfully!');
        console.log('[DEBUG] Jobs array length:', jobs.length);
        console.log('[DEBUG] Stats:', newStats);
        console.log('[DEBUG] Sample job:', jobs[0]);

        // Cache successful data
        try {
          sessionStorage.setItem('cachedJobs', JSON.stringify({
            jobs,
            stats: newStats,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn('Failed to cache job data');
        }

      } catch (requestError) {
        clearTimeout(timeoutId);
        throw requestError;
      }

    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'canceled') {
        return; // Silent return for intentional cancellations
      }
      console.error('[ERROR] Error fetching jobs:', error.message);
      console.error('[ERROR] Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });

      // Handle different error types
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        console.warn('[WARNING] Network/timeout error - using cached data if available');
      }

      // Try to use cached data or set empty state
      const cachedJobs = sessionStorage.getItem('cachedJobs');
      if (cachedJobs && !isManualRefresh) {
        try {
          const parsed = JSON.parse(cachedJobs);
          setJobs(parsed.jobs || []);
          setStats(parsed.stats || { total: 0, completed: 0, pending: 0 });
          console.log('Using cached job data');
          return;
        } catch (e) {
          console.warn('Failed to parse cached data');
        }
      }

      setJobs([]);
      setStats({ total: 0, completed: 0, pending: 0 });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Check for cached data first
    const cachedData = sessionStorage.getItem('cachedJobs');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        // Use cache if it's less than 5 minutes old for immediate UI response
        const isRecent = Date.now() - parsed.timestamp < 300000;
        if (isRecent && parsed.jobs) {
          setJobs(parsed.jobs);
          setStats(parsed.stats || { total: 0, completed: 0, pending: 0 });
          setLoading(false);
          // Still fetch fresh data in background
          setTimeout(() => {
            if (isMounted) fetchAssignedJobs(false);
          }, 500);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached data');
      }
    }

    fetchAssignedJobs(false);

    const interval = setInterval(() => {
      if (isMounted) fetchAssignedJobs(false);
    }, 60000); // Check for new jobs every minute

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAssignedJobs]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "red";
      case "Medium": return "orange";
      case "Low": return "blue";
      default: return "slate";
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = jobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  const handleOpenView = (job) => {
    setSelectedJob(job);
    onViewOpen();
  };

  const handleStartJob = async (job) => {
    try {
      setIsSubmitting(true);
      await api.put(`/assigned-tickets/${job.id}`, {
        status: 'In Progress'
      });

      // Immediately update local state
      const updatedJobs = jobs.map(j =>
        j.id === job.id ? { ...j, status: 'In Progress' } : j
      );
      setJobs(updatedJobs);

      toast({
        title: "Job Started",
        description: `You've started working on this job`,
        status: "success",
        duration: 3000
      });
    } catch (error) {
      console.error('Error starting job:', error);
      toast({ title: "Failed to start job", status: "error", duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteJob = async (job) => {
    setSelectedJob(job);
    setCompletionPhoto(null);
    setPhotoPreview(null);
    onCompleteOpen();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompletionPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCompletion = async () => {
    if (!completionPhoto) {
      toast({ title: "Please upload a completion photo", status: "warning", duration: 3000 });
      return;
    }

    try {
      setIsSubmitting(true);

      const reader = new FileReader();
      reader.readAsDataURL(completionPhoto);
      reader.onloadend = async () => {
        try {
          await api.put(`/assigned-tickets/${selectedJob.id}/complete`, {
            completionPhoto: reader.result
          });

          // Remove completed job from list immediately
          const updatedJobs = jobs.filter(j => j.id !== selectedJob.id);
          setJobs(updatedJobs);

          // Update stats
          setStats(prev => ({
            ...prev,
            completed: prev.completed + 1,
            pending: prev.pending - (selectedJob.status === 'Pending' ? 1 : 0)
          }));

          toast({
            title: "Job Completed Successfully!",
            description: selectedJob.amcInfo
              ? `AMC service count updated. Remaining: ${selectedJob.amcInfo.servicesRemaining - 1}/${selectedJob.amcInfo.servicesTotal}`
              : "Job marked as completed",
            status: "success",
            duration: 5000
          });

          onCompleteClose();

          // Refresh data after 2 seconds to sync with server
          setTimeout(() => {
            fetchAssignedJobs(false);
          }, 2000);
        } catch (error) {
          console.error('Error completing job:', error);
          toast({ title: "Failed to complete job", status: "error", duration: 3000 });
        } finally {
          setIsSubmitting(false);
        }
      };
    } catch (error) {
      console.error('Error reading file:', error);
      toast({ title: "Failed to process image", status: "error", duration: 3000 });
      setIsSubmitting(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="slate.100" boxShadow="sm">
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" fontWeight="bold" color="slate.400" textTransform="uppercase">Total Jobs</Text>
            <Heading size="2xl" color="slate.800">{stats.total}</Heading>
          </VStack>
        </Box>
        <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="green.100" boxShadow="sm">
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" fontWeight="bold" color="green.500" textTransform="uppercase">Completed</Text>
            <Heading size="2xl" color="green.600">{stats.completed}</Heading>
          </VStack>
        </Box>
        <Box bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="orange.100" boxShadow="sm">
          <VStack align="start" spacing={1}>
            <Text fontSize="xs" fontWeight="bold" color="orange.500" textTransform="uppercase">Pending</Text>
            <Heading size="2xl" color="orange.600">{stats.pending}</Heading>
          </VStack>
        </Box>
      </SimpleGrid>

      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="md" fontWeight="black" color="slate.800">Your Assigned Jobs</Heading>
          <Text color="slate.500" fontSize="sm">Scheduled visits and service calls for today</Text>
        </VStack>
        <HStack spacing={4}>
          {/* Simple / Advanced Toggle */}
          <HStack bg="white" p={1} borderRadius="lg" border="1px solid" borderColor="slate.100" spacing={1} display={{ base: "none", md: "flex" }}>
            <Text fontSize="xs" fontWeight="bold" color={showAdvanced ? "brand.500" : "slate.400"} px={3}>
              {showAdvanced ? "Advanced View" : "Simple View"}
            </Text>
            <Switch
              size="sm"
              colorScheme="brand"
              isChecked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
            />
          </HStack>

          {/* Date Badge */}
          <HStack
            bg="white" px={4} py={3} borderRadius="2xl" border="1px solid"
            borderColor="slate.100" boxShadow="sm"
          >
            <Icon as={FaCalendarAlt} color="brand.500" />
            <Text fontSize="sm" fontWeight="black" color="slate.700">Today, {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
          </HStack>

          {/* Refresh Button */}
          <IconButton
            aria-label="Refresh Jobs"
            icon={<FaSync />}
            size="md"
            variant="outline"
            borderRadius="xl"
            borderColor="slate.200"
            color="slate.400"
            onClick={() => fetchAssignedJobs(true)}
            isLoading={loading || isRefreshing}
            _hover={{ bg: "slate.50", color: "brand.500", borderColor: "brand.200" }}
          />

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

      {/* Mobile Advanced Switch */}
      <HStack display={{ base: "flex", md: "none" }} justify="flex-end">
        <Text fontSize="xs" fontWeight="bold" color="slate.500">Advanced View</Text>
        <Switch size="sm" colorScheme="brand" isChecked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} />
      </HStack>

      {/* Grid View */}
      {viewMode === "grid" && (
        loading ? (
          <Center py={20}>
            <VStack>
              <Box className="animate-spin" w={12} h={12} border="4px solid" borderColor="blue.100" borderTopColor="blue.500" rounded="full" />
              <Text fontSize="sm" fontWeight="bold" color="slate.400">Loading jobs...</Text>
              <Text fontSize="xs" color="slate.300">If this takes too long, check your connection</Text>
            </VStack>
          </Center>
        ) : jobs.length === 0 ? (
          <Center py={20}>
            <VStack>
              <Text fontSize="lg" fontWeight="bold" color="slate.400">No active jobs assigned</Text>
              <Text fontSize="sm" color="slate.400">Check back later for new assignments</Text>
              <Button size="sm" colorScheme="blue" variant="outline" onClick={() => fetchAssignedJobs(true)} mt={3}>
                Refresh Jobs
              </Button>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {jobs.map((job) => (
              <Box
                key={job.id}
                bg="white"
                borderRadius="3xl"
                border="1px solid"
                borderColor="slate.50"
                boxShadow="sm"
                overflow="hidden"
                position="relative"
                transition="all 0.3s"
                _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
              >
                <Box p={8}>
                  <Flex justify="space-between" align="start" mb={6}>
                    <VStack align="start" spacing={1}>
                      <Badge colorScheme="brand" variant="subtle" px={3} py={1} borderRadius="full" fontSize="10px" fontWeight="black" letterSpacing="wider">
                        {job.ticketNumber}
                      </Badge>
                      <Heading size="md" color="slate.800" fontWeight="black" mt={2}>{job.customerName}</Heading>
                      <HStack>
                        <Text fontSize="xs" fontWeight="bold" color="slate.500">{job.title}</Text>
                        <Circle size="1" bg="slate.300" />
                        <Text fontSize="xs" fontWeight="bold" color={getPriorityColor(job.priority) + ".500"}>{job.priority} Priority</Text>
                      </HStack>
                    </VStack>
                    <VStack align="flex-end" spacing={0}>
                      <Text fontSize="10px" fontWeight="black" color="slate.300" textTransform="uppercase" letterSpacing="widest">Scheduled</Text>
                      <HStack spacing={2} color="brand.600" bg="brand.50" px={3} py={1} borderRadius="lg">
                        <Icon as={FaClock} />
                        <Text fontWeight="black" fontSize="sm">{job.time}</Text>
                      </HStack>
                    </VStack>
                  </Flex>

                  <VStack align="stretch" spacing={5}>
                    <HStack spacing={4} align="start">
                      <Center w={10} h={10} bg="blue.50" color="blue.500" borderRadius="xl" shrink={0}>
                        <Icon as={FaMapMarkerAlt} />
                      </Center>
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontSize="xs" fontWeight="black" color="slate.300" textTransform="uppercase">Location</Text>
                        <Text fontSize="sm" fontWeight="bold" color="slate.700" noOfLines={2}>{job.address}</Text>
                        {job.address && job.address !== 'N/A' && (
                          <Button
                            as="a"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
                            target="_blank"
                            size="xs"
                            colorScheme="blue"
                            variant="link"
                            mt={1}
                            leftIcon={<Icon as={FaRoute} />}
                          >
                            Open in Maps
                          </Button>
                        )}
                      </VStack>
                    </HStack>

                    <HStack spacing={4} align="start">
                      <Center w={10} h={10} bg="purple.50" color="purple.500" borderRadius="xl" shrink={0}>
                        <Icon as={FaPhone} />
                      </Center>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" fontWeight="black" color="slate.300" textTransform="uppercase">Contact</Text>
                        <Text fontSize="sm" fontWeight="bold" color="slate.700">{job.customerPhone}</Text>
                      </VStack>
                    </HStack>

                    {/* Advanced Details Section */}
                    <Collapse in={showAdvanced} animateOpacity>
                      <VStack align="stretch" spacing={4} pt={4} borderTop="1px dashed" borderColor="slate.200">
                        <HStack justify="space-between">
                          <Text fontSize="xs" fontWeight="bold" color="slate.500">Assigned By</Text>
                          <Text fontSize="xs" fontWeight="bold" color="slate.700">{job.assignedBy}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="xs" fontWeight="bold" color="slate.500">Due Date</Text>
                          <Text fontSize="xs" fontWeight="bold" color="slate.700">{job.dueDate}</Text>
                        </HStack>
                        {job.customerEmail && (
                          <HStack justify="space-between">
                            <Text fontSize="xs" fontWeight="bold" color="slate.500">Email</Text>
                            <Text fontSize="xs" fontWeight="bold" color="slate.700">{job.customerEmail}</Text>
                          </HStack>
                        )}
                        {job.amcInfo && (
                          <Box bg="blue.50" p={3} borderRadius="xl">
                            <Text fontSize="xs" fontWeight="black" color="blue.600" mb={1} textTransform="uppercase">AMC Info</Text>
                            <VStack align="stretch" spacing={1}>
                              <HStack justify="space-between">
                                <Text fontSize="xs" color="slate.600">{job.amcInfo.planName}</Text>
                                <Badge colorScheme="blue" fontSize="xs">{job.amcInfo.servicesRemaining}/{job.amcInfo.servicesTotal} Left</Badge>
                              </HStack>
                            </VStack>
                          </Box>
                        )}
                        {job.notes && (
                          <Box bg="slate.50" p={3} borderRadius="xl">
                            <Text fontSize="xs" fontWeight="black" color="slate.400" mb={1} textTransform="uppercase">Notes</Text>
                            <Text fontSize="xs" color="slate.600" fontStyle="italic">{job.notes}</Text>
                          </Box>
                        )}
                      </VStack>
                    </Collapse>
                  </VStack>

                  <HStack spacing={4} mt={8}>
                    {job.status === 'Pending' && (
                      <Button
                        flex={1}
                        h="12"
                        colorScheme="brand"
                        borderRadius="xl"
                        fontWeight="bold"
                        boxShadow="lg"
                        leftIcon={<FaCheck />}
                        onClick={() => handleStartJob(job)}
                        isLoading={isSubmitting}
                        _active={{ transform: "scale(0.98)" }}
                      >
                        Start Job
                      </Button>
                    )}
                    {job.status === 'In Progress' && (
                      <Button
                        flex={1}
                        h="12"
                        colorScheme="green"
                        borderRadius="xl"
                        fontWeight="bold"
                        boxShadow="lg"
                        leftIcon={<FaCheck />}
                        onClick={() => handleCompleteJob(job)}
                        isLoading={isSubmitting}
                        _active={{ transform: "scale(0.98)" }}
                      >
                        Mark as Completed
                      </Button>
                    )}
                    {job.status === 'Completed' && (
                      <Button
                        className=""
                        flex={1}
                        h="12"
                        colorScheme="green"
                        borderRadius="xl"
                        fontWeight="bold"
                        isDisabled
                        leftIcon={<FaCheck />}
                      >
                        Completed
                      </Button>
                    )}
                    <IconButton
                      aria-label="View Map"
                      icon={<FaExternalLinkAlt />}
                      h="12"
                      w="12"
                      variant="outline"
                      borderRadius="xl"
                      borderColor="slate.200"
                      color="slate.400"
                      _hover={{ bg: "slate.50", color: "brand.500", borderColor: "brand.200" }}
                    />
                    {!showAdvanced && (
                      <IconButton
                        aria-label="Show More"
                        icon={<FaChevronDown />}
                        h="12"
                        w="12"
                        variant="ghost"
                        color="slate.300"
                        onClick={() => setShowAdvanced(true)}
                        _hover={{ bg: "slate.50", color: "slate.500" }}
                      />
                    )}
                    {showAdvanced && (
                      <IconButton
                        aria-label="Show Less"
                        icon={<FaChevronUp />}
                        h="12"
                        w="12"
                        variant="ghost"
                        color="slate.300"
                        onClick={() => setShowAdvanced(false)}
                        _hover={{ bg: "slate.50", color: "slate.500" }}
                      />
                    )}
                  </HStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Box
          bg="white"
          borderRadius="3xl"
          border="1px solid"
          borderColor="slate.50"
          boxShadow="sm"
          overflow="hidden"
        >
          {loading ? (
            <Center py={20}>
              <VStack>
                <Box className="animate-spin" w={12} h={12} border="4px solid" borderColor="blue.100" borderTopColor="blue.500" rounded="full" />
                <Text fontSize="sm" fontWeight="bold" color="slate.400">Loading jobs...</Text>
                <Text fontSize="xs" color="slate.300">If this takes too long, check your connection</Text>
              </VStack>
            </Center>
          ) : jobs.length === 0 ? (
            <Center py={20}>
              <VStack>
                <Text fontSize="lg" fontWeight="bold" color="slate.400">No active jobs assigned</Text>
                <Text fontSize="sm" color="slate.400">Check back later for new assignments</Text>
                <Button size="sm" colorScheme="blue" variant="outline" onClick={() => fetchAssignedJobs(true)} mt={3}>
                  Refresh Jobs
                </Button>
              </VStack>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg="slate.50">
                    <Tr>
                      <Th py={4} fontSize="10px" fontWeight="900" color="slate.500" textTransform="uppercase">Ticket</Th>
                      <Th py={4} fontSize="10px" fontWeight="900" color="slate.500" textTransform="uppercase">Customer</Th>
                      <Th py={4} fontSize="10px" fontWeight="900" color="slate.500" textTransform="uppercase">Contact</Th>
                      <Th py={4} fontSize="10px" fontWeight="900" color="slate.500" textTransform="uppercase">Priority</Th>
                      <Th py={4} fontSize="10px" fontWeight="900" color="slate.500" textTransform="uppercase">Status</Th>
                      <Th py={4} fontSize="10px" fontWeight="900" color="slate.500" textTransform="uppercase" textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentItems.map((job) => (
                      <Tr key={job.id} _hover={{ bg: "slate.50" }} transition="all 0.2s">
                        <Td py={4} borderBottom="1px solid" borderColor="slate.100">
                          <VStack align="start" spacing={1}>
                            <Badge colorScheme="brand" variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="9px" fontWeight="black">{job.ticketNumber}</Badge>
                            <Text fontWeight="700" color="slate.800" fontSize="sm">{job.title}</Text>
                            <Text fontSize="xs" color="slate.500" noOfLines={1} maxW="200px">{job.description}</Text>
                          </VStack>
                        </Td>
                        <Td py={4} borderBottom="1px solid" borderColor="slate.100">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="700" color="slate.800" fontSize="sm">{job.customerName}</Text>
                            <Text fontSize="xs" color="slate.500" noOfLines={1} maxW="180px">{job.address}</Text>
                            {job.address && job.address !== 'N/A' && (
                              <Button
                                as="a"
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
                                target="_blank"
                                size="xs"
                                colorScheme="blue"
                                variant="link"
                                mt={1}
                                fontSize="10px"
                                leftIcon={<Icon as={FaRoute} fontSize="10px" />}
                              >
                                View Map
                              </Button>
                            )}
                          </VStack>
                        </Td>
                        <Td py={4} borderBottom="1px solid" borderColor="slate.100">
                          <HStack spacing={2}>
                            <Icon as={FaPhone} color="purple.400" fontSize="xs" />
                            <Text fontSize="sm" fontWeight="600" color="slate.700">{job.customerPhone}</Text>
                          </HStack>
                        </Td>
                        <Td py={4} borderBottom="1px solid" borderColor="slate.100">
                          <Badge colorScheme={getPriorityColor(job.priority)} fontSize="xs" px={3} py={1} borderRadius="full">
                            {job.priority}
                          </Badge>
                        </Td>
                        <Td py={4} borderBottom="1px solid" borderColor="slate.100">
                          <Badge
                            colorScheme={job.status === 'Completed' ? 'green' : job.status === 'In Progress' ? 'blue' : 'yellow'}
                            fontSize="xs" px={3} py={1} borderRadius="full"
                          >
                            {job.status}
                          </Badge>
                        </Td>
                        <Td py={4} borderBottom="1px solid" borderColor="slate.100">
                          <HStack spacing={2} justify="flex-end">
                            {job.status === 'Pending' && (
                              <Button
                                size="sm"
                                colorScheme="brand"
                                leftIcon={<FaCheck />}
                                onClick={() => handleStartJob(job)}
                                isLoading={isSubmitting}
                                fontSize="xs"
                                px={4}
                              >
                                Start
                              </Button>
                            )}
                            {job.status === 'In Progress' && (
                              <Button
                                size="sm"
                                colorScheme="green"
                                leftIcon={<FaCheck />}
                                onClick={() => handleCompleteJob(job)}
                                isLoading={isSubmitting}
                                fontSize="xs"
                                px={4}
                              >
                                Complete
                              </Button>
                            )}
                            {job.status === 'Completed' && (
                              <Button
                                size="sm"
                                colorScheme="gray"
                                leftIcon={<FaCheck />}
                                isDisabled
                                fontSize="xs"
                                px={4}
                              >
                                Done
                              </Button>
                            )}
                            <Tooltip label="View Details" hasArrow>
                              <IconButton
                                aria-label="View" icon={<FaEye />} size="sm" variant="ghost" borderRadius="lg"
                                color="slate.400" _hover={{ bg: "brand.50", color: "brand.500" }}
                                onClick={() => handleOpenView(job)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination Footer */}
              {jobs.length > itemsPerPage && (
                <Flex px={8} py={5} justify="space-between" align="center" borderTop="1px solid" borderColor="slate.100" bg="slate.50">
                  <Text fontSize="xs" fontWeight="bold" color="slate.500">
                    Showing <Text as="span" color="slate.800">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, jobs.length)}</Text> of {jobs.length}
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
            </>
          )}
        </Box>
      )}

      {/* View Job Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl">
          <ModalHeader py={6} px={8} borderBottom="1px solid" borderColor="slate.50" bg="slate.50/50" borderTopRadius="3xl">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Badge colorScheme="brand" borderRadius="md" variant="solid">{selectedJob?.ticketNumber}</Badge>
                <Heading size="md" color="slate.800">{selectedJob?.title}</Heading>
              </VStack>
              <ModalCloseButton position="static" borderRadius="full" />
            </HStack>
          </ModalHeader>
          <ModalBody p={8}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Text fontSize="xs" fontWeight="black" color="slate.400" mb={3} textTransform="uppercase">Customer Details</Text>
                <HStack spacing={4}>
                  <Avatar name={selectedJob?.customerName} bg="brand.50" color="brand.500" size="md" />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" color="slate.800">{selectedJob?.customerName}</Text>
                    <Text fontSize="sm" color="slate.500">{selectedJob?.customerPhone}</Text>
                  </VStack>
                </HStack>
              </Box>

              <Divider borderColor="slate.100" />

              <SimpleGrid columns={2} spacing={6}>
                <Box>
                  <Text fontSize="xs" fontWeight="black" color="slate.400" mb={1} textTransform="uppercase">Email</Text>
                  <Text fontWeight="bold" color="slate.700" fontSize="sm">{selectedJob?.customerEmail}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="black" color="slate.400" mb={1} textTransform="uppercase">Phone</Text>
                  <HStack>
                    <Text fontWeight="bold" color="slate.700" fontSize="sm">{selectedJob?.customerPhone}</Text>
                    {selectedJob?.customerPhone && selectedJob.customerPhone !== 'N/A' && (
                      <Button
                        as="a"
                        href={`tel:${selectedJob.customerPhone}`}
                        size="xs"
                        colorScheme="green"
                        variant="solid"
                        leftIcon={<Icon as={FaPhone} />}
                      >
                        Call
                      </Button>
                    )}
                  </HStack>
                </Box>
                <Box gridColumn="span 2">
                  <Text fontSize="xs" fontWeight="black" color="slate.400" mb={1} textTransform="uppercase">Location</Text>
                  <Text fontWeight="bold" color="slate.700" fontSize="sm" mb={2}>{selectedJob?.address}</Text>
                  {selectedJob?.address && selectedJob.address !== 'N/A' && (
                    <Button
                      as="a"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.address)}`}
                      target="_blank"
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      leftIcon={<Icon as={FaRoute} />}
                    >
                      Open in Google Maps
                    </Button>
                  )}
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="black" color="slate.400" mb={1} textTransform="uppercase">Scheduled</Text>
                  <Badge colorScheme="green" fontSize="sm">{selectedJob?.time}</Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="black" color="slate.400" mb={1} textTransform="uppercase">Priority</Text>
                  <Text fontWeight="bold" color={getPriorityColor(selectedJob?.priority) + ".500"}>{selectedJob?.priority}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="black" color="slate.400" mb={1} textTransform="uppercase">Status</Text>
                  <Badge variant="outline" colorScheme="blue">{selectedJob?.status}</Badge>
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="black" color="slate.400" mb={1} textTransform="uppercase">Due Date</Text>
                  <Text fontWeight="bold" color="slate.700" fontSize="sm">{selectedJob?.dueDate}</Text>
                </Box>
              </SimpleGrid>

              {selectedJob?.amcInfo && (
                <Box bg="blue.50" p={4} borderRadius="xl" border="1px solid" borderColor="blue.100">
                  <Text fontSize="xs" fontWeight="black" color="blue.600" mb={3} textTransform="uppercase">AMC Details</Text>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="bold" color="slate.700">Plan</Text>
                      <Text fontSize="sm" color="slate.600">{selectedJob.amcInfo.planName}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="bold" color="slate.700">Services Used</Text>
                      <Badge colorScheme="blue">{selectedJob.amcInfo.servicesUsed}/{selectedJob.amcInfo.servicesTotal}</Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="bold" color="slate.700">Remaining</Text>
                      <Badge colorScheme="green">{selectedJob.amcInfo.servicesRemaining}</Badge>
                    </HStack>
                  </VStack>
                </Box>
              )}

              <Box bg="slate.50" p={4} borderRadius="xl">
                <Text fontSize="xs" fontWeight="black" color="slate.400" mb={2} textTransform="uppercase">Full Notes</Text>
                <Text fontSize="sm" color="slate.600" fontStyle="italic">{selectedJob?.notes}</Text>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Complete Job Modal */}
      <Modal isOpen={isCompleteOpen} onClose={onCompleteClose} isCentered size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="3xl">
          <ModalHeader py={6} px={8} borderBottom="1px solid" borderColor="slate.50">
            <VStack align="start" spacing={1}>
              <Heading size="md" color="slate.800">Complete Job</Heading>
              <Text fontSize="sm" color="slate.500" fontWeight="medium">{selectedJob?.ticketNumber}</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton mt={4} mr={4} borderRadius="full" />
          <ModalBody p={8}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="black" color="slate.700">Upload Completion Photo</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  display="none"
                  id="photo-upload"
                />
                <Button
                  as="label"
                  htmlFor="photo-upload"
                  w="full"
                  h="40"
                  borderRadius="2xl"
                  border="2px dashed"
                  borderColor="slate.200"
                  bg="slate.50"
                  cursor="pointer"
                  _hover={{ bg: "slate.100", borderColor: "brand.300" }}
                >
                  {photoPreview ? (
                    <Box w="full" h="full" p={2}>
                      <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }} />
                    </Box>
                  ) : (
                    <VStack spacing={2}>
                      <Icon as={FaCamera} fontSize="2xl" color="slate.400" />
                      <Text fontSize="sm" fontWeight="bold" color="slate.500">Click to upload photo</Text>
                    </VStack>
                  )}
                </Button>
              </FormControl>

              {photoPreview && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => { setCompletionPhoto(null); setPhotoPreview(null); }}
                >
                  Remove Photo
                </Button>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="slate.50" py={5} px={8}>
            <Button variant="ghost" mr={3} onClick={onCompleteClose} borderRadius="xl" fontWeight="bold" color="slate.500">Cancel</Button>
            <Button
              colorScheme="green"
              onClick={handleSubmitCompletion}
              isLoading={isSubmitting}
              borderRadius="xl"
              fontWeight="bold"
              px={8}
              leftIcon={<FaCheck />}
            >
              Complete Job
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </VStack>
  );
};

export default AssignedJobs;
