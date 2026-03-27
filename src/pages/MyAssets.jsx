import React, { useState, useEffect } from "react";
import {
  Box, VStack, Heading, Text, SimpleGrid, Badge, Button,
  useToast, Spinner, Center, HStack, Icon, Flex
} from "@chakra-ui/react";
import { FaLaptop, FaCar, FaTools, FaPencilAlt, FaSimCard, FaTshirt, FaBox, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const assetIcons = {
  Electronics: FaLaptop,
  Vehicle: FaCar,
  Tools: FaTools,
  Stationery: FaPencilAlt,
  "Sim Card": FaSimCard,
  Uniform: FaTshirt,
  Other: FaBox
};

const MyAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyAssets();
  }, []);

  const fetchMyAssets = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id || user?.id;
      
      if (!userId) {
        toast({ title: "Error", description: "User not found. Please login again.", status: "error", duration: 3000 });
        setLoading(false);
        return;
      }
      
      const { data } = await api.get(`/employee-assets/my-assets/${userId}`);
      setAssets(data.assets);
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to fetch assets", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Center h="50vh"><Spinner size="xl" color="brand.500" /></Center>;
  }

  return (
    <VStack spacing={8} align="stretch" w="full" pb={10}>
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="900" color="slate.800">My Assets</Heading>
          <Text color="slate.500" fontSize="sm">Assets assigned to you</Text>
        </VStack>
        <HStack spacing={2}>
          <Button size="sm" colorScheme="purple" leftIcon={<FaHistory />} onClick={() => navigate('/assets-history')}>View History</Button>
          <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="lg">{assets.length} Assets</Badge>
        </HStack>
      </Flex>

      {assets.length === 0 ? (
        <Box bg="white" p={10} borderRadius="2xl" textAlign="center">
          <Text color="slate.500">No assets assigned to you</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {assets.map((asset) => (
            <Box key={asset._id} bg="white" p={6} borderRadius="2xl" border="1px solid" borderColor="slate.100" boxShadow="sm" _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }} transition="all 0.3s">
              <HStack justify="space-between" mb={4}>
                <Icon as={assetIcons[asset.assetType] || FaBox} fontSize="2xl" color="brand.500" />
                <Badge colorScheme={asset.condition === "New" ? "green" : asset.condition === "Good" ? "blue" : "orange"}>{asset.condition}</Badge>
              </HStack>
              <Heading size="md" mb={2} color="slate.800">{asset.assetName}</Heading>
              <Text fontSize="sm" color="slate.500" mb={1}>ID: {asset.uniqueId}</Text>
              <Text fontSize="sm" color="slate.500" mb={1}>Type: {asset.assetType}</Text>
              {asset.modelNumber && <Text fontSize="sm" color="slate.500" mb={3}>Model: {asset.modelNumber}</Text>}
              <HStack spacing={2} mt={4}>
                <Badge colorScheme="green" px={3} py={1} borderRadius="lg" fontSize="sm">Assigned to You</Badge>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

    </VStack>
  );
};

export default MyAssets;
