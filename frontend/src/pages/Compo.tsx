import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { server } from "../components/server";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  profilePic: string;
}

interface Loan {
  _id: string;
  userId: User;
  fullName: string;
  amount: number;
  loanTenure: number;
  employmentStatus: string;
  reason: string;
  streetAddress: string;
  cityStateZip: string;
  isVerified: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  error: boolean;
  message: string;
  loan: Loan[];
}

const LoanManagementApp: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("creditseaid");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }
        console.log("checking for api hit");

        const { data } = await axios.get<ApiResponse>(`${server}/loan/getmyloan`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Loans data:", data);
        if (data.success && data.loan) {
          setLoans(data.loan);
        }
      } catch (error) {
        console.error("Error fetching loans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const getStatusColor = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "APPROVED": return "success";
      case "REJECTED": return "error";
      default: return "warning";
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ my: 3 }}>
        Applied Loans
      </Typography>
      
      {loading ? (
        <Typography>Loading loans...</Typography>
      ) : loans.length === 0 ? (
        <Typography>No loan applications found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Tenure</TableCell>
                <TableCell>Verification</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan._id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Avatar 
                      src={loan.userId.profilePic} 
                      alt={loan.userId.name || loan.fullName} 
                    />
                  </TableCell>
                  <TableCell>{loan.fullName}</TableCell>
                  <TableCell>${loan.amount}</TableCell>
                  <TableCell>{loan.loanTenure} months</TableCell>
                  <TableCell>
                    <Chip 
                      label={loan.isVerified ? "ACCEPTED" : "PENDING"} 
                      color={loan.isVerified ? "success" : "warning"} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={loan.status} 
                      color={getStatusColor(loan.status)} 
                      size="small" 
                    />
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

export default LoanManagementApp;
