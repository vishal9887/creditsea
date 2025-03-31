import React, { useState,useEffect } from "react";
import {
  Button,
  TextField,
  Dialog, 
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../components/server";
import Othercompo from "./Compo";
import { getUserRole } from "./Protectroute"; 
import { useNavigate } from "react-router-dom";
interface LoanForm {
  fullName: string;
  amount: string;
  loanTenure: string;
  employmentStatus: string;
  reason: string;
  streetAddress: string;
  cityStateZip: string;
}

const LoanApplication: React.FC = async() => {
  const [open, setOpen] = useState<boolean>(false);
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [formData, setFormData] = useState<LoanForm>({
    fullName: "",
    amount: "",
    loanTenure: "",
    employmentStatus: "",
    reason: "",
    streetAddress: "",
    cityStateZip: "",
  });
  const navigate = useNavigate();
  const allChecked = checked1 && checked2;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    const checkUserRole = async () => {
      const role = await getUserRole();
      console.log(role);
      if (role !== "USER") {
        alert("You are not allowed to access this page");
        navigate("/login");
      }
    };

    checkUserRole();
  }, []);

  const handleSubmit = async () => {
    try {
      const creditseaid = localStorage.getItem("creditseaid");
      if (!creditseaid) {
        toast.error("Authentication token missing");
        return;
      }
      await axios.post(`${server}/loan/createloan`, formData, {
        headers: {
          Authorization: `Bearer ${creditseaid}`,
        },
      });
      toast.success("Loan application submitted successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Apply for Loan
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Apply for a Loan</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              type="number"
              label="Amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              type="number"
              label="Loan Tenure (months)"
              name="loanTenure"
              value={formData.loanTenure}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Employment Status"
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Street Address"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="City, State, ZIP"
              name="cityStateZip"
              value={formData.cityStateZip}
              onChange={handleChange}
            />
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked1}
                onChange={(e) => setChecked1(e.target.checked)}
              />
            }
            label="I have read the important information and accept that by completing the application I will be bound by the terms"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checked2}
                onChange={(e) => setChecked2(e.target.checked)}
              />
            }
            label="Any personal and credit information obtained may be disclosed from time to time to other lenders, credit bureaus, or other credit reporting agencies"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!allChecked}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Othercompo/>
    </div>
  );
};

export default LoanApplication;
