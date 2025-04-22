// frontend/src/components/ImageDebugger.jsx
import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";

function ImageDebugger({ imageUrl }) {
  const [expanded, setExpanded] = useState(false);
  const [testUrl, setTestUrl] = useState(imageUrl || "");
  const [testResults, setTestResults] = useState(null);

  const testImage = async () => {
    try {
      // Create a promise that resolves when the image loads or rejects when it fails
      const testImageLoad = () => {
        return new Promise((resolve, reject) => {
          const img = new Image();

          img.onload = () => {
            resolve({
              success: true,
              dimensions: `${img.width}x${img.height}`,
              message: "Image loaded successfully",
            });
          };

          img.onerror = () => {
            reject({
              success: false,
              message: "Failed to load image",
            });
          };

          img.src = testUrl;
        });
      };

      // Try to load the image
      const result = await testImageLoad();
      setTestResults(result);
    } catch (error) {
      setTestResults({
        success: false,
        message: error.message || "Failed to load image",
      });
    }
  };

  const tryDirectFetch = async () => {
    try {
      const response = await fetch(testUrl);

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers]),
        type: response.type,
        url: response.url,
        ok: response.ok,
      };

      setTestResults({
        success: response.ok,
        message: response.ok ? "Fetch successful" : "Fetch failed",
        fetchResults: result,
      });
    } catch (error) {
      setTestResults({
        success: false,
        message: `Fetch error: ${error.message}`,
      });
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, border: "1px dashed #ccc" }}>
      <Button
        startIcon={<BugReportIcon />}
        onClick={() => setExpanded(!expanded)}
        variant="text"
        color="info"
        fullWidth
      >
        {expanded ? "Hide" : "Show"} Image Debugger
      </Button>

      {expanded && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Debug Image Loading Issues
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="Image URL to test"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
            />
            <Button variant="outlined" onClick={testImage} size="small">
              Test Load
            </Button>
            <Button variant="outlined" onClick={tryDirectFetch} size="small">
              Try Fetch
            </Button>
          </Box>

          {testResults && (
            <>
              <Alert severity={testResults.success ? "success" : "error"}>
                {testResults.message}
                {testResults.dimensions && ` (${testResults.dimensions})`}
              </Alert>

              {testResults.fetchResults && (
                <Box sx={{ mt: 2, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="subtitle2">Fetch Results:</Typography>
                  <pre style={{ overflow: "auto", fontSize: "0.8rem" }}>
                    {JSON.stringify(testResults.fetchResults, null, 2)}
                  </pre>
                </Box>
              )}
            </>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Common image loading issues:
            </Typography>
            <ul>
              <li>Incorrect image path (check URL)</li>
              <li>CORS issues (server not allowing access)</li>
              <li>Server not serving static files correctly</li>
              <li>Image file doesn't exist on server</li>
              <li>Network issues or server down</li>
            </ul>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default ImageDebugger;
