import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            textAlign="center"
        >
            <ErrorOutlineIcon sx={{ fontSize: 100, color: "#f44336", mb: 2 }} />
            <Typography variant="h2" color="primary" gutterBottom>
                404
            </Typography>
            <Typography variant="h5" color="textSecondary" gutterBottom>
                Oops! The page you're looking for doesn't exist.
            </Typography>
            <Box display="flex" gap={2} mt={3}>
                <Button variant="contained" color="primary" onClick={() => navigate("/")}>Home</Button>
                <Button variant="contained" color="secondary" onClick={() => navigate("/admin")}>Admin</Button>
                <Button variant="contained" color="success" onClick={() => navigate("/verifier")}>Verifier</Button>
            </Box>
        </Box>
    );
}
