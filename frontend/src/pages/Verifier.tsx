import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { server } from "../components/server";
import axios from "axios";
import { getUserRole } from "./Protectroute";
import { useNavigate } from "react-router-dom";

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
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      const role = await getUserRole();
      console.log(role);
      if (role !== "VERIFIER") {
        alert("You are not allowed to access this page");
        navigate("/login");
      }
    }; 

    checkUserRole();
  }, []);
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

        const { data } = await axios.get<ApiResponse>(
          `${server}/loan/getloan`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

  const handleApproval = async (id: string, approve: boolean) => {
    try {
      const token = localStorage.getItem("creditseaid");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      await axios.post(
        `${server}/loan/verifyloan`,
        { id, approve },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan._id === id
            ? {
                ...loan,
                isVerified: approve,
                status: approve ? "APPROVED" : "PENDING",
              }
            : loan
        )
      );
      setSelectedLoan(null);
    } catch (error) {
      console.error("Error updating loan status:", error);
    }
  };

  const getStatusChip = (loan: Loan) => {
    // Use isVerified to determine status display
    if (loan.isVerified) {
      return <Chip label="Verified" color="success" size="small" />;
    } else {
      return <Chip label="PENDING" color="warning" size="small" />;
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
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow
                  key={loan._id}
                  hover
                  onClick={() => setSelectedLoan(loan)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Avatar
                      src={loan.userId.profilePic}
                      alt={loan.userId.name || loan.fullName}
                    />
                  </TableCell>
                  <TableCell>{loan.fullName}</TableCell>
                  <TableCell>${loan.amount}</TableCell>
                  <TableCell>{loan.loanTenure} months</TableCell>
                  <TableCell>{getStatusChip(loan)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedLoan && (
        <Dialog
          open={Boolean(selectedLoan)}
          onClose={() => setSelectedLoan(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={selectedLoan.userId.profilePic}
                alt={selectedLoan.userId.name}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="h6">{selectedLoan.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  User: {selectedLoan.userId.name}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box my={2}>{getStatusChip(selectedLoan)}</Box>
            <Typography variant="h6" gutterBottom>
              Loan Details
            </Typography>
            <Typography>
              <strong>Amount:</strong> ${selectedLoan.amount}
            </Typography>
            <Typography>
              <strong>Tenure:</strong> {selectedLoan.loanTenure} months
            </Typography>
            <Typography>
              <strong>Employment Status:</strong>{" "}
              {selectedLoan.employmentStatus}
            </Typography>
            <Typography>
              <strong>Reason:</strong> {selectedLoan.reason}
            </Typography>
            <Typography gutterBottom>
              <strong>Address:</strong> {selectedLoan.streetAddress},{" "}
              {selectedLoan.cityStateZip}
            </Typography>

            {selectedLoan.remarks && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Remarks
                </Typography>
                <Typography>{selectedLoan.remarks}</Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            {!selectedLoan.isVerified && (
              <>
                <Button
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleApproval(selectedLoan._id, true)}
                  color="success"
                  variant="contained"
                >
                  Validate
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={() => handleApproval(selectedLoan._id, false)}
                  color="error"
                  variant="contained"
                >
                  Reject
                </Button>
              </>
            )}
            <Button onClick={() => setSelectedLoan(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default LoanManagementApp;
