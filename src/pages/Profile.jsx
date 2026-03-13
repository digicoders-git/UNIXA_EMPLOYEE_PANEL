import React, { useState, useRef } from "react";
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Icon, 
  Avatar, 
  Button, 
  SimpleGrid, 
  Divider, 
  Badge,
  Circle,
  Center,
  Progress,
  Tag,
  TagLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  IconButton,
  Image,
  useToast
} from "@chakra-ui/react";
import { 
  FaUserCircle, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaStar,
  FaEdit,
  FaCheckCircle,
  FaSave,
  FaTimes,
  FaCamera,
  FaUpload
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, login } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPicModalOpen, onOpen: onPicModalOpen, onClose: onPicModalClose } = useDisclosure();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Debug logs
  console.log('Profile component - User object:', user);
  console.log('Profile component - User ID:', user?.id);

  // Initialize form state with user data or dummy data
  const [formData, setFormData] = useState({
    name: user?.name || "",
    role: user?.role || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    workingArea: user?.workingArea || "",
    joiningDate: user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "",
    employeeId: user?.employeeId || ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    login(updatedUser, localStorage.getItem("token"));
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
    onClose();
  };

  const handleFileSelect = (event) => {
    console.log('File select triggered');
    const file = event.target.files[0];
    console.log('Selected file:', file);
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        console.log('File too large:', file.size);
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      console.log('File validation passed, setting preview');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File reader loaded');
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      onPicModalOpen();
    }
  };

  const handleUploadProfilePicture = async () => {
    console.log('Upload function called');
    console.log('Selected file:', selectedFile);
    console.log('User ID:', user?.id);
    
    if (!selectedFile) {
      console.log('No file selected');
      return;
    }
    
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);
      
      console.log('Making API call to:', `/employees/${user.id}/profile-picture`);
      
      const response = await api.put(`/employees/${user.id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Upload response:', response.data);
      
      const updatedUser = { ...user, profilePicture: response.data.profilePicture };
      login(updatedUser, localStorage.getItem('token'));
      
      toast({
        title: 'Profile Picture Updated!',
        description: 'Your profile picture has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onPicModalClose();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload profile picture',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCameraClick = () => {
    console.log('Camera button clicked');
    fileInputRef.current?.click();
  };

  return (
    <Box maxW="5xl" mx="auto" w="full">
      <VStack spacing={0} align="stretch" borderRadius="3xl" overflow="hidden" border="1px solid" borderColor="slate.50" boxShadow="sm" bg="white">
        
        {/* Header Section */}
        <Box p={{ base: 8, md: 10 }} borderBottom="1px solid" borderColor="slate.50" bg="slate.50/30">
           <Flex direction={{ base: "column", md: "row" }} align="center" gap={8}>
              {/* Avatar */}
              <Circle size="32" bg="white" border="1px solid" borderColor="slate.100" position="relative" boxShadow="sm">
                 <Avatar 
                    size="2xl" 
                    icon={<FaUserCircle fontSize="4rem" />}
                    bg="transparent"
                    color="brand.500"
                    src={user?.profilePicture || ""} 
                    name={user?.name}
                 />
                 <input
                   type="file"
                   ref={fileInputRef}
                   onChange={handleFileSelect}
                   accept="image/*"
                   style={{ display: 'none' }}
                 />
                 <IconButton
                   icon={<FaCamera />}
                   size="sm"
                   colorScheme="brand"
                   borderRadius="full"
                   position="absolute"
                   bottom={2}
                   right={2}
                   boxShadow="lg"
                   border="3px solid white"
                   _hover={{ transform: 'scale(1.1)' }}
                   onClick={handleCameraClick}
                   aria-label="Change profile picture"
                   zIndex={10}
                   bg="brand.500"
                   color="white"
                 />
                 <Circle 
                    size={8} 
                    bg="emerald.500" 
                    position="absolute" 
                    bottom={1} 
                    right={1} 
                    border="4px solid white"
                 />
              </Circle>
              
              {/* Alternative Upload Button */}
              <Button
                leftIcon={<FaCamera />}
                size="sm"
                colorScheme="brand"
                variant="outline"
                borderRadius="xl"
                onClick={handleCameraClick}
                mt={2}
              >
                Change Photo
              </Button>
              
              {/* Simple File Upload Section */}
              <VStack spacing={3} mt={4}>
                <Text fontSize="sm" fontWeight="bold" color="slate.600">Profile Picture</Text>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{
                    padding: '8px',
                    border: '2px dashed #CBD5E0',
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: '300px'
                  }}
                />
                <Text fontSize="xs" color="slate.500" textAlign="center">
                  Choose an image file (max 5MB)
                </Text>
              </VStack>

              {/* Main Details */}
              <VStack align={{ base: "center", md: "start" }} spacing={1} flex={1}>
                 <HStack>
                    <Heading size="xl" color="slate.800" fontWeight="900" letterSpacing="-0.02em">{formData.name}</Heading>
                    <Icon as={FaCheckCircle} color="brand.500" fontSize="xl" /> 
                 </HStack>
                 
                 <Text fontSize="md" fontWeight="bold" color="slate.500">{formData.role}</Text>

                 <HStack spacing={3} flexWrap="wrap" justify={{ base: "center", md: "start" }} pt={2}>
                    <Badge colorScheme="slate" variant="subtle" px={3} py={1.5} borderRadius="lg" fontSize="xs" fontWeight="bold">
                        {formData.employeeId}
                    </Badge>
                     <HStack spacing={1} color="slate.400">
                        <Icon as={FaMapMarkerAlt} fontSize="xs" />
                        <Text fontSize="xs" fontWeight="bold">{formData.location}</Text>
                     </HStack>
                 </HStack>
              </VStack>

              {/* Action Buttons */}
              <HStack>
                 <Button 
                   leftIcon={<FaEdit />} 
                   variant="outline" 
                   borderRadius="xl" 
                   fontWeight="bold" 
                   color="slate.500" 
                   borderColor="slate.200" 
                   _hover={{ bg: "white", color: "brand.500", borderColor: "brand.200" }} 
                   size="lg"
                   onClick={onOpen}
                 >
                    Edit Profile
                 </Button>
              </HStack>
           </Flex>
        </Box>

        {/* Profile Details Grid */}
        <Box p={{ base: 8, md: 12 }}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={12}>
            {/* Info Section */}
            <VStack align="stretch" spacing={10} gridColumn={{ lg: "span 2" }}>
              <Box>
                <Heading size="xs" mb={6} color="slate.400" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">Contact Information</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  <ContactItem icon={FaEnvelope} label="Email Address" value={formData.email} />
                  <ContactItem icon={FaPhone} label="Phone Number" value={formData.phone} />
                  <ContactItem icon={FaMapMarkerAlt} label="Working Area" value={formData.workingArea} />
                  <ContactItem icon={FaBriefcase} label="Joining Date" value={formData.joiningDate} />
                </SimpleGrid>
              </Box>

              <Divider borderColor="slate.50" />

              <Box>
                <Heading size="xs" mb={6} color="slate.400" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">Expertise & Skills</Heading>
                <Flex flexWrap="wrap" gap={3}>
                  {["RO Repair", "Water Softener", "Fault Diagnostics", "Customer Support", "Inventory Management", "Wiring"].map(skill => (
                    <Tag key={skill} size="lg" borderRadius="xl" variant="outline" colorScheme="slate" py={2} bg="slate.50" border="1px solid" borderColor="slate.100">
                      <TagLabel fontWeight="bold" fontSize="xs" color="slate.600">{skill}</TagLabel>
                    </Tag>
                  ))}
                </Flex>
              </Box>
            </VStack>

            {/* Stats Section */}
            <VStack align="stretch" spacing={6}>
              <Box bg="slate.50" p={8} borderRadius="3xl" border="1px solid" borderColor="slate.100" textAlign="center">
                <Heading size="xs" mb={8} color="slate.400" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">Performance Score</Heading>
                <Center position="relative" mb={{ base: 4, md: 6 }}>
                  <Circle size="32" border="10px solid" borderColor="brand.500" borderTopColor="slate.200" transform="rotate(-45deg)" />
                  <VStack position="absolute" spacing={0} transform="rotate(45deg)">
                    <Text fontSize="3xl" fontWeight="900" color="slate.800">4.8</Text>
                    <HStack spacing={1} color="brand.400">
                      <Icon as={FaStar} fontSize="xs" />
                      <Icon as={FaStar} fontSize="xs" />
                      <Icon as={FaStar} fontSize="xs" />
                      <Icon as={FaStar} fontSize="xs" />
                      <Icon as={FaStar} fontSize="xs" />
                    </HStack>
                  </VStack>
                </Center>
                <Text fontSize="10px" fontWeight="900" color="slate.400" textTransform="uppercase" letterSpacing="0.1em">Based on 124 reviews</Text>
              </Box>

              <Box bg="brand.600" color="white" p={8} borderRadius="3xl" boxShadow="xl" position="relative" overflow="hidden">
                <Box position="absolute" top={0} right={0} p={4} opacity={0.1}>
                    <Icon as={FaStar} fontSize="6xl" />
                </Box>
                <Heading size="xs" mb={6} fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">Job Completion</Heading>
                <VStack align="stretch" spacing={4}>
                  <Flex justify="space-between" fontSize="sm" fontWeight="bold">
                    <Text>Efficiency</Text>
                    <Text>92%</Text>
                  </Flex>
                  <Progress value={92} colorScheme="whiteAlpha" h="2" borderRadius="full" bg="whiteAlpha.300" />
                  <Text fontSize="xs" fontWeight="medium" opacity={0.9} lineHeight="1.6">
                    You completed 34 jobs this month with zero rework requests. Great job!
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </SimpleGrid>
        </Box>
      </VStack>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
        <ModalContent borderRadius="3xl" p={4} boxShadow="2xl">
          <ModalHeader>
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="slate.800" fontWeight="900" letterSpacing="-0.02em">Edit Profile</Heading>
              <Text fontSize="sm" color="slate.500" fontWeight="medium">Update your personal and professional information</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton borderRadius="full" top={6} right={6} size="lg" />
          
          <ModalBody>
            <VStack spacing={6} pt={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="900" color="slate.600" textTransform="uppercase" letterSpacing="0.05em">Full Name</FormLabel>
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    bg="slate.50"
                    border="1px solid"
                    borderColor="slate.100"
                    borderRadius="xl"
                    _focus={{ bg: "white", borderColor: "brand.300", ring: 1, ringColor: "brand.100" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="900" color="slate.600" textTransform="uppercase" letterSpacing="0.05em">Designation</FormLabel>
                  <Input 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Enter designation"
                    bg="slate.50"
                    border="1px solid"
                    borderColor="slate.100"
                    borderRadius="xl"
                    _focus={{ bg: "white", borderColor: "brand.300", ring: 1, ringColor: "brand.100" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="900" color="slate.600" textTransform="uppercase" letterSpacing="0.05em">Email Address</FormLabel>
                  <Input 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    bg="slate.50"
                    border="1px solid"
                    borderColor="slate.100"
                    borderRadius="xl"
                    _focus={{ bg: "white", borderColor: "brand.300", ring: 1, ringColor: "brand.100" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="900" color="slate.600" textTransform="uppercase" letterSpacing="0.05em">Phone Number</FormLabel>
                  <Input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    bg="slate.50"
                    border="1px solid"
                    borderColor="slate.100"
                    borderRadius="xl"
                    _focus={{ bg: "white", borderColor: "brand.300", ring: 1, ringColor: "brand.100" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="900" color="slate.600" textTransform="uppercase" letterSpacing="0.05em">Location</FormLabel>
                  <Input 
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    bg="slate.50"
                    border="1px solid"
                    borderColor="slate.100"
                    borderRadius="xl"
                    _focus={{ bg: "white", borderColor: "brand.300", ring: 1, ringColor: "brand.100" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="900" color="slate.600" textTransform="uppercase" letterSpacing="0.05em">Working Area</FormLabel>
                  <Input 
                    name="workingArea"
                    value={formData.workingArea}
                    onChange={handleInputChange}
                    placeholder="Enter working area"
                    bg="slate.50"
                    border="1px solid"
                    borderColor="slate.100"
                    borderRadius="xl"
                    _focus={{ bg: "white", borderColor: "brand.300", ring: 1, ringColor: "brand.100" }}
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter px={6} pb={6}>
            <HStack spacing={4} w="full">
              <Button 
                variant="ghost" 
                borderRadius="xl" 
                fontWeight="bold" 
                color="slate.500" 
                onClick={onClose}
                leftIcon={<FaTimes />}
                flex={1}
                size="lg"
              >
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                borderRadius="xl" 
                fontWeight="black" 
                onClick={handleSave}
                leftIcon={<FaSave />}
                flex={2}
                size="lg"
                boxShadow="lg"
                _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              >
                Save Changes
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Profile Picture Upload Modal */}
      <Modal isOpen={isPicModalOpen} onClose={onPicModalClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="3xl" overflow="hidden">
          <ModalHeader bg="brand.500" color="white" textAlign="center">
            <Icon as={FaCamera} mr={2} />
            Update Profile Picture
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={8}>
            <VStack spacing={6}>
              {previewUrl && (
                <Box>
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    boxSize="200px"
                    objectFit="cover"
                    borderRadius="full"
                    border="4px solid"
                    borderColor="brand.100"
                    shadow="lg"
                  />
                </Box>
              )}
              
              <Text textAlign="center" color="gray.600" fontSize="sm">
                This will be your new profile picture. Make sure it's clear and professional.
              </Text>
              
              <HStack spacing={4} w="full">
                <Button
                  variant="outline"
                  colorScheme="gray"
                  flex={1}
                  borderRadius="xl"
                  onClick={() => {
                    onPicModalClose();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="brand"
                  flex={1}
                  borderRadius="xl"
                  leftIcon={<FaUpload />}
                  isLoading={uploadLoading}
                  loadingText="Uploading..."
                  onClick={handleUploadProfilePicture}
                  boxShadow="lg"
                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'xl' }}
                >
                  Upload
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ContactItem = ({ icon, label, value }) => (
  <HStack spacing={4} align="start">
    <Center w={12} h={12} bg="slate.50" borderRadius="2xl" color="brand.500" border="1px solid" borderColor="slate.100">
      <Icon as={icon} fontSize="md" />
    </Center>
    <VStack align="start" spacing={0.5}>
      <Text fontSize="9px" fontWeight="900" color="slate.400" textTransform="uppercase" letterSpacing="0.05em">{label}</Text>
      <Text fontSize="sm" fontWeight="bold" color="slate.700" fontFamily="sans-serif">{value}</Text>
    </VStack>
  </HStack>
);

export default Profile;
