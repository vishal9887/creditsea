import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
} from "@mui/material";
import axios from "axios";
import { server } from "../components/server";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "VERIFIER" | "ADMIN";
  profilePic: string;
}

interface ApiResponse {
  success: boolean;
  error: boolean;
  message: string;
  data: User[];
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("creditseaid");
        if (!token) {
          alert("No token found! Please log in.");
          navigate("/login");
          return;
        }

        const { data } = await axios.get<ApiResponse>(`${server}/loan/getallusers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (data.success) {
          setUsers(data.data);
        } else {
          alert("Failed to fetch users.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const updateUserRole = async (userId: string, newRole: "USER" | "VERIFIER" | "ADMIN") => {
    try {
      const token = localStorage.getItem("creditseaid");
      if (!token) {
        alert("No token found! Please log in.");
        return;
      }

      const { data } = await axios.post(
        `${server}/loan/accesstousers`,
        { userId, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
        alert("User role updated successfully!");
      } else {
        alert("Failed to update role.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ my: 3, textAlign: "center" }}>
        Admin User Management
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : users.length === 0 ? (
        <Typography align="center">No users found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell><strong>Profile</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Update Role</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Avatar src={user.profilePic} alt={user.name} />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={user.role}
                          onChange={(e) =>
                            updateUserRole(user._id, e.target.value as "USER" | "VERIFIER" | "ADMIN")
                          }
                        >
                          <MenuItem value="USER">USER</MenuItem>
                          <MenuItem value="VERIFIER">VERIFIER</MenuItem>
                          <MenuItem value="ADMIN">ADMIN</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => updateUserRole(user._id, user.role)}
                        sx={{ ml: 2 }}
                      >
                        Update
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminUserManagement;
