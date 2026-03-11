import api from '../services/api';
import React, { useState, useEffect } from "react";
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  SimpleGrid, 
  Icon, 
  VStack, 
  HStack, 
  Select, 
  Button,
  Badge,
  Center,
  Square,
  Spinner,
  useToast
} from "@chakra-ui/react";
import { 
  FaTicketAlt, 
  FaUserPlus, 
  FaCheckCircle, 
  FaClock, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// API Base URL - Update this based on your environment
const API_BASE_URL = "http://localhost:5000/api";

// StatCard Component
const StatCard = ({ icon, label, value, colorScheme, trend, trendValue }) => {
  const isPositive = trend === "up";
  
  return (
    <Box 
      bg="white" 
      p={6} 
      borderRadius="2xl" 
      border="1px solid" 
      borderColor="slate.50" 
      boxShadow="sm" 
      transition="all 0.3s" 
      _hover={{ transform: "translateY(-2px)", boxShadow: "xl", borderColor: "brand.100" }}
      position="relative" 
      overflow="hidden"
    >
      <Flex justify="space-between" align="start" mb={4}>
        <VStack align="start" spacing={0}>
            <Text fontSize="xs" fontWeight="bold" color="slate.400" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
                {label}
            </Text>
            <Heading size="2xl" color="slate.800" fontWeight="900" lineHeight="1">
                {value}
            </Heading>
        </VStack>
        <Center 
            w={10} 
            h={10} 
            bg={`${colorScheme}.50`} 
            color={`${colorScheme}.500`} 
            borderRadius="xl"
            border="1px solid"
            borderColor={`${colorScheme}.100`}
        >
            <Icon as={icon} fontSize="lg" />
        </Center>
      </Flex>
      
      {trendValue && (
        <HStack spacing={2} align="center">
            <HStack 
              spacing={1} 
              bg={isPositive ? "emerald.50" : "rose.50"} 
              color={isPositive ? "emerald.600" : "rose.600"}
              px={2} 
              py={0.5} 
              borderRadius="md"
            >
              <Icon as={isPositive ? FaArrowUp : FaArrowDown} fontSize="xs" />
              <Text fontSize="xs" fontWeight="bold">{trendValue}%</Text>
            </HStack>
            <Text fontSize="10px" fontWeight="bold" color="slate.300" textTransform="uppercase">
                vs last month
            </Text>
        </HStack>
      )}
    </Box>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingJobs: 0,
    completedJobs: 0,
    newLeads: 0
  });
  const [chartData, setChartData] = useState({
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      { name: 'Tickets', data: [0, 0, 0, 0, 0, 0, 0], color: '#2197d7' },
      { name: 'Leads', data: [0, 0, 0, 0, 0, 0, 0], color: '#f89944' }
    ]
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get employee name from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const employeeName = user?.name || user?.employeeName || user?.firstName;
      
      // Pass employee name as query param
      const response = await api.get('/employee-dashboard/stats', {
        params: { employeeName }
      });
      const { stats: dashboardStats, chart, recentTasks: tasks } = response.data;
      
      setStats({
        totalTickets: dashboardStats.totalTickets,
        pendingJobs: dashboardStats.pendingJobs,
        completedJobs: dashboardStats.completedJobs,
        newLeads: dashboardStats.newLeads
      });
      
      setChartData({
        categories: chart.categories,
        series: [
          { name: 'Tickets', data: chart.series[0].data, color: '#2197d7' },
          { name: 'Leads', data: chart.series[1].data, color: '#f89944' }
        ]
      });
      
      setRecentTasks(tasks);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error fetching data",
        description: "Could not load dashboard stats. Please check your connection.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Highcharts Configuration
  const chartOptions = {
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      height: 300,
      style: {
        fontFamily: "'Source Sans 3', sans-serif"
      }
    },
    title: { text: null },
    xAxis: {
      categories: chartData.categories,
      gridLineWidth: 0,
      lineWidth: 0,
      labels: {
        style: { color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }
      }
    },
    yAxis: {
      gridLineColor: '#f8fafc',
      gridLineDashStyle: 'Dash',
      title: { text: null },
      labels: {
        style: { color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }
      }
    },
    legend: { 
        enabled: true,
        align: 'right',
        verticalAlign: 'top',
        itemStyle: { color: '#64748b', fontWeight: 'bold', fontSize: '11px' }
    },
    tooltip: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      borderWidth: 0,
      shadow: true,
      useHTML: true,
      headerFormat: '<span style="font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase;">{point.key}</span><br/>',
      pointFormat: '<span style="color:{point.color}">\u25CF</span> <b style="color: #1e293b">{series.name}: {point.y}</b>'
    },
    plotOptions: {
      column: {
        borderRadius: 6,
        borderWidth: 0,
        groupPadding: 0.2,
        pointPadding: 0.05
      }
    },
    series: chartData.series,
    credits: { enabled: false }
  };

  if (loading) {
      return (
          <Center h="50vh">
              <Spinner size="xl" color="brand.500" thickness="4px" />
          </Center>
      );
  }

  return (
    <VStack spacing={8} align="stretch" w="full" pb={10}>
      {/* Page Header */}
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="900" color="slate.800" letterSpacing="-0.02em">
            Dashboard
          </Heading>
          <Text color="slate.500" fontSize="sm" fontWeight="medium">
            Overview of your daily activities & performance
          </Text>
        </VStack>
        <HStack 
          bg="white" 
          px={4} 
          py={2} 
          borderRadius="xl" 
          border="1px solid" 
          borderColor="slate.100" 
          shadow="sm"
          spacing={3}
        >
          <Icon as={FaCalendarAlt} color="slate.400" fontSize="sm" />
          <Text fontSize="xs" fontWeight="bold" color="slate.600">
            Oct 24, 2024 - Oct 30, 2024
          </Text>
        </HStack>
      </Flex>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
        <StatCard icon={FaTicketAlt} label="Total Tickets" value={stats.totalTickets} colorScheme="brand" />
        <StatCard icon={FaClock} label="Pending Jobs" value={stats.pendingJobs} colorScheme="orange" />
        <StatCard icon={FaCheckCircle} label="Completed" value={stats.completedJobs} colorScheme="emerald" />
        <StatCard icon={FaUserPlus} label="New Leads" value={stats.newLeads} colorScheme="blue" />
      </SimpleGrid>

      {/* Charts & Tasks Section */}
      <SimpleGrid columns={{ base: 1, xl: 5 }} spacing={8}>
        {/* Weekly Performance Highcharts */}
        <Box 
            bg="white" 
            p={8} 
            borderRadius="3xl" 
            border="1px solid" 
            borderColor="slate.50" 
            boxShadow="sm" 
            gridColumn={{ xl: "span 3" }}
        >
          <Flex justify="space-between" align="center" mb={8}>
            <VStack align="start" spacing={0}>
                <Heading size="md" fontWeight="900" color="slate.800">Weekly Performance</Heading>
                <Text fontSize="xs" color="slate.400" fontWeight="bold">Activity comparison for this week</Text>
            </VStack>
            <Select 
              size="sm" w="44" variant="filled" borderRadius="xl" bg="slate.50" fontSize="xs" fontWeight="900"
              _focus={{ bg: "slate.100", borderColor: "brand.300" }}
            >
              <option>Tickets & Leads</option>
              <option>Installation Revenue</option>
            </Select>
          </Flex>
          <Box w="full">
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </Box>
        </Box>

        {/* Recent Assignments List */}
        <Box 
            bg="white" 
            p={8} 
            borderRadius="3xl" 
            border="1px solid" 
            borderColor="slate.50" 
            boxShadow="sm" 
            gridColumn={{ xl: "span 2" }}
        >
          <Flex justify="space-between" align="center" mb={8}>
            <VStack align="start" spacing={0}>
                <Heading size="md" fontWeight="900" color="slate.800">Recent Tasks</Heading>
                <Text fontSize="xs" color="slate.400" fontWeight="bold">Your latest field assignments</Text>
            </VStack>
            <Button variant="ghost" size="sm" fontSize="xs" fontWeight="900" color="brand.600" textTransform="uppercase" letterSpacing="widest">
              View All
            </Button>
          </Flex>
          <VStack spacing={6} align="stretch">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <HStack key={task.id} gap={4} role="group" transition="all 0.2s" cursor="pointer" p={2} borderRadius="xl" _hover={{ bg: "slate.50" }}>
                  <Square 
                    size="12" bg="white" color="slate.300" borderRadius="xl" border="1px solid" borderColor="slate.100"
                    _groupHover={{ borderColor: "brand.200", color: "brand.500" }} transition="all 0.4s"
                  >
                    <Icon as={FaTicketAlt} fontSize="lg" />
                  </Square>
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontWeight="800" color="slate.700" fontSize="sm">
                      {task.type} - {task.customer}
                    </Text>
                    <HStack spacing={2}>
                      {task.isUrgent && <Badge variant="subtle" colorScheme="red" fontSize="9px" px={2} borderRadius="md" fontWeight="bold">URGENT</Badge>}
                      <Text fontSize="xs" color="slate.400" fontWeight="bold">{task.time}</Text>
                    </HStack>
                  </VStack>
                  <Badge
                    px={3} py={1} borderRadius="full" fontSize="9px" fontWeight="900" textTransform="uppercase" letterSpacing="wider"
                    bg={task.status === "Open" ? "orange.50" : (task.status === "Resolved" ? "emerald.50" : "brand.50")} 
                    color={task.status === "Open" ? "orange.600" : (task.status === "Resolved" ? "emerald.600" : "brand.600")}
                    variant="subtle"
                  >
                    {task.status}
                  </Badge>
                </HStack>
              ))
            ) : (
               <Text fontSize="sm" color="slate.500" textAlign="center" py={4}>No recent tasks found.</Text>
            )}
          </VStack>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

export default Dashboard;
