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
  Button, 
  Divider, 
  Center,
  Select,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Badge,
  Collapse,
  Switch,
  useToast
} from "@chakra-ui/react";
import { 
  FaFilePdf, 
  FaFileExcel, 
  FaChartBar, 
  FaSync,
  FaCalendarAlt,
  FaFilter,
  FaChevronDown,
  FaDownload,
  FaChartLine,
  FaClipboardList,
  FaUserCheck,
  FaMoneyBillWave
} from "react-icons/fa";

// Stat Card Component for "Simple" high-level view
const StatCard = ({ label, value, icon, color }) => (
  <Box 
    bg="white" 
    p={6} 
    borderRadius="2xl" 
    border="1px solid" 
    borderColor="slate.50" 
    boxShadow="sm"
    transition="transform 0.2s"
    _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
  >
    <Flex justify="space-between" align="start">
      <VStack align="start" spacing={1}>
        <Text fontSize="xs" fontWeight="black" color="slate.400" textTransform="uppercase" letterSpacing="wider">{label}</Text>
        <Heading size="lg" fontWeight="black" color="slate.800">{value}</Heading>
      </VStack>
      <Center w={10} h={10} bg={`${color}.50`} color={`${color}.500`} borderRadius="xl">
        <Icon as={icon} />
      </Center>
    </Flex>
  </Box>
);

const Reports = () => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const toast = useToast();

    const stats = [];

    const reportTypes = [];

    const handleGenerate = () => {
        toast({
            title: "Report Generation Started",
            description: "Your custom report is being generated and will be downloaded shortly.",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right",
            variant: "subtle"
        });
    }

  return (
    <VStack spacing={8} align="stretch" w="full">
      {/* Header & Simple Stats */}
      <Flex direction="column" gap={6}>
        <Flex justify="space-between" align="end">
            <Flex direction="column" gap={1}>
                <Heading size="md" fontWeight="black" color="slate.800">Analytics & Reports</Heading>
                <Text color="slate.500" fontSize="sm">Track performance and export detailed records</Text>
            </Flex>
            <Button 
                variant="ghost" 
                size="sm" 
                color="slate.400" 
                leftIcon={<FaSync />}
                _hover={{ color: "brand.500", bg: "brand.50" }}
            >
                Refresh Data
            </Button>
        </Flex>

        {/* Quick Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
            ))}
        </SimpleGrid>
      </Flex>

      {/* Advanced Generator Section */}
      <Box 
        bg="white" 
        borderRadius="3xl" 
        border="1px solid" 
        borderColor={showAdvanced ? "brand.200" : "slate.50"}
        boxShadow={showAdvanced ? "lg" : "sm"}
        overflow="hidden"
        transition="all 0.3s"
      >
          <Flex p={6} justify="space-between" align="center" bg={showAdvanced ? "brand.50" : "white"} borderBottom={showAdvanced ? "1px solid" : "none"} borderColor="brand.100">
             <HStack spacing={4}>
                <Center w={10} h={10} bg={showAdvanced ? "white" : "slate.50"} color={showAdvanced ? "brand.500" : "slate.400"} borderRadius="xl" shadow="sm">
                    <Icon as={FaFilter} />
                </Center>
                <VStack align="start" spacing={0}>
                    <Heading size="sm" fontWeight="black" color="slate.800">Custom Report Generator</Heading>
                    <Text fontSize="xs" fontWeight="medium" color="slate.500">Create specific reports with custom filters</Text>
                </VStack>
             </HStack>
             
             <HStack bg={showAdvanced ? "white" : "slate.50"} p={1} borderRadius="lg" border="1px solid" borderColor={showAdvanced ? "brand.100" : "slate.100"}>
                <Text fontSize="xs" fontWeight="bold" color={showAdvanced ? "brand.500" : "slate.400"} px={3}>
                    {showAdvanced ? "Advanced Mode" : "Simple Mode"}
                </Text>
                <Switch 
                    colorScheme="brand" 
                    isChecked={showAdvanced} 
                    onChange={(e) => setShowAdvanced(e.target.checked)}
                    size="sm" 
                />
             </HStack>
          </Flex>

          <Collapse in={showAdvanced} animateOpacity>
             <Box p={8} bg="white">
                <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="black" textTransform="uppercase" color="slate.500" ml={1}>Date Range</FormLabel>
                            <Select size="lg" borderRadius="2xl" bg="slate.50" border="1px solid" borderColor="slate.100" fontWeight="semibold" fontSize="sm">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Month</option>
                                <option>Last Quarter</option>
                                <option>Custom Range</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="black" textTransform="uppercase" color="slate.500" ml={1}>Report Category</FormLabel>
                            <Select size="lg" borderRadius="2xl" bg="slate.50" border="1px solid" borderColor="slate.100" fontWeight="semibold" fontSize="sm">
                                <option>All Categories</option>
                                <option>Tickets & Complaints</option>
                                <option>Sales & Leads</option>
                                <option>Inventory & Parts</option>
                                <option>Employee Performance</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="xs" fontWeight="black" textTransform="uppercase" color="slate.500" ml={1}>Format</FormLabel>
                            <Select size="lg" borderRadius="2xl" bg="slate.50" border="1px solid" borderColor="slate.100" fontWeight="semibold" fontSize="sm">
                                <option>PDF Document</option>
                                <option>Excel Spreadsheet (XLSX)</option>
                                <option>CSV Raw Data</option>
                            </Select>
                        </FormControl>
                    </SimpleGrid>
                    
                    <Divider borderColor="slate.50" />
                    
                    <Flex justify="flex-end" gap={4}>
                         <Button variant="ghost" color="slate.400" borderRadius="xl" onClick={() => setShowAdvanced(false)}>Cancel</Button>
                         <Button 
                            colorScheme="brand" 
                            px={8} 
                            h="12" 
                            borderRadius="xl" 
                            boxShadow="lg" 
                            leftIcon={<FaDownload />}
                            onClick={handleGenerate}
                            fontWeight="bold"
                         >
                            Generate Custom Report
                         </Button>
                    </Flex>
                </VStack>
             </Box>
          </Collapse>
      </Box>

      {/* Pre-defined Reports Grid */}
      <VStack align="stretch" spacing={4}>
         <Heading size="sm" fontWeight="black" color="slate.700" px={1}>Available Reports</Heading>
         <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {reportTypes.map((report, index) => (
            <Box 
                key={index} 
                bg="white" 
                p={6} 
                borderRadius="3xl" 
                border="1px solid" 
                borderColor="slate.50" 
                boxShadow="sm"
                transition="all 0.3s"
                _hover={{ shadow: "xl", transform: "translateY(-4px)", borderColor: "brand.100" }}
                role="group"
            >
                <Flex direction="column" h="full">
                    <Flex justify="space-between" align="start" mb={4}>
                        <Badge 
                            variant="subtle" 
                            colorScheme="brand" 
                            borderRadius="lg" 
                            px={2} py={1} 
                            fontSize="9px" 
                            fontWeight="black" 
                            textTransform="uppercase"
                        >
                            {report.type}
                        </Badge>
                        <Text fontSize="xs" fontWeight="bold" color="slate.300">{report.lastGenerated}</Text>
                    </Flex>

                    <VStack align="start" spacing={1} mb={6} flex={1}>
                        <Heading size="sm" color="slate.800" fontWeight="black">{report.title}</Heading>
                        <Text fontSize="xs" color="slate.500" fontWeight="medium" noOfLines={2}>{report.desc}</Text>
                    </VStack>

                    <HStack spacing={2} pt={4} borderTop="1px solid" borderColor="slate.50">
                        <Button 
                            flex={1}
                            size="sm"
                            variant="ghost"
                            color="slate.400"
                            _hover={{ bg: "red.50", color: "red.500" }}
                            leftIcon={<FaFilePdf />}
                            borderRadius="xl"
                            fontSize="xs"
                        >
                        PDF
                        </Button>
                        <Box w="1px" h="4" bg="slate.100" />
                        <Button 
                            flex={1}
                            size="sm"
                            variant="ghost"
                            color="slate.400"
                            _hover={{ bg: "green.50", color: "green.500" }}
                            leftIcon={<FaFileExcel />}
                            borderRadius="xl"
                            fontSize="xs"
                        >
                        Excel
                        </Button>
                    </HStack>
                </Flex>
            </Box>
            ))}
        </SimpleGrid>
      </VStack>
    </VStack>
  );
};

export default Reports;
