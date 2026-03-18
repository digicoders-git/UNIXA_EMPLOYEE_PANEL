import React, { useState, useRef } from "react";
import {
  Box, Flex, Heading, Text, VStack, HStack, Icon, Avatar, Button,
  SimpleGrid, Divider, Badge, Circle, Center, Progress, Tag, TagLabel,
  IconButton, Input, useToast
} from "@chakra-ui/react";
import {
  FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase,
  FaStar, FaEdit, FaCheckCircle, FaSave, FaTimes, FaCamera
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api, { getImageUrl } from "../services/api";

const Profile = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    role: user?.role || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    workingArea: user?.workingArea || "",
    joiningDate: user?.joiningDate
      ? new Date(user.joiningDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "",
    employeeId: user?.employeeId || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed", status: "error", duration: 3000, isClosable: true });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please select an image", status: "error", duration: 3000, isClosable: true });
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setUploadLoading(true);
    try {
      if (selectedFile) {
        const fd = new FormData();
        fd.append("profilePicture", selectedFile);
        const response = await api.put(`/employees/${user.id}/profile-picture`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const updatedUser = { ...user, profilePicture: response.data.profilePicture, ...formData };
        login(updatedUser, localStorage.getItem("token"));
      } else {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        login({ ...currentUser, ...formData }, localStorage.getItem("token"));
      }
      toast({ title: "Profile Updated", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error.response?.data?.message || "Something went wrong",
        status: "error", duration: 3000, isClosable: true,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      role: user?.role || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      workingArea: user?.workingArea || "",
      joiningDate: user?.joiningDate
        ? new Date(user.joiningDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "",
      employeeId: user?.employeeId || "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  const avatarSrc = previewUrl || getImageUrl(user?.profilePicture);

  return (
    <Box maxW="5xl" mx="auto" w="full">
      <VStack spacing={0} align="stretch" borderRadius="3xl" overflow="hidden" border="1px solid" borderColor="slate.50" boxShadow="sm" bg="white">

        {/* Header */}
        <Box p={{ base: 8, md: 10 }} borderBottom="1px solid" borderColor="slate.50" bg="slate.50/30">
          <Flex direction={{ base: "column", md: "row" }} align="center" gap={8}>

            {/* Avatar with camera */}
            <Circle size="32" bg="white" border="1px solid" borderColor="slate.100" position="relative" boxShadow="sm">
              <Avatar
                size="2xl"
                icon={<FaUserCircle fontSize="4rem" />}
                bg="transparent"
                color="brand.500"
                src={avatarSrc}
                name={user?.name}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
              />
              {isEditing && (
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
                  _hover={{ transform: "scale(1.1)" }}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Change profile picture"
                  zIndex={10}
                />
              )}
            </Circle>

            {/* Name & Role */}
            <VStack align={{ base: "center", md: "start" }} spacing={1} flex={1}>
              {isEditing ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fontSize="2xl"
                  fontWeight="900"
                  border="1px solid"
                  borderColor="brand.200"
                  borderRadius="xl"
                  bg="white"
                  _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px var(--chakra-colors-brand-300)" }}
                  maxW="300px"
                />
              ) : (
                <HStack>
                  <Heading size="xl" color="slate.800" fontWeight="900" letterSpacing="-0.02em">{formData.name}</Heading>
                  <Icon as={FaCheckCircle} color="brand.500" fontSize="xl" />
                </HStack>
              )}

              {isEditing ? (
                <Input
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  fontSize="md"
                  fontWeight="bold"
                  border="1px solid"
                  borderColor="brand.200"
                  borderRadius="xl"
                  bg="white"
                  maxW="300px"
                  mt={1}
                />
              ) : (
                <Text fontSize="md" fontWeight="bold" color="slate.500">{formData.role}</Text>
              )}

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
            <HStack spacing={3}>
              {isEditing ? (
                <>
                  <Button
                    leftIcon={<FaTimes />}
                    variant="outline"
                    borderRadius="xl"
                    fontWeight="bold"
                    color="slate.500"
                    borderColor="slate.200"
                    size="lg"
                    onClick={handleCancel}
                    isDisabled={uploadLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<FaSave />}
                    colorScheme="brand"
                    borderRadius="xl"
                    fontWeight="black"
                    size="lg"
                    boxShadow="lg"
                    isLoading={uploadLoading}
                    loadingText="Saving..."
                    onClick={handleSave}
                    _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  leftIcon={<FaEdit />}
                  variant="outline"
                  borderRadius="xl"
                  fontWeight="bold"
                  color="slate.500"
                  borderColor="slate.200"
                  _hover={{ bg: "white", color: "brand.500", borderColor: "brand.200" }}
                  size="lg"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </HStack>
          </Flex>
        </Box>

        {/* Profile Details Grid */}
        <Box p={{ base: 8, md: 12 }}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={12}>
            <VStack align="stretch" spacing={10} gridColumn={{ lg: "span 2" }}>
              <Box>
                <Heading size="xs" mb={6} color="slate.400" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">
                  Contact Information
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  <ContactItem icon={FaEnvelope} label="Email Address" name="email" value={formData.email} isEditing={isEditing} onChange={handleInputChange} />
                  <ContactItem icon={FaPhone} label="Phone Number" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleInputChange} />
                  <ContactItem icon={FaMapMarkerAlt} label="Working Area" name="workingArea" value={formData.workingArea} isEditing={isEditing} onChange={handleInputChange} />
                  <ContactItem icon={FaBriefcase} label="Joining Date" name="joiningDate" value={formData.joiningDate} isEditing={false} onChange={handleInputChange} />
                </SimpleGrid>
              </Box>

              <Divider borderColor="slate.50" />

              <Box>
                <Heading size="xs" mb={6} color="slate.400" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">
                  Expertise & Skills
                </Heading>
                <Flex flexWrap="wrap" gap={3}>
                  {["RO Repair", "Water Softener", "Fault Diagnostics", "Customer Support", "Inventory Management", "Wiring"].map((skill) => (
                    <Tag key={skill} size="lg" borderRadius="xl" variant="outline" colorScheme="slate" py={2} bg="slate.50" border="1px solid" borderColor="slate.100">
                      <TagLabel fontWeight="bold" fontSize="xs" color="slate.600">{skill}</TagLabel>
                    </Tag>
                  ))}
                </Flex>
              </Box>
            </VStack>

            {/* Stats */}
            <VStack align="stretch" spacing={6}>
              <Box bg="slate.50" p={8} borderRadius="3xl" border="1px solid" borderColor="slate.100" textAlign="center">
                <Heading size="xs" mb={8} color="slate.400" fontWeight="900" textTransform="uppercase" letterSpacing="0.1em">Performance Score</Heading>
                <Center position="relative" mb={{ base: 4, md: 6 }}>
                  <Circle size="32" border="10px solid" borderColor="brand.500" borderTopColor="slate.200" transform="rotate(-45deg)" />
                  <VStack position="absolute" spacing={0} transform="rotate(45deg)">
                    <Text fontSize="3xl" fontWeight="900" color="slate.800">4.8</Text>
                    <HStack spacing={1} color="brand.400">
                      {[...Array(5)].map((_, i) => <Icon key={i} as={FaStar} fontSize="xs" />)}
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
    </Box>
  );
};

const ContactItem = ({ icon, label, name, value, isEditing, onChange }) => (
  <HStack spacing={4} align="start">
    <Center w={12} h={12} bg="slate.50" borderRadius="2xl" color="brand.500" border="1px solid" borderColor="slate.100" flexShrink={0}>
      <Icon as={icon} fontSize="md" />
    </Center>
    <VStack align="start" spacing={0.5} flex={1}>
      <Text fontSize="9px" fontWeight="900" color="slate.400" textTransform="uppercase" letterSpacing="0.05em">{label}</Text>
      {isEditing ? (
        <Input
          name={name}
          value={value}
          onChange={onChange}
          size="sm"
          border="1px solid"
          borderColor="brand.200"
          borderRadius="lg"
          bg="white"
          fontWeight="bold"
          _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px var(--chakra-colors-brand-300)" }}
        />
      ) : (
        <Text fontSize="sm" fontWeight="bold" color="slate.700">{value}</Text>
      )}
    </VStack>
  </HStack>
);

export default Profile;
