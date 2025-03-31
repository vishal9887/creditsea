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
  TextField,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { server } from "../components/server";
import axios from "axios";
import { getUserRole } from "./Protectroute";
import { useNavigate } from "react-router-dom";
import Adminaccess from "./Adminaccess";
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
  const [remarks, setRemarks] = useState(""); // State for remarks
  const [showRemarksInput, setShowRemarksInput] = useState(false); // To toggle input field
  const navigate = useNavigate();
 useEffect(() => {
    const checkUserRole = async () => {
      const role = await getUserRole();
      console.log(role);
      if (role !== "ADMIN") {
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

        const { data } = await axios.get<ApiResponse>(
          `${server}/loan/getloan`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
        `${server}/loan/approveloan`,
        { id, approve, remarks: approve ? "" : remarks }, // Send remarks only if rejected
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
                remarks: approve ? "" : remarks,
              }
            : loan
        )
      );

      setSelectedLoan(null);
      setRemarks(""); // Reset remarks after submission
      setShowRemarksInput(false); // Hide input after action
    } catch (error) {
      console.error("Error updating loan status:", error);
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Tenure</TableCell>
                <TableCell>Verification Status</TableCell>
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
                  <TableCell>
                    <Chip
                      label={loan.isVerified ? "VERIFIED" : "NOT VERIFIED"}
                      color={loan.isVerified ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={loan.status}
                      color={
                        loan.status === "APPROVED"
                          ? "success"
                          : loan.status === "REJECTED"
                          ? "error"
                          : "warning" // Defaults to PENDING
                      }
                      size="small"
                    />
                  </TableCell>
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
            <Box my={2}>
              <Chip
                label={selectedLoan.isVerified ? "APPROVED" : "PENDING"}
                color={selectedLoan.isVerified ? "success" : "warning"}
                size="small"
              />
            </Box>
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

            {showRemarksInput && (
              <TextField
                label="Enter remarks"
                fullWidth
                multiline
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                sx={{ mt: 2 }}
              />
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
                  Approve
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={() => setShowRemarksInput(true)}
                  color="error"
                  variant="contained"
                >
                  Reject
                </Button>
                {showRemarksInput && (
                  <Button
                    onClick={() => handleApproval(selectedLoan._id, false)}
                    color="error"
                    variant="contained"
                    disabled={!remarks.trim()}
                  >
                    Submit Rejection
                  </Button>
                )}
              </>
            )}
            <Button onClick={() => setSelectedLoan(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
      <Adminaccess/>
    </Container>
  );
};

export default LoanManagementApp;
