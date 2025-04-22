// frontend/src/components/ImageGallery.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ImageUpload from "./ImageUpload";

// Get backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Helper function to ensure image URLs point to the backend
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${BACKEND_URL}${imageUrl}`;
};

function ImageGallery({ eventSlug, images, onDeleteImage, onImageUploaded }) {
  const [viewImage, setViewImage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleOpenImage = (image) => {
    setViewImage(image);
  };

  const handleCloseImage = () => {
    setViewImage(null);
  };

  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setImageToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete || !imageToDelete._id) return;

    setDeleting(true);
    setError("");

    try {
      await onDeleteImage(imageToDelete._id);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete image");
    } finally {
      setDeleting(false);
    }
  };

  // Debug image loading
  useEffect(() => {
    if (images && images.length > 0) {
      const testUrl = images[0].imageUrl;
      const fullUrl = getFullImageUrl(testUrl);
      console.log("Testing image URL:", fullUrl);

      // Try fetching the image directly to see if it works
      fetch(fullUrl)
        .then((res) => {
          console.log("Image fetch response:", res.status, res.statusText);
        })
        .catch((err) => {
          console.error("Image fetch error:", err);
        });
    }
  }, [images]);

  return (
    <Box>
      {/* Image Upload Component */}
      <ImageUpload eventSlug={eventSlug} onImageUploaded={onImageUploaded} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Image Gallery Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {images && images.length > 0 ? (
          images.map((image, index) => (
            <Box key={image._id || index}>
              <Card sx={{ height: "100%" }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={getFullImageUrl(image.imageUrl)}
                  alt={image.name}
                  sx={{ objectFit: "cover", cursor: "pointer" }}
                  onClick={() => handleOpenImage(image)}
                  onError={(e) => {
                    console.error("Image failed to load:", image.imageUrl);
                    // Optional fallback image
                    // e.target.src = "/fallback-image.png";
                  }}
                />
                <CardContent sx={{ py: 1 }}>
                  <Typography variant="body2" noWrap>
                    {image.name}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenImage(image)}
                    aria-label="View Image"
                  >
                    <ZoomInIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(image)}
                    aria-label="Delete Image"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Box>
          ))
        ) : (
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontStyle: "italic", textAlign: "center", p: 2 }}
            >
              No images in gallery. Upload your first image above.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewImage} onClose={handleCloseImage} maxWidth="md">
        {viewImage && (
          <>
            <DialogTitle>{viewImage.name}</DialogTitle>
            <DialogContent>
              <Box
                sx={{ position: "relative", width: "100%", maxHeight: "70vh" }}
              >
                <img
                  src={getFullImageUrl(viewImage.imageUrl)}
                  alt={viewImage.name}
                  style={{
                    width: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                  }}
                />
                {/* Debug information */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  Image URL: {viewImage.imageUrl}
                  <br />
                  Full URL: {getFullImageUrl(viewImage.imageUrl)}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseImage}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Image</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the image "{imageToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={20} /> : <DeleteIcon />
            }
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ImageGallery;
