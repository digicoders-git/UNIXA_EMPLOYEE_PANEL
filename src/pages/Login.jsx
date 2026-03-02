import axios from "axios";
import React, { useState } from "react";
import { 
  Box, 
  Button, 
  Flex, 
  FormControl, 
  FormLabel, 
  Heading, 
  Icon, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  InputRightElement, 
  Stack, 
  Text, 
  useToast,
  VStack,
  Center
} from "@chakra-ui/react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Direct axios call to backend
      const API_URL = import.meta.env.VITE_API_URL || "https://unixa-admin-panel-backend.onrender.com/api";
      const response = await axios.post(`${API_URL}/employees/login`, {
        email: formData.email,
        password: formData.password
      });

      if (response.data.token) {
        login(response.data.user, response.data.token);
        toast({ title: "Login Successful", description: `Welcome back, ${response.data.user.name}!`, status: "success", duration: 3000, position: "top", variant: "subtle" });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorMsg = error.response?.data?.message || "Invalid credentials or server error";
      toast({ title: "Login Failed", description: errorMsg, status: "error", duration: 3000, position: "top", variant: "subtle" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="slate.50" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box 
        w="full" 
        maxW="sm" 
        bg="white" 
        borderRadius="2xl" 
        boxShadow="xl" 
        p={8}
        position="relative"
        border="1px solid"
        borderColor="slate.100"
      >
        <VStack spacing={6} align="stretch">
          <Center mb={2}>
            <VStack spacing={-2}>
              <Text fontSize="5xl" fontWeight="900" color="brand.500" letterSpacing="-0.05em" lineHeight="1" fontFamily="'Source Sans 3', sans-serif">
                UNIXA
              </Text>
              <Text fontSize="10px" fontWeight="900" color="accent.500" letterSpacing="0.6em" textTransform="uppercase">
                EMPLOYEE
              </Text>
            </VStack>
          </Center>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel fontSize="10px" fontWeight="900" color="slate.500" ml={1} textTransform="uppercase" letterSpacing="0.05em">Email Address</FormLabel>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaUser} color="slate.300" fontSize="xs" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="example@sks.com"
                    borderRadius="xl"
                    bg="slate.50"
                    border="1px solid"
                    borderColor="slate.100"
                    _focus={{ borderColor: "brand.500", bg: "white", boxShadow: "sm", ring: 1, ringColor: "brand.100" }}
                    fontSize="sm"
                    fontWeight="bold"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    h="10"
                  />
                </InputGroup>
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel fontSize="10px" fontWeight="900" color="slate.500" ml={1} textTransform="uppercase" letterSpacing="0.05em">Password</FormLabel>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaLock} color="slate.300" fontSize="xs" />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    borderRadius="xl"
                    bg="slate.50"
                    border="1px solid"
                    borderColor="slate.100"
                    _focus={{ borderColor: "brand.500", bg: "white", boxShadow: "sm", ring: 1, ringColor: "brand.100" }}
                    fontSize="sm"
                    fontWeight="bold"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    h="10"
                  />
                  <InputRightElement width="2.5rem">
                    <Button h="1.5rem" size="xs" onClick={() => setShowPassword(!showPassword)} variant="ghost" color="slate.400">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                size="md"
                h="10"
                mt={2}
                colorScheme="brand"
                borderRadius="xl"
                boxShadow="lg"
                isLoading={loading}
                loadingText="Wait..."
                fontSize="xs"
                fontWeight="black"
                textTransform="uppercase"
                letterSpacing="widest"
                _hover={{ transform: "translateY(-1px)", boxShadow: "xl" }}
              >
                Sign In
              </Button>
            </Stack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;
