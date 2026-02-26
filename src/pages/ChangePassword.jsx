import React, { useState } from "react";
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
  InputRightElement, 
  Button, 
  useToast, 
  Center,
  Divider,
  Stack,
  Switch,
  Progress,
  Checkbox,
  Badge,
  SimpleGrid
} from "@chakra-ui/react";
import { FaLock, FaShieldAlt, FaEye, FaEyeSlash, FaKey, FaMobileAlt, FaLaptop } from "react-icons/fa";

const ChangePassword = () => {
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const toast = useToast();

  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length > 6) strength += 20;
    if (password.length > 10) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  };

  const strength = calculateStrength(formData.newPassword);
  const getStrengthColor = (s) => (s < 40 ? "red" : s < 80 ? "orange" : "emerald");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: "Mismatch", description: "New passwords do not match!", status: "error", duration: 3000, position: "top-right" });
      return;
    }
    toast({ title: "Success", description: "Security settings updated!", status: "success", duration: 3000, position: "top-right" });
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const PasswordInput = ({ label, value, onChange, id, showKey, placeholder }) => (
    <FormControl id={id}>
      <FormLabel fontSize="xs" fontWeight="black" color="slate.500" ml={1} textTransform="uppercase" letterSpacing="wider">{label}</FormLabel>
      <InputGroup size="md">
        <InputLeftElement pointerEvents="none" color="slate.300">
          <Icon as={FaLock} fontSize="xs" />
        </InputLeftElement>
        <Input
          type={showPwd[showKey] ? "text" : "password"}
          required
          bg="slate.50"
          border="1px solid"
          borderColor="slate.100"
          borderRadius="xl"
          _focus={{ bg: "white", borderColor: "brand.300", boxShadow: "md" }}
          fontSize="sm"
          fontWeight="semibold"
          placeholder={placeholder || "••••••••"}
          value={value}
          onChange={onChange}
          h="10"
        />
        <InputRightElement w="3rem">
          <Button h="1.5rem" size="xs" variant="ghost" color="slate.400" onClick={() => setShowPwd({...showPwd, [showKey]: !showPwd[showKey]})}>
            {showPwd[showKey] ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );

  return (
    <Flex align="center" justify="center" h="full" w="full">
      <Box w="full" maxW="5xl" bg="white" borderRadius="3xl" border="1px solid" borderColor="slate.50" boxShadow="sm" overflow="hidden">
           
           <Flex direction={{ base: "column", md: "row" }} h="full">
              {/* Left Panel - Visual/Context */}
              <Box 
                w={{ base: "full", md: "35%" }} 
                bg="slate.50" 
                p={8} 
                borderRight="1px solid" 
                borderColor="slate.100"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                  <VStack align="start" spacing={6}>
                      <Center w={14} h={14} bg="white" color="brand.500" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor="slate.100">
                          <Icon as={FaShieldAlt} fontSize="2xl" />
                      </Center>
                      <Box>
                          <Heading size="md" fontWeight="black" color="slate.800" mb={2}>Security Center</Heading>
                          <Text fontSize="sm" color="slate.500" fontWeight="medium" lineHeight="tall">
                              Update your password regularly to keep your account secure. Use a mix of symbols, numbers, and letters.
                          </Text>
                      </Box>
                  </VStack>

                  <VStack align="stretch" spacing={4}>
                      <Divider borderColor="slate.200" borderStyle="dashed" />
                      <HStack justify="space-between" align="center">
                          <HStack>
                              <Icon as={FaLaptop} color="slate.400" />
                              <Text fontSize="xs" fontWeight="bold" color="slate.600">Windows PC (Chrome)</Text>
                          </HStack>
                          <Badge colorScheme="green" variant="solid" fontSize="9px" borderRadius="md">Active</Badge>
                      </HStack>
                      <HStack justify="space-between" align="center">
                          <HStack>
                              <Icon as={FaMobileAlt} color="slate.400" />
                              <Text fontSize="xs" fontWeight="bold" color="slate.600">iPhone 13 Pro</Text>
                          </HStack>
                          <Text fontSize="xs" fontWeight="bold" color="slate.400">2h ago</Text>
                      </HStack>
                  </VStack>
              </Box>

              {/* Right Panel - Form */}
              <Box w={{ base: "full", md: "65%" }} p={8}>
                 <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="sm" fontWeight="black" color="slate.700">Change Password</Heading>
                    <HStack bg="slate.50" p={1} borderRadius="lg" border="1px solid" borderColor="slate.100" spacing={2}>
                        <Text fontSize="10px" fontWeight="bold" color="slate.500" px={2}>ADVANCED MODE</Text>
                        <Switch 
                            size="sm" 
                            colorScheme="brand" 
                            isChecked={showAdvanced} 
                            onChange={(e) => setShowAdvanced(e.target.checked)} 
                        />
                    </HStack>
                 </Flex>

                 <form onSubmit={handleSubmit}>
                    <VStack spacing={5} align="stretch">
                        
                        {/* Current Password Field */}
                        <PasswordInput 
                            label="Current Password" 
                            id="currentPassword" 
                            showKey="current"
                            placeholder="Enter your current password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        />

                        <Divider borderColor="slate.50" />

                        {/* New Password Grid */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                            <VStack align="stretch" spacing={1}>
                                <PasswordInput 
                                    label="New Password" 
                                    id="newPassword" 
                                    showKey="new"
                                    placeholder="Min 8 chars"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                />
                                {/* Strength Bar */}
                                {formData.newPassword && (
                                    <HStack spacing={1} mt={1}>
                                        <Progress value={strength} size="xs" colorScheme={getStrengthColor(strength)} w="full" borderRadius="full" bg="slate.100" />
                                        <Text fontSize="9px" fontWeight="black" color={`${getStrengthColor(strength)}.500`}>
                                            {strength < 40 ? "WEAK" : strength < 80 ? "GOOD" : "GREAT"}
                                        </Text>
                                    </HStack>
                                )}
                            </VStack>

                            <PasswordInput 
                                label="Confirm Password" 
                                id="confirmPassword" 
                                showKey="confirm"
                                placeholder="Re-enter new password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            />
                        </SimpleGrid>

                        {/* Advanced Checks */}
                        {showAdvanced && (
                            <Box bg="orange.50" p={4} borderRadius="xl" border="1px solid" borderColor="orange.100">
                                <VStack align="stretch" spacing={2}>
                                    <Checkbox colorScheme="orange" size="sm" defaultChecked>
                                        <Text fontSize="xs" fontWeight="bold" color="orange.800">Log out of all devices immediately</Text>
                                    </Checkbox>
                                    <Checkbox colorScheme="orange" size="sm">
                                        <Text fontSize="xs" fontWeight="bold" color="orange.800">Enable Two-Factor Authentication</Text>
                                    </Checkbox>
                                </VStack>
                            </Box>
                        )}

                        <Box pt={2}>
                            <Button
                                type="submit"
                                colorScheme="brand"
                                w="full"
                                size="md"
                                h="12"
                                borderRadius="xl"
                                fontWeight="black"
                                fontSize="xs"
                                textTransform="uppercase"
                                letterSpacing="widest"
                                boxShadow="lg"
                                leftIcon={<FaKey />}
                                _hover={{ transform: "translateY(-1px)", boxShadow: "xl" }}
                            >
                                Update Security Settings
                            </Button>
                        </Box>
                    </VStack>
                 </form>
              </Box>
           </Flex>
      </Box>
    </Flex>
  );
};

export default ChangePassword;
